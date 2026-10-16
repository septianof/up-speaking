"use client";

import React, { useState, useEffect } from "react";
import { CheckCircle2 } from "lucide-react";
import { Modal } from "@/components/ui/Modal";
import { Input } from "@/components/ui/Input";
import { Button } from "@/components/ui/Button";
import { TargetLevel } from "@/types/student";
import { TutorAccount } from "@/lib/mock-tutors";

interface TutorRegisterModalProps {
  isOpen: boolean;
  onClose: () => void;
  initialTutor?: TutorAccount | null;
  onSuccess?: (tutor: TutorAccount) => void;
}

const EMAIL_REGEX =
  /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.(com|net|org|edu|gov|mil|id|io|dev|app|ai|me|info|biz|co|co\.id|ac\.id|sch\.id|go\.id|or\.id|my\.id|web\.id|xyz)$/i;

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
  const [formError, setFormError] = useState<string | null>(null);
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
    setFormError(null);
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
    } else if (!EMAIL_REGEX.test(email.trim())) {
      newErrors.email = "Format domain email tidak valid (gunakan .com, .id, dsb.)";
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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;

    setIsSubmitting(true);
    setFormError(null);
    try {
      const url = "/api/admin/tutors";
      const method = isEditing ? "PUT" : "POST";
      const bodyPayload = isEditing
        ? {
            id: initialTutor?.id,
            fullName: fullName.trim(),
            email: email.trim(),
            password: tempPassword ? tempPassword.trim() : undefined,
            role: targetLevel === "ELEMENTARY" ? "TUTOR_ELEMENTARY" : "TUTOR_HIGH_SCHOOL",
          }
        : {
            fullName: fullName.trim(),
            email: email.trim(),
            password: tempPassword,
            role: targetLevel === "ELEMENTARY" ? "TUTOR_ELEMENTARY" : "TUTOR_HIGH_SCHOOL",
          };

      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(bodyPayload),
      });

      const data = await res.json();

      if (!res.ok) {
        const errorMsg =
          data.error ||
          (isEditing ? "Gagal memperbarui akun tutor." : "Gagal membuat akun tutor.");
        if (errorMsg.toLowerCase().includes("email")) {
          setErrors({ email: errorMsg });
        } else {
          setFormError(errorMsg);
        }
        return;
      }

      setSuccessMessage(
        isEditing
          ? `Akun pengajar ${data.tutor.fullName} berhasil diperbarui!`
          : `Akun tutor untuk ${data.tutor.fullName} berhasil dibuat!`
      );
      setTimeout(() => {
        setSuccessMessage(null);
        if (data.tutor) onSuccess?.(data.tutor);
        onClose();
      }, 1000);
    } catch {
      setFormError(
        isEditing
          ? "Terjadi kendala jaringan saat memperbarui data tutor."
          : "Terjadi kendala jaringan saat mendaftarkan tutor."
      );
    } finally {
      setIsSubmitting(false);
    }
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
      title={isEditing ? "Edit Akun Tutor" : "Tambah Akun Tutor"}
      description={
        isEditing
          ? "Perbarui informasi akun dan jenjang pengampu pengajar."
          : "Daftarkan akun staf pengajar untuk evaluasi placement test."
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
        <form onSubmit={handleSubmit} className="space-y-5 pt-2">
          {formError && (
            <div
              role="alert"
              className="p-3 rounded-xl bg-accent-50 border border-accent-200 text-accent-600 text-xs font-medium"
            >
              {formError}
            </div>
          )}
          {/* Nama Tutor */}
          <div>
            <label className="block text-sm font-medium text-text-secondary mb-1.5">
              Nama lengkap <span className="text-accent-500">*</span>
            </label>
            <Input
              type="text"
              placeholder="Contoh: Sarah Angelina, M.Pd."
              value={fullName}
              onChange={(e) => {
                setFullName(e.target.value);
                if (errors.fullName) setErrors((prev) => ({ ...prev, fullName: undefined }));
              }}
              error={errors.fullName}
              className="text-sm"
              autoFocus
            />
          </div>

          {/* Email Tutor */}
          <div>
            <label className="block text-sm font-medium text-text-secondary mb-1.5">
              Email <span className="text-accent-500">*</span>
            </label>
            <Input
              type="email"
              placeholder="sarah.tutor@upspeaking.com"
              value={email}
              onChange={(e) => {
                setEmail(e.target.value);
                if (errors.email) setErrors((prev) => ({ ...prev, email: undefined }));
              }}
              error={errors.email}
              className="text-sm"
            />
          </div>

          {/* Password Sementara */}
          <div>
            <label className="block text-sm font-medium text-text-secondary mb-1.5">
              {isEditing ? "Ganti Password Baru (Opsional)" : (
                <>
                  Password sementara <span className="text-accent-500">*</span>{" "}
                  <span className="text-[11px] text-text-muted font-normal">— sampaikan ke tutor</span>
                </>
              )}
            </label>
            <Input
              type="text"
              placeholder={isEditing ? "Kosongkan jika tidak ingin mengubah password" : "TutorUp2026!"}
              value={tempPassword}
              onChange={(e) => {
                setTempPassword(e.target.value);
                if (errors.tempPassword) setErrors((prev) => ({ ...prev, tempPassword: undefined }));
              }}
              error={errors.tempPassword}
              className="text-sm font-mono"
            />
          </div>

          {/* Jenjang Pengampu */}
          <div>
            <label className="block text-sm font-medium text-text-secondary mb-1.5">
              Jenjang pengampu <span className="text-accent-500">*</span>
            </label>
            <div className="flex gap-2">
              <button
                type="button"
                onClick={() => setTargetLevel("ELEMENTARY")}
                className={`flex-1 py-2.5 px-4 rounded-xl text-sm font-semibold border transition-all ${
                  targetLevel === "ELEMENTARY"
                    ? "border-primary-500 bg-primary-50 text-primary-700"
                    : "border-surface-border bg-surface-white text-text-muted hover:border-slate-300"
                }`}
              >
                Elementary
              </button>
              <button
                type="button"
                onClick={() => setTargetLevel("HIGH_SCHOOL")}
                className={`flex-1 py-2.5 px-4 rounded-xl text-sm font-semibold border transition-all ${
                  targetLevel === "HIGH_SCHOOL"
                    ? "border-primary-500 bg-primary-50 text-primary-700"
                    : "border-surface-border bg-surface-white text-text-muted hover:border-slate-300"
                }`}
              >
                High School
              </button>
            </div>
          </div>

          {/* Form Actions */}
          <div className="flex items-center justify-end gap-2.5 pt-4 border-t border-surface-border mt-2">
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
