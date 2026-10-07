'use client';

import React, { useState, useEffect } from 'react';
import {
  X,
  Award,
  Clock,
  CheckCircle2,
  AlertCircle,
  Loader2,
  Sparkles,
  Trophy,
  GraduationCap,
  Calendar,
} from 'lucide-react';
import { TutorQueueItem } from '@/types';
import { AvailableLevel, gradeSession } from '@/app/actions/tutor';

interface GradeModalProps {
  isOpen: boolean;
  onClose: () => void;
  item: TutorQueueItem | null;
  availableLevels: AvailableLevel[];
  onSuccess: (sessionId: string, assignedLevelId: number, levelName: string, message: string) => void;
}

export const GradeModal: React.FC<GradeModalProps> = ({
  isOpen,
  onClose,
  item,
  availableLevels,
  onSuccess,
}) => {
  const [selectedLevelId, setSelectedLevelId] = useState<number | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  // Inisialisasi level terpilih saat modal dibuka
  useEffect(() => {
    if (item?.assignedLevelId) {
      setSelectedLevelId(item.assignedLevelId);
    } else {
      setSelectedLevelId(null);
    }
    setErrorMessage(null);
  }, [item, isOpen]);

  if (!isOpen || !item) return null;

  const formatDateTime = (dateStr: string) => {
    try {
      const d = new Date(dateStr);
      return (
        new Intl.DateTimeFormat('id-ID', {
          day: '2-digit',
          month: 'short',
          year: 'numeric',
          hour: '2-digit',
          minute: '2-digit',
          hour12: false,
        }).format(d) + ' WIB'
      );
    } catch {
      return dateStr;
    }
  };

  const getLevelStyle = (name: string, isSelected: boolean) => {
    const lower = name.toLowerCase();
    if (lower.includes('beginner')) {
      return {
        icon: <Sparkles className={`w-5 h-5 ${isSelected ? 'text-emerald-600' : 'text-slate-400'}`} />,
        badge: 'text-emerald-700 bg-emerald-50 border-emerald-200',
        ring: isSelected ? 'border-emerald-500 ring-2 ring-emerald-500/20 bg-emerald-50/40' : 'border-slate-200 hover:border-slate-300 bg-white',
        bullet: isSelected ? 'bg-emerald-500' : 'bg-slate-300',
      };
    }
    if (lower.includes('intermediate')) {
      return {
        icon: <Award className={`w-5 h-5 ${isSelected ? 'text-amber-600' : 'text-slate-400'}`} />,
        badge: 'text-amber-700 bg-amber-50 border-amber-200',
        ring: isSelected ? 'border-amber-500 ring-2 ring-amber-500/20 bg-amber-50/40' : 'border-slate-200 hover:border-slate-300 bg-white',
        bullet: isSelected ? 'bg-amber-500' : 'bg-slate-300',
      };
    }
    return {
      icon: <Trophy className={`w-5 h-5 ${isSelected ? 'text-indigo-600' : 'text-slate-400'}`} />,
      badge: 'text-indigo-700 bg-indigo-50 border-indigo-200',
      ring: isSelected ? 'border-indigo-500 ring-2 ring-indigo-500/20 bg-indigo-50/40' : 'border-slate-200 hover:border-slate-300 bg-white',
      bullet: isSelected ? 'bg-indigo-500' : 'bg-slate-300',
    };
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);

    if (!selectedLevelId) {
      setErrorMessage('Harap pilih salah satu level penempatan resmi.');
      return;
    }

    setIsSubmitting(true);

    try {
      const res = await gradeSession(item.id, selectedLevelId);

      if (res.success) {
        const chosen = availableLevels.find((l) => l.id === selectedLevelId);
        onSuccess(
          item.id,
          selectedLevelId,
          chosen?.name || 'Graded',
          res.message || 'Penetapan level berhasil disimpan.'
        );
        onClose();
      } else {
        setErrorMessage(res.error || 'Gagal menyimpan evaluasi tutor.');
      }
    } catch (err) {
      console.error('Error saat submit penetapan level:', err);
      setErrorMessage('Terjadi kendala koneksi saat menyimpan evaluasi.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 bg-slate-900/60 backdrop-blur-xs animate-fade-in">
      <div
        className="w-full max-w-xl bg-white rounded-3xl shadow-2xl border border-slate-100 overflow-hidden flex flex-col max-h-[90vh] animate-scale-in"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header Modal */}
        <div className="flex items-center justify-between p-5 sm:p-6 border-b border-slate-100 bg-slate-50/50">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-[#00a6f4]/10 text-[#00a6f4] flex items-center justify-center flex-shrink-0">
              <Award className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base sm:text-lg font-extrabold text-slate-900 tracking-tight">
                Evaluasi & Penetapan Level Siswa
              </h3>
              <p className="text-xs text-slate-500 mt-0.5">
                Kedaulatan profesional tutor dalam menentukan kelas resmi siswa.
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            disabled={isSubmitting}
            className="p-1.5 rounded-xl text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content Body */}
        <form onSubmit={handleSubmit} className="p-5 sm:p-6 space-y-5 overflow-y-auto flex-1">
          {/* Error Alert */}
          {errorMessage && (
            <div className="p-3.5 rounded-2xl bg-rose-50 border border-rose-200 text-rose-700 text-xs sm:text-sm flex items-start gap-2.5 animate-fade-in">
              <AlertCircle className="w-4 h-4 flex-shrink-0 mt-0.5 text-rose-500" />
              <span>{errorMessage}</span>
            </div>
          )}

          {/* Ringkasan Profil Siswa */}
          <div className="bg-slate-50 rounded-2xl p-4 border border-slate-100 space-y-3">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-full bg-sky-100 text-sky-800 font-extrabold text-sm flex items-center justify-center flex-shrink-0">
                  {item.studentName.charAt(0).toUpperCase()}
                </div>
                <div>
                  <h4 className="font-bold text-slate-900 text-sm">{item.studentName}</h4>
                  <p className="text-xs text-slate-500 font-mono mt-0.5">
                    {item.whatsappNumber}
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-2">
                {item.educationLevel === 'high_school' ? (
                  <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-bold bg-indigo-50 text-indigo-700 border border-indigo-200/80">
                    <GraduationCap className="w-3.5 h-3.5" />
                    <span>High School</span>
                  </span>
                ) : (
                  <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-bold bg-sky-50 text-sky-700 border border-sky-200/80">
                    <GraduationCap className="w-3.5 h-3.5" />
                    <span>Elementary</span>
                  </span>
                )}
              </div>
            </div>

            <div className="flex items-center gap-1.5 text-xs text-slate-500 pt-1 border-t border-slate-200/60">
              <Calendar className="w-3.5 h-3.5 text-slate-400" />
              <span>Selesai tes pada: {formatDateTime(item.completedAt)}</span>
            </div>
          </div>

          {/* Data Performa Objektif */}
          <div>
            <label className="text-xs font-bold text-slate-600 block mb-2 uppercase tracking-wider">
              Data Performa Objektif Pengerjaan
            </label>
            <div className="grid grid-cols-2 gap-3">
              {/* Skor & Akurasi */}
              <div className="bg-white rounded-2xl p-3.5 border border-slate-200 shadow-2xs">
                <span className="text-xs text-slate-500 flex items-center gap-1.5">
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                  <span>Skor Akurasi</span>
                </span>
                <div className="mt-1 flex items-baseline gap-2">
                  <span className="text-2xl font-black text-slate-900">
                    {item.finalScorePercent}%
                  </span>
                  <span className="text-xs font-semibold text-slate-500">
                    ({item.correctAnswers}/{item.totalQuestions} Benar)
                  </span>
                </div>
              </div>

              {/* Durasi Aktual */}
              <div className="bg-white rounded-2xl p-3.5 border border-slate-200 shadow-2xs">
                <span className="text-xs text-slate-500 flex items-center gap-1.5">
                  <Clock className="w-3.5 h-3.5 text-slate-500" />
                  <span>Durasi Aktual</span>
                </span>
                <div className="mt-1 flex items-baseline gap-1.5">
                  <span className="text-2xl font-black text-slate-900">
                    {item.durationMinutes ?? 0}
                  </span>
                  <span className="text-xs font-semibold text-slate-500">Menit pengerjaan</span>
                </div>
              </div>
            </div>
          </div>

          {/* Pilihan Level Resmi */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <label className="text-xs font-bold text-slate-700 uppercase tracking-wider">
                Pilih Level Penempatan Resmi <span className="text-rose-500">*</span>
              </label>
              <span className="text-[11px] text-slate-500">Wewenang profesional tutor</span>
            </div>

            <div className="space-y-2.5">
              {availableLevels.map((lvl) => {
                const isSelected = selectedLevelId === lvl.id;
                const style = getLevelStyle(lvl.name, isSelected);

                return (
                  <div
                    key={lvl.id}
                    onClick={() => setSelectedLevelId(lvl.id)}
                    className={`p-3.5 sm:p-4 rounded-2xl border transition-all cursor-pointer flex items-start gap-3.5 ${style.ring}`}
                  >
                    <div className="mt-0.5">{style.icon}</div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between gap-2">
                        <span className="font-extrabold text-sm text-slate-900">
                          {lvl.name}
                        </span>
                        <div
                          className={`w-4 h-4 rounded-full border flex items-center justify-center ${
                            isSelected
                              ? 'border-[#00a6f4] bg-[#00a6f4]'
                              : 'border-slate-300 bg-white'
                          }`}
                        >
                          {isSelected && <div className="w-1.5 h-1.5 rounded-full bg-white" />}
                        </div>
                      </div>
                      {lvl.description && (
                        <p className="text-xs text-slate-500 mt-1 leading-relaxed">
                          {lvl.description}
                        </p>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Footer Actions */}
          <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-100">
            <button
              type="button"
              onClick={onClose}
              disabled={isSubmitting}
              className="px-4 py-2.5 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 text-slate-700 font-semibold text-xs sm:text-sm transition-colors disabled:opacity-50"
            >
              Batal
            </button>
            <button
              type="submit"
              disabled={isSubmitting || !selectedLevelId}
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-[#0e263e] hover:bg-[#1a385c] text-white font-bold text-xs sm:text-sm transition-colors shadow-xs disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin text-sky-400" />
                  <span>Menyimpan...</span>
                </>
              ) : (
                <>
                  <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                  <span>Konfirmasi & Tetapkan Level</span>
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
