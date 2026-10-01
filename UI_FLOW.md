# UI Flow — Up Speaking Placement Test System
**Dokumen:** UI Flow & Screen Map Specification (Revised)  
**Referensi Utama:** PRD Up Speaking Placement Test  
**Platform:** Web App / PWA (Mobile-Responsive untuk Siswa, Desktop-Optimized untuk Admin)  
**Versi:** 1.1.0  
**Tanggal Revisi:** 30 September 2026  

---

## Daftar Isi

- [Konvensi Dokumen](#konvensi-dokumen)
- [Design Tokens & Panduan Visual (Design System Foundation)](#design-tokens--panduan-visual-design-system-foundation)
- [A. Alur Siswa (Peserta Placement Test)](#a-alur-siswa-peserta-placement-test)
  - [S1. Alur Masuk & Pemulihan Sesi (Anti-Close & Anti-Cheat Fraud Check)](#s1-alur-masuk--pemulihan-sesi-anti-close--anti-cheat-fraud-check)
  - [S2. Alur Pelaksanaan Ujian (Exam Room)](#s2-alur-pelaksanaan-ujian-exam-room)
  - [S3. Alur Pengumpulan & Tampilan Hasil (Result Screen)](#s3-alur-pengumpulan--tampilan-hasil-result-screen)
- [B. Alur Admin Panel (Staf Lembaga)](#b-alur-admin-panel-staf-lembaga)
  - [B1. Alur Autentikasi Admin](#b1-alur-autentikasi-admin)
  - [B2. Alur Dashboard & Rekapitulasi Hasil](#b2-alur-dashboard--rekapitulasi-hasil)
  - [B3. Alur Manajemen Bank Soal (Dengan Validasi Ketat Form)](#b3-alur-manajemen-bank-soal-dengan-validasi-ketat-form)
  - [B4. Alur Pengaturan Level & Durasi Tes](#b4-alur-pengaturan-level--durasi-tes)
- [C. Peta Layar Lengkap (Sitemap)](#c-peta-layar-lengkap-sitemap)

---

## Konvensi Dokumen

| Simbol | Arti |
|---|---|
| 🟦 Kotak | Layar / Halaman Web |
| 🔷 Berlian | Percabangan Logika / Pengecekan Sistem |
| ✅ | Kondisi Berhasil / Valid |
| ❌ | Kondisi Gagal / Error |
| ⚠️ | Kondisi Peringatan / Fraud Check |
| 🔔 | Modal Dialog / Pop-up Konfirmasi |
| ──> | Alur Navigasi / Aksi Pengguna |

---

## Design Tokens & Panduan Visual (Design System Foundation)

Untuk menjamin konsistensi antarmuka antara sisi Siswa (Mobile/PWA) dan Admin (Desktop), sistem menggunakan hierarki visual: **Modern EdTech — Friendly, Approachable & Academic Focus**, yang diselaraskan secara langsung dengan logo resmi Up Speaking ("UP"):

| Kategori Token | Nilai / Deskripsi | Penggunaan Antarmuka & Relevansi Brand |
|---|---|---|
| **Primary Brand** | `#0f2e60` s.d. `#1e3a8a` (Deep Academic Navy) | Header siswa, topbar admin, tipografi judul, struktur utama |
| **Brand Cyan / U-Blue** | `#0284c7` s.d. `#0ea5e9` (Up Sky Blue) | Selaras huruf "U" pada logo: badge kategori, link bantuan, status aktif |
| **Brand Scarlet / P-Red** | `#e11d48` s.d. `#e53935` (Up Coral Red) | Selaras huruf "P" pada logo: tombol CTA utama ("Mulai Tes"), timer alert |
| **Success Color** | `#059669` (Emerald Green) | Jawaban tersimpan otomatis, status soal terjawab, skor penempatan |
| **Warning / Alert** | `#dc2626` (Crimson Alert) | Peringatan soal kosong, notifikasi nomor terdaftar (fraud prevention) |
| **Neutral Surface** | `#F8FAFC` & `#FFFFFF` | Background kanvas bersih, kartu fitur, kartu soal, tabel admin |
| **Typography** | `Plus Jakarta Sans`, `Inter`, sans-serif | Tipografi sans modern berkarakter ramah dengan legibilitas tinggi |

---

## A. Alur Siswa (Peserta Placement Test)

### S1. Alur Landing Page, Registrasi Peserta & Pemulihan Sesi

**Tujuan:** Menyajikan halaman pembuka resmi (*Landing Page*) yang informatif dan elegan, membuka form registrasi via Modal/Bottom Sheet saat CTA diklik, serta mendeteksi pemulihan sesi ujian otomatis jika browser sempat tertutup.

```mermaid
flowchart TD
    A([Siswa Buka Website Up Speaking]) --> B{Ada ujian aktif di browser?}
    
    B -- ✅ Ya & Belum Expired --> C[Otomatis redirect ke Ruang Ujian]
    C --> J["Halaman Ruang Ujian"]

    B -- ❌ Tidak Ada --> D[Tampilkan Landing Page Up Speaking]
    D --> E[Siswa membaca informasi tes & panduan]
    E --> F[Klik Tombol CTA: 'Ikuti Placement Test Sekarang']

    F --> G[Buka Form Registrasi: Modal Dialog di Desktop / Bottom Sheet di Mobile]
    G --> H[Input: Nama Lengkap & Nomor WhatsApp]
    H --> I[Klik Tombol 'Mulai Mengerjakan']

    I --> K{Validasi Input & Cek Nomor WA}
    K -- ❌ Field Kosong / Format Salah --> L[🔔 Tampilkan pesan error inline pada form]
    L --> H

    K -- ⚠️ Nomor WA Pernah Tes dalam 24 Jam Terakhir --> M[🔔 Modal Blokir Fraud: Nomor ini sudah menyelesaikan tes! Hubungi admin untuk tes ulang.]
    M --> H

    K -- 🔷 Nomor WA Punya Sesi Berjalan Aktif --> N[🔔 Modal Dialog: Sesi aktif ditemukan! Ingin lanjutkan ujian?]
    N -- Batal / Mulai Baru --> H
    N -- Lanjutkan --> J

    K -- ✅ Nomor Baru & Valid --> O[Mulai sesi ujian & muat lembar soal acak]
    O --> J
```

**Catatan Komponen Layar (S1 - Landing Page & Modal Registrasi):**

1. **Struktur Halaman Utama (Landing Page):**
   * **Header / Navbar:** Logo resmi Up Speaking Learning Centre, tagline *"English Placement Test"*, dan tautan bantuan/kontak.
   * **Hero Section:**
     * Headline: *"Ukur Kemampuan Bahasa Inggrismu & Temukan Level Terbaikmu"*.
     * Subheadline: Penjelasan singkat tujuan tes penempatan resmi untuk pemetaan kelas belajar yang akurat.
     * **Tombol CTA Utama:** *"Ikuti Placement Test Sekarang 👉"* (ukuran besar, warna aksen Amber menyala, posisi strategis di hero).
   * **Kartu Informasi Cepat (3 Fitur Kunci):**
     * ⏱️ **Durasi Ujian:** ~45 Menit (penghitung waktu mundur otomatis).
     * 📝 **Format Tes:** Pilihan ganda interaktif dengan pengacakan soal.
     * 🎯 **Hasil Instan:** Langsung mengetahui lencana level (Beginner, Intermediate, Advanced).
   * **Kartu Panduan & Ketentuan:**
     * 1. Kerjakan secara mandiri & jujur tanpa alat bantu agar rekomendasi kelas sesuai kemampuan riil.
     * 2. Jawaban tersimpan otomatis secara berkala.
     * 3. Satu nomor WhatsApp berlaku untuk 1x kesempatan tes resmi.
   * **Footer:** Hak cipta Up Speaking Learning Centre & tautan bantuan admin.

2. **Komponen Form Registrasi (Pop-up Modal / Bottom Sheet):**
   * Tampil melayang saat tombol CTA diklik (Modal di tengah pada desktop, Bottom Sheet geser dari bawah pada mobile).
   * Judul: *"Data Peserta Placement Test"*.
   * Subtitle: *"Isi nama dan nomor WhatsApp Anda untuk memulai pengerjaan tes."*
   * Form Input:
     1. `Input Text`: Nama Lengkap (placeholder: *Contoh: Budi Pratama*).
     2. `Input Tel`: Nomor WhatsApp (placeholder: *Contoh: 08123456789*, deteksi format otomatis).
   * Tombol Aksi: *"Mulai Mengerjakan"* (dengan indikator loading saat tombol ditekan).
   * Tombol Tutup (✕) di pojok modal jika siswa ingin kembali membaca landing page.

---

### S2. Alur Pelaksanaan Ujian (Exam Room)

**Tujuan:** Ruang interaktif pengerjaan soal dengan pengacakan, penghitung waktu mundur, penyimpanan jawaban otomatis, dan navigasi daftar soal yang intuitif.

```mermaid
flowchart TD
    A["Masuk Halaman Ruang Ujian"] --> B["Tampilkan lembar soal & jalankan countdown timer"]
    B --> C["Tampilkan Soal Aktif"]

    C --> D{"Aksi Siswa di Layar?"}

    D -->|Pilih Opsi Jawaban A/B/C/D| E["Tandai opsi terpilih & jalankan auto-save"]
    E --> E1["Ubah Badge Status: 'Tersimpan'"]
    E1 --> C

    D -->|Klik Tombol Sebelumnya| F["Tampilkan nomor soal sebelumnya"]
    F --> C

    D -->|Klik Tombol Selanjutnya| G{"Apakah ini nomor terakhir?"}
    G -->|Bukan Nomor Terakhir| H["Pindah ke nomor soal berikutnya"]
    H --> C
    G -->|Nomor Terakhir| I["Tampilkan Tombol 'Kumpulkan Ujian' dengan visual primer kontras"]
    I --> C

    D -->|Klik Palet Nomor Soal| J["Buka Drawer & Lompat ke nomor yang dipilih"]
    J --> C

    D -->|Klik Kumpulkan Ujian| K["Buka Modal Dialog Konfirmasi Pengumpulan"]
    
    D -->|Waktu Ujian Habis 00:00| L["🔔 Notifikasi Alert: Waktu Habis! Mengumpulkan otomatis..."]
    L --> M["Proses Pengumpulan Otomatis & Hitung Nilai"]
    M --> N["Redirect ke Halaman Hasil"]
```

**Catatan Komponen Layar (S2 - Exam Screen):**
- **Sticky Top Bar:**
  - Nama siswa yang sedang aktif.
  - **Countdown Timer:** Menampilkan sisa waktu (MM:SS). Saat sisa waktu `< 05:00`, timer berubah menjadi warna merah dengan animasi denyut pelan (*subtle pulse*).
  - **Auto-save Badge:** Indikator visual hijau *"Tersimpan"* setiap siswa memilih opsi jawaban.
- **Area Pertanyaan (Content Body):**
  - Indikator nomor (misal: "Pertanyaan 12 dari 30").
  - Teks stimulus / pertanyaan soal berbahasa Inggris.
  - Opsi jawaban (A, B, C, D) disajikan dalam bentuk **Interactive Radio Cards** (memiliki efek seleksi warna tegas, mudah di-*tap* pada layar ponsel).
- **Bottom Navigation Bar (Fixed Bottom):**
  - Tombol *"Sebelumnya"* (tombol sekunder, nonaktif di soal nomor 1).
  - Tombol *"Daftar Soal"* (membuka panel modal/drawer kisi soal).
  - Tombol *"Selanjutnya"* / *"Kumpulkan Ujian"* (memiliki warna kontras berbeda saat berada di nomor terakhir).
- **Drawer / Sheet Palet Soal:**
  - Grid nomor 1 sampai N.
  - Indikator status warna:
    - 🟢 **Hijau:** Sudah terjawab.
    - ⚪ **Abu-abu:** Belum terjawab.
    - 🔵 **Biru Ring:** Sedang dibuka / aktif saat ini.

---

### S3. Alur Pengumpulan & Tampilan Hasil (Result Screen)

**Layar yang Terlibat:** Modal Konfirmasi Submit → Halaman Hasil Level

```mermaid
flowchart TD
    A["Klik Tombol 'Kumpulkan Ujian'"] --> B{"Apakah ada soal yang belum dijawab?"}
    
    B -->|Ada Soal Belum Terjawab| C["🔔 Modal Peringatan: Masih ada soal belum dijawab! Tetap kumpulkan sekarang?"]
    B -->|Sudah Lengkap Terjawab| D["🔔 Modal Konfirmasi: Yakin ingin mengakhiri dan mengumpulkan ujian?"]

    C -->|Periksa Lagi| E["Tutup dialog & buka drawer palet soal kosong"]
    C -->|Tetap Kumpulkan| F["Proses Perhitungan Nilai & Penentuan Level"]
    
    D -->|Batal| E2["Tutup dialog & lanjut ujian"]
    D -->|Ya, Kumpulkan| F

    F --> G["Tutup Sesi Ujian & Hapus Cache Pengerjaan"]
    G --> H["Tampilkan Halaman Hasil Level Siswa"]
    
    H --> I["Siswa melihat Skor %, Jumlah Benar, Lencana Level & Saran Kelas"]
    I --> J["Klik Tombol 'Selesai & Keluar'"]
    J --> K["Reset status aplikasi ke Halaman Awal"]
```

**Catatan Komponen Layar (S3 - Result Screen):**
- **Hero Card Hasil:** Ilustrasi pencapaian, nama lengkap peserta, dan tanggal tes.
- **Metrik Pencapaian:**
  - Skor Persentase Besar (contoh: **`78%`**).
  - Rincian jumlah benar: (contoh: **`23 dari 30 Soal Benar`**).
- **Lencana Level Belajar (*Level Badge*):**
  - Badge tingkat level: **Beginner / Intermediate / Advanced**.
  - Kotak rekomendasi kelas & kurikulum belajar yang paling cocok.
- **Tombol Selesai:** Tombol *"Selesai & Keluar"* yang membersihkan sesi lokal browser agar perangkat siap digunakan oleh calon siswa berikutnya.

---

## B. Alur Admin Panel (Staf Lembaga)

### B1. Alur Autentikasi Admin


```mermaid
flowchart TD
    A(["Buka Portal Admin"]) --> B{"Sudah ada sesi login staf aktif?"}
    B -->|✅ Ya| C["Langsung buka Dashboard Admin"]
    B -->|❌ Tidak| D["Tampilkan Form Login Admin"]

    D --> E["Input Email Staf & Password"]
    E --> F["Klik Tombol Masuk"]

    F --> G{"Verifikasi Kredensial"}
    G -->|❌ Kredensial Salah| H["🔔 Muncul notifikasi error: Email atau password tidak sesuai"]
    H --> E
    G -->|✅ Kredensial Valid| C

    C --> I{"Admin klik tombol Keluar di Topbar?"}
    I -->|Ya| J["Hapus sesi autentikasi & redirect ke Form Login"]
```

**Catatan Komponen Layar (B1 - Login Page):**
- Logo resmi Up Speaking Learning Centre.
- Judul: *"Portal Administrator Placement Test"*.
- Input Field: Email dan Password (dengan toggle *Show/Hide Password*).
- Tombol CTA: *"Masuk ke Dashboard"*.

---

### B2. Alur Dashboard & Rekapitulasi Hasil

**Tujuan:** Memantau metrik pencapaian peserta secara real-time dan mengekspor riwayat nilai.

```mermaid
flowchart TD
    A[Buka Dashboard Admin] --> B[Tampilkan Kartu Statistik & Tabel Riwayat Siswa]

    B --> C{Admin memilih tindakan?}

    C -- Filter Level --> D[Pilih dropdown: Semua / Beginner / Intermediate / Advanced]
    D --> E[Tabel data ter-update otomatis secara real-time]

    C -- Pencarian Siswa --> F[Ketik Nama / No WhatsApp di Search Bar]
    F --> E

    C -- Klik 'Izinkan Tes Ulang' pada Baris Siswa --> J[🔔 Modal Konfirmasi: Izinkan siswa ini mengerjakan 1x tes ulang?]
    J -- Batal --> E
    J -- Ya, Izinkan --> K[Buka kembali izin akses pengerjaan untuk nomor WA siswa]
    K --> L[🔔 Toast Sukses: Akses tes ulang aktif! Siswa dapat membuka web tes kembali]
    L --> E

    E --> G{Admin klik aksi ekspor data?}

    G -- Ekspor Excel --> H[Unduh file .xlsx berisi data yang SEDANG TERFILTER di layar]
    H --> E

    G -- Ekspor PDF --> I[Unduh file .pdf cetak rapi berisi data yang SEDANG TERFILTER di layar]
    I --> E
```

**Catatan Komponen Layar (B2 - Dashboard):**
- **Sidebar Navigasi:** Menu Dashboard (Aktif), Bank Soal, Pengaturan Tes, dan Tombol Keluar.
- **Kartu Ringkasan (Top Metrics):**
  - Total Siswa Mengikuti Tes.
  - Jumlah Siswa Level Beginner.
  - Jumlah Siswa Level Intermediate.
  - Jumlah Siswa Level Advanced.
- **Toolbar Tabel & Filter:**
  - Search bar interaktif (Cari Nama atau Nomor WhatsApp).
  - Dropdown Filter Level (*Semua Level, Beginner, Intermediate, Advanced*).
  - Tombol Ekspor Fleksibel: *"Ekspor PDF"* dan *"Ekspor Excel"* (data yang diekspor otomatis mengikuti filter aktif).
- **Tabel Data Hasil:**
  - Kolom: No, Tanggal/Waktu Tes, Nama Lengkap Siswa, Nomor WhatsApp, Benar/Total, Skor (%), Badge Level, dan **Aksi**.
  - **Aksi Cepat per Siswa:** Tombol *"Izinkan Tes Ulang"* (ikon putar/refresh). Ketika diklik, membuka modal konfirmasi untuk memberikan izin 1x tes baru kepada nomor WhatsApp yang bersangkutan tanpa menghapus riwayat nilai lamanya.

---

### B3. Alur Manajemen Bank Soal (Dengan Opsi Jawaban Dinamis & Validasi Ketat)

**Tujuan:** Mengelola daftar butir soal pilihan ganda dengan fleksibilitas jumlah opsi jawaban per soal (dinamis) dan validasi kelengkapan data.

```mermaid
flowchart TD
    A["Klik Menu 'Bank Soal' di Sidebar"] --> B["Tampilkan Tabel Seluruh Soal Aktif"]

    B --> C{"Pilih Aksi Manajemen?"}

    C -->|Tambah Soal Baru| D["Buka Modal: Tambah Soal Baru (Form Kosong)"]
    C -->|Edit Soal| E["Buka Modal: Edit Soal (Form Terisi Data Lama)"]
    C -->|Hapus Soal| F["🔔 Modal Konfirmasi: Hapus butir soal ini?"]

    F -->|Batal| B
    F -->|Ya, Hapus| G["Hapus butir soal dari daftar & tampilkan Toast sukses"]
    G --> B

    D --> H["Input Teks Soal & Kelola Opsi Jawaban Dinamis"]
    E --> H

    H --> H1{"Admin atur jumlah opsi?"}
    H1 -->|Klik Tambah Pilihan| H2["Tambah baris opsi baru, misal opsi E"]
    H2 --> H
    H1 -->|Klik Hapus Opsi| H3["Hapus baris opsi terpilih, minimal sisa 2 opsi"]
    H3 --> H
    H1 -->|Opsi Cukup| I["Pilih 1 Radio Kunci Jawaban Benar & Klik Simpan Soal"]

    I --> J{"Validasi Kelengkapan Form Soal"}
    J -->|❌ Teks soal/opsi kosong| K["🔔 Inline Error: Teks pertanyaan dan seluruh opsi aktif wajib diisi!"]
    K --> H
    J -->|❌ Belum pilih kunci| L["🔔 Inline Error: Wajib memilih 1 opsi sebagai kunci jawaban benar!"]
    L --> H

    J -->|✅ Semua Terisi & Kunci Terpilih| M["Simpan data soal & tutup modal"]
    M --> N["🔔 Toast: Butir soal berhasil disimpan ke bank soal"]
    N --> B
```

**Catatan Komponen Layar (B3 - Bank Soal):**
- **Header:** Indikator total soal aktif & tombol aksi *"Tambah Soal Baru"*.
- **Tabel Butir Soal:** Kolom nomor urut, potongan teks pertanyaan, jumlah opsi, kunci jawaban benar, status aktif, dan tombol aksi (Edit & Hapus).
- **Modal Form Tambah / Edit Soal (Opsi Dinamis & Validasi Ketat):**
  - Textarea: *Teks Pertanyaan / Soal* (wajib diisi).
  - **Daftar Pilihan Jawaban Dinamis (*Flexible Options*):**
    - Default awal: 4 baris input (Opsi A, B, C, D).
    - Tombol *"+ Tambah Pilihan"* untuk menambah baris opsi baru (misal jika ingin 5 opsi A s.d. E).
    - Ikon Hapus (🗑️) di setiap baris opsi untuk mengurangi pilihan (batas minimal 2 opsi).
    - Radio Button Group: Terintegrasi di samping setiap baris opsi untuk memilih 1 kunci jawaban benar (otomatis sinkron dengan opsi yang ada).
  - Tombol *Simpan* akan mengecek validasi form sebelum mengirim data.
  - Tombol Batal untuk menutup modal tanpa menyimpan perubahan.

---

### B4. Alur Pengaturan Level & Durasi Tes

**Tujuan:** Mengatur durasi pengerjaan tes serta rentang persentase untuk masing-masing level kemampuan.

```mermaid
flowchart TD
    A["Klik Menu 'Pengaturan' di Sidebar"] --> B["Tampilkan Form Durasi & Kartu Konfigurasi 3 Level"]

    B --> C["Admin mengubah durasi tes (menit) atau rentang nilai tiap level"]
    C --> D["Klik Tombol 'Simpan Pengaturan'"]

    D --> E{"Validasi Rentang Nilai 0 - 100%?"}
    E -->|❌ Celah kosong / Tumpang tindih| F["🔔 Pesan Error: Rentang skor harus saling bersambung dari 0% hingga 100%!"]
    F --> C

    E -->|✅ Valid| G["Simpan konfigurasi ke sistem"]
    G --> H["🔔 Toast: Pengaturan berhasil diperbarui!"]
    H --> B
```

**Catatan Komponen Layar (B4 - Settings Page):**
- **Pengaturan Waktu:** Input angka durasi tes dalam satuan menit (default: 45 menit).
- **Pengaturan Rentang Level (3 Tingkat):**
  - **Level 1 (Beginner):** Rentang nilai minimum s.d. maksimum (%) + Teks saran kelas.
  - **Level 2 (Intermediate):** Rentang nilai minimum s.d. maksimum (%) + Teks saran kelas.
  - **Level 3 (Advanced):** Rentang nilai minimum s.d. maksimum (%) + Teks saran kelas.
- **Tombol Simpan:** *"Simpan Pengaturan"*.

---

## C. Peta Layar Lengkap (Sitemap)

Arsitektur navigasi antarmuka aplikasi Up Speaking Placement Test:

```mermaid
flowchart LR
    subgraph SISWA ["📱 Tampilan Siswa (PWA / Mobile Web)"]
        direction TB
        S1["S1. Registrasi & Cek Masuk"]
        S2["S2. Ruang Ujian Aktif"]
        S3["S3. Dialog Konfirmasi Selesai<br/>(Modal Popup)"]
        S4["S4. Halaman Hasil & Rekomendasi"]

        S1 -->|Validasi & Mulai| S2
        S2 -->|Kumpulkan / Waktu Habis| S3
        S3 -->|Konfirmasi Selesai| S4
        S4 -->|Selesai / Logout| S1
    end

    subgraph ADMIN ["🖥️ Tampilan Admin (Website Desktop)"]
        direction TB
        A1["A1. Login Staf"]
        A2["A2. Dashboard & Rekap Hasil"]
        A3["A3. Manajemen Bank Soal"]
        A4["A4. Pengaturan Level & Waktu"]

        A1 -->|Login Berhasil| A2
        A2 <-->|Sidebar Navigasi| A3
        A2 <-->|Sidebar| A4
        A3 <-->|Sidebar| A4
    end

    SISWA -. "Sinkronisasi Realtime & Rekapitulasi Nilai" .- ADMIN
```

---

### Ringkasan Jumlah Layar (Spesifikasi Final)

| Area | Nama Layar | Tipe Tampilan | Karakteristik Utama |
|---|---|---|---|
| **Siswa** | Landing Page & Registrasi | Halaman Penuh + Modal/Sheet | Landing page resmi, highlight info tes, & modal registrasi nama/WA |
| **Siswa** | Ruang Ujian (Exam Room) | Halaman Penuh | Timer countdown dinamis, auto-save status, drawer palet soal |
| **Siswa** | Dialog Konfirmasi Submit | Modal Pop-up Dialog | Peringatan jika ada soal yang belum terjawab |
| **Siswa** | Hasil Level & Rekomendasi | Halaman Penuh | Skor persentase, total benar, badge level, tombol reset sesi |
| **Admin** | Autentikasi Admin (Login) | Halaman Penuh | Form login staf lembaga |
| **Admin** | Dashboard Rekap Nilai | Halaman Penuh (Sidebar + Table) | Kartu ringkasan level, filter dinamis, ekspor PDF/Excel tersaring, & tombol izin tes ulang |
| **Admin** | Manajemen Bank Soal | Halaman Penuh (Sidebar + Modal) | Opsi jawaban dinamis (+ Tambah Opsi / Hapus) & validasi kunci |
| **Admin** | Pengaturan Level & Waktu | Halaman Penuh (Sidebar + Form) | Konfigurasi durasi menit & rentang 0-100% terpadu |
