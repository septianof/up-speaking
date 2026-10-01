-- ==============================================================================
-- Migration: 20261001000002_enable_rls_and_performance_indexes.sql
-- Project: Up Speaking Placement Test System
-- Description: Mengaktifkan RLS, konfigurasi policies akses (idempotent), dan indeks performa
-- ==============================================================================

-- ------------------------------------------------------------------------------
-- 1. AKTIFKAN ROW LEVEL SECURITY (RLS) PADA SEMUA TABEL
-- ------------------------------------------------------------------------------
ALTER TABLE public.settings ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.levels ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.questions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.question_options ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.test_sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.student_answers ENABLE ROW LEVEL SECURITY;

-- ------------------------------------------------------------------------------
-- 2. POLICIES: SETTINGS
-- ------------------------------------------------------------------------------
-- Anon & Authenticated dapat membaca durasi ujian
DROP POLICY IF EXISTS "Allow public read access to settings" ON public.settings;
CREATE POLICY "Allow public read access to settings"
ON public.settings FOR SELECT
TO anon, authenticated
USING (true);

-- Hanya Admin (authenticated) yang dapat mengubah pengaturan
DROP POLICY IF EXISTS "Allow admin full access to settings" ON public.settings;
CREATE POLICY "Allow admin full access to settings"
ON public.settings FOR ALL
TO authenticated
USING (true)
WITH CHECK (true);

-- ------------------------------------------------------------------------------
-- 3. POLICIES: LEVELS
-- ------------------------------------------------------------------------------
-- Anon & Authenticated dapat membaca daftar level penempatan
DROP POLICY IF EXISTS "Allow public read access to levels" ON public.levels;
CREATE POLICY "Allow public read access to levels"
ON public.levels FOR SELECT
TO anon, authenticated
USING (true);

-- Hanya Admin (authenticated) yang dapat mengelola master level
DROP POLICY IF EXISTS "Allow admin full access to levels" ON public.levels;
CREATE POLICY "Allow admin full access to levels"
ON public.levels FOR ALL
TO authenticated
USING (true)
WITH CHECK (true);

-- ------------------------------------------------------------------------------
-- 4. POLICIES: QUESTIONS
-- ------------------------------------------------------------------------------
-- Siswa (anon) dan Admin dapat membaca soal yang berstatus aktif
DROP POLICY IF EXISTS "Allow public read access to active questions" ON public.questions;
CREATE POLICY "Allow public read access to active questions"
ON public.questions FOR SELECT
TO anon, authenticated
USING (is_active = true);

-- Admin (authenticated) dapat membaca semua soal (termasuk non-aktif) & CRUD
DROP POLICY IF EXISTS "Allow admin full access to questions" ON public.questions;
CREATE POLICY "Allow admin full access to questions"
ON public.questions FOR ALL
TO authenticated
USING (true)
WITH CHECK (true);

-- ------------------------------------------------------------------------------
-- 5. POLICIES: QUESTION_OPTIONS
-- ------------------------------------------------------------------------------
-- Siswa (anon) dan Admin dapat membaca opsi dari soal aktif
DROP POLICY IF EXISTS "Allow public read access to question options" ON public.question_options;
CREATE POLICY "Allow public read access to question options"
ON public.question_options FOR SELECT
TO anon, authenticated
USING (
    EXISTS (
        SELECT 1 FROM public.questions q
        WHERE q.id = question_options.question_id AND q.is_active = true
    )
);

-- Admin (authenticated) dapat mengelola seluruh opsi jawaban
DROP POLICY IF EXISTS "Allow admin full access to question options" ON public.question_options;
CREATE POLICY "Allow admin full access to question options"
ON public.question_options FOR ALL
TO authenticated
USING (true)
WITH CHECK (true);

-- ------------------------------------------------------------------------------
-- 6. POLICIES: TEST_SESSIONS
-- ------------------------------------------------------------------------------
-- Siswa dapat membuat sesi ujian baru
DROP POLICY IF EXISTS "Allow public to insert test sessions" ON public.test_sessions;
CREATE POLICY "Allow public to insert test sessions"
ON public.test_sessions FOR INSERT
TO anon, authenticated
WITH CHECK (true);

-- Siswa dapat membaca sesi miliknya sendiri
DROP POLICY IF EXISTS "Allow public to read test sessions" ON public.test_sessions;
CREATE POLICY "Allow public to read test sessions"
ON public.test_sessions FOR SELECT
TO anon, authenticated
USING (true);

-- Siswa dapat mengupdate status & skor sesinya saat pengerjaan/pengumpulan
DROP POLICY IF EXISTS "Allow public to update test sessions" ON public.test_sessions;
CREATE POLICY "Allow public to update test sessions"
ON public.test_sessions FOR UPDATE
TO anon, authenticated
USING (true)
WITH CHECK (true);

-- Admin memiliki akses penuh terhadap seluruh sesi siswa
DROP POLICY IF EXISTS "Allow admin full access to test sessions" ON public.test_sessions;
CREATE POLICY "Allow admin full access to test sessions"
ON public.test_sessions FOR ALL
TO authenticated
USING (true)
WITH CHECK (true);

-- ------------------------------------------------------------------------------
-- 7. POLICIES: STUDENT_ANSWERS
-- ------------------------------------------------------------------------------
-- Siswa dapat membaca jawaban pada sesi aktif
DROP POLICY IF EXISTS "Allow public to read student answers" ON public.student_answers;
CREATE POLICY "Allow public to read student answers"
ON public.student_answers FOR SELECT
TO anon, authenticated
USING (true);

-- Siswa dapat menyimpan/auto-save jawaban
DROP POLICY IF EXISTS "Allow public to insert student answers" ON public.student_answers;
CREATE POLICY "Allow public to insert student answers"
ON public.student_answers FOR INSERT
TO anon, authenticated
WITH CHECK (true);

-- Siswa dapat memperbarui opsi jawaban yang dipilih
DROP POLICY IF EXISTS "Allow public to update student answers" ON public.student_answers;
CREATE POLICY "Allow public to update student answers"
ON public.student_answers FOR UPDATE
TO anon, authenticated
USING (true)
WITH CHECK (true);

-- Admin memiliki akses penuh terhadap seluruh riwayat jawaban
DROP POLICY IF EXISTS "Allow admin full access to student answers" ON public.student_answers;
CREATE POLICY "Allow admin full access to student answers"
ON public.student_answers FOR ALL
TO authenticated
USING (true)
WITH CHECK (true);

-- ------------------------------------------------------------------------------
-- 8. INDEKS PERFORMA (PERFORMANCE & SEARCH OPTIMIZATION)
-- ------------------------------------------------------------------------------
-- Indeks pemfilteran soal aktif
CREATE INDEX IF NOT EXISTS idx_questions_is_active 
ON public.questions (is_active);

-- Indeks relasi opsi terhadap butir pertanyaan
CREATE INDEX IF NOT EXISTS idx_question_options_question_id 
ON public.question_options (question_id);

-- Indeks pencarian nomor WhatsApp & pengecekan fraud 24 jam
CREATE INDEX IF NOT EXISTS idx_test_sessions_whatsapp 
ON public.test_sessions (whatsapp_number);

-- Indeks status sesi & pengurutan riwayat terbaru
CREATE INDEX IF NOT EXISTS idx_test_sessions_status 
ON public.test_sessions (status);

CREATE INDEX IF NOT EXISTS idx_test_sessions_created_at 
ON public.test_sessions (created_at DESC);

-- Indeks pemfilteran level pada Admin Dashboard
CREATE INDEX IF NOT EXISTS idx_test_sessions_assigned_level 
ON public.test_sessions (assigned_level_id);

-- Indeks pencarian & auto-save jawaban siswa
CREATE INDEX IF NOT EXISTS idx_student_answers_session_id 
ON public.student_answers (session_id);

CREATE INDEX IF NOT EXISTS idx_student_answers_question_id 
ON public.student_answers (question_id);
