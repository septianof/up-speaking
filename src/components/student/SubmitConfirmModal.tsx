"use client";

import React from "react";
import { Modal, Button } from "@/components/ui";
import { AlertTriangle, CheckCircle, HelpCircle } from "lucide-react";

export interface SubmitConfirmModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  totalQuestions: number;
  answeredCount: number;
  isLoading?: boolean;
}

export const SubmitConfirmModal: React.FC<SubmitConfirmModalProps> = ({
  isOpen,
  onClose,
  onConfirm,
  totalQuestions,
  answeredCount,
  isLoading = false,
}) => {
  const unAnsweredCount = totalQuestions - answeredCount;
  const isAllAnswered = unAnsweredCount === 0;

  return (
    <Modal
      isOpen={isOpen}
      onClose={isLoading ? () => {} : onClose}
      title="Konfirmasi Pengumpulan Tes"
      maxWidth="md"
    >
      <div className="space-y-4 pt-1">
        {/* Banner Status Jawaban */}
        {isAllAnswered ? (
          <div className="flex items-start gap-3 p-4 rounded-xl bg-success-50 border border-emerald-200 text-success-700">
            <CheckCircle className="w-5 h-5 text-success-500 shrink-0 mt-0.5" />
            <div>
              <p className="font-bold text-sm text-emerald-900">
                Semua Soal Telah Terjawab!
              </p>
              <p className="text-xs text-success-600 mt-0.5">
                Total {totalQuestions} dari {totalQuestions} soal pilihan ganda telah Anda jawab lengkap.
              </p>
            </div>
          </div>
        ) : (
          <div className="flex items-start gap-3 p-4 rounded-xl bg-amber-50 border border-amber-300 text-amber-900">
            <AlertTriangle className="w-5 h-5 text-amber-500 shrink-0 mt-0.5" />
            <div>
              <p className="font-bold text-sm text-amber-950">
                Masih Ada Soal yang Belum Terjawab
              </p>
              <p className="text-xs text-amber-800 mt-1 leading-relaxed">
                Terdapat <strong className="text-amber-950 underline">{unAnsweredCount} butir soal</strong> yang belum Anda pilih jawabannya ({answeredCount}/{totalQuestions} terisi). Anda yakin ingin tetap mengumpulkan?
              </p>
            </div>
          </div>
        )}

        <div className="text-xs text-text-muted bg-surface-subtle p-3 rounded-lg border border-surface-border flex items-start gap-2">
          <HelpCircle className="w-4 h-4 text-text-disabled shrink-0 mt-0.5" />
          <p className="leading-relaxed">
            Setelah dikumpulkan, jawaban akan dikunci dan lembar pengerjaan tidak dapat diedit kembali. Hasil tes akan ditinjau langsung oleh tim Tutor Up Speaking.
          </p>
        </div>

        {/* Action Buttons */}
        <div className="flex items-center justify-end gap-2.5 pt-3 border-t border-surface-border">
          <Button
            type="button"
            variant="outline"
            disabled={isLoading}
            onClick={onClose}
          >
            Periksa Lagi
          </Button>

          <Button
            type="button"
            variant={isAllAnswered ? "primary" : "accent"}
            isLoading={isLoading}
            onClick={onConfirm}
            className="shadow-sm"
          >
            {isAllAnswered ? "Kumpulkan Sekarang" : "Tetap Kumpulkan"}
          </Button>
        </div>
      </div>
    </Modal>
  );
};
