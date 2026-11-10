import fs from 'fs';
import path from 'path';
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

const DATA_DIR = path.resolve(process.cwd(), '.data');
const STORE_PATH = path.join(DATA_DIR, 'quiz-evaluation-store.json');

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

interface LocalEvaluationStore {
  attempts: Record<string, any>;
  quizSettings: Record<string, QuizSettingsRecord>;
  examSessions: Record<string, ExamSessionRecord>;
}

/**
 * Parse authenticated session user from cookies (`edu_user_session` or `edu_student_session`)
 * or explicit x-edu-session header (validated against user directory / role rules).
 */
export function getServerSessionUser(req: NextRequest): ServerSessionUser | null {
  try {
    // 1. Check cookies first
    const userCookie = req.cookies.get('edu_user_session')?.value;
    const studentCookie = req.cookies.get('edu_student_session')?.value;

    // If a specific header is sent from client fetch to disambiguate active portal tab
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

    // 2. Check x-edu-session header (JSON encoded session from client DataProvider)
    const headerSession = req.headers.get('x-edu-session');
    if (headerSession) {
      const parsed = JSON.parse(decodeURIComponent(headerSession));
      if (parsed && parsed.id && parsed.role) {
        // Verify teacher/admin identity against known users or valid admin/teacher email pattern
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
    console.warn('Failed to parse server session user:', err);
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
      'Sistem NFT menggunakan aliran larutan nutrisi yang sangat tipis sekitar 1-3 mm pada talang miring 2-3% sehingga akar bagian atas mendapat oksigen langsung dari udara. Kelemahannya jika listrik mati maka akar cepat kering dan layu. Sedangkan sistem DFT menyisakan genangan air nutrisi sedalam 3-5 cm di dalam pipa karena ada penyekat di ujung outlet, sehingga saat mati lampu tanaman tetap aman tidak layu.',
    'q-hidro-xi-essay-2':
      'Stok A dan Stok B dipisah agar tidak terjadi pengendapan kimia saat masih pekat. Stok A berisi Kalsium Nitrat dan Besi (Fe), sedangkan Stok B berisi Magnesium Sulfat, Kalium Fosfat, dan unsur mikro. Kalau dicampur pekat langsung, ion Kalsium (Ca2+) akan bereaksi dengan Sulfat membentuk endapan gipsum (CaSO4) dan Kalsium Fosfat yang tidak larut. Cara mencampurnya: isi tandon dengan air bersih, masukkan Stok A lalu aduk rata, baru masukkan Stok B dan aduk kembali.',
    'q-hidro-xi-essay-3':
      'Rentang pH ideal hidroponik adalah 5,5 sampai 6,5 dan EC menunjukkan kepekatan hara terlarut. Jika pH naik di atas 7,0 (basa), maka unsur Besi (Fe), Mangan (Mn), dan Fosfor (P) akan mengendap sehingga daun muda menguning (klorosis). Cara menurunkannya adalah menambahkan larutan pH Down yaitu Asam Fosfat (H3PO4) sedikit demi sedikit sambil diukur pH meter.',
    'q-hidro-xi-essay-4':
      'Jika suhu larutan nutrisi naik di atas 30 derajat Celcius, kadar oksigen terlarut (DO) di dalam air akan turun drastis padahal respirasi akar meningkat. Akibatnya akar kekurangan oksigen dan mudah diserang jamur Pythium sp. yang menyebabkan busuk akar. Upaya pencegahannya: menaruh tandon di tempat teduh atau dipendam, melapisi tandon dengan aluminium foil, menggunakan pipa warna putih, dan memasang aerator.',
    'q-hidro-xi-essay-5':
      'Benih disemai di rockwool lembap, setelah pecah benih (sprout) harus langsung dikenakan sinar matahari pagi. Pindah tanam dilakukan saat bibit berumur 10-14 HSS dan punya 3-4 daun sejati. Bibit mengalami etiolasi (batang memanjang kurus pucat dan rebah) karena kekurangan cahaya matahari setelah berkecambah.',
    'q-hidro-xi-case-1':
      '1. Diagnosis: Akar cokelat berlendir disebabkan suhu air tandon 33°C yang menurunkan DO dan memicu serangan jamur Pythium sp. (busuk akar). Gejala tipburn pada daun muda disebabkan kekurangan Kalsium (Ca) di pucuk karena suhu udara 36°C menghambat transpirasi dan EC terlalu tinggi (2,4 mS/cm). Kenaikan EC terjadi karena tanaman menyerap banyak air saat panas terik.\n2. Penyelamatan: Tambahkan air baku bersih dingin untuk menurunkan EC ke 1,4 mS/cm, beri pH Down (asam fosfat) agar pH turun dari 7,4 ke 6,0, beri botol es dan aerator di tandon, serta nyalakan kipas exhaust greenhouse.\n3. Rekomendasi: Pindahkan tandon hitam ke tempat teduh dan lapisi insulasi, pasang paranet, serta cek pH dan EC rutin pagi dan sore.',
    'q-hidro-xi-case-2':
      '1. Reaksi kimia: Pencampuran 5 liter pekatan Stok A dan Stok B tanpa air menyebabkan kation Kalsium (Ca2+) bereaksi dengan Sulfat (SO4 2-) dan Fosfat (PO4 3-) membentuk endapan kristal putih Kalsium Sulfat (gipsum) dan Kalsium Fosfat.\n2. Penyebab masalah: Endapan padat tersebut menyumbat lubang dripper/emitter sehingga tanaman melon layu, serta membuat unsur Ca, Fe, dan P hilang mengendap sehingga daun muda mengalami klorosis interveinal dan pucuk kerdil.\n3. Solusi & SOP: Kuras habis tandon, bilas (flushing) pipa dan emitter dengan air asam lemah. SOP untuk 1.000 L: isi tandon dengan air bersih dulu, tuang 5 L Stok A dan aduk rata, lalu tuang 5 L Stok B dan aduk rata, baru ukur EC dan pH.',
  };

  // Answer 8 out of 10 MCQs correctly -> mcqCorrectCount = 8 -> mcqScore = (8 / 10) * 100 = 80
  let correctCount = 0;
  const answers: QuizAnswer[] = questions.map((q, idx) => {
    if (q.questionType === 'multiple_choice') {
      // First 8 MCQ correct, last 2 wrong so 8 / 10 * 100 = 80
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
      teacherScore: null, // "Belum dinilai"
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
    status: 'pending_grading',
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

function readLocalStore(): LocalEvaluationStore {
  try {
    if (!fs.existsSync(DATA_DIR)) {
      fs.mkdirSync(DATA_DIR, { recursive: true });
    }
    if (fs.existsSync(STORE_PATH)) {
      const raw = fs.readFileSync(STORE_PATH, 'utf8');
      const parsed = JSON.parse(raw);
      if (parsed && typeof parsed === 'object') {
        if (!parsed.attempts) parsed.attempts = {};
        if (!parsed.quizSettings) parsed.quizSettings = {};
        if (!parsed.examSessions) parsed.examSessions = {};
        if (!parsed.attempts['att-dimas-hidroponik-xi']) {
          parsed.attempts['att-dimas-hidroponik-xi'] = createInitialDimasHidroponikAttempt();
        } else {
          // Ensure existing sample attempt aligns with 10 PG + 5 Essay + 2 Case Study (17 questions)
          const existingDimas = parsed.attempts['att-dimas-hidroponik-xi'];
          const validIds = new Set(
            INITIAL_QUIZ_QUESTIONS.filter((q) => q.quizId === 'quiz-hidroponik-xi').map((q) => q.id)
          );
          if (
            existingDimas.mcqTotalCount === 20 ||
            (Array.isArray(existingDimas.answers) && existingDimas.answers.length > 17)
          ) {
            existingDimas.answers = (existingDimas.answers || []).filter((a: any) =>
              validIds.has(a.questionId)
            );
            existingDimas.mcqTotalCount = 10;
            existingDimas.totalQuestions = 17;
            existingDimas.wrongCount = Math.max(0, 10 - (existingDimas.mcqCorrectCount || 8));
          }
          if (existingDimas.violationCount === undefined) {
            existingDimas.violationCount = 1;
            existingDimas.needsReview = true;
            existingDimas.examSessionStatus = 'submitted';
            existingDimas.violationEvents = [
              {
                id: 'viol-sample-dimas-1',
                type: 'tab_hidden',
                label: 'Halaman kuis tidak terlihat (berpindah tab / jendela tersembunyi)',
                occurredAt: '2026-11-10T07:48:12Z',
                returnedAt: '2026-11-10T07:48:19Z',
                durationSeconds: 7,
                mergedSignals: ['visibilitychange:hidden', 'window:blur'],
              },
            ];
          }
        }
        return parsed;
      }
    }
  } catch (err) {
    console.warn('Failed reading local evaluation store:', err);
  }

  const initial: LocalEvaluationStore = {
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
  writeLocalStore(initial);
  return initial;
}

function writeLocalStore(store: LocalEvaluationStore): void {
  try {
    if (!fs.existsSync(DATA_DIR)) {
      fs.mkdirSync(DATA_DIR, { recursive: true });
    }
    fs.writeFileSync(STORE_PATH, JSON.stringify(store, null, 2), 'utf8');
  } catch (err) {
    console.warn('Failed writing local evaluation store:', err);
  }
}

export function getQuizSettings(quizId: string): QuizSettingsRecord {
  const store = readLocalStore();
  if (store.quizSettings[quizId]) {
    const existing = store.quizSettings[quizId];
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

export function updateQuizSettings(
  quizId: string,
  updates: Partial<QuizSettingsRecord>
): QuizSettingsRecord {
  const store = readLocalStore();
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
  store.quizSettings[quizId] = next;
  writeLocalStore(store);
  return next;
}

/**
 * Compute MCQ score, Essay average, Case Study average, and Final Weighted Score.
 * Strictly follows user specifications:
 * - MCQ score = min(100, (correctCount / 10) * 100)
 * - Unchecked essay/case_study answers have teacherScore === null ("Belum dinilai") and are NEVER treated as 0.
 * - If any essay or case_study answer has teacherScore === null, gradingStatus = 'incomplete' ("Penilaian belum lengkap") and finalWeightedScore = null.
 */
export function calculateWeightedEvaluation(
  answers: QuizAnswer[],
  weightsConfig: QuizWeightsConfig = { mcqWeight: 30, essayWeight: 40, caseStudyWeight: 30 },
  passingScore: number = 75
) {
  const mcqAnswers = answers.filter(
    (a) => !a.questionType || a.questionType === 'multiple_choice' || a.questionType === 'true_false'
  );
  const essayAnswers = answers.filter((a) => a.questionType === 'essay');
  const caseStudyAnswers = answers.filter((a) => a.questionType === 'case_study');

  const mcqCorrectCount = mcqAnswers.filter((a) => a.isCorrect).length;
  const mcqTotalCount = mcqAnswers.length;

  // Rumus sesuai instruksi: Nilai pilihan ganda = jumlah jawaban benar ÷ 10 × 100 (dibatasi 0-100)
  const rawMcqFormula = (mcqCorrectCount / 10) * 100;
  const mcqScore = Math.max(0, Math.min(100, Math.round(rawMcqFormula * 100) / 100));

  const hasSubjectiveQuestions = essayAnswers.length > 0 || caseStudyAnswers.length > 0;

  if (!hasSubjectiveQuestions) {
    const pct = mcqTotalCount > 0 ? Math.round((mcqCorrectCount / mcqTotalCount) * 100) : 0;
    return {
      mcqCorrectCount,
      mcqTotalCount,
      mcqScore: pct,
      rawMcqFormula: pct,
      essayAverageScore: null,
      caseStudyAverageScore: null,
      finalWeightedScore: pct,
      isComplete: true,
      ungradedCount: 0,
      gradingStatus: 'graded' as const,
      isPassed: pct >= passingScore,
    };
  }

  const ungradedEssays = essayAnswers.filter(
    (a) => a.teacherScore === null || a.teacherScore === undefined || Number.isNaN(Number(a.teacherScore))
  );
  const ungradedCases = caseStudyAnswers.filter(
    (a) => a.teacherScore === null || a.teacherScore === undefined || Number.isNaN(Number(a.teacherScore))
  );

  const ungradedCount = ungradedEssays.length + ungradedCases.length;
  const isComplete = ungradedCount === 0;

  const essayAverageScore =
    essayAnswers.length > 0 && ungradedEssays.length === 0
      ? Math.round(
          (essayAnswers.reduce((sum, a) => sum + Number(a.teacherScore || 0), 0) /
            essayAnswers.length) *
            100
        ) / 100
      : null;

  const caseStudyAverageScore =
    caseStudyAnswers.length > 0 && ungradedCases.length === 0
      ? Math.round(
          (caseStudyAnswers.reduce((sum, a) => sum + Number(a.teacherScore || 0), 0) /
            caseStudyAnswers.length) *
            100
        ) / 100
      : null;

  let finalWeightedScore: number | null = null;
  if (isComplete) {
    const wMcq = Number(weightsConfig.mcqWeight ?? 30) / 100;
    const wEssay = Number(weightsConfig.essayWeight ?? 40) / 100;
    const wCase = Number(weightsConfig.caseStudyWeight ?? 30) / 100;

    const total =
      mcqScore * wMcq +
      (essayAverageScore ?? 0) * wEssay +
      (caseStudyAverageScore ?? 0) * wCase;

    finalWeightedScore = Math.max(0, Math.min(100, Math.round(total * 100) / 100));
  }

  return {
    mcqCorrectCount,
    mcqTotalCount,
    mcqScore,
    rawMcqFormula: Math.round(rawMcqFormula * 100) / 100,
    essayAverageScore,
    caseStudyAverageScore,
    finalWeightedScore,
    isComplete,
    ungradedCount,
    gradingStatus: isComplete ? ('complete' as const) : ('incomplete' as const),
    isPassed: finalWeightedScore !== null ? finalWeightedScore >= passingScore : false,
  };
}

/**
 * Strip answer keys, rubrics, and explanations from an attempt or question list
 * when accessed by a student before authorization.
 */
export function sanitizeQuestionsForStudent(
  questions: QuizQuestion[],
  allowReview: boolean
): Partial<QuizQuestion>[] {
  return questions.map((q) => {
    if (allowReview) {
      return q;
    }
    return {
      id: q.id,
      quizId: q.quizId,
      questionText: q.questionText,
      questionType: q.questionType,
      caseStudyContext: q.caseStudyContext,
      options: q.options,
      points: q.points,
      orderIndex: q.orderIndex,
      // Explicitly omit correctAnswer, explanation, and rubric!
    };
  });
}

export function sanitizeAttemptForStudent(attempt: any, quizSettings?: QuizSettingsRecord): any {
  const isPublished = Boolean(attempt.isPublished);
  const allowReview = Boolean(
    isPublished &&
      (attempt.allowStudentReview || quizSettings?.allowStudentReview || quizSettings?.isClosed)
  );

  const sanitizedAnswers = (attempt.answers || []).map((ans: QuizAnswer) => {
    const base: any = {
      questionId: ans.questionId,
      questionType: ans.questionType,
      questionText: ans.questionText,
      userAnswer: ans.userAnswer,
    };

    if (ans.questionType === 'multiple_choice' || ans.questionType === 'true_false' || !ans.questionType) {
      base.isCorrect = ans.isCorrect;
      base.pointsAwarded = ans.pointsAwarded;
    }

    if (isPublished) {
      base.teacherScore = ans.teacherScore ?? null;
      base.teacherNote = ans.teacherNote ?? null;
      base.aiReasoning = ans.aiReasoning ?? null;
      base.aiImprovement = ans.aiImprovement ?? null;
    } else {
      // Hide un-published draft scores from students
      base.teacherScore = null;
      base.teacherNote = null;
    }

    if (allowReview) {
      base.correctAnswer = ans.correctAnswer;
      base.explanation = ans.explanation;
    }

    return base;
  });

  return {
    ...attempt,
    score: isPublished && attempt.finalWeightedScore !== null && attempt.finalWeightedScore !== undefined
      ? attempt.finalWeightedScore
      : attempt.mcqScore ?? attempt.score,
    percentage: isPublished && attempt.finalWeightedScore !== null && attempt.finalWeightedScore !== undefined
      ? attempt.finalWeightedScore
      : attempt.mcqScore ?? attempt.percentage,
    essayAverageScore: isPublished ? attempt.essayAverageScore : null,
    caseStudyAverageScore: isPublished ? attempt.caseStudyAverageScore : null,
    finalWeightedScore: isPublished ? attempt.finalWeightedScore : null,
    teacherNotes: isPublished ? attempt.teacherNotes : null,
    allowStudentReview: allowReview,
    answers: sanitizedAnswers,
  };
}

/**
 * Save or update an attempt in both Local Server Store AND Supabase `quiz_attempts`.
 */
export async function saveEvaluationAttempt(attempt: any): Promise<{
  savedLocal: boolean;
  savedSupabase: boolean;
  supabaseError?: string | null;
}> {
  const store = readLocalStore();
  store.attempts[attempt.id] = attempt;
  writeLocalStore(store);

  let savedSupabase = false;
  let supabaseError: string | null = null;

  try {
    const supabase = createClient(SUPABASE_URL, SUPABASE_KEY, {
      auth: { persistSession: false },
    });

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
        status: attempt.isPublished ? 'graded' : attempt.gradingStatus || 'pending_grading',
      },
      { onConflict: 'id' }
    );

    if (error) {
      supabaseError = error.message;
    } else {
      savedSupabase = true;
    }
  } catch (err: any) {
    supabaseError = err?.message || 'Koneksi Supabase tidak tersedia';
  }

  return { savedLocal: true, savedSupabase, supabaseError };
}

function hydrateRowFromSupabase(row: any): any {
  let answersList: QuizAnswer[] = [];
  let meta: any = {};

  if (Array.isArray(row.answers)) {
    const first = row.answers[0];
    if (first && first.__meta) {
      meta = first;
      answersList = row.answers.slice(1);
    } else {
      answersList = row.answers;
    }
  }

  const weightsConfig = meta.weightsConfig ||
    row.weights_config || { mcqWeight: 30, essayWeight: 40, caseStudyWeight: 30 };

  const calc = calculateWeightedEvaluation(answersList, weightsConfig, 75);

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
    isPublished: meta.isPublished !== undefined ? Boolean(meta.isPublished) : Boolean(row.is_published),
    publishedAt: meta.publishedAt || row.published_at || null,
    publishedBy: meta.publishedBy || row.published_by || null,
    allowStudentReview: Boolean(meta.allowStudentReview ?? row.allow_student_review),
    teacherNotes: meta.teacherNotes ?? row.teacher_notes ?? null,
    gradedBy: meta.gradedBy ?? row.graded_by ?? null,
    gradedAt: meta.gradedAt ?? row.graded_at ?? null,
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
    status: row.status || 'graded',
    violationCount: meta.violationCount ?? 0,
    violationEvents: Array.isArray(meta.violationEvents) ? meta.violationEvents : [],
    autoSubmitted: Boolean(meta.autoSubmitted),
    needsReview: Boolean(meta.needsReview ?? (meta.violationCount > 0 || meta.autoSubmitted)),
    examSessionStatus: meta.examSessionStatus || 'submitted',
    resumedByTeacher: meta.resumedByTeacher || null,
    answers: answersList,
  };
}

export async function getEvaluationAttemptById(attemptId: string): Promise<any | null> {
  const store = readLocalStore();
  const localAttempt = store.attempts[attemptId];

  try {
    const supabase = createClient(SUPABASE_URL, SUPABASE_KEY, {
      auth: { persistSession: false },
    });
    const { data, error } = await supabase
      .from('quiz_attempts')
      .select('*')
      .eq('id', attemptId)
      .single();

    if (!error && data) {
      const remoteAttempt = hydrateRowFromSupabase(data);
      // Merge with local if local has newer gradedAt
      if (
        localAttempt &&
        localAttempt.gradedAt &&
        (!remoteAttempt.gradedAt ||
          new Date(localAttempt.gradedAt).getTime() >= new Date(remoteAttempt.gradedAt).getTime())
      ) {
        return localAttempt;
      }
      store.attempts[attemptId] = remoteAttempt;
      writeLocalStore(store);
      return remoteAttempt;
    }
  } catch {}

  return localAttempt || null;
}

export async function listEvaluationAttempts(filters?: {
  quizId?: string | null;
  studentId?: string | null;
}): Promise<any[]> {
  const store = readLocalStore();
  const mergedMap = new Map<string, any>();

  // 1. Load from local store first
  Object.values(store.attempts).forEach((att: any) => {
    mergedMap.set(att.id, att);
  });

  // 2. Try loading from Supabase and merging
  try {
    const supabase = createClient(SUPABASE_URL, SUPABASE_KEY, {
      auth: { persistSession: false },
    });
    let query = supabase
      .from('quiz_attempts')
      .select('*')
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
        const remote = hydrateRowFromSupabase(row);
        const existingLocal = mergedMap.get(remote.id);
        if (existingLocal) {
          // Prefer whichever was updated/graded more recently, or has AI/teacher grading
          const localTime = new Date(
            existingLocal.gradedAt || existingLocal.completedAt || 0
          ).getTime();
          const remoteTime = new Date(remote.gradedAt || remote.completedAt || 0).getTime();
          const localHasGrades = (existingLocal.answers || []).some(
            (a: any) => a.teacherScore !== null && a.teacherScore !== undefined
          );
          const remoteHasGrades = (remote.answers || []).some(
            (a: any) => a.teacherScore !== null && a.teacherScore !== undefined
          );

          if (localHasGrades && !remoteHasGrades) {
            mergedMap.set(remote.id, existingLocal);
          } else if (localTime > remoteTime) {
            mergedMap.set(remote.id, existingLocal);
          } else {
            mergedMap.set(remote.id, remote);
          }
        } else {
          mergedMap.set(remote.id, remote);
        }
      });
    }
  } catch {}

  let list = Array.from(mergedMap.values());
  if (filters?.quizId) {
    list = list.filter((a) => a.quizId === filters.quizId);
  }
  if (filters?.studentId) {
    list = list.filter((a) => a.studentId === filters.studentId);
  }

  return list.sort(
    (a, b) =>
      new Date(b.completedAt || b.startedAt || 0).getTime() -
      new Date(a.completedAt || a.startedAt || 0).getTime()
  );
}

/**
 * ============================================================================
 * CONTROLLED EXAM MODE SESSION & MONITORING STORE
 * ============================================================================
 */
export function getExamSessionKey(quizId: string, studentId: string): string {
  return `${quizId}__${studentId}`;
}

export function getExamSession(quizId: string, studentId: string): ExamSessionRecord | null {
  const store = readLocalStore();
  const key = getExamSessionKey(quizId, studentId);
  return store.examSessions[key] || null;
}

export function listExamSessions(filters?: {
  quizId?: string | null;
  studentId?: string | null;
}): ExamSessionRecord[] {
  const store = readLocalStore();
  let sessions = Object.values(store.examSessions || {});
  if (filters?.quizId) {
    sessions = sessions.filter((s) => s.quizId === filters.quizId);
  }
  if (filters?.studentId) {
    sessions = sessions.filter((s) => s.studentId === filters.studentId);
  }
  return sessions.sort(
    (a, b) => new Date(b.lastSavedAt || b.startedAt).getTime() - new Date(a.lastSavedAt || a.startedAt).getTime()
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
      teacherScore: null, // Never auto-zero ungraded essays/case studies!
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
    status: !hasSubjective ? 'graded' : 'pending_grading',
    violationCount: vCount,
    violationEvents: params.violationEvents || [],
    autoSubmitted: isAuto,
    needsReview: vCount > 0 || isAuto,
    examSessionStatus: isAuto ? 'auto_submitted' : 'submitted',
    resumedByTeacher: params.resumedByTeacher || null,
    answers: evaluatedAnswers,
  };
}

export function startOrResumeExamSession(params: {
  quizId: string;
  studentId: string;
  studentName: string;
  studentNisn?: string;
  className: string;
  fullscreenSupported?: boolean;
  initialDraftAnswers?: Record<string, string>;
}): { session: ExamSessionRecord; resumed: boolean; isLocked: boolean } {
  const store = readLocalStore();
  const key = getExamSessionKey(params.quizId, params.studentId);
  const existing = store.examSessions[key];
  const quiz = INITIAL_QUIZZES.find((q) => q.id === params.quizId);
  const durationMinutes = quiz?.durationMinutes || 60;
  const now = new Date();
  const nowIso = now.toISOString();

  if (existing) {
    // If session is locked (submitted or auto_submitted) and was not unlocked by teacher
    if (existing.status === 'auto_submitted' || existing.status === 'submitted') {
      return { session: existing, resumed: true, isLocked: true };
    }

    // Active in_progress session: merge any offline initialDraftAnswers without losing server answers
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
    store.examSessions[key] = updated;
    writeLocalStore(store);
    return { session: updated, resumed: true, isLocked: false };
  }

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

  store.examSessions[key] = created;
  writeLocalStore(store);
  return { session: created, resumed: false, isLocked: false };
}

export function autosaveExamSession(params: {
  quizId: string;
  studentId: string;
  studentName?: string;
  className?: string;
  draftAnswers: Record<string, string>;
}): { session: ExamSessionRecord; saved: boolean; error?: string } {
  const store = readLocalStore();
  const key = getExamSessionKey(params.quizId, params.studentId);
  let session = store.examSessions[key];

  if (!session) {
    const started = startOrResumeExamSession({
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
  store.examSessions[key] = session;
  writeLocalStore(store);
  return { session, saved: true };
}

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
  const store = readLocalStore();
  const key = getExamSessionKey(params.quizId, params.studentId);
  const session = store.examSessions[key];

  // Do NOT record violations if session has not started or has already ended!
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

  // Merge latest draftAnswers if sent along with violation report
  const mergedDrafts: Record<string, string> = {
    ...(session.draftAnswers || {}),
    ...(params.draftAnswers || {}),
  };

  const events = Array.isArray(session.violationEvents) ? [...session.violationEvents] : [];
  const lastEvent = events.length > 0 ? events[events.length - 1] : null;

  // Check if this event should be coalesced into the previous event:
  // 1. Same event ID (e.g. episode opened on hidden, updated with duration on return)
  // 2. Occurred within 2500ms of the previous event's occurredAt or returnedAt
  if (lastEvent) {
    const lastOccurredTime = new Date(lastEvent.occurredAt).getTime();
    const lastReturnedTime = lastEvent.returnedAt ? new Date(lastEvent.returnedAt).getTime() : lastOccurredTime;
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
      store.examSessions[key] = updatedCoalesced;
      writeLocalStore(store);

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
    store.attempts[autoAttempt.id] = autoAttempt;
  }

  store.examSessions[key] = updatedSession;
  writeLocalStore(store);

  if (autoAttempt) {
    await saveEvaluationAttempt(autoAttempt);
  }

  return {
    session: updatedSession,
    recorded: true,
    coalesced: false,
    autoSubmitted: shouldAutoSubmit,
    attempt: autoAttempt,
  };
}

export async function allowStudentResumeExamSession(params: {
  quizId: string;
  studentId: string;
  teacherName: string;
  note?: string;
  extraMinutes?: number;
}): Promise<{ session: ExamSessionRecord | null; unlocked: boolean }> {
  const store = readLocalStore();
  const key = getExamSessionKey(params.quizId, params.studentId);
  let session = store.examSessions[key];

  const now = new Date();
  const nowIso = now.toISOString();
  const addMinutes = params.extraMinutes && params.extraMinutes > 0 ? params.extraMinutes : 20;

  if (!session) {
    // Check if there is an existing attempt for this student & quiz so we can create a resumed session from it
    const existingAttempt = Object.values(store.attempts).find(
      (a: any) => a.quizId === params.quizId && a.studentId === params.studentId
    ) as any;

    if (!existingAttempt) {
      return { session: null, unlocked: false };
    }

    const draftsFromAttempt: Record<string, string> = {};
    (existingAttempt.answers || []).forEach((ans: QuizAnswer) => {
      if (ans.questionId && ans.userAnswer) {
        draftsFromAttempt[ans.questionId] = ans.userAnswer;
      }
    });

    session = {
      id: `sess-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
      quizId: params.quizId,
      studentId: params.studentId,
      studentName: existingAttempt.studentName || 'Siswa ATPH',
      studentNisn: existingAttempt.studentNisn || '-',
      className: existingAttempt.className || 'XI AT 1',
      status: 'in_progress',
      startedAt: existingAttempt.startedAt || nowIso,
      deadlineAt: new Date(now.getTime() + addMinutes * 60 * 1000).toISOString(),
      lastSavedAt: nowIso,
      draftAnswers: draftsFromAttempt,
      violationCount: existingAttempt.violationCount || 0,
      violationEvents: existingAttempt.violationEvents || [],
      fullscreenSupported: true,
      autoSubmitted: false,
      needsReview: true,
      lockedAt: null,
      attemptId: existingAttempt.id,
      resumedByTeacher: {
        teacherName: params.teacherName,
        resumedAt: nowIso,
        note: params.note || 'Diizinkan melanjutkan ujian setelah peninjauan kendala teknis',
      },
    };

    existingAttempt.examSessionStatus = 'resumed';
    existingAttempt.resumedByTeacher = session.resumedByTeacher;
    store.attempts[existingAttempt.id] = existingAttempt;
    store.examSessions[key] = session;
    writeLocalStore(store);
    await saveEvaluationAttempt(existingAttempt);
    return { session, unlocked: true };
  }

  const currentDeadline = new Date(session.deadlineAt).getTime();
  const nextDeadline =
    currentDeadline > now.getTime() + 5 * 60 * 1000
      ? session.deadlineAt
      : new Date(now.getTime() + addMinutes * 60 * 1000).toISOString();

  const resumedInfo = {
    teacherName: params.teacherName,
    resumedAt: nowIso,
    note: params.note || 'Diizinkan melanjutkan ujian setelah peninjauan kendala teknis',
  };

  const unlockedSession: ExamSessionRecord = {
    ...session,
    status: 'in_progress',
    autoSubmitted: false,
    lockedAt: null,
    deadlineAt: nextDeadline,
    lastSavedAt: nowIso,
    resumedByTeacher: resumedInfo,
  };

  store.examSessions[key] = unlockedSession;

  if (session.attemptId && store.attempts[session.attemptId]) {
    store.attempts[session.attemptId].examSessionStatus = 'resumed';
    store.attempts[session.attemptId].autoSubmitted = false;
    store.attempts[session.attemptId].resumedByTeacher = resumedInfo;
  }

  writeLocalStore(store);
  return { session: unlockedSession, unlocked: true };
}

export function completeExamSessionOnSubmit(params: {
  quizId: string;
  studentId: string;
  attemptId: string;
  finalDraftAnswers?: Record<string, string>;
}): ExamSessionRecord | null {
  const store = readLocalStore();
  const key = getExamSessionKey(params.quizId, params.studentId);
  const existing = store.examSessions[key];
  if (!existing) return null;

  const nowIso = new Date().toISOString();
  const updated: ExamSessionRecord = {
    ...existing,
    status: existing.autoSubmitted ? 'auto_submitted' : 'submitted',
    lockedAt: existing.lockedAt || nowIso,
    lastSavedAt: nowIso,
    attemptId: params.attemptId,
    draftAnswers: {
      ...(existing.draftAnswers || {}),
      ...(params.finalDraftAnswers || {}),
    },
  };
  store.examSessions[key] = updated;
  writeLocalStore(store);
  return updated;
}



