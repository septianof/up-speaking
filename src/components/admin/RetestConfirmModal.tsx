'use client';

import React, { useState } from 'react';
import {
  RotateCcw,
  X,
  AlertTriangle,
  CheckCircle2,
  Loader2,
  User,
  Phone,
  ShieldCheck,
  XCircle,
} from 'lucide-react';
import { StudentHistoryRecord, toggleRetestPermission } from '@/app/actions/admin';

interface RetestConfirmModalProps {
  isOpen: boolean;
  onClose: () => void;
  record: StudentHistoryRecord | null;
  onSuccess: (sessionId: string, newCanRetest: boolean, message: string) => void;
}

export const RetestConfirmModal: React.FC<RetestConfirmModalProps> = ({
  isOpen,
  onClose,
  record,
  onSuccess,
}) => {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  if (!isOpen || !record) return null;

  const isGranting = !record.canRetest;

  const handleSubmit = async () => {
    setIsSubmitting(true);
    setErrorMessage(null);

    try {
      const targetState = isGranting;
      const res = await toggleRetestPermission(record.id, targetState);

      if (res.success) {
        onSuccess(
          record.id,
          targetState,
          res.message ||
            (targetState
              ? 'Izin tes ulang berhasil diaktifkan!'
              : 'Izin tes ulang telah dicabut.')
        );
        onClose();
      } else {
        setErrorMessage(res.error || 'Gagal mengubah izin tes ulang.');
      }
    } catch (err) {
      console.error('Error saat konfirmasi tes ulang:', err);
      setErrorMessage('Terjadi kendala koneksi server. Silakan coba sesaat lagi.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 animate-fade-in">
      <div className="bg-white rounded-3xl max-w-md w-full p-6 sm:p-7 shadow-2xl border border-slate-100 relative space-y-5 animate-scale-in">
        {/* Tombol Tutup X */}
        <button
          onClick={onClose}
          disabled={isSubmitting}
          className="absolute right-4 top-4 p-2 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-full transition-colors disabled:opacity-50"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Icon & Judul */}
        <div className="text-center space-y-2">
          <div
            className={`w-14 h-14 rounded-2xl flex items-center justify-center mx-auto shadow-2xs ${
              isGranting
                ? 'bg-sky-50 text-sky-600 border border-sky-100'
                : 'bg-amber-50 text-amber-600 border border-amber-100'
            }`}
          >
            {isGranting ? (
              <RotateCcw className="w-7 h-7" />
            ) : (
              <XCircle className="w-7 h-7" />
            )}
          </div>
          <h3 className="text-xl font-extrabold text-slate-900 tracking-tight">
            {isGranting ? 'Izinkan Tes Ulang?' : 'Cabut Izin Tes Ulang?'}
          </h3>
          <p className="text-xs sm:text-sm text-slate-500 leading-relaxed max-w-xs mx-auto">
            {isGranting
              ? 'Siswa akan diizinkan memulai 1x sesi placement test baru tanpa menghapus riwayat nilai sebelumnya.'
              : 'Akses tes ulang untuk siswa ini akan dikunci kembali.'}
          </p>
        </div>

        {/* Kartu Detail Siswa */}
        <div className="bg-slate-50 border border-slate-200/80 rounded-2xl p-4 space-y-2.5 text-xs sm:text-sm">
          <div className="flex items-center justify-between">
            <span className="text-slate-500 flex items-center gap-1.5">
              <User className="w-3.5 h-3.5 text-slate-400" />
              <span>Nama Siswa:</span>
            </span>
            <strong className="text-slate-900 font-bold">{record.studentName}</strong>
          </div>

          <div className="flex items-center justify-between">
            <span className="text-slate-500 flex items-center gap-1.5">
              <Phone className="w-3.5 h-3.5 text-slate-400" />
              <span>Nomor WhatsApp:</span>
            </span>
            <strong className="font-mono text-slate-800 font-medium">
              {record.whatsappNumber}
            </strong>
          </div>

          <div className="flex items-center justify-between pt-1 border-t border-slate-200/60">
            <span className="text-slate-500">Skor Sebelumnya:</span>
            <span className="font-bold text-slate-800">
              {record.finalScorePercent}% ({record.levelName})
            </span>
          </div>
        </div>

        {/* Catatan Penting */}
        <div className="p-3 rounded-xl bg-sky-50 border border-sky-100 text-sky-900 flex items-start gap-2.5 text-xs">
          <ShieldCheck className="w-4 h-4 text-sky-600 flex-shrink-0 mt-0.5" />
          <p className="leading-relaxed">
            {isGranting ? (
              <>
                Siswa dapat langsung memasukkan nama dan nomor WhatsApp di halaman web utama (<strong>/</strong>) untuk mulai tes baru.
              </>
            ) : (
              <>
                Siswa tidak akan dapat memulai sesi baru hingga izin diberikan kembali oleh admin.
              </>
            )}
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
            disabled={isSubmitting}
            className="flex-1 py-2.5 rounded-xl border border-slate-200 hover:bg-slate-50 text-slate-700 font-bold text-xs sm:text-sm transition-colors disabled:opacity-50"
          >
            Batal
          </button>

          <button
            type="button"
            onClick={handleSubmit}
            disabled={isSubmitting}
            className={`flex-1 inline-flex items-center justify-center gap-2 py-2.5 rounded-xl text-white font-bold text-xs sm:text-sm transition-colors shadow-xs disabled:opacity-50 ${
              isGranting
                ? 'bg-sky-600 hover:bg-sky-700'
                : 'bg-rose-600 hover:bg-rose-700'
            }`}
          >
            {isSubmitting ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                <span>Memproses...</span>
              </>
            ) : isGranting ? (
              <>
                <RotateCcw className="w-4 h-4" />
                <span>Ya, Berikan Izin</span>
              </>
            ) : (
              <>
                <XCircle className="w-4 h-4" />
                <span>Ya, Cabut Izin</span>
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
};
