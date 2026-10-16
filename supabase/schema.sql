-- ==============================================================================
-- Up Speaking Placement Test System - Database Schema DDL
-- Platform: Supabase (PostgreSQL 15+)
-- Reference: docs/TECHNICAL_SPEC.md (Section 5)
-- ==============================================================================

-- 1. Ekstensi UUID
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- 2. Tabel Profiles (Staf Lembaga: Admin & Tutor)
CREATE TABLE IF NOT EXISTS public.profiles (
    id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    full_name VARCHAR(150) NOT NULL,
    email VARCHAR(150) UNIQUE NOT NULL,
    role VARCHAR(30) NOT NULL CHECK (role IN ('ADMIN', 'TUTOR_ELEMENTARY', 'TUTOR_HIGH_SCHOOL')),
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 3. Tabel Students (Identitas Pendaftaran Siswa)
CREATE TABLE IF NOT EXISTS public.students (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    full_name VARCHAR(150) NOT NULL,
    phone_number VARCHAR(20) NOT NULL,
    target_level VARCHAR(30) NOT NULL CHECK (target_level IN ('ELEMENTARY', 'HIGH_SCHOOL')),
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_students_lookup ON public.students(full_name, phone_number);

-- 4. Tabel Test Sessions (Siklus Sesi Pengerjaan Siswa)
CREATE TABLE IF NOT EXISTS public.test_sessions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    student_id UUID NOT NULL REFERENCES public.students(id) ON DELETE CASCADE,
    started_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    submitted_at TIMESTAMPTZ,
    elapsed_seconds INTEGER NOT NULL DEFAULT 0,
    score_percentage NUMERIC(5,2) NOT NULL DEFAULT 0.00,
    device_token VARCHAR(100) NOT NULL,
    status VARCHAR(30) NOT NULL DEFAULT 'IN_PROGRESS' CHECK (status IN ('IN_PROGRESS', 'COMPLETED', 'FINALIZED', 'RESET')),
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_test_sessions_student_status ON public.test_sessions(student_id, status);

-- 5. Tabel Questions (Bank Soal Pilihan Ganda)
CREATE TABLE IF NOT EXISTS public.questions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    target_level VARCHAR(30) NOT NULL CHECK (target_level IN ('ELEMENTARY', 'HIGH_SCHOOL')),
    question_text TEXT NOT NULL,
    is_active BOOLEAN NOT NULL DEFAULT TRUE,
    created_by UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_questions_level_active ON public.questions(target_level, is_active);

-- 6. Tabel Question Options (Opsi Jawaban Dinamis 2 - 5 baris)
CREATE TABLE IF NOT EXISTS public.question_options (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    question_id UUID NOT NULL REFERENCES public.questions(id) ON DELETE CASCADE,
    option_text TEXT NOT NULL,
    is_correct BOOLEAN NOT NULL DEFAULT FALSE,
    sort_order INTEGER NOT NULL DEFAULT 0
);

CREATE INDEX IF NOT EXISTS idx_question_options_qid ON public.question_options(question_id);

-- 7. Tabel Test Responses (Lembar Jawaban Siswa per Sesi)
CREATE TABLE IF NOT EXISTS public.test_responses (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    session_id UUID NOT NULL REFERENCES public.test_sessions(id) ON DELETE CASCADE,
    question_id UUID NOT NULL REFERENCES public.questions(id) ON DELETE CASCADE,
    selected_option_id UUID REFERENCES public.question_options(id) ON DELETE SET NULL,
    display_order INTEGER NOT NULL,
    synced_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    CONSTRAINT uq_session_question UNIQUE (session_id, question_id)
);

CREATE INDEX IF NOT EXISTS idx_test_responses_session ON public.test_responses(session_id);

-- 8. Tabel Placement Evaluations (Hasil Evaluasi & Penetapan Tutor)
CREATE TABLE IF NOT EXISTS public.placement_evaluations (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    session_id UUID UNIQUE NOT NULL REFERENCES public.test_sessions(id) ON DELETE CASCADE,
    tutor_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE RESTRICT,
    assigned_level VARCHAR(30) NOT NULL CHECK (assigned_level IN ('BEGINNER', 'INTERMEDIATE', 'ADVANCED')),
    tutor_notes TEXT,
    finalized_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_placement_evaluations_session ON public.placement_evaluations(session_id);

-- ==============================================================================
-- 9. Row Level Security (RLS) - Kebijakan Keamanan Berlapis (PRD / Tech Spec Section 8)
-- Mengunci akses langsung PostgREST publik (Anon Key); seluruh akses data
-- wajib dikelola melalui Route Handlers server Next.js (Service Role Key).
-- ==============================================================================

ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.students ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.test_sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.questions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.question_options ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.test_responses ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.placement_evaluations ENABLE ROW LEVEL SECURITY;

-- Kebijakan profil: Staf terautentikasi dapat melihat profil mereka sendiri
CREATE POLICY "Staff can view own profile"
    ON public.profiles
    FOR SELECT
    TO authenticated
    USING (auth.uid() = id);

