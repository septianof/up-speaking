'use client';

import React, { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import {
  Trash2,
  X,
  AlertTriangle,
  Loader2,
  ShieldCheck,
  HelpCircle,
} from 'lucide-react';
import { AdminQuestion, softDeleteQuestion } from '@/app/actions/questions';

interface QuestionDeleteModalProps {
  isOpen: boolean;
  onClose: () => void;
  question: AdminQuestion | null;
  onSuccess: (questionId: string, message: string) => void;
}

export const QuestionDeleteModal: React.FC<QuestionDeleteModalProps> = ({
  isOpen,
  onClose,
  question,
  onSuccess,
}) => {
  const [mounted, setMounted] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  useEffect(() => {
    setMounted(true);
  }, []);

  // Handle ESC key press
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen && !isDeleting) {
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, isDeleting, onClose]);

  if (!isOpen || !question || !mounted) return null;

  const handleDelete = async () => {
    setIsDeleting(true);
    setErrorMessage(null);

    try {
      const res = await softDeleteQuestion(question.id);

      if (res.success) {
        onSuccess(question.id, res.message || 'Butir soal berhasil dihapus.');
        onClose();
      } else {
        setErrorMessage(res.error || 'Gagal menghapus butir soal.');
      }
    } catch (err) {
      console.error('Error saat hapus soal:', err);
      setErrorMessage('Terjadi kendala koneksi server. Silakan coba lagi.');
    } finally {
      setIsDeleting(false);
    }
  };

  const modalContent = (
    <div
      onClick={(e) => {
        if (e.target === e.currentTarget && !isDeleting) {
          onClose();
        }
      }}
      className="fixed inset-0 z-[9999] bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto animate-fade-in"
    >
      <div className="bg-white rounded-3xl max-w-md w-full p-6 sm:p-7 shadow-2xl border border-slate-100 relative space-y-5 animate-scale-in my-auto">
        {/* Tombol Tutup X */}
        <button
          onClick={onClose}
          disabled={isDeleting}
          className="absolute right-4 top-4 p-2 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-full transition-colors disabled:opacity-50"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Ikon & Judul */}
        <div className="text-center space-y-2">
          <div className="w-14 h-14 rounded-2xl bg-rose-50 text-rose-600 border border-rose-100 flex items-center justify-center mx-auto shadow-2xs">
            <Trash2 className="w-7 h-7" />
          </div>
          <h3 className="text-xl font-extrabold text-slate-900 tracking-tight">
            Hapus Butir Soal Ini?
          </h3>
          <p className="text-xs sm:text-sm text-slate-500 leading-relaxed max-w-xs mx-auto">
            Tindakan ini akan menonaktifkan soal dari lembar placement test peserta berikutnya.
          </p>
        </div>

        {/* Cuplikan Teks Pertanyaan */}
        <div className="bg-slate-50 border border-slate-200/80 rounded-2xl p-4 space-y-2 text-xs sm:text-sm">
          <div className="flex items-center gap-1.5 text-slate-400 font-semibold text-xs">
            <HelpCircle className="w-3.5 h-3.5 text-slate-400" />
            <span>Teks Soal:</span>
          </div>
          <p className="text-slate-800 font-semibold italic line-clamp-3 leading-relaxed">
            &ldquo;{question.questionText}&rdquo;
          </p>
          <div className="pt-2 text-xs text-slate-500 flex items-center justify-between border-t border-slate-200/60">
            <span>Jumlah Opsi:</span>
            <span className="font-bold text-slate-700">
              {question.options.length} Pilihan Jawaban
            </span>
          </div>
        </div>

        {/* Info Keamanan Soft Delete */}
        <div className="p-3 rounded-xl bg-amber-50 border border-amber-200/80 text-amber-900 flex items-start gap-2.5 text-xs">
          <ShieldCheck className="w-4 h-4 text-amber-600 flex-shrink-0 mt-0.5" />
          <p className="leading-relaxed">
            <strong>Proteksi Data Historis:</strong> Soal dihapus secara aman (*Soft Delete*). Riwayat jawaban seluruh siswa terdahulu yang pernah menjawab soal ini akan tetap tersimpan utuh di database.
          </p>
        </div>

        {/* Error Alert */}
        {errorMessage && (
          <div className="p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-800 text-xs flex items-center gap-2">
            <AlertTriangle className="w-4 h-4 text-rose-600 flex-shrink-0" />
            <span>{errorMessage}</span>
          </div>
        )}

        {/* Tombol Aksi */}
        <div className="flex items-center gap-3 pt-2">
          <button
            type="button"
            onClick={onClose}
            disabled={isDeleting}
            className="flex-1 py-2.5 rounded-xl border border-slate-200 hover:bg-slate-50 text-slate-700 font-bold text-xs sm:text-sm transition-colors disabled:opacity-50"
          >
            Batal
          </button>

          <button
            type="button"
            onClick={handleDelete}
            disabled={isDeleting}
            className="flex-1 inline-flex items-center justify-center gap-2 py-2.5 rounded-xl bg-rose-600 hover:bg-rose-700 text-white font-bold text-xs sm:text-sm transition-colors shadow-xs disabled:opacity-50"
          >
            {isDeleting ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                <span>Menghapus...</span>
              </>
            ) : (
              <>
                <Trash2 className="w-4 h-4" />
                <span>Ya, Hapus Soal</span>
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );

  return createPortal(modalContent, document.body);
};
