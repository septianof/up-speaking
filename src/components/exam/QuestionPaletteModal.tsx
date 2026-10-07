'use client';

import React, { useEffect } from 'react';
import { X, Check } from 'lucide-react';
import type { SanitizedQuestion } from '@/types';

interface QuestionPaletteModalProps {
  isOpen: boolean;
  onClose: () => void;
  questions: SanitizedQuestion[];
  currentIndex: number;
  answers: Record<string, string>;
  onSelectQuestion: (index: number) => void;
}

export default function QuestionPaletteModal({
  isOpen,
  onClose,
  questions,
  currentIndex,
  answers,
  onSelectQuestion,
}: QuestionPaletteModalProps) {
  // Cegah scroll pada body saat modal terbuka & dengarkan tombol Escape
  useEffect(() => {
    if (!isOpen) return;

    document.body.style.overflow = 'hidden';

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onClose();
      }
    };

    window.addEventListener('keydown', handleKeyDown);

    return () => {
      document.body.style.overflow = '';
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const answeredCount = Object.keys(answers).length;
  const totalQuestions = questions.length;

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-label="Kisi Palet Daftar Soal"
      className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-slate-900/60 backdrop-blur-xs p-0 sm:p-4 transition-all duration-300"
      onClick={onClose}
    >
      <div
        className="w-full sm:max-w-md bg-white rounded-t-[32px] sm:rounded-3xl p-5 sm:p-7 shadow-2xl border border-slate-100 max-h-[85vh] flex flex-col transition-all duration-300 transform sm:scale-100 animate-scale-in"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Mobile Pull Handle Bar */}
        <div className="w-12 h-1.5 bg-slate-200 rounded-full mx-auto mb-4 sm:hidden flex-shrink-0" />

        {/* Modal Header */}
        <div className="flex items-start justify-between gap-3 mb-4 pb-3 border-b border-slate-100 flex-shrink-0">
          <div>
            <h2 className="font-bold text-slate-900 text-base sm:text-lg leading-tight">
              Daftar Soal Ujian
            </h2>
            <p className="text-xs text-slate-500 mt-1">
              Terjawab: <span className="font-bold text-slate-800">{answeredCount}</span> dari {totalQuestions} pertanyaan
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label="Tutup daftar soal"
            className="w-8 h-8 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-500 hover:text-slate-700 flex items-center justify-center transition-colors focus:outline-none focus:ring-2 focus:ring-slate-300 flex-shrink-0"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Status Legends */}
        <div className="flex items-center justify-between gap-2 p-2.5 bg-slate-50 rounded-xl text-[11px] sm:text-xs text-slate-600 mb-4 flex-shrink-0">
          <div className="flex items-center gap-1.5">
            <span className="w-3 h-3 rounded-full bg-emerald-500 flex-shrink-0"></span>
            <span>Terjawab</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="w-3 h-3 rounded-full bg-[#00a6f4] ring-2 ring-[#0e263e] flex-shrink-0"></span>
            <span>Aktif</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="w-3 h-3 rounded-full bg-slate-200 border border-slate-300 flex-shrink-0"></span>
            <span>Belum</span>
          </div>
        </div>

        {/* Grid Nomor Soal */}
        <div className="overflow-y-auto py-1 pr-1 flex-1">
          <div className="grid grid-cols-5 gap-2.5 sm:gap-3">
            {questions.map((q, idx) => {
              const questionNumber = idx + 1;
              const isActive = idx === currentIndex;
              const isAnswered = Boolean(answers[q.id]);

              return (
                <button
                  key={q.id || idx}
                  type="button"
                  onClick={() => {
                    onSelectQuestion(idx);
                    onClose();
                  }}
                  className={`relative aspect-square rounded-xl sm:rounded-2xl font-bold text-sm sm:text-base flex items-center justify-center transition-all duration-150 cursor-pointer select-none active:scale-95 focus:outline-none ${
                    isActive
                      ? 'ring-2 ring-offset-2 ring-[#0e263e] bg-[#00a6f4] text-white shadow-md'
                      : isAnswered
                      ? 'bg-emerald-50 text-emerald-700 border-2 border-emerald-400 hover:bg-emerald-100 shadow-xs'
                      : 'bg-slate-100 text-slate-600 border border-slate-200/90 hover:bg-slate-200/80 hover:text-slate-800'
                  }`}
                  aria-label={`Pindah ke soal nomor ${questionNumber}`}
                >
                  <span>{questionNumber}</span>

                  {/* Indikator centang kecil jika sudah dijawab dan bukan sedang aktif */}
                  {isAnswered && !isActive && (
                    <span className="absolute -top-1 -right-1 w-4 h-4 bg-emerald-500 text-white rounded-full flex items-center justify-center text-[9px] shadow-xs">
                      <Check className="w-2.5 h-2.5 stroke-[3]" />
                    </span>
                  )}
                </button>
              );
            })}
          </div>
        </div>

        {/* Footer Modal */}
        <div className="mt-4 pt-3 border-t border-slate-100 flex-shrink-0">
          <button
            type="button"
            onClick={onClose}
            className="w-full py-2.5 sm:py-3 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold text-xs sm:text-sm transition-colors"
          >
            Tutup Daftar Soal
          </button>
        </div>
      </div>
    </div>
  );
}
