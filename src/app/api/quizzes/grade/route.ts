import { NextRequest, NextResponse } from 'next/server';
import { INITIAL_QUIZZES } from '@/lib/mock-data';
import {
  getServerSessionUser,
  isTeacherOrAdmin,
  getEvaluationAttemptById,
  saveEvaluationAttempt,
  calculateWeightedEvaluation,
  updateQuizSettings,
} from '@/lib/quiz-evaluation-store';

export async function POST(req: NextRequest) {
  try {
    // 1. Validasi Hak Akses di Server (Hanya Guru / Admin)
    const sessionUser = getServerSessionUser(req);
    if (!isTeacherOrAdmin(sessionUser)) {
      return NextResponse.json(
        {
          success: false,
          error: 'Akses ditolak: Siswa tidak diizinkan mengubah nilai, rubrik, kunci jawaban, atau bobot.',
        },
        { status: 403 }
      );
    }

    const body = await req.json();
    const {
      attemptId,
      action = 'save', // 'save' | 'publish' | 'unpublish'
      grades, // Record<questionId, { teacherScore: number | null; teacherNote?: string }> or array
      weightsConfig, // { mcqWeight, essayWeight, caseStudyWeight }
      teacherNotes,
      allowStudentReview,
      graderName,
      clientAttemptSnapshot,
    } = body;

    if (!attemptId) {
      return NextResponse.json(
        { success: false, error: 'ID percobaan evaluasi (attemptId) wajib disertakan.' },
        { status: 400 }
      );
    }

    // 2. Validasi Bobot Rekap Nilai (Jumlah harus tepat 100%)
    const effectiveWeights = weightsConfig || {
      mcqWeight: 30,
      essayWeight: 40,
      caseStudyWeight: 30,
    };
    const wMcq = Number(effectiveWeights.mcqWeight);
    const wEssay = Number(effectiveWeights.essayWeight);
    const wCase = Number(effectiveWeights.caseStudyWeight);

    if (
      !Number.isFinite(wMcq) ||
      !Number.isFinite(wEssay) ||
      !Number.isFinite(wCase) ||
      wMcq < 0 ||
      wEssay < 0 ||
      wCase < 0 ||
      Math.round(wMcq + wEssay + wCase) !== 100
    ) {
      return NextResponse.json(
        {
          success: false,
          error: 'Jumlah bobot Pilihan Ganda, Uraian, dan Studi Kasus harus tepat 100%.',
        },
        { status: 400 }
      );
    }

    // 3. Validasi Rentang Nilai Guru di Server (Hanya bilangan bulat 0–100 atau null "Belum dinilai")
    const gradesMap = new Map<
      string,
      { teacherScore: number | null; teacherNote?: string | null }
    >();

    if (Array.isArray(grades)) {
      for (const item of grades) {
        if (!item || !item.questionId) continue;
        const rawScore = item.teacherScore;
        if (rawScore !== null && rawScore !== undefined && rawScore !== '') {
          const numScore = Number(rawScore);
          if (!Number.isInteger(numScore) || numScore < 0 || numScore > 100) {
            return NextResponse.json(
              {
                success: false,
                error: `Nilai guru untuk soal "${item.questionId}" tidak valid (${rawScore}). Nilai harus berupa bilangan bulat antara 0 hingga 100.`,
              },
              { status: 400 }
            );
          }
          gradesMap.set(item.questionId, {
            teacherScore: numScore,
            teacherNote: item.teacherNote ?? null,
          });
        } else {
          gradesMap.set(item.questionId, {
            teacherScore: null,
            teacherNote: item.teacherNote ?? null,
          });
        }
      }
    } else if (grades && typeof grades === 'object') {
      for (const [qId, val] of Object.entries(grades as Record<string, any>)) {
        const rawScore = val && typeof val === 'object' ? val.teacherScore : val;
        const note = val && typeof val === 'object' ? val.teacherNote : undefined;

        if (rawScore !== null && rawScore !== undefined && rawScore !== '') {
          const numScore = Number(rawScore);
          if (!Number.isInteger(numScore) || numScore < 0 || numScore > 100) {
            return NextResponse.json(
              {
                success: false,
                error: `Nilai guru untuk soal "${qId}" tidak valid (${rawScore}). Nilai harus berupa bilangan bulat antara 0 hingga 100.`,
              },
              { status: 400 }
            );
          }
          gradesMap.set(qId, {
            teacherScore: numScore,
            teacherNote: note ?? null,
          });
        } else {
          gradesMap.set(qId, {
            teacherScore: null,
            teacherNote: note ?? null,
          });
        }
      }
    }

    let attempt = await getEvaluationAttemptById(attemptId);
    if (!attempt && clientAttemptSnapshot && clientAttemptSnapshot.id === attemptId) {
      attempt = clientAttemptSnapshot;
    }

    if (!attempt) {
      return NextResponse.json(
        { success: false, error: 'Data percobaan evaluasi siswa tidak ditemukan.' },
        { status: 404 }
      );
    }

    const nowIso = new Date().toISOString();
    const resolvedGrader =
      graderName || sessionUser?.fullName || 'Okta Nofiyanto (Guru ATPH)';

    // 4. Perbarui jawaban dengan memisahkan kolom aiScore dan teacherScore
    const updatedAnswers = (attempt.answers || []).map((ans: any) => {
      if (!gradesMap.has(ans.questionId)) {
        return ans;
      }
      const updateItem = gradesMap.get(ans.questionId)!;
      const scoreChanged = updateItem.teacherScore !== ans.teacherScore;

      return {
        ...ans,
        // Nilai AI tetap utuh di kolom terpisah
        aiScore: ans.aiScore ?? null,
        aiRubricBreakdown: ans.aiRubricBreakdown ?? null,
        aiReasoning: ans.aiReasoning ?? null,
        aiImprovement: ans.aiImprovement ?? null,
        aiGradedAt: ans.aiGradedAt ?? null,
        // Nilai Akhir Guru disimpan di kolom terpisah
        teacherScore: updateItem.teacherScore,
        teacherNote:
          updateItem.teacherNote !== undefined
            ? updateItem.teacherNote
            : ans.teacherNote ?? null,
        gradedBy:
          updateItem.teacherScore !== null
            ? resolvedGrader
            : ans.gradedBy ?? null,
        gradedAt:
          scoreChanged || updateItem.teacherScore !== null
            ? nowIso
            : ans.gradedAt ?? null,
      };
    });

    const quiz = INITIAL_QUIZZES.find((q) => q.id === attempt.quizId);
    const passingScore = quiz?.passingScore || 75;

    const calc = calculateWeightedEvaluation(
      updatedAnswers,
      { mcqWeight: wMcq, essayWeight: wEssay, caseStudyWeight: wCase },
      passingScore
    );

    // 5. Jika aksi adalah "publish" ("Terbitkan Nilai"), wajib pastikan semua jawaban telah dinilai!
    if (action === 'publish' && !calc.isComplete) {
      return NextResponse.json(
        {
          success: false,
          error: `Penilaian belum lengkap (${calc.ungradedCount} jawaban masih "Belum dinilai"). Seluruh jawaban uraian dan studi kasus harus dinilai terlebih dahulu sebelum nilai dapat diterbitkan.`,
        },
        { status: 400 }
      );
    }

    let nextIsPublished = Boolean(attempt.isPublished);
    let nextPublishedAt = attempt.publishedAt || null;
    let nextPublishedBy = attempt.publishedBy || null;

    if (action === 'publish') {
      nextIsPublished = true;
      nextPublishedAt = nowIso;
      nextPublishedBy = resolvedGrader;
    } else if (action === 'unpublish' || !calc.isComplete) {
      nextIsPublished = false;
    }

    const nextAllowReview =
      typeof allowStudentReview === 'boolean'
        ? allowStudentReview
        : Boolean(attempt.allowStudentReview);

    const updatedAttempt = {
      ...attempt,
      mcqCorrectCount: calc.mcqCorrectCount,
      mcqTotalCount: calc.mcqTotalCount,
      mcqScore: calc.mcqScore,
      rawMcqFormula: calc.rawMcqFormula,
      essayAverageScore: calc.essayAverageScore,
      caseStudyAverageScore: calc.caseStudyAverageScore,
      finalWeightedScore: calc.finalWeightedScore,
      weightsConfig: {
        mcqWeight: wMcq,
        essayWeight: wEssay,
        caseStudyWeight: wCase,
      },
      gradingStatus: calc.gradingStatus,
      isPublished: nextIsPublished,
      publishedAt: nextPublishedAt,
      publishedBy: nextPublishedBy,
      allowStudentReview: nextAllowReview,
      teacherNotes:
        teacherNotes !== undefined ? String(teacherNotes) : attempt.teacherNotes || '',
      gradedBy: resolvedGrader,
      gradedAt: nowIso,
      score:
        calc.finalWeightedScore !== null ? calc.finalWeightedScore : calc.mcqScore,
      percentage:
        calc.finalWeightedScore !== null ? calc.finalWeightedScore : calc.mcqScore,
      passed: calc.isPassed,
      isPassed: calc.isPassed,
      status: nextIsPublished ? 'graded' : 'submitted',
      answers: updatedAnswers,
    };

    // Simpan juga preferensi bobot & visibilitas pembahasan untuk kuis ini
    await updateQuizSettings(attempt.quizId, {
      weightsConfig: { mcqWeight: wMcq, essayWeight: wEssay, caseStudyWeight: wCase },
      ...(typeof allowStudentReview === 'boolean' ? { allowStudentReview } : {}),
      updatedBy: resolvedGrader,
    });

    const saveStatus = await saveEvaluationAttempt(updatedAttempt);

    return NextResponse.json({
      success: true,
      action,
      isComplete: calc.isComplete,
      ungradedCount: calc.ungradedCount,
      isPublished: nextIsPublished,
      gradedBy: resolvedGrader,
      gradedAt: nowIso,
      syncedSupabase: saveStatus.savedSupabase,
      attempt: updatedAttempt,
      message:
        action === 'publish'
          ? 'Nilai akhir berhasil diterbitkan! Siswa kini dapat melihat nilai dan umpan balik sesuai pengaturan guru.'
          : calc.isComplete
          ? 'Penilaian berhasil disimpan sebagai draf lengkap. Klik "Terbitkan Nilai" apabila siap ditampilkan kepada siswa.'
          : `Penilaian berhasil disimpan (Status: Penilaian belum lengkap — ${calc.ungradedCount} jawaban masih Belum dinilai).`,
    });
  } catch (err: any) {
    console.error('Teacher grading API error:', err);
    return NextResponse.json(
      {
        success: false,
        error: err?.message || 'Gagal menyimpan penilaian guru.',
      },
      { status: 500 }
    );
  }
}

