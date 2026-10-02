'use client';

import React, { useState } from 'react';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { X, Loader2, AlertCircle } from 'lucide-react';
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

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);

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

      const result = await startSession(trimmedName, trimmedWA);

      if (!result.success) {
        setErrorMessage(result.error);
        setIsLoading(false);
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
    // Menolak angka dan simbol aneh tanpa menghambat nama sah (misal: Syafi'i, M. Rizky)
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
        className="w-full sm:max-w-[480px] bg-white rounded-t-[32px] sm:rounded-3xl p-5 sm:p-8 shadow-2xl border border-slate-100 transition-all duration-300 transform sm:scale-100"
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
                Data Peserta Placement Test
              </h2>
              <p className="text-[11px] sm:text-xs text-slate-500 mt-0.5 leading-snug">
                Isi nama dan nomor WhatsApp untuk memuat lembar soal
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

        {/* Error Alert */}
        {errorMessage && (
          <div className="mb-5 p-3.5 rounded-2xl bg-rose-50 border border-rose-200 text-rose-700 text-xs sm:text-sm flex items-start gap-2.5 animate-shake">
            <AlertCircle className="w-4 h-4 text-rose-500 mt-0.5 flex-shrink-0" />
            <span className="leading-relaxed">{errorMessage}</span>
          </div>
        )}

        {/* Form Registration */}
        <form onSubmit={handleSubmit} className="space-y-4 sm:space-y-5">
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
              placeholder="Contoh: Budi Pratama"
              className="w-full px-4 py-3.5 rounded-2xl border border-slate-200 bg-white focus:outline-none focus:border-[#0284c7] focus:ring-4 focus:ring-sky-100 text-slate-800 placeholder:text-slate-400 text-sm transition-all"
            />
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
              placeholder="Contoh: 08123456789"
              className="w-full px-4 py-3.5 rounded-2xl border border-slate-200 bg-white focus:outline-none focus:border-[#0284c7] focus:ring-4 focus:ring-sky-100 text-slate-800 placeholder:text-slate-400 text-sm transition-all"
            />
            <p className="text-xs text-slate-400 mt-1.5 leading-normal">
              Hasil skor &amp; rekomendasi level akan disesuaikan dengan nomor ini.
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
                  <span>Menyiapkan Lembar Ujian...</span>
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
      </div>
    </div>
  );
}
