# AGENTS.md — Project AI Guidelines & Rules
**Proyek:** Up Speaking Placement Test System (Digitalisasi Tes Penempatan Kursus Bahasa Inggris)  
**Tujuan:** Panduan dan aturan wajib bagi seluruh AI Assistant (Antigravity, Cursor, Claude, Copilot, dll.) agar konsisten, tidak berbelit-belit, dan fokus menyelesaikan target proyek Kerja Praktek.  
**Referensi Wajib:** [PRD.md](PRD.md) · [UI_FLOW.md](UI_FLOW.md) · [TASK_BREAKDOWN.md](TASK_BREAKDOWN.md)

---

## 1. Prinsip Utama (Mindset Proyek)

1. **Simpel, Bersih, dan Tanpa Overengineering:**
   * Developer menyukai solusi yang **singkat, padat, dan jelas**.
   * Hindari menambahkan pustaka (*library*), arsitektur rumit, atau abstraksi berlebih yang tidak diminta.
2. **Zero Friction untuk Calon Siswa:**
   * Siswa **TIDAK PERLU** membuat akun atau mengingat password. Siswa hanya menginput **Nama Lengkap & Nomor WhatsApp**.
3. **Kepatuhan Terhadap Dokumen Acuan:**
   * Sebelum mengusulkan atau membuat kode, selalu pastikan selaras dengan alur di [UI_FLOW.md](UI_FLOW.md) dan arsitektur di [PRD.md](PRD.md).
   * Pengerjaan fitur wajib merujuk ke ID Task di [TASK_BREAKDOWN.md](TASK_BREAKDOWN.md).

---

## 2. Tech Stack yang WAJIB Digunakan

| Komponen | Teknologi | Keterangan |
|---|---|---|
| **Framework** | Next.js (App Router, TypeScript) | Versi stabil terbaru, React Server Components & Server Actions |
| **Styling** | Tailwind CSS | Utility-first, responsif di mobile & desktop |
| **Ikon UI** | Lucide React | Ringan, konsisten, dan modern |
| **Database & Auth** | Supabase (PostgreSQL + Supabase Auth) | PostgreSQL relasional & Auth khusus untuk akun Admin |
| **State Lokal** | Browser Local Storage | Digunakan untuk ketahanan sesi ujian (*Crash Recovery* & Auto-Save) |
| **Distribusi** | Web App / Progressive Web App (PWA) | Responsif di ponsel siswa & desktop admin tanpa install Play Store |

---

## 3. Hal yang DILARANG Dilakukan AI (Strict Blacklist)

AI **dilarang keras** melakukan atau menyarankan hal-hal berikut:

- ❌ **Dilarang** menyarankan pembuatan aplikasi native Android terpisah (Kotlin, Flutter, React Native, dll.). Aplikasi ini adalah **Web PWA terpadu**.
- ❌ **Dilarang** membuat sistem login/password atau token fisik untuk calon siswa. Akses siswa hanya via **Nama Lengkap & Nomor WhatsApp**.
- ❌ **Dilarang** membocorkan kunci jawaban (`is_correct`) ke frontend browser siswa. Data soal yang dikirim ke siswa **wajib disaring di server**.
- ❌ **Dilarang** menyarankan ORM berat (Prisma, Drizzle) atau state management rumit (Redux, Zustand) yang menambah bloatware. Cukup gunakan `@supabase/supabase-js`, React state standar, dan Server Actions.
- ❌ **Dilarang** melakukan *hard delete* fisik pada tabel butir soal di database. Gunakan *soft delete* (`is_active = false`) agar riwayat jawaban siswa terdahulu tetap utuh.
- ❌ **Dilarang** mengubah skema database relasional tanpa merujuk ke Section 6 di [PRD.md](PRD.md).
- ❌ **Dilarang** melompat-lompat pengerjaan tanpa mengonfirmasi status task di [TASK_BREAKDOWN.md](TASK_BREAKDOWN.md).

---

## 4. Struktur Routing Aplikasi yang Disepakati

### A. Rute Siswa (Mobile-First / PWA)
* `/` — Landing Page resmi, highlight profil tes, & Modal/Bottom Sheet pendaftaran (Nama + No. WA).
* `/exam` — Ruang Ujian interaktif (Sticky Header Timer Server, Radio Cards, Drawer Palet Soal, Auto-Save).
* `/result` — Halaman Hasil (Skor %, Rincian Benar/Total, Badge Level, Saran Kelas, & Tombol Direct WhatsApp ke Admin).

### B. Rute Admin Panel (Desktop-Optimized)
* `/admin` — **Halaman Login Admin** (Email & Password via Supabase Auth).
* `/admin/dashboard` — **Dashboard Utama Rekap Nilai** (4 Kartu Metrik, Tabel Riwayat, Pencarian Nama/WA, Filter Level, Tombol Retest Permission, Ekspor Excel & PDF).
* `/admin/questions` — **Manajemen Bank Soal** (Tabel Soal & Modal CRUD dengan Pilihan Opsi Dinamis A-D/E).
* `/admin/settings` — **Pengaturan Ujian** (Durasi menit & validasi rentang persentase 3 level: 0%–100%).

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
│   │   │   ├── page.tsx      ← Landing page & modal masuk (/)
│   │   │   ├── exam/         ← Ruang ujian (/exam)
│   │   │   └── result/       ← Halaman hasil (/result)
│   │   ├── admin/            ← Rute admin panel
│   │   │   ├── page.tsx      ← Halaman Login Admin (/admin)
│   │   │   ├── dashboard/    ← Dashboard rekap (/admin/dashboard)
│   │   │   ├── questions/    ← Bank Soal (/admin/questions)
│   │   │   └── settings/     ← Pengaturan (/admin/settings)
│   │   ├── api/              ← Endpoint API jika diperlukan (atau gunakan Server Actions)
│   │   ├── layout.tsx
│   │   └── globals.css
│   ├── components/           ← Komponen UI modular (Modal, Timer, QuestionCard, Table)
│   ├── lib/                  ← Supabase client/server helper & utility (normalisasi WA, format skor)
│   └── types/                ← Definisi TypeScript interface & database types
```

---

## 6. Aturan Keamanan & Integritas Data

1. **Keamanan Kunci Jawaban:** Validasi jawaban dilakukan 100% di server side (`/api/session/submit` atau Server Action). Jangan pernah mengirimkan kolom `is_correct` ke browser saat siswa mengerjakan tes.
2. **Normalisasi Nomor WhatsApp:** Seluruh input no. WA wajib dibersihkan ke satu format standar (misal: otomatis menjadi format `628xxx` tanpa spasi atau strip) sebelum disimpan atau dicocokkan ke database.
3. **Integritas Waktu Ujian:** Batas waktu ujian diikat pada jam server (`end_time` pada record `test_sessions`). Sisa waktu dihitung dari `end_time - current_server_time`, sehingga tidak dapat dimanipulasi dengan me-refresh browser atau memajukan jam perangkat.
4. **Crash Recovery:** Simpan `session_token` dan jawaban terpilih di Local Storage siswa. Jika browser tertutup tidak sengaja, saat siswa membuka web kembali, sistem langsung merestorasi status ujian selama `end_time` belum lewat.

---

## 7. Cara Bekerja Sama dengan Developer (SOP Kerja AI)

Setiap pengerjaan task wajib mematuhi alur kerja (*standard operating procedure*) berikut:

1. **Rencana Sebelum Eksekusi (Pre-Execution Planning):**
   * Sebelum mulai mengubah kode atau menjalankan perintah suatu task, AI **wajib memaparkan rencana aksi ringkas** (file apa yang akan dibuat/diedit dan pendekatan teknis yang akan digunakan).
   * Hal ini memastikan arah pengerjaan jelas dan transparan sebelum dieksekusi.
2. **Pengerjaan Bertahap & Berbasis Task ID:**
   * Selalu sebutkan ID task aktif dari [TASK_BREAKDOWN.md](TASK_BREAKDOWN.md) (contoh: *"Mulai mengerjakan `ENV-01`"*).
   * Kerjakan task secara berurutan dan tuntas satu per satu, tanpa melompat-lompat antar task.
3. **Laporan Selesai & Panduan Pengujian (Post-Execution & How-to-Test):**
   * Setelah task selesai dikerjakan, AI **wajib melaporkan apa yang telah diselesaikan** dan perubahan file yang terjadi.
   * AI **wajib menyertakan langkah-langkah pengujian (*Testing Guide / How-to-Test*)** konkret agar developer dapat langsung memverifikasi hasilnya di browser/terminal (misal: rute URL yang dibuka, tombol yang ditekan, atau ekspektasi respon).
4. **Pemberitahuan Tugas Manual Developer (Manual Task Delegation):**
   * Jika ada langkah yang **lebih aman, lebih tepat, atau wajib dilakukan secara manual oleh developer** (contoh: mendaftar proyek Supabase di dashboard web, menyalin API Key/kredensial rahasia, atau pengujian fisik di perangkat HP), AI **wajib memberi tahu developer secara proaktif** disertai panduan langkah demi langkah yang mudah diikuti.
5. **Simpel, Bersih, dan Tanpa Bloatware:**
   * Utamakan kode yang bersih, mudah dipahami, dan langsung menjawab kebutuhan pengguna tanpa menambah kompleksitas yang tidak diminta.
6. **Konfirmasi Referensi Desain UI (Figma / Mockup First):**
   * Untuk setiap pengerjaan task yang berkaitan dengan tampilan antarmuka pengguna (UI/Frontend), AI **wajib menanyakan terlebih dahulu** apakah developer memiliki referensi visual, tangkapan layar (*screenshot*), atau desain dari Figma sebelum mulai mengoding.
   * Jika ada, AI wajib menggunakan tangkapan layar tersebut sebagai acuan utama agar implementasi tata letak (*layout*), warna, tipografi, dan hierarki komponen sesuai 100% dengan rancangan desain.
---

## 8. Panduan & SOP Git Workflow (Branching & Commit)

Untuk menjaga repositori tetap bersih, rapi, dan mudah dipahami oleh siapa pun (tidak hanya developer internal), seluruh alur Git wajib mematuhi ketentuan berikut:

1. **Strategi 2 Branch Utama (Simple Branching):**
   * **`development`** — Branch kerja aktif harian. Seluruh koding fitur (Fase 0 sampai Fase 4) dilakukan di branch ini.
   * **`main`** — Branch produksi / stabil. Hanya menerima *merge* dari `development` ketika **satu fase besar selesai tuntas dan lolos pengujian menyeluruh**.
2. **Aturan 1 Task = 1 Commit:**
   * Setiap kali satu task selesai dikerjakan dan dinyatakan aman oleh developer, lakukan 1x commit.
   * **Format Pesan Commit (Conventional Commits dengan Scope Modul, Tanpa ID Task):**
     * Gunakan pesan yang manusiawi, terstruktur, dan langsung dipahami semua orang dengan menyertakan area/modul fitur sebagai **scope** (BUKAN kode ID task seperti `ENV-01` atau `STU-02`).
     * Format: `<tipe>(<scope>): <deskripsi pekerjaan yang jelas>`
     * Scope modul yang umum: `setup`, `db`, `student`, `exam`, `result`, `admin`, `questions`, `settings`, `pwa`.
     * Contoh:
       * `feat(setup): inisialisasi project next.js dan tailwind css`
       * `feat(db): buat skema database dan seeder supabase`
       * `feat(student): buat landing page dan modal pendaftaran nama dan whatsapp`
       * `feat(exam): buat ruang ujian interaktif dan auto-save jawaban`
       * `feat(admin): buat dashboard rekapitulasi nilai dan filter level`
       * `feat(questions): buat manajemen bank soal dengan opsi dinamis`
       * `feat(settings): buat pengaturan durasi tes dan rentang level`
       * `fix(timer): perbaiki sinkronisasi countdown timer ujian`
       * `docs(readme): perbarui panduan dokumen proyek`
3. **Prosedur Eksekusi Git & Update Ceklis Task oleh AI:**
   * ❌ **AI DILARANG keras menjalankan `git commit` atau mencentang `[x]` pada task secara otomatis** sebelum developer selesai menguji.
   * Di akhir setiap pengerjaan task, AI **hanya menyajikan rekomendasi perintah Git siap-pakai** di bagian bawah laporan pengujian.
   * AI baru diperbolehkan **mengubah centang `[ ]` menjadi `[x]` di [TASK_BREAKDOWN.md](TASK_BREAKDOWN.md)** dan mengeksekusi perintah Git jika developer sudah menguji dan secara eksplisit memberikan konfirmasi seperti: *"aman bro, silakan commit"* atau *"sudah dites, lanjut commit"*.
