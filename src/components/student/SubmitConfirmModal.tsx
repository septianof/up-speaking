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
      title="Konfirmasi Pengumpulan"
      maxWidth="md"
    >
      <div className="space-y-3.5 pt-1">
        {/* Banner Status Jawaban */}
        {isAllAnswered ? (
          <div className="flex items-start gap-3 p-3.5 rounded-xl bg-success-50 border border-emerald-200 text-success-700">
            <CheckCircle className="w-5 h-5 text-success-500 shrink-0 mt-0.5" />
            <div>
              <p className="font-bold text-sm text-emerald-900">
                Semua Soal Sudah Terjawab
              </p>
              <p className="text-xs text-success-600 mt-0.5">
                Total {totalQuestions} dari {totalQuestions} soal telah terisi lengkap.
              </p>
            </div>
          </div>
        ) : (
          <div className="flex items-start gap-3 p-3.5 rounded-xl bg-amber-50 border border-amber-300 text-amber-900">
            <AlertTriangle className="w-5 h-5 text-amber-500 shrink-0 mt-0.5" />
            <div>
              <p className="font-bold text-sm text-amber-950">
                {unAnsweredCount} Soal Belum Terjawab
              </p>
              <p className="text-xs text-amber-800 mt-0.5 leading-relaxed">
                Anda baru mengisi {answeredCount} dari {totalQuestions} soal. Yakin ingin mengumpulkan?
              </p>
            </div>
          </div>
        )}

        <div className="text-xs text-text-muted bg-surface-subtle p-3 rounded-xl border border-surface-border flex items-center gap-2">
          <HelpCircle className="w-4 h-4 text-text-disabled shrink-0" />
          <p className="leading-tight">
            Jawaban yang sudah dikumpulkan tidak dapat diubah kembali.
          </p>
        </div>

        {/* Action Buttons: Simetris 50:50 di Mobile & Desktop */}
        <div className="grid grid-cols-2 gap-2.5 pt-2 border-t border-surface-border">
          <Button
            type="button"
            variant="outline"
            disabled={isLoading}
            onClick={onClose}
            className="w-full"
          >
            Periksa Lagi
          </Button>

          <Button
            type="button"
            variant={isAllAnswered ? "primary" : "accent"}
            isLoading={isLoading}
            onClick={onConfirm}
            className="w-full shadow-sm"
          >
            {isAllAnswered ? "Kumpulkan" : "Tetap Kumpulkan"}
          </Button>
        </div>
      </div>
    </Modal>
  );
};
