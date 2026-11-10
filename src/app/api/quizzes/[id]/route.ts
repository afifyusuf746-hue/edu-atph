import { NextRequest, NextResponse } from 'next/server';
import { INITIAL_QUIZZES, INITIAL_QUIZ_QUESTIONS } from '@/lib/mock-data';
import {
  getServerSessionUser,
  isTeacherOrAdmin,
  getQuizSettings,
  updateQuizSettings,
  sanitizeQuestionsForStudent,
} from '@/lib/quiz-evaluation-store';

export async function GET(
  req: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const { id: quizId } = await context.params;
    const quiz = INITIAL_QUIZZES.find((q) => q.id === quizId);
    if (!quiz) {
      return NextResponse.json({ error: 'Kuis tidak ditemukan' }, { status: 404 });
    }

    const sessionUser = getServerSessionUser(req);
    const staffAccess = isTeacherOrAdmin(sessionUser);
    const settings = getQuizSettings(quizId);

    const rawQuestions = INITIAL_QUIZ_QUESTIONS.filter((q) => q.quizId === quizId).sort(
      (a, b) => a.orderIndex - b.orderIndex
    );

    const allowReview = Boolean(
      staffAccess || settings.allowStudentReview || settings.isClosed || quiz.isClosed
    );

    const questions = staffAccess
      ? rawQuestions
      : sanitizeQuestionsForStudent(rawQuestions, allowReview);

    return NextResponse.json({
      success: true,
      role: sessionUser?.role || 'student',
      quiz: {
        ...quiz,
        weightsConfig: settings.weightsConfig,
        controlledExamConfig: settings.controlledExamConfig,
        allowStudentReview: settings.allowStudentReview,
        isClosed: settings.isClosed,
      },
      questions,
    });
  } catch (err: any) {
    return NextResponse.json(
      { error: err?.message || 'Gagal memuat data kuis' },
      { status: 500 }
    );
  }
}

export async function PATCH(
  req: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const sessionUser = getServerSessionUser(req);
    if (!isTeacherOrAdmin(sessionUser)) {
      return NextResponse.json(
        { error: 'Akses ditolak: Hanya guru atau admin yang dapat mengubah pengaturan evaluasi.' },
        { status: 403 }
      );
    }

    const { id: quizId } = await context.params;
    const body = await req.json();
    const { weightsConfig, controlledExamConfig, allowStudentReview, isClosed } = body;

    if (weightsConfig) {
      const mcqW = Number(weightsConfig.mcqWeight);
      const essayW = Number(weightsConfig.essayWeight);
      const caseW = Number(weightsConfig.caseStudyWeight);
      if (
        !Number.isFinite(mcqW) ||
        !Number.isFinite(essayW) ||
        !Number.isFinite(caseW) ||
        mcqW < 0 ||
        essayW < 0 ||
        caseW < 0 ||
        Math.round(mcqW + essayW + caseW) !== 100
      ) {
        return NextResponse.json(
          { error: 'Total bobot Pilihan Ganda, Uraian, dan Studi Kasus harus tepat 100%.' },
          { status: 400 }
        );
      }
    }

    let validatedExamConfig = undefined;
    if (controlledExamConfig && typeof controlledExamConfig === 'object') {
      const maxV = Math.max(1, Math.min(20, Math.round(Number(controlledExamConfig.maxViolations ?? 3))));
      const action =
        controlledExamConfig.violationAction === 'auto_submit' ? 'auto_submit' : 'warn_only';
      validatedExamConfig = {
        enabled: Boolean(controlledExamConfig.enabled ?? true),
        requireFullscreen: Boolean(controlledExamConfig.requireFullscreen ?? true),
        maxViolations: maxV,
        violationAction: action as 'warn_only' | 'auto_submit',
      };
    }

    const updated = updateQuizSettings(quizId, {
      ...(weightsConfig ? { weightsConfig } : {}),
      ...(validatedExamConfig ? { controlledExamConfig: validatedExamConfig } : {}),
      ...(typeof allowStudentReview === 'boolean' ? { allowStudentReview } : {}),
      ...(typeof isClosed === 'boolean' ? { isClosed } : {}),
      updatedBy: sessionUser?.fullName || 'Guru ATPH',
    });

    return NextResponse.json({
      success: true,
      settings: updated,
      message: 'Pengaturan evaluasi berhasil disimpan.',
    });
  } catch (err: any) {
    return NextResponse.json(
      { error: err?.message || 'Gagal memperbarui pengaturan kuis' },
      { status: 500 }
    );
  }
}

