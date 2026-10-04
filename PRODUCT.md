# Product

<!-- impeccable:product-schema 1 -->

## Platform

web

## Users

- **Calon Siswa Lembaga Up Speaking:**
  - Siswa usia sekolah dasar (jenjang *Elementary*).
  - Siswa SMP, SMA, mahasiswa, dan masyarakat umum (jenjang *High School*).
  - Mengakses ujian secara mandiri menggunakan smartphone (mobile web/PWA) tanpa perlu membuat akun atau mengingat password.
- **Orang Tua Siswa:**
  - Mendaftarkan satu atau lebih anak (misal: kakak dan adik) menggunakan satu nomor WhatsApp yang sama.
- **Admin / Staf Lembaga Up Speaking:**
  - Mengakses melalui perangkat desktop untuk memantau rekap nilai siswa secara realtime, mengelola bank soal per jenjang, mengatur kontak tutor, dan memberikan izin tes ulang bagi siswa tertentu.

## Product Purpose

- Mengotomatisasi seluruh alur tes penempatan (*placement test*) bahasa Inggris di Up Speaking Learning Centre yang sebelumnya manual (kertas fisik).
- Menyajikan penentuan level awal (*Beginner*, *Intermediate*, *Advanced*) secara instan, akurat, dan objektif menggunakan matrix kombinasi akurasi skor (%) dan efisiensi durasi pengerjaan (menit).
- Mengarahkan calon siswa langsung ke tutor penanggung jawab jenjang bersangkutan melalui WhatsApp untuk penjadwalan kelas les.

## Positioning

Placement test digital berbasis PWA yang *zero friction* (tanpa login/password), adil (pengacakan soal Fisher-Yates), terarah sesuai jenjang usia (*Elementary* vs *High School*), dan mengukur kecakapan bahasa secara menyeluruh melalui akurasi dan kecepatan pengerjaan.

## Operating Context

- Siswa mengerjakan tes pilihan ganda secara mandiri dalam durasi 15–25 menit.
- Ketahanan sesi pengerjaan (*crash recovery*) dan auto-save realtime melindungi jawaban siswa jika browser tertutup atau sinyal terputus.
- Waktu ujian diikat pada jam server (*server timestamp*) sehingga sisa waktu tidak dapat dimanipulasi dengan menutup tab.
- Hasil tes langsung menampilkan rekomendasi kelas dan kontak WhatsApp tutor penanggung jawab jenjang.

## Capabilities and Constraints

- **Identitas Siswa:** Input Nama Lengkap, Nomor WhatsApp, dan Jenjang Pendidikan (*Elementary* / *High School*).
- **Integritas Sesi Permanen:** Kunci sesi diikat pada pasangan `(Nomor WhatsApp + Nama Lengkap Siswa)`. Siswa yang telah menyelesaikan tes terkunci secara permanen untuk mencegah manipulasi, kecuali Admin memberikan izin tes ulang (*Retest Permission*) di dashboard.
- **Pengacakan Fisher-Yates:** Soal dan urutan opsi jawaban diacak secara adil dan seragam per siswa.
- **Matrix Penilaian Level:**
  - *Advanced:* Skor 80% – 100% dan durasi pengerjaan maksimal 25 menit (<= 25 menit).
  - *Intermediate:* Skor 60% – 79% dan durasi pengerjaan maksimal 20 menit (<= 20 menit), ATAU skor 80% – 100% dengan durasi lebih dari 25 menit (> 25 menit).
  - *Beginner:* Skor 0% – 59% (durasi berapa pun), ATAU skor 60% – 79% dengan durasi lebih dari 20 menit (> 20 menit).
- **Bank Soal Terklasifikasi:** Setiap butir soal memiliki penanda jenjang (*Elementary* atau *High School*) dan opsi jawaban dinamis (2 s.d. 5 opsi). Kunci jawaban (`is_correct`) 100% diproses di server dan tidak dibocorkan ke browser.
- **Admin Panel:** Autentikasi email/password Supabase Auth, dashboard statistik, rekap riwayat nilai dengan pencarian/filter jenjang & level, ekspor PDF/Excel terfilter, dan pengaturan durasi, matrix level, serta kontak tutor penanggung jawab per jenjang.

## Brand Commitments

- Nama lembaga: **Up Speaking Learning Centre**.
- Logo resmi tersimpan di `assets/logo/` (paduan warna Navy, Sky Blue, dan Coral Red).
- Kebebasan estetika penuh diberikan kepada perancang UI dalam eksplorasi palet warna, tipografi, layout visual, dan mikro-interaksi modern, dengan batasan mutlak bahwa struktur alur dan fungsi inti di `UI_FLOW.md` dan `PRD.md` tetap terkunci.

## Evidence on Hand

- Aset logo resmi Up Speaking di `assets/logo/` dan `public/`.
- Dokumen persyaratan komprehensif di `PRD.md`.
- Dokumen alur layar dan navigasi lengkap di `UI_FLOW.md`.
- Checklist rencana pengerjaan terstruktur di `TASK_BREAKDOWN.md`.
- Pedoman kerja AI di `AGENTS.md`.

## Product Principles

1. **Zero Friction:** Siswa dapat langsung memulai tes dalam hitungan detik tanpa registrasi password yang membebani.
2. **Simpel, Bersih, dan Tanpa Overengineering:** Fokus menyelesaikan alur pengerjaan dan rekap nilai secara solid tanpa dependensi rumit.
3. **Integritas Waktu & Evaluasi Server:** Penilaian skor, durasi pengerjaan, dan validasi kunci dilakukan 100% di sisi server.
4. **Human-Centric & Actionable:** Hasil tes langsung memberi arahan kelas yang jelas dan menghubungkan siswa dengan tutor yang tepat via WhatsApp.

## Accessibility & Inclusion

- Antarmuka *mobile-first* dengan target sentuh kartu pilihan jawaban yang ramah jari ponsel (*large tap targets*).
- Hirarki visual dan kontras teks yang nyaman dibaca pada layar smartphone.
- Bahasa pengantar instruksi antarmuka menggunakan Bahasa Indonesia yang ramah dan jelas, dengan butir soal berbahasa Inggris.
