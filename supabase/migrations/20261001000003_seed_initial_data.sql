-- ==============================================================================
-- Migration: 20261001000003_seed_initial_data.sql
-- Project: Up Speaking Placement Test System
-- Description: Seeder data awal untuk tabel settings, levels, dan 10 butir soal uji coba
-- ==============================================================================

-- ------------------------------------------------------------------------------
-- 1. SEED SETTINGS (Durasi Ujian Default 45 Menit)
-- ------------------------------------------------------------------------------
INSERT INTO public.settings (id, test_duration_minutes)
VALUES (1, 45)
ON CONFLICT (id) DO UPDATE 
SET test_duration_minutes = EXCLUDED.test_duration_minutes,
    updated_at = timezone('utc'::text, now());

-- ------------------------------------------------------------------------------
-- 2. SEED LEVELS (Master 3 Level Penempatan sesuai PRD Section 8)
-- ------------------------------------------------------------------------------
INSERT INTO public.levels (id, name, min_score_percent, max_score_percent, description)
VALUES 
    (
        1, 
        'Beginner', 
        0, 
        49, 
        'Fokus membangun fondasi tata bahasa dasar, kosakata esensial sehari-hari, dan melatih rasa percaya diri dalam berbicara bahasa Inggris.'
    ),
    (
        2, 
        'Intermediate', 
        50, 
        74, 
        'Fokus memperluas kelancaran berbicara, aktif berdiskusi mengenai topik umum, serta memahami variasi kalimat dan idiom sehari-hari.'
    ),
    (
        3, 
        'Advanced', 
        75, 
        100, 
        'Fokus pada kemampuan berbicara profesional, presentasi terstruktur, debat formal, penguasaan nuansa bahasa kompleks, dan aksen alami.'
    )
ON CONFLICT (id) DO UPDATE 
SET name = EXCLUDED.name,
    min_score_percent = EXCLUDED.min_score_percent,
    max_score_percent = EXCLUDED.max_score_percent,
    description = EXCLUDED.description,
    updated_at = timezone('utc'::text, now());

-- Sinkronisasi sequence level id agar penambahan berikutnya tidak bentrok
SELECT setval('public.levels_id_seq', (SELECT GREATEST(MAX(id), 3) FROM public.levels));

-- ------------------------------------------------------------------------------
-- 3. SEED QUESTIONS (10 Butir Pertanyaan Placement Test Representative)
-- Menggunakan UUID deterministik agar aman dijalankan berulang kali (idempotent)
-- ------------------------------------------------------------------------------

-- Soal 1 (Grammar Dasar - Simple Present)
INSERT INTO public.questions (id, question_text, is_active)
VALUES (
    'a0000000-0000-0000-0000-000000000001',
    'She _____ to the English course every Tuesday and Thursday afternoon.',
    true
)
ON CONFLICT (id) DO UPDATE 
SET question_text = EXCLUDED.question_text,
    is_active = EXCLUDED.is_active,
    updated_at = timezone('utc'::text, now());

-- Soal 2 (Vocabulary Dasar - Phrasal Verb Sehari-hari)
INSERT INTO public.questions (id, question_text, is_active)
VALUES (
    'a0000000-0000-0000-0000-000000000002',
    'Could you please _____ the light? It is getting quite dark in this room.',
    true
)
ON CONFLICT (id) DO UPDATE 
SET question_text = EXCLUDED.question_text,
    is_active = EXCLUDED.is_active,
    updated_at = timezone('utc'::text, now());

-- Soal 3 (Grammar - Present Perfect Continuous)
INSERT INTO public.questions (id, question_text, is_active)
VALUES (
    'a0000000-0000-0000-0000-000000000003',
    'They _____ each other since they were in elementary school together.',
    true
)
ON CONFLICT (id) DO UPDATE 
SET question_text = EXCLUDED.question_text,
    is_active = EXCLUDED.is_active,
    updated_at = timezone('utc'::text, now());

-- Soal 4 (Situational Speaking / Percakapan Sehari-hari)
INSERT INTO public.questions (id, question_text, is_active)
VALUES (
    'a0000000-0000-0000-0000-000000000004',
    'A: "Would you mind if I borrowed your laptop for thirty minutes?"\nB: "_____. Go ahead and use it."',
    true
)
ON CONFLICT (id) DO UPDATE 
SET question_text = EXCLUDED.question_text,
    is_active = EXCLUDED.is_active,
    updated_at = timezone('utc'::text, now());

-- Soal 5 (Preposition & Collocation)
INSERT INTO public.questions (id, question_text, is_active)
VALUES (
    'a0000000-0000-0000-0000-000000000005',
    'Sarah has always been very interested _____ learning foreign languages and global cultures.',
    true
)
ON CONFLICT (id) DO UPDATE 
SET question_text = EXCLUDED.question_text,
    is_active = EXCLUDED.is_active,
    updated_at = timezone('utc'::text, now());

-- Soal 6 (Modal Verbs & Giving Advice)
INSERT INTO public.questions (id, question_text, is_active)
VALUES (
    'a0000000-0000-0000-0000-000000000006',
    'You look completely exhausted after working overtime. You _____ take a short rest before driving home.',
    true
)
ON CONFLICT (id) DO UPDATE 
SET question_text = EXCLUDED.question_text,
    is_active = EXCLUDED.is_active,
    updated_at = timezone('utc'::text, now());

-- Soal 7 (Conditionals - Type 2)
INSERT INTO public.questions (id, question_text, is_active)
VALUES (
    'a0000000-0000-0000-0000-000000000007',
    'If I _____ more free time during the week, I would definitely join the intensive public speaking club.',
    true
)
ON CONFLICT (id) DO UPDATE 
SET question_text = EXCLUDED.question_text,
    is_active = EXCLUDED.is_active,
    updated_at = timezone('utc'::text, now());

-- Soal 8 (Vocabulary Kontekstual - Intermediate)
INSERT INTO public.questions (id, question_text, is_active)
VALUES (
    'a0000000-0000-0000-0000-000000000008',
    'The keynote speaker gave a very _____ presentation that convinced all attendees to support the green initiative.',
    true
)
ON CONFLICT (id) DO UPDATE 
SET question_text = EXCLUDED.question_text,
    is_active = EXCLUDED.is_active,
    updated_at = timezone('utc'::text, now());

-- Soal 9 (Advanced Grammar - Negative Inversion)
INSERT INTO public.questions (id, question_text, is_active)
VALUES (
    'a0000000-0000-0000-0000-000000000009',
    'Seldom _____ such an inspiring speech that moved the entire audience to a standing ovation.',
    true
)
ON CONFLICT (id) DO UPDATE 
SET question_text = EXCLUDED.question_text,
    is_active = EXCLUDED.is_active,
    updated_at = timezone('utc'::text, now());

-- Soal 10 (Advanced Vocabulary - Professional & Academic)
INSERT INTO public.questions (id, question_text, is_active)
VALUES (
    'a0000000-0000-0000-0000-000000000010',
    'Despite encountering unexpected economic hardship, the community organization managed to _____ and achieve their annual goals.',
    true
)
ON CONFLICT (id) DO UPDATE 
SET question_text = EXCLUDED.question_text,
    is_active = EXCLUDED.is_active,
    updated_at = timezone('utc'::text, now());

-- ------------------------------------------------------------------------------
-- 4. SEED QUESTION OPTIONS (4 Pilihan per Soal: A, B, C, D)
-- ------------------------------------------------------------------------------

-- Opsi Soal 1
INSERT INTO public.question_options (id, question_id, option_text, is_correct, order_index)
VALUES 
    ('b0000000-0000-0000-0000-000000000001', 'a0000000-0000-0000-0000-000000000001', 'go', false, 1),
    ('b0000000-0000-0000-0000-000000000002', 'a0000000-0000-0000-0000-000000000001', 'goes', true, 2),
    ('b0000000-0000-0000-0000-000000000003', 'a0000000-0000-0000-0000-000000000001', 'going', false, 3),
    ('b0000000-0000-0000-0000-000000000004', 'a0000000-0000-0000-0000-000000000001', 'gone', false, 4)
ON CONFLICT (id) DO UPDATE 
SET option_text = EXCLUDED.option_text,
    is_correct = EXCLUDED.is_correct,
    order_index = EXCLUDED.order_index;

-- Opsi Soal 2
INSERT INTO public.question_options (id, question_id, option_text, is_correct, order_index)
VALUES 
    ('b0000000-0000-0000-0000-000000000005', 'a0000000-0000-0000-0000-000000000002', 'turn on', true, 1),
    ('b0000000-0000-0000-0000-000000000006', 'a0000000-0000-0000-0000-000000000002', 'turn off', false, 2),
    ('b0000000-0000-0000-0000-000000000007', 'a0000000-0000-0000-0000-000000000002', 'put out', false, 3),
    ('b0000000-0000-0000-0000-000000000008', 'a0000000-0000-0000-0000-000000000002', 'break in', false, 4)
ON CONFLICT (id) DO UPDATE 
SET option_text = EXCLUDED.option_text,
    is_correct = EXCLUDED.is_correct,
    order_index = EXCLUDED.order_index;

-- Opsi Soal 3
INSERT INTO public.question_options (id, question_id, option_text, is_correct, order_index)
VALUES 
    ('b0000000-0000-0000-0000-000000000009', 'a0000000-0000-0000-0000-000000000003', 'know', false, 1),
    ('b0000000-0000-0000-0000-000000000010', 'a0000000-0000-0000-0000-000000000003', 'knew', false, 2),
    ('b0000000-0000-0000-0000-000000000011', 'a0000000-0000-0000-0000-000000000003', 'have known', true, 3),
    ('b0000000-0000-0000-0000-000000000012', 'a0000000-0000-0000-0000-000000000003', 'are knowing', false, 4)
ON CONFLICT (id) DO UPDATE 
SET option_text = EXCLUDED.option_text,
    is_correct = EXCLUDED.is_correct,
    order_index = EXCLUDED.order_index;

-- Opsi Soal 4
INSERT INTO public.question_options (id, question_id, option_text, is_correct, order_index)
VALUES 
    ('b0000000-0000-0000-0000-000000000013', 'a0000000-0000-0000-0000-000000000004', 'Yes, of course', false, 1),
    ('b0000000-0000-0000-0000-000000000014', 'a0000000-0000-0000-0000-000000000004', 'Not at all', true, 2),
    ('b0000000-0000-0000-0000-000000000015', 'a0000000-0000-0000-0000-000000000004', 'I certainly mind', false, 3),
    ('b0000000-0000-0000-0000-000000000016', 'a0000000-0000-0000-0000-000000000004', 'No, you cannot', false, 4)
ON CONFLICT (id) DO UPDATE 
SET option_text = EXCLUDED.option_text,
    is_correct = EXCLUDED.is_correct,
    order_index = EXCLUDED.order_index;

-- Opsi Soal 5
INSERT INTO public.question_options (id, question_id, option_text, is_correct, order_index)
VALUES 
    ('b0000000-0000-0000-0000-000000000017', 'a0000000-0000-0000-0000-000000000005', 'in', true, 1),
    ('b0000000-0000-0000-0000-000000000018', 'a0000000-0000-0000-0000-000000000005', 'on', false, 2),
    ('b0000000-0000-0000-0000-000000000019', 'a0000000-0000-0000-0000-000000000005', 'with', false, 3),
    ('b0000000-0000-0000-0000-000000000020', 'a0000000-0000-0000-0000-000000000005', 'about', false, 4)
ON CONFLICT (id) DO UPDATE 
SET option_text = EXCLUDED.option_text,
    is_correct = EXCLUDED.is_correct,
    order_index = EXCLUDED.order_index;

-- Opsi Soal 6
INSERT INTO public.question_options (id, question_id, option_text, is_correct, order_index)
VALUES 
    ('b0000000-0000-0000-0000-000000000021', 'a0000000-0000-0000-0000-000000000006', 'would rather', false, 1),
    ('b0000000-0000-0000-0000-000000000022', 'a0000000-0000-0000-0000-000000000006', 'ought to', true, 2),
    ('b0000000-0000-0000-0000-000000000023', 'a0000000-0000-0000-0000-000000000006', 'had to', false, 3),
    ('b0000000-0000-0000-0000-000000000024', 'a0000000-0000-0000-0000-000000000006', 'might not', false, 4)
ON CONFLICT (id) DO UPDATE 
SET option_text = EXCLUDED.option_text,
    is_correct = EXCLUDED.is_correct,
    order_index = EXCLUDED.order_index;

-- Opsi Soal 7
INSERT INTO public.question_options (id, question_id, option_text, is_correct, order_index)
VALUES 
    ('b0000000-0000-0000-0000-000000000025', 'a0000000-0000-0000-0000-000000000007', 'have', false, 1),
    ('b0000000-0000-0000-0000-000000000026', 'a0000000-0000-0000-0000-000000000007', 'had', true, 2),
    ('b0000000-0000-0000-0000-000000000027', 'a0000000-0000-0000-0000-000000000007', 'will have', false, 3),
    ('b0000000-0000-0000-0000-000000000028', 'a0000000-0000-0000-0000-000000000007', 'have had', false, 4)
ON CONFLICT (id) DO UPDATE 
SET option_text = EXCLUDED.option_text,
    is_correct = EXCLUDED.is_correct,
    order_index = EXCLUDED.order_index;

-- Opsi Soal 8
INSERT INTO public.question_options (id, question_id, option_text, is_correct, order_index)
VALUES 
    ('b0000000-0000-0000-0000-000000000029', 'a0000000-0000-0000-0000-000000000008', 'convincing', true, 1),
    ('b0000000-0000-0000-0000-000000000030', 'a0000000-0000-0000-0000-000000000008', 'hesitant', false, 2),
    ('b0000000-0000-0000-0000-000000000031', 'a0000000-0000-0000-0000-000000000008', 'reluctant', false, 3),
    ('b0000000-0000-0000-0000-000000000032', 'a0000000-0000-0000-0000-000000000008', 'exhausting', false, 4)
ON CONFLICT (id) DO UPDATE 
SET option_text = EXCLUDED.option_text,
    is_correct = EXCLUDED.is_correct,
    order_index = EXCLUDED.order_index;

-- Opsi Soal 9
INSERT INTO public.question_options (id, question_id, option_text, is_correct, order_index)
VALUES 
    ('b0000000-0000-0000-0000-000000000033', 'a0000000-0000-0000-0000-000000000009', 'we heard', false, 1),
    ('b0000000-0000-0000-0000-000000000034', 'a0000000-0000-0000-0000-000000000009', 'have we heard', true, 2),
    ('b0000000-0000-0000-0000-000000000035', 'a0000000-0000-0000-0000-000000000009', 'we have heard', false, 3),
    ('b0000000-0000-0000-0000-000000000036', 'a0000000-0000-0000-0000-000000000009', 'we did hear', false, 4)
ON CONFLICT (id) DO UPDATE 
SET option_text = EXCLUDED.option_text,
    is_correct = EXCLUDED.is_correct,
    order_index = EXCLUDED.order_index;

-- Opsi Soal 10
INSERT INTO public.question_options (id, question_id, option_text, is_correct, order_index)
VALUES 
    ('b0000000-0000-0000-0000-000000000037', 'a0000000-0000-0000-0000-000000000010', 'deteriorate', false, 1),
    ('b0000000-0000-0000-0000-000000000038', 'a0000000-0000-0000-0000-000000000010', 'persevere', true, 2),
    ('b0000000-0000-0000-0000-000000000039', 'a0000000-0000-0000-0000-000000000010', 'hesitate', false, 3),
    ('b0000000-0000-0000-0000-000000000040', 'a0000000-0000-0000-0000-000000000010', 'stagnate', false, 4)
ON CONFLICT (id) DO UPDATE 
SET option_text = EXCLUDED.option_text,
    is_correct = EXCLUDED.is_correct,
    order_index = EXCLUDED.order_index;
