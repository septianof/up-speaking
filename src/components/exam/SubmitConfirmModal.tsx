'use client';

import React, { useEffect } from 'react';
import { AlertTriangle, CheckCircle2, Loader2, X } from 'lucide-react';

interface SubmitConfirmModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  onReview: () => void;
  isSubmitting: boolean;
  totalQuestions: number;
  answeredCount: number;
}

export default function SubmitConfirmModal({
  isOpen,
  onClose,
  onConfirm,
  onReview,
  isSubmitting,
  totalQuestions,
  answeredCount,
}: SubmitConfirmModalProps) {
  // Cegah scroll pada body saat modal terbuka & dengarkan tombol Escape
  useEffect(() => {
    if (!isOpen) return;

    document.body.style.overflow = 'hidden';

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && !isSubmitting) {
        onClose();
      }
    };

    window.addEventListener('keydown', handleKeyDown);

    return () => {
      document.body.style.overflow = '';
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [isOpen, isSubmitting, onClose]);

  if (!isOpen) return null;

  const unansweredCount = Math.max(0, totalQuestions - answeredCount);
  const isComplete = unansweredCount === 0;

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="submit-modal-title"
      aria-describedby="submit-modal-description"
      className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-slate-900/60 backdrop-blur-xs p-0 sm:p-4 transition-all duration-300 animate-fade-in"
      onClick={() => {
        if (!isSubmitting) {
          onClose();
        }
      }}
    >
      <div
        className="w-full sm:max-w-md bg-white rounded-t-[32px] sm:rounded-3xl p-6 sm:p-8 shadow-2xl border border-slate-100 flex flex-col transition-all duration-300 transform sm:scale-100 animate-scale-in"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Mobile Pull Handle Bar */}
        <div className="w-12 h-1.5 bg-slate-200 rounded-full mx-auto mb-4 sm:hidden flex-shrink-0" />

        {/* Modal Header & Close Button */}
        <div className="flex items-start justify-between gap-3 mb-2">
          {/* Status Icon */}
          {isComplete ? (
            <div className="w-12 h-12 rounded-2xl bg-emerald-50 border border-emerald-200/80 text-emerald-600 flex items-center justify-center flex-shrink-0 shadow-xs">
              <CheckCircle2 className="w-6 h-6" />
            </div>
          ) : (
            <div className="w-12 h-12 rounded-2xl bg-amber-50 border border-amber-200/80 text-amber-600 flex items-center justify-center flex-shrink-0 shadow-xs">
              <AlertTriangle className="w-6 h-6" />
            </div>
          )}

          {!isSubmitting && (
            <button
              type="button"
              onClick={onClose}
              aria-label="Batal dan tutup konfirmasi"
              className="w-8 h-8 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-500 hover:text-slate-700 flex items-center justify-center transition-colors focus:outline-none focus:ring-2 focus:ring-slate-300 flex-shrink-0 cursor-pointer"
            >
              <X className="w-4 h-4" />
            </button>
          )}
        </div>

        {/* Modal Title & Body */}
        <div className="my-2">
          <h2
            id="submit-modal-title"
            className="font-bold text-slate-900 text-lg sm:text-xl leading-snug"
          >
            {isComplete ? 'Kumpulkan Lembar Ujian?' : 'Masih Ada Soal Belum Terjawab!'}
          </h2>

          <p
            id="submit-modal-description"
            className="text-xs sm:text-sm text-slate-600 mt-2 leading-relaxed"
          >
            {isComplete ? (
              'Seluruh pertanyaan telah berhasil Anda jawab dengan lengkap. Setelah dikumpulkan, lembar jawaban akan langsung dinilai oleh sistem dan diserahkan ke Tutor untuk evaluasi level resmi.'
            ) : (
              <>
                Terdapat{' '}
                <span className="font-bold text-amber-700">
                  {unansweredCount} butir pertanyaan
                </span>{' '}
                yang belum Anda jawab. Pertanyaan yang dikosongkan tidak akan mendapatkan poin penilaian.
              </>
            )}
          </p>

          {/* Ringkasan Status Soal Card */}
          <div className="mt-4 p-3.5 bg-slate-50 border border-slate-200/80 rounded-2xl flex items-center justify-around text-center">
            <div>
              <span className="block text-[11px] text-slate-500 font-medium">Terjawab</span>
              <span className="text-base sm:text-lg font-bold text-emerald-600">
                {answeredCount}
              </span>
            </div>
            <div className="w-px h-8 bg-slate-200" />
            <div>
              <span className="block text-[11px] text-slate-500 font-medium">Belum Dijawab</span>
              <span className={`text-base sm:text-lg font-bold ${unansweredCount > 0 ? 'text-amber-600' : 'text-slate-400'}`}>
                {unansweredCount}
              </span>
            </div>
            <div className="w-px h-8 bg-slate-200" />
            <div>
              <span className="block text-[11px] text-slate-500 font-medium">Total Soal</span>
              <span className="text-base sm:text-lg font-bold text-slate-800">
                {totalQuestions}
              </span>
            </div>
          </div>
        </div>

        {/* Modal Action Buttons */}
        <div className="mt-6 flex flex-col-reverse sm:flex-row items-center gap-2.5 sm:gap-3">
          {/* Tombol Batal / Periksa Lagi */}
          <button
            type="button"
            disabled={isSubmitting}
            onClick={unansweredCount > 0 ? onReview : onClose}
            className={`w-full sm:w-1/2 py-3 rounded-xl font-semibold text-xs sm:text-sm transition-all cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed ${
              unansweredCount > 0
                ? 'bg-sky-50 hover:bg-sky-100 text-sky-800 border border-sky-200/80'
                : 'bg-slate-100 hover:bg-slate-200 text-slate-700'
            }`}
          >
            {unansweredCount > 0 ? 'Periksa Lagi' : 'Cek Kembali'}
          </button>

          {/* Tombol Kumpulkan */}
          <button
            type="button"
            disabled={isSubmitting}
            onClick={onConfirm}
            className={`w-full sm:w-1/2 py-3 rounded-xl font-bold text-xs sm:text-sm text-white flex items-center justify-center gap-2 transition-all shadow-xs cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed ${
              isComplete
                ? 'bg-emerald-600 hover:bg-emerald-700 active:scale-95'
                : 'bg-[#0e263e] hover:bg-[#1a385c] active:scale-95'
            }`}
          >
            {isSubmitting ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin text-white" />
                <span>Mengirim...</span>
              </>
            ) : (
              <span>{unansweredCount > 0 ? 'Tetap Kumpulkan' : 'Ya, Kumpulkan'}</span>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
