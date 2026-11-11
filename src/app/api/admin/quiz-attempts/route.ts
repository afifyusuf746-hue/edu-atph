import { NextRequest, NextResponse } from 'next/server';
import {
  getServerSessionUser,
  isTeacherOrAdmin,
  canTeacherAccessClass,
  listEvaluationAttempts,
  listExamSessions,
  getEvaluationAttemptById,
  getQuizSettings,
  sanitizeAttemptForStudent,
} from '@/lib/quiz-evaluation-store';

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const attemptId = searchParams.get('attemptId');
    const quizId = searchParams.get('quizId');
    const studentId = searchParams.get('studentId');

    const sessionUser = getServerSessionUser(req);
    const staffAccess = isTeacherOrAdmin(sessionUser);

    // Pemeriksaan Hak Akses & Kepemilikan Data di Server:
    // Siswa HANYA diizinkan mengakses jawaban miliknya sendiri.
    if (!staffAccess) {
      if (!sessionUser) {
        return NextResponse.json(
          {
            success: false,
            error: 'Tidak terautentikasi. Silakan login terlebih dahulu.',
            data: [],
          },
          { status: 401 }
        );
      }

      if (studentId && studentId !== sessionUser.id) {
        return NextResponse.json(
          {
            success: false,
            error: 'Akses ditolak: Siswa tidak diizinkan membaca jawaban atau nilai siswa lain.',
            data: [],
          },
          { status: 403 }
        );
      }

      if (attemptId) {
        const single = await getEvaluationAttemptById(attemptId);
        if (!single) {
          return NextResponse.json({ success: false, error: 'Data tidak ditemukan' }, { status: 404 });
        }
        if (single.studentId !== sessionUser.id) {
          return NextResponse.json(
            {
              success: false,
              error: 'Akses ditolak: Anda hanya dapat melihat hasil evaluasi milik sendiri.',
            },
            { status: 403 }
          );
        }
        const settings = getQuizSettings(single.quizId);
        return NextResponse.json({
          success: true,
          data: [sanitizeAttemptForStudent(single, settings)],
        });
      }

      const ownAttempts = await listEvaluationAttempts({
        quizId,
        studentId: sessionUser.id,
      });

      const sanitized = ownAttempts.map((att) => {
        const settings = getQuizSettings(att.quizId);
        return sanitizeAttemptForStudent(att, settings);
      });

      return NextResponse.json({
        success: true,
        count: sanitized.length,
        data: sanitized,
      });
    }

    // Akses Guru / Admin: dapat melihat seluruh jawaban, rincian AI, kunci, dan nilai pada kelas kewenangannya
    if (attemptId) {
      const single = await getEvaluationAttemptById(attemptId);
      if (!single) {
        return NextResponse.json({ success: false, error: 'Data tidak ditemukan' }, { status: 404 });
      }
      if (!canTeacherAccessClass(sessionUser, single.className)) {
        return NextResponse.json(
          { success: false, error: 'Akses ditolak: Kelas siswa berada di luar kewenangan Anda.' },
          { status: 403 }
        );
      }
      return NextResponse.json({
        success: true,
        count: 1,
        data: [single],
      });
    }

    const rawAttempts = await listEvaluationAttempts({ quizId, studentId });
    const attempts = rawAttempts.filter((att) => canTeacherAccessClass(sessionUser, att.className));
    const rawSessions = await listExamSessions({ quizId, studentId });
    const sessions = rawSessions.filter((s) => canTeacherAccessClass(sessionUser, s.className));

    return NextResponse.json({
      success: true,
      count: attempts.length,
      data: attempts,
      examSessions: sessions,
    });
  } catch (err: any) {
    return NextResponse.json(
      { success: false, error: err.message || 'Gagal memuat data percobaan kuis', data: [] },
      { status: 500 }
    );
  }
}
