"use client";

import React, { useState, useEffect } from "react";
import { CheckCircle2 } from "lucide-react";
import { Modal } from "@/components/ui/Modal";
import { Input } from "@/components/ui/Input";
import { Button } from "@/components/ui/Button";
import { TargetLevel } from "@/types/student";
import { StudentRecord } from "@/lib/mock-data";

interface StudentRegisterModalProps {
  isOpen: boolean;
  onClose: () => void;
  initialStudent?: StudentRecord | null;
  onSuccess?: (student: StudentRecord) => void;
}

export const StudentRegisterModal: React.FC<StudentRegisterModalProps> = ({
  isOpen,
  onClose,
  initialStudent = null,
  onSuccess,
}) => {
  const isEditing = Boolean(initialStudent);
  const [fullName, setFullName] = useState("");
  const [phone, setPhone] = useState("");
  const [targetLevel, setTargetLevel] = useState<TargetLevel>("ELEMENTARY");
  const [errors, setErrors] = useState<{ fullName?: string; phone?: string }>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  useEffect(() => {
    if (initialStudent) {
      setFullName(initialStudent.fullName);
      setPhone(initialStudent.phone);
      setTargetLevel(initialStudent.targetLevel);
    } else {
      setFullName("");
      setPhone("");
      setTargetLevel("ELEMENTARY");
    }
    setErrors({});
    setSuccessMessage(null);
  }, [initialStudent, isOpen]);

  // Sanitasi Nama Lengkap: hanya huruf dan spasi
  const handleNameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const sanitized = e.target.value.replace(/[^a-zA-Z\s]/g, "");
    setFullName(sanitized);
    if (errors.fullName) setErrors((prev) => ({ ...prev, fullName: undefined }));
  };

  // Sanitasi No HP: hanya angka
  const handlePhoneChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const sanitized = e.target.value.replace(/\D/g, "");
    setPhone(sanitized);
    if (errors.phone) setErrors((prev) => ({ ...prev, phone: undefined }));
  };

  const validate = (): boolean => {
    const newErrors: { fullName?: string; phone?: string } = {};

    if (!fullName.trim()) {
      newErrors.fullName = "Nama lengkap wajib diisi";
    } else if (fullName.trim().length < 3) {
      newErrors.fullName = "Nama lengkap minimal 3 karakter";
    }

    if (!phone.trim()) {
      newErrors.phone = "Nomor WhatsApp/HP wajib diisi";
    } else if (!phone.startsWith("08")) {
      newErrors.phone = "Nomor HP harus diawali '08'";
    } else if (phone.length < 10 || phone.length > 14) {
      newErrors.phone = "Nomor HP harus terdiri dari 10 - 14 digit";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;

    setIsSubmitting(true);
    try {
      const res = await fetch("/api/admin/students", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          fullName: fullName.trim(),
          phoneNumber: phone.trim(),
          targetLevel,
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        setErrors({ phone: data.error || "Gagal mendaftarkan siswa." });
        return;
      }

      setSuccessMessage(`Siswa ${data.student.fullName} berhasil didaftarkan!`);
      setTimeout(() => {
        setSuccessMessage(null);
        if (data.student) onSuccess?.(data.student);
        onClose();
      }, 1000);
    } catch {
      setErrors({ fullName: "Terjadi kendala jaringan saat mendaftarkan siswa." });
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
      title={isEditing ? "Edit Data Siswa" : "Tambah Siswa Baru"}
      description={
        isEditing
          ? "Perbarui informasi kontak dan jenjang siswa."
          : "Lengkapi data siswa untuk mengikuti placement test."
      }
      maxWidth="md"
    >
      {successMessage ? (
        <div className="py-6 flex flex-col items-center text-center">
          <div className="h-12 w-12 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center mb-3">
            <CheckCircle2 className="h-6 w-6" />
          </div>
          <p className="text-base font-semibold text-text-primary">{successMessage}</p>
          <p className="text-xs text-text-muted mt-1">Data siswa telah tersimpan dan siap mengakses tes.</p>
        </div>
      ) : (
        <form onSubmit={handleSubmit} className="space-y-5 pt-2">
          {/* Input Nama Lengkap */}
          <div>
            <label className="block text-sm font-medium text-text-secondary mb-1.5">
              Nama lengkap <span className="text-accent-500">*</span>
            </label>
            <Input
              type="text"
              placeholder="Contoh: Muhammad Rizky"
              value={fullName}
              onChange={handleNameChange}
              error={errors.fullName}
              className="text-sm"
              autoFocus
            />
          </div>

          {/* Input Nomor HP */}
          <div>
            <label className="block text-sm font-medium text-text-secondary mb-1.5">
              Nomor WhatsApp / HP <span className="text-accent-500">*</span>
            </label>
            <Input
              type="tel"
              placeholder="08xxxxxxxxxx"
              value={phone}
              onChange={handlePhoneChange}
              error={errors.phone}
              className="text-sm"
              maxLength={14}
            />
          </div>

          {/* Pilihan Jenjang */}
          <div>
            <label className="block text-sm font-medium text-text-secondary mb-1.5">
              Jenjang sasaran <span className="text-accent-500">*</span>
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
                Elementary <span className="text-xs font-normal opacity-70">SD</span>
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
                High School <span className="text-xs font-normal opacity-70">SMP/SMA</span>
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
              {isEditing ? "Simpan Perubahan" : "Daftarkan Siswa"}
            </Button>
          </div>
        </form>
      )}
    </Modal>
  );
};
