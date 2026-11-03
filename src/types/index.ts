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

export type QuestionType = 'multiple_choice' | 'true_false' | 'short_answer' | 'essay';

export interface QuizOption {
  id: string;
  text: string;
}

export interface QuizQuestion {
  id: string;
  quizId: string;
  questionText: string;
  questionType: QuestionType;
  options?: QuizOption[];
  correctAnswer: string; // For MCQ/TF it's option ID or "true"/"false"
  explanation?: string;
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
  durationMinutes: number; // e.g. 30 minutes, 0 for unlimited
  maxAttempts: number;
  passingScore: number;
  isPublished: boolean;
  questionCount?: number;
  createdAt: string;
}

export interface QuizAnswer {
  questionId: string;
  userAnswer: string;
  isCorrect?: boolean;
  pointsAwarded?: number;
}

export interface QuizAttempt {
  id: string;
  quizId: string;
  quizTitle?: string;
  studentId: string;
  studentName?: string;
  className?: string;
  startedAt: string;
  completedAt?: string;
  answers: QuizAnswer[];
  score: number;
  maxScore: number;
  percentage: number;
  passed: boolean;
  attemptNumber: number;
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
