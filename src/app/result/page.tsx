'use client';

import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import confetti from 'canvas-confetti';
import {
  Clock,
  Sparkles,
  BookOpen,
  GraduationCap,
  Hourglass,
  LogOut,
  CheckCircle,
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

  // Animasi letupan selebrasi (Confetti) saat hasil berhasil dimuat
  useEffect(() => {
    if (result) {
      try {
        confetti({
          particleCount: 90,
          spread: 70,
          origin: { y: 0.6 },
          colors: ['#00a6f4', '#0e263e', '#10b981', '#f59e0b', '#8b5cf6'],
        });
      } catch (err) {
        console.error('Error saat memicu confetti:', err);
      }
    }
  }, [result]);

  // Handler tombol selesai & keluar: bersihkan seluruh sesi lokal lalu arahkan ke beranda
  const handleFinishAndExit = () => {
    try {
      if (typeof window !== 'undefined') {
        localStorage.removeItem('upspeaking_result');
        localStorage.removeItem('upspeaking_session');
        localStorage.removeItem('upspeaking_answers');
        localStorage.removeItem('upspeaking_current_index');
      }
    } catch (err) {
      console.error('Error saat membersihkan sesi lokal:', err);
    }
    router.replace('/');
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-[#f8fafc] flex flex-col items-center justify-center p-4">
        <div className="w-12 h-12 rounded-2xl bg-sky-50 text-sky-600 flex items-center justify-center animate-pulse mb-4">
          <Sparkles className="w-6 h-6 animate-spin" />
        </div>
        <h2 className="text-base sm:text-lg font-bold text-slate-800">Menyiapkan Rekapitulasi Hasil...</h2>
        <p className="text-xs sm:text-sm text-slate-500 mt-1">Menghitung skor akurasi dan durasi pengerjaan Anda</p>
      </div>
    );
  }

  // Jika tidak ada data hasil ujian yang tersimpan di browser
  if (!result) {
    return (
      <div className="min-h-screen bg-[#f8fafc] flex flex-col items-center justify-center p-4">
        <div className="max-w-md w-full bg-white rounded-3xl p-8 border border-slate-100 shadow-xl text-center">
          <div className="w-16 h-16 bg-amber-50 text-amber-600 rounded-2xl flex items-center justify-center mx-auto mb-4 border border-amber-200/80">
            <Hourglass className="w-8 h-8" />
          </div>
          <h2 className="text-xl font-bold text-slate-900 mb-2">Data Hasil Tidak Ditemukan</h2>
          <p className="text-sm text-slate-500 mb-6 leading-relaxed">
            Tidak ada riwayat hasil pengerjaan placement test yang aktif di browser ini. Silakan masuk melalui halaman utama.
          </p>
          <button
            type="button"
            onClick={() => router.replace('/')}
            className="w-full py-3.5 px-6 rounded-xl bg-[#0e263e] text-white font-bold text-sm hover:bg-[#1a385c] transition-colors shadow-xs cursor-pointer"
          >
            Kembali ke Halaman Masuk
          </button>
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

  // Data Jenjang Pendidikan
  const isHighSchool = result.educationLevel === 'high_school';
  const educationLabel = isHighSchool ? 'High School (SMP, SMA, Umum)' : 'Elementary (SD)';

  return (
    <div className="min-h-screen bg-[#f8fafc] text-slate-800 flex flex-col selection:bg-rose-100 selection:text-rose-900 pb-16">
      {/* ========================================================================= */}
      {/* 1. TOP NAVBAR                                                             */}
      {/* ========================================================================= */}
      <header className="w-full bg-white/95 backdrop-blur-sm sticky top-0 z-40 border-b border-slate-100">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 h-18 sm:h-20 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="relative w-9 h-9 sm:w-10 sm:h-10 flex-shrink-0">
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
              <span className="font-extrabold text-lg sm:text-xl text-[#0e263e] tracking-tight leading-none">
                Up Speaking
              </span>
              <span className="font-medium text-[11px] sm:text-xs text-[#00a6f4] tracking-normal leading-tight mt-0.5">
                Learning Centre
              </span>
            </div>
          </div>

          {/* Badge Status Ujian Selesai */}
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200/80">
            <span className="w-2 h-2 rounded-full bg-emerald-500"></span>
            <span>Ujian Selesai</span>
          </div>
        </div>
      </header>

      {/* ========================================================================= */}
      {/* 2. MAIN RESULT CONTENT                                                    */}
      {/* ========================================================================= */}
      <main className="flex-1 max-w-3xl w-full mx-auto px-4 sm:px-6 py-6 sm:py-10">
        {/* Banner Ucapan Apresiasi */}
        <div className="text-center mb-6 sm:mb-8 animate-fade-in">
          <div className="flex flex-wrap items-center justify-center gap-2 mb-3">
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-sky-50 text-sky-700 border border-sky-200/80 shadow-2xs">
              {isHighSchool ? <GraduationCap className="w-3.5 h-3.5" /> : <BookOpen className="w-3.5 h-3.5" />}
              <span>Jenjang {educationLabel}</span>
            </span>
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200/80 shadow-2xs">
              <Sparkles className="w-3.5 h-3.5 text-emerald-600" />
              <span>Tes Berhasil Dikumpulkan</span>
            </span>
          </div>
          <h1 className="text-2xl sm:text-3xl md:text-4xl font-extrabold text-slate-900 tracking-tight">
            Awesome Job, {result.studentName}!
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 mt-1.5 flex items-center justify-center gap-1.5">
            <Clock className="w-3.5 h-3.5 text-slate-400" />
            <span>Diselesaikan pada {formattedDate} WIB</span>
          </p>
        </div>

        <div className="space-y-6 animate-scale-in">
          {/* ===================================================================== */}
          {/* KARTU 1: PENCAPAIAN SKOR UTAMA & METRIK PERFORMA OBJEKTIF             */}
          {/* ===================================================================== */}
          <div className="bg-white rounded-3xl border border-slate-100 p-6 sm:p-10 shadow-[0_4px_24px_-4px_rgba(0,0,0,0.04)] text-center relative overflow-hidden">
            {/* Background Accent Glow */}
            <div className="absolute -top-12 -right-12 w-40 h-40 bg-sky-100/40 rounded-full blur-2xl pointer-events-none" />
            <div className="absolute -bottom-12 -left-12 w-40 h-40 bg-emerald-100/30 rounded-full blur-2xl pointer-events-none" />

            <span className="text-xs sm:text-sm font-semibold text-slate-500 uppercase tracking-wider block mb-2">
              Skor Akurasi Akhir
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

            {/* Sub-label Benar / Total */}
            <p className="text-sm sm:text-base font-semibold text-slate-600 mb-6">
              Berhasil menjawab{' '}
              <span className="font-bold text-slate-900">
                {result.correctAnswers} dari {result.totalQuestions} pertanyaan
              </span>{' '}
              dengan tepat.
            </p>

            {/* Grid 4 Kartu Rincian Metrik */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 sm:gap-4 max-w-2xl mx-auto pt-6 border-t border-slate-100">
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
                <span className="text-[11px] sm:text-xs text-slate-500 font-medium block">Durasi Riil</span>
                <span className="text-base sm:text-lg font-bold text-sky-600 mt-0.5 block">
                  {result.durationMinutes ?? 0} Menit
                </span>
              </div>
              <div className="p-3 sm:p-4 rounded-2xl bg-slate-50 border border-slate-100">
                <span className="text-[11px] sm:text-xs text-slate-500 font-medium block">Jenjang</span>
                <span className="text-base sm:text-lg font-bold text-[#0e263e] mt-0.5 block">
                  {isHighSchool ? 'High School' : 'Elementary'}
                </span>
              </div>
            </div>
          </div>

          {/* ===================================================================== */}
          {/* KARTU 2: STATUS EVALUASI KEDAULATAN OLEH TUTOR (SUBMITTED)            */}
          {/* ===================================================================== */}
          <div className="bg-amber-50/60 rounded-3xl border-2 border-amber-200/90 p-6 sm:p-8 shadow-xs relative">
            <div className="flex items-start gap-4">
              <div className="w-12 h-12 rounded-2xl bg-amber-500 text-white flex items-center justify-center flex-shrink-0 shadow-sm shadow-amber-500/20">
                <Hourglass className="w-6 h-6" />
              </div>
              <div className="flex-1">
                <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-md text-[11px] font-bold border border-amber-300 bg-amber-100/80 text-amber-900 mb-1.5">
                  <span className="w-1.5 h-1.5 rounded-full bg-amber-600 animate-pulse"></span>
                  <span>Menunggu Konfirmasi Level oleh Tutor</span>
                </div>
                <h3 className="font-extrabold text-lg sm:text-xl text-slate-900 leading-snug">
                  Hasil Anda Sedang Ditinjau oleh Tutor
                </h3>
                <p className="text-xs sm:text-sm text-slate-600 leading-relaxed mt-2">
                  Di Up Speaking, penentuan level penempatan resmi (<span className="font-semibold text-slate-800">Beginner</span>, <span className="font-semibold text-slate-800">Intermediate</span>, atau <span className="font-semibold text-slate-800">Advanced</span>) tidak ditetapkan secara kaku oleh rumus otomatis, melainkan menjadi wewenang profesional <span className="font-semibold text-slate-800">Tutor penanggung jawab jenjang</span>.
                </p>
                <div className="mt-3.5 pt-3 border-t border-amber-200/70 flex items-center gap-2 text-xs text-amber-900 font-medium">
                  <CheckCircle className="w-4 h-4 text-emerald-600 flex-shrink-0" />
                  <span>Tutor akan meninjau performa dan menghubungi Anda untuk penetapan kelas serta persiapan belajar.</span>
                </div>
              </div>
            </div>
          </div>

          {/* ===================================================================== */}
          {/* KARTU 3: TOMBOL SELESAI & KELUAR                                      */}
          {/* ===================================================================== */}
          <div className="bg-white rounded-3xl border border-slate-100 p-6 sm:p-7 shadow-[0_4px_24px_-4px_rgba(0,0,0,0.04)]">
            <button
              type="button"
              onClick={handleFinishAndExit}
              className="w-full py-3.5 px-6 rounded-2xl bg-[#0e263e] hover:bg-[#1a385c] text-white font-bold text-sm sm:text-base flex items-center justify-center gap-2.5 transition-all shadow-md shadow-slate-900/10 active:scale-[0.99] cursor-pointer"
            >
              <LogOut className="w-4 h-4" />
              <span>Selesai &amp; Keluar</span>
            </button>
            <p className="text-center text-[11px] sm:text-xs text-slate-400 mt-3">
              Menekan tombol ini akan membersihkan riwayat ujian aktif dari perangkat ini secara aman.
            </p>
          </div>
        </div>
      </main>
    </div>
  );
}
