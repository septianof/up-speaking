'use client';

import React, { useEffect, useState } from 'react';
import Image from 'next/image';

interface ExamHeaderProps {
  studentName: string;
  endTime: string;
  autoSaveStatus?: 'saved' | 'saving' | 'error' | 'offline';
  currentQuestionIndex: number;
  totalQuestions: number;
  answeredCount: number;
  onTimeUp?: () => void;
}

export default function ExamHeader({
  studentName,
  endTime,
  autoSaveStatus = 'saved',
  currentQuestionIndex,
  totalQuestions,
  answeredCount,
  onTimeUp,
}: ExamHeaderProps) {
  // Hitung sisa waktu awal dari jam server (end_time - current_time)
  const calculateRemainingSeconds = () => {
    if (!endTime) return 0;
    const endMs = new Date(endTime).getTime();
    const nowMs = Date.now();
    return Math.max(0, Math.floor((endMs - nowMs) / 1000));
  };

  const [remainingSeconds, setRemainingSeconds] = useState<number>(calculateRemainingSeconds);

  // Countdown timer effect
  useEffect(() => {
    // Sinkronisasi ulang saat props endTime berubah
    setRemainingSeconds(calculateRemainingSeconds());

    const interval = setInterval(() => {
      const remaining = calculateRemainingSeconds();
      setRemainingSeconds(remaining);

      if (remaining <= 0) {
        clearInterval(interval);
        if (onTimeUp) {
          onTimeUp();
        }
      }
    }, 1000);

    return () => clearInterval(interval);
  }, [endTime, onTimeUp]);

  // Format MM:SS
  const minutes = Math.floor(remainingSeconds / 60);
  const seconds = remainingSeconds % 60;
  const formattedTime = `${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`;

  // Persentase progres pengerjaan soal (berdasarkan nomor soal aktif atau jumlah soal terjawab)
  const currentStep = Math.max(answeredCount, currentQuestionIndex + 1);
  const progressPercent =
    totalQuestions > 0
      ? Math.min(100, Math.round((currentStep / totalQuestions) * 100))
      : 10;

  return (
    <header className="sticky top-0 z-40 w-full shadow-sm">
      {/* ======================================================================= */}
      {/* 1. TOP STICKY BAR (DARK NAVY #0e263e)                                   */}
      {/* ======================================================================= */}
      <div className="w-full bg-[#0e263e] border-b border-slate-800 text-white">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 h-16 sm:h-20 flex items-center justify-between gap-3">
          {/* Sisi Kiri: Logo + Nama Siswa + Status Auto-save */}
          <div className="flex items-center gap-3 min-w-0">
            <div className="relative w-8 h-8 sm:w-10 sm:h-10 flex-shrink-0">
              <Image
                src="/logo/logo_transparent.png"
                alt="Up Speaking Logo"
                fill
                sizes="40px"
                className="object-contain"
                priority
              />
            </div>
            <div className="flex flex-col min-w-0">
              <span className="font-bold text-sm sm:text-base md:text-lg text-white truncate leading-tight">
                {studentName || 'Peserta Ujian'}
              </span>
              <div className="flex items-center gap-2 text-[11px] sm:text-xs text-slate-300 mt-0.5">
                <span className="text-slate-400">Placement Test</span>
                <span className="text-slate-500">•</span>

                {/* Badge Status Auto-Save */}
                {autoSaveStatus === 'saved' && (
                  <span className="inline-flex items-center gap-1.5 text-emerald-400 font-medium">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-400"></span>
                    <span>Tersimpan</span>
                  </span>
                )}
                {autoSaveStatus === 'saving' && (
                  <span className="inline-flex items-center gap-1.5 text-sky-400 font-medium animate-pulse">
                    <span className="w-1.5 h-1.5 rounded-full bg-sky-400"></span>
                    <span>Menyimpan...</span>
                  </span>
                )}
                {autoSaveStatus === 'offline' && (
                  <span className="inline-flex items-center gap-1.5 text-amber-300 font-medium" title="Koneksi internet terputus. Jawaban Anda tetap tersimpan aman di browser/HP dan akan disinkronkan saat online kembali.">
                    <span className="w-1.5 h-1.5 rounded-full bg-amber-400"></span>
                    <span>Offline (Aman di HP)</span>
                  </span>
                )}
                {autoSaveStatus === 'error' && (
                  <span className="inline-flex items-center gap-1.5 text-rose-400 font-medium">
                    <span className="w-1.5 h-1.5 rounded-full bg-rose-400"></span>
                    <span>Belum Tersimpan</span>
                  </span>
                )}
              </div>
            </div>
          </div>

          {/* Sisi Kanan: Countdown Timer Badge (Gold Text) */}
          <div className="flex items-center flex-shrink-0">
            <div
              className={`inline-flex items-center gap-1.5 sm:gap-2 px-3 sm:px-4 py-1.5 sm:py-2 rounded-full border transition-colors ${
                remainingSeconds <= 300
                  ? 'bg-rose-950/80 border-rose-500/50 text-rose-300 animate-pulse'
                  : 'bg-[#163354]/90 border-sky-400/20 text-amber-400'
              }`}
            >
              <span className="text-sm sm:text-base">⏰</span>
              <span className="font-mono font-bold text-xs sm:text-sm md:text-base tracking-wider">
                {formattedTime}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* ======================================================================= */}
      {/* 2. SUB-HEADER: PROGRESS COUNTER & PROGRESS BAR                          */}
      {/* ======================================================================= */}
      <div className="w-full bg-[#f8fafc] border-b border-slate-200/80 py-3 sm:py-3.5">
        <div className="max-w-4xl mx-auto px-4 sm:px-6">
          <div className="flex items-center justify-between text-xs sm:text-sm mb-2 sm:mb-2.5">
            <div>
              <span className="font-bold text-slate-800">
                Pertanyaan No. {currentQuestionIndex + 1}
              </span>{' '}
              <span className="text-slate-400">dari {totalQuestions}</span>
            </div>
            <div className="font-semibold text-slate-500 text-xs sm:text-sm">
              Terjawab: <span className="text-slate-800 font-bold">{answeredCount}</span>/{totalQuestions}
            </div>
          </div>

          {/* Dynamic Progress Bar dengan warna Cyan/Biru Up Speaking (#00a6f4) */}
          <div className="w-full h-1.5 sm:h-2 bg-slate-200 rounded-full overflow-hidden">
            <div
              className="h-full bg-[#00a6f4] rounded-full transition-all duration-300 ease-out"
              style={{ width: `${progressPercent}%` }}
            />
          </div>
        </div>
      </div>
    </header>
  );
}
