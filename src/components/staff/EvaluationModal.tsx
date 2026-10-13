"use client";

import React, { useState, useEffect } from "react";
import { CheckCircle2 } from "lucide-react";
import { Modal } from "@/components/ui/Modal";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";
import { StudentRecord, finalizeMockStudentEvaluation } from "@/lib/mock-data";
import { FinalLevel } from "@/types/student";

interface EvaluationModalProps {
  student: StudentRecord | null;
  isOpen: boolean;
  onClose: () => void;
  onSuccess?: (updated: StudentRecord) => void;
}

const INSTITUTION_THRESHOLDS = [
  {
    level: "BEGINNER" as FinalLevel,
    title: "Beginner",
    range: "0% – 59%",
  },
  {
    level: "INTERMEDIATE" as FinalLevel,
    title: "Intermediate",
    range: "60% – 79%",
  },
  {
    level: "ADVANCED" as FinalLevel,
    title: "Advanced",
    range: "80% – 100%",
  },
];

const LEVEL_META: Record<FinalLevel, { name: string; range: string }> = {
  BEGINNER: { name: "Beginner", range: "0% – 59%" },
  INTERMEDIATE: { name: "Intermediate", range: "60% – 79%" },
  ADVANCED: { name: "Advanced", range: "80% – 100%" },
};

export const EvaluationModal: React.FC<EvaluationModalProps> = ({
  student,
  isOpen,
  onClose,
  onSuccess,
}) => {
  const [selectedFinalLevel, setSelectedFinalLevel] = useState<FinalLevel>("BEGINNER");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  // Hitung persentase skor
  const scorePercent = student
    ? Math.round(((student.score || 0) / (student.totalQuestions || 10)) * 100)
    : 0;

  // Hitung level rekomendasi berdasarkan acuan lembaga
  const recommendedLevel: FinalLevel =
    scorePercent >= 80 ? "ADVANCED" : scorePercent >= 60 ? "INTERMEDIATE" : "BEGINNER";

  useEffect(() => {
    if (student) {
      setSelectedFinalLevel(student.finalLevel || recommendedLevel);
    }
  }, [student, recommendedLevel]);

  if (!student) return null;

  const handleFinalize = (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    setTimeout(() => {
      const updated = finalizeMockStudentEvaluation(student.id, {
        finalLevel: selectedFinalLevel,
      });

      setIsSubmitting(false);
      setSuccessMessage(`Hasil tes ${student.fullName} berhasil difinalisasi sebagai level ${selectedFinalLevel}!`);

      setTimeout(() => {
        setSuccessMessage(null);
        if (updated) onSuccess?.(updated);
        onClose();
      }, 1200);
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
      title="Evaluasi & Penetapan Level Siswa"
      description="Tinjau hasil lembar tes penempatan dan tetapkan level kelas resmi bagi siswa."
      maxWidth="lg"
    >
      {successMessage ? (
        <div className="py-6 flex flex-col items-center text-center">
          <div className="h-12 w-12 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center mb-3">
            <CheckCircle2 className="h-6 w-6" />
          </div>
          <p className="text-base font-semibold text-text-primary">{successMessage}</p>
          <p className="text-xs text-text-muted mt-1">
            Status siswa telah diperbarui ke FINALIZED dan siswa dapat melihat pengumuman resmi.
          </p>
        </div>
      ) : (
        <form onSubmit={handleFinalize} className="space-y-3 pt-2 max-h-[75vh] overflow-y-auto pr-1">
          {/* Header Ringkasan Peserta */}
          <div className="p-3.5 rounded-2xl bg-surface-subtle border border-surface-border grid grid-cols-2 sm:grid-cols-4 gap-3">
            <div>
              <p className="text-xs text-text-muted">Nama Siswa</p>
              <p className="font-semibold text-text-primary text-sm mt-0.5">{student.fullName}</p>
            </div>
            <div>
              <p className="text-xs text-text-muted">No. WhatsApp</p>
              <p className="font-mono font-semibold text-text-primary text-sm mt-0.5">{student.phone}</p>
            </div>
            <div>
              <p className="text-xs text-text-muted">Jenjang Ujian</p>
              <Badge variant="primary" size="sm" className="mt-0.5">
                {student.targetLevel === "ELEMENTARY" ? "Elementary (SD)" : "High School"}
              </Badge>
            </div>
            <div>
              <p className="text-xs text-text-muted">Skor Tes Objektif</p>
              <p className="font-semibold text-text-primary text-sm mt-0.5">
                {student.score || 0}/{student.totalQuestions || 10} ({scorePercent}%)
              </p>
            </div>
          </div>

          {/* Acuan Rentang Nilai Lembaga */}
          <div className="space-y-2 pt-1">
            <p className="text-xs font-medium text-text-muted mb-2">Acuan skor lembaga</p>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
              {INSTITUTION_THRESHOLDS.map((tier) => {
                const isRecommended = tier.level === recommendedLevel;

                return (
                  <div
                    key={tier.level}
                    className={`p-2.5 rounded-xl border text-xs transition-all relative ${
                      isRecommended
                        ? "border-primary-500 bg-primary-50/60 shadow-sm ring-1 ring-primary-500"
                        : "border-surface-border bg-surface-white opacity-70"
                    }`}
                  >
                    {isRecommended && (
                      <span className="absolute -top-2 -right-1 px-1.5 py-0.5 rounded-full text-[9px] font-bold bg-primary-600 text-white">
                        Rekomendasi
                      </span>
                    )}
                    <div className="flex items-center justify-between font-bold">
                      <span className="text-text-primary">{tier.title}</span>
                      <span className="font-mono text-primary-700">{tier.range}</span>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Formulir Penetapan Level Final oleh Tutor (FR-015) */}
          <div className="space-y-2 pt-2">
            <p className="text-sm font-medium text-text-secondary mb-2">
              Tetapkan level final <span className="text-accent-500">*</span>
            </p>
            <div className="grid grid-cols-3 gap-3">
              {(["BEGINNER", "INTERMEDIATE", "ADVANCED"] as FinalLevel[]).map((lvl) => (
                <button
                  key={lvl}
                  type="button"
                  onClick={() => setSelectedFinalLevel(lvl)}
                  className={`p-3 rounded-xl border text-center transition-all ${
                    selectedFinalLevel === lvl
                      ? "border-emerald-500 bg-emerald-50 text-emerald-800 font-bold ring-2 ring-emerald-500/30 shadow-sm"
                      : "border-surface-border bg-surface-white text-text-muted hover:border-slate-300"
                  }`}
                >
                  <span className="text-sm font-bold block">{LEVEL_META[lvl].name}</span>
                  <span className="text-[11px] text-text-muted">{LEVEL_META[lvl].range}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Actions */}
          <div className="flex items-center justify-end gap-2.5 pt-4 border-t border-surface-border mt-4">
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
              className="gap-2 bg-emerald-600 hover:bg-emerald-700 focus:ring-emerald-400"
            >
              <CheckCircle2 className="h-4 w-4" />
              Simpan & Finalisasi Level
            </Button>
          </div>
        </form>
      )}
    </Modal>
  );
};
