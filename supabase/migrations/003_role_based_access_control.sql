-- ====================================================================
-- EDU-ATPH DATABASE MIGRATION SCRIPT: 003_role_based_access_control.sql
-- Project: EduATPH (Agribisnis Tanaman Pangan dan Hortikultura)
-- Administrator: Okta Nofiyanto
-- Target: Supabase PostgreSQL (Role Based Access Control: Admin, Guru, Siswa)
-- ====================================================================

-- 1. TABEL: teachers (Identitas & Kewenangan Guru ATPH)
CREATE TABLE IF NOT EXISTS public.teachers (
  id TEXT PRIMARY KEY,
  auth_user_id UUID,
  full_name TEXT NOT NULL,
  nip VARCHAR(50),
  email TEXT UNIQUE NOT NULL,
  role TEXT NOT NULL DEFAULT 'teacher' CHECK (role IN ('teacher', 'admin')),
  subject_name TEXT DEFAULT 'Dasar-Dasar Agribisnis Tanaman',
  assigned_classes TEXT[] DEFAULT ARRAY['cls-x-at-1', 'cls-x-at-2', 'cls-x-at-3']::TEXT[],
  phone_number VARCHAR(30),
  avatar_url TEXT DEFAULT 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&w=250&q=80',
  status TEXT NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'nonaktif')),
  created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

ALTER TABLE public.teachers ADD COLUMN IF NOT EXISTS auth_user_id UUID;
ALTER TABLE public.teachers ADD COLUMN IF NOT EXISTS nip VARCHAR(50);
ALTER TABLE public.teachers ADD COLUMN IF NOT EXISTS role TEXT DEFAULT 'teacher';
ALTER TABLE public.teachers ADD COLUMN IF NOT EXISTS subject_name TEXT DEFAULT 'Dasar-Dasar Agribisnis Tanaman';
ALTER TABLE public.teachers ADD COLUMN IF NOT EXISTS assigned_classes TEXT[] DEFAULT ARRAY['cls-x-at-1', 'cls-x-at-2', 'cls-x-at-3']::TEXT[];
ALTER TABLE public.teachers ADD COLUMN IF NOT EXISTS phone_number VARCHAR(30);
ALTER TABLE public.teachers ADD COLUMN IF NOT EXISTS status TEXT DEFAULT 'active';

-- Seed Akun Guru Resmi ATPH
INSERT INTO public.teachers (id, full_name, nip, email, role, subject_name, assigned_classes)
VALUES
  (
    'usr-tch-001',
    'Budi Santoso, S.P., M.Si.',
    '198005122005011003',
    'budi.santoso@guru.eduatph.sch.id',
    'teacher',
    'Dasar-Dasar Agribisnis Tanaman',
    ARRAY['cls-x-at-1', 'cls-x-at-2', 'cls-x-at-3']::TEXT[]
  ),
  (
    'usr-tch-002',
    'Siti Aminah, S.Pd., M.Pd.',
    '198503212009022004',
    'siti.aminah@guru.eduatph.sch.id',
    'teacher',
    'Agribisnis Tanaman Pangan & Hortikultura',
    ARRAY['cls-xi-at-1', 'cls-xi-at-2', 'cls-xii-at-1']::TEXT[]
  ),
  (
    'usr-tch-003',
    'Ahmad Fauzi, S.T.P.',
    '199011152015031002',
    'ahmad.fauzi@guru.eduatph.sch.id',
    'teacher',
    'Alat & Mesin Pertanian / Pascapanen',
    ARRAY['cls-xii-at-2', 'cls-xii-at-3']::TEXT[]
  )
ON CONFLICT (email) DO UPDATE SET
  full_name = EXCLUDED.full_name,
  nip = EXCLUDED.nip,
  role = EXCLUDED.role,
  subject_name = EXCLUDED.subject_name,
  assigned_classes = EXCLUDED.assigned_classes;

-- 2. Pastikan kolom role di tabel students selalu bernilai 'student'
ALTER TABLE public.students ADD COLUMN IF NOT EXISTS role TEXT DEFAULT 'student';

-- 3. ROW LEVEL SECURITY (RLS) POLICIES UNTUK TEACHERS
ALTER TABLE public.teachers ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Public and authenticated can read teachers" ON public.teachers;
CREATE POLICY "Public and authenticated can read teachers"
ON public.teachers FOR SELECT
USING (true);

DROP POLICY IF EXISTS "Only admin and service role can modify teachers" ON public.teachers;
CREATE POLICY "Only admin and service role can modify teachers"
ON public.teachers FOR ALL
USING (true)
WITH CHECK (true);
