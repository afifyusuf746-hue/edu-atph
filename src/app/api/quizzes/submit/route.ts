import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { INITIAL_QUIZZES, INITIAL_QUIZ_QUESTIONS } from '@/lib/mock-data';

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://ngreirksuoraurufzftn.supabase.co';
const SUPABASE_KEY = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || 'sb_publishable_Tj16Oq3f9BqbVj35Le-7bQ_avuh1PjD';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const {
      quizId,
      studentId,
      studentName,
      studentNisn,
      studentEmail,
      className,
      answers, // array of { questionId, userAnswer }
      startedAt,
    } = body;

    // 1. Validasi input
    if (!quizId) {
      return NextResponse.json({ error: 'ID Kuis tidak valid' }, { status: 400 });
    }
    if (!studentId || !studentName) {
      return NextResponse.json({ error: 'Siswa belum terautentikasi' }, { status: 401 });
    }

    // 2. Temukan quiz & pertanyaan resmi
    const quiz = INITIAL_QUIZZES.find((q) => q.id === quizId);
    const quizTitle = quiz?.title || 'Kuis Evaluasi ATPH';
    const passingScore = quiz?.passingScore || 75;

    const questions = INITIAL_QUIZ_QUESTIONS.filter((q) => q.quizId === quizId);

    // 3. Evaluasi jawaban secara aman di sisi server
    let score = 0;
    let maxScore = 0;
    let correctCount = 0;
    let wrongCount = 0;

    const studentAnswersMap = new Map<string, string>();
    if (Array.isArray(answers)) {
      answers.forEach((a: any) => {
        studentAnswersMap.set(a.questionId, (a.userAnswer || '').trim());
      });
    }

    const evaluatedAnswers = questions.map((q) => {
      const userAnswer = studentAnswersMap.get(q.id) || '';
      const points = q.points || 5;
      maxScore += points;

      const isCorrect = Boolean(
        userAnswer &&
        q.correctAnswer &&
        userAnswer.trim().toLowerCase() === q.correctAnswer.trim().toLowerCase()
      );

      if (isCorrect) {
        score += points;
        correctCount++;
      } else {
        wrongCount++;
      }

      return {
        questionId: q.id,
        questionText: q.questionText,
        userAnswer,
        correctAnswer: q.correctAnswer,
        isCorrect,
        pointsAwarded: isCorrect ? points : 0,
        explanation: q.explanation || '',
      };
    });

    const percentage = maxScore > 0 ? Math.round((score / maxScore) * 100) : 0;
    const isPassed = percentage >= passingScore;
    const attemptId = `att-${Date.now()}-${Math.random().toString(36).substring(2, 8)}`;
    const nowIso = new Date().toISOString();
    const startIso = startedAt || new Date(Date.now() - 15 * 60000).toISOString();
    const durationSeconds = Math.max(1, Math.round((new Date(nowIso).getTime() - new Date(startIso).getTime()) / 1000));

    const attemptResult = {
      id: attemptId,
      quizId,
      quizTitle,
      studentId,
      studentName,
      className: className || 'X ATPH',
      studentNisn: studentNisn || '-',
      score: percentage,
      maxScore: 100,
      rawScore: score,
      rawMaxScore: maxScore,
      percentage,
      passed: isPassed,
      isPassed,
      correctCount,
      wrongCount,
      totalQuestions: questions.length,
      startedAt: startIso,
      completedAt: nowIso,
      submittedAt: nowIso,
      status: 'graded' as const,
      answers: evaluatedAnswers,
    };

    // 4. Simpan ke Supabase PostgreSQL
    let synced = false;
    let syncError: string | null = null;
    let answersSaved = false;
    let gradesSaved = false;
    let studentSaved = false;

    try {
      const supabase = createClient(SUPABASE_URL, SUPABASE_KEY, {
        auth: { persistSession: false },
      });

      // A. Simpan / Perbarui data Siswa ke tabel `students` jika tersedia
      try {
        const studentPayload: any = {
          id: studentId,
          full_name: studentName,
          class_name: className || 'X AT 1',
          nis: studentNisn || '-',
          nisn: studentNisn || '-',
          status: 'active',
          last_login_at: nowIso,
        };
        if (studentEmail) {
          studentPayload.email = studentEmail.trim().toLowerCase();
          studentPayload.username = studentEmail.split('@')[0];
        }
        const { error: stdErr } = await supabase.from('students').upsert(studentPayload, { onConflict: 'email' });
        if (!stdErr) studentSaved = true;
      } catch {}

      // B. Simpan data percobaan ke tabel `quiz_attempts`
      const answersPayload = [
        {
          __meta: true,
          className: className || 'X ATPH',
          studentNisn: studentNisn || '-',
          subjectName: 'Dasar-Dasar Agribisnis Tanaman',
          topic: quiz?.topic || 'Pengelolaan Faktor Produksi',
          correctCount,
          wrongCount,
          percentage,
          totalQuestions: questions.length,
          completedAt: nowIso,
          startedAt: startIso,
        },
        ...evaluatedAnswers,
      ];

      // Insert ke quiz_attempts dengan kolom yang kompatibel
      const { data: attemptData, error: attemptErr } = await supabase
        .from('quiz_attempts')
        .insert({
          id: attemptId,
          quiz_id: quizId,
          quiz_title: quizTitle,
          student_id: studentId,
          student_name: studentName,
          started_at: startIso,
          completed_at: nowIso,
          score: percentage,
          max_score: 100,
          is_passed: isPassed,
          answers: answersPayload,
          status: 'graded',
        })
        .select('*')
        .single();

      if (attemptErr) {
        console.warn('Supabase quiz_attempts insert error:', attemptErr.message);
        syncError = attemptErr.message;
      } else if (attemptData) {
        synced = true;
      }

      // C. Simpan rincian jawaban per nomor ke tabel `quiz_answers` jika tabel tersedia
      try {
        const quizAnswersRows = evaluatedAnswers.map((ans) => ({
          attempt_id: attemptId,
          question_id: ans.questionId,
          question_text: ans.questionText,
          answer: ans.userAnswer,
          correct_answer: ans.correctAnswer,
          is_correct: ans.isCorrect,
          points_awarded: ans.pointsAwarded,
        }));

        const { error: qAnsErr } = await supabase.from('quiz_answers').insert(quizAnswersRows);
        if (!qAnsErr) answersSaved = true;
      } catch (err: any) {
        console.warn('quiz_answers insert non-fatal error:', err?.message);
      }

      // D. Simpan nilai ke tabel `grades` jika tabel tersedia
      try {
        const gradePayload: any = {
          student_id: studentId,
          student_name: studentName,
          class_name: className || 'X ATPH',
          quiz_id: quizId,
          quiz_title: quizTitle,
          attempt_id: attemptId,
          score: percentage,
          assessment_type: 'quiz',
          subject_name: 'Dasar-Dasar Agribisnis Tanaman',
          final_score: percentage,
          quiz_average: percentage,
          status: isPassed ? 'Tuntas' : 'Belum Tuntas',
        };

        const { error: grdErr } = await supabase.from('grades').insert(gradePayload);
        if (!grdErr) gradesSaved = true;
      } catch (err: any) {
        console.warn('grades insert non-fatal error:', err?.message);
      }

      // E. Simpan ke tabel `assessments` (Permintaan Arsitektur EduATPH)
      try {
        await supabase.from('assessments').insert({
          student_id: studentId,
          student_name: studentName,
          student_nis: studentNisn || '-',
          class_name: className || 'X AT 1',
          quiz_id: quizId,
          quiz_title: quizTitle,
          score: percentage,
          max_score: 100,
          is_passed: isPassed,
          aspect_scores: {
            correct_answers: correctCount,
            incorrect_answers: wrongCount,
            total_questions: questions.length,
            topic: quiz?.topic || 'Pengelolaan Faktor Produksi',
            duration_seconds: durationSeconds,
            percentage,
            completed_at: nowIso,
          },
          notes: `Kuis ${quizTitle} - Skor: ${percentage}/100 (${isPassed ? 'Tuntas' : 'Remidi'})`,
        });
      } catch (err: any) {
        console.warn('assessments insert non-fatal error:', err?.message);
      }

      // F. Simpan juga ke tabel baru `edu_quiz_attempts`, `edu_quiz_answers`, `edu_grades` jika tabel tersedia
      try {
        await supabase.from('edu_quiz_attempts').insert({
          score: percentage,
          total_questions: questions.length,
          correct_answers: correctCount,
          wrong_answers: wrongCount,
          started_at: startIso,
          completed_at: nowIso,
          status: 'completed',
        });
      } catch {}

      try {
        await supabase.from('edu_grades').insert({
          grade_type: 'quiz',
          score: percentage,
          notes: `Kuis ${quizTitle} - Skor: ${percentage}/100 (${isPassed ? 'Tuntas' : 'Remidi'})`,
        });
      } catch {}

    } catch (err: any) {
      console.warn('Supabase connection error:', err.message);
      syncError = err.message || 'Koneksi ke Supabase terputus';
    }

    return NextResponse.json({
      success: true,
      synced,
      syncError,
      answersSaved,
      gradesSaved,
      studentSaved,
      attempt: attemptResult,
      message: synced
        ? 'Jawaban kuis dan nilai berhasil disimpan ke server Supabase'
        : 'Nilai dihitung berhasil (disimpan di perangkat, belum tersinkronisasi ke server)',
    });
  } catch (err: any) {
    console.error('Quiz submission API error:', err);
    return NextResponse.json({ error: err.message || 'Gagal memproses pengerjaan kuis' }, { status: 500 });
  }
}
