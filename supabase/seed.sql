-- ==============================================================================
-- Up Speaking Placement Test System - Database Seeder Lengkap
-- Platform: Supabase (PostgreSQL 15+)
-- Reference: docs/TECHNICAL_SPEC.md (Section 12.2) & docs/PRD.md
-- ==============================================================================
-- File ini menyediakan data uji coba awal yang lengkap dan komprehensif:
-- 1. Akun Staf (Admin, Tutor Elementary, dan Tutor High School) di Supabase Auth & public.profiles
-- 2. Bank Soal Resmi (10 Soal Elementary + 10 Soal High School dengan Opsi)
-- 3. Sampel Siswa Lengkap dengan ragam status (NOT_STARTED, IN_PROGRESS, COMPLETED, FINALIZED, RESET)
-- 4. Sesi Tes (test_sessions), Lembar Jawaban (test_responses), dan Evaluasi (placement_evaluations)
-- ==============================================================================

CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- ==============================================================================
-- 1. Akun Staf (Admin, Tutor Elementary, dan Tutor High School)
-- ==============================================================================
-- Kredensial Pengujian Standar:
-- • Administrator     : admin@upspeaking.com           / Kata Sandi: Admin123!
-- • Tutor Elementary  : dewi.elementary@upspeaking.com / Kata Sandi: Tutor123!
-- • Tutor High School : rian.highschool@upspeaking.com / Kata Sandi: Tutor123!
-- ==============================================================================

DO $$
DECLARE
  v_admin_id UUID := 'a0000000-0000-0000-0000-000000000001';
  v_tutor_sd_id UUID := 'a0000000-0000-0000-0000-000000000002';
  v_tutor_sma_id UUID := 'a0000000-0000-0000-0000-000000000003';
BEGIN
  -- 1.1 Inisialisasi Administrator Utama
  IF NOT EXISTS (SELECT 1 FROM auth.users WHERE email = 'admin@upspeaking.com') THEN
    INSERT INTO auth.users (
      instance_id, id, aud, role, email, encrypted_password, 
      email_confirmed_at, raw_app_meta_data, raw_user_meta_data, 
      created_at, updated_at, confirmation_token, recovery_token
    ) VALUES (
      '00000000-0000-0000-0000-000000000000',
      v_admin_id,
      'authenticated',
      'authenticated',
      'admin@upspeaking.com',
      crypt('Admin123!', gen_salt('bf')),
      NOW(),
      '{"provider":"email","providers":["email"]}',
      '{"full_name":"Administrator Utama"}',
      NOW(),
      NOW(),
      '',
      ''
    );
  ELSE
    SELECT id INTO v_admin_id FROM auth.users WHERE email = 'admin@upspeaking.com';
  END IF;

  INSERT INTO public.profiles (id, full_name, email, role)
  VALUES (v_admin_id, 'Administrator Utama', 'admin@upspeaking.com', 'ADMIN')
  ON CONFLICT (id) DO UPDATE SET full_name = EXCLUDED.full_name, role = EXCLUDED.role;

  -- 1.2 Inisialisasi Tutor Elementary
  IF NOT EXISTS (SELECT 1 FROM auth.users WHERE email = 'dewi.elementary@upspeaking.com') THEN
    INSERT INTO auth.users (
      instance_id, id, aud, role, email, encrypted_password, 
      email_confirmed_at, raw_app_meta_data, raw_user_meta_data, 
      created_at, updated_at, confirmation_token, recovery_token
    ) VALUES (
      '00000000-0000-0000-0000-000000000000',
      v_tutor_sd_id,
      'authenticated',
      'authenticated',
      'dewi.elementary@upspeaking.com',
      crypt('Tutor123!', gen_salt('bf')),
      NOW(),
      '{"provider":"email","providers":["email"]}',
      '{"full_name":"Dewi Sartika, S.Pd."}',
      NOW(),
      NOW(),
      '',
      ''
    );
  ELSE
    SELECT id INTO v_tutor_sd_id FROM auth.users WHERE email = 'dewi.elementary@upspeaking.com';
  END IF;

  INSERT INTO public.profiles (id, full_name, email, role)
  VALUES (v_tutor_sd_id, 'Dewi Sartika, S.Pd.', 'dewi.elementary@upspeaking.com', 'TUTOR_ELEMENTARY')
  ON CONFLICT (id) DO UPDATE SET full_name = EXCLUDED.full_name, role = EXCLUDED.role;

  -- 1.3 Inisialisasi Tutor High School
  IF NOT EXISTS (SELECT 1 FROM auth.users WHERE email = 'rian.highschool@upspeaking.com') THEN
    INSERT INTO auth.users (
      instance_id, id, aud, role, email, encrypted_password, 
      email_confirmed_at, raw_app_meta_data, raw_user_meta_data, 
      created_at, updated_at, confirmation_token, recovery_token
    ) VALUES (
      '00000000-0000-0000-0000-000000000000',
      v_tutor_sma_id,
      'authenticated',
      'authenticated',
      'rian.highschool@upspeaking.com',
      crypt('Tutor123!', gen_salt('bf')),
      NOW(),
      '{"provider":"email","providers":["email"]}',
      '{"full_name":"Rian Hidayat, M.Hum."}',
      NOW(),
      NOW(),
      '',
      ''
    );
  ELSE
    SELECT id INTO v_tutor_sma_id FROM auth.users WHERE email = 'rian.highschool@upspeaking.com';
  END IF;

  INSERT INTO public.profiles (id, full_name, email, role)
  VALUES (v_tutor_sma_id, 'Rian Hidayat, M.Hum.', 'rian.highschool@upspeaking.com', 'TUTOR_HIGH_SCHOOL')
  ON CONFLICT (id) DO UPDATE SET full_name = EXCLUDED.full_name, role = EXCLUDED.role;
END $$;


-- ==============================================================================
-- 2. Bank Soal ELEMENTARY - 10 Butir Soal dengan 4 Opsi Jawaban
-- ==============================================================================

-- Q1
INSERT INTO public.questions (id, target_level, question_text, is_active)
VALUES ('e1111111-0000-0000-0000-000000000001', 'ELEMENTARY', 'What is the color of the sun?', true)
ON CONFLICT (id) DO NOTHING;

INSERT INTO public.question_options (question_id, option_text, is_correct, sort_order)
VALUES 
  ('e1111111-0000-0000-0000-000000000001', 'Yellow', true, 1),
  ('e1111111-0000-0000-0000-000000000001', 'Blue', false, 2),
  ('e1111111-0000-0000-0000-000000000001', 'Green', false, 3),
  ('e1111111-0000-0000-0000-000000000001', 'Purple', false, 4)
ON CONFLICT DO NOTHING;

-- Q2
INSERT INTO public.questions (id, target_level, question_text, is_active)
VALUES ('e1111111-0000-0000-0000-000000000002', 'ELEMENTARY', 'My sister ... an apple every morning.', true)
ON CONFLICT (id) DO NOTHING;

INSERT INTO public.question_options (question_id, option_text, is_correct, sort_order)
VALUES 
  ('e1111111-0000-0000-0000-000000000002', 'eat', false, 1),
  ('e1111111-0000-0000-0000-000000000002', 'eats', true, 2),
  ('e1111111-0000-0000-0000-000000000002', 'eating', false, 3),
  ('e1111111-0000-0000-0000-000000000002', 'ate', false, 4)
ON CONFLICT DO NOTHING;

-- Q3
INSERT INTO public.questions (id, target_level, question_text, is_active)
VALUES ('e1111111-0000-0000-0000-000000000003', 'ELEMENTARY', 'How many days are there in a week?', true)
ON CONFLICT (id) DO NOTHING;

INSERT INTO public.question_options (question_id, option_text, is_correct, sort_order)
VALUES 
  ('e1111111-0000-0000-0000-000000000003', 'Five', false, 1),
  ('e1111111-0000-0000-0000-000000000003', 'Six', false, 2),
  ('e1111111-0000-0000-0000-000000000003', 'Seven', true, 3),
  ('e1111111-0000-0000-0000-000000000003', 'Eight', false, 4)
ON CONFLICT DO NOTHING;

-- Q4
INSERT INTO public.questions (id, target_level, question_text, is_active)
VALUES ('e1111111-0000-0000-0000-000000000004', 'ELEMENTARY', 'Where do you go to borrow books?', true)
ON CONFLICT (id) DO NOTHING;

INSERT INTO public.question_options (question_id, option_text, is_correct, sort_order)
VALUES 
  ('e1111111-0000-0000-0000-000000000004', 'Hospital', false, 1),
  ('e1111111-0000-0000-0000-000000000004', 'Library', true, 2),
  ('e1111111-0000-0000-0000-000000000004', 'Cinema', false, 3),
  ('e1111111-0000-0000-0000-000000000004', 'Market', false, 4)
ON CONFLICT DO NOTHING;

-- Q5
INSERT INTO public.questions (id, target_level, question_text, is_active)
VALUES ('e1111111-0000-0000-0000-000000000005', 'ELEMENTARY', 'The elephant is ... than the cat.', true)
ON CONFLICT (id) DO NOTHING;

INSERT INTO public.question_options (question_id, option_text, is_correct, sort_order)
VALUES 
  ('e1111111-0000-0000-0000-000000000005', 'big', false, 1),
  ('e1111111-0000-0000-0000-000000000005', 'bigger', true, 2),
  ('e1111111-0000-0000-0000-000000000005', 'biggest', false, 3),
  ('e1111111-0000-0000-0000-000000000005', 'more big', false, 4)
ON CONFLICT DO NOTHING;

-- Q6
INSERT INTO public.questions (id, target_level, question_text, is_active)
VALUES ('e1111111-0000-0000-0000-000000000006', 'ELEMENTARY', 'Choose the correct greeting for 8:00 AM:', true)
ON CONFLICT (id) DO NOTHING;

INSERT INTO public.question_options (question_id, option_text, is_correct, sort_order)
VALUES 
  ('e1111111-0000-0000-0000-000000000006', 'Good morning', true, 1),
  ('e1111111-0000-0000-0000-000000000006', 'Good afternoon', false, 2),
  ('e1111111-0000-0000-0000-000000000006', 'Good evening', false, 3),
  ('e1111111-0000-0000-0000-000000000006', 'Good night', false, 4)
ON CONFLICT DO NOTHING;

-- Q7
INSERT INTO public.questions (id, target_level, question_text, is_active)
VALUES ('e1111111-0000-0000-0000-000000000007', 'ELEMENTARY', 'They ... playing football in the field right now.', true)
ON CONFLICT (id) DO NOTHING;

INSERT INTO public.question_options (question_id, option_text, is_correct, sort_order)
VALUES 
  ('e1111111-0000-0000-0000-000000000007', 'is', false, 1),
  ('e1111111-0000-0000-0000-000000000007', 'am', false, 2),
  ('e1111111-0000-0000-0000-000000000007', 'are', true, 3),
  ('e1111111-0000-0000-0000-000000000007', 'be', false, 4)
ON CONFLICT DO NOTHING;

-- Q8
INSERT INTO public.questions (id, target_level, question_text, is_active)
VALUES ('e1111111-0000-0000-0000-000000000008', 'ELEMENTARY', 'What do birds use to fly?', true)
ON CONFLICT (id) DO NOTHING;

INSERT INTO public.question_options (question_id, option_text, is_correct, sort_order)
VALUES 
  ('e1111111-0000-0000-0000-000000000008', 'Fins', false, 1),
  ('e1111111-0000-0000-0000-000000000008', 'Wings', true, 2),
  ('e1111111-0000-0000-0000-000000000008', 'Arms', false, 3),
  ('e1111111-0000-0000-0000-000000000008', 'Tails', false, 4)
ON CONFLICT DO NOTHING;

-- Q9
INSERT INTO public.questions (id, target_level, question_text, is_active)
VALUES ('e1111111-0000-0000-0000-000000000009', 'ELEMENTARY', 'This is my bag. That bag over there is ...', true)
ON CONFLICT (id) DO NOTHING;

INSERT INTO public.question_options (question_id, option_text, is_correct, sort_order)
VALUES 
  ('e1111111-0000-0000-0000-000000000009', 'your', false, 1),
  ('e1111111-0000-0000-0000-000000000009', 'yours', true, 2),
  ('e1111111-0000-0000-0000-000000000009', 'you', false, 3),
  ('e1111111-0000-0000-0000-000000000009', 'yourself', false, 4)
ON CONFLICT DO NOTHING;

-- Q10
INSERT INTO public.questions (id, target_level, question_text, is_active)
VALUES ('e1111111-0000-0000-0000-000000000010', 'ELEMENTARY', 'Yesterday, I ... a new pencil case at the store.', true)
ON CONFLICT (id) DO NOTHING;

INSERT INTO public.question_options (question_id, option_text, is_correct, sort_order)
VALUES 
  ('e1111111-0000-0000-0000-000000000010', 'buy', false, 1),
  ('e1111111-0000-0000-0000-000000000010', 'bought', true, 2),
  ('e1111111-0000-0000-0000-000000000010', 'buys', false, 3),
  ('e1111111-0000-0000-0000-000000000010', 'buying', false, 4)
ON CONFLICT DO NOTHING;


-- ==============================================================================
-- 3. Bank Soal HIGH SCHOOL - 10 Butir Soal dengan 4 Opsi Jawaban
-- ==============================================================================

-- Q1
INSERT INTO public.questions (id, target_level, question_text, is_active)
VALUES ('c1111111-0000-0000-0000-000000000001', 'HIGH_SCHOOL', 'If it rains tomorrow, we ... the outdoor workshop.', true)
ON CONFLICT (id) DO NOTHING;

INSERT INTO public.question_options (question_id, option_text, is_correct, sort_order)
VALUES 
  ('c1111111-0000-0000-0000-000000000001', 'cancel', false, 1),
  ('c1111111-0000-0000-0000-000000000001', 'will cancel', true, 2),
  ('c1111111-0000-0000-0000-000000000001', 'would cancel', false, 3),
  ('c1111111-0000-0000-0000-000000000001', 'had cancelled', false, 4)
ON CONFLICT DO NOTHING;

-- Q2
INSERT INTO public.questions (id, target_level, question_text, is_active)
VALUES ('c1111111-0000-0000-0000-000000000002', 'HIGH_SCHOOL', 'The research paper ... by the professor before the symposium began.', true)
ON CONFLICT (id) DO NOTHING;

INSERT INTO public.question_options (question_id, option_text, is_correct, sort_order)
VALUES 
  ('c1111111-0000-0000-0000-000000000002', 'had been reviewed', true, 1),
  ('c1111111-0000-0000-0000-000000000002', 'has reviewed', false, 2),
  ('c1111111-0000-0000-0000-000000000002', 'was reviewing', false, 3),
  ('c1111111-0000-0000-0000-000000000002', 'reviews', false, 4)
ON CONFLICT DO NOTHING;

-- Q3
INSERT INTO public.questions (id, target_level, question_text, is_active)
VALUES ('c1111111-0000-0000-0000-000000000003', 'HIGH_SCHOOL', 'Despite the heavy rain, the students continued their community service. The word "Despite" means ...', true)
ON CONFLICT (id) DO NOTHING;

INSERT INTO public.question_options (question_id, option_text, is_correct, sort_order)
VALUES 
  ('c1111111-0000-0000-0000-000000000003', 'Because of', false, 1),
  ('c1111111-0000-0000-0000-000000000003', 'In spite of', true, 2),
  ('c1111111-0000-0000-0000-000000000003', 'Therefore', false, 3),
  ('c1111111-0000-0000-0000-000000000003', 'Moreover', false, 4)
ON CONFLICT DO NOTHING;

-- Q4
INSERT INTO public.questions (id, target_level, question_text, is_active)
VALUES ('c1111111-0000-0000-0000-000000000004', 'HIGH_SCHOOL', 'Neither the teacher nor the students ... satisfied with the sudden schedule change.', true)
ON CONFLICT (id) DO NOTHING;

INSERT INTO public.question_options (question_id, option_text, is_correct, sort_order)
VALUES 
  ('c1111111-0000-0000-0000-000000000004', 'was', false, 1),
  ('c1111111-0000-0000-0000-000000000004', 'were', true, 2),
  ('c1111111-0000-0000-0000-000000000004', 'is', false, 3),
  ('c1111111-0000-0000-0000-000000000004', 'be', false, 4)
ON CONFLICT DO NOTHING;

-- Q5
INSERT INTO public.questions (id, target_level, question_text, is_active)
VALUES ('c1111111-0000-0000-0000-000000000005', 'HIGH_SCHOOL', 'She has lived in Jakarta ... more than a decade.', true)
ON CONFLICT (id) DO NOTHING;

INSERT INTO public.question_options (question_id, option_text, is_correct, sort_order)
VALUES 
  ('c1111111-0000-0000-0000-000000000005', 'since', false, 1),
  ('c1111111-0000-0000-0000-000000000005', 'for', true, 2),
  ('c1111111-0000-0000-0000-000000000005', 'during', false, 3),
  ('c1111111-0000-0000-0000-000000000005', 'from', false, 4)
ON CONFLICT DO NOTHING;

-- Q6
INSERT INTO public.questions (id, target_level, question_text, is_active)
VALUES ('c1111111-0000-0000-0000-000000000006', 'HIGH_SCHOOL', 'The scientist ... discovery revolutionized renewable energy was awarded the Nobel Prize.', true)
ON CONFLICT (id) DO NOTHING;

INSERT INTO public.question_options (question_id, option_text, is_correct, sort_order)
VALUES 
  ('c1111111-0000-0000-0000-000000000006', 'who', false, 1),
  ('c1111111-0000-0000-0000-000000000006', 'whom', false, 2),
  ('c1111111-0000-0000-0000-000000000006', 'whose', true, 3),
  ('c1111111-0000-0000-0000-000000000006', 'which', false, 4)
ON CONFLICT DO NOTHING;

-- Q7
INSERT INTO public.questions (id, target_level, question_text, is_active)
VALUES ('c1111111-0000-0000-0000-000000000007', 'HIGH_SCHOOL', 'You should avoid ... unnecessary risks when conducting chemical experiments.', true)
ON CONFLICT (id) DO NOTHING;

INSERT INTO public.question_options (question_id, option_text, is_correct, sort_order)
VALUES 
  ('c1111111-0000-0000-0000-000000000007', 'take', false, 1),
  ('c1111111-0000-0000-0000-000000000007', 'to take', false, 2),
  ('c1111111-0000-0000-0000-000000000007', 'taking', true, 3),
  ('c1111111-0000-0000-0000-000000000007', 'taken', false, 4)
ON CONFLICT DO NOTHING;

-- Q8
INSERT INTO public.questions (id, target_level, question_text, is_active)
VALUES ('c1111111-0000-0000-0000-000000000008', 'HIGH_SCHOOL', 'Had they known about the traffic jam, they ... an alternative route.', true)
ON CONFLICT (id) DO NOTHING;

INSERT INTO public.question_options (question_id, option_text, is_correct, sort_order)
VALUES 
  ('c1111111-0000-0000-0000-000000000008', 'would take', false, 1),
  ('c1111111-0000-0000-0000-000000000008', 'would have taken', true, 2),
  ('c1111111-0000-0000-0000-000000000008', 'will take', false, 3),
  ('c1111111-0000-0000-0000-000000000008', 'had taken', false, 4)
ON CONFLICT DO NOTHING;

-- Q9
INSERT INTO public.questions (id, target_level, question_text, is_active)
VALUES ('c1111111-0000-0000-0000-000000000009', 'HIGH_SCHOOL', 'The term "meticulous" is closest in meaning to:', true)
ON CONFLICT (id) DO NOTHING;

INSERT INTO public.question_options (question_id, option_text, is_correct, sort_order)
VALUES 
  ('c1111111-0000-0000-0000-000000000009', 'Careful and precise', true, 1),
  ('c1111111-0000-0000-0000-000000000009', 'Fast and energetic', false, 2),
  ('c1111111-0000-0000-0000-000000000009', 'Careless and sloppy', false, 3),
  ('c1111111-0000-0000-0000-000000000009', 'Hesitant and doubtful', false, 4)
ON CONFLICT DO NOTHING;

-- Q10
INSERT INTO public.questions (id, target_level, question_text, is_active)
VALUES ('c1111111-0000-0000-0000-000000000010', 'HIGH_SCHOOL', 'Not only ... the English debate championship, but they also won the best speaker award.', true)
ON CONFLICT (id) DO NOTHING;

INSERT INTO public.question_options (question_id, option_text, is_correct, sort_order)
VALUES 
  ('c1111111-0000-0000-0000-000000000010', 'they won', false, 1),
  ('c1111111-0000-0000-0000-000000000010', 'did they win', true, 2),
  ('c1111111-0000-0000-0000-000000000010', 'they have won', false, 3),
  ('c1111111-0000-0000-0000-000000000010', 'won they', false, 4)
ON CONFLICT DO NOTHING;


-- ==============================================================================
-- 4. Sampel Data Siswa (students) dengan Ragam Status
-- ==============================================================================
-- Daftar Akun Siswa Uji Coba:
-- 1. Budi Santoso   (081234567890) -> Elementary  | Belum mulai (NOT_STARTED) - Siap uji coba login siswa
-- 2. Ahmad Dahlan   (081234567891) -> Elementary  | Sedang tes (IN_PROGRESS)
-- 3. Siti Rahmawati (081234567892) -> Elementary  | Selesai tes (COMPLETED) - Siap dinilai Tutor Elementary
-- 4. Fajar Pratama  (081234567893) -> Elementary  | Selesai dinilai (FINALIZED -> ADVANCED)
-- 5. Nadia Putri    (081234567894) -> High School | Selesai tes (COMPLETED) - Siap dinilai Tutor High School
-- 6. Citra Lestari  (081234567895) -> High School | Selesai dinilai (FINALIZED -> INTERMEDIATE)
-- 7. Rizky Ramadhan (081234567896) -> High School | Riwayat di-reset (RESET) - Siap uji audit trail
-- ==============================================================================

INSERT INTO public.students (id, full_name, phone_number, target_level, created_at)
VALUES 
  ('11111111-1111-1111-1111-111111111111', 'Budi Santoso', '081234567890', 'ELEMENTARY', NOW() - INTERVAL '2 days'),
  ('22222222-2222-2222-2222-222222222222', 'Ahmad Dahlan', '081234567891', 'ELEMENTARY', NOW() - INTERVAL '1 day'),
  ('33333333-3333-3333-3333-333333333333', 'Siti Rahmawati', '081234567892', 'ELEMENTARY', NOW() - INTERVAL '1 day'),
  ('44444444-4444-4444-4444-444444444444', 'Fajar Pratama', '081234567893', 'ELEMENTARY', NOW() - INTERVAL '3 days'),
  ('55555555-5555-5555-5555-555555555555', 'Nadia Putri', '081234567894', 'HIGH_SCHOOL', NOW() - INTERVAL '2 days'),
  ('66666666-6666-6666-6666-666666666666', 'Citra Lestari', '081234567895', 'HIGH_SCHOOL', NOW() - INTERVAL '4 days'),
  ('77777777-7777-7777-7777-777777777777', 'Rizky Ramadhan', '081234567896', 'HIGH_SCHOOL', NOW() - INTERVAL '5 days')
ON CONFLICT (id) DO UPDATE SET 
  full_name = EXCLUDED.full_name,
  phone_number = EXCLUDED.phone_number,
  target_level = EXCLUDED.target_level;


-- ==============================================================================
-- 5. Siklus Sesi Ujian (test_sessions)
-- ==============================================================================

INSERT INTO public.test_sessions (id, student_id, started_at, submitted_at, elapsed_seconds, score_percentage, device_token, status, created_at)
VALUES 
  -- Sesi Ahmad Dahlan (IN_PROGRESS - sedang mengerjakan, durasi berjalan 480 detik)
  ('s2222222-0000-0000-0000-000000000001', '22222222-2222-2222-2222-222222222222', 
   NOW() - INTERVAL '15 minutes', NULL, 480, 0.00, 'dev_token_ahmad', 'IN_PROGRESS', NOW() - INTERVAL '15 minutes'),
  
  -- Sesi Siti Rahmawati (COMPLETED - skor 70%, menunggu dinilai di tab "Perlu Dinilai" Tutor Elementary)
  ('s3333333-0000-0000-0000-000000000001', '33333333-3333-3333-3333-333333333333', 
   NOW() - INTERVAL '45 minutes', NOW() - INTERVAL '30 minutes', 900, 70.00, 'dev_token_siti', 'COMPLETED', NOW() - INTERVAL '45 minutes'),
  
  -- Sesi Fajar Pratama (FINALIZED - skor 90%, sudah ditetapkan ADVANCED oleh Tutor Elementary)
  ('s4444444-0000-0000-0000-000000000001', '44444444-4444-4444-4444-444444444444', 
   NOW() - INTERVAL '2 hours', NOW() - INTERVAL '1 hour 45 minutes', 820, 90.00, 'dev_token_fajar', 'FINALIZED', NOW() - INTERVAL '2 hours'),
  
  -- Sesi Nadia Putri (COMPLETED - skor 80%, menunggu dinilai di tab "Perlu Dinilai" Tutor High School)
  ('s5555555-0000-0000-0000-000000000001', '55555555-5555-5555-5555-555555555555', 
   NOW() - INTERVAL '1 hour', NOW() - INTERVAL '40 minutes', 1150, 80.00, 'dev_token_nadia', 'COMPLETED', NOW() - INTERVAL '1 hour'),
  
  -- Sesi Citra Lestari (FINALIZED - skor 60%, sudah ditetapkan INTERMEDIATE oleh Tutor High School)
  ('s6666666-0000-0000-0000-000000000001', '66666666-6666-6666-6666-666666666666', 
   NOW() - INTERVAL '3 hours', NOW() - INTERVAL '2 hours 35 minutes', 1210, 60.00, 'dev_token_citra', 'FINALIZED', NOW() - INTERVAL '3 hours'),
  
  -- Sesi Rizky Ramadhan (RESET - sesi lama dibekukan karena soft reset oleh Admin)
  ('s7777777-0000-0000-0000-000000000001', '77777777-7777-7777-7777-777777777777', 
   NOW() - INTERVAL '1 day', NULL, 310, 0.00, 'dev_token_rizky_old', 'RESET', NOW() - INTERVAL '1 day')
ON CONFLICT (id) DO UPDATE SET 
  status = EXCLUDED.status,
  score_percentage = EXCLUDED.score_percentage,
  elapsed_seconds = EXCLUDED.elapsed_seconds;


-- ==============================================================================
-- 6. Lembar Respon Jawaban Siswa (test_responses)
-- ==============================================================================

-- Respon Jawaban Siti Rahmawati (ELEMENTARY - 7 jawaban benar dari 10 soal)
INSERT INTO public.test_responses (session_id, question_id, selected_option_id, display_order)
VALUES
  ('s3333333-0000-0000-0000-000000000001', 'e1111111-0000-0000-0000-000000000001', (SELECT id FROM public.question_options WHERE question_id = 'e1111111-0000-0000-0000-000000000001' AND is_correct = true LIMIT 1), 1),
  ('s3333333-0000-0000-0000-000000000001', 'e1111111-0000-0000-0000-000000000002', (SELECT id FROM public.question_options WHERE question_id = 'e1111111-0000-0000-0000-000000000002' AND is_correct = true LIMIT 1), 2),
  ('s3333333-0000-0000-0000-000000000001', 'e1111111-0000-0000-0000-000000000003', (SELECT id FROM public.question_options WHERE question_id = 'e1111111-0000-0000-0000-000000000003' AND is_correct = true LIMIT 1), 3),
  ('s3333333-0000-0000-0000-000000000001', 'e1111111-0000-0000-0000-000000000004', (SELECT id FROM public.question_options WHERE question_id = 'e1111111-0000-0000-0000-000000000004' AND is_correct = false LIMIT 1), 4),
  ('s3333333-0000-0000-0000-000000000001', 'e1111111-0000-0000-0000-000000000005', (SELECT id FROM public.question_options WHERE question_id = 'e1111111-0000-0000-0000-000000000005' AND is_correct = true LIMIT 1), 5),
  ('s3333333-0000-0000-0000-000000000001', 'e1111111-0000-0000-0000-000000000006', (SELECT id FROM public.question_options WHERE question_id = 'e1111111-0000-0000-0000-000000000006' AND is_correct = true LIMIT 1), 6),
  ('s3333333-0000-0000-0000-000000000001', 'e1111111-0000-0000-0000-000000000007', (SELECT id FROM public.question_options WHERE question_id = 'e1111111-0000-0000-0000-000000000007' AND is_correct = true LIMIT 1), 7),
  ('s3333333-0000-0000-0000-000000000001', 'e1111111-0000-0000-0000-000000000008', (SELECT id FROM public.question_options WHERE question_id = 'e1111111-0000-0000-0000-000000000008' AND is_correct = false LIMIT 1), 8),
  ('s3333333-0000-0000-0000-000000000001', 'e1111111-0000-0000-0000-000000000009', (SELECT id FROM public.question_options WHERE question_id = 'e1111111-0000-0000-0000-000000000009' AND is_correct = true LIMIT 1), 9),
  ('s3333333-0000-0000-0000-000000000001', 'e1111111-0000-0000-0000-000000000010', (SELECT id FROM public.question_options WHERE question_id = 'e1111111-0000-0000-0000-000000000010' AND is_correct = false LIMIT 1), 10)
ON CONFLICT (session_id, question_id) DO NOTHING;

-- Respon Jawaban Nadia Putri (HIGH_SCHOOL - 8 jawaban benar dari 10 soal)
INSERT INTO public.test_responses (session_id, question_id, selected_option_id, display_order)
VALUES
  ('s5555555-0000-0000-0000-000000000001', 'c1111111-0000-0000-0000-000000000001', (SELECT id FROM public.question_options WHERE question_id = 'c1111111-0000-0000-0000-000000000001' AND is_correct = true LIMIT 1), 1),
  ('s5555555-0000-0000-0000-000000000002', 'c1111111-0000-0000-0000-000000000002', (SELECT id FROM public.question_options WHERE question_id = 'c1111111-0000-0000-0000-000000000002' AND is_correct = true LIMIT 1), 2),
  ('s5555555-0000-0000-0000-000000000003', 'c1111111-0000-0000-0000-000000000003', (SELECT id FROM public.question_options WHERE question_id = 'c1111111-0000-0000-0000-000000000003' AND is_correct = true LIMIT 1), 3),
  ('s5555555-0000-0000-0000-000000000004', 'c1111111-0000-0000-0000-000000000004', (SELECT id FROM public.question_options WHERE question_id = 'c1111111-0000-0000-0000-000000000004' AND is_correct = true LIMIT 1), 4),
  ('s5555555-0000-0000-0000-000000000005', 'c1111111-0000-0000-0000-000000000005', (SELECT id FROM public.question_options WHERE question_id = 'c1111111-0000-0000-0000-000000000005' AND is_correct = true LIMIT 1), 5),
  ('s5555555-0000-0000-0000-000000000006', 'c1111111-0000-0000-0000-000000000006', (SELECT id FROM public.question_options WHERE question_id = 'c1111111-0000-0000-0000-000000000006' AND is_correct = true LIMIT 1), 6),
  ('s5555555-0000-0000-0000-000000000007', 'c1111111-0000-0000-0000-000000000007', (SELECT id FROM public.question_options WHERE question_id = 'c1111111-0000-0000-0000-000000000007' AND is_correct = true LIMIT 1), 7),
  ('s5555555-0000-0000-0000-000000000008', 'c1111111-0000-0000-0000-000000000008', (SELECT id FROM public.question_options WHERE question_id = 'c1111111-0000-0000-0000-000000000008' AND is_correct = false LIMIT 1), 8),
  ('s5555555-0000-0000-0000-000000000009', 'c1111111-0000-0000-0000-000000000009', (SELECT id FROM public.question_options WHERE question_id = 'c1111111-0000-0000-0000-000000000009' AND is_correct = true LIMIT 1), 9),
  ('s5555555-0000-0000-0000-000000000010', 'c1111111-0000-0000-0000-000000000010', (SELECT id FROM public.question_options WHERE question_id = 'c1111111-0000-0000-0000-000000000010' AND is_correct = false LIMIT 1), 10)
ON CONFLICT (session_id, question_id) DO NOTHING;


-- ==============================================================================
-- 7. Hasil Keputusan Evaluasi Tutor (placement_evaluations)
-- ==============================================================================

-- 7.1 Evaluasi Fajar Pratama (Elementary) oleh Tutor Dewi Sartika -> Level ADVANCED
INSERT INTO public.placement_evaluations (session_id, tutor_id, assigned_level, tutor_notes, finalized_at)
VALUES (
  's4444444-0000-0000-0000-000000000001',
  (SELECT id FROM public.profiles WHERE email = 'dewi.elementary@upspeaking.com' LIMIT 1),
  'ADVANCED',
  'Penguasaan kosa kata dan tata bahasa dasar sangat kuat. Siswa siap mengikuti kelas lanjutan.',
  NOW() - INTERVAL '1 hour 30 minutes'
) ON CONFLICT (session_id) DO NOTHING;

-- 7.2 Evaluasi Citra Lestari (High School) oleh Tutor Rian Hidayat -> Level INTERMEDIATE
INSERT INTO public.placement_evaluations (session_id, tutor_id, assigned_level, tutor_notes, finalized_at)
VALUES (
  's6666666-0000-0000-0000-000000000001',
  (SELECT id FROM public.profiles WHERE email = 'rian.highschool@upspeaking.com' LIMIT 1),
  'INTERMEDIATE',
  'Pemahaman bacaan dan vocabulary baik, namun perlu penguatan pada passive voice dan conditional clauses.',
  NOW() - INTERVAL '2 hours'
) ON CONFLICT (session_id) DO NOTHING;
