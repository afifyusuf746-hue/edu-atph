-- =============================================================================
-- MIGRATION 006: Dukungan Sumber Materi URL & Lampiran Permanen Supabase
-- Platform: EduATPH
-- Target Database: Supabase PostgreSQL
-- =============================================================================

-- 1. Pastikan ekstensi UUID aktif
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- 2. Tambahkan kolom pendukung pada tabel materials jika belum ada
DO $$
BEGIN
  IF EXISTS (SELECT FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'materials') THEN
    ALTER TABLE public.materials ADD COLUMN IF NOT EXISTS slug TEXT;
    ALTER TABLE public.materials ADD COLUMN IF NOT EXISTS topic TEXT;
    ALTER TABLE public.materials ADD COLUMN IF NOT EXISTS learning_objectives JSONB DEFAULT '[]'::jsonb;
    ALTER TABLE public.materials ADD COLUMN IF NOT EXISTS status TEXT DEFAULT 'published';
    ALTER TABLE public.materials ADD COLUMN IF NOT EXISTS target_class_id TEXT;
    ALTER TABLE public.materials ADD COLUMN IF NOT EXISTS category_id TEXT;
    ALTER TABLE public.materials ADD COLUMN IF NOT EXISTS pdf_url TEXT;
    ALTER TABLE public.materials ADD COLUMN IF NOT EXISTS video_url TEXT;
    ALTER TABLE public.materials ADD COLUMN IF NOT EXISTS attachments JSONB DEFAULT '[]'::jsonb;
    ALTER TABLE public.materials ADD COLUMN IF NOT EXISTS sources JSONB DEFAULT '[]'::jsonb;
    ALTER TABLE public.materials ADD COLUMN IF NOT EXISTS order_index INT DEFAULT 1;
  END IF;
END $$;

-- 3. Tabel khusus untuk Sumber Materi URL (Multi-Links: PDF, Docs, YouTube, Google Drive, Webpage)
CREATE TABLE IF NOT EXISTS public.material_sources (
  id TEXT PRIMARY KEY,
  material_id TEXT NOT NULL,
  title TEXT NOT NULL,
  url TEXT NOT NULL,
  source_type VARCHAR(50) NOT NULL DEFAULT 'webpage', -- 'pdf', 'document', 'youtube', 'gdrive', 'webpage'
  preview_url TEXT,
  file_size VARCHAR(50),
  can_embed BOOLEAN DEFAULT true,
  order_index INT NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

-- Indeks pencarian sumber materi
CREATE INDEX IF NOT EXISTS idx_material_sources_material_id ON public.material_sources (material_id);
CREATE INDEX IF NOT EXISTS idx_material_sources_type ON public.material_sources (source_type);

-- 4. Kebijakan Keamanan Row Level Security (RLS) untuk material_sources & materials
ALTER TABLE IF EXISTS public.material_sources ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public.materials ENABLE ROW LEVEL SECURITY;

-- Policy untuk material_sources
DROP POLICY IF EXISTS "Public and auth can read material_sources" ON public.material_sources;
CREATE POLICY "Public and auth can read material_sources" 
  ON public.material_sources FOR SELECT USING (true);

DROP POLICY IF EXISTS "Public and auth can insert material_sources" ON public.material_sources;
CREATE POLICY "Public and auth can insert material_sources" 
  ON public.material_sources FOR INSERT WITH CHECK (true);

DROP POLICY IF EXISTS "Public and auth can update material_sources" ON public.material_sources;
CREATE POLICY "Public and auth can update material_sources" 
  ON public.material_sources FOR UPDATE USING (true);

DROP POLICY IF EXISTS "Public and auth can delete material_sources" ON public.material_sources;
CREATE POLICY "Public and auth can delete material_sources" 
  ON public.material_sources FOR DELETE USING (true);

-- Policy untuk materials
DROP POLICY IF EXISTS "Public and auth can read materials" ON public.materials;
CREATE POLICY "Public and auth can read materials" 
  ON public.materials FOR SELECT USING (true);

DROP POLICY IF EXISTS "Public and auth can insert materials" ON public.materials;
CREATE POLICY "Public and auth can insert materials" 
  ON public.materials FOR INSERT WITH CHECK (true);

DROP POLICY IF EXISTS "Public and auth can update materials" ON public.materials;
CREATE POLICY "Public and auth can update materials" 
  ON public.materials FOR UPDATE USING (true);

DROP POLICY IF EXISTS "Public and auth can delete materials" ON public.materials;
CREATE POLICY "Public and auth can delete materials" 
  ON public.materials FOR DELETE USING (true);
