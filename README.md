# Up Speaking — Placement Test System 🎓

> Sistem Tes Penempatan Daring & Portal Evaluasi Pengajar Berbasis Web untuk Lembaga Kursus Bahasa Inggris **Up Speaking** (Jenjang Elementary & High School).

![Next.js](https://img.shields.io/badge/Next.js-14.2-black?style=for-the-badge&logo=next.js)
![TypeScript](https://img.shields.io/badge/TypeScript-5.0-blue?style=for-the-badge&logo=typescript)
![TailwindCSS](https://img.shields.io/badge/TailwindCSS-3.4-38B2AC?style=for-the-badge&logo=tailwind-css)
![Supabase](https://img.shields.io/badge/Supabase-PostgreSQL%2017-3ECF8E?style=for-the-badge&logo=supabase)
![Vercel](https://img.shields.io/badge/Deploy-Vercel-black?style=for-the-badge&logo=vercel)

---

## 📌 Gambaran Umum Proyek

**Up Speaking Placement Test System** dirancang khusus untuk memfasilitasi proses uji kemampuan bahasa Inggris calon siswa baru secara interaktif, ramah anak (*kid-friendly*), dan bebas stres. Sistem menggantikan lembar tes kertas konvensional dengan sistem digital adaptif yang terintegrasi langsung dengan portal penilaian staf pengajar (Tutor) dan manajemen lembaga (Admin).

---

## ✨ Fitur-Fitur Utama

### 🧒 1. Portal Siswa (Kid-Friendly Test Experience)
- **Akses Cepat Tanpa Password:** Siswa masuk cukup menggunakan **Nama Lengkap** dan **Nomor WhatsApp** yang telah didaftarkan lembaga.
- **Pengacakan Deterministik (Fisher-Yates Shuffling):** Seluruh butir soal aktif dan opsi jawaban diacak secara adil per sesi siswa, mencegah potensi kecurangan antar-peserta.
- **Offline-Tolerant Engine (`useOfflineSync`):** Jawaban otomatis tersimpan instan ke `localStorage` saat koneksi terputus dan otomatis disinkronkan (*auto-sync*) ke database saat internet pulih.
- **Elapsed Timer (Count-Up):** Timer berjalan hitung maju berbasis waktu server — bebas stres tanpa penghitung mundur (*no countdown kick*) yang mematikan tes secara mendadak.
- **Device Takeover Guard:** Validasi token perangkat aktif mencegah pengerjaan ganda di dua gawai secara bersamaan.
- **Desain Ramah Anak:** Tipografi bulat (`Nunito`), palet warna ceria (Sky Blue, Sun Yellow, Mint Green), navigasi palet soal visual, dan konfirmasi submit yang komunikatif.

### 👨‍🏫 2. Portal Staf & Pengajar (Staff & Tutor Management)
- **Smart Redirect (`/staff`):** Akses cepat yang otomatis mengarahkan staf ke halaman login atau dashboard spesifik sesuai peran (*Admin* vs *Tutor*).
- **Dashboard Admin:** Pemantauan metrik peserta secara real-time, pendaftaran siswa baru, manajemen akun tutor, dan penelusuran aktivitas sesi.
- **Dashboard Tutor Berdasarkan Jenjang:** Pemisahan akses ketat (*Role-Based Access Control*) antara Tutor Elementary (SD) dan High School (SMP/SMA).
- **Bank Soal Dinamis:** Pengelolaan butir soal interaktif dengan opsi jawaban fleksibel (2 hingga 5 opsi) dan penetapan kunci jawaban instan.
- **Lembar Penilaian & Evaluasi Terpadu:** Tutor dapat memeriksa lembar jawaban siswa secara mendalam, mencocokkan acuan skor lembaga, dan menetapkan level final (*Beginner*, *Intermediate*, *Advanced*) disertai catatan pembinaan.
- **Ekspor Dokumen Resmi:** Cetak laporan rekapitulasi penempatan ke dalam format **Excel (`.xlsx`)** dan dokumen cetak **PDF (`.pdf`)** berstandar resmi lembaga.
- **Soft Reset Sesi (Audit Trail):** Admin dapat mereset sesi siswa yang terkendala teknis dengan tetap menjaga arsip riwayat pengerjaan sebelumnya.

---

## 🛠️ Tech Stack & Pustaka

| Lapisan | Teknologi | Kegunaan |
| :--- | :--- | :--- |
| **Framework** | Next.js 14 (App Router) | Server-Side Rendering, Route Handlers, Server Actions |
| **Bahasa** | TypeScript (Strict Mode) | Type-safety penuh dari skema database hingga antarmuka |
| **Styling** | Tailwind CSS | Utility-first CSS, palet warna kustom, responsive mobile-first |
| **Ikonografi** | Lucide React | Ikon modern, konsisten, dan fungsional |
| **Animasi** | Framer Motion | Transisi halaman halus dan micro-interactions |
| **Backend & DB** | Supabase (PostgreSQL 17) | Relational Database, Row Level Security, GoTrue Auth |
| **Dokumen Ekspor**| SheetJS (`xlsx`) & jsPDF | Generator file laporan Excel dan dokumen PDF tabular |
| **Testing** | Vitest | Unit testing logika algoritma Fisher-Yates Shuffling |

---

## 📁 Struktur Direktori Repositori

```text
up-speaking/
├── docs/                     # Dokumentasi Resmi Proyek
│   ├── PRD.md                # Product Requirements Document
│   ├── TECHNICAL_SPEC.md     # Spesifikasi Arsitektur & Database DDL
│   ├── UIUX_DESIGN_BRIEF.md  # Panduan Desain & Token Visual
│   ├── TASK_BREAKDOWN.md     # Rencana 20 Task Terstruktur (Fase 1-6)
│   └── TEST_REPORT.md        # Laporan Unit Test & Black Box Matrix
├── public/                   # Asset Statis Gambar & Logo Lembaga
├── src/
│   ├── app/                  # Next.js App Router
│   │   ├── api/              # Route Handlers (Siswa, Admin, Tutor, Auth)
│   │   ├── staff/            # Portal Staf (Admin & Tutor Dashboards)
│   │   ├── test/             # Lembar Pengerjaan Ujian Siswa
│   │   ├── result/           # Halaman Konfirmasi & Hasil Tes Siswa
│   │   └── page.tsx          # Beranda Utama & Pintu Masuk Siswa
│   ├── components/           # Pustaka Komponen UI (Atomic & Domain-specific)
│   ├── hooks/                # Custom React Hooks (useOfflineSync, dsb.)
│   ├── lib/                  # Utilitas (Supabase Client, Shuffling, Ekspor)
│   └── types/                # TypeScript Interfaces & Supabase Types
├── supabase/                 # Skrip Database & Migrasi
│   ├── schema.sql            # Skema Tabel Relasional DDL
│   ├── seed.sql              # Bank Soal Resmi (20 Butir Soal + Kunci)
│   └── reset_test_data.sql   # Skrip Pembersih Data Uji Coba Pasca Testing
└── tests/                    # Pengujian Otomatis (Unit Testing)
```

---

## 🚀 Panduan Menjalankan di Lokal (Local Setup)

### 1. Prasyarat Sistem
- **Node.js:** Versi `18.18.0` atau yang lebih baru.
- **Package Manager:** `npm` (atau `pnpm` / `yarn`).
- **Git**

### 2. Kloning Repositori & Instal Dependensi
```bash
git clone https://github.com/septianof/up-speaking.git
cd up-speaking
npm install
```

### 3. Konfigurasi Environment Variables
Salin file `.env.example` menjadi `.env.local`:
```bash
cp .env.example .env.local
```
Sesuaikan nilainya dengan kredensial proyek Supabase Anda:
```env
NEXT_PUBLIC_SUPABASE_URL="https://<YOUR_PROJECT_REF>.supabase.co"
NEXT_PUBLIC_SUPABASE_ANON_KEY="<YOUR_ANON_KEY>"
SUPABASE_SERVICE_ROLE_KEY="<YOUR_SERVICE_ROLE_KEY>"
NEXT_PUBLIC_APP_URL="http://localhost:3000"
```

### 4. Menyiapkan Basis Data (Supabase)
1. Buka **Supabase Dashboard** di proyek Anda.
2. Masuk ke menu **SQL Editor**.
3. Jalankan skrip DDL dari file [`supabase/schema.sql`](file:///D:/SeptianoF/Projects/Learning/up-speaking/supabase/schema.sql).
4. Jalankan seeder bank soal dari file [`supabase/seed.sql`](file:///D:/SeptianoF/Projects/Learning/up-speaking/supabase/seed.sql).

### 5. Menjalankan Server Pengembangan
```bash
npm run dev
```
Buka peramban di `http://localhost:3000`.

---

## 🔐 Kredensial Akun Administrator (Akses Awal)

Untuk masuk ke portal staf pertama kali:
- **URL Masuk:** `http://localhost:3000/staff` (atau `/staff/login`)
- **Email:** `admin@upspeaking.com`
- **Kata Sandi:** `123456`

*(Admin dapat mendaftarkan akun pengajar/tutor baru melalui menu **Kelola Tutor**).*

---

## 🧹 Cara Reset Data Dummy Setelah Sesi Uji Coba

Jika teman kelompok atau pihak penguji selesai mencoba sistem dan ingin membersihkan seluruh data coba-coba agar database kembali bersih sebelum digunakan siswa asli:
1. Buka **Supabase Dashboard → SQL Editor**.
2. Salin dan jalankan seluruh isi file [`supabase/reset_test_data.sql`](file:///D:/SeptianoF/Projects/Learning/up-speaking/supabase/reset_test_data.sql).
3. **Hasil:** Seluruh data siswa uji coba terhapus bersih ke `0`, sementara **Bank Soal (20 butir) & Akun Admin tetap aman 100%**.

---

## 🧪 Pengujian Sistem

- **Unit Testing (Algoritma Fisher-Yates):**
  ```bash
  npm test
  ```
- **Verifikasi Build Produksi:**
  ```bash
  npm run build
  ```
- **Laporan Matriks Black Box Testing:**
  Dapat dilihat secara lengkap di dokumen [`docs/TEST_REPORT.md`](file:///D:/SeptianoF/Projects/Learning/up-speaking/docs/TEST_REPORT.md).

---

## 📄 Lisensi & Hak Cipta

Dikembangkan untuk **Up Speaking English Course** sebagai pemenuhan Proyek Kerja Praktik (KP) & Portofolio Sistem Informasi.
Hak cipta dilindungi undang-undang.
