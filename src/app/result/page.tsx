'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { CheckCircle2, ArrowRight } from 'lucide-react';
import type { ExamResultData } from '@/types';

export default function ResultPage() {
  const [result, setResult] = useState<ExamResultData | null>(null);

  useEffect(() => {
    const stored = localStorage.getItem('upspeaking_result');
    if (stored) {
      try {
        setResult(JSON.parse(stored));
      } catch (e) {
        console.error('Error parsing upspeaking_result:', e);
      }
    }
  }, []);

  return (
    <main className="min-h-screen bg-[#f8fafc] flex flex-col items-center justify-center p-4">
      <div className="max-w-md w-full bg-white rounded-3xl p-6 sm:p-8 border border-slate-100 shadow-xl text-center animate-scale-in">
        <div className="w-16 h-16 bg-emerald-50 text-emerald-600 rounded-2xl flex items-center justify-center mx-auto mb-4 border border-emerald-200/80 shadow-xs">
          <CheckCircle2 className="w-8 h-8" />
        </div>
        <h1 className="text-xl sm:text-2xl font-bold text-slate-900 mb-2">
          Ujian Berhasil Dikumpulkan!
        </h1>
        <p className="text-xs sm:text-sm text-slate-500 mb-6">
          Jawaban Anda telah selesai dinilai oleh sistem penempatan Up Speaking.
        </p>

        {result ? (
          <div className="p-4.5 bg-slate-50 border border-slate-200/80 rounded-2xl mb-6 text-left space-y-2 text-sm text-slate-700">
            <div>
              <span className="font-semibold text-slate-900">Nama Siswa:</span>{' '}
              <span>{result.studentName}</span>
            </div>
            <div>
              <span className="font-semibold text-slate-900">Hasil Skor:</span>{' '}
              <span className="font-bold text-emerald-600">{result.finalScorePercent}%</span>{' '}
              <span className="text-xs text-slate-400">
                ({result.correctAnswers} dari {result.totalQuestions} Benar)
              </span>
            </div>
            <div>
              <span className="font-semibold text-slate-900">Level Penempatan:</span>{' '}
              <span className="font-bold text-[#0e263e]">{result.level?.name || 'Beginner'}</span>
            </div>
          </div>
        ) : (
          <div className="p-4 bg-slate-50 border border-slate-200/80 rounded-2xl mb-6 text-sm text-slate-500">
            Memuat ringkasan hasil penilaian...
          </div>
        )}

        <p className="text-[11px] text-slate-400 mb-6">
          (Desain lengkap Halaman Hasil, badge level, deskripsi kelas, dan WhatsApp Admin akan disempurnakan pada task STU-08)
        </p>

        <Link
          href="/"
          className="inline-flex items-center justify-center gap-2 w-full py-3 px-6 rounded-xl bg-[#0e263e] text-white font-bold text-sm hover:bg-[#1a385c] transition-colors shadow-xs"
        >
          <span>Kembali ke Beranda</span>
          <ArrowRight className="w-4 h-4" />
        </Link>
      </div>
    </main>
  );
}
