'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import {
  Award,
  CheckCircle2,
  Clock,
  ArrowRight,
  Sparkles,
  BookOpen,
  Home,
  MessageCircle,
} from 'lucide-react';
import type { ExamResultData } from '@/types';

export default function ResultPage() {
  const router = useRouter();
  const [result, setResult] = useState<ExamResultData | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Ambil data hasil ujian dari LocalStorage
  useEffect(() => {
    try {
      if (typeof window === 'undefined') return;

      const storedResult = localStorage.getItem('upspeaking_result');
      if (storedResult) {
        const parsed: ExamResultData = JSON.parse(storedResult);
        setResult(parsed);
      }
    } catch (err) {
      console.error('Error saat membaca data hasil ujian:', err);
    } finally {
      setIsLoading(false);
    }
  }, []);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-[#f8fafc] flex flex-col items-center justify-center p-4">
        <div className="w-12 h-12 rounded-2xl bg-sky-50 text-sky-600 flex items-center justify-center animate-pulse mb-4">
          <Sparkles className="w-6 h-6 animate-spin" />
        </div>
        <h2 className="text-base sm:text-lg font-bold text-slate-800">Menyiapkan Hasil Penilaian...</h2>
        <p className="text-xs sm:text-sm text-slate-500 mt-1">Mengkalkulasi level dan rekomendasi kelas Anda</p>
      </div>
    );
  }

  // Jika tidak ada data hasil ujian yang tersimpan, tampilkan opsi untuk mulai tes
  if (!result) {
    return (
      <div className="min-h-screen bg-[#f8fafc] flex flex-col items-center justify-center p-4">
        <div className="max-w-md w-full bg-white rounded-3xl p-8 border border-slate-100 shadow-xl text-center">
          <div className="w-16 h-16 bg-amber-50 text-amber-600 rounded-2xl flex items-center justify-center mx-auto mb-4 border border-amber-200/80">
            <Award className="w-8 h-8" />
          </div>
          <h2 className="text-xl font-bold text-slate-900 mb-2">Data Hasil Tidak Ditemukan</h2>
          <p className="text-sm text-slate-500 mb-6">
            Anda belum memiliki riwayat hasil ujian aktif di perangkat ini. Silakan ikuti tes penempatan terlebih dahulu.
          </p>
          <Link
            href="/"
            className="inline-flex items-center justify-center gap-2 w-full py-3.5 px-6 rounded-xl bg-[#0e263e] text-white font-bold text-sm hover:bg-[#1a385c] transition-colors shadow-xs"
          >
            <span>Mulai Placement Test</span>
            <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
      </div>
    );
  }

  // Format tanggal dan waktu selesai
  const formattedDate = new Intl.DateTimeFormat('id-ID', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  }).format(new Date(result.completedAt || Date.now()));

  // Konfigurasi visual tema berdasarkan level penempatan
  const levelName = result.level?.name || 'Beginner';
  const isBeginner = levelName.toLowerCase() === 'beginner';
  const isIntermediate = levelName.toLowerCase() === 'intermediate';
  const isAdvanced = levelName.toLowerCase() === 'advanced';

  const levelColorConfig = isAdvanced
    ? {
        badgeBg: 'bg-indigo-50 border-indigo-200/80 text-indigo-700',
        cardBorder: 'border-indigo-200',
        ringColor: 'ring-indigo-400',
        tag: 'Level Mahir (Advanced)',
        recommendationTitle: 'Program Rekomendasi: Professional & Executive Speaking',
      }
    : isIntermediate
    ? {
        badgeBg: 'bg-sky-50 border-sky-200/80 text-sky-700',
        cardBorder: 'border-sky-200',
        ringColor: 'ring-sky-400',
        tag: 'Level Menengah (Intermediate)',
        recommendationTitle: 'Program Rekomendasi: Conversational Fluency & Discussion',
      }
    : {
        badgeBg: 'bg-emerald-50 border-emerald-200/80 text-emerald-700',
        cardBorder: 'border-emerald-200',
        ringColor: 'ring-emerald-400',
        tag: 'Level Pemula (Beginner)',
        recommendationTitle: 'Program Rekomendasi: Foundation & Essential Speaking',
      };

  // Pre-filled URL WhatsApp ke Admin
  const adminWhatsApp = process.env.NEXT_PUBLIC_ADMIN_WHATSAPP || '6281234567890';
  const waMessage = `Halo Admin Up Speaking, saya *${result.studentName}* baru saja menyelesaikan English Placement Test dengan skor *${result.finalScorePercent}%* (Level: *${levelName}*). Saya ingin konsultasi jadwal belajar dan pendaftaran kelas yang cocok. Terima kasih!`;
  const whatsappUrl = `https://wa.me/${adminWhatsApp}?text=${encodeURIComponent(waMessage)}`;

  return (
    <div className="min-h-screen bg-[#f8fafc] text-slate-800 flex flex-col selection:bg-rose-100 selection:text-rose-900 pb-16">
      {/* ========================================================================= */}
      {/* 1. TOP NAVBAR                                                             */}
      {/* ========================================================================= */}
      <header className="w-full bg-white/95 backdrop-blur-sm sticky top-0 z-40 border-b border-slate-100">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 h-18 sm:h-20 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-3 group focus:outline-none">
            <div className="relative w-9 h-9 sm:w-10 sm:h-10 flex-shrink-0 transition-transform group-hover:scale-105 duration-200">
              <Image
                src="/logo/logo_transparent.png"
                alt="Up Speaking Logo"
                fill
                sizes="40px"
                className="object-contain"
                priority
              />
            </div>
            <div className="flex flex-col">
              <span className="font-extrabold text-lg sm:text-xl text-[#1e3a8a] tracking-tight leading-none">
                Up Speaking
              </span>
              <span className="font-medium text-[11px] sm:text-xs text-[#0284c7] tracking-normal leading-tight mt-0.5">
                Learning Centre
              </span>
            </div>
          </Link>

          {/* Badge Status Hasil Resmi */}
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200/80">
            <span className="w-2 h-2 rounded-full bg-emerald-500"></span>
            <span>Hasil Resmi</span>
          </div>
        </div>
      </header>

      {/* ========================================================================= */}
      {/* 2. MAIN RESULT CONTENT                                                    */}
      {/* ========================================================================= */}
      <main className="flex-1 max-w-4xl w-full mx-auto px-4 sm:px-6 py-6 sm:py-10">
        {/* Banner Ucapan Selamat */}
        <div className="text-center mb-6 sm:mb-8 animate-fade-in">
          <div className="inline-flex items-center gap-2 px-3.5 sm:px-4 py-1.5 rounded-full text-xs font-semibold bg-amber-50 text-amber-700 border border-amber-200/80 mb-3 shadow-xs">
            <Sparkles className="w-3.5 h-3.5 text-amber-500" />
            <span>Placement Test Selesai</span>
          </div>
          <h1 className="text-2xl sm:text-3xl md:text-4xl font-extrabold text-slate-900 tracking-tight">
            Selamat, {result.studentName}!
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 mt-1.5 flex items-center justify-center gap-1.5">
            <Clock className="w-3.5 h-3.5 text-slate-400" />
            <span>Diselesaikan pada {formattedDate} WIB</span>
          </p>
        </div>

        <div className="space-y-6 animate-scale-in">
          {/* ===================================================================== */}
          {/* KARTU 1: PENCAPAIAN SKOR UTAMA                                       */}
          {/* ===================================================================== */}
          <div className="bg-white rounded-3xl border border-slate-100 p-6 sm:p-10 shadow-[0_4px_24px_-4px_rgba(0,0,0,0.04)] text-center relative overflow-hidden">
            {/* Background Accent Glow */}
            <div className="absolute -top-12 -right-12 w-40 h-40 bg-sky-100/50 rounded-full blur-2xl pointer-events-none" />
            <div className="absolute -bottom-12 -left-12 w-40 h-40 bg-emerald-100/40 rounded-full blur-2xl pointer-events-none" />

            <span className="text-xs sm:text-sm font-semibold text-slate-500 uppercase tracking-wider block mb-2">
              Skor Penempatan Akhir
            </span>

            {/* Skor Persentase Besar */}
            <div className="my-2 sm:my-3">
              <span className="text-6xl sm:text-7xl md:text-8xl font-black text-slate-900 tracking-tight">
                {result.finalScorePercent}
              </span>
              <span className="text-3xl sm:text-4xl font-extrabold text-[#00a6f4] ml-1">
                %
              </span>
            </div>

            {/* Sub-label Benar/Total */}
            <p className="text-sm sm:text-base font-semibold text-slate-600 mb-6">
              Berhasil menjawab{' '}
              <span className="font-bold text-slate-900">
                {result.correctAnswers} dari {result.totalQuestions} pertanyaan
              </span>{' '}
              dengan tepat.
            </p>

            {/* Grid Kartu Rincian 3 Metrik */}
            <div className="grid grid-cols-3 gap-2.5 sm:gap-4 max-w-lg mx-auto pt-6 border-t border-slate-100">
              <div className="p-3 sm:p-4 rounded-2xl bg-slate-50 border border-slate-100">
                <span className="text-[11px] sm:text-xs text-slate-500 font-medium block">Akurasi</span>
                <span className="text-base sm:text-lg font-bold text-slate-900 mt-0.5 block">
                  {result.finalScorePercent}%
                </span>
              </div>
              <div className="p-3 sm:p-4 rounded-2xl bg-slate-50 border border-slate-100">
                <span className="text-[11px] sm:text-xs text-slate-500 font-medium block">Jawaban Benar</span>
                <span className="text-base sm:text-lg font-bold text-emerald-600 mt-0.5 block">
                  {result.correctAnswers}/{result.totalQuestions}
                </span>
              </div>
              <div className="p-3 sm:p-4 rounded-2xl bg-slate-50 border border-slate-100">
                <span className="text-[11px] sm:text-xs text-slate-500 font-medium block">Level Hasil</span>
                <span className="text-base sm:text-lg font-bold text-[#0e263e] mt-0.5 block">
                  {levelName}
                </span>
              </div>
            </div>
          </div>

          {/* ===================================================================== */}
          {/* KARTU 2: REKOMENDASI LEVEL & KURIKULUM BELAJAR                       */}
          {/* ===================================================================== */}
          <div className={`bg-white rounded-3xl border-2 ${levelColorConfig.cardBorder} p-6 sm:p-8 shadow-xs relative`}>
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-4 pb-4 border-b border-slate-100">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-2xl bg-[#0e263e] text-white flex items-center justify-center flex-shrink-0 shadow-xs">
                  <Award className="w-6 h-6 text-amber-400" />
                </div>
                <div>
                  <div className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-md text-[11px] font-bold border mb-1 ${levelColorConfig.badgeBg}`}>
                    <span>{levelColorConfig.tag}</span>
                  </div>
                  <h3 className="font-extrabold text-xl sm:text-2xl text-slate-900 leading-tight">
                    Level {levelName}
                  </h3>
                </div>
              </div>

              {/* Verified Badge */}
              <div className="inline-flex items-center gap-1.5 text-xs text-slate-500 font-medium self-end sm:self-center">
                <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                <span>Terverifikasi Kurikulum Up Speaking</span>
              </div>
            </div>

            {/* Deskripsi Rekomendasi */}
            <div className="space-y-3">
              <h4 className="font-bold text-sm sm:text-base text-slate-900 flex items-center gap-2">
                <BookOpen className="w-4 h-4 text-[#00a6f4]" />
                <span>{levelColorConfig.recommendationTitle}</span>
              </h4>
              <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
                {result.level?.description ||
                  'Fokus melatih kelancaran berkomunikasi dalam bahasa Inggris secara aktif dan percaya diri melalui kurikulum terstruktur Up Speaking Learning Centre.'}
              </p>
            </div>
          </div>

          {/* ===================================================================== */}
          {/* KARTU 3: TOMBOL AKSI & DIRECT WHATSAPP KE ADMIN                       */}
          {/* ===================================================================== */}
          <div className="bg-white rounded-3xl border border-slate-100 p-6 sm:p-8 shadow-[0_4px_24px_-4px_rgba(0,0,0,0.04)] flex flex-col gap-3">
            {/* Tombol Direct WhatsApp ke Admin */}
            <a
              href={whatsappUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="w-full py-4 px-6 rounded-2xl bg-[#25D366] hover:bg-[#20bd5a] text-white font-bold text-sm sm:text-base flex items-center justify-center gap-2.5 transition-all shadow-md shadow-emerald-500/20 active:scale-[0.99] text-center"
            >
              <MessageCircle className="w-5 h-5 fill-current" />
              <span>Konsultasi Hasil & Jadwal ke Admin WhatsApp</span>
              <ArrowRight className="w-4 h-4 hidden sm:inline" />
            </a>

            {/* Tombol Selesai & Kembali ke Beranda */}
            <Link
              href="/"
              className="w-full py-3 px-6 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold text-xs sm:text-sm flex items-center justify-center gap-2 transition-colors text-center"
            >
              <Home className="w-4 h-4" />
              <span>Selesai & Kembali ke Beranda</span>
            </Link>
          </div>
        </div>
      </main>
    </div>
  );
}
