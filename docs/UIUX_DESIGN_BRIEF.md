# UI/UX Design Brief

## 1. Document Overview
- **Project Title:** Rancang Bangun Sistem Informasi Tes Penempatan Berbasis Web Menggunakan Algoritma Fisher-Yates Shuffle (Studi Kasus: Up Speaking Learning Centre)
- **Product Name:** Up Speaking Placement Test System
- **Document Version:** 1.4.0
- **Status:** `Approved`
- **Author:** Senior Product Designer (AI) & Mahasiswa Kerja Praktik
- **Target Platform:** Responsive Web App (Mobile, Tablet, Desktop) - Light Mode Murni

---

## 2. Source Documents and Assumptions
- **Source Document:** [Product Requirements Document (PRD v2.3.0 Approved)](file:///D:/SeptianoF/Projects/Learning/up-speaking/docs/PRD.md).
- **Brand Assets:** [Logo Resmi Up Speaking Learning Centre](file:///D:/SeptianoF/Projects/Learning/up-speaking/assets/logo/logo.png).
- **Core Design Decisions:**
  1. **Halaman Beranda & Auto-Redirect Sesi Berjalan:** Siswa baru disambut oleh halaman informasi dan petunjuk tes. Jika siswa me-refresh/menutup tab saat tes berjalan, sistem otomatis langsung me-*redirect* siswa kembali ke Lembar Ujian (`SCR-003`).
  2. **Format Lembar Tes Siswa:** Satu soal per halaman (*Stepper*) dilengkapi palet nomor soal, indikator status koneksi, dan timer hitung maju.
  3. **Manajemen Akun Tutor oleh Admin:** Admin memiliki menu khusus **Kelola Tutor (`SCR-014`)** untuk mendaftarkan akun pengajar baru (Nama, Email, Password Sementara, Jenjang yang Diampu) tanpa intervensi manual pada basis data.
  4. **Pemisahan Navigasi & Tombol Aksi Cepat (Quick Actions):** Dashboard staf (Admin & Tutor) memiliki menu mandiri yang fokus pada ringkasan analitis dan dilengkapi kartu **Aksi Cepat (*Quick Action Cards*)** untuk operasional harian.
  5. **Pemeriksaan Hasil Akhir oleh Siswa:** Layar penyelesaian (`SCR-004`) menampilkan konfirmasi bahwa tes selesai dikumpulkan, dan jika dibuka kembali setelah tutor selesai menilai, layar otomatis menampilkan kartu pengumuman level resmi.
  6. **Struktur Alur Pengguna (User Flow):** Disajikan dalam format teks terstruktur (Langkah, Percabangan Kondisi, Hasil Sistem).
  7. **Tampilan & Tema:** Menggunakan **Light Mode Murni** dengan palet warna resmi dari logo Up Speaking.

---

## 3. Design Principles

1. **Seamless Continuity & Zero-Friction Resume (Kelancaran Pengerjaan):**
   - Jika browser tertutup atau ter-refresh di tengah tes, sistem langsung mengembalikan siswa ke nomor soal terakhir secara otomatis (*auto-redirect*) tanpa memerlukan login ulang.
2. **Distraction-Free Focus (Fokus Bebas Distraksi saat Tes):**
   - Lembar ujian siswa dirancang bersih dari ornamen yang tidak perlu. Teks pertanyaan disajikan jelas dan besar, opsi jawaban lega (*fat-finger proof*), dan timer hitung maju disajikan secara informatif.
3. **Single Responsibility with Quick Actions (Fokus Halaman & Akses Cepat Staf):**
   - Setiap halaman memiliki satu fokus utama, namun halaman Dashboard dilengkapi tombol aksi cepat (*Quick Actions*) untuk tugas operasional harian tanpa harus berpindah-pindah menu.
4. **Resilient Feedback & Error Tolerance (Ketahanan Terhadap Gangguan):**
   - Sistem memberikan umpan balik yang menenangkan saat internet terputus, pesan validasi yang ramah saat salah input, serta konfirmasi modal sebelum tindakan penting (submit tes atau reset sesi).

---

## 4. Visual Direction

### 4.1 Mood & Brand Identity
Identitas visual mengadopsi warna asli logo resmi **Up Speaking Learning Centre**:
- **Primary Brand - Sky Blue (`#3D98D6`):** Warna utama untuk tombol primer, tab aktif, dan penanda nomor soal berjalan.
- **Brand Accent - Energetic Coral Red (`#ED3937`):** Aksen logo resmi untuk penanda status penting, tombol reset, dan peringatan kritis.
- **Functional Success - Emerald Green (`#10B981`):** Penanda butir soal terjawab, status tes selesai, dan level *Advanced*.
- **Functional Warning - Amber (`#F59E0B`):** Penanda banner offline dan acuan level *Intermediate*.
- **Neutral Canvas - Crisp Slate Light (`#FFFFFF`, `#F8FAFC`, `#F1F5F9`):** Latar belakang putih dan abu-abu terang yang sejuk untuk kenyamanan membaca.

---

## 5. Design Tokens

### 5.1 Color Tokens
| Kategori Token | Nama Token | Nilai Hex | Penggunaan Utama |
| :--- | :--- | :--- | :--- |
| **Primary Brand** | `primary-500` | `#3D98D6` | Tombol utama, tab aktif, ring nomor soal aktif |
| | `primary-600` | `#2B82BF` | Hover state tombol utama |
| | `primary-50` | `#EFF6FC` | Latar belakang highlight opsi terpilih, badge info |
| **Accent Logo** | `accent-500` | `#ED3937` | Aksen brand logo, tombol reset, pesan error |
| | `accent-50` | `#FEF2F2` | Background alert validasi gagal |
| **Success & Filled**| `success-500` | `#10B981` | Tombol palet soal terjawab, status selesai, level Advanced |
| | `success-50` | `#ECFDF5` | Background badge sukses |
| **Warning** | `warning-500` | `#F59E0B` | Banner offline, acuan level Intermediate |
| | `warning-50` | `#FFFBEB` | Background banner peringatan pengerjaan |
| **Neutral Base** | `surface-white`| `#FFFFFF` | Background card, container lembar soal, navbar |
| | `surface-bg` | `#F8FAFC` | Background utama aplikasi (Slate 50) |
| | `border-light`| `#E2E8F0` | Garis pemisah tabel, border card (Slate 200) |
| | `text-primary`| `#0F172A` | Teks judul, teks pertanyaan soal (Slate 900) |
| | `text-muted` | `#64748B` | Label placeholder, caption, timer label (Slate 500) |

---

## 6. Screen Inventory

### 6.1 Antarmuka Siswa (Student Interface)
| Screen ID | Nama Layar | Target Pengguna | Tujuan Layar | Aksi Utama |
| :--- | :--- | :--- | :--- | :--- |
| **SCR-001** | Student Landing & Guidance | Student | Sambutan, panduan tes, deteksi sesi aktif untuk auto-redirect | Klik "Mulai Tes" / Auto-redirect jika ada sesi |
| **SCR-002** | Student Login Modal | Student | Form modal input identitas siswa sebelum tes | Input Nama Lengkap & No HP, klik "Masuk" |
| **SCR-003** | Student Test Sheet | Student | Mengerjakan soal satu per satu (stepper) dengan pengacakan Fisher-Yates | Pilih Opsi, Navigasi Prev/Next, Kumpulkan Tes |
| **SCR-004** | Student Result & Summary | Student | Konfirmasi pengumpulan selesai / melihat hasil level resmi | Lihat Level Resmi / Tombol Kembali |

### 6.2 Antarmuka Staf (Admin & Tutor Interface)
| Screen ID | Nama Layar | Target Pengguna | Tujuan Layar | Aksi Utama |
| :--- | :--- | :--- | :--- | :--- |
| **SCR-005** | Staff Authentication | Admin & Tutor | Autentikasi email dan password staf lembaga | Input email/password, klik "Masuk" |
| **SCR-006** | Admin Dashboard | Admin | Pusat ringkasan metrik dan **Tombol Aksi Cepat Admin** | Pantau metrik, klik Aksi Cepat |
| **SCR-007** | Admin Kelola Siswa | Admin | Pendaftaran siswa baru, daftar data siswa, dan Soft Reset Sesi | Daftarkan Siswa, Edit Siswa, Hapus Siswa (Belum Tes), Reset Sesi Tes |
| **SCR-008** | Admin Hasil & Laporan | Admin | Rekapitulasi nilai seluruh jenjang dan fitur ekspor dokumen | Filter data, Export Excel (.xlsx) & PDF (.pdf) |
| **SCR-009** | Admin Bank Soal | Admin | Manajemen seluruh butir soal (Elementary & High School) | Tambah Soal Dinamis, Edit, Hapus |
| **SCR-010** | Tutor Dashboard | Tutor | Pusat ringkasan metrik jenjang dan **Tombol Aksi Cepat Tutor** | Pantau metrik, klik Aksi Cepat |
| **SCR-011** | Tutor Penilaian Siswa | Tutor | Peninjauan detail jawaban, skor, durasi, dan formulir penetapan level | Tinjau Jawaban, Tetapkan Level & Catatan |
| **SCR-012** | Tutor Laporan & Rekap | Tutor | Rekapitulasi hasil penempatan khusus jenjang yang diampu | Filter data, Export Excel (.xlsx) & PDF (.pdf) |
| **SCR-013** | Tutor Bank Soal | Tutor | Manajemen butir soal khusus jenjang yang diampu tutor | Tambah Soal Dinamis, Edit, Hapus |
| **SCR-014** | Admin Kelola Tutor | Admin | Pendaftaran dan pengelolaan akun staf Tutor per jenjang | Tambah Akun Tutor, Edit Akun/Jenjang, Hapus (Soft Delete) |

---

## 7. User Flows (Alur Pengguna Terstruktur)

### FLOW-001: Alur Pengalaman Siswa (Student Journey)
1. **Langkah 1: Mengakses Web Aplikasi (`SCR-001`)**
   - Siswa membuka alamat web aplikasi di browser perangkatnya.
   - *Pengecekan Otomatis (Auto-Redirect Sesi Berjalan):*
     - *Kondisi A (Ada sesi aktif `IN_PROGRESS` di `localStorage`):* Sistem langsung me-redirect siswa ke Lembar Ujian (`SCR-003`).
     - *Kondisi B (Tidak ada sesi aktif):* Siswa melihat beranda dan menekan tombol **"Mulai Tes Sekarang"**.
2. **Langkah 2: Memasukkan Identitas Diri (`SCR-002`)**
   - Siswa menginput **Nama Lengkap** dan **Nomor Handphone** $\rightarrow$ Klik **"Masuk ke Tes"**.
   - Sistem memvalidasi data pendaftaran. Jika cocok dan belum tes, paket soal diunduh dan lembar ujian dibuka (`SCR-003`).
3. **Langkah 3: Mengerjakan Soal Tes (`SCR-003`)**
   - Siswa mengerjakan soal satu per satu. Timer hitung maju berjalan.
   - Pilihan jawaban tersimpan instan ke `localStorage` (tetap lancar dikerjakan saat offline) dan disinkronkan ke server saat online.
4. **Langkah 4: Mengumpulkan Lembar Jawaban**
   - Siswa menekan **"Kumpulkan Tes"**.
   - Muncul dialog konfirmasi (memberi tahu jika ada nomor yang belum terisi).
   - Pengumpulan diverifikasi online $\rightarrow$ Status berubah menjadi `COMPLETED` $\rightarrow$ Muncul Layar Selesai (`SCR-004`).

---

### FLOW-002: Alur Admin (Pendaftaran Siswa, Kelola Tutor, & Reset Sesi)
1. **Langkah 1: Login Staf Admin (`SCR-005`)**
   - Admin login $\rightarrow$ Masuk ke Admin Dashboard (`SCR-006`).
2. **Langkah 2: Tombol Aksi Cepat Admin (`SCR-006`)**
   - Admin dapat langsung mengeklik:
     - `+ Daftarkan Siswa Baru` (Membuka modal pendaftaran siswa).
     - `+ Tambah Akun Tutor` (Membuka modal pembuatan akun tutor).
     - `+ Tambah Butir Soal` (Membuka modal tambah soal).
     - `📑 Buka Laporan & Ekspor` (Mengarahkan ke menu Hasil & Laporan).
3. **Langkah 3: Mendaftarkan Akun Tutor Baru (`SCR-014`)**
   - Admin membuka menu **Kelola Tutor** $\rightarrow$ Menekan **`+ Tambah Akun Tutor`**.
   - Mengisi form modal:
     - Nama Lengkap Tutor
     - Email Tutor
     - Password Sementara
     - Pilihan Jenjang: `Elementary` atau `High School`
   - Klik **"Simpan Akun Tutor"** $\rightarrow$ Akun otomatis terdaftar di sistem dan siap digunakan login oleh pengajar bersangkutan.
4. **Langkah 4: Mengelola Siswa & Soft Reset (`SCR-007`)**
   - Admin membuka menu **Kelola Siswa**. Tombol **"Reset Tes"** aktif untuk siswa yang bermasalah. Klik reset mengarsipkan sesi lama (`RESET`) dan menerbitkan sesi baru yang bersih (`NOT_STARTED`).
5. **Langkah 5: Ekspor Laporan (`SCR-008`)**
   - Admin mengunduh rekapitulasi data hasil tes dalam format **Excel (.xlsx)** atau **PDF (.pdf)**.

---

### FLOW-003: Alur Tutor (Peninjauan Jawaban & Penetapan Level)
1. **Langkah 1: Login Staf Tutor (`SCR-005`)**
   - Tutor login menggunakan akun yang telah dibuatkan oleh Admin $\rightarrow$ Masuk ke Tutor Dashboard (`SCR-010`) sesuai jenjangnya.
2. **Langkah 2: Meninjau dan Menilai Siswa (`SCR-011`)**
   - Tutor membuka menu **Penilaian Siswa** $\rightarrow$ Memilih siswa pada tab **"Perlu Dinilai"**.
   - Modal peninjauan menampilkan skor %, durasi, sorotan acuan lembaga (*Beginner 0-59%, Intermediate 60-79%, Advanced 80-100%*), dan rincian jawaban siswa.
   - Tutor menetapkan level final, mengisi catatan evaluasi, dan menyimpan keputusan $\rightarrow$ Status menjadi `Finalized`.
3. **Langkah 3: Ekspor Laporan Jenjang (`SCR-012`)**
   - Tutor mengunduh laporan rekapitulasi hasil jenjang binaannya ke format **Excel (.xlsx)** atau **PDF (.pdf)**.

---

## 8. Screen Layouts and Component Specifications

### 8.1 Layar Siswa (Student UI)
- `SCR-001`: Student Landing & Guidance (Hero, Panduan 4 Poin, Tombol Mulai Tes, Auto-redirect).
- `SCR-002`: Student Login Modal (Form Nama Lengkap & No HP).
- `SCR-003`: Student Test Sheet (Topbar sticky: Timer Elapsed `CMP-003`, Status Koneksi `CMP-004`; Kolom Kiri: Soal Aktif & Opsi Dinamis `CMP-002`; Kolom Kanan: Palet Soal `CMP-001`).
- `SCR-004`: Student Result & Summary (Konfirmasi Selesai & Kartu Level Resmi jika sudah final).

### 8.2 Layar Staf (Admin & Tutor UI)
- Layout Dasar Staf: **Sidebar Navigasi di Sisi Kiri (`CMP-005`)**.
- **`SCR-006`: Admin Dashboard (Metrik & Aksi Cepat):**
  - Kartu Metrik: Total Siswa, Belum Mulai, Sedang Tes, Selesai.
  - Aksi Cepat: `+ Daftarkan Siswa`, `+ Tambah Akun Tutor`, `+ Tambah Butir Soal`, `Buka Laporan`.
- **`SCR-007`: Admin Kelola Siswa:**
  - Pendaftaran siswa, tabel status, dan tombol `Reset Tes`.
- **`SCR-014`: Admin Kelola Tutor (Manajemen Akun Pengajar):**
  - Action Bar: Tombol `+ Tambah Akun Tutor`.
  - Modal Form: Nama Lengkap, Email, Password Sementara, Pilihan Jenjang (`Elementary` / `High School`).
  - Tabel Tutor: Nama, Email, Jenjang Pengampu, Tanggal Dibuat, Aksi.
- **`SCR-008`: Admin Hasil & Laporan:** Rekap nilai & Tombol Export Excel / PDF.
- **`SCR-009`: Admin Bank Soal:** CRUD soal dinamis (min 2, max 5 opsi) seluruh jenjang.
- **`SCR-010`: Tutor Dashboard:** Metrik evaluasi jenjang binaan & Aksi Cepat.
- **`SCR-011`: Tutor Penilaian Siswa:** Tabel review, modal evaluasi `CMP-007`, penetapan level & catatan.
- **`SCR-012`: Tutor Laporan & Rekap:** Rekap nilai jenjang & Tombol Export Excel / PDF.
- **`SCR-013`: Tutor Bank Soal:** CRUD soal khusus jenjang yang diampu tutor.

---

## 9. Requirement-to-Design Traceability

| PRD FR ID | Kebutuhan PRD | Implementasi pada Desain Brief |
| :--- | :--- | :--- |
| **FR-001** | Login email/pass Staf & Nama+HP Siswa | `SCR-002` (Siswa) & `SCR-005` (Staf) |
| **FR-002** | Validasi pendaftaran siswa oleh Admin | Modal Pendaftaran pada menu Kelola Siswa `SCR-007` & Quick Action `SCR-006` |
| **FR-003** | Akses langsung ke lembar soal setelah verifikasi | Alur dari `SCR-001` $\rightarrow$ `SCR-002` $\rightarrow$ `SCR-003` (atau direct auto-redirect) |
| **FR-004** | Fisher-Yates Shuffle untuk soal & opsi | Algoritma terpasang di pemuatan soal pada `SCR-003` |
| **FR-005** | Penyimpanan sesi lokal (`localStorage`) | State recovery pada `SCR-003` & Auto-redirect instan pada `SCR-001` |
| **FR-006** | Pengambilalihan sesi di HP baru | Pesan peringatan logout otomatis pada perangkat lama |
| **FR-007** | Pengerjaan offline & auto-sync | Indikator `CMP-004` & banner offline pada `SCR-003` |
| **FR-008** | Timer hitung maju (*elapsed timer*) | Komponen `CMP-003` sticky di header `SCR-003` |
| **FR-009** | Validasi online saat submit tes | Guard modal submit pada `SCR-003` |
| **FR-010** | Soft reset sesi tes siswa oleh Admin | Tombol & Modal konfirmasi reset pada `SCR-007` |
| **FR-011** | Opsi dinamis 2 s/d 5 pilihan per soal | Form modal dinamis (min 2, max 5) pada `SCR-009`/`013` & render di `SCR-003` |
| **FR-012** | Semua soal aktif di bank soal diujikan | Pemuatan seluruh array soal aktif di `SCR-003` |
| **FR-013** | Filter siswa Perlu Dinilai vs Selesai | Tab filter status pada `SCR-011` |
| **FR-014** | Acuan panduan nilai lembaga di Tutor | Panel rekomendasi skor pada modal penilaian `SCR-011` |
| **FR-015** | Penetapan level final & catatan Tutor | Form radio level final & input catatan pada `SCR-011` |
| **FR-016** | Ekspor laporan ke Excel & PDF | Tombol ekspor pada `SCR-008` (Admin) & `SCR-012` (Tutor) |
| **FR-017** | Admin mendaftarkan akun Tutor baru | Layar `SCR-014` (Admin Kelola Tutor) & Quick Action `SCR-006` |

---

## 10. Readiness Checklist
- [x] Layar `SCR-014` (Admin Kelola Tutor) telah dirancang untuk pembuatan akun pengajar secara mandiri.
- [x] Tombol Aksi Cepat (*Quick Actions*) Admin diperbarui mencakup pembuatan akun tutor.
- [x] Seluruh kebutuhan fungsional `FR-001` s/d `FR-017` terpetakan lengkap ke 14 layar antarmuka.
