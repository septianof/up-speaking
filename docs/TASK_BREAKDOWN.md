# Task Breakdown

## 1. Project and Artifact Context
- **Project Title:** Rancang Bangun Sistem Informasi Tes Penempatan Berbasis Web Menggunakan Algoritma Fisher-Yates Shuffle (Studi Kasus: Up Speaking Learning Centre)
- **Product Name:** Up Speaking Placement Test System
- **Document Version:** 1.0.0
- **Status:** `Approved`
- **Author:** Senior Technical Planner (AI) & Mahasiswa Kerja Praktik
- **Source Documents:**
  1. [Product Requirements Document (PRD v2.3.0 Approved)](file:///D:/SeptianoF/Projects/Learning/up-speaking/docs/PRD.md)
  2. [UI/UX Design Brief (v1.4.0 Approved)](file:///D:/SeptianoF/Projects/Learning/up-speaking/docs/UIUX_DESIGN_BRIEF.md)
  3. [Technical Specification (v1.2.0 Approved)](file:///D:/SeptianoF/Projects/Learning/up-speaking/docs/TECHNICAL_SPEC.md)

---

## 2. Planning Assumptions and Open Questions
- **Confirmed Facts:**
  - Stack: Next.js (App Router, TypeScript, Tailwind CSS), Framer Motion, Native Supabase Client (`@supabase/supabase-js`, `@supabase/ssr`), ExcelJS, jsPDF.
  - Arsitektur: Monolith Serverless di Vercel dengan basis data managed PostgreSQL di Supabase.
  - Strategi Pelaksanaan Terpilih: **Frontend-First (Opsi B)** — Membangun fondasi desain dan seluruh komponen serta halaman antarmuka (UI) interaktif dengan mock data terlebih dahulu, dilanjutkan dengan integrasi database, logika bisnis backend (Fisher-Yates Shuffle, Supabase Auth, API Handlers), dan pengujian akhir.
  - Format Visual: Seluruh dokumentasi disajikan menggunakan teks terstruktur murni tanpa kode diagram Mermaid.
- **Unresolved Questions:** Tidak ada pertanyaan terbuka yang memblokir perencanaan; seluruh ruang lingkup MVP telah terkunci.

---

## 3. Chosen Execution Strategy: Frontend-First
Pendekatan **Frontend-First** dipilih agar seluruh bentuk visual, alur pengalaman pengguna, dan interaktivitas lembar ujian siswa maupun dashboard staf dapat ditinjau dan divalidasi secara langsung di layar sebelum menghubungkan logika database dan API backend.

Urutan fase pengerjaan:
1. **Fase 1: Setup Proyek & UI Foundation** (Inisialisasi Next.js, Tailwind token Up Speaking, Framer Motion, layout dasar).
2. **Fase 2: Implementasi Antarmuka Siswa (Student UI & Mock State)** (Beranda, modal login, lembar tes stepper 1 soal per halaman, palet nomor, dan layar selesai).
3. **Fase 3: Implementasi Antarmuka Staf (Staff Dashboard UI & Mock State)** (Login staf, layout sidebar, dashboard admin, kelola siswa, kelola tutor, bank soal, dashboard tutor, dan modal evaluasi).
4. **Fase 4: Basis Data & Logika Backend Supabase** (Eksekusi SQL DDL di Supabase, seeder admin, modul Fisher-Yates, Supabase Auth SSR, dan API Route Handlers).
5. **Fase 5: Integrasi Penuh (Fullstack Wiring & Offline Sync)** (Menghubungkan frontend ke API backend, implementasi `useOfflineSync`, ekspor Excel/PDF).
6. **Fase 6: Pengujian Sistem & Rilis Vercel** (Unit test Fisher-Yates, Black Box testing, dan deployment Vercel).

---

## 4. Progress Tracker (Status Pelaksanaan Proyek)

Tabel berikut menjadi acuan utama bagi AI Coding Agent dan pengembang manusia untuk melacak progres tugas secara riil. Sebelum memulai sesi atau setelah chat di-clear, periksa status tugas di bawah ini.

| Task ID | Nama Tugas / Ruang Lingkup | Fase | Status | Tgl Selesai | Verifikasi / Bukti Uji |
| :--- | :--- | :---: | :---: | :---: | :--- |
| **`TASK-001`** | Inisialisasi Proyek Next.js, TS, & Tailwind CSS | Fase 1 | `Done` | 2026-10-10 | next build sukses (Static 5/5) |
| **`TASK-002`** | Pustaka Komponen Dasar (Base UI Components) | Fase 1 | `Done` | 2026-10-10 | next build sukses, lulus uji komponen |
| **`TASK-003`** | Halaman Beranda Siswa (`SCR-001`) & Modal Akses (`SCR-002`) | Fase 2 | `Done` | 2026-10-10 | next build sukses, lulus validasi & redirect |
| **`TASK-004`** | Lembar Ujian Stepper (`SCR-003`) & Palet Soal (`CMP-001`–`004`) | Fase 2 | `Done` | 2026-10-10 | next build sukses, stepper & palet responsif |
| **`TASK-005`** | Modal Konfirmasi Submit & Layar Selesai Siswa (`SCR-004`) | Fase 2 | `Done` | 2026-10-10 | next build sukses, konfirmasi submit & hasil |
| **`TASK-006`** | Layout Sidebar Staf (`CMP-005`) & Login Staf (`SCR-005`) | Fase 3 | `Done` | 2026-10-11 | next build sukses, sidebar responsive & login staff |
| **`TASK-007`** | Dashboard Admin (`SCR-006`) & Kelola Siswa (`SCR-007`) | Fase 3 | `Done` | 2026-10-11 | next build sukses, dashboard admin metrik & kelola siswa soft reset |
| **`TASK-008`** | Admin Kelola Tutor (`SCR-014`) & Bank Soal (`SCR-009`) | Fase 3 | `Done` | 2026-10-11 | next build sukses, kelola tutor SCR-014 & bank soal dinamis 2-5 opsi SCR-009 |
| **`TASK-009`** | Dashboard Tutor (`SCR-010`), Evaluasi Level (`SCR-011`), Bank Soal (`SCR-013`) | Fase 3 | `Done` | 2026-10-11 | next build sukses, dashboard tutor SCR-010, evaluasi SCR-011, bank soal SCR-013, & modal penilaian CMP-007 |
| **`TASK-010`** | Halaman Hasil & Laporan (`SCR-008` & `SCR-012`) | Fase 3 | `Done` | 2026-10-11 | next build sukses, laporan admin & tutor dengan ekspor Excel & PDF |
| **`TASK-011`** | Skrip DDL Basis Data (`schema.sql`) & Seed Admin (`seed.sql`) | Fase 4 | `Done` | 2026-10-14 | Skrip DDL tabel & seeder sukses dieksekusi di Supabase |
| **`TASK-012`** | Modul Algoritma Fisher-Yates Shuffle & Unit Test | Fase 4 | `Done` | 2026-10-14 | Klien Supabase & algoritma Fisher-Yates murni O(n) terverifikasi |
| **`TASK-013`** | Endpoint API Siswa (Verify, Start, Sync, Submit, Result) | Fase 4 | `Done` | 2026-10-14 | Route handlers verify, start, sync, submit, result terpasang |
| **`TASK-014`** | Autentikasi Staf SSR, Middleware RBAC, & API Admin | Fase 4 | `Done` | 2026-10-14 | Middleware RBAC & Route handlers admin terpasang |
| **`TASK-015`** | API Tutor (Evaluasi & Finalisasi Level Siswa) | Fase 4 | `Done` | 2026-10-14 | Route handlers tutor dashboard, evaluations, questions terpasang |
| **`TASK-016`** | Integrasi Alur Siswa & Hook `useOfflineSync` | Fase 5 | `Done` | 2026-10-14 | Fullstack wiring siswa, hook useOfflineSync & useElapsedTimer |
| **`TASK-017`** | Integrasi Dashboard Staf (Admin & Tutor) | Fase 5 | `Done` | 2026-10-14 | Fullstack wiring dashboard Admin & Tutor terhubung API real |
| **`TASK-019`** | Unit Testing Fisher-Yates & Black Box Testing | Fase 6 | `Done` | 2026-10-14 | Vitest 6/6 test lulus (100% pass) & TEST_REPORT.md FR-001–017 lengkap |
| **`TASK-020`** | Konfigurasi Produksi & Deployment Vercel | Fase 6 | `Pending` | - | - |

---

## 5. Phases and Task List

### FASE 1: Setup Proyek & UI Foundation

#### `TASK-001`: Inisialisasi Proyek Next.js, TypeScript, & Tailwind CSS
- **Goal / Scope:** Membuat struktur proyek Next.js App Router dengan TypeScript, mengonfigurasi Tailwind CSS sesuai token desain Up Speaking (`primary-500: #3D98D6`, `accent-500: #ED3937`, `success-500: #10B981`, font Plus Jakarta Sans), dan memasang pustaka pendukung (`framer-motion`, `lucide-react`, `clsx`, `tailwind-merge`).
- **Requirement Links:** [UI/UX Section 4 & 5 (Tokens)](file:///D:/SeptianoF/Projects/Learning/up-speaking/docs/UIUX_DESIGN_BRIEF.md#5-design-tokens), [Tech Spec Section 3](file:///D:/SeptianoF/Projects/Learning/up-speaking/docs/TECHNICAL_SPEC.md#3-technology-stack).
- **Target Area:** `package.json`, `tailwind.config.ts`, `src/app/globals.css`, `src/app/layout.tsx`.
- **Dependencies:** None.
- **Execution Phase:** Fase 1 (Task 1).
- **Acceptance Criteria:** Proyek Next.js dapat berjalan via `npm run dev` tanpa error; font dan warna custom Tailwind terbaca sempurna; logo resmi dari `assets/logo/logo.png` dapat ditampilkan di halaman root.
- **Verification:** Jalankan `npm run build` dan pastikan kompilasi sukses tanpa error TypeScript.
- **Risk / Notes:** Pastikan dependensi versi React dan Next.js stabil.
- **Status:** `Done` (Verified 2026-10-10)

#### `TASK-002`: Pustaka Komponen Dasar (Base UI Components)
- **Goal / Scope:** Membangun set komponen dasar yang dapat digunakan ulang: Button (`ui/Button.tsx`), Modal Dialog (`ui/Modal.tsx`), Input Field dengan validasi label/error (`ui/Input.tsx`), dan Status Badge Pill (`ui/Badge.tsx`).
- **Requirement Links:** [UI/UX Section 5.3 & 8](file:///D:/SeptianoF/Projects/Learning/up-speaking/docs/UIUX_DESIGN_BRIEF.md#53-spacing-radii--shadows).
- **Target Area:** `src/components/ui/*`.
- **Dependencies:** `TASK-001`.
- **Execution Phase:** Fase 1 (Task 2).
- **Acceptance Criteria:** Seluruh komponen dasar mendukung varian warna (`primary`, `accent`, `success`, `neutral`), status disabled, dan animasi halus menggunakan Framer Motion.
- **Verification:** Inspeksi visual pada komponen uji di browser.
- **Risk / Notes:** Pastikan touch target tombol minimal 44x44px sesuai standar aksesibilitas WCAG 2.1 AA.
- **Status:** `Done` (Verified 2026-10-10)

---

### FASE 2: Implementasi Antarmuka Siswa (Student UI & Interactive Mock)

#### `TASK-003`: Halaman Beranda Siswa (`SCR-001`) & Modal Akses (`SCR-002`)
- **Goal / Scope:** Membangun halaman beranda ramah siswa yang memuat logo Up Speaking, penjelasan tujuan tes, 4 poin panduan pengerjaan, tombol "Mulai Tes Sekarang", modal input identitas (Nama Lengkap + Nomor HP), dan logika auto-redirect jika mendeteksi sesi aktif di `localStorage`.
- **Requirement Links:** PRD `FR-001`, `FR-003`; UI/UX `SCR-001`, `SCR-002`, `FLOW-001`.
- **Target Area:** `src/app/page.tsx`, `src/components/student/LoginModal.tsx`.
- **Dependencies:** `TASK-002`.
- **Execution Phase:** Fase 2 (Task 3).
- **Acceptance Criteria:** Halaman beranda tampil responsif di HP/desktop; tombol memicu modal input; form memvalidasi input kosong dengan pesan ramah; jika ada session aktif di `localStorage`, otomatis me-redirect ke `/test`.
- **Verification:** Uji buka halaman di mobile viewport dan desktop; uji klik tombol dan validasi input.
- **Risk / Notes:** Validasi nomor HP harus fleksibel menerima format nomor lokal Indonesia.
- **Status:** `Done` (Verified 2026-10-10)

#### `TASK-004`: Lembar Ujian Stepper Siswa (`SCR-003`) & Palet Soal (`CMP-001` - `CMP-004`)
- **Goal / Scope:** Membangun antarmuka pengerjaan tes satu soal per halaman (*stepper*): sticky topbar dengan Elapsed Timer (`CMP-003`) dan status koneksi (`CMP-004`), kartu butir soal dengan opsi dinamis (`CMP-002`), tombol navigasi Prev/Next, tombol submit, dan Palet Nomor Soal (`CMP-001`) yang responsif (desktop: panel kanan sticky, mobile: bottom sheet drawer).
- **Requirement Links:** PRD `FR-004`, `FR-006`, `FR-008`, `FR-011`; UI/UX `SCR-003`, `CMP-001` - `CMP-004`.
- **Target Area:** `src/app/test/page.tsx`, `src/components/student/QuestionCard.tsx`, `src/components/student/QuestionPalette.tsx`, `src/components/student/ElapsedTimer.tsx`, `src/components/student/OfflineBanner.tsx`.
- **Dependencies:** `TASK-002`.
- **Execution Phase:** Fase 2 (Task 4).
- **Acceptance Criteria:** Siswa dapat berpindah nomor soal dengan tombol maupun klik nomor palet; warna nomor palet berubah hijau saat opsi dipilih; timer hitung maju berjalan; opsi jawaban mendukung format 2 s/d 5 pilihan dengan animasi transisi Framer Motion.
- **Verification:** Uji simulasi memilih opsi pada data dummy 30 soal; periksa kelancaran transisi slide antar-nomor.
- **Risk / Notes:** Animasi transisi harus ringan agar tidak membebani perangkat smartphone kelas pemula.
- **Status:** `Done` (Verified 2026-10-10)

#### `TASK-005`: Modal Konfirmasi Submit & Layar Selesai Siswa (`SCR-004`)
- **Goal / Scope:** Membangun dialog konfirmasi sebelum submit (mendeteksi dan memberi peringatan jika masih ada nomor yang belum dijawab), serta halaman selesai (`SCR-004`) yang menampilkan konfirmasi bahwa tes berhasil dikumpulkan atau menampilkan kartu hasil resmi (**Beginner / Intermediate / Advanced**) jika status telah difinalisasi.
- **Requirement Links:** PRD `FR-009`, `US-008`, `US-012`; UI/UX `SCR-004`, `FLOW-001`.
- **Target Area:** `src/app/result/page.tsx`, `src/components/student/SubmitConfirmModal.tsx`.
- **Dependencies:** `TASK-004`.
- **Execution Phase:** Fase 2 (Task 5).
- **Acceptance Criteria:** Modal konfirmasi menghitung jumlah soal yang belum terisi dengan benar; setelah konfirmasi submit diarahkan ke `/result`; halaman menampilkan status menunggu tutor atau kartu pengumuman level resmi.
- **Verification:** Uji klik submit dalam kondisi ada soal kosong vs semua soal terisi.
- **Risk / Notes:** Tombol submit harus terlindungi dari *double-click* (loading state).
- **Status:** `Done` (Verified 2026-10-10)

---

### FASE 3: Implementasi Antarmuka Staf (Staff UI & Mock State)

#### `TASK-006`: Layout Dashboard Staf (`CMP-005`) & Halaman Login Staf (`SCR-005`)
- **Goal / Scope:** Membangun halaman login email & password staf (`SCR-005`) dan kerangka layout dashboard staf dengan Sidebar Navigasi di sisi kiri (`CMP-005`) yang responsif (desktop: sidebar 260px, mobile: menu hamburger drawer).
- **Requirement Links:** PRD `FR-001`; UI/UX `SCR-005`, `CMP-005`.
- **Target Area:** `src/app/staff/login/page.tsx`, `src/app/staff/admin/layout.tsx`, `src/app/staff/tutor/layout.tsx`, `src/components/staff/Sidebar.tsx`.
- **Dependencies:** `TASK-002`.
- **Execution Phase:** Fase 3 (Task 6).
- **Acceptance Criteria:** Form login staf memiliki validasi email/password; sidebar menampilkan profil staf, badge peran (`Admin` / `Tutor`), daftar menu yang sesuai dengan peran, dan tombol logout; menu hamburger berfungsi mulus di mobile.
- **Verification:** Uji navigasi sidebar di berbagai ukuran viewport (360px hingga 1440px).
- **Risk / Notes:** Pastikan pemisahan menu sidebar antara peran Admin dan Tutor terisolasi dengan rapi.
- **Status:** `Done` (Verified 2026-10-11)

#### `TASK-007`: Halaman Admin Dashboard (`SCR-006`) & Kelola Siswa (`SCR-007`)
- **Goal / Scope:** Membangun Admin Dashboard (`SCR-006`) berisi 4 kartu metrik (Total Siswa, Belum Mulai, Sedang Tes, Selesai), tabel aktivitas hari ini, dan Baris Tombol Aksi Cepat (*Quick Actions*). Membangun Halaman Kelola Siswa (`SCR-007`) berisi form modal pendaftaran siswa baru (Nama, HP, Jenjang), tabel status pengerjaan, dan modal konfirmasi Soft Reset Sesi Tes.
- **Requirement Links:** PRD `FR-002`, `FR-010`; UI/UX `SCR-006`, `SCR-007`, `FLOW-002`.
- **Target Area:** `src/app/staff/admin/dashboard/page.tsx`, `src/app/staff/admin/students/page.tsx`, `src/components/staff/StudentRegisterModal.tsx`, `src/components/staff/ResetSessionModal.tsx`.
- **Dependencies:** `TASK-006`.
- **Execution Phase:** Fase 3 (Task 7).
- **Acceptance Criteria:** Kartu metrik dan quick actions tampil rapi; modal pendaftaran memvalidasi input; tombol "Reset Tes" di tabel hanya aktif pada siswa yang sedang mengerjakan atau selesai; modal konfirmasi reset memunculkan peringatan audit trail yang jelas.
- **Verification:** Uji isi form pendaftaran siswa dan buka modal reset tes pada mock data.
- **Risk / Notes:** Sediakan filter pencarian nama siswa di tabel.
- **Status:** `Done` (Verified 2026-10-11)

#### `TASK-008`: Halaman Admin Kelola Tutor (`SCR-014`) & Bank Soal (`SCR-009`)
- **Goal / Scope:** Membangun Halaman Kelola Tutor (`SCR-014`) lengkap dengan modal form pendaftaran akun pengajar baru (Nama, Email, Password Sementara, Jenjang: Elementary / High School). Membangun Halaman Admin Bank Soal (`SCR-009`) dengan tab filter jenjang dan modal form pembuatan butir soal dengan opsi dinamis (min 2, max 5 baris dengan radio kunci jawaban).
- **Requirement Links:** PRD `FR-011`, `FR-012`, `FR-017`; UI/UX `SCR-009`, `SCR-014`.
- **Target Area:** `src/app/staff/admin/tutors/page.tsx`, `src/app/staff/admin/questions/page.tsx`, `src/components/staff/TutorRegisterModal.tsx`, `src/components/staff/QuestionFormModal.tsx`.
- **Dependencies:** `TASK-006`.
- **Execution Phase:** Fase 3 (Task 8).
- **Acceptance Criteria:** Form tambah tutor dapat memilih jenjang pengampu; form bank soal memungkinkan menambah baris opsi hingga 5 (disable tombol jika sudah 5) dan menghapus hingga 2 (disable tombol jika sisa 2); radio kunci jawaban hanya mengizinkan 1 opsi benar per butir soal.
- **Verification:** Uji tambah/hapus baris opsi jawaban di modal form soal; uji validasi input form tutor.
- **Risk / Notes:** Pastikan konfirmasi dialog muncul sebelum menghapus butir soal.
- **Status:** `Done` (Verified 2026-10-11)

#### `TASK-009`: Halaman Tutor Dashboard (`SCR-010`), Penilaian Siswa (`SCR-011`), & Bank Soal Tutor (`SCR-013`)
- **Goal / Scope:** Membangun Tutor Dashboard (`SCR-010`) dengan metrik jenjang pengampu dan tombol aksi cepat. Membangun Halaman Penilaian Siswa (`SCR-011`) dengan filter tab "Perlu Dinilai" vs "Selesai Dinilai", dan Modal Peninjauan Siswa (`CMP-007`) yang menampilkan profil siswa, skor tes %, panel lipat rincian lembar jawaban siswa (soal, status benar/salah, jawaban siswa vs kunci), serta 3 card pilihan level final (*Beginner 0–59%, Intermediate 60–79%, Advanced 80–100%*). Menyediakan Halaman Bank Soal Tutor (`SCR-013`).
- **Requirement Links:** PRD `FR-013`, `FR-014`, `FR-015`; UI/UX `SCR-010`, `SCR-011`, `SCR-013`, `CMP-007`, `FLOW-003`.
- **Target Area:** `src/app/staff/tutor/dashboard/page.tsx`, `src/app/staff/tutor/evaluations/page.tsx`, `src/app/staff/tutor/questions/page.tsx`, `src/components/staff/EvaluationModal.tsx`.
- **Dependencies:** `TASK-006`.
- **Execution Phase:** Fase 3 (Task 9).
- **Acceptance Criteria:** Tutor hanya melihat data sesuai jenjang binaannya; modal evaluasi menampilkan lembar jawaban siswa yang dapat dibuka/tutup; form menyimpan penetapan level final mandiri secara ringkas dan bersih.
- **Verification:** Uji buka modal penilaian siswa; uji buka/tutup lembar jawaban siswa; uji finalisasi level siswa.
- **Risk / Notes:** Form modal evaluasi dijaga tetap ringkas dan minimalis (tanpa kolom catatan atau rekomendasi sistem otomatis).
- **Status:** `Done` (Verified Polish 2026-10-14)

#### `TASK-010`: Halaman Laporan & Komponen Ekspor (`SCR-008` & `SCR-012`)
- **Goal / Scope:** Membangun Halaman Hasil & Laporan untuk Admin (`SCR-008`) dan Tutor (`SCR-012`) dengan filter jenjang/status serta Action Bar berisi tombol **`Export Excel (.xlsx)`** dan **`Export PDF (.pdf)`**.
- **Requirement Links:** PRD `FR-016`; UI/UX `SCR-008`, `SCR-012`.
- **Target Area:** `src/app/staff/admin/reports/page.tsx`, `src/app/staff/tutor/reports/page.tsx`.
- **Dependencies:** `TASK-006`.
- **Execution Phase:** Fase 3 (Task 10).
- **Acceptance Criteria:** Halaman menampilkan tabel rekapitulasi data hasil tes siswa (Nama, Jenjang, Skor, Durasi, Level Final, Catatan); tombol ekspor Excel dan PDF terpasang rapi di action bar.
- **Verification:** Uji navigasi halaman laporan dan kelengkapan kolom tabel.
- **Risk / Notes:** Logika generator berkas nyata akan dihubungkan di Fase 5.
- **Status:** `Done` (Verified 2026-10-11)

---

### FASE 4: Basis Data & Logika Backend Supabase

#### `TASK-011`: Skrip Database SQL DDL & Inisialisasi Supabase
- **Goal / Scope:** Menyiapkan skrip SQL DDL murni (`supabase/schema.sql`) yang memuat seluruh tabel (`profiles`, `students`, `test_sessions`, `questions`, `question_options`, `test_responses`, `placement_evaluations`), indeks relasi, dan skrip seeder akun Admin pertama (`supabase/seed.sql`). Mengonfigurasi kredensial koneksi Supabase di `.env.local`.
- **Requirement Links:** [Tech Spec Section 5 (SQL DDL)](file:///D:/SeptianoF/Projects/Learning/up-speaking/docs/TECHNICAL_SPEC.md#52-skrip-sql-ddl-lengkap-supabaseschemasql) & [Section 12](file:///D:/SeptianoF/Projects/Learning/up-speaking/docs/TECHNICAL_SPEC.md#12-deployment-and-environment-configuration).
- **Target Area:** `supabase/schema.sql`, `supabase/seed.sql`, `.env.local`, `src/types/database.types.ts`.
- **Dependencies:** None (Dapat dieksekusi setelah UI siap).
- **Execution Phase:** Fase 4 (Task 11).
- **Acceptance Criteria:** Seluruh tabel berhasil dibuat di Supabase tanpa error; constraint unique dan foreign key berjalan sesuai kamus data; berkas tipe data TypeScript (`database.types.ts`) selaras dengan skema database.
- **Verification:** Jalankan skrip di SQL Editor Supabase dan periksa struktur tabel di Table Editor.
- **Risk / Notes:** Pastikan ekstensi `uuid-ossp` aktif di project Supabase.
- **Status:** `Done` (Verified 2026-10-14)

#### `TASK-012`: Modul Klien Supabase & Algoritma Fisher-Yates Shuffle
- **Goal / Scope:** Mengonfigurasi pustaka `@supabase/supabase-js` dan `@supabase/ssr` untuk client-side (`lib/supabase/client.ts`), server-side (`lib/supabase/server.ts`), dan privileged admin (`lib/supabase/admin.ts`). Mengimplementasikan Algoritma Fisher-Yates Shuffle murni $O(n)$ pada `lib/algorithms/fisher-yates.ts`.
- **Requirement Links:** [Tech Spec Section 6](file:///D:/SeptianoF/Projects/Learning/up-speaking/docs/TECHNICAL_SPEC.md#6-algoritma-fisher-yates-shuffle-spesifikasi-bisnis-logic), [Tech Spec Section 9](file:///D:/SeptianoF/Projects/Learning/up-speaking/docs/TECHNICAL_SPEC.md#9-module-and-code-structure-nextjs-app-router--supabase).
- **Target Area:** `src/lib/supabase/*`, `src/lib/algorithms/fisher-yates.ts`.
- **Dependencies:** `TASK-011`.
- **Execution Phase:** Fase 4 (Task 12).
- **Acceptance Criteria:** Klien Supabase dapat melakukan query read/write ke database; fungsi `fisherYatesShuffle` menghasilkan permutasi acak seragam tanpa mengubah panjang array atau menghilangkan elemen.
- **Verification:** Buat file skrip uji sederhana untuk memvalidasi permutasi array acak 100 kali iterasi.
- **Risk / Notes:** Gunakan `SUPABASE_SERVICE_ROLE_KEY` hanya di file server-side/admin.
- **Status:** `Done` (Verified 2026-10-14)

#### `TASK-013`: Endpoint API Siswa (Verify, Start, Sync, Submit, Result)
- **Goal / Scope:** Membangun Route Handlers untuk alur siswa:
  - `POST /api/student/verify`: Validasi Nama Lengkap + No HP.
  - `POST /api/student/start`: Pengambilan soal aktif jenjang terkait, eksekusi pengacakan Fisher-Yates untuk soal & opsi, pembuatan sesi tes, dan penyembunyian atribut `is_correct`.
  - `POST /api/student/sync`: Autosave jawaban asinkron ke tabel `test_responses`.
  - `POST /api/student/submit`: Kunci sesi menjadi `COMPLETED`, hitung skor otomatis %, dan simpan total durasi *elapsed seconds*.
  - `GET /api/student/result`: Mengambil data hasil resmi setelah difinalisasi.
- **Requirement Links:** PRD `FR-001`, `FR-004`, `FR-008`, `FR-009`; [Tech Spec Section 7.1](file:///D:/SeptianoF/Projects/Learning/up-speaking/docs/TECHNICAL_SPEC.md#71-siswa-student-endpoints).
- **Target Area:** `src/app/api/student/*`.
- **Dependencies:** `TASK-012`.
- **Execution Phase:** Fase 4 (Task 13).
- **Acceptance Criteria:** Siswa valid dapat memulai tes dengan susunan soal acak; jawaban tersimpan ke database; skor dihitung akurat saat submit; endpoint tidak membocorkan kunci jawaban `is_correct`.
- **Verification:** Uji pemanggilan API menggunakan Postman atau HTTP client test script.
- **Risk / Notes:** Pastikan validasi `device_token` berjalan untuk mencegah multi-device conflict.
- **Status:** `Done` (Verified 2026-10-14)

#### `TASK-014`: Autentikasi Staf, Middleware RBAC, & API Admin
- **Goal / Scope:** Membangun Next.js Middleware (`middleware.ts`) untuk proteksi rute staf berbasis session cookie Supabase Auth SSR. Membangun Route Handlers Admin:
  - `POST /api/auth/login` & `POST /api/auth/logout`.
  - `GET /api/admin/dashboard`: Agregasi 4 metrik status siswa.
  - `GET` & `POST /api/admin/students`: Pendaftaran siswa baru.
  - `POST /api/admin/students/[id]/reset`: Soft Reset sesi tes siswa.
  - `GET` & `POST /api/admin/tutors`: Pendaftaran akun Tutor via `supabase.auth.admin.createUser`.
  - CRUD `/api/admin/questions`: Manajemen bank soal semua jenjang.
- **Requirement Links:** PRD `FR-001`, `FR-002`, `FR-010`, `FR-011`, `FR-017`; [Tech Spec Section 7.2 & 8.1](file:///D:/SeptianoF/Projects/Learning/up-speaking/docs/TECHNICAL_SPEC.md#72-staf-admin-admin-endpoints).
- **Target Area:** `src/middleware.ts`, `src/app/api/auth/*`, `src/app/api/admin/*`.
- **Dependencies:** `TASK-012`.
- **Execution Phase:** Fase 4 (Task 14).
- **Acceptance Criteria:** Rute staf terproteksi cookie auth; role bukan Admin ditolak dari modul admin; pendaftaran tutor berhasil membuat user di Supabase Auth dan tabel `profiles`; soft reset berhasil membatalkan sesi lama dan membuat sesi baru.
- **Verification:** Uji login sebagai Admin, buat akun tutor, dan uji reset sesi siswa.
- **Risk / Notes:** Simpan cookie session secara aman dengan flag HttpOnly dan SameSite=Lax.
- **Status:** `Done` (Verified 2026-10-14)

#### `TASK-015`: API Tutor (Evaluasi & Finalisasi Level)
- **Goal / Scope:** Membangun Route Handlers khusus Tutor:
  - `GET /api/tutor/dashboard`: Metrik jenjang yang diampu.
  - `GET /api/tutor/evaluations`: Daftar siswa dengan filter status `COMPLETED` dan `FINALIZED`.
  - `GET /api/tutor/evaluations/[sessionId]`: Rincian jawaban siswa (soal, opsi dipilih, indikator benar/salah).
  - `POST /api/tutor/evaluations/[sessionId]`: Menyimpan keputusan level final (`assigned_level`) dan catatan evaluasi kualitatif ke tabel `placement_evaluations`.
  - CRUD `/api/tutor/questions`: Bank soal khusus jenjang yang diampu tutor.
- **Requirement Links:** PRD `FR-013`, `FR-014`, `FR-015`; [Tech Spec Section 7.3](file:///D:/SeptianoF/Projects/Learning/up-speaking/docs/TECHNICAL_SPEC.md#73-staf-tutor-tutor-endpoints).
- **Target Area:** `src/app/api/tutor/*`.
- **Dependencies:** `TASK-014`.
- **Execution Phase:** Fase 4 (Task 15).
- **Acceptance Criteria:** Tutor hanya dapat melihat dan menilai siswa sesuai jenjangnya; rincian jawaban menandai kunci benar/salah dengan akurat; form menyimpan keputusan level dan status tes berubah menjadi `FINALIZED`.
- **Verification:** Uji login sebagai Tutor Elementary, verifikasi bahwa siswa High School tidak muncul di daftar.
- **Risk / Notes:** Pastikan query SQL menyertakan filter `target_level` sesuai profil tutor login.
- **Status:** `Done` (Verified 2026-10-14)

---

### FASE 5: Integrasi Penuh (Fullstack Wiring & Offline Sync)

#### `TASK-016`: Integrasi Alur Siswa & Hook Toleransi Offline (`useOfflineSync`)
- **Goal / Scope:** Menghubungkan antarmuka siswa (Fase 2) ke API Siswa (Fase 4). Mengimplementasikan custom hook `useOfflineSync.ts` yang mengelola antrean jawaban lokal di `localStorage`, mendeteksi status online/offline browser, melakukan autosave debounced saat online, dan auto-flush antrean saat internet pulih kembali.
- **Requirement Links:** PRD `FR-005`, `FR-007`; [Tech Spec Section 10](file:///D:/SeptianoF/Projects/Learning/up-speaking/docs/TECHNICAL_SPEC.md#10-strategi-offline-tolerant--client-side-sync).
- **Target Area:** `src/hooks/useOfflineSync.ts`, `src/hooks/useElapsedTimer.ts`, `src/app/test/page.tsx`, `src/app/page.tsx`.
- **Dependencies:** `TASK-004`, `TASK-005`, `TASK-013`.
- **Execution Phase:** Fase 5 (Task 16).
- **Acceptance Criteria:** Siswa dapat login dengan Nama + HP asli; paket soal Fisher-Yates termuat nyata dari database; saat koneksi dimatikan (mode offline di browser devtools), siswa tetap dapat memilih jawaban; saat online kembali, jawaban otomatis tersinkronisasi ke database; submit mengunci tes dan menampilkan hasil di `/result`.
- **Verification:** Uji alur pengerjaan penuh dengan mematikan koneksi internet di browser devtools (Network Offline) lalu mengaktifkannya kembali sebelum submit.
- **Risk / Notes:** Pastikan debounced sync berdurasi 500ms agar tidak membebani server saat siswa berpindah-pindah opsi dengan cepat.
- **Status:** `Done` (Verified 2026-10-14)

#### `TASK-017`: Integrasi Dashboard Staf (Admin & Tutor Wiring)
- **Goal / Scope:** Menghubungkan antarmuka Admin (Fase 3) ke API Admin, dan antarmuka Tutor ke API Tutor. Menggantikan seluruh mock data dengan pemanggilan API nyata (Dashboard metrik, pendaftaran siswa, pembuatan akun tutor, manajemen bank soal, reset sesi, dan modal evaluasi siswa).
- **Requirement Links:** PRD `FR-002`, `FR-010`, `FR-013`, `FR-015`, `FR-017`.
- **Target Area:** `src/app/staff/admin/**/*`, `src/app/staff/tutor/**/*`.
- **Dependencies:** `TASK-007`, `TASK-008`, `TASK-009`, `TASK-014`, `TASK-015`.
- **Execution Phase:** Fase 5 (Task 17).
- **Acceptance Criteria:** Admin dapat mendaftarkan siswa nyata; Admin dapat membuat akun tutor nyata dan tutor tersebut langsung bisa login; Tutor dapat meninjau lembar jawaban siswa dan menetapkan level final; data tabel terbarui secara reaktif.
- **Verification:** Uji skenario lengkap dari pendaftaran siswa oleh Admin $\rightarrow$ siswa mengerjakan tes $\rightarrow$ Tutor menilai dan menetapkan level $\rightarrow$ status berubah menjadi Finalized.
- **Risk / Notes:** Tambahkan notifikasi toast keberhasilan (misal: "Siswa berhasil didaftarkan").
- **Status:** `Done` (Verified 2026-10-14)

#### `TASK-018`: Generator Ekspor Laporan Excel (.xlsx) & PDF (.pdf)
- **Goal / Scope:** Mengimplementasikan modul ekspor dokumen `lib/export/excel-generator.ts` (menggunakan ExcelJS) dan `lib/export/pdf-generator.ts` (menggunakan jsPDF + AutoTable) yang menghasilkan berkas rekapitulasi data pengerjaan siswa yang rapi, berlogo Up Speaking, dan langsung dapat diunduh oleh Admin dan Tutor.
- **Requirement Links:** PRD `FR-016`; [Tech Spec Section 3.1 & 7.2](file:///D:/SeptianoF/Projects/Learning/up-speaking/docs/TECHNICAL_SPEC.md#43-pustaka-ekspor-dokumen).
- **Target Area:** `src/lib/export/*`, `src/app/staff/admin/reports/page.tsx`, `src/app/staff/tutor/reports/page.tsx`.
- **Dependencies:** `TASK-010`, `TASK-017`.
- **Execution Phase:** Fase 5 (Task 18).
- **Acceptance Criteria:** Mengklik tombol "Export Excel" langsung mengunduh berkas `.xlsx` dengan format kolom dan header rapi; mengklik tombol "Export PDF" langsung mengunduh berkas `.pdf` berformat tabel formal siap cetak.
- **Verification:** Unduh berkas hasil ekspor dan buka di Microsoft Excel / PDF Reader; periksa kelengkapan data siswa dan format penulisan.
- **Risk / Notes:** Pastikan penataan kolom pada PDF tidak terpotong saat dicetak pada kertas ukuran A4.
- **Status:** `Done` (Verified 2026-10-14)

---

### FASE 6: Pengujian Sistem & Rilis Vercel

#### `TASK-019`: Unit Testing (Algoritma Fisher-Yates) & Pengujian Fungsional (Black Box)
- **Goal / Scope:** Menulis unit test untuk memvalidasi keacakan dan integritas algoritma Fisher-Yates Shuffle (`tests/unit/fisher-yates.test.ts`). Menyusun laporan matriks pengujian fungsional *Black Box Testing* untuk seluruh kebutuhan PRD (`FR-001` s/d `FR-017`) sebagai bahan pertanggungjawaban sidang KP.
- **Requirement Links:** [Tech Spec Section 11 (Testing Strategy)](file:///D:/SeptianoF/Projects/Learning/up-speaking/docs/TECHNICAL_SPEC.md#11-testing-strategy).
- **Target Area:** `tests/unit/fisher-yates.test.ts`, `docs/TEST_REPORT.md` (opsional).
- **Dependencies:** `TASK-012`, `TASK-016`, `TASK-017`.
- **Execution Phase:** Fase 6 (Task 19).
- **Acceptance Criteria:** Seluruh unit test algoritma lulus 100%; seluruh skenario Black Box testing teruji memenuhi kriteria penerimaan tanpa cacat mayor (*no blocker bugs*).
- **Verification:** Jalankan test runner (`npm test`) dan rekap hasil pengujian fungsional.
- **Risk / Notes:** Pengujian harus mencakup edge case: siswa offline saat pengerjaan dan pergantian perangkat (device takeover).
- **Status:** `Done` (Verified 2026-10-14)

#### `TASK-020`: Konfigurasi Produksi & Deployment ke Vercel
- **Goal / Scope:** Mempersiapkan konfigurasi build produksi, mendaftarkan Environment Variables di dashboard Vercel, menghubungkan repositori Git, dan melakukan deployment aplikasi ke domain produksi Vercel.
- **Requirement Links:** [Tech Spec Section 12 (Deployment)](file:///D:/SeptianoF/Projects/Learning/up-speaking/docs/TECHNICAL_SPEC.md#12-deployment-and-environment-configuration).
- **Target Area:** `.env.example`, `vercel.json` (jika ada), dokumentasi deployment.
- **Dependencies:** `TASK-018`, `TASK-019`.
- **Execution Phase:** Fase 6 (Task 20).
- **Acceptance Criteria:** Aplikasi berhasil ter-deploy di Vercel tanpa error build; web dapat diakses publik melalui HTTPS; koneksi ke database Supabase berjalan lancar di lingkungan produksi.
- **Verification:** Buka URL produksi Vercel di perangkat smartphone dan laptop; lakukan uji pengerjaan tes end-to-end secara live.
- **Risk / Notes:** Pastikan URL aplikasi produksi terdaftar di whitelist CORS/redirect URL Supabase Auth.
- **Initial Status:** `Pending`

---

## 6. Dependency Map (Peta Ketergantungan Terstruktur)

Rantai ketergantungan antar-tugas disajikan secara terstruktur tanpa diagram Mermaid:

```text
FASE 1: SETUP PROYEK & UI FOUNDATION
  [TASK-001] Inisialisasi Next.js, TS, Tailwind, Motion
      └──> [TASK-002] Pustaka Komponen Dasar (Button, Modal, Input, Badge)

FASE 2: IMPLEMENTASI ANTARMUKA SISWA (STUDENT UI)
  [TASK-002] ──> [TASK-003] Beranda Siswa (SCR-001) & Modal Akses (SCR-002)
  [TASK-002] ──> [TASK-004] Lembar Ujian Stepper (SCR-003) & Palet Soal (CMP-001 - 004)
  [TASK-004] ──> [TASK-005] Modal Submit & Layar Selesai (SCR-004)

FASE 3: IMPLEMENTASI ANTARMUKA STAF (STAFF UI)
  [TASK-002] ──> [TASK-006] Layout Sidebar Staf (CMP-005) & Login Staf (SCR-005)
  [TASK-006] ──> [TASK-007] Admin Dashboard (SCR-006) & Kelola Siswa (SCR-007)
  [TASK-006] ──> [TASK-008] Admin Kelola Tutor (SCR-014) & Bank Soal (SCR-009)
  [TASK-006] ──> [TASK-009] Tutor Dashboard (SCR-010), Penilaian (SCR-011), Bank Soal (SCR-013)
  [TASK-006] ──> [TASK-010] Halaman Hasil & Laporan (SCR-008 & SCR-012)

FASE 4: BASIS DATA & LOGIKA BACKEND SUPABASE
  [TASK-011] Skrip Database SQL DDL & Inisialisasi Supabase
      └──> [TASK-012] Klien Supabase & Modul Fisher-Yates Shuffle
              ├──> [TASK-013] Endpoint API Siswa (Verify, Start, Sync, Submit, Result)
              └──> [TASK-014] Autentikasi Staf, Middleware RBAC, & API Admin
                      └──> [TASK-015] API Tutor (Evaluasi & Finalisasi Level)

FASE 5: INTEGRASI PENUH (FULLSTACK WIRING & OFFLINE SYNC)
  [TASK-004, TASK-005, TASK-013] ──> [TASK-016] Integrasi Alur Siswa & Hook useOfflineSync
  [TASK-007, TASK-008, TASK-009, TASK-014, TASK-015] ──> [TASK-017] Integrasi Dashboard Staf
  [TASK-010, TASK-017] ─────────────> [TASK-018] Generator Ekspor Excel & PDF

FASE 6: PENGUJIAN SISTEM & RILIS VERCEL
  [TASK-012, TASK-016, TASK-017] ──> [TASK-019] Unit Testing Fisher-Yates & Black Box Testing
  [TASK-018, TASK-019] ─────────────> [TASK-020] Konfigurasi Produksi & Deployment Vercel
```

---

## 7. Requirement Traceability Matrix

| PRD FR ID | Deskripsi Kebutuhan | Terpetakan pada Task ID | Status Cakupan |
| :--- | :--- | :--- | :--- |
| **FR-001** | Login email/pass Staf & Siswa Nama+HP | `TASK-003`, `TASK-006`, `TASK-013`, `TASK-014` | Covered |
| **FR-002** | Validasi pendaftaran siswa oleh Admin | `TASK-007`, `TASK-014`, `TASK-017` | Covered |
| **FR-003** | Akses langsung ke lembar ujian | `TASK-003`, `TASK-013`, `TASK-016` | Covered |
| **FR-004** | Fisher-Yates Shuffle soal & opsi | `TASK-012`, `TASK-013`, `TASK-019` | Covered |
| **FR-005** | Simpan sesi lokal & auto-resume | `TASK-003`, `TASK-016` | Covered |
| **FR-006** | Pengambilalihan sesi di HP baru | `TASK-013`, `TASK-016` | Covered |
| **FR-007** | Pengerjaan offline & auto-sync | `TASK-004`, `TASK-016` | Covered |
| **FR-008** | Timer hitung maju (*elapsed timer*) | `TASK-004`, `TASK-013`, `TASK-016` | Covered |
| **FR-009** | Validasi online saat submit tes | `TASK-005`, `TASK-013`, `TASK-016` | Covered |
| **FR-010** | Soft reset sesi tes siswa oleh Admin | `TASK-007`, `TASK-014`, `TASK-017` | Covered |
| **FR-011** | Opsi dinamis 2 s/d 5 baris | `TASK-004`, `TASK-008`, `TASK-011`, `TASK-017` | Covered |
| **FR-012** | Seluruh soal aktif diujikan | `TASK-013`, `TASK-016` | Covered |
| **FR-013** | Filter siswa Perlu Dinilai vs Selesai | `TASK-009`, `TASK-015`, `TASK-017` | Covered |
| **FR-014** | Panduan rentang nilai lembaga | `TASK-009`, `TASK-015`, `TASK-017` | Covered |
| **FR-015** | Penetapan level & catatan Tutor | `TASK-009`, `TASK-015`, `TASK-017` | Covered |
| **FR-016** | Ekspor laporan ke Excel & PDF | `TASK-010`, `TASK-018` | Covered |
| **FR-017** | Admin mendaftarkan akun Tutor baru | `TASK-008`, `TASK-014`, `TASK-017` | Covered |

---

## 8. Risks and Mitigations

1. **Risiko Kompatibilitas Versi Dependensi (Next.js vs Framer Motion):**
   * *Mitigasi:* Menggunakan rilis stabil yang teruji saling kompatibel (`next@14.2` atau `next@15` dengan `framer-motion@11`).
2. **Risiko Kegagalan Autosave pada Jaringan Sangat Lambat:**
   * *Mitigasi:* Logika `useOfflineSync` memprioritaskan penyimpanan di `localStorage` terlebih dahulu sebelum mencoba memicu sync ke jaringan, sehingga jawaban tidak pernah hilang meskipun request timeout.
3. **Risiko Konflik Hak Akses Peran Tutor:**
   * *Mitigasi:* Filter data di tingkat backend API Handler selalu menyematkan klausa jenjang sesuai role token JWT profil tutor yang sedang login, bukan mengandalkan parameter dari client browser.

---

## 9. Readiness Checklist
- [x] Dokumen memuat 20 tugas terperinci (`TASK-001` s/d `TASK-020`) yang saling terhubung secara logis dan terbagi ke dalam 6 fase yang jelas.
- [x] Strategi Frontend-First tercermin dengan jelas pada pembagian fase (UI diselesaikan dan divalidasi di Fase 2 & 3, disusul integrasi backend di Fase 4 & 5).
- [x] Seluruh kebutuhan fungsional `FR-001` hingga `FR-017` terpetakan 100% (*Covered*) pada Matriks Traceability.
- [x] Seluruh diagram kode Mermaid telah dihilangkan dan digantikan oleh deskripsi terstruktur murni.
- [x] Setiap tugas memiliki kriteria penerimaan (*acceptance criteria*) dan metode verifikasi yang konkret.
- [x] Tabel Progress Tracker terpasang di bagian depan dokumen untuk memudahkan pemantauan lintas sesi/AI.
