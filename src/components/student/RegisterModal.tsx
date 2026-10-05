'use client';

import React, { useState } from 'react';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { X, Loader2, AlertCircle, CheckCircle, ArrowRight, UserX } from 'lucide-react';
import { startSession } from '@/app/actions/session';

interface RegisterModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function RegisterModal({ isOpen, onClose }: RegisterModalProps) {
  const router = useRouter();
  const [name, setName] = useState('');
  const [whatsapp, setWhatsapp] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  // Status Dialog Modal Khusus (Belum Terdaftar / Sudah Selesai)
  const [statusDialog, setStatusDialog] = useState<{
    type: 'not_registered' | 'session_blocked';
    title: string;
    message: string;
  } | null>(null);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);
    setStatusDialog(null);

    const trimmedName = name.trim();
    const trimmedWA = whatsapp.trim();

    if (!trimmedName || trimmedName.length < 2) {
      setErrorMessage('Nama lengkap wajib diisi minimal 2 karakter.');
      return;
    }

    if (!trimmedWA) {
      setErrorMessage('Nomor WhatsApp wajib diisi.');
      return;
    }

    try {
      setIsLoading(true);

      // Panggil Server Action startSession (jenjang otomatis dicocokkan dari database)
      const result = await startSession(trimmedName, trimmedWA);

      if (!result.success) {
        setIsLoading(false);

        if (result.code === 'NOT_REGISTERED') {
          setStatusDialog({
            type: 'not_registered',
            title: 'Data Belum Terdaftar di Meja Registrasi',
            message:
              result.error ||
              `Data atas nama "${trimmedName}" dengan nomor WhatsApp ini belum terdaftar di sistem. Silakan temui staf Up Speaking di meja pendaftaran untuk registrasi terlebih dahulu.`,
          });
          return;
        }

        if (result.code === 'SESSION_BLOCKED') {
          setStatusDialog({
            type: 'session_blocked',
            title: 'Tes Penempatan Telah Selesai',
            message:
              result.error ||
              `Anda telah menyelesaikan tes penempatan sebelumnya. Hasil pengerjaan Anda sedang atau telah dievaluasi oleh Tutor kami. Hubungi staf/tutor jika Anda memerlukan izin tes ulang.`,
          });
          return;
        }

        setErrorMessage(result.error);
        return;
      }

      // Simpan status sesi dan lembar soal ke LocalStorage untuk Crash Recovery
      if (typeof window !== 'undefined') {
        localStorage.setItem('upspeaking_session', JSON.stringify(result.session));
        localStorage.setItem('upspeaking_questions', JSON.stringify(result.questions));
        if (result.savedAnswers) {
          localStorage.setItem('upspeaking_answers', JSON.stringify(result.savedAnswers));
        } else {
          localStorage.removeItem('upspeaking_answers');
        }
      }

      // Navigasi langsung ke ruang ujian
      router.push('/exam');
    } catch (err) {
      console.error('Gagal memulai sesi:', err);
      setErrorMessage('Terjadi gangguan jaringan. Silakan coba sesaat lagi.');
      setIsLoading(false);
    }
  };

  const handleNameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    // Hanya izinkan huruf, spasi, petik tunggal ('), titik (.), dan strip (-)
    const filtered = e.target.value.replace(/[^a-zA-Z\s'.\-]/g, '');
    setName(filtered);
  };

  const handleWhatsAppChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    // Hanya izinkan angka (digits only) dan batasi maksimal 15 digit
    const digitsOnly = e.target.value.replace(/\D/g, '').slice(0, 15);
    setWhatsapp(digitsOnly);
  };

  return (
    <div
      role="dialog"
      aria-modal="true"
      className="fixed inset-0 z-50 bg-slate-900/50 backdrop-blur-sm flex flex-col justify-end sm:justify-center items-center p-0 sm:p-4 transition-all duration-300"
      onClick={onClose}
    >
      <div
        className="w-full sm:max-w-[460px] bg-white rounded-t-[32px] sm:rounded-3xl p-5 sm:p-8 shadow-2xl border border-slate-100 transition-all duration-300 transform sm:scale-100"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Mobile Pull Handle Bar */}
        <div className="w-12 h-1.5 bg-slate-200 rounded-full mx-auto mb-4 sm:hidden" />

        {/* Modal Header */}
        <div className="flex items-start justify-between gap-2.5 sm:gap-3 mb-5 sm:mb-6">
          <div className="flex items-center gap-2.5 sm:gap-3 min-w-0">
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
            <div className="min-w-0">
              <h2 className="font-bold text-slate-900 text-sm min-[375px]:text-[15px] sm:text-lg leading-tight whitespace-nowrap">
                Verifikasi Peserta Ujian
              </h2>
              <p className="text-[11px] sm:text-xs text-slate-500 mt-0.5 leading-snug">
                Masukkan nama &amp; nomor WA yang telah didaftarkan Admin
              </p>
            </div>
          </div>

          {/* Close Button */}
          <button
            type="button"
            onClick={onClose}
            aria-label="Tutup formulir pendaftaran"
            className="w-7 h-7 sm:w-8 sm:h-8 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-500 hover:text-slate-700 flex items-center justify-center transition-colors focus:outline-none focus:ring-2 focus:ring-slate-300 flex-shrink-0 mt-0.5"
          >
            <X className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
          </button>
        </div>

        {/* Status Dialog: Belum Terdaftar di Meja Registrasi */}
        {statusDialog && statusDialog.type === 'not_registered' && (
          <div className="mb-5 p-4 rounded-2xl bg-amber-50 border border-amber-200/80 text-amber-900 animate-fade-in">
            <div className="flex items-start gap-3">
              <div className="w-9 h-9 rounded-xl bg-amber-100 text-amber-700 flex items-center justify-center shrink-0 mt-0.5">
                <UserX className="w-5 h-5" />
              </div>
              <div className="flex-1">
                <h3 className="font-bold text-sm text-amber-900 leading-tight">
                  {statusDialog.title}
                </h3>
                <p className="text-xs text-amber-700 mt-1 leading-relaxed">
                  {statusDialog.message}
                </p>
                <div className="mt-3 pt-2.5 border-t border-amber-200/60 flex items-center justify-between gap-2">
                  <span className="text-[11px] font-medium text-amber-800">
                    💡 Meja Registrasi Up Speaking
                  </span>
                  <button
                    type="button"
                    onClick={() => setStatusDialog(null)}
                    className="text-xs font-bold text-amber-900 underline hover:text-amber-700"
                  >
                    Periksa Kembali
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Status Dialog: Sesi Sudah Pernah Diselesaikan */}
        {statusDialog && statusDialog.type === 'session_blocked' && (
          <div className="mb-5 p-4 rounded-2xl bg-sky-50 border border-sky-200/80 text-sky-900 animate-fade-in">
            <div className="flex items-start gap-3">
              <div className="w-9 h-9 rounded-xl bg-sky-100 text-sky-700 flex items-center justify-center shrink-0 mt-0.5">
                <CheckCircle className="w-5 h-5" />
              </div>
              <div className="flex-1">
                <h3 className="font-bold text-sm text-sky-900 leading-tight">
                  {statusDialog.title}
                </h3>
                <p className="text-xs text-sky-700 mt-1 leading-relaxed">
                  {statusDialog.message}
                </p>
                <div className="mt-3 pt-2.5 border-t border-sky-200/60 flex items-center justify-between gap-2">
                  <button
                    type="button"
                    onClick={() => router.push('/result')}
                    className="text-xs font-bold text-sky-800 hover:text-sky-950 inline-flex items-center gap-1"
                  >
                    <span>Buka Halaman Hasil</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </button>
                  <button
                    type="button"
                    onClick={() => setStatusDialog(null)}
                    className="text-xs text-slate-500 hover:text-slate-700"
                  >
                    Tutup
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* General Error Alert */}
        {errorMessage && (
          <div className="mb-5 p-3.5 rounded-2xl bg-rose-50 border border-rose-200 text-rose-700 text-xs sm:text-sm flex items-start gap-2.5 animate-fade-in">
            <AlertCircle className="w-4 h-4 text-rose-500 mt-0.5 flex-shrink-0" />
            <span className="leading-relaxed">{errorMessage}</span>
          </div>
        )}

        {/* Form Verifikasi Masuk */}
        <form onSubmit={handleSubmit} className="space-y-4 sm:space-y-4.5">
          {/* Field: Nama Lengkap Siswa */}
          <div>
            <label
              htmlFor="student-name"
              className="block text-xs sm:text-sm font-semibold text-slate-800 mb-1.5"
            >
              Nama Lengkap Siswa <span className="text-rose-500 font-bold">*</span>
            </label>
            <input
              id="student-name"
              type="text"
              required
              autoComplete="name"
              maxLength={100}
              disabled={isLoading}
              value={name}
              onChange={handleNameChange}
              placeholder="Contoh: Budi Santoso"
              className="w-full px-4 py-3.5 rounded-2xl border border-slate-200 bg-white focus:outline-none focus:border-[#0284c7] focus:ring-4 focus:ring-sky-100 text-slate-800 placeholder:text-slate-400 text-sm transition-all"
            />
            <p className="text-[11px] text-slate-400 mt-1">
              Gunakan nama yang didaftarkan staf di meja pendaftaran.
            </p>
          </div>

          {/* Field: Nomor WhatsApp Aktif */}
          <div>
            <label
              htmlFor="whatsapp-number"
              className="block text-xs sm:text-sm font-semibold text-slate-800 mb-1.5"
            >
              Nomor WhatsApp Aktif <span className="text-rose-500 font-bold">*</span>
            </label>
            <input
              id="whatsapp-number"
              type="tel"
              inputMode="numeric"
              pattern="[0-9]*"
              maxLength={15}
              required
              disabled={isLoading}
              value={whatsapp}
              onChange={handleWhatsAppChange}
              placeholder="Contoh: 081234567890"
              className="w-full px-4 py-3.5 rounded-2xl border border-slate-200 bg-white focus:outline-none focus:border-[#0284c7] focus:ring-4 focus:ring-sky-100 text-slate-800 placeholder:text-slate-400 text-sm transition-all"
            />
            <p className="text-[11px] text-slate-400 mt-1 leading-normal">
              Jenjang soal &amp; kontak tutor akan otomatis disesuaikan dari data registrasi Anda.
            </p>
          </div>

          {/* Submit Button */}
          <div className="pt-2">
            <button
              type="submit"
              disabled={isLoading}
              className="w-full py-4 px-6 text-sm sm:text-base font-bold text-white bg-gradient-to-r from-[#e11d48] to-[#f43f5e] hover:from-[#be123c] hover:to-[#e11d48] rounded-2xl shadow-lg shadow-rose-500/25 hover:shadow-rose-500/40 transform hover:-translate-y-0.5 active:translate-y-0 transition-all duration-200 cursor-pointer disabled:opacity-70 disabled:cursor-not-allowed disabled:transform-none flex items-center justify-center gap-2 focus:outline-none focus:ring-4 focus:ring-rose-200"
            >
              {isLoading ? (
                <>
                  <Loader2 className="w-5 h-5 animate-spin" />
                  <span>Memeriksa Pendaftaran...</span>
                </>
              ) : (
                <>
                  <span>Mulai Mengerjakan Ujian</span>
                  <span className="text-base sm:text-lg">→</span>
                </>
              )}
            </button>
          </div>
        </form>

        {/* Micro Footer Notice */}
        <p className="text-center text-[11px] text-slate-400 mt-4">
          Belum terdaftar? Temui staf kami di meja registrasi lembaga.
        </p>
      </div>
    </div>
  );
}
