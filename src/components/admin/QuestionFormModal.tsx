'use client';

import React, { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import {
  X,
  Plus,
  Trash2,
  CheckCircle2,
  AlertTriangle,
  Loader2,
  BookOpen,
  HelpCircle,
  Check,
} from 'lucide-react';
import {
  AdminQuestion,
  saveQuestion,
  SaveQuestionOptionInput,
} from '@/app/actions/questions';

interface QuestionFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  questionToEdit: AdminQuestion | null;
  onSuccess: (message: string) => void;
}

const OPTION_LETTERS = ['A', 'B', 'C', 'D', 'E', 'F', 'G', 'H'];

export const QuestionFormModal: React.FC<QuestionFormModalProps> = ({
  isOpen,
  onClose,
  questionToEdit,
  onSuccess,
}) => {
  const [mounted, setMounted] = useState(false);
  const [questionText, setQuestionText] = useState('');
  const [options, setOptions] = useState<SaveQuestionOptionInput[]>([
    { optionText: '', isCorrect: true },
    { optionText: '', isCorrect: false },
    { optionText: '', isCorrect: false },
    { optionText: '', isCorrect: false },
  ]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [validationError, setValidationError] = useState<string | null>(null);

  useEffect(() => {
    setMounted(true);
  }, []);

  // Inisialisasi data form saat modal dibuka atau saat questionToEdit berubah
  useEffect(() => {
    if (isOpen) {
      setValidationError(null);
      if (questionToEdit) {
        setQuestionText(questionToEdit.questionText);
        setOptions(
          questionToEdit.options.map((opt) => ({
            id: opt.id,
            optionText: opt.optionText,
            isCorrect: opt.isCorrect,
          }))
        );
      } else {
        setQuestionText('');
        setOptions([
          { optionText: '', isCorrect: true },
          { optionText: '', isCorrect: false },
          { optionText: '', isCorrect: false },
          { optionText: '', isCorrect: false },
        ]);
      }
    }
  }, [isOpen, questionToEdit]);

  // Handle ESC key press
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen && !isSubmitting) {
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, isSubmitting, onClose]);

  if (!isOpen || !mounted) return null;

  const isEditMode = Boolean(questionToEdit);

  // Aksi ubah teks opsi
  const handleOptionTextChange = (index: number, text: string) => {
    setOptions((prev) => {
      const next = [...prev];
      next[index] = { ...next[index], optionText: text };
      return next;
    });
    setValidationError(null);
  };

  // Aksi pilih kunci jawaban
  const handleSelectCorrect = (index: number) => {
    setOptions((prev) =>
      prev.map((opt, i) => ({
        ...opt,
        isCorrect: i === index,
      }))
    );
    setValidationError(null);
  };

  // Aksi tambah baris opsi baru
  const handleAddOption = () => {
    if (options.length >= 8) {
      setValidationError('Maksimal 8 pilihan jawaban per soal.');
      return;
    }
    setOptions((prev) => [...prev, { optionText: '', isCorrect: false }]);
    setValidationError(null);
  };

  // Aksi hapus baris opsi
  const handleRemoveOption = (indexToRemove: number) => {
    if (options.length <= 2) {
      setValidationError('Minimal harus ada 2 pilihan jawaban.');
      return;
    }

    setOptions((prev) => {
      const removedWasCorrect = prev[indexToRemove].isCorrect;
      const next = prev.filter((_, i) => i !== indexToRemove);

      // Jika yang dihapus adalah kunci jawaban benar, set opsi pertama sebagai kunci baru
      if (removedWasCorrect && next.length > 0) {
        next[0].isCorrect = true;
      }
      return next;
    });
    setValidationError(null);
  };

  // Submit Handler
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setValidationError(null);

    // Validasi Teks Soal
    if (!questionText.trim() || questionText.trim().length < 5) {
      setValidationError(
        'Teks pertanyaan tidak boleh kosong (minimal 5 karakter).'
      );
      return;
    }

    // Validasi Minimal 2 Opsi
    if (options.length < 2) {
      setValidationError('Soal harus memiliki minimal 2 pilihan jawaban.');
      return;
    }

    // Validasi Kelengkapan Opsi
    const hasEmptyOption = options.some(
      (opt) => !opt.optionText || opt.optionText.trim().length === 0
    );
    if (hasEmptyOption) {
      setValidationError(
        'Seluruh baris pilihan jawaban harus diisi teksnya.'
      );
      return;
    }

    // Validasi Kunci Jawaban
    const correctCount = options.filter((opt) => opt.isCorrect).length;
    if (correctCount !== 1) {
      setValidationError(
        'Wajib memilih tepat satu opsi sebagai kunci jawaban yang benar.'
      );
      return;
    }

    setIsSubmitting(true);

    try {
      const res = await saveQuestion({
        id: questionToEdit ? questionToEdit.id : undefined,
        questionText: questionText.trim(),
        options: options.map((opt) => ({
          id: opt.id,
          optionText: opt.optionText.trim(),
          isCorrect: opt.isCorrect,
        })),
      });

      if (res.success) {
        onSuccess(res.message);
        onClose();
      } else {
        setValidationError(res.error || 'Gagal menyimpan butir soal.');
      }
    } catch (err) {
      console.error('Error saat menyimpan butir soal:', err);
      setValidationError(
        'Terjadi kendala koneksi server. Silakan coba kembali.'
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  const modalContent = (
    <div
      onClick={(e) => {
        if (e.target === e.currentTarget && !isSubmitting) {
          onClose();
        }
      }}
      className="fixed inset-0 z-[9999] bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto animate-fade-in"
    >
      <div className="bg-white rounded-3xl max-w-2xl w-full p-6 sm:p-8 shadow-2xl border border-slate-100 relative space-y-6 animate-scale-in my-auto">
        {/* Tombol Tutup X */}
        <button
          onClick={onClose}
          disabled={isSubmitting}
          className="absolute right-5 top-5 p-2 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-full transition-colors disabled:opacity-50"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Header Form */}
        <div className="flex items-start gap-4">
          <div className="w-12 h-12 rounded-2xl bg-sky-50 text-sky-600 border border-sky-100 flex items-center justify-center flex-shrink-0 shadow-2xs">
            <BookOpen className="w-6 h-6" />
          </div>
          <div>
            <h3 className="text-xl font-extrabold text-slate-900 tracking-tight">
              {isEditMode ? 'Edit Butir Soal' : 'Tambah Soal Baru'}
            </h3>
            <p className="text-xs sm:text-sm text-slate-500 mt-0.5">
              {isEditMode
                ? 'Perbarui teks pertanyaan, opsi jawaban dinamis, atau kunci jawaban.'
                : 'Isi butir pertanyaan placement test baru dan tentukan kunci jawaban benar.'}
            </p>
          </div>
        </div>

        {/* Error Alert */}
        {validationError && (
          <div className="p-3.5 rounded-2xl bg-rose-50 border border-rose-200 text-rose-800 text-xs sm:text-sm flex items-start gap-2.5 animate-fade-in">
            <AlertTriangle className="w-4 h-4 text-rose-600 flex-shrink-0 mt-0.5" />
            <span className="font-semibold">{validationError}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Input Teks Pertanyaan */}
          <div className="space-y-2">
            <label className="block text-xs sm:text-sm font-bold text-slate-800 flex items-center gap-1.5">
              <HelpCircle className="w-4 h-4 text-sky-600" />
              <span>Teks Pertanyaan / Soal</span>
              <span className="text-rose-500">*</span>
            </label>
            <textarea
              rows={3}
              value={questionText}
              onChange={(e) => {
                setQuestionText(e.target.value);
                setValidationError(null);
              }}
              placeholder="Contoh: Neither Sarah nor her colleagues ________ able to attend the national seminar yesterday."
              className="w-full p-3.5 rounded-2xl bg-slate-50 border border-slate-200 focus:bg-white focus:border-sky-500 focus:ring-2 focus:ring-sky-100 outline-none text-xs sm:text-sm text-slate-900 placeholder-slate-400 transition-all font-medium leading-relaxed resize-y"
            />
            <div className="flex justify-between items-center text-[11px] text-slate-400 px-1">
              <span>Gunakan format titik-titik (________) untuk soal rumpang.</span>
              <span>{questionText.length} karakter</span>
            </div>
          </div>

          {/* Deret Opsi Jawaban Dinamis */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <label className="text-xs sm:text-sm font-bold text-slate-800 flex items-center gap-1.5">
                <span>Pilihan Jawaban & Kunci Benar</span>
                <span className="text-rose-500">*</span>
              </label>
              <span className="text-[11px] text-slate-400">
                Pilih radio button hijau untuk opsi yang benar
              </span>
            </div>

            <div className="space-y-2.5 max-h-[300px] overflow-y-auto pr-1">
              {options.map((opt, index) => {
                const letter =
                  OPTION_LETTERS[index] || (index + 1).toString();
                const isOnlyTwo = options.length <= 2;

                return (
                  <div
                    key={index}
                    className={`flex items-center gap-2.5 p-2.5 rounded-2xl border transition-all ${
                      opt.isCorrect
                        ? 'bg-emerald-50/70 border-emerald-300 ring-2 ring-emerald-100'
                        : 'bg-slate-50 border-slate-200 focus-within:bg-white focus-within:border-sky-300'
                    }`}
                  >
                    {/* Huruf Label Opsi */}
                    <span
                      className={`w-8 h-8 rounded-xl font-extrabold text-xs flex items-center justify-center flex-shrink-0 transition-colors ${
                        opt.isCorrect
                          ? 'bg-emerald-600 text-white shadow-2xs'
                          : 'bg-white border border-slate-200 text-slate-700'
                      }`}
                    >
                      {letter}
                    </span>

                    {/* Input Teks Opsi */}
                    <input
                      type="text"
                      value={opt.optionText}
                      onChange={(e) =>
                        handleOptionTextChange(index, e.target.value)
                      }
                      placeholder={`Teks pilihan jawaban ${letter}...`}
                      className="flex-1 bg-transparent border-none outline-none text-xs sm:text-sm text-slate-900 placeholder-slate-400 font-medium"
                    />

                    {/* Radio Button Kunci Jawaban */}
                    <button
                      type="button"
                      onClick={() => handleSelectCorrect(index)}
                      className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${
                        opt.isCorrect
                          ? 'bg-emerald-600 text-white shadow-2xs'
                          : 'bg-white hover:bg-slate-100 text-slate-500 border border-slate-200'
                      }`}
                      title="Tandai opsi ini sebagai kunci jawaban benar"
                    >
                      {opt.isCorrect ? (
                        <>
                          <Check className="w-3.5 h-3.5 stroke-[3]" />
                          <span className="hidden sm:inline">KUNCI</span>
                        </>
                      ) : (
                        <span className="text-[11px]">Jadikan Kunci</span>
                      )}
                    </button>

                    {/* Tombol Hapus Opsi */}
                    <button
                      type="button"
                      onClick={() => handleRemoveOption(index)}
                      disabled={isOnlyTwo}
                      className={`p-2 rounded-xl text-slate-400 transition-colors ${
                        isOnlyTwo
                          ? 'opacity-30 cursor-not-allowed'
                          : 'hover:text-rose-600 hover:bg-rose-50'
                      }`}
                      title={
                        isOnlyTwo
                          ? 'Minimal harus ada 2 opsi jawaban'
                          : 'Hapus pilihan ini'
                      }
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                );
              })}
            </div>

            {/* Tombol Tambah Pilihan Baru */}
            {options.length < 8 && (
              <button
                type="button"
                onClick={handleAddOption}
                className="w-full py-2.5 rounded-2xl border-2 border-dashed border-slate-200 hover:border-sky-400 hover:bg-sky-50/50 text-slate-600 hover:text-sky-700 text-xs font-bold transition-all flex items-center justify-center gap-2"
              >
                <Plus className="w-4 h-4 text-sky-600" />
                <span>
                  Tambah Pilihan Jawaban ({OPTION_LETTERS[options.length] || '+'})
                </span>
              </button>
            )}
          </div>

          {/* Footer Tombol Aksi */}
          <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-100">
            <button
              type="button"
              onClick={onClose}
              disabled={isSubmitting}
              className="px-5 py-2.5 rounded-xl border border-slate-200 hover:bg-slate-50 text-slate-700 font-bold text-xs sm:text-sm transition-colors disabled:opacity-50"
            >
              Batal
            </button>

            <button
              type="submit"
              disabled={isSubmitting}
              className="inline-flex items-center gap-2 px-6 py-2.5 rounded-xl bg-[#0e263e] hover:bg-[#1a385c] text-white font-bold text-xs sm:text-sm transition-colors shadow-xs disabled:opacity-50"
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>Menyimpan...</span>
                </>
              ) : (
                <>
                  <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                  <span>{isEditMode ? 'Simpan Perubahan' : 'Terbitkan Soal'}</span>
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );

  return createPortal(modalContent, document.body);
};
