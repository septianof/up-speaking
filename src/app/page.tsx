'use client';

import Image from 'next/image';
import Link from 'next/link';
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import RegisterModal from '@/components/student/RegisterModal';
import { Clock } from 'lucide-react';

export default function LandingPage() {
  const router = useRouter();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isRedirecting, setIsRedirecting] = useState(false);

  // Auto-Redirect ke /exam jika ada sesi ujian aktif yang belum selesai (Crash Recovery STU-06 & FIN-02)
  useEffect(() => {
    try {
      if (typeof window === 'undefined') return;
      const stored = localStorage.getItem('upspeaking_session');
      if (stored) {
        const parsed = JSON.parse(stored);
        if (parsed?.end_time && new Date(parsed.end_time).getTime() > Date.now()) {
          setIsRedirecting(true);
          router.replace('/exam');
          return;
        } else {
          // Sesi sudah kadaluarsa, bersihkan storage
          localStorage.removeItem('upspeaking_session');
          localStorage.removeItem('upspeaking_answers');
          localStorage.removeItem('upspeaking_questions');
          localStorage.removeItem('upspeaking_current_index');
        }
      }
    } catch (err) {
      console.error('Error membaca sesi aktif:', err);
    }
  }, [router]);

  if (isRedirecting) {
    return (
      <div className="min-h-screen bg-[#f8fafc] flex flex-col items-center justify-center p-4">
        <div className="w-16 h-16 rounded-2xl bg-amber-50 border border-amber-200 flex items-center justify-center mb-4 shadow-sm animate-pulse">
          <Clock className="w-8 h-8 text-amber-600" />
        </div>
        <h2 className="text-base sm:text-lg font-bold text-slate-800">Melanjutkan Sesi Ujian...</h2>
        <p className="text-xs sm:text-sm text-slate-500 mt-1">Mengarahkan kembali ke lembar pengerjaan soal</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white text-slate-800 flex flex-col justify-between selection:bg-rose-100 selection:text-rose-900">
      {/* ========================================================================= */}
      {/* 1. TOP NAVBAR                                                             */}
      {/* ========================================================================= */}
      <header className="w-full bg-white/95 backdrop-blur-sm sticky top-0 z-40 border-b border-slate-100">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 h-20 flex items-center justify-between">
          {/* Logo & Brand */}
          <Link href="/" className="flex items-center gap-3 group focus:outline-none">
            <div className="relative w-10 h-10 sm:w-11 sm:h-11 flex-shrink-0 transition-transform group-hover:scale-105 duration-200">
              <Image
                src="/logo/logo_transparent.png"
                alt="Up Speaking Logo"
                fill
                sizes="(max-width: 640px) 40px, 44px"
                className="object-contain"
                priority
              />
            </div>
            <div className="flex flex-col">
              <span className="font-extrabold text-xl sm:text-2xl text-[#1e3a8a] tracking-tight leading-none">
                Up Speaking
              </span>
              <span className="font-medium text-xs sm:text-sm text-[#0284c7] tracking-normal leading-tight mt-0.5">
                Learning Centre
              </span>
            </div>
          </Link>

          {/* Status Badge: Sistem Aktif */}
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full text-xs sm:text-sm font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200/80 shadow-xs">
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
            </span>
            <span>Sistem Aktif</span>
          </div>
        </div>
      </header>

      {/* ========================================================================= */}
      {/* 2. HERO SECTION                                                           */}
      {/* ========================================================================= */}
      <main className="flex-1">
        <section className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 pt-8 sm:pt-16 md:pt-20 pb-8 sm:pb-10 text-center">
          {/* Official Tag Pill */}
          <div className="inline-flex items-center gap-2 px-3.5 sm:px-4 py-1 sm:py-1.5 rounded-full text-[11px] sm:text-sm font-medium bg-[#e0f2fe] text-[#0369a1] border border-[#bae6fd] mb-5 sm:mb-6 shadow-xs animate-fade-in">
            <span className="w-1.5 h-1.5 sm:w-2 sm:h-2 rounded-full bg-[#0284c7]"></span>
            <span>Official English Placement Test System</span>
          </div>

          {/* Main Headline */}
          <h1 className="text-2xl sm:text-4xl md:text-5xl lg:text-6xl font-extrabold text-[#0f172a] tracking-tight leading-[1.2] sm:leading-[1.15] mb-4 sm:mb-6 max-w-4xl mx-auto px-2 sm:px-0">
            Ukur Kemampuan Berbicara &amp; Temukan Level Terbaikmu
          </h1>

          {/* Subtitle / Description */}
          <p className="text-slate-600 text-xs sm:text-base md:text-lg max-w-xs sm:max-w-2xl mx-auto leading-relaxed mb-6 sm:mb-8 px-1 sm:px-0">
            Evaluasi terstruktur untuk memetakan kemampuan <em className="not-italic italic font-medium">Grammar</em>,{' '}
            <em className="not-italic italic font-medium">Vocabulary</em>, dan pemahaman kontekstual sebelum memulai pelatihan berbicara di{' '}
            <strong className="font-semibold text-slate-900">Up Speaking</strong>.
          </p>

          {/* Primary CTA Button */}
          <div className="flex flex-col items-center justify-center">
            <button
              type="button"
              onClick={() => setIsModalOpen(true)}
              className="inline-flex items-center justify-center gap-2 px-6 sm:px-8 py-3.5 sm:py-4 text-sm sm:text-base md:text-lg font-bold text-white bg-gradient-to-r from-[#e11d48] to-[#f43f5e] hover:from-[#be123c] hover:to-[#e11d48] rounded-2xl shadow-lg shadow-rose-500/25 hover:shadow-rose-500/40 transform hover:-translate-y-0.5 active:translate-y-0 transition-all duration-200 cursor-pointer focus:outline-none focus:ring-4 focus:ring-rose-200"
            >
              <span>Ikuti Placement Test Sekarang</span>
              <span className="text-lg sm:text-xl">👉</span>
            </button>

            {/* Micro Highlights */}
            <p className="text-[11px] sm:text-sm text-slate-400 font-medium mt-3 sm:mt-4 max-w-[280px] sm:max-w-none mx-auto leading-normal">
              Gratis • Tanpa perlu pembuatan akun • Hasil evaluasi instan
            </p>
          </div>
        </section>

        {/* ======================================================================= */}
        {/* 3. FITUR UTAMA TES (3 CARDS GRID)                                       */}
        {/* ======================================================================= */}
        <section className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 my-8 md:my-14">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* Card 1: Durasi */}
            <div className="bg-white rounded-3xl border border-slate-100 p-6 sm:p-7 shadow-[0_4px_24px_-4px_rgba(0,0,0,0.04)] hover:shadow-md transition-shadow">
              <div className="w-12 h-12 rounded-2xl bg-indigo-50/80 flex items-center justify-center text-xl mb-4">
                ⏱️
              </div>
              <h2 className="font-bold text-slate-900 text-lg mb-2">
                Durasi ~45 Menit
              </h2>
              <p className="text-slate-500 text-sm leading-relaxed">
                Dilengkapi penghitung waktu mundur otomatis dan penyimpanan jawaban berkala (<em>*auto-save*</em>).
              </p>
            </div>

            {/* Card 2: Format Soal */}
            <div className="bg-white rounded-3xl border border-slate-100 p-6 sm:p-7 shadow-[0_4px_24px_-4px_rgba(0,0,0,0.04)] hover:shadow-md transition-shadow">
              <div className="w-12 h-12 rounded-2xl bg-rose-50/80 flex items-center justify-center text-xl mb-4">
                📝
              </div>
              <h2 className="font-bold text-slate-900 text-lg mb-2">
                Format Pilihan Ganda
              </h2>
              <p className="text-slate-500 text-sm leading-relaxed">
                Soal dirancang khusus dengan pengacakan butir untuk mengukur kesiapan berbicara secara objektif.
              </p>
            </div>

            {/* Card 3: Hasil & Level */}
            <div className="bg-white rounded-3xl border border-slate-100 p-6 sm:p-7 shadow-[0_4px_24px_-4px_rgba(0,0,0,0.04)] hover:shadow-md transition-shadow">
              <div className="w-12 h-12 rounded-2xl bg-teal-50/80 flex items-center justify-center text-xl mb-4">
                🎯
              </div>
              <h2 className="font-bold text-slate-900 text-lg mb-2">
                Hasil &amp; Level Instan
              </h2>
              <p className="text-slate-500 text-sm leading-relaxed">
                Skor langsung keluar lengkap dengan lencana (Beginner, Intermediate, atau Advanced) &amp; saran kelas.
              </p>
            </div>
          </div>
        </section>

        {/* ======================================================================= */}
        {/* 4. PETUNJUK & INTEGRITAS UJIAN                                          */}
        {/* ======================================================================= */}
        <section className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 mb-16 md:mb-20">
          <div className="bg-white rounded-3xl border border-slate-100 p-6 sm:p-8 md:p-9 shadow-[0_4px_24px_-4px_rgba(0,0,0,0.04)]">
            <div className="flex items-center gap-2.5 mb-6">
              <span className="w-2 h-2 rounded-full bg-[#0284c7]"></span>
              <h2 className="text-xs sm:text-sm font-bold tracking-wider text-slate-500 uppercase">
                Petunjuk &amp; Integritas Ujian
              </h2>
            </div>
            <ol className="space-y-4 text-sm sm:text-base text-slate-700">
              <li className="flex items-start gap-3 leading-relaxed">
                <span className="font-bold text-emerald-600 shrink-0">1.</span>
                <span>
                  Kerjakan secara mandiri tanpa kamus atau bantuan pihak lain agar penempatan kelas belajar Anda akurat.
                </span>
              </li>
              <li className="flex items-start gap-3 leading-relaxed">
                <span className="font-bold text-emerald-600 shrink-0">2.</span>
                <span>
                  Jika browser tidak sengaja tertutup, Anda dapat kembali ke halaman ini dan melanjutkan ujian tanpa kehilangan progres.
                </span>
              </li>
              <li className="flex items-start gap-3 leading-relaxed">
                <span className="font-bold text-emerald-600 shrink-0">3.</span>
                <span>
                  Satu nomor WhatsApp hanya berlaku untuk 1× kesempatan tes resmi (sistem anti-duplikasi).
                </span>
              </li>
            </ol>
          </div>
        </section>
      </main>

      {/* ========================================================================= */}
      {/* 5. FOOTER RESMI                                                           */}
      {/* ========================================================================= */}
      <footer className="border-t border-slate-100 bg-white py-6 md:py-8">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs sm:text-sm text-slate-500">
          {/* Left: Branding */}
          <div className="flex items-center gap-2.5">
            <div className="relative w-6 h-6 flex-shrink-0">
              <Image
                src="/logo/logo_transparent.png"
                alt="Up Speaking Logo"
                fill
                sizes="24px"
                className="object-contain"
              />
            </div>
            <span className="font-semibold text-slate-700">Up Speaking Learning Centre</span>
          </div>

          {/* Right: Copyright */}
          <p className="text-center sm:text-right text-slate-400 font-normal">
            &copy; 2026 Up Speaking. Placement Test Evaluation System.
          </p>
        </div>
      </footer>

      {/* Modal / Bottom Sheet Pendaftaran Siswa (STU-02) */}
      <RegisterModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
      />
    </div>
  );
}
