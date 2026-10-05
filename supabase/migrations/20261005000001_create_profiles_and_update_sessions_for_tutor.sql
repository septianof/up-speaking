-- ==============================================================================
-- Migration: 20261005000001_create_profiles_and_update_sessions_for_tutor.sql
-- Project: Up Speaking Placement Test System
-- Description: Tambah tabel profiles (admin & tutor), perbarui status test_sessions,
--              tambah reviewed_by, tutor_notes, dan setup RLS.
-- ==============================================================================

-- 1. Buat Tabel PROFILES untuk Manajemen Akun Staf (Admin & Tutor)
CREATE TABLE IF NOT EXISTS public.profiles (
    id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    email VARCHAR(255) NOT NULL,
    full_name VARCHAR(150) NOT NULL,
    role VARCHAR(20) NOT NULL DEFAULT 'tutor' CHECK (role IN ('admin', 'tutor')),
    education_level VARCHAR(20) DEFAULT NULL CHECK (education_level IS NULL OR education_level IN ('elementary', 'high_school')),
    created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

-- Indeks performa untuk role dan jenjang tutor
CREATE INDEX IF NOT EXISTS idx_profiles_role ON public.profiles (role);
CREATE INDEX IF NOT EXISTS idx_profiles_education ON public.profiles (education_level);

-- 2. Perbarui Kolom STATUS pada Tabel TEST_SESSIONS
-- Hapus constraint status lama jika ada
DO $$
BEGIN
    ALTER TABLE public.test_sessions DROP CONSTRAINT IF EXISTS test_sessions_status_check;
EXCEPTION
    WHEN OTHERS THEN NULL;
END $$;

-- Terapkan validasi status baru: registered, in_progress, submitted, graded (plus completed, expired)
ALTER TABLE public.test_sessions
ADD CONSTRAINT test_sessions_status_check 
CHECK (status IN ('registered', 'in_progress', 'submitted', 'graded', 'completed', 'expired'));

-- Ubah default nilai status pendaftaran baru menjadi 'registered'
ALTER TABLE public.test_sessions
ALTER COLUMN status SET DEFAULT 'registered';

-- 3. Tambah Kolom REVIEWED_BY pada TEST_SESSIONS
ALTER TABLE public.test_sessions
ADD COLUMN IF NOT EXISTS reviewed_by UUID REFERENCES public.profiles(id) ON DELETE SET NULL;

-- Indeks performa untuk antrean evaluasi tutor dan pencarian evaluator
CREATE INDEX IF NOT EXISTS idx_sessions_status_education 
ON public.test_sessions (status, education_level);

CREATE INDEX IF NOT EXISTS idx_sessions_reviewed_by
ON public.test_sessions (reviewed_by);

-- 4. Setup Row Level Security (RLS) pada tabel PROFILES
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

-- Hapus policy lama jika ada untuk memastikan idempotency
DROP POLICY IF EXISTS "Authenticated users can view profiles" ON public.profiles;
DROP POLICY IF EXISTS "Users can update own profile" ON public.profiles;
DROP POLICY IF EXISTS "Service role has full access to profiles" ON public.profiles;

-- Seluruh staf terautentikasi (Admin & Tutor) dapat membaca data profil staf
CREATE POLICY "Authenticated users can view profiles"
ON public.profiles
FOR SELECT
TO authenticated
USING (true);

-- Pengguna staf dapat memperbarui data profilnya sendiri
CREATE POLICY "Users can update own profile"
ON public.profiles
FOR UPDATE
TO authenticated
USING (auth.uid() = id)
WITH CHECK (auth.uid() = id);

-- Service role Supabase memiliki akses penuh
CREATE POLICY "Service role has full access to profiles"
ON public.profiles
FOR ALL
TO service_role
USING (true)
WITH CHECK (true);
