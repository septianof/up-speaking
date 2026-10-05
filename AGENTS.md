# AGENTS.md — Project AI Guidelines & Rules
**Proyek:** Up Speaking Placement Test System (Platform Digitalisasi Tes Penempatan & Evaluasi Kemampuan Bahasa Inggris)  
**Tujuan:** Panduan dan aturan wajib bagi seluruh AI Assistant (Antigravity, Cursor, Claude, Copilot, dll.) agar konsisten, tidak berbelit-belit, dan fokus menyelesaikan target proyek Kerja Praktek.  
**Referensi Wajib:** [PRD.md](PRD.md) · [UI_FLOW.md](UI_FLOW.md) · [TASK_BREAKDOWN.md](TASK_BREAKDOWN.md)

---

## 1. Prinsip Utama (Mindset Proyek)

1. **Simpel, Bersih, dan Tanpa Overengineering:**
   * Developer menyukai solusi yang **singkat, padat, dan jelas**.
   * Hindari menambahkan pustaka (*library*), arsitektur rumit, atau abstraksi berlebih yang tidak diminta.
2. **Zero Friction untuk Calon Siswa:**
   * Siswa **TIDAK PERLU** membuat akun atau mengingat password.
   * Siswa masuk ke lembar ujian hanya dengan memasukkan **Nama Lengkap & Nomor WhatsApp** yang telah didaftarkan sebelumnya oleh Admin di meja pendaftaran.
3. **Kedaulatan Evaluasi oleh Tutor:**
   * Sistem tidak menetapkan level penempatan secara sepihak atau menggunakan rumus matrix kaku yang mengikat.
   * Penentuan level penempatan resmi (`Beginner`, `Intermediate`, `Advanced`) merupakan wewenang profesional **Tutor**, didukung data performa objektif (akurasi skor % dan durasi pengerjaan riil) yang disajikan sistem.
4. **Kepatuhan Terhadap Dokumen Acuan:**
   * Sebelum mengusulkan atau membuat kode, selalu pastikan selaras dengan alur di [UI_FLOW.md](UI_FLOW.md) dan arsitektur di [PRD.md](PRD.md).
   * Pengerjaan fitur wajib merujuk ke ID Task di [TASK_BREAKDOWN.md](TASK_BREAKDOWN.md).

---

## 2. Tech Stack yang WAJIB Digunakan

| Komponen | Teknologi | Keterangan |
|---|---|---|
| **Framework** | Next.js (App Router, TypeScript) | Versi stabil terbaru, React Server Components & Server Actions |
| **Styling** | Tailwind CSS | Utility-first, adaptif dan responsif |
| **Ikon UI** | Lucide React | Ringan, konsisten, dan modern |
| **Animasi UI** | Framer Motion & Canvas Confetti | Transisi halus, spring physics, dan mikro-interaksi responsif |
| **Database & Auth** | Supabase (PostgreSQL + Supabase Auth) | PostgreSQL relasional & Auth khusus untuk akun staf Admin dan Tutor |
| **State Lokal** | Browser Local Storage | Digunakan untuk ketahanan sesi ujian (*Crash Recovery* & Auto-Save) |
| **Distribusi** | Web App / Progressive Web App (PWA) | Responsif di ponsel siswa & komputer admin/tutor tanpa install app store |

---

## 3. Hal yang DILARANG Dilakukan AI (Strict Blacklist)

AI **dilarang keras** melakukan atau menyarankan hal-hal berikut:

- ❌ **Dilarang** menyarankan pembuatan aplikasi native Android terpisah (Kotlin, Flutter, React Native, dll.). Aplikasi ini adalah **Web App / PWA terpadu**.
- ❌ **Dilarang** membuat sistem login/password atau token fisik untuk calon siswa. Akses siswa hanya via **Nama Lengkap & Nomor WhatsApp** yang terdaftar.
- ❌ **Dilarang** membocorkan kunci jawaban (`is_correct`) ke frontend browser siswa. Data soal yang dikirim ke siswa **wajib disaring di server**.
- ❌ **Dilarang** memaksakan *countdown timer* yang menekan dan memaksa ujian berhenti otomatis. Ujian bersifat santai (*untimed*), sistem hanya mencatat durasi riil pengerjaan di latar belakang.
- ❌ **Dilarang** menyarankan ORM berat (Prisma, Drizzle) atau state management rumit (Redux, Zustand) yang menambah bloatware. Cukup gunakan `@supabase/supabase-js`, React state standar, dan Server Actions.
- ❌ **Dilarang** melakukan *hard delete* fisik pada tabel butir soal di database. Gunakan *soft delete* (`is_active = false`) agar riwayat jawaban siswa terdahulu tetap utuh.
- ❌ **Dilarang** mengubah skema database relasional tanpa merujuk ke Section 6 di [PRD.md](PRD.md).
- ❌ **Dilarang** melompat-lompat pengerjaan tanpa mengonfirmasi status task di [TASK_BREAKDOWN.md](TASK_BREAKDOWN.md).

---

## 4. Struktur Routing Aplikasi yang Disepakati

### A. Rute Siswa (Peserta Tes)
* `/` — Halaman Masuk Siswa & Verifikasi Registrasi (Cek Nama & Nomor WhatsApp yang telah didaftarkan Admin).
* `/exam` — Ruang Ujian interaktif (Stopwatch durasi riil latar belakang tanpa hitung mundur paksa, Radio Cards, Drawer Palet Soal, Auto-Save).
* `/result` — Halaman Hasil (Ucapan apresiasi ramah, ringkasan skor %, rincian benar/total, durasi pengerjaan aktual, badge status *"Menunggu Konfirmasi Level oleh Tutor"*, & Tombol Direct WhatsApp ke Tutor penanggung jawab).

### B. Rute Admin Panel (Meja Registrasi & Rekapitulasi)
* `/admin` — **Halaman Login Admin & Tutor** (Email & Password via Supabase Auth dengan penanganan role).
* `/admin/dashboard` — **Dashboard Utama Rekap Nilai** (Modal Pendaftaran Siswa Baru di meja registrasi, 4 Kartu Metrik, Tabel Riwayat dengan status `Menunggu Review` / `Graded`, Pencarian Nama/WA, Filter Jenjang, Tombol Retest Permission, Ekspor Excel & PDF).
* `/admin/questions` — **Manajemen Bank Soal** (Tabel Soal per Jenjang & Modal CRUD dengan Pilihan Opsi Dinamis A-D/E, Soft Delete).
* `/admin/settings` — **Pengaturan Kontak Tutor** (Nama & Nomor WhatsApp resmi Tutor Elementary & High School).

### C. Rute Tutor (Evaluator Akademik Jenjang)
* `/tutor` — **Antrean Evaluasi Tutor** (Dashboard terfilter otomatis per jenjang: Tutor Elementary hanya melihat antrean Elementary, Tutor High School hanya melihat High School; Modal Penetapan Level Resmi `Beginner`, `Intermediate`, `Advanced` beserta catatan evaluasi tutor).

---

## 5. Struktur Folder Monorepo Next.js

```
up-speaking/
├── PRD.md
├── UI_FLOW.md
├── TASK_BREAKDOWN.md
├── AGENTS.md
├── CLAUDE.md
├── assets/logo/              ← Logo resmi Up Speaking (.png)
├── public/                   ← Favicon, logo public, manifest.json PWA
├── src/
│   ├── app/
│   │   ├── (student)/        ← Route Group untuk antarmuka siswa
│   │   │   ├── page.tsx      ← Halaman masuk & verifikasi (/)
│   │   │   ├── exam/         ← Ruang ujian (/exam)
│   │   │   └── result/       ← Halaman hasil & apresiasi (/result)
│   │   ├── admin/            ← Rute admin panel
│   │   │   ├── page.tsx      ← Halaman Login Staf Admin (/admin)
│   │   │   ├── dashboard/    ← Dashboard rekap & registrasi (/admin/dashboard)
│   │   │   ├── questions/    ← Bank Soal (/admin/questions)
│   │   │   └── settings/     ← Pengaturan kontak tutor (/admin/settings)
│   │   ├── tutor/            ← Rute khusus evaluator tutor
│   │   │   └── page.tsx      ← Antrean evaluasi per jenjang & penetapan level (/tutor)
│   │   ├── actions/          ← Server Actions terpusat (session, admin, tutor, questions, settings)
│   │   ├── layout.tsx
│   │   └── globals.css
│   ├── components/           ← Komponen UI modular (Modal, Stopwatch, QuestionCard, Table)
│   ├── lib/                  ← Supabase client/server helper & utility (normalisasi WA, format durasi)
│   └── types/                ← Definisi TypeScript interface & database types
```

---

## 6. Aturan Keamanan & Integritas Data

1. **Keamanan Kunci Jawaban:** Validasi jawaban dilakukan 100% di server side (*Server Actions*). Jangan pernah mengirimkan kolom `is_correct` ke browser saat siswa mengerjakan tes.
2. **Normalisasi Nomor WhatsApp:** Seluruh input no. WA wajib dibersihkan ke satu format standar (misal: otomatis menjadi format `628xxx` tanpa spasi atau strip) sebelum disimpan atau dicocokkan ke database.
3. **Integritas Waktu & Durasi Pengerjaan:** Pengerjaan tes bersifat *untimed* (tanpa hitung mundur paksa), namun durasi aktual dihitung dari selisih waktu server database (`submitted_at - started_at` dalam satuan menit). Dengan demikian, durasi pengerjaan tidak dapat dimanipulasi oleh jam lokal perangkat siswa.
4. **Crash Recovery:** Simpan `session_token` dan jawaban terpilih di Local Storage siswa. Jika browser tertutup tidak sengaja, saat siswa membuka web kembali, sistem langsung merestorasi status ujian secara utuh.

---

## 7. Cara Bekerja Sama dengan Developer (SOP Kerja AI)

Setiap pengerjaan task wajib mematuhi alur kerja (*standard operating procedure*) berikut:

1. **Rencana Sebelum Eksekusi (Pre-Execution Planning):**
   * Sebelum mulai mengubah kode atau menjalankan perintah suatu task, AI **wajib memaparkan rencana aksi ringkas** (file apa yang akan dibuat/diedit dan pendekatan teknis yang akan digunakan).
   * Hal ini memastikan arah pengerjaan jelas dan transparan sebelum dieksekusi.
2. **Pengerjaan Bertahap & Berbasis Task ID:**
   * Selalu sebutkan ID task aktif dari [TASK_BREAKDOWN.md](TASK_BREAKDOWN.md) (contoh: *"Mulai mengerjakan `DB-02`"*).
   * Kerjakan task secara berurutan dan tuntas satu per satu, tanpa melompat-lompat antar task.
3. **Laporan Selesai & Panduan Pengujian (Post-Execution & How-to-Test):**
   * Setelah task selesai dikerjakan, AI **wajib melaporkan apa yang telah diselesaikan** dan perubahan file yang terjadi.
   * AI **wajib menyertakan langkah-langkah pengujian (*Testing Guide / How-to-Test*)** konkret agar developer dapat langsung memverifikasi hasilnya di browser/terminal (misal: rute URL yang dibuka, tombol yang ditekan, atau ekspektasi respon).
4. **Pemberitahuan Tugas Manual Developer (Manual Task Delegation):**
   * Jika ada langkah yang **lebih aman, lebih tepat, atau wajib dilakukan secara manual oleh developer** (contoh: mendaftar proyek Supabase di dashboard web, menyalin API Key/kredensial rahasia, atau pengujian fisik di perangkat HP), AI **wajib memberi tahu developer secara proaktif** disertai panduan langkah demi langkah yang mudah diikuti.
5. **Simpel, Bersih, dan Tanpa Bloatware:**
   * Utamakan kode yang bersih, mudah dipahami, dan langsung menjawab kebutuhan pengguna tanpa menambah kompleksitas yang tidak diminta.
6. **Fleksibilitas Desain UI & Penyempurnaan Terarah (Design Freedom & UI/UX Polish):**
   * Untuk setiap pengerjaan task yang berkaitan dengan tampilan antarmuka pengguna (UI/Frontend), AI dapat menanyakan terlebih dahulu apakah developer memiliki referensi visual, mockup, atau tangkapan layar (*screenshot*) sebagai acuan.
   * Jika ada acuan visual dari developer, gunakan acuan tersebut sebagai rujukan utama.
   * **Kebebasan Penuh Visual & Estetika:** AI diberikan kebebasan penuh dalam merancang dan menyempurnakan aspek visual antarmuka—termasuk tata letak visual (*visual layout*), tipografi, *spacing*, hierarki komponen, mikro-interaksi, transisi/animasi, hingga penyesuaian palet warna tema/brand jika dinilai menghasilkan kualitas visual yang lebih baik, modern, dan profesional.
   * **Batasan Mutlak (Alur & Fungsi Terkunci):** Kebebasan visual di atas **DILARANG KERAS** mengubah struktur alur pengguna (*user flow*), logika navigasi layar, rute halaman, fungsionalitas inti, ataupun aturan validasi/keamanan data yang telah disepakati di [PRD.md](PRD.md) dan [UI_FLOW.md](UI_FLOW.md).

---

## 8. Panduan & SOP Git Workflow (Branching & Commit)

Untuk menjaga repositori tetap bersih, rapi, dan mudah dipahami oleh siapa pun (tidak hanya developer internal), seluruh alur Git wajib mematuhi ketentuan berikut:

1. **Strategi 2 Branch Utama (Simple Branching):**
   * **`development`** — Branch kerja aktif harian. Seluruh koding fitur dikerjakan di branch ini.
   * **`main`** — Branch produksi / stabil. Hanya menerima *merge* dari `development` ketika **satu fase besar selesai tuntas dan lolos pengujian menyeluruh**.
2. **Aturan 1 Task = 1 Commit:**
   * Setiap kali satu task selesai dikerjakan dan dinyatakan aman oleh developer, lakukan 1x commit.
   * **Format Pesan Commit (Conventional Commits dengan Scope Modul, Tanpa ID Task):**
     * Gunakan pesan yang manusiawi, terstruktur, dan langsung dipahami semua orang dengan menyertakan area/modul fitur sebagai **scope** (BUKAN kode ID task seperti `ENV-01` atau `STU-02`).
     * Format: `<tipe>(<scope>): <deskripsi pekerjaan yang jelas>`
     * Scope modul yang umum: `setup`, `db`, `student`, `exam`, `result`, `admin`, `tutor`, `questions`, `settings`, `pwa`.
     * Contoh:
       * `feat(setup): inisialisasi project next.js dan tailwind css`
       * `feat(db): buat skema tabel profiles dan status test sessions`
       * `feat(student): buat halaman masuk verifikasi registrasi admin`
       * `feat(exam): buat ruang ujian untimed dan stopwatch durasi latar belakang`
       * `feat(admin): buat form pendaftaran siswa di meja registrasi`
       * `feat(tutor): buat antrean evaluasi per jenjang dan penetapan level`
       * `feat(questions): buat manajemen bank soal dengan opsi dinamis`
       * `feat(settings): perbarui form kontak tutor penanggung jawab jenjang`
       * `docs(readme): perbarui panduan dokumen proyek`
3. **Prosedur Eksekusi Git & Update Ceklis Task oleh AI:**
   * ❌ **AI DILARANG keras menjalankan `git commit` atau mencentang `[x]` pada task secara otomatis** sebelum developer selesai menguji.
   * Di akhir setiap pengerjaan task, AI **hanya menyajikan rekomendasi perintah Git siap-pakai** di bagian bawah laporan pengujian.
   * AI baru diperbolehkan **mengubah centang `[ ]` menjadi `[x]` di [TASK_BREAKDOWN.md](TASK_BREAKDOWN.md)** dan mengeksekusi perintah Git jika developer sudah menguji dan secara eksplisit memberikan konfirmasi seperti: *"aman bro, silakan commit"* atau *"sudah dites, lanjut commit"*.
