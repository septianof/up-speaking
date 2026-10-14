"use client";

import React, { useState, useEffect, useMemo } from "react";
import { CheckCircle2, ChevronDown, FileText, Check, X } from "lucide-react";
import { Modal } from "@/components/ui/Modal";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";
import { StudentRecord } from "@/lib/mock-data";
import { getMockQuestions } from "@/lib/mock-questions";
import { FinalLevel } from "@/types/student";

interface EvaluationModalProps {
  student: StudentRecord | null;
  isOpen: boolean;
  onClose: () => void;
  onSuccess?: (updated: StudentRecord) => void;
}

interface LiveAnswerOption {
  id: string;
  optionText: string;
  isCorrect: boolean;
}

interface LiveAnswerDetail {
  questionId: string;
  questionText: string;
  selectedOptionId: string | null;
  selectedOptionText: string;
  correctOptionId: string;
  correctOptionText: string;
  isCorrect: boolean;
  options: LiveAnswerOption[];
}

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
  const [showAnswerSheet, setShowAnswerSheet] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  // Hitung persentase skor objektif siswa
  const score = student?.score ?? 0;
  const totalQuestions = student?.totalQuestions || 10;
  const scorePercent = Math.round((score / totalQuestions) * 100);

  const [liveAnswers, setLiveAnswers] = useState<LiveAnswerDetail[] | null>(null);

  useEffect(() => {
    if (student) {
      setSelectedFinalLevel(student.finalLevel || "BEGINNER");
      setShowAnswerSheet(false);
      setLiveAnswers(null);

      if (student.sessionId) {
        fetch(`/api/tutor/evaluations/${student.sessionId}`)
          .then((res) => res.json())
          .then((data) => {
            if (data.answers && data.answers.length > 0) {
              setLiveAnswers(data.answers);
            }
          })
          .catch((err) => console.error("Error fetching live student answers:", err));
      }
    }
  }, [student]);

  // Siapkan data butir soal dan jawaban siswa
  const answerSheet = useMemo(() => {
    if (liveAnswers && liveAnswers.length > 0) {
      return liveAnswers.map((item) => ({
        question: {
          id: item.questionId,
          questionText: item.questionText,
          options: item.options || [],
          correctOptionId: item.correctOptionId,
        },
        selectedOptionId: item.selectedOptionId,
        isCorrect: item.isCorrect,
      }));
    }

    if (!student) return [];
    const allQuestions = getMockQuestions();
    const filtered = allQuestions.filter((q) => q.targetLevel === student.targetLevel);
    const questions = filtered.length > 0 ? filtered : allQuestions.slice(0, 10);

    return questions.map((q, idx) => {
      let selectedOptionId = student.answers ? student.answers[q.id] : undefined;

      if (selectedOptionId === undefined) {
        if (idx < score) {
          selectedOptionId = q.correctOptionId || q.options[0]?.id;
        } else {
          const wrongOpt = q.options.find((opt) => opt.id !== q.correctOptionId);
          selectedOptionId = wrongOpt ? wrongOpt.id : q.options[1]?.id || q.options[0]?.id;
        }
      }

      const isCorrect = selectedOptionId === q.correctOptionId;
      return {
        question: q,
        selectedOptionId,
        isCorrect,
      };
    });
  }, [student, score, liveAnswers]);

  const correctCount = answerSheet.filter((item) => item.isCorrect).length;
  const wrongCount = answerSheet.length - correctCount;

  if (!student) return null;

  const handleFinalize = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!student) return;

    setIsSubmitting(true);

    try {
      if (student.sessionId) {
        const res = await fetch(`/api/tutor/evaluations/${student.sessionId}`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ assignedLevel: selectedFinalLevel }),
        });

        const data = await res.json();
        if (!res.ok) {
          alert(data.error || "Gagal menyimpan evaluasi tutor.");
          setIsSubmitting(false);
          return;
        }
      }

      setIsSubmitting(false);
      setSuccessMessage(
        `Hasil tes ${student.fullName} berhasil difinalisasi sebagai level ${LEVEL_META[selectedFinalLevel].name}!`
      );

      setTimeout(() => {
        setSuccessMessage(null);
        if (student) onSuccess?.({ ...student, finalLevel: selectedFinalLevel, status: "FINALIZED" });
        onClose();
      }, 1200);
    } catch {
      alert("Terjadi kendala jaringan saat memfinalisasi evaluasi.");
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
      title="Evaluasi Hasil Tes Siswa"
      description="Tinjau hasil lembar tes dan tetapkan penempatan level resmi siswa."
      maxWidth="xl"
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
        <form onSubmit={handleFinalize} className="space-y-4 pt-1 max-h-[75vh] overflow-y-auto pr-1">
          {/* Ringkasan Profil & Skor Siswa */}
          <div className="p-3.5 rounded-xl bg-surface-subtle border border-surface-border grid grid-cols-2 sm:grid-cols-4 gap-3">
            <div>
              <p className="text-xs text-text-muted">Nama Siswa</p>
              <p className="font-semibold text-text-primary text-sm mt-0.5 truncate">
                {student.fullName}
              </p>
            </div>
            <div>
              <p className="text-xs text-text-muted">No. WhatsApp</p>
              <p className="font-mono font-semibold text-text-primary text-sm mt-0.5">
                {student.phone}
              </p>
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
                {score}/{totalQuestions} ({scorePercent}%)
              </p>
            </div>
          </div>

          {/* Panel Detail Lembar Jawaban Siswa (Collapsible) */}
          <div className="border border-surface-border rounded-xl overflow-hidden bg-surface-white">
            <button
              type="button"
              onClick={() => setShowAnswerSheet(!showAnswerSheet)}
              className="w-full px-4 py-3 bg-surface-subtle/50 hover:bg-surface-subtle flex items-center justify-between text-left transition-colors"
            >
              <div className="flex items-center gap-2.5">
                <FileText className="h-4 w-4 text-primary-500 shrink-0" />
                <span className="text-xs sm:text-sm font-semibold text-text-primary">
                  Detail Lembar Jawaban Siswa
                </span>
                <span className="text-xs text-text-muted">
                  ({correctCount} Benar, {wrongCount} Salah)
                </span>
              </div>
              <div className="flex items-center gap-1 text-xs font-semibold text-primary-600 shrink-0">
                <span>{showAnswerSheet ? "Sembunyikan" : "Lihat Detail"}</span>
                <ChevronDown
                  className={`h-4 w-4 transition-transform duration-200 ${
                    showAnswerSheet ? "rotate-180" : ""
                  }`}
                />
              </div>
            </button>

            {showAnswerSheet && (
              <div className="p-3.5 space-y-3.5 max-h-72 overflow-y-auto border-t border-surface-border bg-surface-subtle/20 divide-y divide-surface-border/60">
                {answerSheet.map((item, idx) => (
                  <div key={item.question.id} className={idx > 0 ? "pt-3" : ""}>
                    {/* Teks Pertanyaan & Status Benar/Salah */}
                    <div className="flex items-start justify-between gap-3 mb-2">
                      <p className="text-xs sm:text-sm font-medium text-text-primary leading-snug">
                        <span className="font-bold text-text-muted mr-1.5">{idx + 1}.</span>
                        {item.question.questionText}
                      </p>
                      <span
                        className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[11px] font-bold shrink-0 ${
                          item.isCorrect
                            ? "bg-emerald-100 text-emerald-700"
                            : "bg-rose-100 text-rose-700"
                        }`}
                      >
                        {item.isCorrect ? (
                          <>
                            <Check className="h-3 w-3" />
                            Benar
                          </>
                        ) : (
                          <>
                            <X className="h-3 w-3" />
                            Salah
                          </>
                        )}
                      </span>
                    </div>

                    {/* Daftar Opsi Jawaban */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-1.5 text-xs">
                      {item.question.options.map((opt, optIdx) => {
                        const label = String.fromCharCode(65 + optIdx);
                        const isSelected = opt.id === item.selectedOptionId;
                        const isKey = opt.id === item.question.correctOptionId;

                        let cardStyle =
                          "border-surface-border bg-surface-white text-text-muted opacity-70";
                        let tag = null;

                        if (isSelected && isKey) {
                          cardStyle =
                            "border-emerald-300 bg-emerald-50 text-emerald-900 font-semibold";
                          tag = (
                            <span className="text-[10px] text-emerald-700 font-bold ml-auto shrink-0">
                              (Jawaban Siswa &amp; Kunci)
                            </span>
                          );
                        } else if (isSelected && !isKey) {
                          cardStyle =
                            "border-rose-300 bg-rose-50 text-rose-900 font-medium";
                          tag = (
                            <span className="text-[10px] text-rose-600 font-bold ml-auto shrink-0">
                              (Jawaban Siswa)
                            </span>
                          );
                        } else if (!isSelected && isKey) {
                          cardStyle =
                            "border-dashed border-emerald-400 bg-emerald-50/50 text-emerald-800 font-medium";
                          tag = (
                            <span className="text-[10px] text-emerald-700 font-bold ml-auto shrink-0">
                              (Kunci Benar)
                            </span>
                          );
                        }

                        return (
                          <div
                            key={opt.id}
                            className={`px-2.5 py-1.5 rounded-lg border flex items-center gap-2 ${cardStyle}`}
                          >
                            <span className="font-bold shrink-0">{label}.</span>
                            <span className="truncate">{opt.optionText}</span>
                            {tag}
                          </div>
                        );
                      })}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Penetapan Level Final Siswa */}
          <div className="space-y-2 pt-1">
            <label className="block text-sm font-semibold text-text-primary mb-2">
              Tetapkan Level Final Siswa <span className="text-accent-500">*</span>
            </label>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              {(["BEGINNER", "INTERMEDIATE", "ADVANCED"] as FinalLevel[]).map((lvl) => {
                const isSelected = selectedFinalLevel === lvl;

                return (
                  <button
                    key={lvl}
                    type="button"
                    onClick={() => setSelectedFinalLevel(lvl)}
                    className={`p-3 rounded-xl border text-left transition-all ${
                      isSelected
                        ? "border-primary-500 bg-primary-50/70 shadow-xs ring-2 ring-primary-500/20"
                        : "border-surface-border bg-surface-white hover:border-slate-300"
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <span
                        className={`text-sm font-bold ${
                          isSelected ? "text-primary-700" : "text-text-primary"
                        }`}
                      >
                        {LEVEL_META[lvl].name}
                      </span>
                      {isSelected && <Check className="h-4 w-4 text-primary-600 shrink-0" />}
                    </div>
                    <span className="text-[11px] text-text-muted block mt-0.5">
                      Acuan: {LEVEL_META[lvl].range}
                    </span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Modal Action Buttons */}
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
              className="gap-2"
            >
              <CheckCircle2 className="h-4 w-4" />
              Simpan &amp; Finalisasi Level
            </Button>
          </div>
        </form>
      )}
    </Modal>
  );
};
