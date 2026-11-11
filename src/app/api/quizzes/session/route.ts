import { NextRequest, NextResponse } from 'next/server';
import {
  getServerSessionUser,
  isTeacherOrAdmin,
  canTeacherAccessClass,
  getQuizSettings,
  getExamSession,
  listExamSessions,
  startOrResumeExamSession,
  autosaveExamSession,
  recordExamViolation,
  allowStudentResumeExamSession,
  getEvaluationAttemptById,
  sanitizeAttemptForStudent,
} from '@/lib/quiz-evaluation-store';

export async function GET(req: NextRequest) {
  try {
    const sessionUser = getServerSessionUser(req);
    const { searchParams } = new URL(req.url);
    const quizId = searchParams.get('quizId');
    const requestedStudentId = searchParams.get('studentId');

    if (!quizId) {
      return NextResponse.json({ error: 'Parameter quizId wajib diisi.' }, { status: 400 });
    }

    const settings = getQuizSettings(quizId);
    const staffAccess = isTeacherOrAdmin(sessionUser);

    if (staffAccess) {
      if (requestedStudentId) {
        const session = await getExamSession(quizId, requestedStudentId);
        if (session && !canTeacherAccessClass(sessionUser, session.className)) {
          return NextResponse.json(
            { error: 'Akses ditolak: Kelas siswa berada di luar kewenangan Anda.' },
            { status: 403 }
          );
        }
        return NextResponse.json({
          success: true,
          serverNow: new Date().toISOString(),
          controlledExamConfig: settings.controlledExamConfig,
          session,
        });
      }

      const allSessions = (await listExamSessions({ quizId })).filter((s) =>
        canTeacherAccessClass(sessionUser, s.className)
      );
      return NextResponse.json({
        success: true,
        serverNow: new Date().toISOString(),
        controlledExamConfig: settings.controlledExamConfig,
        sessions: allSessions,
      });
    }

    // Student access: can only access their own session
    const effectiveStudentId = sessionUser?.id || requestedStudentId;
    if (!effectiveStudentId) {
      return NextResponse.json({ error: 'Siswa belum terautentikasi.' }, { status: 401 });
    }

    if (
      sessionUser &&
      sessionUser.role === 'student' &&
      requestedStudentId &&
      requestedStudentId !== sessionUser.id
    ) {
      return NextResponse.json(
        { error: 'Akses ditolak: Anda hanya dapat mengakses sesi ujian milik Anda sendiri.' },
        { status: 403 }
      );
    }

    const session = await getExamSession(quizId, effectiveStudentId);
    let lockedAttempt = null;
    if (
      session &&
      (session.status === 'auto_submitted' || session.status === 'submitted') &&
      session.attemptId
    ) {
      const rawAtt = await getEvaluationAttemptById(session.attemptId);
      if (rawAtt) {
        lockedAttempt = sanitizeAttemptForStudent(rawAtt, settings);
      }
    }

    return NextResponse.json({
      success: true,
      serverNow: new Date().toISOString(),
      controlledExamConfig: settings.controlledExamConfig,
      session,
      lockedAttempt,
    });
  } catch (err: any) {
    return NextResponse.json(
      { error: err?.message || 'Gagal memuat sesi ujian.' },
      { status: 500 }
    );
  }
}

export async function POST(req: NextRequest) {
  try {
    const sessionUser = getServerSessionUser(req);
    const body = await req.json();
    const { action, quizId } = body;

    if (!quizId || !action) {
      return NextResponse.json(
        { error: 'Parameter action dan quizId wajib diisi.' },
        { status: 400 }
      );
    }

    const settings = getQuizSettings(quizId);
    const staffAccess = isTeacherOrAdmin(sessionUser);

    // 1. Teacher action: allow student to resume exam after technical issues
    if (action === 'teacher_resume') {
      if (!staffAccess) {
        return NextResponse.json(
          { error: 'Akses ditolak: Hanya guru atau admin yang dapat mengizinkan siswa melanjutkan ujian.' },
          { status: 403 }
        );
      }

      const targetStudentId = body.studentId;
      if (!targetStudentId) {
        return NextResponse.json({ error: 'ID siswa wajib diisi.' }, { status: 400 });
      }

      const existingSession = await getExamSession(quizId, targetStudentId);
      if (existingSession && !canTeacherAccessClass(sessionUser, existingSession.className)) {
        return NextResponse.json(
          { error: 'Akses ditolak: Kelas siswa berada di luar kewenangan Anda.' },
          { status: 403 }
        );
      }

      const res = await allowStudentResumeExamSession({
        quizId,
        studentId: targetStudentId,
        teacherName: sessionUser?.fullName || 'Guru ATPH',
        note: body.note,
        extraMinutes: body.extraMinutes ? Number(body.extraMinutes) : 20,
      });

      if (!res.unlocked || !res.session) {
        return NextResponse.json(
          { error: 'Sesi atau pengerjaan siswa tidak ditemukan.' },
          { status: 404 }
        );
      }

      return NextResponse.json({
        success: true,
        unlocked: true,
        session: res.session,
        message: 'Siswa telah diizinkan untuk melanjutkan sesi ujian.',
      });
    }

    // Student actions: 'start', 'autosave', 'violation'
    const bodyStudentId = body.studentId;
    const studentId = sessionUser?.role === 'student' ? sessionUser.id : bodyStudentId || sessionUser?.id;
    const studentName = body.studentName || sessionUser?.fullName || 'Siswa ATPH';
    const studentNisn = body.studentNisn || sessionUser?.nisn || '-';
    const className = body.className || sessionUser?.className || 'XI AT 1';

    if (!studentId) {
      return NextResponse.json({ error: 'Siswa belum terautentikasi.' }, { status: 401 });
    }

    if (
      sessionUser &&
      sessionUser.role === 'student' &&
      bodyStudentId &&
      bodyStudentId !== sessionUser.id
    ) {
      return NextResponse.json(
        { error: 'Akses ditolak: Anda hanya dapat mengakses sesi ujian milik Anda sendiri.' },
        { status: 403 }
      );
    }

    if (action === 'start') {
      const result = await startOrResumeExamSession({
        quizId,
        studentId,
        studentName,
        studentNisn,
        className,
        fullscreenSupported:
          typeof body.fullscreenSupported === 'boolean' ? body.fullscreenSupported : true,
        initialDraftAnswers: body.draftAnswers,
      });

      let lockedAttempt = null;
      if (result.isLocked && result.session.attemptId) {
        const rawAtt = await getEvaluationAttemptById(result.session.attemptId);
        if (rawAtt) {
          lockedAttempt = staffAccess ? rawAtt : sanitizeAttemptForStudent(rawAtt, settings);
        }
      }

      return NextResponse.json({
        success: true,
        serverNow: new Date().toISOString(),
        controlledExamConfig: settings.controlledExamConfig,
        session: result.session,
        resumed: result.resumed,
        isLocked: result.isLocked,
        attempt: lockedAttempt,
      });
    }

    if (action === 'autosave') {
      const result = await autosaveExamSession({
        quizId,
        studentId,
        studentName,
        className,
        draftAnswers: body.draftAnswers || {},
      });

      if (!result.saved) {
        return NextResponse.json(
          {
            success: false,
            error: result.error || 'Sesi ujian telah dikunci.',
            session: result.session,
          },
          { status: 409 }
        );
      }

      return NextResponse.json({
        success: true,
        saved: true,
        serverNow: new Date().toISOString(),
        lastSavedAt: result.session.lastSavedAt,
        session: result.session,
      });
    }

    if (action === 'violation') {
      // Ignore blur-only signals unless explicitly marked as extended_blur
      const rawType = body.event?.type;
      if (rawType === 'blur_only' || rawType === 'dialog_blur') {
        const currentSession = await getExamSession(quizId, studentId);
        return NextResponse.json({
          success: true,
          recorded: false,
          ignoredAuxiliaryBlur: true,
          session: currentSession,
        });
      }

      const validType =
        rawType === 'fullscreen_exit' || rawType === 'extended_blur' ? rawType : 'tab_hidden';

      const result = await recordExamViolation({
        quizId,
        studentId,
        event: {
          id: body.event?.id,
          type: validType,
          label: body.event?.label,
          occurredAt: body.event?.occurredAt,
          returnedAt: body.event?.returnedAt,
          durationSeconds: body.event?.durationSeconds,
          mergedSignals: body.event?.mergedSignals,
        },
        draftAnswers: body.draftAnswers,
      });

      const clientAttempt =
        result.attempt && !staffAccess
          ? sanitizeAttemptForStudent(result.attempt, settings)
          : result.attempt;

      return NextResponse.json({
        success: true,
        serverNow: new Date().toISOString(),
        recorded: result.recorded,
        coalesced: result.coalesced,
        autoSubmitted: result.autoSubmitted,
        session: result.session,
        attempt: clientAttempt,
      });
    }

    return NextResponse.json({ error: `Aksi '${action}' tidak dikenali.` }, { status: 400 });
  } catch (err: any) {
    return NextResponse.json(
      { error: err?.message || 'Gagal memproses sesi ujian.' },
      { status: 500 }
    );
  }
}

