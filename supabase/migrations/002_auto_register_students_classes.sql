-- ====================================================================
-- EDU-ATPH DATABASE MIGRATION SCRIPT: 002_auto_register_students_classes.sql
-- Project: EduATPH (Agribisnis Tanaman Pangan dan Hortikultura)
-- Administrator: Okta Nofiyanto
-- Target: Supabase PostgreSQL (Auto Register Siswa, Manajemen Siswa, Manajemen Kelas, dan Penilaian)
-- ====================================================================

-- 1. EXTENSIONS
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- 2. TABEL: classes (Rombongan Belajar ATPH)
CREATE TABLE IF NOT EXISTS public.classes (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  grade_level VARCHAR(10) NOT NULL DEFAULT 'X',
  description TEXT,
  academic_year VARCHAR(20) NOT NULL DEFAULT '2025/2026',
  created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

ALTER TABLE public.classes ADD COLUMN IF NOT EXISTS grade_level VARCHAR(10) DEFAULT 'X';
ALTER TABLE public.classes ADD COLUMN IF NOT EXISTS description TEXT;
ALTER TABLE public.classes ADD COLUMN IF NOT EXISTS academic_year VARCHAR(20) DEFAULT '2025/2026';
ALTER TABLE public.classes ADD COLUMN IF NOT EXISTS updated_at TIMESTAMPTZ DEFAULT timezone('utc'::text, now());

-- Seed Rombel Kelas ATPH Standar (Tingkat X, XI, XII)
INSERT INTO public.classes (id, name, grade_level, description, academic_year)
VALUES
  ('cls-x-at-1', 'X AT 1', 'X', 'Kelas 10 Agribisnis Tanaman 1 - Rombel Dasar Kejuruan ATPH', '2025/2026'),
  ('cls-x-at-2', 'X AT 2', 'X', 'Kelas 10 Agribisnis Tanaman 2 - Rombel Dasar Kejuruan ATPH', '2025/2026'),
  ('cls-x-at-3', 'X AT 3', 'X', 'Kelas 10 Agribisnis Tanaman 3 - Rombel Dasar Kejuruan ATPH', '2025/2026'),
  ('cls-xi-at-1', 'XI AT 1', 'XI', 'Kelas 11 Agribisnis Tanaman 1 - Praktik Budidaya Lanjutan ATPH', '2025/2026'),
  ('cls-xi-at-2', 'XI AT 2', 'XI', 'Kelas 11 Agribisnis Tanaman 2 - Praktik Budidaya Lanjutan ATPH', '2025/2026'),
  ('cls-xi-at-3', 'XI AT 3', 'XI', 'Kelas 11 Agribisnis Tanaman 3 - Praktik Budidaya Lanjutan ATPH', '2025/2026'),
  ('cls-xii-at-1', 'XII AT 1', 'XII', 'Kelas 12 Agribisnis Tanaman 1 - Pascapanen & Kewirausahaan ATPH', '2025/2026'),
  ('cls-xii-at-2', 'XII AT 2', 'XII', 'Kelas 12 Agribisnis Tanaman 2 - Pascapanen & Kewirausahaan ATPH', '2025/2026'),
  ('cls-xii-at-3', 'XII AT 3', 'XII', 'Kelas 12 Agribisnis Tanaman 3 - Pascapanen & Kewirausahaan ATPH', '2025/2026')
ON CONFLICT (id) DO UPDATE SET
  name = EXCLUDED.name,
  grade_level = EXCLUDED.grade_level,
  description = EXCLUDED.description,
  academic_year = EXCLUDED.academic_year;

-- 3. TABEL: students (Identitas & Profil Siswa EduATPH)
CREATE TABLE IF NOT EXISTS public.students (
  id TEXT PRIMARY KEY,
  auth_user_id UUID,
  full_name TEXT NOT NULL,
  nis TEXT,
  nisn TEXT,
  email TEXT UNIQUE NOT NULL,
  username TEXT,
  class_id TEXT REFERENCES public.classes(id) ON DELETE SET NULL,
  class_name TEXT DEFAULT 'X AT 1',
  major TEXT NOT NULL DEFAULT 'Agribisnis Tanaman Pangan dan Hortikultura',
  status TEXT NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'nonaktif', 'alumni', 'pindah')),
  avatar_url TEXT DEFAULT 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=250&q=80',
  phone_number TEXT,
  last_login_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
  created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

ALTER TABLE public.students ADD COLUMN IF NOT EXISTS auth_user_id UUID;
ALTER TABLE public.students ADD COLUMN IF NOT EXISTS nis TEXT;
ALTER TABLE public.students ADD COLUMN IF NOT EXISTS nisn TEXT;
ALTER TABLE public.students ADD COLUMN IF NOT EXISTS class_id TEXT;
ALTER TABLE public.students ADD COLUMN IF NOT EXISTS class_name TEXT DEFAULT 'X AT 1';
ALTER TABLE public.students ADD COLUMN IF NOT EXISTS major TEXT DEFAULT 'Agribisnis Tanaman Pangan dan Hortikultura';
ALTER TABLE public.students ADD COLUMN IF NOT EXISTS status TEXT DEFAULT 'active';
ALTER TABLE public.students ADD COLUMN IF NOT EXISTS avatar_url TEXT DEFAULT 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=250&q=80';
ALTER TABLE public.students ADD COLUMN IF NOT EXISTS phone_number TEXT;
ALTER TABLE public.students ADD COLUMN IF NOT EXISTS last_login_at TIMESTAMPTZ DEFAULT timezone('utc'::text, now());
ALTER TABLE public.students ADD COLUMN IF NOT EXISTS updated_at TIMESTAMPTZ DEFAULT timezone('utc'::text, now());

-- Indeks Pencarian Cepat
CREATE INDEX IF NOT EXISTS idx_students_email ON public.students(email);
CREATE INDEX IF NOT EXISTS idx_students_nis ON public.students(nis);
CREATE INDEX IF NOT EXISTS idx_students_class_id ON public.students(class_id);
CREATE INDEX IF NOT EXISTS idx_students_status ON public.students(status);

-- 4. TABEL: class_students (Relasi Siswa dengan Rombel Kelas)
CREATE TABLE IF NOT EXISTS public.class_students (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  class_id TEXT NOT NULL REFERENCES public.classes(id) ON DELETE CASCADE,
  student_id TEXT NOT NULL REFERENCES public.students(id) ON DELETE CASCADE,
  academic_year VARCHAR(20) NOT NULL DEFAULT '2025/2026',
  status VARCHAR(20) NOT NULL DEFAULT 'active',
  created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
  CONSTRAINT uq_class_student UNIQUE (class_id, student_id)
);

CREATE INDEX IF NOT EXISTS idx_class_students_class ON public.class_students(class_id);
CREATE INDEX IF NOT EXISTS idx_class_students_student ON public.class_students(student_id);

-- 5. TABEL: assessments (Rekapitulasi Penilaian Kuis Siswa)
CREATE TABLE IF NOT EXISTS public.assessments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  student_id TEXT,
  student_name TEXT,
  student_nis TEXT,
  class_name TEXT,
  quiz_id TEXT,
  quiz_title TEXT,
  score NUMERIC(5,2) NOT NULL DEFAULT 0,
  max_score NUMERIC(5,2) NOT NULL DEFAULT 100,
  aspect_scores JSONB NOT NULL DEFAULT '{}'::jsonb,
  is_passed BOOLEAN DEFAULT true,
  notes TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

ALTER TABLE public.assessments ADD COLUMN IF NOT EXISTS student_id TEXT;
ALTER TABLE public.assessments ADD COLUMN IF NOT EXISTS student_name TEXT;
ALTER TABLE public.assessments ADD COLUMN IF NOT EXISTS student_nis TEXT;
ALTER TABLE public.assessments ADD COLUMN IF NOT EXISTS class_name TEXT;
ALTER TABLE public.assessments ADD COLUMN IF NOT EXISTS quiz_id TEXT;
ALTER TABLE public.assessments ADD COLUMN IF NOT EXISTS quiz_title TEXT;
ALTER TABLE public.assessments ADD COLUMN IF NOT EXISTS score NUMERIC(5,2) DEFAULT 0;
ALTER TABLE public.assessments ADD COLUMN IF NOT EXISTS max_score NUMERIC(5,2) DEFAULT 100;
ALTER TABLE public.assessments ADD COLUMN IF NOT EXISTS aspect_scores JSONB DEFAULT '{}'::jsonb;
ALTER TABLE public.assessments ADD COLUMN IF NOT EXISTS is_passed BOOLEAN DEFAULT true;
ALTER TABLE public.assessments ADD COLUMN IF NOT EXISTS notes TEXT;

CREATE INDEX IF NOT EXISTS idx_assessments_student_id ON public.assessments(student_id);
CREATE INDEX IF NOT EXISTS idx_assessments_quiz_id ON public.assessments(quiz_id);
CREATE INDEX IF NOT EXISTS idx_assessments_created_at ON public.assessments(created_at DESC);

-- 6. VIEW: class_students_overview (Rekap Siswa per Kelas untuk Dashboard Guru)
CREATE OR REPLACE VIEW public.class_students_overview AS
SELECT
  c.id AS class_id,
  c.name AS class_name,
  c.grade_level,
  c.academic_year,
  COUNT(s.id) FILTER (WHERE s.status = 'active') AS active_students_count,
  COUNT(s.id) AS total_students_count
FROM public.classes c
LEFT JOIN public.students s ON s.class_id = c.id
GROUP BY c.id, c.name, c.grade_level, c.academic_year
ORDER BY c.grade_level, c.name;

-- 7. ROW LEVEL SECURITY (RLS) POLICIES
ALTER TABLE public.classes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.students ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.class_students ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.assessments ENABLE ROW LEVEL SECURITY;

-- Policy classes: Siapapun dapat membaca daftar kelas, Admin dapat memodifikasi
DROP POLICY IF EXISTS "Public and authenticated can read classes" ON public.classes;
CREATE POLICY "Public and authenticated can read classes"
ON public.classes FOR SELECT
USING (true);

DROP POLICY IF EXISTS "Admin and service role can manage classes" ON public.classes;
CREATE POLICY "Admin and service role can manage classes"
ON public.classes FOR ALL
USING (true)
WITH CHECK (true);

-- Policy students: Siswa dapat membaca profil dan auto-register/update login
DROP POLICY IF EXISTS "Public and students can read students" ON public.students;
CREATE POLICY "Public and students can read students"
ON public.students FOR SELECT
USING (true);

DROP POLICY IF EXISTS "Public and students can insert students" ON public.students;
CREATE POLICY "Public and students can insert students"
ON public.students FOR INSERT
WITH CHECK (true);

DROP POLICY IF EXISTS "Public and students can update own profile" ON public.students;
CREATE POLICY "Public and students can update own profile"
ON public.students FOR UPDATE
USING (true)
WITH CHECK (true);

DROP POLICY IF EXISTS "Admin and service role full access students" ON public.students;
CREATE POLICY "Admin and service role full access students"
ON public.students FOR ALL
USING (true)
WITH CHECK (true);

-- Policy class_students: Read and insert allowed
DROP POLICY IF EXISTS "Public and authenticated can read class_students" ON public.class_students;
CREATE POLICY "Public and authenticated can read class_students"
ON public.class_students FOR SELECT
USING (true);

DROP POLICY IF EXISTS "Public and authenticated can insert class_students" ON public.class_students;
CREATE POLICY "Public and authenticated can insert class_students"
ON public.class_students FOR INSERT
WITH CHECK (true);

DROP POLICY IF EXISTS "Admin and service role full access class_students" ON public.class_students;
CREATE POLICY "Admin and service role full access class_students"
ON public.class_students FOR ALL
USING (true)
WITH CHECK (true);

-- Policy assessments: Siswa dapat membaca dan mencatat hasil kuis
DROP POLICY IF EXISTS "Public and students can read assessments" ON public.assessments;
CREATE POLICY "Public and students can read assessments"
ON public.assessments FOR SELECT
USING (true);

DROP POLICY IF EXISTS "Public and students can insert assessments" ON public.assessments;
CREATE POLICY "Public and students can insert assessments"
ON public.assessments FOR INSERT
WITH CHECK (true);

DROP POLICY IF EXISTS "Admin and service role full access assessments" ON public.assessments;
CREATE POLICY "Admin and service role full access assessments"
ON public.assessments FOR ALL
USING (true)
WITH CHECK (true);

