-- ==============================================================================
-- Migration: 20261005000003_drop_end_time_not_null_and_seed_test_students.sql
-- Project: Up Speaking Placement Test System
-- Description: Drop NOT NULL constraint pada kolom end_time (karena ujian untimed),
--              dan seeder akun siswa uji coba berstatus 'registered'.
-- ==============================================================================

-- 1. Jadikan kolom end_time NULLABLE karena ujian bersifat santai (untimed duration)
ALTER TABLE public.test_sessions 
ALTER COLUMN end_time DROP NOT NULL;

-- 2. Seed data siswa uji coba untuk Elementary & High School
INSERT INTO public.test_sessions (student_name, whatsapp_number, education_level, status)
VALUES 
  ('Budi Santoso', '6281234567890', 'elementary', 'registered'),
  ('Siti Rahma', '6281234567891', 'high_school', 'registered')
ON CONFLICT DO NOTHING;
