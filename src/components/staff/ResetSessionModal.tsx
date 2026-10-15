"use client";

import React, { useState } from "react";
import { AlertTriangle, RotateCcw, CheckCircle2 } from "lucide-react";
import { Modal } from "@/components/ui/Modal";
import { Button } from "@/components/ui/Button";
import { StudentRecord } from "@/lib/mock-data";

interface ResetSessionModalProps {
  student: StudentRecord | null;
  isOpen: boolean;
  onClose: () => void;
  onSuccess?: (updated: StudentRecord) => void;
}

export const ResetSessionModal: React.FC<ResetSessionModalProps> = ({
  student,
  isOpen,
  onClose,
  onSuccess,
}) => {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  if (!student) return null;

  const handleReset = async () => {
    setIsSubmitting(true);
    try {
      const res = await fetch(`/api/admin/students/${student.id}/reset`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
      });

      const data = await res.json();

      if (!res.ok) {
        alert(data.error || "Gagal melakukan reset sesi.");
        setIsSubmitting(false);
        return;
      }

      setSuccessMessage(data.message || `Sesi tes untuk ${student.fullName} berhasil di-reset!`);

      setTimeout(() => {
        setSuccessMessage(null);
        onSuccess?.(student);
        onClose();
      }, 1200);
    } catch {
      alert("Terjadi kendala jaringan saat melakukan reset sesi.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const formatStatus = (status: string) => {
    switch (status) {
      case "NOT_STARTED":
        return "Belum Mulai";
      case "IN_PROGRESS":
        return "Sedang Tes";
      case "COMPLETED":
        return "Menunggu Evaluasi";
      case "FINALIZED":
        return "Selesai & Dinilai";
      case "RESET":
        return "Direset";
      default:
        return status;
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
      title="Reset Sesi Siswa"
      maxWidth="md"
    >
      {successMessage ? (
        <div className="py-6 flex flex-col items-center text-center">
          <div className="h-12 w-12 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center mb-3">
            <CheckCircle2 className="h-6 w-6" />
          </div>
          <p className="text-base font-semibold text-text-primary">{successMessage}</p>
          <p className="text-xs text-text-muted mt-1">
            Status siswa telah kembali ke Belum Mulai dan siap mengerjakan ulang.
          </p>
        </div>
      ) : (
        <div className="space-y-4 pt-1">
          {/* Detail Ringkas Siswa */}
          <div className="p-3.5 rounded-xl bg-surface-subtle border border-surface-border text-xs space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-text-muted">Nama siswa:</span>
              <span className="font-bold text-text-primary">{student.fullName}</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-text-muted">Nomor WhatsApp:</span>
              <span className="font-mono text-text-primary">{student.phone}</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-text-muted">Jenjang:</span>
              <span
                className={`inline-flex items-center text-xs font-medium px-2 py-0.5 rounded border ${
                  student.targetLevel === "ELEMENTARY"
                    ? "text-primary-700 bg-primary-50 border-primary-100"
                    : "text-text-secondary bg-surface-subtle border-surface-border"
                }`}
              >
                {student.targetLevel === "ELEMENTARY" ? "Elementary (SD)" : "High School"}
              </span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-text-muted">Status saat ini:</span>
              <span className="font-semibold text-text-primary">
                {formatStatus(student.status)}
              </span>
            </div>
          </div>

          {/* Kotak Peringatan Bersih & Manusiawi */}
          <div className="p-3.5 rounded-xl bg-accent-50/70 border border-accent-200/80 text-xs text-accent-700 space-y-1">
            <div className="flex items-center gap-1.5 font-bold text-accent-700">
              <AlertTriangle className="h-4 w-4 shrink-0 text-accent-500" />
              <span>Perhatian</span>
            </div>
            <p className="leading-relaxed">
              Seluruh pengerjaan tes siswa saat ini akan dibatalkan dan diulang dari nomor 1. Siswa dapat login kembali menggunakan nomor WhatsApp terdaftar untuk memulai tes baru.
            </p>
          </div>

          {/* Tombol Aksi */}
          <div className="flex items-center justify-end gap-2.5 pt-3 border-t border-surface-border">
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
              type="button"
              variant="accent"
              size="md"
              onClick={handleReset}
              isLoading={isSubmitting}
              className="gap-2"
            >
              <RotateCcw className="h-4 w-4" />
              Ya, Reset Sesi
            </Button>
          </div>
        </div>
      )}
    </Modal>
  );
};
