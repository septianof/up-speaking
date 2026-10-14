-- ==============================================================================
-- Up Speaking Placement Test System - Database Test Data Reset Script
-- Tujuan: Membersihkan seluruh data pendaftaran siswa dan riwayat pengerjaan tes uji coba
--         sehingga database kembali bersih (0 data) sebelum peluncuran resmi ke siswa asli.
-- 
-- CARA PENGGUNAAN:
-- 1. Buka Supabase Dashboard: https://supabase.com/dashboard/project/prmltbhkrvdjdfzhwcxv
-- 2. Masuk ke menu "SQL Editor" di bilah sisi kiri.
-- 3. Salin (copy) seluruh isi file ini, lalu tempel (paste) ke SQL Editor.
-- 4. Klik tombol "Run" (atau Ctrl+Enter).
-- ==============================================================================

-- 1. Bersihkan seluruh data lembar jawaban, evaluasi, sesi tes, dan siswa
TRUNCATE TABLE public.placement_evaluations, 
               public.test_responses, 
               public.test_sessions, 
               public.students 
CASCADE;

-- CATATAN KEAMANAN:
-- Perintah di atas HANYA menghapus:
-- - Data siswa uji coba (students)
-- - Sesi tes uji coba (test_sessions)
-- - Lembar jawaban tes (test_responses)
-- - Keputusan evaluasi tutor (placement_evaluations)
--
-- Data yang TETAP UTUH & AMAN (TIDAK TERHAPUS):
-- - Bank Soal Kurikulum (questions & question_options)
-- - Akun Administrator & Staf Resmi (auth.users & profiles)
