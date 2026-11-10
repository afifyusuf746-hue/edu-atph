import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { INITIAL_QUIZZES, INITIAL_QUIZ_QUESTIONS } from '@/lib/mock-data';
import {
  getServerSessionUser,
  isTeacherOrAdmin,
  getQuizSettings,
  calculateWeightedEvaluation,
  saveEvaluationAttempt,
  sanitizeAttemptForStudent,
  getExamSession,
  getEvaluationAttemptById,
  completeExamSessionOnSubmit,
} from '@/lib/quiz-evaluation-store';
import { QuizAnswer } from '@/types';

const SUPABASE_URL =
  process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://ngreirksuoraurufzftn.supabase.co';
const SUPABASE_KEY =
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || 'sb_publishable_Tj16Oq3f9BqbVj35Le-7bQ_avuh1PjD';

function resolveRombel(className?: string | null): { classId: string; className: string } {
  const norm = (className || '').trim().toUpperCase();

  if (norm.includes('X AT 1') || norm === 'X AT 1' || norm.includes('X-AT-1')) {
    return { classId: 'cls-x-at-1', className: 'X AT 1' };
  }
  if (norm.includes('X AT 2') || norm === 'X AT 2' || norm.includes('X-AT-2')) {
    return { classId: 'cls-x-at-2', className: 'X AT 2' };
  }
  if (norm.includes('X AT 3') || norm === 'X AT 3' || norm.includes('X-AT-3')) {
    return { classId: 'cls-x-at-3', className: 'X AT 3' };
  }

  if (norm.includes('XI AT 1') || norm === 'XI AT 1' || norm.includes('XI-AT-1')) {
    return { classId: 'cls-xi-at-1', className: 'XI AT 1' };
  }
  if (norm.includes('XI AT 2') || norm === 'XI AT 2' || norm.includes('XI-AT-2')) {
    return { classId: 'cls-xi-at-2', className: 'XI AT 2' };
  }
  if (norm.includes('XI AT 3') || norm === 'XI AT 3' || norm.includes('XI-AT-3')) {
    return { classId: 'cls-xi-at-3', className: 'XI AT 3' };
  }

  if (norm.includes('XII AT 1') || norm === 'XII AT 1' || norm.includes('XII-AT-1')) {
    return { classId: 'cls-xii-at-1', className: 'XII AT 1' };
  }
  if (norm.includes('XII AT 2') || norm === 'XII AT 2' || norm.includes('XII-AT-2')) {
    return { classId: 'cls-xii-at-2', className: 'XII AT 2' };
  }
  if (norm.includes('XII AT 3') || norm === 'XII AT 3' || norm.includes('XII-AT-3')) {
    return { classId: 'cls-xii-at-3', className: 'XII AT 3' };
  }

  if (norm.includes('XII')) {
    return { classId: 'cls-xii-at-1', className: 'XII AT 1' };
  }
  if (norm.includes('XI')) {
    return { classId: 'cls-xi-at-1', className: 'XI AT 1' };
  }

  return { classId: 'cls-x-at-1', className: 'X AT 1' };
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const sessionUser = getServerSessionUser(req);

    const {
      quizId,
      studentId: bodyStudentId,
      studentName: bodyStudentName,
      studentNisn,
      studentEmail,
      className,
      answers, // array of { questionId, userAnswer }
      startedAt,
    } = body;

    const studentId = bodyStudentId || sessionUser?.id;
    const studentName = bodyStudentName || sessionUser?.fullName;

    // 1. Validasi input & kepemilikan sesi siswa
    if (!quizId) {
      return NextResponse.json({ error: 'ID Kuis tidak valid' }, { status: 400 });
    }
    if (!studentId || !studentName) {
      return NextResponse.json({ error: 'Siswa belum terautentikasi' }, { status: 401 });
    }
    if (
      sessionUser &&
      sessionUser.role === 'student' &&
      bodyStudentId &&
      bodyStudentId !== sessionUser.id
    ) {
      return NextResponse.json(
        { error: 'Akses ditolak: Tidak dapat mengirimkan jawaban atas nama siswa lain.' },
        { status: 403 }
      );
    }

    // 2. Temukan quiz & pertanyaan resmi
    const quiz = INITIAL_QUIZZES.find((q) => q.id === quizId);
    const quizTitle = quiz?.title || 'Kuis Evaluasi ATPH';
    const passingScore = quiz?.passingScore || 75;
    const settings = getQuizSettings(quizId);

    const questions = INITIAL_QUIZ_QUESTIONS.filter((q) => q.quizId === quizId).sort(
      (a, b) => a.orderIndex - b.orderIndex
    );

    // 2b. Periksa sesi ujian aktif / terkunci (Mode Ujian Terkontrol)
    const activeSession = getExamSession(quizId, studentId);
    if (
      activeSession &&
      (activeSession.status === 'submitted' || activeSession.status === 'auto_submitted') &&
      activeSession.attemptId
    ) {
      const existingLockedAttempt = await getEvaluationAttemptById(activeSession.attemptId);
      if (existingLockedAttempt) {
        const staffAccess = isTeacherOrAdmin(sessionUser);
        const clientAttempt = staffAccess
          ? existingLockedAttempt
          : sanitizeAttemptForStudent(existingLockedAttempt, settings);
        return NextResponse.json({
          success: true,
          alreadySubmitted: true,
          synced: true,
          attempt: clientAttempt,
          message: activeSession.autoSubmitted
            ? 'Sesi ujian telah dikumpulkan dan dikunci otomatis oleh sistem.'
            : 'Jawaban ujian sudah pernah dikumpulkan sebelumnya.',
        });
      }
    }

    // 3. Evaluasi jawaban secara aman di sisi server (gabungkan draf server agar jawaban yang sudah diterima server tidak hilang)
    let rawScore = 0;
    let rawMaxScore = 0;
    let correctCount = 0;
    let wrongCount = 0;
    let hasSubjectiveQuestions = false;

    const studentAnswersMap = new Map<string, string>();
    if (activeSession?.draftAnswers) {
      Object.entries(activeSession.draftAnswers).forEach(([qId, draftVal]) => {
        if (typeof draftVal === 'string' && draftVal.trim().length > 0) {
          studentAnswersMap.set(qId, draftVal.trim());
        }
      });
    }
    if (Array.isArray(answers)) {
      answers.forEach((a: any) => {
        const val = String(a.userAnswer ?? '').trim();
        if (val.length > 0 || !studentAnswersMap.has(a.questionId)) {
          studentAnswersMap.set(a.questionId, val);
        }
      });
    }

    const evaluatedAnswers: QuizAnswer[] = questions.map((q) => {
      const userAnswer = studentAnswersMap.get(q.id) || '';
      const qType = q.questionType || 'multiple_choice';

      if (qType === 'essay' || qType === 'case_study') {
        hasSubjectiveQuestions = true;
        return {
          questionId: q.id,
          questionType: qType,
          questionText: q.questionText,
          userAnswer,
          correctAnswer: q.correctAnswer || '',
          explanation: q.explanation || '',
          aiScore: null,
          aiRubricBreakdown: null,
          aiReasoning: null,
          aiImprovement: null,
          aiGradedAt: null,
          teacherScore: null, // "Belum dinilai", bukan 0
          teacherNote: null,
          gradedBy: null,
          gradedAt: null,
        };
      }

      // Pilihan Ganda / Benar-Salah: Benar = 1 poin, Salah = 0 poin
      const points = q.points || 1;
      rawMaxScore += points;

      const isCorrect = Boolean(
        userAnswer &&
          q.correctAnswer &&
          userAnswer.trim().toLowerCase() === q.correctAnswer.trim().toLowerCase()
      );

      if (isCorrect) {
        rawScore += points;
        correctCount++;
      } else {
        wrongCount++;
      }

      return {
        questionId: q.id,
        questionType: qType,
        questionText: q.questionText,
        userAnswer,
        correctAnswer: q.correctAnswer,
        isCorrect,
        pointsAwarded: isCorrect ? 1 : 0,
        explanation: q.explanation || '',
      };
    });

    const calc = calculateWeightedEvaluation(
      evaluatedAnswers,
      settings.weightsConfig,
      passingScore
    );

    const attemptId =
      activeSession?.attemptId ||
      `att-${Date.now()}-${Math.random().toString(36).substring(2, 8)}`;
    const nowIso = new Date().toISOString();
    const startIso =
      activeSession?.startedAt ||
      startedAt ||
      new Date(Date.now() - 15 * 60000).toISOString();
    const durationSeconds = Math.max(
      1,
      Math.round((new Date(nowIso).getTime() - new Date(startIso).getTime()) / 1000)
    );

    const rombel = resolveRombel(className || activeSession?.className || quiz?.targetClassName);
    const resolvedClassId = rombel.classId;
    const resolvedClassName = rombel.className;

    // Jika memiliki soal Uraian/Studi Kasus, maka status awal adalah 'incomplete' ("Penilaian belum lengkap")
    // dan isPublished = false (draf sampai diterbitkan guru).
    const isPublished = !hasSubjectiveQuestions;
    const effectivePercentage = hasSubjectiveQuestions
      ? calc.mcqScore
      : rawMaxScore > 0
      ? Math.round((rawScore / rawMaxScore) * 100)
      : 0;
    const isPassed = !hasSubjectiveQuestions && effectivePercentage >= passingScore;

    const sessionViolationCount = activeSession?.violationCount ?? Number(body.violationCount || 0);
    const sessionViolationEvents = Array.isArray(activeSession?.violationEvents)
      ? activeSession!.violationEvents
      : Array.isArray(body.violationEvents)
      ? body.violationEvents
      : [];
    const isAutoSubmitted = Boolean(activeSession?.autoSubmitted || body.autoSubmitted);

    const fullAttemptRecord = {
      id: attemptId,
      quizId,
      quizTitle,
      studentId,
      studentName,
      classId: resolvedClassId,
      className: resolvedClassName,
      studentNisn: studentNisn || activeSession?.studentNisn || sessionUser?.nisn || '-',
      subjectName:
        resolvedClassName.includes('XI') || quizId === 'quiz-hidroponik-xi'
          ? 'Agribisnis Tanaman Pangan & Hortikultura'
          : 'Dasar-Dasar Agribisnis Tanaman',
      topic: quiz?.topic || 'Teknologi Budidaya Tanaman Sistem Hidroponik',
      mcqCorrectCount: calc.mcqCorrectCount,
      mcqTotalCount: calc.mcqTotalCount,
      mcqScore: calc.mcqScore,
      rawMcqFormula: calc.rawMcqFormula,
      essayAverageScore: null,
      caseStudyAverageScore: null,
      finalWeightedScore: hasSubjectiveQuestions ? null : effectivePercentage,
      weightsConfig: settings.weightsConfig,
      gradingStatus: hasSubjectiveQuestions ? 'incomplete' : 'graded',
      isPublished,
      publishedAt: isPublished ? nowIso : null,
      publishedBy: isPublished ? 'Sistem Otomatis' : null,
      allowStudentReview: Boolean(settings.allowStudentReview || settings.isClosed),
      teacherNotes: null,
      gradedBy: null,
      gradedAt: null,
      score: effectivePercentage,
      maxScore: 100,
      rawScore,
      rawMaxScore,
      percentage: effectivePercentage,
      passed: isPassed,
      isPassed,
      correctCount,
      wrongCount,
      totalQuestions: questions.length,
      startedAt: startIso,
      completedAt: nowIso,
      submittedAt: nowIso,
      status: hasSubjectiveQuestions ? ('pending_grading' as const) : ('graded' as const),
      violationCount: sessionViolationCount,
      violationEvents: sessionViolationEvents,
      autoSubmitted: isAutoSubmitted,
      needsReview: sessionViolationCount > 0 || isAutoSubmitted,
      examSessionStatus: isAutoSubmitted ? ('auto_submitted' as const) : ('submitted' as const),
      resumedByTeacher: activeSession?.resumedByTeacher || null,
      answers: evaluatedAnswers,
    };

    // Kunci sesi ujian agar pemantauan berhenti dan mencegah pengumpulan ganda
    const finalDraftObj: Record<string, string> = {};
    studentAnswersMap.forEach((v, k) => {
      finalDraftObj[k] = v;
    });
    completeExamSessionOnSubmit({
      quizId,
      studentId,
      attemptId,
      finalDraftAnswers: finalDraftObj,
    });

    // 4. Simpan ke Local Store + Supabase melalui helper terpadu
    const storeResult = await saveEvaluationAttempt(fullAttemptRecord);
    let synced = storeResult.savedSupabase;
    let syncError = storeResult.supabaseError || null;
    let studentSaved = false;

    // Hubungkan siswa ke rombel kelas di Supabase jika koneksi tersedia
    try {
      const supabase = createClient(SUPABASE_URL, SUPABASE_KEY, {
        auth: { persistSession: false },
      });

      const studentPayload: any = {
        id: studentId,
        full_name: studentName,
        class_id: resolvedClassId,
        class_name: resolvedClassName,
        nis: studentNisn || '-',
        nisn: studentNisn || '-',
        status: 'active',
        last_login_at: nowIso,
      };
      if (studentEmail) {
        studentPayload.email = studentEmail.trim().toLowerCase();
        studentPayload.username = studentEmail.split('@')[0];
      }
      const { error: stdErr } = await supabase
        .from('students')
        .upsert(studentPayload, { onConflict: 'email' });
      if (!stdErr) studentSaved = true;

      try {
        await supabase.from('class_students').upsert(
          {
            class_id: resolvedClassId,
            student_id: studentId,
            academic_year: '2025/2026',
            status: 'active',
          },
          { onConflict: 'class_id,student_id' }
        );
      } catch {}

      if (!hasSubjectiveQuestions) {
        try {
          await supabase.from('assessments').insert({
            student_id: studentId,
            student_name: studentName,
            student_nis: studentNisn || '-',
            class_name: resolvedClassName,
            quiz_id: quizId,
            quiz_title: quizTitle,
            score: effectivePercentage,
            max_score: 100,
            is_passed: isPassed,
            aspect_scores: {
              correct_answers: correctCount,
              incorrect_answers: wrongCount,
              total_questions: questions.length,
              topic: quiz?.topic || 'Pengelolaan Faktor Produksi',
              duration_seconds: durationSeconds,
              percentage: effectivePercentage,
              completed_at: nowIso,
            },
            notes: `Kuis ${quizTitle} - Skor: ${effectivePercentage}/100`,
          });
        } catch {}
      }
    } catch {}

    // 5. KEAMANAN: Jangan pernah mengirim kunci jawaban (correctAnswer), rubrik, atau pembahasan
    // melalui respons API siswa sebelum diizinkan!
    const staffAccess = isTeacherOrAdmin(sessionUser);
    const clientAttempt = staffAccess
      ? fullAttemptRecord
      : hasSubjectiveQuestions && !settings.allowStudentReview && !settings.isClosed
      ? sanitizeAttemptForStudent(fullAttemptRecord, settings)
      : fullAttemptRecord;

    return NextResponse.json({
      success: true,
      synced: synced || storeResult.savedLocal,
      syncError,
      studentSaved,
      attempt: clientAttempt,
      message: hasSubjectiveQuestions
        ? 'Evaluasi berhasil dikumpulkan. Pilihan ganda telah dinilai otomatis; soal uraian dan studi kasus menunggu pemeriksaan dan publikasi guru.'
        : 'Jawaban kuis dan nilai berhasil disimpan.',
    });
  } catch (err: any) {
    console.error('Quiz submission API error:', err);
    return NextResponse.json(
      { error: err.message || 'Gagal memproses pengerjaan kuis' },
      { status: 500 }
    );
  }
}
