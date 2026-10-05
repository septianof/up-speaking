-- ==============================================================================
-- Migration: 20261005000002_seed_staff_accounts_and_highschool_questions.sql
-- Project: Up Speaking Placement Test System
-- Description: Seeder akun default (Admin, Tutor Elementary, Tutor High School)
--              dan 10 butir soal uji coba jenjang High School (SMP/SMA/Umum)
-- ==============================================================================

-- ------------------------------------------------------------------------------
-- 1. SEED AKUN STAF KE AUTH.USERS & PUBLIC.PROFILES
-- Password default: Password123!
-- ------------------------------------------------------------------------------

-- Aktifkan pgcrypto jika belum
CREATE EXTENSION IF NOT EXISTS pgcrypto;

-- Akun 1: Admin Utama (admin@upspeaking.id)
DO $$
DECLARE
    v_user_id UUID := 'c0000000-0000-0000-0000-000000000001';
BEGIN
    -- Masukkan ke auth.users jika belum ada
    IF NOT EXISTS (SELECT 1 FROM auth.users WHERE email = 'admin@upspeaking.id') THEN
        INSERT INTO auth.users (
            id,
            instance_id,
            aud,
            role,
            email,
            encrypted_password,
            email_confirmed_at,
            raw_app_meta_data,
            raw_user_meta_data,
            created_at,
            updated_at
        ) VALUES (
            v_user_id,
            '00000000-0000-0000-0000-000000000000',
            'authenticated',
            'authenticated',
            'admin@upspeaking.id',
            crypt('Password123!', gen_salt('bf')),
            timezone('utc'::text, now()),
            '{"provider": "email", "providers": ["email"]}'::jsonb,
            '{"full_name": "Admin Up Speaking"}'::jsonb,
            timezone('utc'::text, now()),
            timezone('utc'::text, now())
        );
    ELSE
        SELECT id INTO v_user_id FROM auth.users WHERE email = 'admin@upspeaking.id';
    END IF;

    -- Masukkan atau perbarui ke public.profiles
    INSERT INTO public.profiles (id, email, full_name, role, education_level, updated_at)
    VALUES (v_user_id, 'admin@upspeaking.id', 'Admin Up Speaking', 'admin', NULL, timezone('utc'::text, now()))
    ON CONFLICT (id) DO UPDATE
    SET email = EXCLUDED.email,
        full_name = EXCLUDED.full_name,
        role = EXCLUDED.role,
        education_level = EXCLUDED.education_level,
        updated_at = timezone('utc'::text, now());
END $$;

-- Akun 2: Tutor Elementary (tutor.elementary@upspeaking.id)
DO $$
DECLARE
    v_user_id UUID := 'c0000000-0000-0000-0000-000000000002';
BEGIN
    IF NOT EXISTS (SELECT 1 FROM auth.users WHERE email = 'tutor.elementary@upspeaking.id') THEN
        INSERT INTO auth.users (
            id,
            instance_id,
            aud,
            role,
            email,
            encrypted_password,
            email_confirmed_at,
            raw_app_meta_data,
            raw_user_meta_data,
            created_at,
            updated_at
        ) VALUES (
            v_user_id,
            '00000000-0000-0000-0000-000000000000',
            'authenticated',
            'authenticated',
            'tutor.elementary@upspeaking.id',
            crypt('Password123!', gen_salt('bf')),
            timezone('utc'::text, now()),
            '{"provider": "email", "providers": ["email"]}'::jsonb,
            '{"full_name": "Miss Sarah"}'::jsonb,
            timezone('utc'::text, now()),
            timezone('utc'::text, now())
        );
    ELSE
        SELECT id INTO v_user_id FROM auth.users WHERE email = 'tutor.elementary@upspeaking.id';
    END IF;

    INSERT INTO public.profiles (id, email, full_name, role, education_level, updated_at)
    VALUES (v_user_id, 'tutor.elementary@upspeaking.id', 'Miss Sarah', 'tutor', 'elementary', timezone('utc'::text, now()))
    ON CONFLICT (id) DO UPDATE
    SET email = EXCLUDED.email,
        full_name = EXCLUDED.full_name,
        role = EXCLUDED.role,
        education_level = EXCLUDED.education_level,
        updated_at = timezone('utc'::text, now());
END $$;

-- Akun 3: Tutor High School (tutor.highschool@upspeaking.id)
DO $$
DECLARE
    v_user_id UUID := 'c0000000-0000-0000-0000-000000000003';
BEGIN
    IF NOT EXISTS (SELECT 1 FROM auth.users WHERE email = 'tutor.highschool@upspeaking.id') THEN
        INSERT INTO auth.users (
            id,
            instance_id,
            aud,
            role,
            email,
            encrypted_password,
            email_confirmed_at,
            raw_app_meta_data,
            raw_user_meta_data,
            created_at,
            updated_at
        ) VALUES (
            v_user_id,
            '00000000-0000-0000-0000-000000000000',
            'authenticated',
            'authenticated',
            'tutor.highschool@upspeaking.id',
            crypt('Password123!', gen_salt('bf')),
            timezone('utc'::text, now()),
            '{"provider": "email", "providers": ["email"]}'::jsonb,
            '{"full_name": "Mr. David"}'::jsonb,
            timezone('utc'::text, now()),
            timezone('utc'::text, now())
        );
    ELSE
        SELECT id INTO v_user_id FROM auth.users WHERE email = 'tutor.highschool@upspeaking.id';
    END IF;

    INSERT INTO public.profiles (id, email, full_name, role, education_level, updated_at)
    VALUES (v_user_id, 'tutor.highschool@upspeaking.id', 'Mr. David', 'tutor', 'high_school', timezone('utc'::text, now()))
    ON CONFLICT (id) DO UPDATE
    SET email = EXCLUDED.email,
        full_name = EXCLUDED.full_name,
        role = EXCLUDED.role,
        education_level = EXCLUDED.education_level,
        updated_at = timezone('utc'::text, now());
END $$;

-- ------------------------------------------------------------------------------
-- 2. SEED 10 BUTIR SOAL UJI COBA JENJANG HIGH SCHOOL (SMP/SMA/UMUM)
-- Target education_level: 'high_school'
-- ------------------------------------------------------------------------------

-- Soal 11: Present Perfect vs Past Simple
INSERT INTO public.questions (id, question_text, education_level, is_active)
VALUES (
    'a0000000-0000-0000-0000-000000000011',
    'I haven''t seen Sarah since she _______ to London for her studies last year.',
    'high_school',
    true
)
ON CONFLICT (id) DO UPDATE
SET question_text = EXCLUDED.question_text,
    education_level = EXCLUDED.education_level,
    is_active = EXCLUDED.is_active;

INSERT INTO public.question_options (id, question_id, option_text, is_correct, order_index)
VALUES 
    ('b0000000-0000-0000-0000-000000000041', 'a0000000-0000-0000-0000-000000000011', 'has moved', false, 1),
    ('b0000000-0000-0000-0000-000000000042', 'a0000000-0000-0000-0000-000000000011', 'moved', true, 2),
    ('b0000000-0000-0000-0000-000000000043', 'a0000000-0000-0000-0000-000000000011', 'was moving', false, 3),
    ('b0000000-0000-0000-0000-000000000044', 'a0000000-0000-0000-0000-000000000011', 'had moved', false, 4)
ON CONFLICT (id) DO UPDATE 
SET option_text = EXCLUDED.option_text, is_correct = EXCLUDED.is_correct, order_index = EXCLUDED.order_index;


-- Soal 12: Conditional Sentences Type 3
INSERT INTO public.questions (id, question_text, education_level, is_active)
VALUES (
    'a0000000-0000-0000-0000-000000000012',
    'If we _______ about the severe storm forecast, we would have postponed our camping trip.',
    'high_school',
    true
)
ON CONFLICT (id) DO UPDATE
SET question_text = EXCLUDED.question_text,
    education_level = EXCLUDED.education_level,
    is_active = EXCLUDED.is_active;

INSERT INTO public.question_options (id, question_id, option_text, is_correct, order_index)
VALUES 
    ('b0000000-0000-0000-0000-000000000045', 'a0000000-0000-0000-0000-000000000012', 'knew', false, 1),
    ('b0000000-0000-0000-0000-000000000046', 'a0000000-0000-0000-0000-000000000012', 'know', false, 2),
    ('b0000000-0000-0000-0000-000000000047', 'a0000000-0000-0000-0000-000000000012', 'had known', true, 3),
    ('b0000000-0000-0000-0000-000000000048', 'a0000000-0000-0000-0000-000000000012', 'have known', false, 4)
ON CONFLICT (id) DO UPDATE 
SET option_text = EXCLUDED.option_text, is_correct = EXCLUDED.is_correct, order_index = EXCLUDED.order_index;


-- Soal 13: Passive Voice Structure
INSERT INTO public.questions (id, question_text, education_level, is_active)
VALUES (
    'a0000000-0000-0000-0000-000000000013',
    'The company''s new product proposal _______ by the board of directors before the end of this month.',
    'high_school',
    true
)
ON CONFLICT (id) DO UPDATE
SET question_text = EXCLUDED.question_text,
    education_level = EXCLUDED.education_level,
    is_active = EXCLUDED.is_active;

INSERT INTO public.question_options (id, question_id, option_text, is_correct, order_index)
VALUES 
    ('b0000000-0000-0000-0000-000000000049', 'a0000000-0000-0000-0000-000000000013', 'will be reviewed', true, 1),
    ('b0000000-0000-0000-0000-000000000050', 'a0000000-0000-0000-0000-000000000013', 'is reviewing', false, 2),
    ('b0000000-0000-0000-0000-000000000051', 'a0000000-0000-0000-0000-000000000013', 'will review', false, 3),
    ('b0000000-0000-0000-0000-000000000052', 'a0000000-0000-0000-0000-000000000013', 'was reviewed', false, 4)
ON CONFLICT (id) DO UPDATE 
SET option_text = EXCLUDED.option_text, is_correct = EXCLUDED.is_correct, order_index = EXCLUDED.order_index;


-- Soal 14: Relative Pronouns (Whose)
INSERT INTO public.questions (id, question_text, education_level, is_active)
VALUES (
    'a0000000-0000-0000-0000-000000000014',
    'The student _______ science project won the national competition was awarded a prestigious scholarship.',
    'high_school',
    true
)
ON CONFLICT (id) DO UPDATE
SET question_text = EXCLUDED.question_text,
    education_level = EXCLUDED.education_level,
    is_active = EXCLUDED.is_active;

INSERT INTO public.question_options (id, question_id, option_text, is_correct, order_index)
VALUES 
    ('b0000000-0000-0000-0000-000000000053', 'a0000000-0000-0000-0000-000000000014', 'whom', false, 1),
    ('b0000000-0000-0000-0000-000000000054', 'a0000000-0000-0000-0000-000000000014', 'whose', true, 2),
    ('b0000000-0000-0000-0000-000000000055', 'a0000000-0000-0000-0000-000000000014', 'which', false, 3),
    ('b0000000-0000-0000-0000-000000000056', 'a0000000-0000-0000-0000-000000000014', 'who', false, 4)
ON CONFLICT (id) DO UPDATE 
SET option_text = EXCLUDED.option_text, is_correct = EXCLUDED.is_correct, order_index = EXCLUDED.order_index;


-- Soal 15: Modals of Past Deduction
INSERT INTO public.questions (id, question_text, education_level, is_active)
VALUES (
    'a0000000-0000-0000-0000-000000000015',
    'David looks completely exhausted this morning; he _______ working on the presentation all night.',
    'high_school',
    true
)
ON CONFLICT (id) DO UPDATE
SET question_text = EXCLUDED.question_text,
    education_level = EXCLUDED.education_level,
    is_active = EXCLUDED.is_active;

INSERT INTO public.question_options (id, question_id, option_text, is_correct, order_index)
VALUES 
    ('b0000000-0000-0000-0000-000000000057', 'a0000000-0000-0000-0000-000000000015', 'must have been', true, 1),
    ('b0000000-0000-0000-0000-000000000058', 'a0000000-0000-0000-0000-000000000015', 'can''t be', false, 2),
    ('b0000000-0000-0000-0000-000000000059', 'a0000000-0000-0000-0000-000000000015', 'should have', false, 3),
    ('b0000000-0000-0000-0000-000000000060', 'a0000000-0000-0000-0000-000000000015', 'would rather be', false, 4)
ON CONFLICT (id) DO UPDATE 
SET option_text = EXCLUDED.option_text, is_correct = EXCLUDED.is_correct, order_index = EXCLUDED.order_index;


-- Soal 16: Reported / Indirect Speech
INSERT INTO public.questions (id, question_text, education_level, is_active)
VALUES (
    'a0000000-0000-0000-0000-000000000016',
    'The supervisor asked the team members whether they _______ the final report yet.',
    'high_school',
    true
)
ON CONFLICT (id) DO UPDATE
SET question_text = EXCLUDED.question_text,
    education_level = EXCLUDED.education_level,
    is_active = EXCLUDED.is_active;

INSERT INTO public.question_options (id, question_id, option_text, is_correct, order_index)
VALUES 
    ('b0000000-0000-0000-0000-000000000061', 'a0000000-0000-0000-0000-000000000016', 'have submitted', false, 1),
    ('b0000000-0000-0000-0000-000000000062', 'a0000000-0000-0000-0000-000000000016', 'had submitted', true, 2),
    ('b0000000-0000-0000-0000-000000000063', 'a0000000-0000-0000-0000-000000000016', 'will submit', false, 3),
    ('b0000000-0000-0000-0000-000000000064', 'a0000000-0000-0000-0000-000000000016', 'are submitting', false, 4)
ON CONFLICT (id) DO UPDATE 
SET option_text = EXCLUDED.option_text, is_correct = EXCLUDED.is_correct, order_index = EXCLUDED.order_index;


-- Soal 17: Preposition + Gerund Collocation
INSERT INTO public.questions (id, question_text, education_level, is_active)
VALUES (
    'a0000000-0000-0000-0000-000000000017',
    'Our management is genuinely looking forward to _______ your delegation at the upcoming forum.',
    'high_school',
    true
)
ON CONFLICT (id) DO UPDATE
SET question_text = EXCLUDED.question_text,
    education_level = EXCLUDED.education_level,
    is_active = EXCLUDED.is_active;

INSERT INTO public.question_options (id, question_id, option_text, is_correct, order_index)
VALUES 
    ('b0000000-0000-0000-0000-000000000065', 'a0000000-0000-0000-0000-000000000017', 'meet', false, 1),
    ('b0000000-0000-0000-0000-000000000066', 'a0000000-0000-0000-0000-000000000017', 'meeting', true, 2),
    ('b0000000-0000-0000-0000-000000000067', 'a0000000-0000-0000-0000-000000000017', 'have met', false, 3),
    ('b0000000-0000-0000-0000-000000000068', 'a0000000-0000-0000-0000-000000000017', 'be meeting', false, 4)
ON CONFLICT (id) DO UPDATE 
SET option_text = EXCLUDED.option_text, is_correct = EXCLUDED.is_correct, order_index = EXCLUDED.order_index;


-- Soal 18: Academic & Formal Vocabulary (Substantial)
INSERT INTO public.questions (id, question_text, education_level, is_active)
VALUES (
    'a0000000-0000-0000-0000-000000000018',
    'Despite encountering aggressive competition, the enterprise managed to secure a _______ increase in revenue.',
    'high_school',
    true
)
ON CONFLICT (id) DO UPDATE
SET question_text = EXCLUDED.question_text,
    education_level = EXCLUDED.education_level,
    is_active = EXCLUDED.is_active;

INSERT INTO public.question_options (id, question_id, option_text, is_correct, order_index)
VALUES 
    ('b0000000-0000-0000-0000-000000000069', 'a0000000-0000-0000-0000-000000000018', 'substantial', true, 1),
    ('b0000000-0000-0000-0000-000000000070', 'a0000000-0000-0000-0000-000000000018', 'hesitant', false, 2),
    ('b0000000-0000-0000-0000-000000000071', 'a0000000-0000-0000-0000-000000000018', 'reluctant', false, 3),
    ('b0000000-0000-0000-0000-000000000072', 'a0000000-0000-0000-0000-000000000018', 'negligible', false, 4)
ON CONFLICT (id) DO UPDATE 
SET option_text = EXCLUDED.option_text, is_correct = EXCLUDED.is_correct, order_index = EXCLUDED.order_index;


-- Soal 19: Conjunction of Contrast (Although vs Despite)
INSERT INTO public.questions (id, question_text, education_level, is_active)
VALUES (
    'a0000000-0000-0000-0000-000000000019',
    '_______ the weather station predicted heavy thunderstorms, the participants proceeded with the marathon.',
    'high_school',
    true
)
ON CONFLICT (id) DO UPDATE
SET question_text = EXCLUDED.question_text,
    education_level = EXCLUDED.education_level,
    is_active = EXCLUDED.is_active;

INSERT INTO public.question_options (id, question_id, option_text, is_correct, order_index)
VALUES 
    ('b0000000-0000-0000-0000-000000000073', 'a0000000-0000-0000-0000-000000000019', 'Despite', false, 1),
    ('b0000000-0000-0000-0000-000000000074', 'a0000000-0000-0000-0000-000000000019', 'Although', true, 2),
    ('b0000000-0000-0000-0000-000000000075', 'a0000000-0000-0000-0000-000000000019', 'Because of', false, 3),
    ('b0000000-0000-0000-0000-000000000076', 'a0000000-0000-0000-0000-000000000019', 'In spite of', false, 4)
ON CONFLICT (id) DO UPDATE 
SET option_text = EXCLUDED.option_text, is_correct = EXCLUDED.is_correct, order_index = EXCLUDED.order_index;


-- Soal 20: Negative Inversion Structure
INSERT INTO public.questions (id, question_text, education_level, is_active)
VALUES (
    'a0000000-0000-0000-0000-000000000020',
    'Rarely _______ such exceptional leadership qualities in someone of that age.',
    'high_school',
    true
)
ON CONFLICT (id) DO UPDATE
SET question_text = EXCLUDED.question_text,
    education_level = EXCLUDED.education_level,
    is_active = EXCLUDED.is_active;

INSERT INTO public.question_options (id, question_id, option_text, is_correct, order_index)
VALUES 
    ('b0000000-0000-0000-0000-000000000077', 'a0000000-0000-0000-0000-000000000020', 'we have witnessed', false, 1),
    ('b0000000-0000-0000-0000-000000000078', 'a0000000-0000-0000-0000-000000000020', 'have we witnessed', true, 2),
    ('b0000000-0000-0000-0000-000000000079', 'a0000000-0000-0000-0000-000000000020', 'we witnessed', false, 3),
    ('b0000000-0000-0000-0000-000000000080', 'a0000000-0000-0000-0000-000000000020', 'did we witnessed', false, 4)
ON CONFLICT (id) DO UPDATE 
SET option_text = EXCLUDED.option_text, is_correct = EXCLUDED.is_correct, order_index = EXCLUDED.order_index;
