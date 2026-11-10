export type UserRole = 'admin' | 'teacher' | 'student';

export interface UserProfile {
  id: string;
  email: string;
  fullName: string;
  role: UserRole;
  nip?: string;
  nisn?: string;
  classId?: string;
  className?: string;
  major?: string;
  subjectName?: string;
  assignedClasses?: string[];
  avatarUrl?: string;
  isActive: boolean;
  createdAt: string;
}

export interface ClassItem {
  id: string;
  name: string; // e.g. "X ATPH", "XI ATPH", "XII ATPH"
  gradeLevel: 'X' | 'XI' | 'XII';
  description: string;
  academicYear: string;
  studentCount?: number;
  createdAt: string;
}

export interface MaterialCategory {
  id: string;
  name: string;
  slug: string;
  description: string;
  iconName: string;
  orderIndex: number;
}

export interface MaterialAttachment {
  id: string;
  name: string;
  fileUrl: string;
  fileSize: string;
  fileType: 'pdf' | 'doc' | 'sheet' | 'slide' | 'image' | 'video' | 'archive' | 'other';
}

export interface TeachingMaterial {
  id: string;
  title: string;
  slug: string;
  description: string;
  categoryId: string;
  categoryName?: string;
  targetClassId: string; // "all" or specific classId
  targetClassName?: string;
  topic: string;
  learningObjectives: string[];
  content: string; // rich markdown / HTML
  imageUrl?: string;
  videoUrl?: string; // YouTube embed link
  pdfUrl?: string;
  attachments: MaterialAttachment[];
  orderIndex: number;
  status: 'published' | 'draft' | 'archived';
  createdAt: string;
  updatedAt: string;
}

export interface LearningProgress {
  id: string;
  studentId: string;
  materialId: string;
  completed: boolean;
  lastAccessedAt: string;
  completedAt?: string;
}

export interface Assignment {
  id: string;
  title: string;
  description: string;
  instructions: string;
  targetClassId: string; // "all" or specific classId
  targetClassName?: string;
  topic: string;
  startDate: string;
  dueDate: string;
  submissionType: 'text_and_file' | 'file_only' | 'text_only';
  points: number;
  rubricCriteria: { criteria: string; weight: number; description: string }[];
  attachmentUrl?: string;
  attachmentName?: string;
  status: 'published' | 'draft' | 'closed';
  createdAt: string;
}

export type SubmissionStatus = 'belum_dikerjakan' | 'draft' | 'sudah_dikumpulkan' | 'terlambat' | 'sudah_dinilai';

export interface SubmissionAttachment {
  id: string;
  name: string;
  fileUrl: string;
  fileSize: string;
  fileType: 'pdf' | 'doc' | 'sheet' | 'slide' | 'image' | 'archive' | 'video' | 'other';
}

export interface Submission {
  id: string;
  assignmentId: string;
  assignmentTitle?: string;
  studentId: string;
  studentName?: string;
  studentEmail?: string;
  studentNisn?: string;
  classId?: string;
  className?: string;
  textContent?: string;
  fileUrl?: string;
  fileName?: string;
  fileSize?: string;
  fileType?: string;
  attachments?: SubmissionAttachment[];
  submittedAt: string;
  status: SubmissionStatus;
  grade?: number; // 0 - 100
  feedback?: string;
  gradedAt?: string;
  gradedBy?: string;
}

export type QuestionType = 'multiple_choice' | 'true_false' | 'short_answer' | 'essay' | 'case_study';

export interface QuizOption {
  id: string;
  text: string;
}

export interface QuestionRubric {
  conceptAccuracy: string; // 0 - 40
  completeness: string;    // 0 - 30
  reasoning: string;       // 0 - 20
  clarity: string;         // 0 - 10
  keyPoints?: string[];
}

export interface RubricBreakdown {
  conceptAccuracy: number; // 0 - 40
  completeness: number;    // 0 - 30
  reasoning: number;       // 0 - 20
  clarity: number;         // 0 - 10
}

export interface QuizWeightsConfig {
  mcqWeight: number;       // default 30
  essayWeight: number;     // default 40
  caseStudyWeight: number; // default 30
}

export interface ControlledExamConfig {
  enabled: boolean; // default true
  requireFullscreen: boolean; // default true if device supports it
  maxViolations: number; // default 3
  violationAction: 'warn_only' | 'auto_submit'; // default 'warn_only'
}

export interface ExamViolationEvent {
  id: string;
  type: 'tab_hidden' | 'fullscreen_exit' | 'extended_blur';
  label: string;
  occurredAt: string;
  returnedAt?: string;
  durationSeconds?: number | null;
  mergedSignals?: string[];
}

export interface ExamSessionRecord {
  id: string;
  quizId: string;
  studentId: string;
  studentName: string;
  studentNisn?: string;
  className: string;
  status: 'in_progress' | 'submitted' | 'auto_submitted';
  startedAt: string;
  deadlineAt: string;
  lastSavedAt: string;
  draftAnswers: Record<string, string>;
  violationCount: number;
  violationEvents: ExamViolationEvent[];
  fullscreenSupported?: boolean;
  autoSubmitted?: boolean;
  needsReview?: boolean;
  lockedAt?: string | null;
  attemptId?: string | null;
  resumedByTeacher?: {
    teacherName: string;
    resumedAt: string;
    note?: string;
  } | null;
}

export interface QuizQuestion {
  id: string;
  quizId: string;
  questionText: string;
  questionType: QuestionType;
  caseStudyContext?: string;
  options?: QuizOption[];
  correctAnswer?: string; // For MCQ/TF it's option ID or "true"/"false", for essay/case_study it's ideal answer key (stripped for students until authorized)
  explanation?: string;
  rubric?: QuestionRubric;
  points: number;
  orderIndex: number;
}

export interface Quiz {
  id: string;
  title: string;
  description: string;
  targetClassId: string; // "all" or specific classId
  targetClassName?: string;
  topic: string;
  materialId?: string;
  pdfUrl?: string;
  durationMinutes: number; // e.g. 30 minutes, 0 for unlimited
  maxAttempts: number;
  passingScore: number;
  isPublished: boolean;
  isClosed?: boolean;
  allowStudentReview?: boolean;
  weightsConfig?: QuizWeightsConfig;
  controlledExamConfig?: ControlledExamConfig;
  questionCount?: number;
  createdAt: string;
}

export interface QuizAnswer {
  questionId: string;
  questionType?: QuestionType;
  questionText?: string;
  userAnswer: string;
  correctAnswer?: string;
  explanation?: string;
  isCorrect?: boolean;
  pointsAwarded?: number;
  // AI Grading fields (stored separately from teacher score)
  aiScore?: number | null;
  aiRubricBreakdown?: RubricBreakdown | null;
  aiReasoning?: string | null;
  aiImprovement?: string | null;
  aiGradedAt?: string | null;
  // Teacher Grading fields (stored separately from AI score)
  teacherScore?: number | null; // null = "Belum dinilai"
  teacherNote?: string | null;
  gradedBy?: string | null;
  gradedAt?: string | null;
}

export type QuizGradingStatus = 'pending_grading' | 'incomplete' | 'complete' | 'graded';

export interface QuizAttempt {
  id: string;
  quizId: string;
  quizTitle?: string;
  studentId: string;
  studentName?: string;
  studentNisn?: string;
  className?: string;
  startedAt: string;
  completedAt?: string;
  answers: QuizAnswer[];
  score: number;
  maxScore: number;
  percentage: number;
  passed: boolean;
  attemptNumber: number;
  // Extended evaluation & weighted grading fields
  mcqCorrectCount?: number;
  mcqTotalCount?: number;
  mcqScore?: number; // Jumlah jawaban benar ÷ 10 × 100
  essayAverageScore?: number | null;
  caseStudyAverageScore?: number | null;
  finalWeightedScore?: number | null;
  weightsConfig?: QuizWeightsConfig;
  gradingStatus?: QuizGradingStatus;
  isPublished?: boolean;
  publishedAt?: string | null;
  publishedBy?: string | null;
  allowStudentReview?: boolean;
  teacherNotes?: string | null;
  gradedBy?: string | null;
  gradedAt?: string | null;
  // Controlled Exam Mode tracking fields
  violationCount?: number;
  violationEvents?: ExamViolationEvent[];
  autoSubmitted?: boolean;
  needsReview?: boolean;
  examSessionStatus?: 'in_progress' | 'submitted' | 'auto_submitted' | 'resumed';
  resumedByTeacher?: {
    teacherName: string;
    resumedAt: string;
    note?: string;
  } | null;
}

export interface GradeRecord {
  id: string;
  studentId: string;
  studentName: string;
  nisn: string;
  classId: string;
  className: string;
  assignmentAverage: number;
  quizAverage: number;
  finalScore: number;
  status: 'Tuntas' | 'Belum Tuntas';
  notes?: string;
}

export interface Announcement {
  id: string;
  title: string;
  content: string;
  targetClassId: string; // "all" or specific classId
  targetClassName?: string;
  priority: 'normal' | 'important' | 'urgent';
  isPublished: boolean;
  authorName: string;
  createdAt: string;
}

export interface DashboardStats {
  totalStudents: number;
  totalClasses: number;
  totalMaterials: number;
  totalActiveAssignments: number;
  totalSubmissions: number;
  pendingGradingCount: number;
  averageGrade: number;
  completionRate: number;
}
