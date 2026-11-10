-- =============================================================================
-- MIGRATION 004: Evaluasi Materi Hidroponik Kelas XI SMK ATPH & Penilaian AI
-- =============================================================================

-- 1. Tambahkan kolom penilaian berbobot, status publikasi, Mode Ujian Terkontrol, dan identitas penilai pada quiz_attempts
ALTER TABLE IF EXISTS public.quiz_attempts
  ADD COLUMN IF NOT EXISTS mcq_correct_count INT DEFAULT 0,
  ADD COLUMN IF NOT EXISTS mcq_total_count INT DEFAULT 10,
  ADD COLUMN IF NOT EXISTS mcq_score NUMERIC(6,2) DEFAULT 0,
  ADD COLUMN IF NOT EXISTS essay_avg_score NUMERIC(6,2),
  ADD COLUMN IF NOT EXISTS case_study_avg_score NUMERIC(6,2),
  ADD COLUMN IF NOT EXISTS final_weighted_score NUMERIC(6,2),
  ADD COLUMN IF NOT EXISTS weights_config JSONB DEFAULT '{"mcqWeight": 30, "essayWeight": 40, "caseStudyWeight": 30}'::jsonb,
  ADD COLUMN IF NOT EXISTS grading_status VARCHAR(40) DEFAULT 'pending_grading',
  ADD COLUMN IF NOT EXISTS is_published BOOLEAN DEFAULT false,
  ADD COLUMN IF NOT EXISTS published_at TIMESTAMPTZ,
  ADD COLUMN IF NOT EXISTS published_by TEXT,
  ADD COLUMN IF NOT EXISTS allow_student_review BOOLEAN DEFAULT false,
  ADD COLUMN IF NOT EXISTS teacher_notes TEXT,
  ADD COLUMN IF NOT EXISTS graded_by TEXT,
  ADD COLUMN IF NOT EXISTS graded_at TIMESTAMPTZ,
  ADD COLUMN IF NOT EXISTS violation_count INT DEFAULT 0,
  ADD COLUMN IF NOT EXISTS violation_events JSONB DEFAULT '[]'::jsonb,
  ADD COLUMN IF NOT EXISTS auto_submitted BOOLEAN DEFAULT false,
  ADD COLUMN IF NOT EXISTS needs_review BOOLEAN DEFAULT false,
  ADD COLUMN IF NOT EXISTS exam_session_status VARCHAR(40) DEFAULT 'submitted';

-- 2. Tambahkan kolom terpisah untuk Nilai AI (ai_score) dan Nilai Akhir Guru (teacher_score) pada quiz_answers
ALTER TABLE IF EXISTS public.quiz_answers
  ADD COLUMN IF NOT EXISTS question_type VARCHAR(30) DEFAULT 'multiple_choice',
  ADD COLUMN IF NOT EXISTS ai_score INT CHECK (ai_score IS NULL OR (ai_score >= 0 AND ai_score <= 100)),
  ADD COLUMN IF NOT EXISTS ai_rubric_breakdown JSONB,
  ADD COLUMN IF NOT EXISTS ai_reasoning TEXT,
  ADD COLUMN IF NOT EXISTS ai_improvement TEXT,
  ADD COLUMN IF NOT EXISTS ai_graded_at TIMESTAMPTZ,
  ADD COLUMN IF NOT EXISTS teacher_score INT CHECK (teacher_score IS NULL OR (teacher_score >= 0 AND teacher_score <= 100)),
  ADD COLUMN IF NOT EXISTS teacher_note TEXT,
  ADD COLUMN IF NOT EXISTS graded_by TEXT,
  ADD COLUMN IF NOT EXISTS graded_at TIMESTAMPTZ;

-- 3. Tabel konfigurasi pengaturan kuis oleh guru (bobot, visibilitas pembahasan, & Mode Ujian Terkontrol)
CREATE TABLE IF NOT EXISTS public.quiz_settings (
  quiz_id TEXT PRIMARY KEY,
  weights_config JSONB NOT NULL DEFAULT '{"mcqWeight": 30, "essayWeight": 40, "caseStudyWeight": 30}'::jsonb,
  controlled_exam_config JSONB NOT NULL DEFAULT '{"enabled": true, "requireFullscreen": true, "maxViolations": 3, "violationAction": "warn_only"}'::jsonb,
  allow_student_review BOOLEAN NOT NULL DEFAULT false,
  is_closed BOOLEAN NOT NULL DEFAULT false,
  updated_by TEXT,
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- 4. Tabel sesi ujian aktif (Mode Ujian Terkontrol, timer berbasis server, dan autosave draf)
CREATE TABLE IF NOT EXISTS public.exam_sessions (
  id TEXT PRIMARY KEY,
  quiz_id TEXT NOT NULL,
  student_id TEXT NOT NULL,
  student_name TEXT NOT NULL,
  class_name TEXT,
  status VARCHAR(30) NOT NULL DEFAULT 'in_progress',
  started_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  deadline_at TIMESTAMPTZ NOT NULL,
  last_saved_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  draft_answers JSONB NOT NULL DEFAULT '{}'::jsonb,
  violation_count INT NOT NULL DEFAULT 0,
  violation_events JSONB NOT NULL DEFAULT '[]'::jsonb,
  fullscreen_supported BOOLEAN DEFAULT true,
  auto_submitted BOOLEAN DEFAULT false,
  needs_review BOOLEAN DEFAULT false,
  locked_at TIMESTAMPTZ,
  attempt_id TEXT,
  resumed_by_teacher JSONB,
  UNIQUE(quiz_id, student_id)
);

-- 4. Indeks performa untuk query evaluasi Hidroponik Kelas XI
CREATE INDEX IF NOT EXISTS idx_quiz_attempts_quiz_student ON public.quiz_attempts(quiz_id, student_id);
CREATE INDEX IF NOT EXISTS idx_quiz_attempts_grading_status ON public.quiz_attempts(grading_status, is_published);
CREATE INDEX IF NOT EXISTS idx_quiz_answers_attempt_id ON public.quiz_answers(attempt_id);

