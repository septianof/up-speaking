'use client';

import React, { useState, useEffect } from 'react';
import {
  X,
  UserPlus,
  BookOpen,
  GraduationCap,
  Loader2,
  CheckCircle2,
  AlertCircle,
  Copy,
  Check,
} from 'lucide-react';
import { registerStudent } from '@/app/actions/admin';
import type { EducationLevel } from '@/types';

interface StudentRegisterModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

export function StudentRegisterModal({
  isOpen,
  onClose,
  onSuccess,
}: StudentRegisterModalProps) {
  const [studentName, setStudentName] = useState('');
  const [whatsappNumber, setWhatsappNumber] = useState('');
  const [educationLevel, setEducationLevel] = useState<EducationLevel>('elementary');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [successInfo, setSuccessInfo] = useState<{
    name: string;
    wa: string;
    level: EducationLevel;
  } | null>(null);
  const [copiedInstruction, setCopiedInstruction] = useState(false);

  // Reset form saat modal dibuka kembali
  useEffect(() => {
    if (isOpen) {
      setStudentName('');
      setWhatsappNumber('');
      setEducationLevel('elementary');
      setErrorMessage(null);
      setSuccessInfo(null);
      setCopiedInstruction(false);
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, [isOpen]);

  // Listener tombol Escape
  useEffect(() => {
    if (!isOpen) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && !isSubmitting) {
        onClose();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, isSubmitting, onClose]);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);

    const trimmedName = studentName.trim();
    const trimmedWA = whatsappNumber.trim();

    if (!trimmedName || trimmedName.length < 2) {
      setErrorMessage('Nama lengkap calon siswa wajib diisi minimal 2 karakter.');
      return;
    }

    if (!trimmedWA || trimmedWA.length < 8) {
      setErrorMessage('Nomor WhatsApp wajib diisi dengan benar (contoh: 08123456789).');
      return;
    }

    setIsSubmitting(true);
    try {
      const res = await registerStudent(trimmedName, trimmedWA, educationLevel);
      if (res.success) {
        setSuccessInfo({
          name: trimmedName,
          wa: trimmedWA,
          level: educationLevel,
        });
        onSuccess();
      } else {
        setErrorMessage(res.error || 'Gagal mendaftarkan calon siswa.');
      }
    } catch (err) {
      console.error('Error saat registrasi siswa:', err);
      setErrorMessage('Terjadi kendala jaringan saat mendaftarkan siswa. Silakan coba kembali.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleCopyInstruction = () => {
    if (!successInfo) return;
    const text = `Halo ${successInfo.name}, Anda telah didaftarkan untuk Placement Test Up Speaking di jenjang ${
      successInfo.level === 'high_school' ? 'High School' : 'Elementary'
    }.\n\nSilakan buka tautan berikut melalui browser HP Anda:\n${
      typeof window !== 'undefined' ? window.location.origin : ''
    }\n\nMasukkan data pendaftaran Anda:\n- Nama: ${successInfo.name}\n- WhatsApp: ${successInfo.wa}\n\nSelamat mengerjakan tes!`;

    navigator.clipboard.writeText(text);
    setCopiedInstruction(true);
    setTimeout(() => setCopiedInstruction(false), 2500);
  };

  const handleRegisterAnother = () => {
    setStudentName('');
    setWhatsappNumber('');
    setEducationLevel('elementary');
    setErrorMessage(null);
    setSuccessInfo(null);
  };

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="register-modal-title"
      className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-xs p-4 overflow-y-auto animate-fade-in"
      onClick={() => {
        if (!isSubmitting) onClose();
      }}
    >
      <div
        className="w-full max-w-lg bg-white rounded-3xl p-6 sm:p-8 shadow-2xl border border-slate-100 flex flex-col transition-all duration-300 transform animate-scale-in"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Modal Header */}
        <div className="flex items-start justify-between gap-3 pb-4 border-b border-slate-100">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-sky-50 text-sky-600 border border-sky-200/80 flex items-center justify-center flex-shrink-0 shadow-2xs">
              <UserPlus className="w-5 h-5" />
            </div>
            <div>
              <h2
                id="register-modal-title"
                className="font-extrabold text-lg sm:text-xl text-slate-900 leading-tight"
              >
                Pendaftaran Siswa Baru
              </h2>
              <p className="text-xs text-slate-500 mt-0.5">
                Meja Registrasi Placement Test Up Speaking
              </p>
            </div>
          </div>
          <button
            type="button"
            disabled={isSubmitting}
            onClick={onClose}
            aria-label="Tutup modal"
            className="w-8 h-8 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-500 hover:text-slate-700 flex items-center justify-center transition-colors focus:outline-none focus:ring-2 focus:ring-slate-300 cursor-pointer disabled:opacity-50"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Tampilan Jika Registrasi Berhasil */}
        {successInfo ? (
          <div className="py-6 space-y-5 animate-fade-in">
            <div className="p-5 rounded-2xl bg-emerald-50 border border-emerald-200/90 text-center">
              <div className="w-12 h-12 rounded-2xl bg-emerald-600 text-white flex items-center justify-center mx-auto mb-3 shadow-sm shadow-emerald-600/20">
                <CheckCircle2 className="w-6 h-6" />
              </div>
              <h3 className="font-extrabold text-lg text-emerald-900">
                Siswa Berhasil Didaftarkan!
              </h3>
              <p className="text-xs sm:text-sm text-emerald-700 mt-1">
                Data pendaftaran telah tersimpan di sistem dengan status <span className="font-bold underline">Registered</span>.
              </p>
            </div>

            {/* Rincian Pendaftaran */}
            <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200/80 space-y-2 text-xs sm:text-sm">
              <div className="flex justify-between items-center py-1 border-b border-slate-200/60">
                <span className="text-slate-500">Nama Siswa:</span>
                <span className="font-bold text-slate-900">{successInfo.name}</span>
              </div>
              <div className="flex justify-between items-center py-1 border-b border-slate-200/60">
                <span className="text-slate-500">No. WhatsApp:</span>
                <span className="font-bold font-mono text-slate-900">{successInfo.wa}</span>
              </div>
              <div className="flex justify-between items-center py-1">
                <span className="text-slate-500">Jenjang Ujian:</span>
                <span className="font-bold text-sky-700">
                  {successInfo.level === 'high_school' ? 'High School (SMP/SMA/Umum)' : 'Elementary (SD)'}
                </span>
              </div>
            </div>

            {/* Tombol Salin Instruksi & Aksi */}
            <div className="space-y-2.5">
              <button
                type="button"
                onClick={handleCopyInstruction}
                className="w-full py-3 px-4 rounded-xl bg-sky-50 hover:bg-sky-100 text-sky-800 border border-sky-200/90 font-bold text-xs sm:text-sm flex items-center justify-center gap-2 transition-colors cursor-pointer"
              >
                {copiedInstruction ? (
                  <>
                    <Check className="w-4 h-4 text-emerald-600" />
                    <span>Instruksi Disalin ke Clipboard!</span>
                  </>
                ) : (
                  <>
                    <Copy className="w-4 h-4 text-sky-600" />
                    <span>Salin Instruksi untuk Dikirim ke Siswa</span>
                  </>
                )}
              </button>

              <div className="flex gap-2.5 pt-2">
                <button
                  type="button"
                  onClick={handleRegisterAnother}
                  className="w-1/2 py-2.5 px-4 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold text-xs sm:text-sm transition-colors cursor-pointer"
                >
                  + Daftarkan Siswa Lain
                </button>
                <button
                  type="button"
                  onClick={onClose}
                  className="w-1/2 py-2.5 px-4 rounded-xl bg-[#0e263e] hover:bg-[#1a385c] text-white font-bold text-xs sm:text-sm transition-colors cursor-pointer shadow-xs"
                >
                  Selesai
                </button>
              </div>
            </div>
          </div>
        ) : (
          /* Form Input Registrasi */
          <form onSubmit={handleSubmit} className="py-5 space-y-4">
            {/* Alert Error */}
            {errorMessage && (
              <div className="p-3.5 rounded-2xl bg-rose-50 border border-rose-200 text-rose-800 flex items-start gap-2.5 text-xs sm:text-sm animate-fade-in">
                <AlertCircle className="w-4 h-4 text-rose-600 flex-shrink-0 mt-0.5" />
                <span>{errorMessage}</span>
              </div>
            )}

            {/* Input Nama Lengkap */}
            <div>
              <label htmlFor="reg-student-name" className="block text-xs font-bold text-slate-700 mb-1.5">
                Nama Lengkap Calon Siswa <span className="text-rose-500">*</span>
              </label>
              <input
                id="reg-student-name"
                type="text"
                required
                disabled={isSubmitting}
                placeholder="Contoh: Muhammad Rizky"
                value={studentName}
                onChange={(e) => setStudentName(e.target.value)}
                className="w-full px-4 py-3 rounded-xl border border-slate-200 text-slate-900 placeholder:text-slate-400 text-sm focus:outline-none focus:ring-2 focus:ring-[#00a6f4] focus:border-transparent transition-all disabled:opacity-60 disabled:bg-slate-50"
              />
            </div>

            {/* Input Nomor WhatsApp */}
            <div>
              <label htmlFor="reg-whatsapp" className="block text-xs font-bold text-slate-700 mb-1.5">
                Nomor WhatsApp Siswa / Orang Tua <span className="text-rose-500">*</span>
              </label>
              <input
                id="reg-whatsapp"
                type="tel"
                required
                disabled={isSubmitting}
                placeholder="Contoh: 081234567890"
                value={whatsappNumber}
                onChange={(e) => setWhatsappNumber(e.target.value)}
                className="w-full px-4 py-3 rounded-xl border border-slate-200 text-slate-900 placeholder:text-slate-400 text-sm font-mono focus:outline-none focus:ring-2 focus:ring-[#00a6f4] focus:border-transparent transition-all disabled:opacity-60 disabled:bg-slate-50"
              />
              <p className="text-[11px] text-slate-400 mt-1">
                Format otomatis dinormalisasi ke standar internasional (628xxx).
              </p>
            </div>

            {/* Pilihan Jenjang Pendidikan */}
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-2">
                Pilih Jenjang Soal Placement Test <span className="text-rose-500">*</span>
              </label>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                {/* Opsi Elementary */}
                <button
                  type="button"
                  disabled={isSubmitting}
                  onClick={() => setEducationLevel('elementary')}
                  className={`p-3.5 rounded-2xl border text-left flex items-start gap-3 transition-all cursor-pointer ${
                    educationLevel === 'elementary'
                      ? 'border-[#00a6f4] bg-sky-50/60 ring-2 ring-[#00a6f4]/30'
                      : 'border-slate-200 hover:border-slate-300 bg-white'
                  }`}
                >
                  <div
                    className={`w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0 ${
                      educationLevel === 'elementary'
                        ? 'bg-[#00a6f4] text-white shadow-2xs'
                        : 'bg-slate-100 text-slate-500'
                    }`}
                  >
                    <BookOpen className="w-4 h-4" />
                  </div>
                  <div>
                    <span className="block font-bold text-xs sm:text-sm text-slate-900">
                      Elementary (SD)
                    </span>
                    <span className="block text-[11px] text-slate-500 mt-0.5 leading-snug">
                      Bank soal ramah anak tingkat dasar
                    </span>
                  </div>
                </button>

                {/* Opsi High School */}
                <button
                  type="button"
                  disabled={isSubmitting}
                  onClick={() => setEducationLevel('high_school')}
                  className={`p-3.5 rounded-2xl border text-left flex items-start gap-3 transition-all cursor-pointer ${
                    educationLevel === 'high_school'
                      ? 'border-[#0e263e] bg-slate-100 ring-2 ring-[#0e263e]/30'
                      : 'border-slate-200 hover:border-slate-300 bg-white'
                  }`}
                >
                  <div
                    className={`w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0 ${
                      educationLevel === 'high_school'
                        ? 'bg-[#0e263e] text-white shadow-2xs'
                        : 'bg-slate-100 text-slate-500'
                    }`}
                  >
                    <GraduationCap className="w-4 h-4" />
                  </div>
                  <div>
                    <span className="block font-bold text-xs sm:text-sm text-slate-900">
                      High School
                    </span>
                    <span className="block text-[11px] text-slate-500 mt-0.5 leading-snug">
                      SMP, SMA, dan kategori Umum
                    </span>
                  </div>
                </button>
              </div>
            </div>

            {/* Tombol Aksi */}
            <div className="pt-3 flex gap-2.5">
              <button
                type="button"
                disabled={isSubmitting}
                onClick={onClose}
                className="w-1/3 py-3 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold text-xs sm:text-sm transition-colors cursor-pointer disabled:opacity-50"
              >
                Batal
              </button>
              <button
                type="submit"
                disabled={isSubmitting}
                className="w-2/3 py-3 rounded-xl bg-[#0e263e] hover:bg-[#1a385c] text-white font-bold text-xs sm:text-sm flex items-center justify-center gap-2 transition-all shadow-xs cursor-pointer disabled:opacity-50 active:scale-95"
              >
                {isSubmitting ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin text-sky-400" />
                    <span>Mendaftarkan...</span>
                  </>
                ) : (
                  <>
                    <UserPlus className="w-4 h-4" />
                    <span>Simpan &amp; Daftarkan</span>
                  </>
                )}
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}
