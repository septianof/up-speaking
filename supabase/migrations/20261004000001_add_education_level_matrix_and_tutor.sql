-- ==============================================================================
-- Migration: 20261004000001_add_education_level_matrix_and_tutor.sql
-- Project: Up Speaking Placement Test System
-- Description: Penambahan jenjang pendidikan, matrix skor+waktu, tutor, dan durasi riil
-- ==============================================================================

-- 1. Tambah kolom kontak tutor pada tabel SETTINGS
ALTER TABLE public.settings
ADD COLUMN IF NOT EXISTS tutor_elementary_name VARCHAR(150) DEFAULT 'Miss Sarah',
ADD COLUMN IF NOT EXISTS tutor_elementary_whatsapp VARCHAR(20) DEFAULT '6281234567890',
ADD COLUMN IF NOT EXISTS tutor_highschool_name VARCHAR(150) DEFAULT 'Mr. David',
ADD COLUMN IF NOT EXISTS tutor_highschool_whatsapp VARCHAR(20) DEFAULT '6281234567891';

-- Update nilai default pada baris id = 1 jika masih NULL
UPDATE public.settings
SET 
  tutor_elementary_name = COALESCE(tutor_elementary_name, 'Miss Sarah'),
  tutor_elementary_whatsapp = COALESCE(tutor_elementary_whatsapp, '6281234567890'),
  tutor_highschool_name = COALESCE(tutor_highschool_name, 'Mr. David'),
  tutor_highschool_whatsapp = COALESCE(tutor_highschool_whatsapp, '6281234567891')
WHERE id = 1;

-- 2. Tambah kolom batas waktu pengerjaan (max_duration_minutes) pada tabel LEVELS
ALTER TABLE public.levels
ADD COLUMN IF NOT EXISTS max_duration_minutes INT DEFAULT NULL;

-- Perbarui batas waktu default untuk 3 level yang sudah ada
UPDATE public.levels
SET max_duration_minutes = CASE 
  WHEN LOWER(name) LIKE '%beginner%' THEN NULL
  WHEN LOWER(name) LIKE '%intermediate%' THEN 20
  WHEN LOWER(name) LIKE '%advanced%' THEN 25
  ELSE max_duration_minutes
END;

-- 3. Tambah kolom jenjang pendidikan pada tabel QUESTIONS
ALTER TABLE public.questions
ADD COLUMN IF NOT EXISTS education_level VARCHAR(20) NOT NULL DEFAULT 'elementary'
CHECK (education_level IN ('elementary', 'high_school'));

-- Buat indeks performa untuk filter jenjang & status aktif
CREATE INDEX IF NOT EXISTS idx_questions_education_active
ON public.questions (education_level, is_active);

-- 4. Tambah kolom jenjang dan durasi pengerjaan pada tabel TEST_SESSIONS
ALTER TABLE public.test_sessions
ADD COLUMN IF NOT EXISTS education_level VARCHAR(20) NOT NULL DEFAULT 'elementary'
CHECK (education_level IN ('elementary', 'high_school')),
ADD COLUMN IF NOT EXISTS duration_minutes INT DEFAULT NULL;

-- Buat indeks performa untuk pencarian pasangan nomor WA & nama siswa (fraud check permanen)
CREATE INDEX IF NOT EXISTS idx_sessions_wa_student_name
ON public.test_sessions (whatsapp_number, student_name, status);
