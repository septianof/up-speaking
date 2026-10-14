# AGENTS.md — Pedoman dan Aturan Wajib AI Assistant

Dokumen ini berisi aturan wajib, batasan teknis, prinsip desain antarmuka, dan standar operasional prosedur (SOP) bagi AI Coding Assistant (Antigravity/Gemini/Claude) yang bekerja pada repositori **Up Speaking Placement Test System**.

---

## 1. Identitas Proyek & Tech Stack

- **Nama Proyek:** Up Speaking Placement Test System
- **Framework:** Next.js 14 (App Router), React 18, TypeScript (Strict Mode).
- **Styling:** Tailwind CSS, Lucide React (ikonografi).
- **Animasi:** Framer Motion (transisi halus, tidak berlebihan).
- **Backend/DB:** Supabase (PostgreSQL, Auth, RLS).
- **Mode Tampilan:** **Light Mode Murni** (tidak ada dark mode).
- **Palet Warna Resmi:**
  - **Primary Brand:** `#3D98D6` (`primary-500`, hover: `primary-600`, subtle: `primary-50`).
  - **Accent Logo:** `#ED3937` (`accent-500` — tombol reset sesi, pesan bahaya/error).
  - **Neutral Canvas:** `#FFFFFF` (Card/Surface), `#F8FAFC` (Background), `#E2E8F0` (Border).
  - **Functional State:** Emerald (`#10B981`) khusus untuk status Benar/Selesai; Rose (`#F43F5E`) khusus untuk status Salah.

---

## 2. Strict UI/UX Guardrails (Prinsip "Less is More")

Berdasarkan hasil evaluasi dan arahan desain pengguna, seluruh pengerjaan frontend staf (Admin & Tutor) **WAJIB** mematuhi aturan berikut:

### A. Larangan Visual Noise & Ikon Dekoratif
- ❌ **DILARANG** menambahkan ikon dekoratif pada judul halaman, header card, header tabel, atau label form yang tidak memiliki fungsi interaktif nyata.
- ❌ **DILARANG** mencampur aduk warna komponen (misal: tombol ungu/indigo, tombol hijau emerald acak, border warna-warni).
- ✅ **GUNAKAN** satu warna utama Brand Primary (`bg-primary-500`) untuk seluruh tombol aksi standar.
- ✅ Ikon hanya digunakan jika memiliki fungsi navigasi/tindakan langsung (seperti: `Search`, `Trash2`, `Plus`, `X`, `ChevronDown`, `Check`).

### B. Kesederhanaan Form & Modal
- **Header Modal:** Wajib memiliki hierarki ringkas, alignment presisi sejajar dengan tombol tutup (`X`), dan garis batas halus (*divider*) `border-b border-surface-border`.
- **Deskripsi Form:** Hindari kalimat panjang atau teks berulang yang hanya mengulang judul. Gunakan maksimal 1 kalimat padat atau hilangkan jika judul sudah jelas.
- **Label Form:** Gunakan *Sentence case* yang elegan (`Nama lengkap`, bukan `NAMA LENGKAP SISWA`).
- **Pilihan Bertingkat (*Nested Cards*):** Hindari meletakkan card di dalam card secara berlebihan yang membuat form sesak (*balatak*).

---

## 3. Communication & Architectural Gate (PENTING)

### A. Larangan Mengubah Alur Arsitektur Tanpa Konfirmasi Eksplisit
- ❌ **DILARANG KERAS** mengubah alur dasar antarmuka secara sepihak (misal: merombak Modal pop-up menjadi Halaman Rute Baru `/evaluations/[id]`, atau sebaliknya).
- Jika pengguna menanyakan pendapat arsitektur (*"bagusnya di form atau di halaman baru?"*):
  1. Berikan analisis komparasi objektif terlebih dahulu.
  2. **JANGAN langsung mengeksekusi kode** sebelum pengguna memberikan konfirmasi akhir yang tegas.
  3. Pastikan alur dipahami bersama sebelum menyentuh file routing Next.js.

### B. Larangan Menambah Fitur yang Tidak Diminta (*No Scope Creep*)
- ❌ **DILARANG** menambahkan kolom input baru (seperti textarea catatan, kolom rekomendasi sistem, threshold acuan rumit) jika pengguna secara eksplisit meminta penyederhanaan form.

---

## 4. Logika Bisnis yang Tidak Boleh Dirusak

1. **Fisher-Yates Shuffling:** Seluruh soal aktif dan opsi jawaban diacak secara deterministik per sesi tes.
2. **Offline-Tolerant Engine:** Jawaban siswa disimpan instan ke `localStorage` saat internet mati, dan disinkronkan (*auto-sync*) saat internet pulih.
3. **Elapsed Timer:** Penghitung waktu berjalan hitung maju (*count-up*) berbasis timestamp server, tanpa batasan waktu mundur yang mematikan tes secara paksa (*no countdown auto-kick*).
4. **Soft Reset Sesi (Audit Trail):** Reset sesi oleh Admin mengarsipkan sesi lama (`status = RESET`) dan menerbitkan sesi baru yang bersih (`NOT_STARTED`).
5. **Wewenang Evaluasi Tutor:** Tutor menetapkan level akhir siswa (`Beginner`, `Intermediate`, `Advanced`) secara mandiri berdasarkan profil dan lembar jawaban siswa.

---

## 5. SOP Verifikasi & Git Commit

1. **Verifikasi Build:**
   - Setiap kali melakukan perubahan kode TypeScript/JSX, wajib menjalankan verifikasi build:
     ```powershell
     npm run build
     ```
   - Pastikan proses berakhir dengan **Exit Code 0** tanpa error tipe maupun error linting.
2. **Konvensi Git Commit:**
   - Gunakan format Conventional Commits yang deskriptif:
     - `feat:` Penambahan fitur baru yang disepakati.
     - `refactor:` Pembersihan UI, restrukturisasi komponen, penyederhanaan form.
     - `fix:` Perbaikan bug logic atau tampilan.
     - `docs:` Pembaruan dokumentasi spesifikasi (`PRD.md`, `UIUX_DESIGN_BRIEF.md`, dsb.).
