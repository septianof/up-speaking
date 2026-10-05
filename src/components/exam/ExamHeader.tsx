'use client';

import React, { useEffect, useState, useCallback } from 'react';
import Image from 'next/image';
import { Clock } from 'lucide-react';
import type { EducationLevel } from '@/types';

interface ExamHeaderProps {
  studentName: string;
  startTime: string;
  educationLevel?: EducationLevel;
  autoSaveStatus?: 'saved' | 'saving' | 'error' | 'offline';
  currentQuestionIndex: number;
  totalQuestions: number;
  answeredCount: number;
}

export default function ExamHeader({
  studentName,
  startTime,
  educationLevel = 'elementary',
  autoSaveStatus = 'saved',
  currentQuestionIndex,
  totalQuestions,
  answeredCount,
}: ExamHeaderProps) {
  // Hitung durasi waktu yang sudah berjalan dari start_time server (Stopwatch Riil)
  const calculateElapsedSeconds = useCallback(() => {
    if (!startTime) return 0;
    const startMs = new Date(startTime).getTime();
    const nowMs = Date.now();
    return Math.max(0, Math.floor((nowMs - startMs) / 1000));
  }, [startTime]);

  const [elapsedSeconds, setElapsedSeconds] = useState<number>(calculateElapsedSeconds);

  // Stopwatch effect: bertambah setiap 1 detik secara santai (untimed duration)
  useEffect(() => {
    setElapsedSeconds(calculateElapsedSeconds());

    const interval = setInterval(() => {
      setElapsedSeconds(calculateElapsedSeconds());
    }, 1000);

    return () => clearInterval(interval);
  }, [calculateElapsedSeconds]);

  // Format MM:SS
  const minutes = Math.floor(elapsedSeconds / 60);
  const seconds = elapsedSeconds % 60;
  const formattedTime = `${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`;

  // Persentase progres pengerjaan soal
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

          {/* Sisi Kanan: Jenjang + Stopwatch Durasi Pengerjaan (Untimed) */}
          <div className="flex items-center gap-2 flex-shrink-0">
            {educationLevel && (
              <span className="hidden sm:inline-flex items-center px-2.5 py-1 rounded-full text-[11px] font-semibold bg-sky-950/80 border border-sky-400/30 text-sky-200">
                {educationLevel === 'high_school' ? 'High School' : 'Elementary'}
              </span>
            )}
            <div
              className="inline-flex items-center gap-1.5 sm:gap-2 px-3 sm:px-4 py-1.5 sm:py-2 rounded-full border bg-[#163354]/90 border-sky-400/20 text-sky-200"
              title="Durasi pengerjaan Anda (Ujian santai tanpa batas waktu mendesak)"
            >
              <Clock className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-sky-400" />
              <span className="font-mono font-bold text-xs sm:text-sm md:text-base tracking-wider text-white">
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

          {/* Dynamic Progress Bar */}
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
