-- =============================================================================
-- MIGRATION 005: Penyimpanan Permanen Evaluasi, Sesi Ujian, & Pengaturan Kuis
-- =============================================================================

-- 1. Perbarui check constraint status pada quiz_attempts agar mendukung seluruh status evaluasi
DO $$
BEGIN
  IF EXISTS (
    SELECT 1 FROM information_schema.table_constraints
    WHERE table_name = 'quiz_attempts' AND constraint_name = 'quiz_attempts_status_check'
  ) THEN
    ALTER TABLE public.quiz_attempts DROP CONSTRAINT quiz_attempts_status_check;
  END IF;
END $$;

ALTER TABLE IF EXISTS public.quiz_attempts
  ADD CONSTRAINT quiz_attempts_status_check
  CHECK (status IN ('in_progress', 'submitted', 'graded', 'complete', 'incomplete', 'pending_grading'));

-- 2. Indeks performa untuk pencarian riwayat siswa, filter kuis, dan pemantauan sesi aktif
CREATE INDEX IF NOT EXISTS idx_quiz_attempts_status ON public.quiz_attempts(status);
CREATE INDEX IF NOT EXISTS idx_quiz_attempts_student_quiz ON public.quiz_attempts(student_id, quiz_id);
CREATE INDEX IF NOT EXISTS idx_quiz_attempts_completed_at ON public.quiz_attempts(completed_at DESC);

-- 3. Kebijakan Keamanan RLS: Memastikan pembacaan dan pembaruan data evaluasi berjalan lancar
ALTER TABLE IF EXISTS public.quiz_attempts ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Public and auth can read quiz_attempts" ON public.quiz_attempts;
CREATE POLICY "Public and auth can read quiz_attempts" 
  ON public.quiz_attempts FOR SELECT USING (true);

DROP POLICY IF EXISTS "Public and auth can insert quiz_attempts" ON public.quiz_attempts;
CREATE POLICY "Public and auth can insert quiz_attempts" 
  ON public.quiz_attempts FOR INSERT WITH CHECK (true);

DROP POLICY IF EXISTS "Public and auth can update quiz_attempts" ON public.quiz_attempts;
CREATE POLICY "Public and auth can update quiz_attempts" 
  ON public.quiz_attempts FOR UPDATE USING (true);
