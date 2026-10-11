"use client";

import React, { useState, useEffect } from "react";
import { User, Mail, Lock, GraduationCap, CheckCircle2 } from "lucide-react";
import { Modal } from "@/components/ui/Modal";
import { Input } from "@/components/ui/Input";
import { Button } from "@/components/ui/Button";
import { TargetLevel } from "@/types/student";
import { addMockTutor, updateMockTutor, TutorAccount } from "@/lib/mock-tutors";

interface TutorRegisterModalProps {
  isOpen: boolean;
  onClose: () => void;
  initialTutor?: TutorAccount | null;
  onSuccess?: (tutor: TutorAccount) => void;
}

export const TutorRegisterModal: React.FC<TutorRegisterModalProps> = ({
  isOpen,
  onClose,
  initialTutor = null,
  onSuccess,
}) => {
  const isEditing = Boolean(initialTutor);
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [tempPassword, setTempPassword] = useState("TutorUp2026!");
  const [targetLevel, setTargetLevel] = useState<TargetLevel>("ELEMENTARY");
  const [errors, setErrors] = useState<{ fullName?: string; email?: string; tempPassword?: string }>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  useEffect(() => {
    if (initialTutor) {
      setFullName(initialTutor.fullName);
      setEmail(initialTutor.email);
      setTargetLevel(initialTutor.targetLevel);
      setTempPassword(""); // Kosongkan saat edit karena opsional
    } else {
      setFullName("");
      setEmail("");
      setTempPassword("TutorUp2026!");
      setTargetLevel("ELEMENTARY");
    }
    setErrors({});
    setSuccessMessage(null);
  }, [initialTutor, isOpen]);

  const validate = (): boolean => {
    const newErrors: { fullName?: string; email?: string; tempPassword?: string } = {};

    if (!fullName.trim()) {
      newErrors.fullName = "Nama lengkap tutor wajib diisi";
    } else if (fullName.trim().length < 3) {
      newErrors.fullName = "Nama lengkap minimal 3 karakter";
    }

    if (!email.trim()) {
      newErrors.email = "Email tutor wajib diisi";
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      newErrors.email = "Format email tidak valid";
    }

    // Password hanya wajib saat tambah baru, atau jika diisi saat edit
    if (!isEditing && !tempPassword.trim()) {
      newErrors.tempPassword = "Password sementara wajib diisi";
    } else if (tempPassword && tempPassword.length < 6) {
      newErrors.tempPassword = "Password minimal 6 karakter";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;

    setIsSubmitting(true);
    setTimeout(() => {
      let saved: TutorAccount | null = null;

      if (isEditing && initialTutor) {
        saved = updateMockTutor(initialTutor.id, {
          fullName,
          email,
          targetLevel,
        });
        setSuccessMessage(`Data tutor ${fullName} berhasil diperbarui!`);
      } else {
        saved = addMockTutor({
          fullName,
          email,
          targetLevel,
        });
        setSuccessMessage(`Akun tutor untuk ${fullName} berhasil dibuat!`);
      }

      setIsSubmitting(false);

      setTimeout(() => {
        setSuccessMessage(null);
        if (saved) onSuccess?.(saved);
        onClose();
      }, 1000);
    }, 400);
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={() => {
        if (!isSubmitting) {
          setSuccessMessage(null);
          onClose();
        }
      }}
      title={isEditing ? "Edit Akun Tutor" : "Tambah Akun Tutor Baru"}
      description={
        isEditing
          ? "Perbarui nama pengajar, email akun, atau alihkan jenjang penugasan pengajar."
          : "Daftarkan akun staf pengajar untuk melakukan penilaian dan kurasi tes penempatan."
      }
      maxWidth="md"
    >
      {successMessage ? (
        <div className="py-6 flex flex-col items-center text-center">
          <div className="h-12 w-12 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center mb-3">
            <CheckCircle2 className="h-6 w-6" />
          </div>
          <p className="text-base font-semibold text-text-primary">{successMessage}</p>
          <p className="text-xs text-text-muted mt-1">
            Perubahan telah aktif dan pengajar dapat login melalui portal staf.
          </p>
        </div>
      ) : (
        <form onSubmit={handleSubmit} className="space-y-4 pt-2">
          {/* Nama Tutor */}
          <div>
            <label className="block text-xs font-semibold text-text-primary uppercase tracking-wider mb-1.5">
              Nama Lengkap Tutor <span className="text-accent-500">*</span>
            </label>
            <div className="relative">
              <Input
                type="text"
                placeholder="Contoh: Sarah Angelina, M.Pd."
                value={fullName}
                onChange={(e) => {
                  setFullName(e.target.value);
                  if (errors.fullName) setErrors((prev) => ({ ...prev, fullName: undefined }));
                }}
                error={errors.fullName}
                className="pl-10 text-sm"
                autoFocus
              />
              <User className="absolute left-3.5 top-3 h-4 w-4 text-text-muted pointer-events-none" />
            </div>
          </div>

          {/* Email Tutor */}
          <div>
            <label className="block text-xs font-semibold text-text-primary uppercase tracking-wider mb-1.5">
              Email Staf <span className="text-accent-500">*</span>
            </label>
            <div className="relative">
              <Input
                type="email"
                placeholder="sarah.tutor@upspeaking.com"
                value={email}
                onChange={(e) => {
                  setEmail(e.target.value);
                  if (errors.email) setErrors((prev) => ({ ...prev, email: undefined }));
                }}
                error={errors.email}
                className="pl-10 text-sm"
              />
              <Mail className="absolute left-3.5 top-3 h-4 w-4 text-text-muted pointer-events-none" />
            </div>
            <p className="text-[11px] text-text-muted mt-1">Digunakan untuk login ke portal staf.</p>
          </div>

          {/* Password Sementara */}
          <div>
            <label className="block text-xs font-semibold text-text-primary uppercase tracking-wider mb-1.5">
              {isEditing ? "Ganti Password Baru (Opsional)" : "Password Sementara"} {!isEditing && <span className="text-accent-500">*</span>}
            </label>
            <div className="relative">
              <Input
                type="text"
                placeholder={isEditing ? "Kosongkan jika tidak ingin mengubah password" : "TutorUp2026!"}
                value={tempPassword}
                onChange={(e) => {
                  setTempPassword(e.target.value);
                  if (errors.tempPassword) setErrors((prev) => ({ ...prev, tempPassword: undefined }));
                }}
                error={errors.tempPassword}
                className="pl-10 text-sm font-mono"
              />
              <Lock className="absolute left-3.5 top-3 h-4 w-4 text-text-muted pointer-events-none" />
            </div>
            <p className="text-[11px] text-text-muted mt-1">
              {isEditing
                ? "Isi kolom ini jika ingin mereset password staf pengajar."
                : "Berikan password ini kepada pengajar untuk akses login awal."}
            </p>
          </div>

          {/* Jenjang Pengampu */}
          <div>
            <label className="block text-xs font-semibold text-text-primary uppercase tracking-wider mb-1.5">
              Jenjang Pengampu <span className="text-accent-500">*</span>
            </label>
            <div className="grid grid-cols-2 gap-3">
              <button
                type="button"
                onClick={() => setTargetLevel("ELEMENTARY")}
                className={`flex flex-col items-center justify-center p-3 rounded-xl border text-center transition-all ${
                  targetLevel === "ELEMENTARY"
                    ? "border-primary-500 bg-primary-50 text-primary-700 shadow-sm ring-1 ring-primary-500"
                    : "border-surface-border bg-surface-white text-text-muted hover:border-slate-300"
                }`}
              >
                <GraduationCap className="h-5 w-5 mb-1 text-primary-600" />
                <span className="text-xs font-bold text-text-primary">Elementary</span>
                <span className="text-[10px] text-text-muted">Tutor Tingkat SD</span>
              </button>

              <button
                type="button"
                onClick={() => setTargetLevel("HIGH_SCHOOL")}
                className={`flex flex-col items-center justify-center p-3 rounded-xl border text-center transition-all ${
                  targetLevel === "HIGH_SCHOOL"
                    ? "border-primary-500 bg-primary-50 text-primary-700 shadow-sm ring-1 ring-primary-500"
                    : "border-surface-border bg-surface-white text-text-muted hover:border-slate-300"
                }`}
              >
                <GraduationCap className="h-5 w-5 mb-1 text-primary-600" />
                <span className="text-xs font-bold text-text-primary">High School</span>
                <span className="text-[10px] text-text-muted">Tutor Tingkat SMP / SMA</span>
              </button>
            </div>
          </div>

          {/* Form Actions */}
          <div className="flex items-center justify-end gap-2.5 pt-4 border-t border-surface-border mt-6">
            <Button
              type="button"
              variant="outline"
              size="md"
              onClick={onClose}
              disabled={isSubmitting}
            >
              Batal
            </Button>
            <Button
              type="submit"
              variant="primary"
              size="md"
              isLoading={isSubmitting}
            >
              {isEditing ? "Simpan Perubahan" : "Simpan Akun Tutor"}
            </Button>
          </div>
        </form>
      )}
    </Modal>
  );
};
