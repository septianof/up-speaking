# Product Requirements Document (PRD)

## 1. Document Overview
- **Project Title:** Rancang Bangun Sistem Informasi Tes Penempatan Berbasis Web Menggunakan Algoritma Fisher-Yates Shuffle (Studi Kasus: Up Speaking Learning Centre)
- **Product Name:** Up Speaking Placement Test System
- **Context:** Laporan & Implementasi Kerja Praktik (KP) Jurusan Teknik Informatika Semester 7
- **Document Version:** 2.3.0
- **Status:** `Approved`
- **Author:** Mahasiswa Kerja Praktik & AI Product Manager

---

## 2. Problem Statement
Up Speaking Learning Centre adalah lembaga kursus bahasa Inggris yang melayani peserta didik jenjang *Elementary* (SD) dan *High School* (SMP, SMA, dan Umum). Saat ini, penentuan level awal siswa (*student placement test*) masih diselenggarakan secara manual menggunakan lembar kertas. Proses manual ini menimbulkan tiga permasalahan utama:

1. **Beban Administratif & Kerentanan Human Error:**
   - Pemeriksaan lembar jawaban dan perhitungan skor manual rentan terhadap salah hitung (*clerical error*), yang dapat menyebabkan kesalahan fatal pada penentuan level awal siswa.
2. **Kerentanan Integritas Ujian & Kebocoran Kunci Jawaban:**
   - Format soal kertas yang statis dan seragam rentan memicu kecurangan (saling contek saat tes bersamaan) serta potensi menghafal dan membocorkan jawaban antar-siswa yang saling berteman atau satu sekolah yang telah mengikuti tes lebih dulu.
3. **Beban Kerja Tutor & Penundaan Penempatan Siswa:**
   - Proses pemeriksaan dan penilaian manual memakan waktu serta menambah beban kerja tutor, sehingga menunda penetapan level dan kepastian jadwal belajar siswa baru.

---

## 3. Target Users and Roles

### 1. Student (Siswa):
- Siswa jenjang *Elementary* (SD) dan *High School* (SMP, SMA, Umum).
- Mengakses tes melalui browser web menggunakan **Nama Lengkap + Nomor HP** (yang didaftarkan oleh Admin).
- Begitu login berhasil, langsung diarahkan ke lembar soal pilihan ganda acak dengan timer hitung maju (*elapsed timer*). Seluruh soal aktif yang ada di bank soal jenjangnya akan diujikan.
- Dapat melanjutkan pengerjaan secara offline jika internet tiba-tiba terputus, dan mengirimkan (*submit*) lembar jawaban saat terhubung online.

### 2. Admin:
- Mendaftarkan siswa baru (Nama Lengkap, Nomor HP Siswa/Ortu, Pilihan Jenjang: *Elementary* / *High School*).
- **Mendaftarkan dan mengelola akun staf Tutor** (Nama Lengkap, Email, Password Sementara, Jenjang yang Diampu).
- Melakukan **Reset Sesi Tes** (*Soft Reset*) jika siswa perlu mengulang tes dari awal akibat kendala teknis.
- Mengelola seluruh bank soal untuk semua jenjang (tambah, edit, hapus butir soal).
- Melihat daftar status pengerjaan siswa (*Belum Mulai*, *Sedang Mengerjakan*, *Selesai*).
- Mengekspor rekapitulasi data hasil tes siswa ke format **Excel (.xlsx)** dan **PDF (.pdf)**.

### 3. Tutor:
- Terbagi berdasarkan spesialisasi jenjang:
  - *Tutor Elementary* (khusus siswa SD).
  - *Tutor High School* (khusus siswa SMP, SMA, dan Umum).
- Login menggunakan akun yang telah dibuatkan oleh Admin.
- Mengelola bank soal khusus jenjang yang diampunya (tambah, edit, hapus butir soal).
- Meninjau hasil tes siswa (persentase skor otomatis, durasi pengerjaan *elapsed time*, detail jawaban) dan menetapkan level final (*Beginner*, *Intermediate*, *Advanced*) secara objektif.
- Mengekspor rekapitulasi data hasil penempatan siswa sesuai jenjangnya ke format **Excel (.xlsx)** dan **PDF (.pdf)**.

---

## 4. Goals and Non-Goals

### 4.1 Goals
- **Digitalisasi Sistem Berbasis Web Responsif:** Menghadirkan aplikasi web responsif (*mobile-friendly*) yang dapat diakses melalui browser smartphone, tablet, maupun komputer tanpa instalasi aplikasi native atau PWA.
- **Penerapan Algoritma Fisher-Yates Shuffle:** Mengimplementasikan algoritma pengacakan permutasi linear $O(n)$ tidak bias untuk:
  1. Pengacakan urutan kemunculan seluruh butir soal aktif (*question permutation*).
  2. Pengacakan susunan posisi opsi jawaban (*option permutation*) pada tiap butir soal.
- **Autentikasi Siswa Langsung (Nama Lengkap + Nomor HP):** Akses cepat tanpa perantara token; siswa mengisi Nama Lengkap + No HP dan langsung masuk ke lembar ujian, sekaligus menyelesaikan kasus kakak-beradik yang menggunakan 1 nomor HP orang tua.
- **Manajemen Akun Tutor Mandiri oleh Admin:** Memberikan wewenang kepada Admin untuk mendaftarkan akun pengajar (Tutor) langsung dari aplikasi web tanpa perlu membuka basis data secara manual.
- **Pemulihan Sesi & Proteksi Multi-Perangkat:**
  - Di perangkat yang sama: memanfaatkan `localStorage` agar siswa tidak perlu login ulang saat me-refresh halaman atau membuka ulang browser.
  - Berpindah perangkat (misal HP mati): mendukung *single active device takeover* yang membatalkan sesi di perangkat lama guna mencegah kecurangan.
- **Pengerjaan Toleran Gangguan Koneksi (*Offline-Tolerant Answering*):**
  - Mengunduh seluruh paket soal aktif ke memori perangkat saat mulai tes.
  - Menyimpan jawaban secara instan ke `localStorage` jika koneksi internet terputus di tengah pengerjaan.
  - Melakukan sinkronisasi otomatis (*auto-sync*) ke server saat koneksi internet kembali aktif.
- **Mekanisme Soft Reset yang Aman:** Memungkinkan Admin mereset sesi tes siswa (membatalkan sesi lama sebagai arsip audit trail dan menerbitkan sesi baru yang bersih) tanpa menghapus data secara permanen.
- **Struktur Opsi Jawaban Dinamis:** Mendukung jumlah opsi fleksibel per butir soal (misal 2 opsi A–B, 4 opsi A–D, hingga 5 opsi A–E).
- **Pencatat Waktu Hitung Maju (*Elapsed Timer*):** Menghitung total durasi pengerjaan siswa tanpa menghentikan paksa ujian (*no countdown auto-submit*), sebagai parameter pendukung evaluasi tutor.
- **Evaluasi Human-in-the-Loop:** Auto-scoring instan dilengkapi acuan rentang nilai lembaga (*Beginner: 0–59%*, *Intermediate: 60–79%*, *Advanced: 80–100%*), dengan wewenang penetapan level akhir di tangan Tutor.
- **Export Data Ramah Pengguna:** Memfasilitasi ekspor laporan hasil tes siswa ke format **Excel (.xlsx)** dan **PDF (.pdf)** untuk Admin dan Tutor.

### 4.2 Non-Goals (Out of Scope untuk MVP)
- Tidak ada pengaturan kuota pemilihan soal; seluruh soal aktif pada jenjang terkait diujikan semuanya.
- Tidak ada layar konfirmasi/prates terpisah; login langsung membuka lembar soal.
- Tidak menggunakan Progressive Web App (PWA) / service worker offline shell; murni sistem web responsif.
- Tidak ada batasan waktu mundur otomatis (*countdown timer auto-kick*).
- Tidak ada modul audio/speech processing, voice recording, atau AI speaking assessment (seluruh tes berbasis teks pilihan ganda).
- Tidak ada modul transaksi pembayaran (*payment gateway*) atau absensi kelas.
- Tidak ada tipe soal esai/uraian bebas di MVP.

---

## 5. User Stories

| ID | As a | I want to | So that | Priority | Acceptance Criteria |
| :--- | :--- | :--- | :--- | :--- | :--- |
| **US-001** | Admin | Mendaftarkan siswa baru dengan Nama Lengkap, Nomor HP, dan Jenjang | Data siswa tersimpan dan siap mengikuti tes penempatan | **Must Have** | Data siswa tersimpan, status tes awal diset ke `NOT_STARTED` |
| **US-002** | Admin | Mereset sesi pengerjaan siswa yang mengalami kendala teknis | Siswa dapat memulai tes baru yang bersih dari awal | **Must Have** | Sesi lama diubah ke status `RESET` (diarsipkan), dibuat sesi baru `NOT_STARTED` |
| **US-003** | Admin & Tutor | Mengekspor rekapitulasi hasil tes siswa ke format Excel (.xlsx) dan PDF (.pdf) | Lembaga memiliki arsip administratif yang mudah dibaca | **Must Have** | File Excel dan PDF terunduh memuat nama, jenjang, skor, durasi, dan level akhir |
| **US-004** | Student | Masuk menggunakan Nama Lengkap dan Nomor HP yang didaftarkan | Saya langsung masuk ke lembar soal tes sesuai jenjang saya | **Must Have** | Autentikasi mencocokkan Nama + No HP; berhasil langsung membuka lembar soal |
| **US-005** | Student | Menutup tab atau me-refresh browser tanpa diminta login ulang | Saya dapat melanjutkan pengerjaan dengan tenang tanpa kehilangan jawaban | **Must Have** | Sistem memulihkan sesi dari `localStorage`, memuat soal dan jawaban yang telah dipilih |
| **US-006** | Student | Berpindah ke HP lain saat HP pertama mati | Saya tetap dapat melanjutkan pengerjaan sesi tes saya | **Must Have** | Login di HP baru mengambil alih sesi aktif; sesi di HP lama otomatis dinonaktifkan |
| **US-007** | Student | Tetap dapat membaca soal dan memilih jawaban saat internet tiba-tiba terputus | Pengerjaan tes saya tidak terganggu oleh fluktuasi sinyal | **Must Have** | Jawaban tersimpan di `localStorage` lokal; auto-sync ke server saat koneksi internet pulih |
| **US-008** | Student | Mengirimkan (*submit*) lembar jawaban saat koneksi internet aktif | Jawaban dan durasi pengerjaan saya terkunci dengan aman untuk dinilai | **Must Have** | Konfirmasi submit; validasi koneksi internet; status tes berubah menjadi `COMPLETED` |
| **US-009** | Tutor | Melihat daftar siswa pada jenjang yang saya ampu dengan filter status evaluasi | Saya dapat memprioritaskan siswa yang belum dinilai | **Must Have** | Filter memisahkan siswa `Perlu Dinilai` dan `Selesai Dinilai`; sesi berstatus `RESET` disembunyikan |
| **US-010** | Tutor | Melihat skor otomatis, total durasi pengerjaan, detail jawaban siswa, dan menetapkan keputusan level akhir | Penempatan level siswa akurat dan terverifikasi secara resmi | **Must Have** | Tutor dapat membuka lembar rincian jawaban siswa, memilih level final dengan acuan skor ringkas, dan memfinalisasi keputusan |
| **US-011** | Admin & Tutor | Mengelola bank soal dengan jumlah opsi dinamis per butir soal | Kebutuhan variasi format soal (2 hingga 5 pilihan) terpenuhi | **Must Have** | Form CRUD soal mendukung penambahan/penghapusan opsi dinamis dan penanda kunci jawaban |
| **US-012** | Student | Melihat status hasil penempatan setelah difinalisasi | Saya mengetahui hasil penempatan level kelas saya | **Must Have** | Informasi level final ditampilkan pada halaman hasil siswa |
| **US-013** | Admin | Mendaftarkan dan mengelola akun staf Tutor baru | Tutor dapat login secara mandiri tanpa pembuatan akun manual di database | **Must Have** | Akun tutor berhasil dibuat dengan role jenjang yang sesuai |

---

## 6. Feature Scope and Priorities (MVP)

### F-01: User, Tutor, & Student Management
- Autentikasi email & password untuk staf (`Admin`, `Tutor Elementary`, `Tutor High School`).
- **Manajemen Akun Tutor oleh Admin:** Form pendaftaran akun tutor baru, pengeditan profil & jenjang penugasan, serta penghapusan akun tutor secara aman (*soft delete* untuk menjaga integritas data riwayat penilaian).
- **Manajemen Siswa oleh Admin:** Pendaftaran siswa (Nama Lengkap, Nomor HP Siswa/Ortu, Pilihan Jenjang: *Elementary* / *High School*), pengeditan identitas siswa (koreksi nama/HP/jenjang), dan penghapusan data siswa yang belum mengikuti tes.
- Autentikasi siswa langsung berbasis **Nama Lengkap + Nomor HP** (tanpa layar perantara, langsung membuka lembar soal).
- Role-Based Access Control (RBAC) ketat antara Tutor Elementary dan High School.

### F-02: Session Lifecycle, Recovery, & Soft Reset
- **Session Recovery Lokal:** Penyimpanan session identifier di `localStorage` perangkat siswa untuk mencegah kebutuhan login ulang saat refresh/buka tab baru.
- **Single Active Device Control:** Mekanisme pengambilalihan sesi (*device takeover*) jika siswa ganti HP, membatalkan token sesi di perangkat lama.
- **Mekanisme Soft Reset oleh Admin:** Membatalkan sesi lama dengan status `RESET` (tetap tersimpan di database sebagai audit trail) dan menerbitkan sesi baru berstatus `NOT_STARTED` untuk siswa bersangkutan.

### F-03: Offline-Tolerant Test Engine & Fisher-Yates Shuffling
- **Algoritma Fisher-Yates Shuffle:**
  - Pengacakan urutan seluruh soal aktif pada jenjang siswa per sesi tes.
  - Pengacakan urutan opsi jawaban dinamis per butir soal.
- **Preloaded Question Package:** Seluruh butir soal aktif di-download ke browser saat siswa mulai membuka tes.
- **Local Answer Caching & Auto-Sync:** Jawaban disimpan secara lokal di `localStorage` saat offline dan otomatis dikirimkan ke server saat jaringan online kembali.
- **Elapsed Timer:** Timer hitung maju berbasis server timestamp yang tetap akurat saat browser di-refresh.
- **Submission Gate:** Validasi koneksi internet saat tombol submit ditekan untuk memastikan kalkulasi nilai berhasil.

### F-04: Dynamic Question Bank Management
- **CRUD Bank Soal Lengkap:** Pembuatan (*Create*), Peninjauan (*Read*), Pengeditan (*Update* redaksi pertanyaan, opsi, dan kunci jawaban), dan Penghapusan (*Delete*) butir soal terisolasi per jenjang.
- Fleksibilitas jumlah opsi jawaban per butir soal (dinamis: 2, 3, 4, atau 5 opsi).
- Seluruh butir soal yang berstatus aktif di bank soal otomatis menjadi paket soal ujian bagi jenjang terkait.

### F-05: Evaluation, Level Finalization, & Reporting
- Auto-scoring instan setelah submit (persentase benar dan perbandingan jumlah benar/salah).
- **Peninjauan Lembar Jawaban Siswa:** Komponen drawer lipat (*collapsible*) pada modal evaluasi yang menampilkan seluruh butir soal, status Benar/Salah, opsi yang dipilih siswa, serta kunci jawaban resmi.
- **Penetapan Level Mandiri oleh Tutor:** Form modal evaluasi ringkas dan minimalis dengan pilihan 3 level resmi:
  - *Beginner:* Acuan rentang 0% – 59%
  - *Intermediate:* Acuan rentang 60% – 79%
  - *Advanced:* Acuan rentang 80% – 100%
- Penetapan level final langsung dan bersih tanpa kolom catatan berlebih atau rekomendasi sistem otomatis.
- Filter status peninjauan di dashboard Tutor (*Perlu Dinilai* vs *Selesai Dinilai*).
- **Fitur Export Rekapitulasi ke Excel (.xlsx) dan PDF (.pdf)** untuk Admin dan Tutor.

---

## 7. Functional Requirements

| ID | Kebutuhan Fungsional | Terkait User Story |
| :--- | :--- | :--- |
| **FR-001** | Sistem wajib menyediakan login akun email/password untuk Admin dan Tutor, serta akses berbasis Nama Lengkap + Nomor HP untuk Siswa. | US-001, US-004 |
| **FR-002** | Sistem wajib memvalidasi input pendaftaran siswa oleh Admin: Nama Lengkap, Nomor HP (Siswa/Ortu), dan Jenjang Pendidikan. | US-001 |
| **FR-003** | Setelah login berhasil, sistem wajib langsung membuka lembar soal ujian sesuai jenjang siswa tanpa perantara layar konfirmasi. | US-004 |
| **FR-004** | Sistem wajib mengimplementasikan **Algoritma Fisher-Yates Shuffle** untuk mengacak urutan kemunculan seluruh butir soal aktif dan susunan opsi jawaban saat sesi tes dibuat. | US-004, US-007 |
| **FR-005** | Sistem wajib menyimpan `session_id` di `localStorage` perangkat siswa agar siswa tidak perlu login ulang saat me-refresh halaman atau membuka ulang browser pada perangkat yang sama. | US-005 |
| **FR-006** | Jika siswa login dari perangkat baru dengan sesi yang masih `IN_PROGRESS`, sistem wajib memindahkan sesi ke perangkat baru dan menonaktifkan akses pada perangkat lama. | US-006 |
| **FR-007** | Sistem wajib mendukung pengerjaan offline dengan menyimpan jawaban di `localStorage` saat internet terputus, dan otomatis menyinkronkannya ke server saat internet kembali aktif. | US-007 |
| **FR-008** | Sistem wajib mencatat durasi waktu pengerjaan secara hitung maju (*elapsed timer*) berdasarkan selisih waktu sekarang dengan waktu mulai di server. | US-004, US-007 |
| **FR-009** | Pengumpulan tes (*submit*) wajib mensyaratkan koneksi internet aktif untuk mengunci status menjadi `COMPLETED`, menyimpan durasi final, dan menghitung skor otomatis. | US-008 |
| **FR-010** | Admin wajib dapat melakukan *Soft Reset* sesi tes siswa, mengubah status sesi lama menjadi `RESET` dan membuatkan sesi baru berstatus `NOT_STARTED`. | US-002 |
| **FR-011** | Form bank soal wajib mendukung jumlah opsi dinamis (minimal 2, maksimal 5 opsi) per butir soal. | US-011 |
| **FR-012** | Seluruh butir soal yang berstatus aktif di bank soal jenjang terkait wajib diujikan seluruhnya kepada siswa. | US-004 |
| **FR-013** | Dashboard Tutor wajib menyediakan filter data siswa berdasarkan status evaluasi (`Perlu Dinilai` dan `Selesai Dinilai`), serta mengabaikan sesi yang berstatus `RESET`. | US-009 |
| **FR-014** | Sistem wajib menampilkan acuan rentang nilai lembaga pada card pilihan level di modal evaluasi Tutor (0–59% Beginner, 60–79% Intermediate, 80–100% Advanced) dan ringkasan skor tes objektif. | US-010 |
| **FR-015** | Tutor berwenang menetapkan level akhir siswa (`Beginner`, `Intermediate`, `Advanced`) secara mandiri berdasarkan tinjauan profil skor dan lembar rincian jawaban siswa. | US-010 |
| **FR-016** | Admin dan Tutor wajib dapat mengekspor rekapitulasi data hasil tes siswa ke format file **Excel (.xlsx)** dan **PDF (.pdf)**. | US-003 |
| **FR-017** | Admin wajib dapat mendaftarkan akun staf Tutor baru (Nama Lengkap, Email, Password Sementara, Jenjang yang Diampu) langsung dari antarmuka web. | US-013 |

---

## 8. Conceptual Data Model
Entitas utama dalam sistem:
1. **User / Profile (Staf Lembaga):** `id`, `full_name`, `email`, `role` (`ADMIN`, `TUTOR_ELEMENTARY`, `TUTOR_HIGH_SCHOOL`), `created_at`.
2. **Student:** `id`, `full_name`, `phone_number`, `target_level` (`ELEMENTARY`, `HIGH_SCHOOL`), `created_at`.
3. **Question (Bank Soal):** `id`, `target_level`, `question_text`, `is_active`, `created_by`.
4. **Question Option (Opsi Dinamis):** `id`, `question_id`, `option_text`, `is_correct` (boolean), `sort_order`.
5. **Test Session (Sesi Tes):** `id`, `student_id`, `started_at`, `submitted_at`, `elapsed_seconds`, `score_percentage`, `device_token`, `status` (`IN_PROGRESS`, `COMPLETED`, `FINALIZED`, `RESET`).
6. **Test Response (Jawaban Siswa):** `id`, `session_id`, `question_id`, `selected_option_id`, `display_order`, `synced_at`.
7. **Placement Evaluation (Penetapan Tutor):** `id`, `session_id`, `tutor_id`, `assigned_level`, `tutor_notes`, `finalized_at`.

---

## 9. Edge Cases and Failure States
1. **Internet Putus Saat Tes Berlangsung:** Seluruh soal aktif sudah preloaded; jawaban disimpan di `localStorage`; auto-sync saat online kembali.
2. **Internet Putus Saat Submit:** Sistem meminta siswa menghubungkan kembali internet sebelum submit.
3. **Siswa Keluar dari Browser Saat Tes Sedang Berlangsung:** `localStorage` memulihkan sesi `in_progress` otomatis tanpa login ulang.
4. **Pergantian Perangkat (HP Mati):** Login di HP baru memindahkan sesi dan mencabut akses di HP lama.
5. **Admin Mereset Tes:** Sesi lama berstatus `RESET` (tersimpan sebagai riwayat), siswa mendapat sesi baru yang bersih.
6. **Pendaftaran Email Tutor Duplikat:** Sistem menolak pembuatan akun jika email tutor telah terdaftar sebelumnya dengan pesan validasi ramah.

---

## 10. Success Metrics (Indikator Evaluasi Kerja Praktik)
1. **Digitalisasi Penuh Proses Placement Test:** 100% tes penempatan terlaksana melalui sistem web tanpa kertas.
2. **Kemandirian Administrasi Kursus:** Admin dapat mendaftarkan siswa dan staf tutor secara mandiri tanpa intervensi teknis pengembang pada basis data.
3. **Ketahanan Sistem Terhadap Gangguan Sinyal:** 100% jawaban terselamatkan saat jaringan putus berkat *preloaded questions* dan *localStorage auto-sync*.
4. **Integritas Pengacakan:** Algoritma Fisher-Yates Shuffle bekerja 100% mengacak urutan soal dan opsi secara matematis.
5. **Kemudahan Pelaporan:** Admin dan Tutor dapat mengunduh laporan rapi dalam format Excel dan PDF sekali klik.

---

## 11. Assumptions and Constraints
- **Asumsi:** Siswa menggunakan smartphone/tablet/laptop dengan browser modern. Format soal adalah teks pilihan ganda. Seluruh butir soal aktif pada bank soal jenjang terkait diujikan ke siswa.
- **Batasan:** Diselesaikan dalam kerangka waktu Kerja Praktik (KP) Teknik Informatika semester 7.
