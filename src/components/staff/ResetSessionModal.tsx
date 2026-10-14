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

const COMMON_REASONS = [
  "Kendala teknis / jaringan terputus saat pengerjaan",
  "Perangkat mati mendadak / browser tertutup",
  "Siswa salah klik selesai / butuh pengulangan",
  "Lainnya (alasan khusus)",
];

export const ResetSessionModal: React.FC<ResetSessionModalProps> = ({
  student,
  isOpen,
  onClose,
  onSuccess,
}) => {
  const [selectedReason, setSelectedReason] = useState(COMMON_REASONS[0]);
  const [customReason, setCustomReason] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  if (!student) return null;

  const handleReset = async () => {
    setIsSubmitting(true);
    const finalReason =
      selectedReason === "Lainnya (alasan khusus)" && customReason.trim()
        ? customReason.trim()
        : selectedReason;

    try {
      const res = await fetch(`/api/admin/students/${student.id}/reset`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ reason: finalReason }),
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
        setSelectedReason(COMMON_REASONS[0]);
        setCustomReason("");
        onSuccess?.(student);
        onClose();
      }, 1200);
    } catch {
      alert("Terjadi kendala jaringan saat melakukan reset sesi.");
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
      title="Konfirmasi Soft Reset Sesi Tes"
      maxWidth="md"
    >
      {successMessage ? (
        <div className="py-6 flex flex-col items-center text-center">
          <div className="h-12 w-12 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center mb-3">
            <CheckCircle2 className="h-6 w-6" />
          </div>
          <p className="text-base font-semibold text-text-primary">{successMessage}</p>
          <p className="text-xs text-text-muted mt-1">
            Status siswa telah kembali ke Belum Mulai (NOT_STARTED) dan siap mengerjakan ulang.
          </p>
        </div>
      ) : (
        <div className="space-y-4 pt-1">
          {/* Detail Ringkas Siswa */}
          <div className="p-3.5 rounded-xl bg-surface-subtle border border-surface-border text-xs space-y-1.5">
            <div className="flex items-center justify-between">
              <span className="text-text-muted">Nama Siswa:</span>
              <span className="font-bold text-text-primary">{student.fullName}</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-text-muted">No. WhatsApp / HP:</span>
              <span className="font-mono text-text-primary">{student.phone}</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-text-muted">Jenjang:</span>
              <span className={`inline-flex items-center text-xs font-medium px-2 py-0.5 rounded border ${
                student.targetLevel === "ELEMENTARY"
                  ? "text-primary-700 bg-primary-50 border-primary-100"
                  : "text-text-secondary bg-surface-subtle border-surface-border"
              }`}>
                {student.targetLevel === "ELEMENTARY" ? "Elementary (SD)" : "High School"}
              </span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-text-muted">Status Saat Ini:</span>
              <span className="font-semibold text-text-primary">{student.status}</span>
            </div>
          </div>

          {/* Peringatan Audit Trail */}
          <div className="p-3.5 rounded-xl bg-accent-50 border border-accent-200 text-xs text-accent-700 space-y-1">
            <div className="flex items-center gap-1.5 font-bold text-accent-700">
              <AlertTriangle className="h-4 w-4 shrink-0 text-accent-500" />
              <span>Ketentuan Soft Reset Sesi (Audit Trail)</span>
            </div>
            <p className="leading-relaxed">
              Tindakan ini akan mengarsipkan riwayat pengerjaan sebelumnya dan menerbitkan sesi baru yang bersih (NOT_STARTED). Siswa dapat masuk kembali menggunakan nomor HP untuk mengulang tes dari awal.
            </p>
          </div>

          {/* Pilihan Alasan Reset */}
          <div>
            <label className="block text-sm font-medium text-text-secondary mb-2">
              Alasan reset sesi <span className="text-accent-500">*</span>
            </label>
            <div className="space-y-2">
              {COMMON_REASONS.map((reason) => (
                <label
                  key={reason}
                  className={`flex items-center gap-2.5 p-2.5 rounded-xl border text-xs cursor-pointer transition-colors ${
                    selectedReason === reason
                      ? "border-primary-500 bg-primary-50/50 text-text-primary font-medium"
                      : "border-surface-border bg-surface-white text-text-muted hover:border-slate-300"
                  }`}
                >
                  <input
                    type="radio"
                    name="resetReason"
                    value={reason}
                    checked={selectedReason === reason}
                    onChange={(e) => setSelectedReason(e.target.value)}
                    className="h-4 w-4 text-primary-600 focus:ring-primary-500"
                  />
                  <span>{reason}</span>
                </label>
              ))}
            </div>

            {selectedReason === "Lainnya (alasan khusus)" && (
              <textarea
                value={customReason}
                onChange={(e) => setCustomReason(e.target.value)}
                placeholder="Tuliskan catatan spesifik alasan reset..."
                rows={2}
                className="mt-2 w-full rounded-xl border border-surface-border p-2.5 text-xs text-text-primary focus:outline-none focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500"
              />
            )}
          </div>

          {/* Action Buttons */}
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
              Reset Sesi Siswa
            </Button>
          </div>
        </div>
      )}
    </Modal>
  );
};
