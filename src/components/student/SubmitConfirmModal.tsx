"use client";

import React from "react";
import { Modal, Button } from "@/components/ui";
import { Mascot } from "@/components/student/Mascot";
import { CheckCircle, AlertTriangle } from "lucide-react";

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
      variant="kid"
      topSlot={<Mascot mood={isAllAnswered ? "happy" : "think"} size={100} />}
      title="Mau Kumpulkan Sekarang?"
      description="Pastikan kamu sudah memeriksa semua jawabanmu dengan teliti ya!"
      maxWidth="md"
    >
      <div className="space-y-4 pt-1 font-kid">
        {/* Banner Status Jawaban */}
        {isAllAnswered ? (
          <div className="flex items-center gap-3.5 p-4 rounded-2xl bg-mint-50 border-2 border-mint-300 text-mint-900 shadow-2xs">
            <div className="w-9 h-9 rounded-xl bg-mint-500 text-white flex items-center justify-center shrink-0 shadow-2xs">
              <CheckCircle className="w-5 h-5" />
            </div>
            <div>
              <p className="font-bold text-base text-mint-950 font-display">
                Hebat! Semua Soal Sudah Terjawab 🎉
              </p>
              <p className="text-xs sm:text-sm text-mint-700 mt-0.5">
                Total {totalQuestions} dari {totalQuestions} soal terisi lengkap.
              </p>
            </div>
          </div>
        ) : (
          <div className="flex items-start gap-3.5 p-4 rounded-2xl bg-sun-50 border-2 border-sun-300 text-sun-900 shadow-2xs">
            <div className="w-9 h-9 rounded-xl bg-sun-400 text-amber-900 flex items-center justify-center shrink-0 shadow-2xs mt-0.5">
              <AlertTriangle className="w-5 h-5" />
            </div>
            <div>
              <p className="font-bold text-base text-amber-950 font-display">
                Masih ada {unAnsweredCount} Soal Belum Terisi
              </p>
              <p className="text-xs sm:text-sm text-amber-800 mt-0.5 leading-relaxed">
                Kamu baru mengisi {answeredCount} dari {totalQuestions} soal. Boleh diperiksa lagi lho!
              </p>
            </div>
          </div>
        )}

        {/* Action Buttons: Simetris 50:50 */}
        <div className="grid grid-cols-2 gap-3 pt-2 pb-2">
          <Button
            type="button"
            variant="kidSoft"
            size="lg"
            disabled={isLoading}
            onClick={onClose}
            className="w-full text-sm"
          >
            Periksa Lagi
          </Button>

          <Button
            type="button"
            variant="kid"
            size="lg"
            isLoading={isLoading}
            onClick={onConfirm}
            className="w-full text-sm shadow-[0_4px_0_0_#B91C1C]"
          >
            {isAllAnswered ? "Kumpulkan!" : "Tetap Kumpulkan"}
          </Button>
        </div>
      </div>
    </Modal>
  );
};
