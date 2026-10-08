'use client';

import React, { useEffect, useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Loader2, ArrowRight, UserX, AlertCircle, CheckCircle } from 'lucide-react';
import { startSession } from '@/app/actions/session';

export default function LandingPage() {
  const router = useRouter();

  // Modal / Bottom Sheet visibility
  const [isRegisterOpen, setIsRegisterOpen] = useState(false);

  // Active Session state (Crash Recovery)
  const [hasActiveSession, setHasActiveSession] = useState(false);
  const [activeSessionName, setActiveSessionName] = useState<string>('');

  // Form states
  const [name, setName] = useState('');
  const [whatsapp, setWhatsapp] = useState('');
  const [nameError, setNameError] = useState('');
  const [phoneError, setPhoneError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [generalError, setGeneralError] = useState<string | null>(null);

  // Status dialog for Not Registered or Session Blocked (Anti-Fraud)
  const [statusDialog, setStatusDialog] = useState<{
    type: 'not_registered' | 'session_blocked';
    title: string;
    message: string;
  } | null>(null);

  // Cek Sesi Aktif di Local Storage (Crash Recovery)
  useEffect(() => {
    try {
      if (typeof window !== 'undefined') {
        const stored = localStorage.getItem('upspeaking_session');
        if (stored) {
          const parsed = JSON.parse(stored);
          if (parsed?.id && parsed?.studentName) {
            setHasActiveSession(true);
            setActiveSessionName(parsed.studentName);
          }
        }
      }
    } catch (err) {
      console.error('Error saat memeriksa sesi aktif:', err);
    }
  }, []);

  // IntersectionObserver untuk efek scroll-reveal
  useEffect(() => {
    const revealElements = document.querySelectorAll<HTMLElement>('[data-scroll-reveal]');

    if (!('IntersectionObserver' in window)) {
      revealElements.forEach((element) => element.classList.add('is-visible'));
      return;
    }

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (!entry.isIntersecting) return;
          entry.target.classList.add('is-visible');
          observer.unobserve(entry.target);
        });
      },
      {
        threshold: 0.12,
        rootMargin: '0px 0px -6% 0px',
      }
    );

    revealElements.forEach((element) => observer.observe(element));

    return () => observer.disconnect();
  }, []);

  const handleResumeExam = () => {
    router.push('/exam');
  };

  const handleNameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const filtered = e.target.value.replace(/[^a-zA-Z\s'.\-]/g, '');
    setName(filtered);
    if (nameError) setNameError('');
    if (generalError) setGeneralError(null);
  };

  const handlePhoneChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const digitsOnly = e.target.value.replace(/\D/g, '').slice(0, 15);
    setWhatsapp(digitsOnly);
    if (phoneError) setPhoneError('');
    if (generalError) setGeneralError(null);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setNameError('');
    setPhoneError('');
    setGeneralError(null);
    setStatusDialog(null);

    const trimmedName = name.trim();
    const cleanPhone = whatsapp.replace(/\D/g, '');

    let hasError = false;

    if (!trimmedName || trimmedName.length < 2) {
      setNameError('Nama lengkap minimal 2 karakter.');
      hasError = true;
    }

    if (!cleanPhone || cleanPhone.length < 9) {
      setPhoneError('Nomor WhatsApp tidak valid (minimal 9 digit).');
      hasError = true;
    }

    if (hasError) return;

    try {
      setIsLoading(true);

      const result = await startSession(trimmedName, cleanPhone);

      if (!result.success) {
        setIsLoading(false);

        if (result.code === 'NOT_REGISTERED') {
          setStatusDialog({
            type: 'not_registered',
            title: 'Data Belum Terdaftar di Meja Registrasi',
            message:
              result.error ||
              `Data atas nama "${trimmedName}" dengan nomor WhatsApp ini belum terdaftar di sistem. Silakan temui staf Up Speaking di meja pendaftaran untuk registrasi terlebih dahulu.`,
          });
          return;
        }

        if (result.code === 'SESSION_BLOCKED') {
          setStatusDialog({
            type: 'session_blocked',
            title: 'Anda Sudah Pernah Mengikuti Tes',
            message:
              result.error ||
              `Anda telah menyelesaikan tes penempatan sebelumnya. Hasil pengerjaan Anda sedang atau telah dievaluasi oleh Tutor kami. Hubungi staf/tutor jika Anda memerlukan izin tes ulang.`,
          });
          return;
        }

        setGeneralError(result.error || 'Gagal memulai sesi.');
        return;
      }

      // Simpan session & questions ke LocalStorage untuk Crash Recovery
      if (typeof window !== 'undefined') {
        localStorage.setItem('upspeaking_session', JSON.stringify(result.session));
        localStorage.setItem('upspeaking_questions', JSON.stringify(result.questions));
        if (result.savedAnswers) {
          localStorage.setItem('upspeaking_answers', JSON.stringify(result.savedAnswers));
        } else {
          localStorage.removeItem('upspeaking_answers');
        }
      }

      setIsRegisterOpen(false);
      router.push('/exam');
    } catch (err) {
      console.error('Error saat memulai sesi:', err);
      setGeneralError('Terjadi gangguan koneksi. Silakan periksa jaringan Anda.');
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-white text-slate-900 selection:bg-rose-200 selection:text-rose-950">
      <main>
        {/* ========================================================================= */}
        {/* 1. HERO SECTION (Figma AI Notched Canvas with Hero Photo & Gradient)       */}
        {/* ========================================================================= */}
        <section className="hero-notched relative z-10 min-h-[790px] overflow-hidden bg-[#0f2e60] sm:min-h-[850px]">
          {/* Background Photo */}
          <div className="absolute inset-0 z-0">
            <Image
              src="/landing/students-hero.jpg"
              alt="Sekelompok siswa Up Speaking belajar dan berdiskusi bersama"
              fill
              priority
              sizes="100vw"
              className="object-cover object-right sm:object-[78%_center] filter brightness-[0.93]"
            />
          </div>

          {/* Dual Linear Gradient Overlays */}
          <div className="absolute inset-0 z-1 bg-[linear-gradient(90deg,rgba(5,24,54,0.96)_0%,rgba(7,32,69,0.85)_42%,rgba(4,18,41,0.20)_78%),linear-gradient(0deg,rgba(4,17,38,0.85)_0%,transparent_48%)]" />

          {/* ===================================================================== */}
          {/* TOP NAVBAR (Pill Glassmorphic Floating Header)                        */}
          {/* ===================================================================== */}
          <header className="motion-fade-down relative z-20 px-4 py-5 sm:px-8 lg:px-12">
            <div className="mx-auto flex max-w-7xl items-center justify-between rounded-full border border-white/20 bg-white/10 px-3.5 py-2.5 shadow-2xl backdrop-blur-md sm:px-5">
              {/* Brand Logo & Name */}
              <Link href="/" className="flex items-center gap-2.5 focus:outline-none group">
                <span className="flex h-10 w-10 items-center justify-center rounded-full bg-white shadow-md p-1 transition-transform group-hover:scale-105">
                  <Image
                    src="/logo/logo_transparent.png"
                    alt="Up Speaking Logo"
                    width={32}
                    height={32}
                    className="h-8 w-8 object-contain"
                    priority
                  />
                </span>
                <span className="hidden text-sm font-extrabold tracking-tight text-white sm:block">
                  Up Speaking
                </span>
              </Link>

              {/* Navigation Anchor Links */}
              <nav className="hidden items-center gap-8 text-xs font-semibold text-white/85 md:flex">
                <button
                  type="button"
                  onClick={() =>
                    document.getElementById('tentang-tes')?.scrollIntoView({ behavior: 'smooth' })
                  }
                  className="cursor-pointer transition-colors hover:text-white"
                >
                  Tentang Tes
                </button>
                <button
                  type="button"
                  onClick={() =>
                    document.getElementById('cara-kerja')?.scrollIntoView({ behavior: 'smooth' })
                  }
                  className="cursor-pointer transition-colors hover:text-white"
                >
                  Cara Kerja
                </button>
                <button
                  type="button"
                  onClick={() =>
                    document.getElementById('ketentuan')?.scrollIntoView({ behavior: 'smooth' })
                  }
                  className="cursor-pointer transition-colors hover:text-white"
                >
                  Ketentuan
                </button>
              </nav>

              {/* Top CTA Button */}
              <button
                type="button"
                onClick={() => setIsRegisterOpen(true)}
                className="cursor-pointer rounded-full bg-white px-5 py-2.5 text-xs font-extrabold text-[#0f2e60] shadow-lg transition-transform hover:-translate-y-0.5 active:translate-y-0 focus:outline-none"
              >
                Mulai Tes
              </button>
            </div>
          </header>

          {/* ===================================================================== */}
          {/* HERO BODY TEXT & ACTIVE SESSION CARD                                   */}
          {/* ===================================================================== */}
          <div className="relative z-10 mx-auto flex min-h-[640px] max-w-7xl flex-col justify-center px-5 pb-28 pt-8 sm:px-8 lg:px-12">
            {/* Active Session Notification (Crash Recovery) */}
            {hasActiveSession && (
              <div className="mb-6 flex max-w-xl flex-col items-start justify-between gap-3.5 rounded-3xl border border-cyan-300/35 bg-white/15 p-4.5 text-white shadow-2xl backdrop-blur-md sm:flex-row sm:items-center animate-fade-in">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="relative flex h-2 w-2">
                      <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-cyan-400 opacity-75"></span>
                      <span className="relative inline-flex rounded-full h-2 w-2 bg-cyan-300"></span>
                    </span>
                    <p className="text-[10px] font-extrabold uppercase tracking-[0.22em] text-cyan-200">
                      Sesi Aktif Ditemukan
                    </p>
                  </div>
                  <p className="mt-1 text-xs sm:text-sm font-semibold text-white/95">
                    Lanjutkan tes atas nama <span className="text-cyan-200 font-bold">{activeSessionName || 'Peserta'}</span>.
                  </p>
                </div>
                <button
                  type="button"
                  onClick={handleResumeExam}
                  className="w-full cursor-pointer rounded-full bg-white px-5 py-2.5 text-xs font-extrabold text-[#0f2e60] shadow-md transition-all hover:bg-cyan-50 sm:w-auto"
                >
                  Lanjutkan Tes →
                </button>
              </div>
            )}

            <div className="max-w-4xl">
              <p className="motion-fade-up mb-4 sm:mb-5 text-xs font-bold uppercase tracking-[0.28em] text-cyan-300">
                Official placement test
              </p>
              <h1 className="font-fun motion-fade-up motion-delay-1 max-w-4xl text-5xl font-bold leading-[0.96] tracking-[-0.035em] text-white sm:text-7xl lg:text-[88px]">
                Know where your <br className="hidden sm:inline" />English belongs.
              </h1>
              <p className="motion-fade-up motion-delay-2 mt-6 sm:mt-7 max-w-xl text-sm font-medium leading-7 text-white/80 sm:text-base">
                Temukan level bahasa Inggrismu melalui evaluasi singkat yang terukur, nyaman, dan dirancang untuk langkah belajar berikutnya.
              </p>
            </div>

            <p className="motion-fade-up motion-delay-3 mt-8 sm:mt-9 text-xs font-semibold text-white/65">
              Gratis · Tanpa akun · Hasil langsung
            </p>
          </div>

          {/* ===================================================================== */}
          {/* FLOATING BADGE (Glassmorphism & Info Level Penempatan Resmi)          */}
          {/* ===================================================================== */}
          <div className="absolute bottom-28 sm:bottom-32 right-5 z-20 hidden w-60 sm:w-64 rounded-[2rem] border border-white/30 bg-gradient-to-b from-white/20 to-white/10 p-5 sm:p-6 text-white shadow-[0_8px_32px_0_rgba(0,0,0,0.35)] backdrop-blur-xl ring-1 ring-white/10 sm:block lg:right-12">
            <div className="flex items-center justify-between">
              <span className="relative flex h-2.5 w-2.5">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-emerald-400 shadow-[0_0_10px_rgba(52,211,153,0.9)]"></span>
              </span>
              <span className="text-[11px] font-extrabold uppercase tracking-[0.2em] text-white/80">
                Evaluasi Resmi
              </span>
            </div>
            <p className="font-fun text-5xl font-bold tracking-tight text-white mt-4 sm:mt-5">
              3 Level
            </p>
            <p className="mt-2 text-xs sm:text-sm font-medium text-white/85 leading-snug">
              Beginner · Intermediate · Advanced
            </p>
          </div>

          {/* ===================================================================== */}
          {/* FLOATING PRIMARY CTA PILL (Tengah Bawah di Dalam Tab Notch)           */}
          {/* ===================================================================== */}
          <button
            type="button"
            onClick={() => setIsRegisterOpen(true)}
            className="motion-cta-glow group absolute bottom-1.5 left-1/2 z-20 flex w-[min(76vw,320px)] -translate-x-1/2 cursor-pointer items-center justify-between rounded-full bg-white py-2 pl-6 pr-2 text-sm font-bold text-[#0f2e60] shadow-2xl transition-transform hover:-translate-x-1/2 hover:-translate-y-0.5 focus:outline-none"
          >
            <span>Ikuti Placement Test</span>
            <span className="flex h-10 w-10 items-center justify-center rounded-full bg-[#0f2e60] text-lg text-white transition-transform group-hover:translate-x-0.5">
              →
            </span>
          </button>
        </section>

        {/* ========================================================================= */}
        {/* 2. SECTION TENTANG TES (Confidence Starts With Knowing Where You Stand)    */}
        {/* ========================================================================= */}
        <section
          id="tentang-tes"
          className="relative z-0 -mt-11 bg-white px-5 pt-28 pb-20 sm:px-8 sm:pt-32 sm:pb-28 lg:px-12 scroll-mt-6"
        >
          <div className="mx-auto grid max-w-7xl items-center gap-12 lg:grid-cols-[0.9fr_1.1fr] lg:gap-20">
            <div data-scroll-reveal className="scroll-reveal reveal-left">
              <p className="text-xs font-extrabold uppercase tracking-[0.24em] text-sky-600">
                Mulai dengan percaya diri
              </p>
              <h2 className="font-fun mt-5 text-4xl font-bold leading-[1.03] tracking-[-0.045em] text-[#0f2e60] sm:text-6xl">
                Confidence starts with knowing where you stand.
              </h2>
              <p className="mt-7 max-w-lg text-sm leading-7 text-slate-600 sm:text-base">
                Placement test ini membantu memetakan kemampuan bahasa Inggrismu secara objektif sebelum belajar. Kerjakan dengan jujur, dan sistem akan menampilkan levelmu sesaat setelah tes selesai.
              </p>
              <button
                type="button"
                onClick={() => setIsRegisterOpen(true)}
                className="mt-8 inline-flex items-center gap-2 cursor-pointer border-b-2 border-[#e11d48] pb-1 text-sm font-extrabold text-[#0f2e60] transition-colors hover:text-[#e11d48]"
              >
                <span>Mulai evaluasi sekarang</span>
                <span className="text-base font-bold">→</span>
              </button>
            </div>

            <div
              data-scroll-reveal
              className="scroll-reveal reveal-right reveal-delay-1 relative min-h-[390px] sm:min-h-[520px]"
            >
              <div className="absolute inset-y-0 right-0 h-full w-[86%] overflow-hidden rounded-[2.5rem] shadow-2xl">
                <Image
                  src="/landing/student-study.jpg"
                  alt="Siswa Up Speaking mempersiapkan diri untuk belajar bahasa Inggris"
                  fill
                  sizes="(max-width: 1024px) 86vw, 550px"
                  className="object-cover"
                />
              </div>

              {/* Floating 3 Levels Badge */}
              <div className="absolute bottom-6 left-0 max-w-[240px] rounded-3xl bg-[#0f2e60] p-5 text-white shadow-2xl ring-1 ring-white/10 sm:bottom-10 sm:p-6">
                <p className="font-fun text-4xl font-extrabold">3</p>
                <p className="mt-2 text-xs font-semibold leading-5 text-white/75">
                  Level hasil: Beginner, Intermediate, atau Advanced.
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* ========================================================================= */}
        {/* 3. SECTION CARA KERJA (Ringkas, Jelas, dan Tetap Terukur)                  */}
        {/* ========================================================================= */}
        <section
          id="cara-kerja"
          className="border-y border-sky-200 bg-sky-100/70 px-5 py-20 sm:px-8 sm:py-28 lg:px-12 scroll-mt-6"
        >
          <div className="mx-auto max-w-7xl">
            <div
              data-scroll-reveal
              className="scroll-reveal reveal-up mb-10 flex flex-col justify-between gap-6 sm:mb-14 sm:flex-row sm:items-end"
            >
              <div>
                <p className="text-xs font-extrabold uppercase tracking-[0.24em] text-rose-600">
                  Built for your next step
                </p>
                <h2 className="font-fun mt-4 max-w-2xl text-4xl font-bold leading-tight tracking-[-0.045em] text-[#0f2e60] sm:text-6xl">
                  Ringkas, jelas, dan tetap terukur.
                </h2>
              </div>
              <p className="max-w-sm text-sm leading-6 text-slate-600">
                Satu alur sederhana untuk membantumu fokus pada jawaban, tanpa dibebani hal teknis yang rumit.
              </p>
            </div>

            <div className="grid gap-5 lg:grid-cols-[1.25fr_0.75fr]">
              {/* Card 01: Mulai */}
              <article
                data-scroll-reveal
                className="scroll-reveal reveal-left group relative min-h-[470px] overflow-hidden rounded-[2.5rem] bg-[#0f2e60] shadow-xl"
              >
                <Image
                  src="/landing/students-talk.jpg"
                  alt="Siswa berdiskusi dalam suasana belajar yang santai"
                  fill
                  sizes="(max-width: 1024px) 100vw, 700px"
                  className="object-cover transition-transform duration-700 group-hover:scale-105"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-slate-950/95 via-slate-950/25 to-transparent" />
                <div className="absolute inset-x-0 bottom-0 p-6 text-white sm:p-8">
                  <span className="text-xs font-bold uppercase tracking-[0.2em] text-cyan-300">
                    01 · Mulai
                  </span>
                  <h3 className="font-fun mt-3 text-3xl font-bold leading-snug">
                    Isi data, lalu fokus pada tesmu.
                  </h3>
                  <p className="mt-3 max-w-lg text-sm leading-6 text-white/75">
                    Masukkan nama dan nomor aktif yang telah didaftarkan staf. Tidak perlu membuat akun ataupun mengingat password.
                  </p>
                </div>
              </article>

              {/* Cards Right Column (02 & 03) */}
              <div
                data-scroll-reveal
                className="scroll-reveal reveal-right reveal-delay-1 grid gap-5 sm:grid-cols-2 lg:grid-cols-1"
              >
                {/* Card 02: Kerjakan */}
                <article className="rounded-[2.5rem] bg-[#0f2e60] p-7 text-white shadow-xl sm:p-8">
                  <div className="flex items-start justify-between">
                    <span className="text-xs font-bold uppercase tracking-[0.2em] text-cyan-300">
                      02 · Kerjakan
                    </span>
                    <span className="font-fun text-5xl font-extrabold text-white/10">
                      02
                    </span>
                  </div>
                  <h3 className="font-fun mt-10 text-2xl font-bold">
                    Jawab secara mandiri.
                  </h3>
                  <p className="mt-3 text-sm leading-6 text-white/70">
                    Pengerjaan bersifat santai dan mandiri tanpa batas waktu yang menekan. Progres jawaban tersimpan otomatis selama sesi aktif.
                  </p>
                </article>

                {/* Card 03: Dapatkan Hasil */}
                <article className="group relative min-h-[270px] overflow-hidden rounded-[2.5rem] bg-slate-900 shadow-xl">
                  <Image
                    src="/landing/student-laptop.jpg"
                    alt="Siswa melihat hasil evaluasi placement test melalui laptop"
                    fill
                    sizes="(max-width: 1024px) 100vw, 450px"
                    className="object-cover transition-transform duration-700 group-hover:scale-105"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-slate-950/95 via-slate-950/20 to-transparent" />
                  <div className="absolute inset-x-0 bottom-0 p-6 text-white">
                    <span className="text-xs font-bold uppercase tracking-[0.2em] text-rose-300">
                      03 · Dapatkan hasil
                    </span>
                    <h3 className="font-fun mt-2 text-xl font-bold">
                      Level tampil langsung.
                    </h3>
                  </div>
                </article>
              </div>
            </div>
          </div>
        </section>

        {/* ========================================================================= */}
        {/* 4. SECTION KETENTUAN (Hasil Terbaik Datang Dari Jawaban yang Jujur)         */}
        {/* ========================================================================= */}
        <section
          id="ketentuan"
          className="bg-[#0f2e60] px-5 py-20 text-white sm:px-8 lg:px-12 scroll-mt-6"
        >
          <div className="mx-auto grid max-w-7xl gap-12 lg:grid-cols-[0.8fr_1.2fr]">
            <div data-scroll-reveal className="scroll-reveal reveal-left">
              <p className="text-xs font-extrabold uppercase tracking-[0.24em] text-cyan-300">
                Sebelum memulai
              </p>
              <h2 className="font-fun mt-4 text-4xl font-bold leading-tight tracking-[-0.04em] sm:text-5xl">
                Hasil terbaik datang dari jawaban yang jujur.
              </h2>
            </div>
            <div
              data-scroll-reveal
              className="scroll-reveal reveal-right reveal-delay-1 divide-y divide-white/15 border-y border-white/15"
            >
              {[
                ['01', 'Kerjakan mandiri tanpa kamus atau bantuan pihak lain agar penempatan kelas tepat sasaran.'],
                [
                  '02',
                  'Jika browser tertutup tidak sengaja, buka kembali web ini untuk merestorasi status ujian (Crash Recovery).',
                ],
                [
                  '03',
                  'Pastikan Anda telah didaftarkan oleh staf di meja registrasi sebelum memulai pengerjaan tes.',
                ],
              ].map(([number, text]) => (
                <div key={number} className="flex gap-6 py-6">
                  <span className="font-fun text-xs font-extrabold text-cyan-300">
                    {number}
                  </span>
                  <p className="text-sm font-medium leading-6 text-white/80">
                    {text}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* ========================================================================= */}
        {/* 5. BOTTOM CTA BANNER (Ready to Find Your Level?)                           */}
        {/* ========================================================================= */}
        <section className="bg-[#e11d48] px-5 py-16 text-white sm:px-8 lg:px-12">
          <div
            data-scroll-reveal
            className="scroll-reveal reveal-up mx-auto flex max-w-7xl flex-col items-start justify-between gap-8 sm:flex-row sm:items-center"
          >
            <h2 className="font-fun max-w-3xl text-4xl font-bold leading-tight tracking-[-0.045em] sm:text-5xl">
              Ready to find your level?
            </h2>
            <button
              type="button"
              onClick={() => setIsRegisterOpen(true)}
              className="flex w-full cursor-pointer items-center justify-between gap-8 rounded-full bg-white px-7 py-4 text-sm font-extrabold text-[#e11d48] shadow-2xl transition-transform hover:-translate-y-1 active:translate-y-0 sm:w-auto"
            >
              <span>Mulai Placement Test</span>
              <span className="text-xl">→</span>
            </button>
          </div>
        </section>
      </main>

      {/* ========================================================================= */}
      {/* 6. FOOTER RESMI                                                           */}
      {/* ========================================================================= */}
      <footer className="bg-[#071a38] px-5 py-8 text-xs text-white/50 sm:px-8 lg:px-12">
        <div className="mx-auto flex max-w-7xl flex-col items-start justify-between gap-5 sm:flex-row sm:items-center">
          <div className="flex items-center gap-3">
            <span className="flex h-9 w-9 items-center justify-center rounded-full bg-white p-1">
              <Image
                src="/logo/logo_transparent.png"
                alt="Up Speaking"
                width={28}
                height={28}
                className="h-7 w-7 object-contain"
              />
            </span>
            <div>
              <p className="font-bold text-white text-sm">
                Up Speaking Learning Centre
              </p>
              <p className="mt-0.5 text-white/50">© 2026 Placement Test System</p>
            </div>
          </div>

          <Link
            href="/admin"
            className="cursor-pointer rounded-full border border-white/15 px-4 py-2 font-bold text-white/70 transition-colors hover:bg-white/10 hover:text-white"
            title="Akses Staf Administrator"
          >
            🔐 Staf Admin
          </Link>
        </div>
      </footer>

      {/* ========================================================================= */}
      {/* 7. MODAL (DESKTOP) / BOTTOM SHEET (MOBILE) - REGISTRASI VERIFIKASI SISWA   */}
      {/* ========================================================================= */}
      {isRegisterOpen && (
        <div
          role="dialog"
          aria-modal="true"
          className="modal-backdrop-in fixed inset-0 z-50 flex items-end justify-center bg-[#071a38]/80 p-0 backdrop-blur-md sm:items-center sm:p-4"
          onClick={(e) => {
            if (e.target === e.currentTarget && !isLoading) setIsRegisterOpen(false);
          }}
        >
          <div className="modal-fade-up max-h-[92vh] w-full max-w-md overflow-y-auto rounded-t-3xl border border-white/25 bg-[#0e2752]/95 p-6 text-white shadow-2xl shadow-slate-950/60 ring-1 ring-white/15 backdrop-blur-2xl sm:rounded-3xl sm:p-7">
            {/* Grab handle indicator mobile */}
            <div className="mx-auto mb-4 h-1.5 w-12 rounded-full bg-white/30 sm:hidden" />

            {/* Header Modal */}
            <div className="mb-5 flex items-start justify-between border-b border-white/15 pb-4">
              <div className="flex items-center gap-3">
                <span className="flex h-10 w-10 items-center justify-center rounded-full bg-white shadow-lg p-1">
                  <Image
                    src="/logo/logo_transparent.png"
                    alt="Up Speaking Logo"
                    width={32}
                    height={32}
                    className="h-8 w-8 object-contain"
                  />
                </span>
                <div>
                  <h3 className="text-base font-bold text-white">
                    Data Peserta Placement Test
                  </h3>
                  <p className="mt-0.5 text-xs text-white/60">
                    Masukkan nama & nomor aktif yang telah didaftarkan Admin
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setIsRegisterOpen(false)}
                disabled={isLoading}
                aria-label="Tutup form"
                className="flex h-8 w-8 cursor-pointer items-center justify-center rounded-full border border-white/10 bg-white/10 text-sm font-bold text-white/70 transition-colors hover:bg-white/20 hover:text-white"
              >
                ✕
              </button>
            </div>

            {/* General Error Alert */}
            {generalError && (
              <div className="mb-4 p-3.5 rounded-2xl bg-rose-500/20 border border-rose-400/40 text-rose-200 text-xs flex items-start gap-2.5 animate-fade-in">
                <AlertCircle className="w-4 h-4 text-rose-300 mt-0.5 flex-shrink-0" />
                <span className="leading-relaxed">{generalError}</span>
              </div>
            )}

            {/* Form */}
            <form onSubmit={handleSubmit} className="space-y-4">
              {/* Field: Nama Siswa */}
              <div>
                <label className="mb-1.5 block text-xs font-bold text-white/80">
                  Nama Lengkap Siswa <span className="text-rose-300">*</span>
                </label>
                <input
                  type="text"
                  placeholder="Contoh: Budi Pratama"
                  value={name}
                  disabled={isLoading}
                  onChange={handleNameChange}
                  className={`w-full rounded-xl border px-3.5 py-3 text-sm text-white outline-none placeholder:text-white/35 transition-all ${
                    nameError
                      ? 'border-rose-400/70 bg-rose-500/15 focus:ring-2 focus:ring-rose-400/30'
                      : 'border-white/20 bg-white/10 focus:border-cyan-300/70 focus:bg-white/15 focus:ring-2 focus:ring-cyan-300/20'
                  }`}
                  autoFocus
                />
                {nameError && (
                  <p className="mt-1 text-xs font-medium text-rose-300">{nameError}</p>
                )}
              </div>

              {/* Field: Nomor WA */}
              <div>
                <label className="mb-1.5 block text-xs font-bold text-white/80">
                  Nomor WhatsApp Aktif <span className="text-rose-300">*</span>
                </label>
                <input
                  type="tel"
                  inputMode="numeric"
                  placeholder="Contoh: 08123456789"
                  value={whatsapp}
                  disabled={isLoading}
                  onChange={handlePhoneChange}
                  className={`w-full rounded-xl border px-3.5 py-3 text-sm text-white outline-none placeholder:text-white/35 transition-all ${
                    phoneError
                      ? 'border-rose-400/70 bg-rose-500/15 focus:ring-2 focus:ring-rose-400/30'
                      : 'border-white/20 bg-white/10 focus:border-cyan-300/70 focus:bg-white/15 focus:ring-2 focus:ring-cyan-300/20'
                  }`}
                />
                {phoneError && (
                  <p className="mt-1 text-xs font-medium text-rose-300">{phoneError}</p>
                )}
                <p className="mt-1.5 text-[11px] text-white/50">
                  Hasil skor & rekomendasi level akan disesuaikan dengan nomor ini.
                </p>
              </div>



              {/* Submit CTA */}
              <div className="pt-2">
                <button
                  type="submit"
                  disabled={isLoading}
                  className="flex w-full cursor-pointer items-center justify-center gap-2 rounded-xl bg-white px-4 py-3.5 text-sm font-bold text-[#0f2e60] shadow-xl transition-all hover:bg-cyan-50 active:scale-[0.99] disabled:opacity-75 disabled:cursor-not-allowed"
                >
                  {isLoading ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin text-[#0f2e60]" />
                      <span>Memverifikasi Pendaftaran...</span>
                    </>
                  ) : (
                    <>
                      <span>Mulai Mengerjakan Ujian</span>
                      <span className="text-base font-bold">→</span>
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* 8. STATUS DIALOG: NOT REGISTERED / SESSION BLOCKED (ANTI-FRAUD)           */}
      {/* ========================================================================= */}
      {statusDialog && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/75 p-4 backdrop-blur-sm animate-fade-in">
          <div className="w-full max-w-sm rounded-3xl border border-slate-100 bg-white p-6 text-center shadow-2xl animate-scale-in">
            {statusDialog.type === 'not_registered' ? (
              <div className="mx-auto mb-3 flex h-12 w-12 items-center justify-center rounded-2xl bg-amber-50 text-amber-600">
                <UserX className="h-6 w-6" />
              </div>
            ) : (
              <div className="mx-auto mb-3 flex h-12 w-12 items-center justify-center rounded-2xl bg-sky-50 text-sky-600">
                <CheckCircle className="h-6 w-6" />
              </div>
            )}

            <h3 className="mb-1.5 text-base font-bold text-slate-900">
              {statusDialog.title}
            </h3>
            <p className="mb-5 text-xs leading-relaxed text-slate-500">
              {statusDialog.message}
            </p>

            <div className="space-y-2">
              {statusDialog.type === 'session_blocked' && (
                <button
                  type="button"
                  onClick={() => router.push('/result')}
                  className="flex w-full items-center justify-center gap-2 rounded-xl bg-[#0f2e60] px-4 py-2.5 text-xs font-bold text-white transition-colors hover:bg-[#153a73]"
                >
                  <span>Buka Halaman Hasil Anda</span>
                  <ArrowRight className="h-3.5 w-3.5" />
                </button>
              )}
              <button
                type="button"
                onClick={() => setStatusDialog(null)}
                className="w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-2.5 text-xs font-bold text-slate-700 transition-colors hover:bg-slate-100"
              >
                Saya Mengerti
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
