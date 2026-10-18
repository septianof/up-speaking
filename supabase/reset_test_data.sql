-- ==============================================================================
-- Up Speaking Placement Test System - Database Test Data Reset Script
-- Tujuan: Membersihkan seluruh data pendaftaran siswa dan riwayat pengerjaan tes uji coba
--         sehingga database kembali bersih (0 data pengerjaan) sebelum peluncuran resmi ke siswa asli.
-- 
-- CARA PENGGUNAAN:
-- 1. Buka Supabase Dashboard > Menu "SQL Editor" di bilah sisi kiri.
-- 2. Salin (copy) seluruh isi file ini, lalu tempel (paste) ke SQL Editor.
-- 3. Klik tombol "Run" (atau Ctrl+Enter).
-- ==============================================================================

-- 1. Bersihkan seluruh data lembar jawaban, evaluasi, sesi tes, dan siswa
TRUNCATE TABLE public.placement_evaluations, 
               public.test_responses, 
               public.test_sessions, 
               public.students 
CASCADE;

-- ==============================================================================
-- CATATAN KEAMANAN:
-- Perintah di atas HANYA menghapus:
--   • Data pendaftaran siswa uji coba (public.students)
--   • Sesi tes pengerjaan siswa (public.test_sessions)
--   • Lembar respon jawaban tes (public.test_responses)
--   • Keputusan evaluasi tutor (public.placement_evaluations)
--
-- Data yang TETAP UTUH & AMAN (TIDAK AKAN TERHAPUS):
--   • Bank Soal Kurikulum (public.questions & public.question_options)
--   • Akun Administrator & Staf Tutor Resmi (auth.users & public.profiles)
--
-- JIKA INGIN MENGISI KEMBALI DATA UJI COBA:
-- Jalankan kembali file `supabase/seed.sql` di SQL Editor.
-- ==============================================================================
