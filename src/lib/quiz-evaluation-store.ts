import { NextRequest } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import {
  QuizAttempt,
  QuizAnswer,
  QuizWeightsConfig,
  ControlledExamConfig,
  ExamViolationEvent,
  ExamSessionRecord,
  RubricBreakdown,
  QuizQuestion,
} from '@/types';
import { INITIAL_QUIZZES, INITIAL_QUIZ_QUESTIONS, INITIAL_USERS } from './mock-data';

const SUPABASE_URL =
  process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://ngreirksuoraurufzftn.supabase.co';
const SUPABASE_KEY =
  process.env.SUPABASE_SERVICE_ROLE_KEY ||
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ||
  'sb_publishable_Tj16Oq3f9BqbVj35Le-7bQ_avuh1PjD';

export function getSupabase() {
  return createClient(SUPABASE_URL, SUPABASE_KEY, {
    auth: { persistSession: false },
  });
}

export const DEFAULT_CONTROLLED_EXAM_CONFIG: ControlledExamConfig = {
  enabled: true,
  requireFullscreen: true,
  maxViolations: 3,
  violationAction: 'warn_only',
};

export interface ServerSessionUser {
  id: string;
  email: string;
  fullName: string;
  role: 'admin' | 'teacher' | 'student';
  classId?: string;
  className?: string;
  nisn?: string;
  assignedClasses?: string[];
}

export interface QuizSettingsRecord {
  quizId: string;
  weightsConfig: QuizWeightsConfig;
  controlledExamConfig: ControlledExamConfig;
  allowStudentReview: boolean;
  isClosed: boolean;
  updatedBy?: string;
  updatedAt?: string;
}

interface RuntimeEvaluationCache {
  attempts: Record<string, any>;
  quizSettings: Record<string, QuizSettingsRecord>;
  examSessions: Record<string, ExamSessionRecord>;
}

// In-memory runtime cache across hot serverless requests (never relies on /var/task or disk)
const runtimeCache: RuntimeEvaluationCache = {
  attempts: {
    'att-dimas-hidroponik-xi': createInitialDimasHidroponikAttempt(),
  },
  quizSettings: {
    'quiz-hidroponik-xi': {
      quizId: 'quiz-hidroponik-xi',
      weightsConfig: { mcqWeight: 30, essayWeight: 40, caseStudyWeight: 30 },
      controlledExamConfig: { ...DEFAULT_CONTROLLED_EXAM_CONFIG },
      allowStudentReview: false,
      isClosed: false,
    },
  },
  examSessions: {},
};

/**
 * Parse authenticated session user from cookies (`edu_user_session` or `edu_student_session`)
 * or explicit x-edu-session header (validated against user directory / role rules).
 */
export function getServerSessionUser(req: NextRequest): ServerSessionUser | null {
  try {
    const userCookie = req.cookies.get('edu_user_session')?.value;
    const studentCookie = req.cookies.get('edu_student_session')?.value;
    const roleHint = req.headers.get('x-edu-role-hint');

    if (roleHint === 'student' && studentCookie) {
      const parsed = JSON.parse(decodeURIComponent(studentCookie));
      if (parsed && parsed.id) {
        return {
          id: String(parsed.id),
          email: String(parsed.email || ''),
          fullName: String(parsed.fullName || 'Siswa ATPH'),
          role: 'student',
          classId: parsed.classId,
          className: parsed.className || 'XI AT 1',
          nisn: parsed.nisn || '-',
        };
      }
    }

    if (userCookie && roleHint !== 'student') {
      const parsed = JSON.parse(decodeURIComponent(userCookie));
      if (parsed && parsed.id && (parsed.role === 'admin' || parsed.role === 'teacher')) {
        const knownStaff = INITIAL_USERS.find(
          (u) =>
            u.id === parsed.id ||
            u.email.toLowerCase() === String(parsed.email || '').toLowerCase()
        );
        return {
          id: String(parsed.id),
          email: String(parsed.email || ''),
          fullName: String(parsed.fullName || 'Guru ATPH'),
          role: parsed.role,
          assignedClasses: parsed.assignedClasses || knownStaff?.assignedClasses,
        };
      }
    }

    if (studentCookie) {
      const parsed = JSON.parse(decodeURIComponent(studentCookie));
      if (parsed && parsed.id) {
        return {
          id: String(parsed.id),
          email: String(parsed.email || ''),
          fullName: String(parsed.fullName || 'Siswa ATPH'),
          role: parsed.role === 'admin' || parsed.role === 'teacher' ? parsed.role : 'student',
          classId: parsed.classId,
          className: parsed.className || 'XI AT 1',
          nisn: parsed.nisn || '-',
        };
      }
    }

    const headerSession = req.headers.get('x-edu-session');
    if (headerSession) {
      const parsed = JSON.parse(decodeURIComponent(headerSession));
      if (parsed && parsed.id && parsed.role) {
        if (parsed.role === 'admin' || parsed.role === 'teacher') {
          const knownStaff = INITIAL_USERS.find(
            (u) =>
              (u.id === parsed.id || u.email.toLowerCase() === String(parsed.email || '').toLowerCase()) &&
              (u.role === 'admin' || u.role === 'teacher')
          );
          if (knownStaff) {
            return {
              id: knownStaff.id,
              email: knownStaff.email,
              fullName: parsed.fullName || knownStaff.fullName,
              role: knownStaff.role as 'admin' | 'teacher',
              assignedClasses: parsed.assignedClasses || knownStaff.assignedClasses,
            };
          }
        } else if (parsed.role === 'student') {
          return {
            id: String(parsed.id),
            email: String(parsed.email || ''),
            fullName: String(parsed.fullName || 'Siswa ATPH'),
            role: 'student',
            classId: parsed.classId,
            className: parsed.className || 'XI AT 1',
            nisn: parsed.nisn || '-',
          };
        }
      }
    }
  } catch (err) {
    console.warn('[AUTH_SESSION_PARSE_WARN]', err);
  }
  return null;
}

export function isTeacherOrAdmin(user: ServerSessionUser | null): boolean {
  return Boolean(user && (user.role === 'admin' || user.role === 'teacher'));
}

export function canTeacherAccessClass(
  user: ServerSessionUser | null,
  className?: string | null
): boolean {
  if (!user) return false;
  if (user.role === 'admin') return true;
  if (user.role !== 'teacher') return false;
  if (!className || !user.assignedClasses || user.assignedClasses.length === 0) return true;
  const normalizedTarget = className.trim().toUpperCase();
  return user.assignedClasses.some((cls) => {
    const norm = cls.trim().toUpperCase();
    return (
      norm === normalizedTarget ||
      normalizedTarget.startsWith(norm.replace(' ATPH', ' AT')) ||
      norm.startsWith(normalizedTarget.split(' ')[0] + ' ') ||
      (norm === 'CLS-XI-AT-1' && (normalizedTarget === 'XI AT 1' || normalizedTarget === 'XI ATPH')) ||
      (norm === 'CLS-XI-AT-2' && (normalizedTarget === 'XI AT 2' || normalizedTarget === 'XI ATPH')) ||
      (norm === 'CLS-X-AT-1' && normalizedTarget === 'X AT 1')
    );
  });
}

function createInitialDimasHidroponikAttempt(): any {
  const questions = INITIAL_QUIZ_QUESTIONS.filter((q) => q.quizId === 'quiz-hidroponik-xi');
  const sampleEssayAnswers: Record<string, string> = {
    'q-hidro-xi-essay-1':
      'Sistem NFT menggunakan aliran larutan nutrisi tipis sekitar 1-3 mm pada talang miring 2-3% sehingga akar mendapat oksigen langsung. Sedangkan DFT menyisakan genangan 3-5 cm di pipa sehingga saat listrik mati tanaman tetap aman.',
    'q-hidro-xi-essay-2':
      'Stok A dan B dipisah pekat agar tidak mengendap menjadi gipsum CaSO4 dan kalsium fosfat yang tidak larut. Pencampuran harus bertahap dengan air bersih.',
    'q-hidro-xi-essay-3':
      'Rentang pH ideal hidroponik 5,5-6,5. Jika pH > 7,0, unsur mikro seperti Fe dan P mengendap sehingga daun klorosis. Turunkan dengan Asam Fosfat (pH Down).',
    'q-hidro-xi-essay-4':
      'Suhu > 30°C menurunkan dissolved oxygen (DO) dan memicu jamur Pythium sp. busuk akar. Pencegahannya dengan aerator, tandon dinaungi, dan isolasi pipa.',
    'q-hidro-xi-essay-5':
      'Benih disemai di rockwool, dikenakan sinar matahari setelah berkecambah. Pindah tanam pada 3-4 daun sejati (10-14 HSS). Etiolasi terjadi karena kurang cahaya.',
    'q-hidro-xi-case-1':
      'Diagnosis: Pythium sp. akibat suhu tandon 33°C dan tipburn akibat defisiensi Ca transpirasi terhambat pada suhu 36°C & EC 2,4. Penyelamatan: Tambah air dingin, beri pH Down, aerasi kuat, dan naungi greenhouse.',
    'q-hidro-xi-case-2':
      'Pencampuran pekatan 5L A & B tanpa air menyebabkan kation Ca2+ bereaksi dengan SO4 2- membentuk endapan gipsum yang menyumbat emitter dan mengikat hara.',
  };

  let correctCount = 0;
  const answers: QuizAnswer[] = questions.map((q, idx) => {
    if (q.questionType === 'multiple_choice') {
      const isCorr = idx < 8;
      if (isCorr) correctCount++;
      const wrongOpt = q.options?.find((o) => o.id !== q.correctAnswer)?.id || 'D';
      return {
        questionId: q.id,
        questionType: 'multiple_choice',
        questionText: q.questionText,
        userAnswer: isCorr ? (q.correctAnswer || 'A') : wrongOpt,
        correctAnswer: q.correctAnswer,
        explanation: q.explanation || '',
        isCorrect: isCorr,
        pointsAwarded: isCorr ? 1 : 0,
      };
    }

    return {
      questionId: q.id,
      questionType: q.questionType,
      questionText: q.questionText,
      userAnswer: sampleEssayAnswers[q.id] || '',
      correctAnswer: q.correctAnswer,
      explanation: q.explanation || '',
      aiScore: null,
      aiRubricBreakdown: null,
      aiReasoning: null,
      aiImprovement: null,
      aiGradedAt: null,
      teacherScore: null,
      teacherNote: null,
      gradedBy: null,
      gradedAt: null,
    };
  });

  const mcqScore = Math.min(100, Math.round((correctCount / 10) * 100 * 100) / 100);

  return {
    id: 'att-dimas-hidroponik-xi',
    quizId: 'quiz-hidroponik-xi',
    quizTitle: 'Evaluasi Pembelajaran: Teknologi Budidaya Tanaman Hidroponik (Kelas XI ATPH)',
    studentId: 'usr-student-dimas',
    studentName: 'Dimas Anggoro',
    studentNisn: '0068129401',
    className: 'XI AT 1',
    subjectName: 'Agribisnis Tanaman Pangan & Hortikultura',
    topic: 'Teknologi Budidaya Tanaman Sistem Hidroponik',
    startedAt: '2026-11-10T07:30:00Z',
    completedAt: '2026-11-10T08:10:00Z',
    submittedAt: '2026-11-10T08:10:00Z',
    mcqCorrectCount: correctCount,
    mcqTotalCount: 10,
    mcqScore,
    essayAverageScore: null,
    caseStudyAverageScore: null,
    finalWeightedScore: null,
    weightsConfig: {
      mcqWeight: 30,
      essayWeight: 40,
      caseStudyWeight: 30,
    },
    gradingStatus: 'incomplete',
    isPublished: false,
    publishedAt: null,
    publishedBy: null,
    allowStudentReview: false,
    teacherNotes: '',
    gradedBy: null,
    gradedAt: null,
    score: mcqScore,
    maxScore: 100,
    percentage: mcqScore,
    passed: false,
    isPassed: false,
    correctCount,
    wrongCount: 10 - correctCount,
    totalQuestions: 17,
    status: 'submitted',
    violationCount: 1,
    violationEvents: [
      {
        id: 'viol-sample-dimas-1',
        type: 'tab_hidden',
        label: 'Halaman kuis tidak terlihat (berpindah tab / jendela tersembunyi)',
        occurredAt: '2026-11-10T07:48:12Z',
        returnedAt: '2026-11-10T07:48:19Z',
        durationSeconds: 7,
        mergedSignals: ['visibilitychange:hidden', 'window:blur'],
      },
    ],
    autoSubmitted: false,
    needsReview: true,
    examSessionStatus: 'submitted',
    answers,
  };
}

/**
 * Get Quiz Settings (Synchronous from memory cache or default)
 */
export function getQuizSettings(quizId: string): QuizSettingsRecord {
  if (runtimeCache.quizSettings[quizId]) {
    const existing = runtimeCache.quizSettings[quizId];
    return {
      ...existing,
      controlledExamConfig: {
        ...DEFAULT_CONTROLLED_EXAM_CONFIG,
        ...(existing.controlledExamConfig || {}),
      },
    };
  }
  const quiz = INITIAL_QUIZZES.find((q) => q.id === quizId);
  return {
    quizId,
    weightsConfig: quiz?.weightsConfig || { mcqWeight: 30, essayWeight: 40, caseStudyWeight: 30 },
    controlledExamConfig: {
      ...DEFAULT_CONTROLLED_EXAM_CONFIG,
      ...(quiz?.controlledExamConfig || {}),
    },
    allowStudentReview: Boolean(quiz?.allowStudentReview),
    isClosed: Boolean(quiz?.isClosed),
  };
}

/**
 * Fetch Quiz Settings from Supabase asynchronously
 */
export async function fetchQuizSettings(quizId: string): Promise<QuizSettingsRecord> {
  try {
    const supabase = getSupabase();
    const { data, error } = await supabase
      .from('quiz_attempts')
      .select('*')
      .eq('id', `settings_${quizId}`)
      .single();

    if (!error && data && Array.isArray(data.answers) && data.answers[0]?.__settings) {
      const rec = data.answers[0] as QuizSettingsRecord;
      runtimeCache.quizSettings[quizId] = rec;
      return rec;
    }
  } catch (err) {
    console.warn('[FETCH_SETTINGS_ERR]', err);
  }
  return getQuizSettings(quizId);
}

/**
 * Update Quiz Settings and persist directly to Supabase
 */
export async function updateQuizSettings(
  quizId: string,
  updates: Partial<QuizSettingsRecord>
): Promise<QuizSettingsRecord> {
  const current = getQuizSettings(quizId);
  const next: QuizSettingsRecord = {
    ...current,
    ...updates,
    controlledExamConfig: updates.controlledExamConfig
      ? {
          ...current.controlledExamConfig,
          ...updates.controlledExamConfig,
        }
      : current.controlledExamConfig,
    quizId,
    updatedAt: new Date().toISOString(),
  };

  runtimeCache.quizSettings[quizId] = next;

  try {
    const supabase = getSupabase();
    await supabase.from('quiz_attempts').upsert(
      {
        id: `settings_${quizId}`,
        quiz_id: quizId,
        quiz_title: `Quiz Settings: ${quizId}`,
        student_id: '__quiz_settings__',
        student_name: 'Quiz Settings',
        started_at: new Date().toISOString(),
        completed_at: new Date().toISOString(),
        score: 0,
        max_score: 100,
        is_passed: false,
        answers: [{ ...next, __settings: true }],
        status: 'in_progress',
      },
      { onConflict: 'id' }
    );
  } catch (err) {
    console.error('[UPDATE_SETTINGS_ERR]', err);
  }

  return next;
}

/**
 * Compute MCQ score, Essay average, Case Study average, and Final Weighted Score.
 */
export function calculateWeightedEvaluation(
  answers: QuizAnswer[],
  weightsConfig: QuizWeightsConfig = { mcqWeight: 30, essayWeight: 40, caseStudyWeight: 30 },
  passingScore: number = 75
): {
  mcqCorrectCount: number;
  mcqTotalCount: number;
  mcqScore: number;
  rawMcqFormula: string;
  essayAverageScore: number | null;
  caseStudyAverageScore: number | null;
  finalWeightedScore: number | null;
  gradingStatus: 'incomplete' | 'complete' | 'graded';
  isComplete: boolean;
  ungradedCount: number;
  isPassed: boolean;
} {
  const mcqQuestions = answers.filter(
    (a) => a.questionType === 'multiple_choice' || a.questionType === 'true_false'
  );
  const essayQuestions = answers.filter((a) => a.questionType === 'essay');
  const caseStudyQuestions = answers.filter((a) => a.questionType === 'case_study');

  const mcqCorrectCount = mcqQuestions.filter((a) => Boolean(a.isCorrect)).length;
  const mcqTotalCount = mcqQuestions.length > 0 ? mcqQuestions.length : 10;
  const rawRatio = mcqCorrectCount / 10;
  const mcqScore = Math.min(100, Math.round(rawRatio * 100 * 100) / 100);
  const rawMcqFormula = `(${mcqCorrectCount} / 10) × 100 = ${mcqScore}`;

  let ungradedCount = 0;

  const essayScores: number[] = [];
  essayQuestions.forEach((q) => {
    if (q.teacherScore !== null && q.teacherScore !== undefined && !Number.isNaN(Number(q.teacherScore))) {
      essayScores.push(Number(q.teacherScore));
    } else {
      ungradedCount++;
    }
  });

  const caseStudyScores: number[] = [];
  caseStudyQuestions.forEach((q) => {
    if (q.teacherScore !== null && q.teacherScore !== undefined && !Number.isNaN(Number(q.teacherScore))) {
      caseStudyScores.push(Number(q.teacherScore));
    } else {
      ungradedCount++;
    }
  });

  const essayAverageScore =
    essayQuestions.length > 0
      ? essayScores.length === essayQuestions.length
        ? Math.round((essayScores.reduce((acc, s) => acc + s, 0) / essayQuestions.length) * 100) /
          100
        : null
      : null;

  const caseStudyAverageScore =
    caseStudyQuestions.length > 0
      ? caseStudyScores.length === caseStudyQuestions.length
        ? Math.round(
            (caseStudyScores.reduce((acc, s) => acc + s, 0) / caseStudyQuestions.length) * 100
          ) / 100
        : null
      : null;

  const isComplete = ungradedCount === 0;

  let finalWeightedScore: number | null = null;
  if (isComplete) {
    const wMcq = (weightsConfig.mcqWeight ?? 30) / 100;
    const wEssay = (weightsConfig.essayWeight ?? 40) / 100;
    const wCase = (weightsConfig.caseStudyWeight ?? 30) / 100;

    const weightedMcq = mcqScore * wMcq;
    const weightedEssay = (essayAverageScore ?? 0) * wEssay;
    const weightedCase = (caseStudyAverageScore ?? 0) * wCase;

    finalWeightedScore = Math.round(weightedMcq + weightedEssay + weightedCase);
  }

  const gradingStatus =
    essayQuestions.length === 0 && caseStudyQuestions.length === 0
      ? 'graded'
      : isComplete
      ? 'complete'
      : 'incomplete';

  const effectiveFinal = finalWeightedScore !== null ? finalWeightedScore : mcqScore;
  const isPassed = isComplete ? effectiveFinal >= passingScore : false;

  return {
    mcqCorrectCount,
    mcqTotalCount,
    mcqScore,
    rawMcqFormula,
    essayAverageScore,
    caseStudyAverageScore,
    finalWeightedScore,
    gradingStatus,
    isComplete,
    ungradedCount,
    isPassed,
  };
}

/**
 * Remove answers, rubrics, and unfinalized teacher scores from student response
 */
export function sanitizeAttemptForStudent(
  attempt: any,
  settings: QuizSettingsRecord
): any {
  if (!attempt) return null;
  const canSeeFullReview = Boolean(
    attempt.isPublished || settings.allowStudentReview || settings.isClosed
  );

  const sanitizedAnswers = (attempt.answers || []).map((ans: QuizAnswer) => {
    if (ans.questionType === 'multiple_choice' || ans.questionType === 'true_false') {
      return {
        questionId: ans.questionId,
        questionType: ans.questionType,
        questionText: ans.questionText,
        userAnswer: ans.userAnswer,
        pointsAwarded: ans.pointsAwarded,
        isCorrect: ans.isCorrect,
        correctAnswer: canSeeFullReview ? ans.correctAnswer : undefined,
        explanation: canSeeFullReview ? ans.explanation : undefined,
      };
    }

    return {
      questionId: ans.questionId,
      questionType: ans.questionType,
      questionText: ans.questionText,
      userAnswer: ans.userAnswer,
      correctAnswer: canSeeFullReview ? ans.correctAnswer : undefined,
      explanation: canSeeFullReview ? ans.explanation : undefined,
      aiScore: undefined,
      aiRubricBreakdown: undefined,
      aiReasoning: undefined,
      aiImprovement: undefined,
      aiGradedAt: undefined,
      teacherScore: canSeeFullReview ? ans.teacherScore : null,
      teacherNote: canSeeFullReview ? ans.teacherNote : null,
      gradedBy: canSeeFullReview ? ans.gradedBy : null,
      gradedAt: canSeeFullReview ? ans.gradedAt : null,
    };
  });

  return {
    ...attempt,
    answers: sanitizedAnswers,
    score: attempt.isPublished ? attempt.score : attempt.mcqScore,
    percentage: attempt.isPublished ? attempt.percentage : attempt.mcqScore,
    finalWeightedScore: attempt.isPublished ? attempt.finalWeightedScore : null,
    essayAverageScore: attempt.isPublished ? attempt.essayAverageScore : null,
    caseStudyAverageScore: attempt.isPublished ? attempt.caseStudyAverageScore : null,
    teacherNotes: canSeeFullReview ? attempt.teacherNotes : null,
    gradingStatus: attempt.isPublished ? 'graded' : attempt.gradingStatus || 'incomplete',
  };
}

export function sanitizeQuestionsForStudent(
  questions: QuizQuestion[],
  allowReview: boolean
): QuizQuestion[] {
  return questions.map((q) => ({
    ...q,
    correctAnswer: allowReview ? q.correctAnswer : undefined,
    explanation: allowReview ? q.explanation : undefined,
    rubric: allowReview ? q.rubric : undefined,
  }));
}

/**
 * Hydrate a raw database row from Supabase `quiz_attempts`
 */
export function hydrateRowFromSupabase(row: any): any {
  let answersList: QuizAnswer[] = [];
  let meta: any = {};

  if (Array.isArray(row.answers)) {
    const first = row.answers[0];
    if (first && (first.__meta || first.__session || first.__settings)) {
      meta = first;
      answersList = row.answers.slice(1);
    } else {
      answersList = row.answers;
    }
  }

  const weightsConfig =
    meta.weightsConfig ||
    row.weights_config || { mcqWeight: 30, essayWeight: 40, caseStudyWeight: 30 };

  const calc = calculateWeightedEvaluation(answersList, weightsConfig, 75);

  const isPub = meta.isPublished !== undefined ? Boolean(meta.isPublished) : row.status === 'graded';

  return {
    id: row.id,
    quizId: row.quiz_id,
    quizTitle: row.quiz_title || 'Kuis ATPH',
    studentId: row.student_id,
    studentName: row.student_name,
    className: meta.className || 'XI AT 1',
    studentNisn: meta.studentNisn || '-',
    subjectName: meta.subjectName || 'Agribisnis Tanaman Pangan & Hortikultura',
    topic: meta.topic || 'Teknologi Budidaya Tanaman Sistem Hidroponik',
    mcqCorrectCount: meta.mcqCorrectCount ?? calc.mcqCorrectCount,
    mcqTotalCount: meta.mcqTotalCount ?? calc.mcqTotalCount,
    mcqScore: meta.mcqScore ?? calc.mcqScore,
    essayAverageScore: meta.essayAverageScore ?? calc.essayAverageScore,
    caseStudyAverageScore: meta.caseStudyAverageScore ?? calc.caseStudyAverageScore,
    finalWeightedScore: meta.finalWeightedScore ?? calc.finalWeightedScore,
    weightsConfig,
    gradingStatus: meta.gradingStatus || calc.gradingStatus,
    isPublished: isPub,
    publishedAt: meta.publishedAt || (isPub ? row.completed_at : null),
    publishedBy: meta.publishedBy || (isPub ? 'Guru ATPH' : null),
    allowStudentReview: Boolean(meta.allowStudentReview),
    teacherNotes: meta.teacherNotes ?? null,
    gradedBy: meta.gradedBy ?? null,
    gradedAt: meta.gradedAt ?? null,
    score: Number(row.score) || calc.mcqScore || 0,
    maxScore: Number(row.max_score) || 100,
    percentage:
      meta.finalWeightedScore !== null && meta.finalWeightedScore !== undefined
        ? Number(meta.finalWeightedScore)
        : Number(row.score) || calc.mcqScore || 0,
    isPassed: Boolean(row.is_passed ?? calc.isPassed),
    passed: Boolean(row.is_passed ?? calc.isPassed),
    correctCount: meta.correctCount ?? calc.mcqCorrectCount,
    wrongCount: meta.wrongCount ?? calc.mcqTotalCount - calc.mcqCorrectCount,
    totalQuestions: meta.totalQuestions || answersList.length || 17,
    startedAt: row.started_at,
    completedAt: row.completed_at || row.started_at,
    status: isPub ? 'graded' : 'submitted',
    violationCount: meta.violationCount ?? 0,
    violationEvents: Array.isArray(meta.violationEvents) ? meta.violationEvents : [],
    autoSubmitted: Boolean(meta.autoSubmitted),
    needsReview: Boolean(meta.needsReview ?? (meta.violationCount > 0 || meta.autoSubmitted)),
    examSessionStatus: meta.examSessionStatus || 'submitted',
    resumedByTeacher: meta.resumedByTeacher || null,
    answers: answersList,
  };
}

/**
 * Save or update an evaluation attempt in Supabase `quiz_attempts`.
 * Directly awaits database write, verifies status constraint, and logs structured errors.
 */
export async function saveEvaluationAttempt(attempt: any): Promise<{
  savedLocal: boolean;
  savedSupabase: boolean;
  supabaseError?: string | null;
}> {
  runtimeCache.attempts[attempt.id] = attempt;

  let savedSupabase = false;
  let supabaseError: string | null = null;

  try {
    const supabase = getSupabase();

    const metaHeader = {
      __meta: true,
      classId: attempt.classId || 'cls-xi-at-1',
      className: attempt.className || 'XI AT 1',
      studentNisn: attempt.studentNisn || '-',
      subjectName: attempt.subjectName || 'Agribisnis Tanaman Pangan & Hortikultura',
      topic: attempt.topic || 'Teknologi Budidaya Tanaman Sistem Hidroponik',
      correctCount: attempt.mcqCorrectCount ?? attempt.correctCount ?? 0,
      wrongCount: attempt.wrongCount ?? 0,
      mcqCorrectCount: attempt.mcqCorrectCount ?? 0,
      mcqTotalCount: attempt.mcqTotalCount ?? 10,
      mcqScore: attempt.mcqScore ?? attempt.score ?? 0,
      essayAverageScore: attempt.essayAverageScore ?? null,
      caseStudyAverageScore: attempt.caseStudyAverageScore ?? null,
      finalWeightedScore: attempt.finalWeightedScore ?? null,
      weightsConfig: attempt.weightsConfig || { mcqWeight: 30, essayWeight: 40, caseStudyWeight: 30 },
      gradingStatus: attempt.gradingStatus || 'incomplete',
      isPublished: Boolean(attempt.isPublished),
      publishedAt: attempt.publishedAt || null,
      publishedBy: attempt.publishedBy || null,
      allowStudentReview: Boolean(attempt.allowStudentReview),
      teacherNotes: attempt.teacherNotes || null,
      gradedBy: attempt.gradedBy || null,
      gradedAt: attempt.gradedAt || null,
      percentage: attempt.finalWeightedScore ?? attempt.mcqScore ?? attempt.percentage ?? 0,
      totalQuestions: attempt.totalQuestions || (attempt.answers || []).length,
      completedAt: attempt.completedAt,
      startedAt: attempt.startedAt,
      violationCount: attempt.violationCount ?? 0,
      violationEvents: attempt.violationEvents || [],
      autoSubmitted: Boolean(attempt.autoSubmitted),
      needsReview: Boolean(attempt.needsReview),
      examSessionStatus: attempt.examSessionStatus || 'submitted',
      resumedByTeacher: attempt.resumedByTeacher || null,
    };

    const answersPayload = [metaHeader, ...(attempt.answers || [])];
    const effectiveScore =
      attempt.finalWeightedScore !== null && attempt.finalWeightedScore !== undefined
        ? Number(attempt.finalWeightedScore)
        : Number(attempt.mcqScore ?? attempt.score ?? 0);

    // CRITICAL: DB CHECK constraint allows 'graded', 'submitted', 'in_progress'.
    const dbStatus = attempt.isPublished ? 'graded' : 'submitted';

    const { error } = await supabase.from('quiz_attempts').upsert(
      {
        id: attempt.id,
        quiz_id: attempt.quizId,
        quiz_title: attempt.quizTitle,
        student_id: attempt.studentId,
        student_name: attempt.studentName,
        started_at: attempt.startedAt,
        completed_at: attempt.completedAt,
        score: effectiveScore,
        max_score: 100,
        is_passed: Boolean(attempt.isPassed ?? attempt.passed),
        answers: answersPayload,
        status: dbStatus,
      },
      { onConflict: 'id' }
    );

    if (error) {
      supabaseError = error.message;
      console.error('[EVAL_STORE_SAVE_FAILED]', {
        operation: 'saveEvaluationAttempt',
        attemptId: attempt.id,
        quizId: attempt.quizId,
        studentId: attempt.studentId,
        dbCode: error.code,
        dbMessage: error.message,
        timestamp: new Date().toISOString(),
      });
    } else {
      savedSupabase = true;
    }
  } catch (err: any) {
    supabaseError = err?.message || 'Koneksi database Supabase tidak tersedia';
    console.error('[EVAL_STORE_CONN_ERROR]', {
      attemptId: attempt.id,
      error: supabaseError,
    });
  }

  return { savedLocal: true, savedSupabase, supabaseError };
}

/**
 * Retrieve attempt by ID directly from Supabase
 */
export async function getEvaluationAttemptById(attemptId: string): Promise<any | null> {
  try {
    const supabase = getSupabase();
    const { data, error } = await supabase
      .from('quiz_attempts')
      .select('*')
      .eq('id', attemptId)
      .single();

    if (!error && data) {
      if (Array.isArray(data.answers) && (data.answers[0]?.__session || data.answers[0]?.__settings)) {
        return null;
      }
      const remote = hydrateRowFromSupabase(data);
      runtimeCache.attempts[attemptId] = remote;
      return remote;
    }
  } catch (err) {
    console.warn('[GET_ATTEMPT_BY_ID_ERR]', err);
  }

  if (attemptId === 'att-dimas-hidroponik-xi') {
    return runtimeCache.attempts['att-dimas-hidroponik-xi'] || createInitialDimasHidroponikAttempt();
  }

  return runtimeCache.attempts[attemptId] || null;
}

/**
 * List evaluation attempts directly from Supabase.
 * Excludes session records and settings records.
 */
export async function listEvaluationAttempts(filters?: {
  quizId?: string | null;
  studentId?: string | null;
}): Promise<any[]> {
  const mergedMap = new Map<string, any>();

  try {
    const supabase = getSupabase();
    let query = supabase
      .from('quiz_attempts')
      .select('*')
      .in('status', ['submitted', 'graded'])
      .order('completed_at', { ascending: false });

    if (filters?.quizId) {
      query = query.eq('quiz_id', filters.quizId);
    }
    if (filters?.studentId) {
      query = query.eq('student_id', filters.studentId);
    }

    const { data, error } = await query;
    if (!error && Array.isArray(data)) {
      data.forEach((row) => {
        if (
          String(row.id).startsWith('sess_') ||
          String(row.id).startsWith('settings_') ||
          row.student_id === '__quiz_settings__'
        ) {
          return;
        }
        const remote = hydrateRowFromSupabase(row);
        mergedMap.set(remote.id, remote);
      });
    } else if (error) {
      console.error('[LIST_ATTEMPTS_DB_ERR]', error);
    }
  } catch (err) {
    console.warn('[LIST_ATTEMPTS_FETCH_ERR]', err);
  }

  // Fallback initial sample attempt for Dimas if no real attempts in DB
  if (
    filters?.quizId === 'quiz-hidroponik-xi' &&
    (!filters?.studentId || filters.studentId === 'usr-student-dimas') &&
    mergedMap.size === 0
  ) {
    const sample = createInitialDimasHidroponikAttempt();
    mergedMap.set(sample.id, sample);
  }

  return Array.from(mergedMap.values()).sort(
    (a, b) =>
      new Date(b.completedAt || b.startedAt || 0).getTime() -
      new Date(a.completedAt || a.startedAt || 0).getTime()
  );
}

/**
 * ============================================================================
 * CONTROLLED EXAM MODE SESSION & MONITORING STORE (PERSISTENT VIA SUPABASE)
 * ============================================================================
 */
export function getExamSessionKey(quizId: string, studentId: string): string {
  return `sess_${quizId}__${studentId}`;
}

/**
 * Get active exam session directly from Supabase
 */
export async function getExamSession(
  quizId: string,
  studentId: string
): Promise<ExamSessionRecord | null> {
  const key = getExamSessionKey(quizId, studentId);

  try {
    const supabase = getSupabase();
    const { data, error } = await supabase
      .from('quiz_attempts')
      .select('*')
      .eq('id', key)
      .single();

    if (!error && data && Array.isArray(data.answers) && data.answers[0]?.__session) {
      const sess = data.answers[0] as ExamSessionRecord;
      runtimeCache.examSessions[key] = sess;
      return sess;
    }
  } catch (err) {
    console.warn('[GET_EXAM_SESSION_ERR]', err);
  }

  return runtimeCache.examSessions[key] || null;
}

/**
 * List all active/recent exam sessions from Supabase
 */
export async function listExamSessions(filters?: {
  quizId?: string | null;
  studentId?: string | null;
}): Promise<ExamSessionRecord[]> {
  const sessionList: ExamSessionRecord[] = [];

  try {
    const supabase = getSupabase();
    let query = supabase.from('quiz_attempts').select('*').like('id', 'sess_%');

    if (filters?.quizId) {
      query = query.eq('quiz_id', filters.quizId);
    }
    if (filters?.studentId) {
      query = query.eq('student_id', filters.studentId);
    }

    const { data, error } = await query;
    if (!error && Array.isArray(data)) {
      data.forEach((row) => {
        if (Array.isArray(row.answers) && row.answers[0]?.__session) {
          sessionList.push(row.answers[0] as ExamSessionRecord);
        }
      });
    }
  } catch (err) {
    console.warn('[LIST_EXAM_SESSIONS_ERR]', err);
  }

  // Include in-memory active sessions if any
  Object.values(runtimeCache.examSessions).forEach((sess) => {
    if (!sessionList.some((s) => s.id === sess.id)) {
      if (filters?.quizId && sess.quizId !== filters.quizId) return;
      if (filters?.studentId && sess.studentId !== filters.studentId) return;
      sessionList.push(sess);
    }
  });

  return sessionList.sort(
    (a, b) =>
      new Date(b.lastSavedAt || b.startedAt).getTime() -
      new Date(a.lastSavedAt || a.startedAt).getTime()
  );
}

export function buildEvaluatedAttemptFromAnswersMap(params: {
  attemptId?: string;
  quizId: string;
  studentId: string;
  studentName: string;
  studentNisn?: string;
  className: string;
  startedAt: string;
  completedAt: string;
  selectedAnswers: Record<string, string>;
  violationCount?: number;
  violationEvents?: ExamViolationEvent[];
  autoSubmitted?: boolean;
  resumedByTeacher?: ExamSessionRecord['resumedByTeacher'];
}) {
  const quiz = INITIAL_QUIZZES.find((q) => q.id === params.quizId);
  const questions = INITIAL_QUIZ_QUESTIONS.filter((q) => q.quizId === params.quizId).sort(
    (a, b) => a.orderIndex - b.orderIndex
  );
  const settings = getQuizSettings(params.quizId);

  const evaluatedAnswers: QuizAnswer[] = questions.map((q) => {
    const rawUserAnswer = String(params.selectedAnswers[q.id] ?? '').trim();

    if (q.questionType === 'multiple_choice' || q.questionType === 'true_false') {
      const isCorrect =
        rawUserAnswer.toUpperCase() === String(q.correctAnswer || '').trim().toUpperCase();
      return {
        questionId: q.id,
        questionType: q.questionType,
        questionText: q.questionText,
        userAnswer: rawUserAnswer,
        correctAnswer: q.correctAnswer,
        explanation: q.explanation || '',
        isCorrect,
        pointsAwarded: isCorrect ? 1 : 0,
      };
    }

    return {
      questionId: q.id,
      questionType: q.questionType,
      questionText: q.questionText,
      userAnswer: rawUserAnswer,
      correctAnswer: q.correctAnswer,
      explanation: q.explanation || '',
      aiScore: null,
      aiRubricBreakdown: null,
      aiReasoning: null,
      aiImprovement: null,
      aiGradedAt: null,
      teacherScore: null,
      teacherNote: null,
      gradedBy: null,
      gradedAt: null,
    };
  });

  const calc = calculateWeightedEvaluation(
    evaluatedAnswers,
    settings.weightsConfig,
    quiz?.passingScore || 75
  );

  const hasSubjective = questions.some(
    (q) => q.questionType === 'essay' || q.questionType === 'case_study'
  );

  const vCount = params.violationCount ?? 0;
  const isAuto = Boolean(params.autoSubmitted);

  return {
    id: params.attemptId || `att-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
    quizId: params.quizId,
    quizTitle: quiz?.title || 'Evaluasi Pembelajaran ATPH',
    studentId: params.studentId,
    studentName: params.studentName,
    studentNisn: params.studentNisn || '-',
    className: params.className || 'XI AT 1',
    subjectName: 'Agribisnis Tanaman Pangan & Hortikultura',
    topic: quiz?.topic || 'Teknologi Budidaya Tanaman Sistem Hidroponik',
    startedAt: params.startedAt,
    completedAt: params.completedAt,
    submittedAt: params.completedAt,
    mcqCorrectCount: calc.mcqCorrectCount,
    mcqTotalCount: calc.mcqTotalCount,
    mcqScore: calc.mcqScore,
    essayAverageScore: calc.essayAverageScore,
    caseStudyAverageScore: calc.caseStudyAverageScore,
    finalWeightedScore: calc.finalWeightedScore,
    weightsConfig: settings.weightsConfig,
    gradingStatus: calc.gradingStatus,
    isPublished: !hasSubjective,
    publishedAt: !hasSubjective ? params.completedAt : null,
    publishedBy: !hasSubjective ? 'Sistem Otomatis' : null,
    allowStudentReview: !hasSubjective || settings.allowStudentReview || settings.isClosed,
    teacherNotes: null,
    gradedBy: null,
    gradedAt: null,
    score: calc.finalWeightedScore ?? calc.mcqScore,
    maxScore: 100,
    percentage: calc.finalWeightedScore ?? calc.mcqScore,
    passed: calc.isPassed,
    isPassed: calc.isPassed,
    correctCount: calc.mcqCorrectCount,
    wrongCount: calc.mcqTotalCount - calc.mcqCorrectCount,
    totalQuestions: questions.length,
    status: !hasSubjective ? 'graded' : 'submitted',
    violationCount: vCount,
    violationEvents: params.violationEvents || [],
    autoSubmitted: isAuto,
    needsReview: vCount > 0 || isAuto,
    examSessionStatus: isAuto ? 'auto_submitted' : 'submitted',
    resumedByTeacher: params.resumedByTeacher || null,
    answers: evaluatedAnswers,
  };
}

/**
 * Start or resume exam session with Supabase persistence
 */
export async function startOrResumeExamSession(params: {
  quizId: string;
  studentId: string;
  studentName: string;
  studentNisn?: string;
  className: string;
  fullscreenSupported?: boolean;
  initialDraftAnswers?: Record<string, string>;
}): Promise<{ session: ExamSessionRecord; resumed: boolean; isLocked: boolean }> {
  const supabase = getSupabase();
  const key = getExamSessionKey(params.quizId, params.studentId);
  const quiz = INITIAL_QUIZZES.find((q) => q.id === params.quizId);
  const durationMinutes = quiz?.durationMinutes || 60;
  const now = new Date();
  const nowIso = now.toISOString();

  // 1. Check if student already submitted this quiz permanently in Supabase
  try {
    const { data: existingAttempts } = await supabase
      .from('quiz_attempts')
      .select('*')
      .eq('quiz_id', params.quizId)
      .eq('student_id', params.studentId)
      .in('status', ['submitted', 'graded'])
      .order('completed_at', { ascending: false })
      .limit(1);

    if (existingAttempts && existingAttempts.length > 0) {
      const pastAtt = hydrateRowFromSupabase(existingAttempts[0]);
      const pastSession: ExamSessionRecord = {
        id: `sess-${pastAtt.id}`,
        quizId: params.quizId,
        studentId: params.studentId,
        studentName: pastAtt.studentName || params.studentName,
        className: pastAtt.className || params.className,
        status: pastAtt.autoSubmitted ? 'auto_submitted' : 'submitted',
        startedAt: pastAtt.startedAt,
        deadlineAt: pastAtt.completedAt,
        lastSavedAt: pastAtt.completedAt,
        draftAnswers: {},
        violationCount: pastAtt.violationCount || 0,
        violationEvents: pastAtt.violationEvents || [],
        fullscreenSupported: true,
        autoSubmitted: pastAtt.autoSubmitted,
        needsReview: pastAtt.needsReview,
        lockedAt: pastAtt.completedAt,
        attemptId: pastAtt.id,
        resumedByTeacher: pastAtt.resumedByTeacher,
      };
      return { session: pastSession, resumed: true, isLocked: true };
    }
  } catch (err) {
    console.warn('[CHECK_LOCKED_ATTEMPT_ERR]', err);
  }

  // 2. Check if active session already exists in Supabase
  const existing = await getExamSession(params.quizId, params.studentId);

  if (existing) {
    if (existing.status === 'auto_submitted' || existing.status === 'submitted') {
      return { session: existing, resumed: true, isLocked: true };
    }

    const mergedDrafts: Record<string, string> = {
      ...(existing.draftAnswers || {}),
    };
    if (params.initialDraftAnswers && typeof params.initialDraftAnswers === 'object') {
      Object.entries(params.initialDraftAnswers).forEach(([qId, val]) => {
        if (typeof val === 'string' && val.trim().length > 0 && !mergedDrafts[qId]) {
          mergedDrafts[qId] = val;
        }
      });
    }

    const updated: ExamSessionRecord = {
      ...existing,
      draftAnswers: mergedDrafts,
      fullscreenSupported:
        params.fullscreenSupported !== undefined
          ? params.fullscreenSupported
          : existing.fullscreenSupported,
      lastSavedAt: nowIso,
    };

    runtimeCache.examSessions[key] = updated;

    try {
      await supabase.from('quiz_attempts').upsert(
        {
          id: key,
          quiz_id: params.quizId,
          quiz_title: quiz?.title || 'Kuis ATPH',
          student_id: params.studentId,
          student_name: params.studentName,
          started_at: updated.startedAt,
          completed_at: updated.deadlineAt,
          score: 0,
          max_score: 100,
          is_passed: false,
          answers: [{ ...updated, __session: true }],
          status: 'in_progress',
        },
        { onConflict: 'id' }
      );
    } catch (err) {
      console.warn('[RESUME_SESSION_SAVE_ERR]', err);
    }

    return { session: updated, resumed: true, isLocked: false };
  }

  // 3. Create fresh exam session and persist to Supabase
  const deadline = new Date(now.getTime() + durationMinutes * 60 * 1000);
  const created: ExamSessionRecord = {
    id: `sess-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
    quizId: params.quizId,
    studentId: params.studentId,
    studentName: params.studentName,
    studentNisn: params.studentNisn || '-',
    className: params.className || 'XI AT 1',
    status: 'in_progress',
    startedAt: nowIso,
    deadlineAt: deadline.toISOString(),
    lastSavedAt: nowIso,
    draftAnswers: params.initialDraftAnswers || {},
    violationCount: 0,
    violationEvents: [],
    fullscreenSupported: params.fullscreenSupported ?? true,
    autoSubmitted: false,
    needsReview: false,
    lockedAt: null,
    attemptId: null,
    resumedByTeacher: null,
  };

  runtimeCache.examSessions[key] = created;

  try {
    await supabase.from('quiz_attempts').upsert(
      {
        id: key,
        quiz_id: params.quizId,
        quiz_title: quiz?.title || 'Kuis ATPH',
        student_id: params.studentId,
        student_name: params.studentName,
        started_at: created.startedAt,
        completed_at: created.deadlineAt,
        score: 0,
        max_score: 100,
        is_passed: false,
        answers: [{ ...created, __session: true }],
        status: 'in_progress',
      },
      { onConflict: 'id' }
    );
  } catch (err) {
    console.error('[CREATE_SESSION_SAVE_ERR]', err);
  }

  return { session: created, resumed: false, isLocked: false };
}

/**
 * Autosave draft answers permanently to Supabase
 */
export async function autosaveExamSession(params: {
  quizId: string;
  studentId: string;
  studentName?: string;
  className?: string;
  draftAnswers: Record<string, string>;
}): Promise<{ session: ExamSessionRecord; saved: boolean; error?: string }> {
  const key = getExamSessionKey(params.quizId, params.studentId);
  let session = await getExamSession(params.quizId, params.studentId);

  if (!session) {
    const started = await startOrResumeExamSession({
      quizId: params.quizId,
      studentId: params.studentId,
      studentName: params.studentName || 'Siswa ATPH',
      className: params.className || 'XI AT 1',
      initialDraftAnswers: params.draftAnswers,
    });
    return { session: started.session, saved: true };
  }

  if (session.status !== 'in_progress') {
    return {
      session,
      saved: false,
      error: 'Sesi ujian telah dikunci atau dikumpulkan.',
    };
  }

  const nowIso = new Date().toISOString();
  const nextDrafts: Record<string, string> = {
    ...(session.draftAnswers || {}),
  };
  if (params.draftAnswers && typeof params.draftAnswers === 'object') {
    Object.entries(params.draftAnswers).forEach(([qId, val]) => {
      if (typeof val === 'string') {
        nextDrafts[qId] = val;
      }
    });
  }

  session = {
    ...session,
    draftAnswers: nextDrafts,
    lastSavedAt: nowIso,
  };

  runtimeCache.examSessions[key] = session;

  try {
    const supabase = getSupabase();
    const quiz = INITIAL_QUIZZES.find((q) => q.id === params.quizId);
    const { error } = await supabase.from('quiz_attempts').upsert(
      {
        id: key,
        quiz_id: params.quizId,
        quiz_title: quiz?.title || 'Kuis ATPH',
        student_id: params.studentId,
        student_name: params.studentName || session.studentName,
        started_at: session.startedAt,
        completed_at: session.deadlineAt,
        score: 0,
        max_score: 100,
        is_passed: false,
        answers: [{ ...session, __session: true }],
        status: 'in_progress',
      },
      { onConflict: 'id' }
    );

    if (error) {
      console.error('[AUTOSAVE_DB_ERR]', error);
      return { session, saved: false, error: error.message };
    }
  } catch (err: any) {
    console.error('[AUTOSAVE_CONN_ERR]', err);
    return { session, saved: false, error: err?.message || 'Gagal tersambung ke database' };
  }

  return { session, saved: true };
}

/**
 * Record exam violation event and handle coalescing & auto-submission
 */
export async function recordExamViolation(params: {
  quizId: string;
  studentId: string;
  event: Partial<ExamViolationEvent> & { type: ExamViolationEvent['type'] };
  draftAnswers?: Record<string, string>;
}): Promise<{
  session: ExamSessionRecord | null;
  recorded: boolean;
  coalesced: boolean;
  autoSubmitted: boolean;
  attempt?: any | null;
}> {
  const key = getExamSessionKey(params.quizId, params.studentId);
  const session = await getExamSession(params.quizId, params.studentId);

  if (!session || session.status !== 'in_progress') {
    return {
      session: session || null,
      recorded: false,
      coalesced: false,
      autoSubmitted: Boolean(session?.autoSubmitted),
      attempt: null,
    };
  }

  const settings = getQuizSettings(params.quizId);
  const config = settings.controlledExamConfig || DEFAULT_CONTROLLED_EXAM_CONFIG;
  if (!config.enabled) {
    return {
      session,
      recorded: false,
      coalesced: false,
      autoSubmitted: false,
      attempt: null,
    };
  }

  const nowIso = new Date().toISOString();
  const occurredAt = params.event.occurredAt || nowIso;
  const occurredTime = new Date(occurredAt).getTime();

  const mergedDrafts: Record<string, string> = {
    ...(session.draftAnswers || {}),
    ...(params.draftAnswers || {}),
  };

  const events = Array.isArray(session.violationEvents) ? [...session.violationEvents] : [];
  const lastEvent = events.length > 0 ? events[events.length - 1] : null;

  if (lastEvent) {
    const lastOccurredTime = new Date(lastEvent.occurredAt).getTime();
    const lastReturnedTime = lastEvent.returnedAt
      ? new Date(lastEvent.returnedAt).getTime()
      : lastOccurredTime;
    const isSameEpisodeId = Boolean(params.event.id && lastEvent.id === params.event.id);
    const isWithinCoalesceWindow =
      Math.abs(occurredTime - lastOccurredTime) <= 2500 ||
      Math.abs(occurredTime - lastReturnedTime) <= 2000;

    if (isSameEpisodeId || isWithinCoalesceWindow) {
      const mergedSignals = Array.from(
        new Set([
          ...(lastEvent.mergedSignals || [lastEvent.type]),
          ...(params.event.mergedSignals || [params.event.type]),
        ])
      );
      events[events.length - 1] = {
        ...lastEvent,
        returnedAt: params.event.returnedAt || lastEvent.returnedAt || nowIso,
        durationSeconds:
          params.event.durationSeconds !== undefined && params.event.durationSeconds !== null
            ? params.event.durationSeconds
            : lastEvent.durationSeconds,
        mergedSignals,
      };

      const updatedCoalesced: ExamSessionRecord = {
        ...session,
        draftAnswers: mergedDrafts,
        violationEvents: events,
        lastSavedAt: nowIso,
      };

      runtimeCache.examSessions[key] = updatedCoalesced;

      try {
        const supabase = getSupabase();
        await supabase.from('quiz_attempts').upsert(
          {
            id: key,
            quiz_id: params.quizId,
            quiz_title: 'Kuis ATPH',
            student_id: params.studentId,
            student_name: session.studentName,
            started_at: session.startedAt,
            completed_at: session.deadlineAt,
            score: 0,
            max_score: 100,
            is_passed: false,
            answers: [{ ...updatedCoalesced, __session: true }],
            status: 'in_progress',
          },
          { onConflict: 'id' }
        );
      } catch (err) {
        console.warn('[COALESCED_SAVE_ERR]', err);
      }

      return {
        session: updatedCoalesced,
        recorded: false,
        coalesced: true,
        autoSubmitted: false,
        attempt: null,
      };
    }
  }

  const labelMap: Record<ExamViolationEvent['type'], string> = {
    tab_hidden: 'Halaman kuis menjadi tersembunyi (pindah tab / minimalkan jendela)',
    fullscreen_exit: 'Keluar dari mode layar penuh (fullscreen)',
    extended_blur: 'Kehilangan fokus jendela ujian melebihi batas toleransi',
  };

  const newEvent: ExamViolationEvent = {
    id: params.event.id || `viol-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
    type: params.event.type,
    label: params.event.label || labelMap[params.event.type] || 'Perpindahan dari halaman ujian',
    occurredAt,
    returnedAt: params.event.returnedAt || nowIso,
    durationSeconds:
      params.event.durationSeconds !== undefined ? params.event.durationSeconds : null,
    mergedSignals: params.event.mergedSignals || [params.event.type],
  };

  events.push(newEvent);
  const nextViolationCount = events.length;
  const shouldAutoSubmit =
    config.violationAction === 'auto_submit' && nextViolationCount >= config.maxViolations;

  let autoAttempt: any | null = null;

  const updatedSession: ExamSessionRecord = {
    ...session,
    draftAnswers: mergedDrafts,
    violationCount: nextViolationCount,
    violationEvents: events,
    needsReview: true,
    autoSubmitted: shouldAutoSubmit,
    status: shouldAutoSubmit ? 'auto_submitted' : 'in_progress',
    lockedAt: shouldAutoSubmit ? nowIso : session.lockedAt,
    lastSavedAt: nowIso,
  };

  if (shouldAutoSubmit) {
    autoAttempt = buildEvaluatedAttemptFromAnswersMap({
      attemptId: session.attemptId || undefined,
      quizId: session.quizId,
      studentId: session.studentId,
      studentName: session.studentName,
      studentNisn: session.studentNisn,
      className: session.className,
      startedAt: session.startedAt,
      completedAt: nowIso,
      selectedAnswers: mergedDrafts,
      violationCount: nextViolationCount,
      violationEvents: events,
      autoSubmitted: true,
      resumedByTeacher: session.resumedByTeacher,
    });
    updatedSession.attemptId = autoAttempt.id;
  }

  runtimeCache.examSessions[key] = updatedSession;

  try {
    const supabase = getSupabase();
    await supabase.from('quiz_attempts').upsert(
      {
        id: key,
        quiz_id: params.quizId,
        quiz_title: 'Kuis ATPH',
        student_id: params.studentId,
        student_name: session.studentName,
        started_at: session.startedAt,
        completed_at: session.deadlineAt,
        score: 0,
        max_score: 100,
        is_passed: false,
        answers: [{ ...updatedSession, __session: true }],
        status: shouldAutoSubmit ? 'submitted' : 'in_progress',
      },
      { onConflict: 'id' }
    );

    if (autoAttempt) {
      await saveEvaluationAttempt(autoAttempt);
    }
  } catch (err) {
    console.error('[VIOLATION_RECORD_ERR]', err);
  }

  return {
    session: updatedSession,
    recorded: true,
    coalesced: false,
    autoSubmitted: shouldAutoSubmit,
    attempt: autoAttempt,
  };
}

/**
 * Teacher action: allow student to resume exam after review
 */
export async function allowStudentResumeExamSession(params: {
  quizId: string;
  studentId: string;
  teacherName: string;
  note?: string;
  extraMinutes?: number;
}): Promise<{ session: ExamSessionRecord | null; unlocked: boolean }> {
  const key = getExamSessionKey(params.quizId, params.studentId);
  let session = await getExamSession(params.quizId, params.studentId);

  const now = new Date();
  const nowIso = now.toISOString();
  const addMinutes = params.extraMinutes && params.extraMinutes > 0 ? params.extraMinutes : 20;

  if (!session) {
    const attempt = await getEvaluationAttemptById(`att-${params.quizId}-${params.studentId}`);
    if (!attempt) return { session: null, unlocked: false };

    const draftsFromAttempt: Record<string, string> = {};
    (attempt.answers || []).forEach((ans: QuizAnswer) => {
      if (ans.questionId && ans.userAnswer) {
        draftsFromAttempt[ans.questionId] = ans.userAnswer;
      }
    });

    session = {
      id: `sess-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
      quizId: params.quizId,
      studentId: params.studentId,
      studentName: attempt.studentName || 'Siswa ATPH',
      studentNisn: attempt.studentNisn || '-',
      className: attempt.className || 'XI AT 1',
      status: 'in_progress',
      startedAt: attempt.startedAt || nowIso,
      deadlineAt: new Date(now.getTime() + addMinutes * 60 * 1000).toISOString(),
      lastSavedAt: nowIso,
      draftAnswers: draftsFromAttempt,
      violationCount: attempt.violationCount || 0,
      violationEvents: attempt.violationEvents || [],
      fullscreenSupported: true,
      autoSubmitted: false,
      needsReview: true,
      lockedAt: null,
      attemptId: attempt.id,
      resumedByTeacher: {
        teacherName: params.teacherName,
        resumedAt: nowIso,
        note: params.note || 'Diizinkan melanjutkan ujian setelah peninjauan kendala teknis',
      },
    };
  } else {
    session = {
      ...session,
      status: 'in_progress',
      autoSubmitted: false,
      lockedAt: null,
      deadlineAt: new Date(now.getTime() + addMinutes * 60 * 1000).toISOString(),
      lastSavedAt: nowIso,
      resumedByTeacher: {
        teacherName: params.teacherName,
        resumedAt: nowIso,
        note: params.note || 'Diizinkan melanjutkan ujian setelah peninjauan kendala teknis',
      },
    };
  }

  runtimeCache.examSessions[key] = session;

  try {
    const supabase = getSupabase();
    await supabase.from('quiz_attempts').upsert(
      {
        id: key,
        quiz_id: params.quizId,
        quiz_title: 'Kuis ATPH',
        student_id: params.studentId,
        student_name: session.studentName,
        started_at: session.startedAt,
        completed_at: session.deadlineAt,
        score: 0,
        max_score: 100,
        is_passed: false,
        answers: [{ ...session, __session: true }],
        status: 'in_progress',
      },
      { onConflict: 'id' }
    );
  } catch (err) {
    console.error('[ALLOW_RESUME_SAVE_ERR]', err);
  }

  return { session, unlocked: true };
}

/**
 * Lock session when submission completes
 */
export async function completeExamSessionOnSubmit(params: {
  quizId: string;
  studentId: string;
  attemptId: string;
  finalDraftAnswers?: Record<string, string>;
}): Promise<ExamSessionRecord | null> {
  const key = getExamSessionKey(params.quizId, params.studentId);
  const existing = await getExamSession(params.quizId, params.studentId);
  const nowIso = new Date().toISOString();

  const updated: ExamSessionRecord = {
    id: existing?.id || `sess-${params.attemptId}`,
    quizId: params.quizId,
    studentId: params.studentId,
    studentName: existing?.studentName || 'Siswa ATPH',
    className: existing?.className || 'XI AT 1',
    status: existing?.autoSubmitted ? 'auto_submitted' : 'submitted',
    startedAt: existing?.startedAt || nowIso,
    deadlineAt: existing?.deadlineAt || nowIso,
    lastSavedAt: nowIso,
    attemptId: params.attemptId,
    draftAnswers: {
      ...(existing?.draftAnswers || {}),
      ...(params.finalDraftAnswers || {}),
    },
    violationCount: existing?.violationCount || 0,
    violationEvents: existing?.violationEvents || [],
    fullscreenSupported: existing?.fullscreenSupported ?? true,
    autoSubmitted: Boolean(existing?.autoSubmitted),
    needsReview: Boolean(existing?.needsReview),
    lockedAt: nowIso,
    resumedByTeacher: existing?.resumedByTeacher || null,
  };

  runtimeCache.examSessions[key] = updated;

  try {
    const supabase = getSupabase();
    await supabase.from('quiz_attempts').upsert(
      {
        id: key,
        quiz_id: params.quizId,
        quiz_title: 'Kuis ATPH',
        student_id: params.studentId,
        student_name: updated.studentName,
        started_at: updated.startedAt,
        completed_at: updated.deadlineAt,
        score: 0,
        max_score: 100,
        is_passed: false,
        answers: [{ ...updated, __session: true }],
        status: 'submitted',
      },
      { onConflict: 'id' }
    );
  } catch (err) {
    console.warn('[COMPLETE_SESSION_SAVE_ERR]', err);
  }

  return updated;
}
