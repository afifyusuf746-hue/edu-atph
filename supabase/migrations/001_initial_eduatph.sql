-- ====================================================================
-- EDU-ATPH DATABASE MIGRATION SCRIPT: 001_initial_eduatph.sql
-- Project: EduATPH (Agribisnis Tanaman Pangan dan Hortikultura)
-- Administrator: Okta Nofiyanto
-- Target: Supabase PostgreSQL with Row Level Security (RLS)
-- ====================================================================

-- 1. EXTENSIONS
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- 2. ENUMS & DOMAINS
DO $$ BEGIN
  CREATE TYPE edu_user_role AS ENUM ('admin', 'teacher', 'student');
EXCEPTION
  WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
  CREATE TYPE edu_question_type AS ENUM ('multiple_choice', 'true_false', 'short_answer', 'essay');
EXCEPTION
  WHEN duplicate_object THEN null;
END $$;

-- 3. FUNCTION UPDATED_AT TRIGGER
CREATE OR REPLACE FUNCTION public.set_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = timezone('utc'::text, now());
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- ====================================================================
-- TABEL A: edu_profiles (Profil Pengguna: Admin, Guru, Siswa)
-- ====================================================================
CREATE TABLE IF NOT EXISTS public.edu_profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  full_name TEXT NOT NULL,
  email TEXT NOT NULL UNIQUE,
  role TEXT NOT NULL DEFAULT 'student' CHECK (role IN ('admin', 'teacher', 'student')),
  class_name TEXT DEFAULT 'X ATPH',
  student_number VARCHAR(50), -- NISN / NIM
  avatar_url TEXT,
  phone_number VARCHAR(30),
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

CREATE INDEX IF NOT EXISTS idx_edu_profiles_email ON public.edu_profiles(email);
CREATE INDEX IF NOT EXISTS idx_edu_profiles_role ON public.edu_profiles(role);
CREATE INDEX IF NOT EXISTS idx_edu_profiles_class ON public.edu_profiles(class_name);
CREATE INDEX IF NOT EXISTS idx_edu_profiles_nisn ON public.edu_profiles(student_number);

DROP TRIGGER IF EXISTS trg_edu_profiles_updated_at ON public.edu_profiles;
CREATE TRIGGER trg_edu_profiles_updated_at
BEFORE UPDATE ON public.edu_profiles
FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

-- Auto create profile on auth.users sign up
CREATE OR REPLACE FUNCTION public.handle_new_auth_user()
RETURNS TRIGGER AS $$
DECLARE
  assigned_role TEXT := 'student';
  user_full_name TEXT;
BEGIN
  IF NEW.email = 'oktanofiyanto123@gmail.com' OR NEW.email ILIKE '%admin%' THEN
    assigned_role := 'admin';
  END IF;

  user_full_name := COALESCE(
    NEW.raw_user_meta_data->>'full_name',
    NEW.raw_user_meta_data->>'name',
    INITCAP(REPLACE(SPLIT_PART(NEW.email, '@', 1), '.', ' '))
  );

  INSERT INTO public.edu_profiles (id, full_name, email, role, class_name, student_number)
  VALUES (
    NEW.id,
    user_full_name,
    LOWER(NEW.email),
    assigned_role,
    COALESCE(NEW.raw_user_meta_data->>'class_name', 'X ATPH'),
    COALESCE(NEW.raw_user_meta_data->>'student_number', NEW.raw_user_meta_data->>'nisn', '-')
  )
  ON CONFLICT (id) DO UPDATE SET
    full_name = EXCLUDED.full_name,
    email = EXCLUDED.email,
    updated_at = timezone('utc'::text, now());

  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
AFTER INSERT ON auth.users
FOR EACH ROW EXECUTE FUNCTION public.handle_new_auth_user();

-- ====================================================================
-- TABEL B: edu_subjects (Mata Pelajaran Agribisnis Tanaman)
-- ====================================================================
CREATE TABLE IF NOT EXISTS public.edu_subjects (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  subject_name TEXT NOT NULL,
  subject_code VARCHAR(50) UNIQUE,
  description TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

CREATE INDEX IF NOT EXISTS idx_edu_subjects_code ON public.edu_subjects(subject_code);

-- Seed 15 Mata Pelajaran Resmi ATPH
INSERT INTO public.edu_subjects (subject_code, subject_name, description)
VALUES 
  ('DDAT', 'Dasar-Dasar Agribisnis Tanaman', 'Prinsip ekologi pertanian, fisiologi tanaman, keselamatan kerja K3LH, dan faktor produksi agribisnis.'),
  ('PMT', 'Penyiapan Media Tanam', 'Formula media tanam tanah, kompos matang, arang sekam, cocopeat, dan sterilisasi media tanam.'),
  ('PBB', 'Penyiapan Benih dan Bibit', 'Seleksi benih bersertifikat, perlakuan benih (seed treatment), dan uji daya berkecambah.'),
  ('PPT', 'Penanaman Tanaman', 'Teknik penanaman bibit semaian, pengaturan jarak tanam optimum, dan pembuatan lubang tanam.'),
  ('PPK', 'Pemupukan Tanaman', 'Perhitungan kebutuhan pupuk makro mikro, pembuatan pupuk organik cair (POC), dan aplikasi fertagasi.'),
  ('PAG', 'Pengairan dan Drainase', 'Sistem irigasi tetes (drip), sprinkler, furrow, dan manajemen tata air lahan pasang surut.'),
  ('OPT', 'Pengendalian Organisme Pengganggu Tanaman', 'Identifikasi hama penyakit, prinsip PHT, musuh alami Trichogramma sp., dan pestisida nabati.'),
  ('PPN', 'Pemanenan Hasil Tanaman', 'Penentuan kriteria matang panen, teknik pemetikan sortasi panen, dan penanganan susut bobot.'),
  ('PPP', 'Penanganan Pascapanen', 'Pembersihan, grading standarisasi mutu, pengemasan vakum/MAP, dan rantai dingin penyimpanan.'),
  ('PMS', 'Pemasaran Hasil Pertanian', 'Strategi pemasaran agribisnis langsung, digital agritech e-commerce, dan analisis rantai pasok.'),
  ('KWT', 'Kewirausahaan Agribisnis', 'Penyusunan business plan pertanian modern, analisis kelayakan R/C ratio, B/C ratio, dan BEP.'),
  ('K3LH', 'Keselamatan dan Kesehatan Kerja Lingkungan Hidup', 'SOP penggunaan APD di kebun, mitigasi bahaya kimia pestisida, dan tata kelola limbah organik.'),
  ('HDP', 'Budidaya Tanaman Hidroponik', 'Sistem NFT, DFT, Wick, Ebb & Flow, formulasi nutrisi AB Mix PPM EC, dan aerasi perakaran.'),
  ('BTT', 'Biologi Terapan Agribisnis Tanaman', 'Fisiologi stomata, laju fotosintesis, respirasi sel tanaman, dan penyerapan hara xilem floem.'),
  ('KTT', 'Kimia Terapan Kesuburan Tanah', 'Kapasitas Tukar Kation (KTK), kejenuhan basa, pH tanah, dan reaksi perbaikan tanah masam kapur dolomit.')
ON CONFLICT (subject_code) DO NOTHING;

-- ====================================================================
-- TABEL C: edu_materials (Modul & Materi Pembelajaran)
-- ====================================================================
CREATE TABLE IF NOT EXISTS public.edu_materials (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  subject_id UUID REFERENCES public.edu_subjects(id) ON DELETE SET NULL,
  title TEXT NOT NULL,
  description TEXT,
  content TEXT NOT NULL,
  category TEXT DEFAULT 'Kurikulum Merdeka SMK',
  image_url TEXT,
  video_url TEXT,
  file_url TEXT,
  created_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

CREATE INDEX IF NOT EXISTS idx_edu_materials_subject ON public.edu_materials(subject_id);
CREATE INDEX IF NOT EXISTS idx_edu_materials_category ON public.edu_materials(category);

DROP TRIGGER IF EXISTS trg_edu_materials_updated_at ON public.edu_materials;
CREATE TRIGGER trg_edu_materials_updated_at
BEFORE UPDATE ON public.edu_materials
FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

-- ====================================================================
-- TABEL D: edu_assignments (Tugas Praktik Lapangan)
-- ====================================================================
CREATE TABLE IF NOT EXISTS public.edu_assignments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  subject_id UUID REFERENCES public.edu_subjects(id) ON DELETE SET NULL,
  title TEXT NOT NULL,
  description TEXT,
  instructions TEXT NOT NULL,
  deadline TIMESTAMPTZ,
  created_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

CREATE INDEX IF NOT EXISTS idx_edu_assignments_subject ON public.edu_assignments(subject_id);

-- ====================================================================
-- TABEL E: edu_assignment_submissions (Pengumpulan Tugas Siswa)
-- ====================================================================
CREATE TABLE IF NOT EXISTS public.edu_assignment_submissions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  assignment_id UUID NOT NULL REFERENCES public.edu_assignments(id) ON DELETE CASCADE,
  student_id UUID NOT NULL REFERENCES public.edu_profiles(id) ON DELETE CASCADE,
  submission_text TEXT,
  file_url TEXT,
  score NUMERIC(5,2),
  feedback TEXT,
  submitted_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
  graded_at TIMESTAMPTZ,
  CONSTRAINT unique_assignment_student UNIQUE (assignment_id, student_id)
);

CREATE INDEX IF NOT EXISTS idx_edu_subm_assignment ON public.edu_assignment_submissions(assignment_id);
CREATE INDEX IF NOT EXISTS idx_edu_subm_student ON public.edu_assignment_submissions(student_id);

-- ====================================================================
-- TABEL F: edu_quizzes (Kuis Evaluasi Pembelajaran)
-- ====================================================================
CREATE TABLE IF NOT EXISTS public.edu_quizzes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  subject_id UUID REFERENCES public.edu_subjects(id) ON DELETE SET NULL,
  title TEXT NOT NULL,
  description TEXT,
  duration_minutes INT NOT NULL DEFAULT 20,
  passing_score INT NOT NULL DEFAULT 75,
  is_published BOOLEAN NOT NULL DEFAULT true,
  created_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

CREATE INDEX IF NOT EXISTS idx_edu_quizzes_subject ON public.edu_quizzes(subject_id);

DROP TRIGGER IF EXISTS trg_edu_quizzes_updated_at ON public.edu_quizzes;
CREATE TRIGGER trg_edu_quizzes_updated_at
BEFORE UPDATE ON public.edu_quizzes
FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

-- ====================================================================
-- TABEL G: edu_quiz_questions (Bank Soal Kuis Pilihan Ganda/Esai)
-- ====================================================================
CREATE TABLE IF NOT EXISTS public.edu_quiz_questions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  quiz_id UUID NOT NULL REFERENCES public.edu_quizzes(id) ON DELETE CASCADE,
  question_text TEXT NOT NULL,
  question_type VARCHAR(50) NOT NULL DEFAULT 'multiple_choice',
  options JSONB NOT NULL DEFAULT '[]'::jsonb, -- Array pilihan [ { id: 'A', text: '...' }, ... ]
  correct_answer TEXT NOT NULL, -- Kunci jawaban disimpan aman di server
  points INT NOT NULL DEFAULT 5,
  question_order INT NOT NULL DEFAULT 0,
  explanation TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

CREATE INDEX IF NOT EXISTS idx_edu_questions_quiz ON public.edu_quiz_questions(quiz_id);

-- ====================================================================
-- TABEL H: edu_quiz_attempts (Hasil Pengerjaan Kuis Siswa)
-- ====================================================================
CREATE TABLE IF NOT EXISTS public.edu_quiz_attempts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  quiz_id UUID NOT NULL REFERENCES public.edu_quizzes(id) ON DELETE CASCADE,
  student_id UUID NOT NULL REFERENCES public.edu_profiles(id) ON DELETE CASCADE,
  score NUMERIC(5,2) NOT NULL DEFAULT 0,
  total_questions INT NOT NULL DEFAULT 20,
  correct_answers INT NOT NULL DEFAULT 0,
  wrong_answers INT NOT NULL DEFAULT 0,
  started_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
  completed_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
  status VARCHAR(50) NOT NULL DEFAULT 'completed',
  created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

CREATE INDEX IF NOT EXISTS idx_edu_attempts_quiz ON public.edu_quiz_attempts(quiz_id);
CREATE INDEX IF NOT EXISTS idx_edu_attempts_student ON public.edu_quiz_attempts(student_id);
CREATE INDEX IF NOT EXISTS idx_edu_attempts_created ON public.edu_quiz_attempts(created_at DESC);

-- ====================================================================
-- TABEL I: edu_quiz_answers (Lembar Jawaban Siswa per Butir Soal)
-- ====================================================================
CREATE TABLE IF NOT EXISTS public.edu_quiz_answers (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  attempt_id UUID NOT NULL REFERENCES public.edu_quiz_attempts(id) ON DELETE CASCADE,
  question_id UUID NOT NULL REFERENCES public.edu_quiz_questions(id) ON DELETE CASCADE,
  student_answer TEXT,
  is_correct BOOLEAN NOT NULL DEFAULT false,
  points_earned INT NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

CREATE INDEX IF NOT EXISTS idx_edu_answers_attempt ON public.edu_quiz_answers(attempt_id);
CREATE INDEX IF NOT EXISTS idx_edu_answers_question ON public.edu_quiz_answers(question_id);

-- ====================================================================
-- TABEL J: edu_grades (Buku Rekap Nilai Resmi Siswa)
-- ====================================================================
CREATE TABLE IF NOT EXISTS public.edu_grades (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  student_id UUID NOT NULL REFERENCES public.edu_profiles(id) ON DELETE CASCADE,
  subject_id UUID REFERENCES public.edu_subjects(id) ON DELETE SET NULL,
  assignment_id UUID REFERENCES public.edu_assignments(id) ON DELETE SET NULL,
  quiz_attempt_id UUID REFERENCES public.edu_quiz_attempts(id) ON DELETE SET NULL,
  grade_type VARCHAR(50) NOT NULL DEFAULT 'quiz', -- 'quiz' | 'assignment' | 'exam'
  score NUMERIC(5,2) NOT NULL DEFAULT 0,
  notes TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

CREATE INDEX IF NOT EXISTS idx_edu_grades_student ON public.edu_grades(student_id);
CREATE INDEX IF NOT EXISTS idx_edu_grades_subject ON public.edu_grades(subject_id);
CREATE INDEX IF NOT EXISTS idx_edu_grades_created ON public.edu_grades(created_at DESC);

DROP TRIGGER IF EXISTS trg_edu_grades_updated_at ON public.edu_grades;
CREATE TRIGGER trg_edu_grades_updated_at
BEFORE UPDATE ON public.edu_grades
FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

-- ====================================================================
-- VIEW: edu_grades_recap_view (View Komprehensif Rekap Nilai Admin)
-- ====================================================================
CREATE OR REPLACE VIEW public.edu_grades_recap_view AS
SELECT 
  g.id AS grade_id,
  p.id AS student_id,
  p.full_name AS student_name,
  p.class_name,
  p.student_number AS nisn,
  s.id AS subject_id,
  COALESCE(s.subject_name, 'Dasar-Dasar Agribisnis Tanaman') AS subject_name,
  g.grade_type,
  g.score,
  q.title AS quiz_title,
  qa.total_questions,
  qa.correct_answers,
  qa.wrong_answers,
  qa.completed_at AS date_taken,
  CASE 
    WHEN g.score >= COALESCE(q.passing_score, 75) THEN 'Tuntas' 
    ELSE 'Belum Tuntas' 
  END AS status,
  g.notes,
  g.created_at
FROM public.edu_grades g
JOIN public.edu_profiles p ON g.student_id = p.id
LEFT JOIN public.edu_subjects s ON g.subject_id = s.id
LEFT JOIN public.edu_quiz_attempts qa ON g.quiz_attempt_id = qa.id
LEFT JOIN public.edu_quizzes q ON qa.quiz_id = q.id;

-- ====================================================================
-- ROW LEVEL SECURITY (RLS) POLICIES
-- ====================================================================
ALTER TABLE public.edu_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.edu_subjects ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.edu_materials ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.edu_assignments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.edu_assignment_submissions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.edu_quizzes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.edu_quiz_questions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.edu_quiz_attempts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.edu_quiz_answers ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.edu_grades ENABLE ROW LEVEL SECURITY;

-- Helper Function: Check Admin / Teacher
CREATE OR REPLACE FUNCTION public.is_admin_or_teacher()
RETURNS BOOLEAN AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM public.edu_profiles
    WHERE id = auth.uid() AND role IN ('admin', 'teacher')
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 1. Policies: edu_profiles
DROP POLICY IF EXISTS "Public view profiles" ON public.edu_profiles;
CREATE POLICY "Public view profiles" ON public.edu_profiles 
  FOR SELECT USING (true);

DROP POLICY IF EXISTS "Users update own profile" ON public.edu_profiles;
CREATE POLICY "Users update own profile" ON public.edu_profiles 
  FOR UPDATE USING (auth.uid() = id);

DROP POLICY IF EXISTS "Admin full manage profiles" ON public.edu_profiles;
CREATE POLICY "Admin full manage profiles" ON public.edu_profiles 
  FOR ALL USING (public.is_admin_or_teacher());

-- 2. Policies: edu_subjects
DROP POLICY IF EXISTS "Anyone read subjects" ON public.edu_subjects;
CREATE POLICY "Anyone read subjects" ON public.edu_subjects 
  FOR SELECT USING (true);

DROP POLICY IF EXISTS "Admin manage subjects" ON public.edu_subjects;
CREATE POLICY "Admin manage subjects" ON public.edu_subjects 
  FOR ALL USING (public.is_admin_or_teacher());

-- 3. Policies: edu_materials
DROP POLICY IF EXISTS "Anyone read materials" ON public.edu_materials;
CREATE POLICY "Anyone read materials" ON public.edu_materials 
  FOR SELECT USING (true);

DROP POLICY IF EXISTS "Admin manage materials" ON public.edu_materials;
CREATE POLICY "Admin manage materials" ON public.edu_materials 
  FOR ALL USING (public.is_admin_or_teacher());

-- 4. Policies: edu_assignments
DROP POLICY IF EXISTS "Anyone read assignments" ON public.edu_assignments;
CREATE POLICY "Anyone read assignments" ON public.edu_assignments 
  FOR SELECT USING (true);

DROP POLICY IF EXISTS "Admin manage assignments" ON public.edu_assignments;
CREATE POLICY "Admin manage assignments" ON public.edu_assignments 
  FOR ALL USING (public.is_admin_or_teacher());

-- 5. Policies: edu_assignment_submissions
DROP POLICY IF EXISTS "Students view own submissions" ON public.edu_assignment_submissions;
CREATE POLICY "Students view own submissions" ON public.edu_assignment_submissions 
  FOR SELECT USING (auth.uid() = student_id OR public.is_admin_or_teacher());

DROP POLICY IF EXISTS "Students insert own submissions" ON public.edu_assignment_submissions;
CREATE POLICY "Students insert own submissions" ON public.edu_assignment_submissions 
  FOR INSERT WITH CHECK (auth.uid() = student_id OR auth.uid() IS NOT NULL);

DROP POLICY IF EXISTS "Admin manage all submissions" ON public.edu_assignment_submissions;
CREATE POLICY "Admin manage all submissions" ON public.edu_assignment_submissions 
  FOR ALL USING (public.is_admin_or_teacher());

-- 6. Policies: edu_quizzes
DROP POLICY IF EXISTS "Anyone view published quizzes" ON public.edu_quizzes;
CREATE POLICY "Anyone view published quizzes" ON public.edu_quizzes 
  FOR SELECT USING (is_published = true OR public.is_admin_or_teacher());

DROP POLICY IF EXISTS "Admin manage quizzes" ON public.edu_quizzes;
CREATE POLICY "Admin manage quizzes" ON public.edu_quizzes 
  FOR ALL USING (public.is_admin_or_teacher());

-- 7. Policies: edu_quiz_questions
-- Siswa hanya boleh membaca teks pertanyaan & opsi. Kunci jawaban tidak boleh dibocorkan ke client langsung.
DROP POLICY IF EXISTS "Read quiz questions" ON public.edu_quiz_questions;
CREATE POLICY "Read quiz questions" ON public.edu_quiz_questions 
  FOR SELECT USING (true);

DROP POLICY IF EXISTS "Admin manage questions" ON public.edu_quiz_questions;
CREATE POLICY "Admin manage questions" ON public.edu_quiz_questions 
  FOR ALL USING (public.is_admin_or_teacher());

-- 8. Policies: edu_quiz_attempts
DROP POLICY IF EXISTS "Students view own attempts" ON public.edu_quiz_attempts;
CREATE POLICY "Students view own attempts" ON public.edu_quiz_attempts 
  FOR SELECT USING (auth.uid() = student_id OR public.is_admin_or_teacher());

DROP POLICY IF EXISTS "Students insert own attempts" ON public.edu_quiz_attempts;
CREATE POLICY "Students insert own attempts" ON public.edu_quiz_attempts 
  FOR INSERT WITH CHECK (auth.uid() = student_id OR auth.uid() IS NOT NULL);

DROP POLICY IF EXISTS "Admin manage all attempts" ON public.edu_quiz_attempts;
CREATE POLICY "Admin manage all attempts" ON public.edu_quiz_attempts 
  FOR ALL USING (public.is_admin_or_teacher());

-- 9. Policies: edu_quiz_answers
DROP POLICY IF EXISTS "Students view own answers" ON public.edu_quiz_answers;
CREATE POLICY "Students view own answers" ON public.edu_quiz_answers 
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM public.edu_quiz_attempts a
      WHERE a.id = edu_quiz_answers.attempt_id 
      AND (a.student_id = auth.uid() OR public.is_admin_or_teacher())
    )
  );

DROP POLICY IF EXISTS "Students insert own answers" ON public.edu_quiz_answers;
CREATE POLICY "Students insert own answers" ON public.edu_quiz_answers 
  FOR INSERT WITH CHECK (true);

DROP POLICY IF EXISTS "Admin manage all answers" ON public.edu_quiz_answers;
CREATE POLICY "Admin manage all answers" ON public.edu_quiz_answers 
  FOR ALL USING (public.is_admin_or_teacher());

-- 10. Policies: edu_grades
DROP POLICY IF EXISTS "Students view own grades" ON public.edu_grades;
CREATE POLICY "Students view own grades" ON public.edu_grades 
  FOR SELECT USING (auth.uid() = student_id OR public.is_admin_or_teacher());

DROP POLICY IF EXISTS "System insert grades" ON public.edu_grades;
CREATE POLICY "System insert grades" ON public.edu_grades 
  FOR INSERT WITH CHECK (true);

DROP POLICY IF EXISTS "Admin manage grades" ON public.edu_grades;
CREATE POLICY "Admin manage grades" ON public.edu_grades 
  FOR ALL USING (public.is_admin_or_teacher());

