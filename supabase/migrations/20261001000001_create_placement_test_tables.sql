-- ==============================================================================
-- Migration: 20261001000001_create_placement_test_tables.sql
-- Project: Up Speaking Placement Test System
-- Description: DDL skema 6 tabel utama sesuai PRD.md Section 6
-- ==============================================================================

-- 1. Tabel SETTINGS (Pengaturan Ujian Global)
CREATE TABLE IF NOT EXISTS public.settings (
    id INT PRIMARY KEY DEFAULT 1 CHECK (id = 1),
    test_duration_minutes INT NOT NULL DEFAULT 45 CHECK (test_duration_minutes > 0),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

-- 2. Tabel LEVELS (Master 3 Level Penempatan)
CREATE TABLE IF NOT EXISTS public.levels (
    id SERIAL PRIMARY KEY,
    name VARCHAR(50) NOT NULL,
    min_score_percent INT NOT NULL CHECK (min_score_percent >= 0 AND min_score_percent <= 100),
    max_score_percent INT NOT NULL CHECK (max_score_percent >= 0 AND max_score_percent <= 100),
    description TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
    CONSTRAINT check_score_range CHECK (min_score_percent <= max_score_percent)
);

-- 3. Tabel QUESTIONS (Butir Pertanyaan Ujian)
CREATE TABLE IF NOT EXISTS public.questions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    question_text TEXT NOT NULL,
    is_active BOOLEAN NOT NULL DEFAULT true,
    created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

-- 4. Tabel QUESTION_OPTIONS (Pilihan Opsi Jawaban Dinamis)
CREATE TABLE IF NOT EXISTS public.question_options (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    question_id UUID NOT NULL REFERENCES public.questions(id) ON DELETE CASCADE,
    option_text TEXT NOT NULL,
    is_correct BOOLEAN NOT NULL DEFAULT false,
    order_index INT NOT NULL DEFAULT 0,
    created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

-- 5. Tabel TEST_SESSIONS (Sesi Ujian Siswa)
CREATE TABLE IF NOT EXISTS public.test_sessions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    student_name VARCHAR(150) NOT NULL,
    whatsapp_number VARCHAR(20) NOT NULL,
    start_time TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
    end_time TIMESTAMPTZ NOT NULL,
    status VARCHAR(20) NOT NULL DEFAULT 'in_progress' CHECK (status IN ('in_progress', 'completed', 'expired')),
    total_questions INT NOT NULL DEFAULT 0,
    correct_answers INT NOT NULL DEFAULT 0,
    final_score_percent NUMERIC(5,2) DEFAULT NULL,
    assigned_level_id INT REFERENCES public.levels(id) ON DELETE SET NULL,
    can_retest BOOLEAN NOT NULL DEFAULT false,
    created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
    completed_at TIMESTAMPTZ DEFAULT NULL
);

-- 6. Tabel STUDENT_ANSWERS (Rekaman Jawaban Siswa / Auto-Save)
CREATE TABLE IF NOT EXISTS public.student_answers (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    session_id UUID NOT NULL REFERENCES public.test_sessions(id) ON DELETE CASCADE,
    question_id UUID NOT NULL REFERENCES public.questions(id) ON DELETE CASCADE,
    selected_option_id UUID REFERENCES public.question_options(id) ON DELETE SET NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
    CONSTRAINT uq_session_question UNIQUE (session_id, question_id)
);
