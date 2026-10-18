# Technical Specification

## 1. Document Overview
- **Project Title:** Rancang Bangun Sistem Informasi Tes Penempatan Berbasis Web Menggunakan Algoritma Fisher-Yates Shuffle (Studi Kasus: Up Speaking Learning Centre)
- **Product Name:** Up Speaking Placement Test System
- **Document Version:** 1.2.0
- **Status:** `Approved`
- **Author:** Senior Software Architect (AI) & Mahasiswa Kerja Praktik
- **Target Deployment:** Vercel (Hosting Web & Serverless API) & Supabase (Managed PostgreSQL & Auth)

---

## 2. Source Documents, Constraints, and Assumptions

### 2.1 Dokumen Sumber (Source Documents)
- **PRD:** [Product Requirements Document (PRD v2.3.0 Approved)](file:///D:/SeptianoF/Projects/Learning/up-speaking/docs/PRD.md).
- **Design Brief:** [UI/UX Design Brief (v1.4.0 Approved)](file:///D:/SeptianoF/Projects/Learning/up-speaking/docs/UIUX_DESIGN_BRIEF.md).

### 2.2 Batasan & Keputusan Arsitektur Teknis
- **Free-Tier Infrastructure:** Menggunakan platform cloud gratis: **Vercel** untuk web frontend dan API Route Handlers, serta **Supabase** untuk basis data managed PostgreSQL dan autentikasi staf.
- **Native Supabase Ecosystem (Tanpa Prisma ORM):**
  - Menggunakan pustaka resmi **`@supabase/supabase-js`** dan **`@supabase/ssr`** secara langsung untuk seluruh manipulasi basis data dan autentikasi.
  - Menghilangkan Prisma ORM untuk mencegah redudansi (*anti-overengineering*), menyederhanakan arsitektur, dan memaksimalkan fitur bawaan Supabase.
- **Dual-Model Access & Mandiri Staf:**
  1. *Staf (Admin & Tutor):* Autentikasi email dan password dikelola oleh **Supabase Auth**. Akun Admin pertama dibuat saat inisialisasi sistem, dan Admin memiliki wewenang membuat akun staf Tutor baru langsung dari aplikasi web menggunakan Supabase Admin Auth API.
  2. *Siswa (Student):* Akses berbasis identitas pendaftaran (**Nama Lengkap + Nomor HP**), dikelola secara mandiri melalui tabel database tanpa pembuatan akun user Supabase Auth.
- **Format Dokumentasi Tanpa Diagram Mermaid:** Seluruh representasi arsitektur dan pemodelan basis data disajikan menggunakan format teks terstruktur, tabel kamus data, dan skrip SQL DDL murni.

---

## 3. Technology Stack

### 3.1 Rincian Ekosistem Teknologi
| Layer | Teknologi | Versi Target | Alasan Pemilihan & Nilai Guna |
| :--- | :--- | :--- | :--- |
| **Framework Fullstack** | **Next.js (App Router)** | `15.x / 14.x` | React Server Components, Server Actions/Route Handlers terpadu, dan zero-config deploy di Vercel. |
| **Bahasa Pemrograman** | **TypeScript** | `5.x` | Type safety ujung-ke-ujung dari tabel database hingga antarmuka pengguna. |
| **Styling** | **Tailwind CSS** | `3.4.x` | Utilitas CSS modern dan ringan yang selaras dengan token desain Up Speaking. |
| **Animasi & Transisi** | **Framer Motion (`motion`)** | `11.x` | Transisi halus antar-soal lembar ujian (stepper), modal dialog, dan status feedback tanpa lag. |
| **Icon Pack** | **Lucide React** | `^0.4x` | Ikon modern, ringan, dan rapi. |
| **Basis Data** | **PostgreSQL (Supabase)** | `15.x` | Database relasional tangguh berstandar industri dengan integritas referensial ACID penuh. |
| **Akses Basis Data & Auth** | **Supabase Client (`@supabase/supabase-js` & `@supabase/ssr`)** | `^2.4x`, `^0.5x` | Klien resmi native Supabase untuk query SQL/PostgREST dan autentikasi cookie SSR. |
| **Pustaka Ekspor Dokumen** | **ExcelJS** & **jsPDF + AutoTable** | `exceljs ^4.4`, `jspdf ^2.5` | Pembuat berkas laporan resmi `.xlsx` dan `.pdf` langsung dari browser / server. |
| **Validasi Skema Form & API** | **Zod** | `^3.23` | Validasi input runtime yang ketat dan pesan validasi ramah pengguna. |

---

## 4. System Architecture (Arsitektur Sistem Terstruktur)

Sistem dibangun menggunakan pola **Modern Monolith Serverless Architecture** yang terbagi ke dalam 3 lapisan utama:

### Lapisan 1: Client Layer (Perangkat Pengguna di Browser)
1. **Perangkat Siswa (Mobile Smartphone, Tablet, PC):**
   - Menjalankan antarmuka Next.js React (Lembar Ujian Stepper satu soal per halaman).
   - Menyimpan status pengerjaan lokal di `localStorage` (*Local Answer Caching*).
   - Menjalankan *Elapsed Timer Client* yang menghitung durasi pengerjaan.
2. **Perangkat Staf Lembaga (Admin & Tutor):**
   - Menjalankan Dashboard Staf Next.js React dengan Sidebar Navigasi di sisi kiri.
   - Mengelola sesi login melalui HttpOnly Session Cookies yang diterbitkan oleh Supabase Auth SSR.

### Lapisan 2: Vercel Serverless Layer (Logika Aplikasi & API Handlers)
1. **Next.js Middleware (`middleware.ts`):**
   - Memverifikasi cookie session staf pada setiap rute terproteksi (`/staff/admin/*` dan `/staff/tutor/*`).
   - Menerapkan Role-Based Access Control (RBAC): memastikan Tutor Elementary hanya dapat mengakses modul Elementary, dan Tutor High School hanya mengakses High School.
2. **Algoritma Fisher-Yates Shuffle Engine (`lib/algorithms/fisher-yates.ts`):**
   - Modul murni TypeScript yang bertugas mengacak urutan butir soal dan opsi jawaban secara linear $O(n)$ tanpa bias.
3. **Route Handlers (/api):**
   - `/api/student/*`: Verifikasi siswa, pembuatan sesi tes acak, autosave jawaban, dan pengumpulan nilai final.
   - `/api/admin/*`: Pendaftaran siswa, pembuatan akun Tutor (`/api/admin/tutors`), Soft Reset sesi tes, dan manajemen bank soal.
   - `/api/tutor/*`: Peninjauan jawaban siswa, penetapan level final beserta catatan evaluasi.
   - `/api/reports/*`: Pembuatan berkas ekspor Excel (`.xlsx`) dan PDF (`.pdf`).

### Lapisan 3: Supabase Managed Cloud Layer (Data & Autentikasi)
1. **Supabase Auth Service:**
   - Menangani autentikasi email dan password staf (`auth.users`), hashing kata sandi aman (bcrypt/argon2), dan penerbitan token sesi.
   - Menyediakan API Admin Auth (`supabase.auth.admin.createUser`) yang dipanggil secara aman dari Route Handler untuk membuatkan akun Tutor baru.
2. **PostgreSQL Database:**
   - Menyimpan seluruh data relasional aplikasi dalam skema tabel terstruktur (Data Siswa, Akun Staf, Sesi Tes, Bank Soal, Opsi Jawaban, Rekap Jawaban, dan Hasil Evaluasi).

---

## 5. Data Model and Database Design (Kamus Data & Skema SQL)

### 5.1 Kamus Data Relasional (Data Dictionary)

#### 1. Tabel: `profiles` (Profil & Hak Akses Staf)
Tabel ini memperluas data pengguna dari `auth.users` Supabase untuk mencatat peran staf lembaga.
| Nama Kolom | Tipe Data | Keterangan |
| :--- | :--- | :--- |
| `id` | `UUID` | **Primary Key**, berelasi langsung dengan `auth.users.id` di Supabase Auth. |
| `full_name` | `VARCHAR(150)` | Nama lengkap staf (Admin / Tutor). |
| `email` | `VARCHAR(150)` | Alamat email staf (unik). |
| `role` | `VARCHAR(30)` | Peran staf: `'ADMIN'`, `'TUTOR_ELEMENTARY'`, atau `'TUTOR_HIGH_SCHOOL'`. |
| `created_at` | `TIMESTAMPTZ` | Waktu pembuatan akun (default: `now()`). |

#### 2. Tabel: `students` (Identitas Pendaftaran Siswa)
Mencatat siswa yang didaftarkan oleh Admin.
| Nama Kolom | Tipe Data | Keterangan |
| :--- | :--- | :--- |
| `id` | `UUID` | **Primary Key** (default: `gen_random_uuid()`). |
| `full_name` | `VARCHAR(150)` | Nama lengkap siswa. |
| `phone_number` | `VARCHAR(20)` | Nomor HP siswa / orang tua. |
| `target_level` | `VARCHAR(30)` | Jenjang pendidikan: `'ELEMENTARY'` (SD) atau `'HIGH_SCHOOL'` (SMP/SMA/Umum). |
| `created_at` | `TIMESTAMPTZ` | Waktu pendaftaran siswa. |

#### 3. Tabel: `test_sessions` (Sesi Ujian Siswa)
Mencatat siklus hidup sesi pengerjaan tes siswa.
| Nama Kolom | Tipe Data | Keterangan |
| :--- | :--- | :--- |
| `id` | `UUID` | **Primary Key** (default: `gen_random_uuid()`). |
| `student_id` | `UUID` | **Foreign Key** ke `students.id` (ON DELETE CASCADE). |
| `started_at` | `TIMESTAMPTZ` | Waktu siswa menekan tombol mulai tes di server. |
| `submitted_at` | `TIMESTAMPTZ` | Waktu siswa menyelesaikan dan mengumpulkan tes (nullable). |
| `elapsed_seconds` | `INTEGER` | Akumulasi durasi pengerjaan dalam detik (default: `0`). |
| `score_percentage`| `NUMERIC(5,2)` | Nilai skor otomatis pengerjaan: 0.00 s/d 100.00 (default: `0.00`). |
| `device_token` | `VARCHAR(100)` | Token acak perangkat aktif untuk keamanan *single active device*. |
| `status` | `VARCHAR(30)` | Status sesi: `'IN_PROGRESS'`, `'COMPLETED'`, `'FINALIZED'`, atau `'RESET'`. |
| `created_at` | `TIMESTAMPTZ` | Waktu sesi dibuat. |

#### 4. Tabel: `questions` (Bank Soal Pilihan Ganda)
Menyimpan butir pertanyaan teks untuk masing-masing jenjang.
| Nama Kolom | Tipe Data | Keterangan |
| :--- | :--- | :--- |
| `id` | `UUID` | **Primary Key** (default: `gen_random_uuid()`). |
| `target_level` | `VARCHAR(30)` | Jenjang soal: `'ELEMENTARY'` atau `'HIGH_SCHOOL'`. |
| `question_text` | `TEXT` | Teks pertanyaan soal bahasa Inggris. |
| `is_active` | `BOOLEAN` | Penanda soal aktif digunakan atau tidak (default: `true`). |
| `created_by` | `UUID` | **Foreign Key** ke `profiles.id` (nullable). |
| `created_at` | `TIMESTAMPTZ` | Waktu soal ditambahkan. |

#### 5. Tabel: `question_options` (Opsi Jawaban Dinamis)
Menyimpan pilihan opsi jawaban (fleksibel 2 hingga 5 opsi per butir soal).
| Nama Kolom | Tipe Data | Keterangan |
| :--- | :--- | :--- |
| `id` | `UUID` | **Primary Key** (default: `gen_random_uuid()`). |
| `question_id` | `UUID` | **Foreign Key** ke `questions.id` (ON DELETE CASCADE). |
| `option_text` | `TEXT` | Teks pilihan jawaban. |
| `is_correct` | `BOOLEAN` | Kunci jawaban benar: `true` (tepat satu opsi benar per soal) atau `false`. |
| `sort_order` | `INTEGER` | Urutan dasar opsi di bank soal (default: `0`). |

#### 6. Tabel: `test_responses` (Lembar Jawaban Siswa)
Mencatat pilihan jawaban siswa pada butir soal tertentu dalam satu sesi tes.
| Nama Kolom | Tipe Data | Keterangan |
| :--- | :--- | :--- |
| `id` | `UUID` | **Primary Key** (default: `gen_random_uuid()`). |
| `session_id` | `UUID` | **Foreign Key** ke `test_sessions.id` (ON DELETE CASCADE). |
| `question_id` | `UUID` | **Foreign Key** ke `questions.id` (ON DELETE CASCADE). |
| `selected_option_id`| `UUID` | **Foreign Key** ke `question_options.id` (opsi yang dipilih siswa, nullable). |
| `display_order` | `INTEGER` | Urutan nomor soal hasil pengacakan Fisher-Yates untuk siswa tersebut. |
| `synced_at` | `TIMESTAMPTZ` | Waktu sinkronisasi jawaban terakhir ke server. |

#### 7. Tabel: `placement_evaluations` (Hasil Evaluasi & Penetapan Tutor)
Mencatat penetapan level resmi siswa oleh Tutor.
| Nama Kolom | Tipe Data | Keterangan |
| :--- | :--- | :--- |
| `id` | `UUID` | **Primary Key** (default: `gen_random_uuid()`). |
| `session_id` | `UUID` | **Foreign Key** ke `test_sessions.id` (unik, 1 sesi = 1 evaluasi final). |
| `tutor_id` | `UUID` | **Foreign Key** ke `profiles.id` (tutor penilai). |
| `assigned_level`| `VARCHAR(30)` | Level resmi: `'BEGINNER'`, `'INTERMEDIATE'`, atau `'ADVANCED'`. |
| `tutor_notes` | `TEXT` | Catatan evaluasi kualitatif tutor (opsional). |
| `finalized_at` | `TIMESTAMPTZ` | Waktu penetapan level resmi (default: `now()`). |

---

### 5.2 Skrip SQL DDL Lengkap (`supabase/schema.sql`)

```sql
-- 1. Ekstensi UUID
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- 2. Tabel Profiles (Staf Lembaga)
CREATE TABLE public.profiles (
    id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    full_name VARCHAR(150) NOT NULL,
    email VARCHAR(150) UNIQUE NOT NULL,
    role VARCHAR(30) NOT NULL CHECK (role IN ('ADMIN', 'TUTOR_ELEMENTARY', 'TUTOR_HIGH_SCHOOL')),
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 3. Tabel Students (Siswa)
CREATE TABLE public.students (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    full_name VARCHAR(150) NOT NULL,
    phone_number VARCHAR(20) NOT NULL,
    target_level VARCHAR(30) NOT NULL CHECK (target_level IN ('ELEMENTARY', 'HIGH_SCHOOL')),
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
CREATE INDEX idx_students_lookup ON public.students(full_name, phone_number);

-- 4. Tabel Test Sessions (Sesi Ujian)
CREATE TABLE public.test_sessions (
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
CREATE INDEX idx_test_sessions_student_status ON public.test_sessions(student_id, status);

-- 5. Tabel Questions (Bank Soal)
CREATE TABLE public.questions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    target_level VARCHAR(30) NOT NULL CHECK (target_level IN ('ELEMENTARY', 'HIGH_SCHOOL')),
    question_text TEXT NOT NULL,
    is_active BOOLEAN NOT NULL DEFAULT TRUE,
    created_by UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
CREATE INDEX idx_questions_level_active ON public.questions(target_level, is_active);

-- 6. Tabel Question Options (Opsi Jawaban Dinamis 2 - 5 baris)
CREATE TABLE public.question_options (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    question_id UUID NOT NULL REFERENCES public.questions(id) ON DELETE CASCADE,
    option_text TEXT NOT NULL,
    is_correct BOOLEAN NOT NULL DEFAULT FALSE,
    sort_order INTEGER NOT NULL DEFAULT 0
);
CREATE INDEX idx_question_options_qid ON public.question_options(question_id);

-- 7. Tabel Test Responses (Lembar Jawaban Siswa)
CREATE TABLE public.test_responses (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    session_id UUID NOT NULL REFERENCES public.test_sessions(id) ON DELETE CASCADE,
    question_id UUID NOT NULL REFERENCES public.questions(id) ON DELETE CASCADE,
    selected_option_id UUID REFERENCES public.question_options(id) ON DELETE SET NULL,
    display_order INTEGER NOT NULL,
    synced_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    CONSTRAINT uq_session_question UNIQUE (session_id, question_id)
);

-- 8. Tabel Placement Evaluations (Penetapan Level oleh Tutor)
CREATE TABLE public.placement_evaluations (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    session_id UUID UNIQUE NOT NULL REFERENCES public.test_sessions(id) ON DELETE CASCADE,
    tutor_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE RESTRICT,
    assigned_level VARCHAR(30) NOT NULL CHECK (assigned_level IN ('BEGINNER', 'INTERMEDIATE', 'ADVANCED')),
    tutor_notes TEXT,
    finalized_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
```

---

## 6. Algoritma Fisher-Yates Shuffle (Spesifikasi Bisnis Logic)

Algoritma pengacakan diimplementasikan sebagai modul murni TypeScript (`lib/algorithms/fisher-yates.ts`) dengan kompleksitas waktu linier $O(n)$ dan memori in-place $O(1)$:

```typescript
// lib/algorithms/fisher-yates.ts

/**
 * Mengacak susunan array menggunakan Algoritma Fisher-Yates (Durstenfeld / Knuth Shuffle).
 * Menghasilkan probabilitas permutasi seragam yang merata (1/n!) untuk integritas ujian.
 */
export function fisherYatesShuffle<T>(array: T[]): T[] {
  const result = [...array];
  for (let i = result.length - 1; i > 0; i--) {
    // Generate indeks acak integer seragam antara 0 dan i (inklusif)
    const j = Math.floor(Math.random() * (i + 1));
    // Pertukaran elemen posisi i dan j
    [result[i], result[j]] = [result[j], result[i]];
  }
  return result;
}
```

---

## 7. API Specification (Contracts & Endpoints)

### 7.1 Siswa (Student Endpoints)
| Method | Path | Autentikasi | Deskripsi & Payload |
| :--- | :--- | :--- | :--- |
| `POST` | `/api/student/verify` | Publik | Validasi Nama & No HP, periksa status sesi pengerjaan.<br>**Body:** `{ fullName, phoneNumber }`<br>**Response:** `{ studentId, hasActiveSession, sessionId, status }` |
| `POST` | `/api/student/start` | Publik | Memulai sesi tes baru atau melanjutkan sesi berjalan. Menjalankan pengacakan Fisher-Yates jika sesi baru.<br>**Body:** `{ studentId, deviceToken }`<br>**Response:** `{ session: { id, startedAt, elapsedSeconds, questions: [...] } }` |
| `POST` | `/api/student/sync` | Sesi Siswa | Autosave jawaban ke server saat online.<br>**Body:** `{ sessionId, deviceToken, responses: [{ questionId, selectedOptionId }] }`<br>**Response:** `{ success: true, syncedCount: number }` |
| `POST` | `/api/student/submit` | Sesi Siswa | Pengumpulan final lembar ujian.<br>**Body:** `{ sessionId, deviceToken, finalResponses: [...] }`<br>**Response:** `{ success: true, scorePercentage, status: 'COMPLETED' }` |
| `GET` | `/api/student/result` | Publik | Mengambil hasil penempatan resmi siswa setelah difinalisasi.<br>**Query:** `?studentId=...&phoneNumber=...`<br>**Response:** `{ status, assignedLevel, tutorNotes, scorePercentage, elapsedSeconds }` |

### 7.2 Staf Admin (Admin Endpoints)
| Method | Path | Hak Akses | Deskripsi |
| :--- | :--- | :--- | :--- |
| `GET` | `/api/admin/dashboard` | Staf ADMIN | Mengambil 4 metrik ringkasan dashboard & 5 aktivitas tes hari ini. |
| `GET` | `/api/admin/students` | Staf ADMIN | Mengambil daftar siswa, status pengerjaan, dan filter jenjang. |
| `POST`| `/api/admin/students` | Staf ADMIN | Mendaftarkan siswa baru (`fullName`, `phoneNumber`, `targetLevel`). |
| `POST`| `/api/admin/students/[id]/reset` | Staf ADMIN | Soft Reset: membatalkan sesi lama (`status = RESET`), membuat sesi baru `NOT_STARTED`. |
| `GET` | `/api/admin/tutors` | Staf ADMIN | Mengambil daftar seluruh akun Tutor yang terdaftar di sistem. |
| `POST`| `/api/admin/tutors` | Staf ADMIN | **Mendaftarkan akun Tutor baru.** Menggunakan Supabase Admin Auth API (`admin.createUser`) dan mencatat ke tabel `profiles`.<br>**Body:** `{ fullName, email, password, role }` |
| `PUT` | `/api/admin/tutors` | Staf ADMIN | Memperbarui nama lengkap, email, password baru (opsional), dan jenjang penugasan tutor.<br>**Body:** `{ id, fullName, email, password?, role }` |
| `DELETE`| `/api/admin/tutors?id={id}` | Staf ADMIN | **Menghapus akun Tutor dengan Proteksi Relasi.** Memvalidasi `id` (UUID), mencegah *self-deletion* admin, dan memblokir penghapusan jika tutor telah memiliki riwayat evaluasi siswa (HTTP 409) untuk melindungi foreign key `placement_evaluations`. |
| `GET` | `/api/admin/questions` | Staf ADMIN | Mengambil daftar bank soal seluruh jenjang. |
| `POST`| `/api/admin/questions` | Staf ADMIN | Menambah butir soal baru dengan 2 s/d 5 baris opsi dinamis. |
| `PUT` | `/api/admin/questions/[id]` | Staf ADMIN | Mengubah teks pertanyaan, opsi jawaban, atau kunci benar. |
| `DELETE`| `/api/admin/questions/[id]` | Staf ADMIN | Menghapus butir soal. |
| `GET` | `/api/admin/reports` | Staf ADMIN | Mengambil data rekapitulasi hasil tes seluruh siswa untuk tabel & ekspor. |

### 7.3 Staf Tutor (Tutor Endpoints)
| Method | Path | Hak Akses | Deskripsi |
| :--- | :--- | :--- | :--- |
| `GET` | `/api/tutor/dashboard` | Staf TUTOR | Mengambil metrik evaluasi khusus jenjang yang diampu tutor. |
| `GET` | `/api/tutor/evaluations` | Staf TUTOR | Mengambil daftar siswa jenjang binaan dengan filter `COMPLETED` dan `FINALIZED`. |
| `GET` | `/api/tutor/evaluations/[sessionId]` | Staf TUTOR | Mengambil rincian lembar jawaban siswa (soal, opsi dipilih, kunci jawaban benar, status benar/salah). |
| `POST`| `/api/tutor/evaluations/[sessionId]` | Staf TUTOR | Menyimpan keputusan level final (`assignedLevel`) resmi siswa.<br>**Body:** `{ assignedLevel }` |
| `GET` | `/api/tutor/questions` | Staf TUTOR | Mengambil bank soal khusus jenjang yang diampu tutor. |
| `POST`| `/api/tutor/questions` | Staf TUTOR | Menambah butir soal khusus jenjang pengampu. |

---

## 8. Authentication, Authorization, and Security

### 8.1 Manajemen Akun Staf (Admin & Tutor)
1. **Inisialisasi Akun Admin Pertama:**
   - Didaftarkan sekali di dashboard Supabase Auth, lalu datanya dicatat ke tabel `profiles` dengan role `'ADMIN'`.
2. **Pembuatan Akun Tutor Mandiri oleh Admin:**
   - Admin membuat akun Tutor melalui antarmuka web di `/staff/admin/tutors`.
   - Backend memanggil `supabaseAdmin.auth.admin.createUser({ email, password, email_confirm: true })`.
   - Data otomatis dicatat ke tabel `profiles` dengan role `'TUTOR_ELEMENTARY'` atau `'TUTOR_HIGH_SCHOOL'`.
3. **Role Enforcement (RBAC Middleware & Route Guards):**
   - Rute `/staff/admin/*` dan `/api/admin/*` menolak akses jika role pengguna bukan `ADMIN` (HTTP 403 Forbidden).
   - Rute `/staff/tutor/*` dan `/api/tutor/*` memvalidasi bahwa Tutor Elementary hanya dapat melihat/mengubah data siswa jenjang `ELEMENTARY`, sedangkan Tutor High School hanya untuk `HIGH_SCHOOL`.
4. **Proteksi Integritas Penghapusan Akun Tutor (Opsi A):**
   - Sebelum menghapus akun staf tutor dari Supabase Auth, backend memverifikasi apakah akun tersebut telah memiliki relasi pada tabel `placement_evaluations`.
   - Jika sudah memiliki riwayat penilaian siswa, penghapusan ditolak (HTTP 409 Conflict) demi menjaga keutuhan laporan audit placement test lembaga.
   - Dilengkapi proteksi larangan *self-deletion* (admin tidak dapat menghapus akunnya sendiri) dan proteksi *role boundary* (akun admin tidak dapat dihapus melalui rute tutor).

### 8.2 Keamanan Sesi Siswa, Kriptografi, & Anti-Abuse
- **Token Kriptografis Siswa (HMAC-SHA256):** Identitas siswa diikat menggunakan token terenkripsi HMAC-SHA256 yang disimpan pada cookie `HttpOnly`, `SameSite=lax` (`up_speaking_student_token`). Verifikasi tanda tangan menggunakan `crypto.timingSafeEqual` untuk mencegah *timing attack* dan pemalsuan token sesi.
- **Single Active Device Control:** Setiap kali siswa memulai sesi pengerjaan, sistem mengenerate token perangkat acak: `device_token` yang disimpan di `localStorage` siswa dan di kolom `test_sessions.device_token`. Jika siswa berpindah gawai, sesi lama otomatis dinonaktifkan dengan pesan konflik perangkat.
- **Kunci Jawaban Aman:** Endpoint siswa **tidak pernah mengirimkan kolom `is_correct`** ke browser. Penilaian murni dihitung secara deterministik di backend saat tombol submit dikirim.
- **Proteksi Brute-Force (Rate Limiting):** Endpoint publik `/api/auth/login` (5 req/menit) dan `/api/student/verify` (10 req/menit) dilindungi pembatas laju permintaan dengan ekstraksi IP terpercaya (`x-vercel-ip`, `x-real-ip`).
- **Mitigasi Kerentanan Gambar & Header Keamanan:** Format gambar Next.js dibatasi ke WebP (`formats: ['image/webp']`) di `next.config.mjs` untuk memitigasi kerentanan AVIF RCE upstream (GHSA-2xp9-vwfh-vxw4). Header keamanan lengkap mencakup HSTS, X-Frame-Options DENY, X-Content-Type-Options nosniff, dan CSP frame-ancestors none.

---

## 9. Module and Code Structure (Next.js App Router & Supabase)

```text
up-speaking/
├── assets/
│   └── logo/                      # Aset logo resmi Up Speaking
├── docs/                          # Dokumentasi resmi (PRD, UI/UX, Tech Spec)
├── supabase/
│   ├── schema.sql                 # Skrip SQL DDL tabel database Supabase
│   └── seed.sql                   # Skrip SQL inisialisasi akun Admin pertama
├── src/
│   ├── app/
│   │   ├── layout.tsx             # Root layout (Font, Meta, Providers)
│   │   ├── page.tsx               # SCR-001: Beranda & Landing Page Siswa
│   │   ├── test/
│   │   │   └── page.tsx           # SCR-003: Lembar Ujian Siswa (Stepper)
│   │   ├── result/
│   │   │   └── page.tsx           # SCR-004: Layar Selesai & Hasil Resmi
│   │   ├── staff/
│   │   │   ├── login/page.tsx     # SCR-005: Login Staf Lembaga
│   │   │   ├── admin/
│   │   │   │   ├── layout.tsx     # Admin Sidebar Layout (CMP-005)
│   │   │   │   ├── dashboard/page.tsx # SCR-006: Admin Dashboard
│   │   │   │   ├── students/page.tsx  # SCR-007: Kelola Siswa & Reset
│   │   │   │   ├── tutors/page.tsx    # SCR-014: Admin Kelola Akun Tutor
│   │   │   │   ├── reports/page.tsx   # SCR-008: Hasil & Laporan Ekspor
│   │   │   │   └── questions/page.tsx # SCR-009: Admin Bank Soal
│   │   │   └── tutor/
│   │   │       ├── layout.tsx     # Tutor Sidebar Layout
│   │   │       ├── dashboard/page.tsx # SCR-010: Tutor Dashboard
│   │   │       ├── evaluations/page.tsx # SCR-011: Penilaian Siswa
│   │   │       ├── reports/page.tsx   # SCR-012: Laporan Rekap Tutor
│   │   │       └── questions/page.tsx # SCR-013: Tutor Bank Soal
│   │   └── api/                   # Route Handlers
│   │       ├── auth/              # Login & Logout Staf via Supabase
│   │       ├── student/           # Verify, Start, Sync, Submit, Result
│   │       ├── admin/             # Dashboard, Students, Tutors, Reset, Questions, Reports
│   │       └── tutor/             # Dashboard, Evaluations, Questions, Reports
│   ├── components/                # Reusable React Components
│   │   ├── student/
│   │   │   ├── QuestionCard.tsx   # CMP-002: Kartu Soal & Opsi Dinamis
│   │   │   ├── QuestionPalette.tsx# CMP-001: Palet Nomor Soal
│   │   │   ├── ElapsedTimer.tsx   # CMP-003: Timer Hitung Maju
│   │   │   └── OfflineBanner.tsx  # CMP-004: Banner Status Koneksi
│   │   ├── staff/
│   │   │   ├── Sidebar.tsx        # CMP-005: Sidebar Navigasi Staf
│   │   │   ├── StatCard.tsx       # Kartu Metrik Dashboard
│   │   │   └── EvaluationModal.tsx# CMP-007: Modal Review & Penetapan Level
│   │   └── ui/                    # Base UI (Button, Modal, Input, Badge)
│   ├── hooks/                     # Custom React Hooks
│   │   ├── useOfflineSync.ts      # Hook sinkronisasi localStorage & jaringan
│   │   └── useElapsedTimer.ts     # Hook kalkulasi waktu hitung maju
│   ├── lib/                       # Utilities & Business Logic
│   │   ├── algorithms/
│   │   │   └── fisher-yates.ts    # Algoritma Fisher-Yates Shuffle
│   │   ├── supabase/
│   │   │   ├── client.ts          # Client-side Supabase Browser Client
│   │   │   ├── server.ts          # Server-side Supabase SSR Client
│   │   │   └── admin.ts           # Supabase Service Role Client (Privileged API)
│   │   └── export/
│   │       ├── excel-generator.ts # Generator berkas .xlsx (ExcelJS)
│   │       └── pdf-generator.ts   # Generator berkas .pdf (jsPDF)
│   ├── types/                     # TypeScript Type Definitions
│   │   └── database.types.ts      # Tipe data tabel Supabase
│   └── middleware.ts              # Route Guard & Role RBAC Middleware
├── tailwind.config.ts             # Konfigurasi Token Desain Up Speaking
├── tsconfig.json
└── package.json
```

---

## 10. Strategi Offline-Tolerant & Client-Side Sync

### Alur Kerja di Frontend (`useOfflineSync.ts`):
1. **Penyimpanan Lokal Instan:** State lokal di `localStorage` langsung diperbarui saat memilih opsi jawaban.
2. **Event Listener Jaringan:** Memantau status koneksi browser (`online` dan `offline`).
3. **Queueing & Auto-Sync:** Autosave berjalan debounced (500ms). Jika offline, data tertampung di antrean lokal; begitu online, otomatis disinkronkan ke server.
4. **Guard Submit Ujian:** Tombol submit memeriksa `navigator.onLine`. Jika offline, aplikasi menahan pengiriman dan memunculkan modal peringatan.

---

## 11. Testing Strategy

1. **Unit Testing:** Algoritma Fisher-Yates Shuffle ($O(n)$ keacakan dan integritas panjang array).
2. **Integration Testing:** Endpoint pendaftaran siswa, pembuatan akun tutor, autosave jawaban, auto-scoring, dan RBAC per jenjang.
3. **Black Box Testing:** Pengujian matriks fungsional untuk seluruh kebutuhan PRD (`FR-001` s/d `FR-017`).
4. **User Acceptance Testing (UAT):** Kuesioner pengujian penerimaan pengguna di Up Speaking Learning Centre (Admin, Tutor, Siswa).

---

## 12. Deployment and Environment Configuration

### 12.1 Konfigurasi Environment Variables (`.env.local`)
```env
# Supabase Configuration
NEXT_PUBLIC_SUPABASE_URL="https://[project-id].supabase.co"
NEXT_PUBLIC_SUPABASE_ANON_KEY="eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
SUPABASE_SERVICE_ROLE_KEY="eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."

# Base App URL
NEXT_PUBLIC_APP_URL="https://up-speaking-placement.vercel.app"
```

### 12.2 Inisialisasi Akun Admin Pertama (`supabase/seed.sql`):
```sql
-- Dijalankan sekali setelah membuat user di Supabase Auth untuk menetapkan peran ADMIN:
INSERT INTO public.profiles (id, full_name, email, role)
VALUES (
  'UUID_USER_DARI_SUPABASE_AUTH',
  'Administrator Utama',
  'admin@upspeaking.com',
  'ADMIN'
) ON CONFLICT (id) DO NOTHING;
```

---

## 13. Requirement-to-Technical Traceability Matrix

| PRD FR ID | Deskripsi Kebutuhan | Komponen Teknis / File Implementasi |
| :--- | :--- | :--- |
| **FR-001** | Login staf email/pass & Siswa Nama+HP | Supabase Auth SSR (`/api/auth/*`) & Student Verify (`/api/student/verify`) |
| **FR-002** | Validasi pendaftaran siswa oleh Admin | Zod schema validation & Supabase insert di `/api/admin/students` |
| **FR-003** | Akses langsung ke lembar ujian | Client Router redirect ke `/test` |
| **FR-004** | Fisher-Yates Shuffle soal & opsi | Modul `lib/algorithms/fisher-yates.ts` dieksekusi di `/api/student/start` |
| **FR-005** | Simpan sesi lokal & auto-resume | Browser `localStorage` + hook `useOfflineSync.ts` |
| **FR-006** | Pengambilalihan sesi di HP baru | Kolom `test_sessions.device_token` dan validasi token di API handler |
| **FR-007** | Pengerjaan offline & auto-sync | `localStorage` queue + sync handler di `/api/student/sync` |
| **FR-008** | Timer hitung maju (*elapsed timer*) | Perhitungan selisih timestamp `Date.now() - started_at` di `useElapsedTimer.ts` |
| **FR-009** | Validasi online saat submit tes | Pemeriksaan `navigator.onLine` & transaksi atomik di `/api/student/submit` |
| **FR-010** | Soft reset sesi tes siswa oleh Admin | Endpoint `/api/admin/students/[id]/reset` mengubah status sesi lama ke `RESET` |
| **FR-011** | Opsi dinamis 2 s/d 5 baris | Relasi 1-to-N `questions` ke `question_options` di PostgreSQL |
| **FR-012** | Seluruh soal aktif diujikan | Query Supabase: `.from('questions').select('*, question_options(*)').eq('target_level', level).eq('is_active', true)` |
| **FR-013** | Filter siswa Perlu Dinilai vs Selesai | Query Supabase dengan filter `.eq('status', 'COMPLETED')` |
| **FR-014** | Panduan rentang nilai lembaga | Logika evaluator di `EvaluationModal.tsx` & acuan skor (0-59, 60-79, 80-100) |
| **FR-015** | Penetapan level & catatan Tutor | Endpoint `/api/tutor/evaluations/[sessionId]` insert `placement_evaluations` |
| **FR-016** | Ekspor laporan ke Excel & PDF | Modul `excel-generator.ts` (ExcelJS) & `pdf-generator.ts` (jsPDF) |
| **FR-017** | Admin mendaftarkan akun Tutor baru | Endpoint `/api/admin/tutors` (Supabase Admin Auth API) & UI `/staff/admin/tutors` |

---

## 14. Readiness Checklist
- [x] Fitur pembuatan akun Tutor mandiri oleh Admin terpasang di endpoint `/api/admin/tutors` dan UI `SCR-014`.
- [x] Inisialisasi akun Admin pertama terdokumentasi jelas dengan skrip seeder `supabase/seed.sql`.
- [x] ORM Prisma telah dihapus 100%, sistem murni menggunakan **Native Supabase Client** (`@supabase/supabase-js` dan `@supabase/ssr`).
- [x] Seluruh diagram kode Mermaid telah dihapus dan digantikan oleh deskripsi terstruktur, tabel kamus data, dan skrip SQL DDL murni.
- [x] Algoritma Fisher-Yates Shuffle terdokumentasi dengan kode implementasi dan analisis kompleksitas $O(n)$.
- [x] Seluruh kebutuhan `FR-001` s/d `FR-017` terpetakan 100% ke arsitektur teknis.
