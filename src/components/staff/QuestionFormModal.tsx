"use client";

import React, { useState, useEffect } from "react";
import { Plus, Trash2, CheckCircle2, AlertCircle } from "lucide-react";
import { Modal } from "@/components/ui/Modal";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { TargetLevel, QuestionItem } from "@/types/student";

interface QuestionFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  defaultLevel?: TargetLevel;
  initialQuestion?: QuestionItem | null;
  onSuccess?: () => void;
}

interface FormOption {
  tempId: string;
  text: string;
}

const OPTION_LABELS = ["A", "B", "C", "D", "E"];

export const QuestionFormModal: React.FC<QuestionFormModalProps> = ({
  isOpen,
  onClose,
  defaultLevel = "ELEMENTARY",
  initialQuestion = null,
  onSuccess,
}) => {
  const isEditing = Boolean(initialQuestion);
  const [targetLevel, setTargetLevel] = useState<TargetLevel>(defaultLevel);
  const [questionText, setQuestionText] = useState("");
  const [options, setOptions] = useState<FormOption[]>([
    { tempId: "opt-1", text: "" },
    { tempId: "opt-2", text: "" },
    { tempId: "opt-3", text: "" },
    { tempId: "opt-4", text: "" },
  ]);
  const [correctTempId, setCorrectTempId] = useState<string>("opt-1");
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  // Sync state saat modal dibuka atau saat initialQuestion berubah
  useEffect(() => {
    if (initialQuestion) {
      setTargetLevel(initialQuestion.targetLevel);
      setQuestionText(initialQuestion.questionText);
      const mapped = initialQuestion.options.map((opt, idx) => ({
        tempId: opt.id || `opt-${idx + 1}`,
        text: opt.optionText,
      }));
      setOptions(mapped);
      setCorrectTempId(initialQuestion.correctOptionId || mapped[0]?.tempId || "opt-1");
    } else {
      setTargetLevel(defaultLevel);
      setQuestionText("");
      setOptions([
        { tempId: "opt-1", text: "" },
        { tempId: "opt-2", text: "" },
        { tempId: "opt-3", text: "" },
        { tempId: "opt-4", text: "" },
      ]);
      setCorrectTempId("opt-1");
    }
    setErrorMsg(null);
    setSuccessMessage(null);
  }, [initialQuestion, defaultLevel, isOpen]);

  // Tambah opsi jawaban (max 5)
  const handleAddOption = () => {
    if (options.length >= 5) return;
    const newId = `opt-${Date.now()}`;
    setOptions((prev) => [...prev, { tempId: newId, text: "" }]);
  };

  // Hapus opsi jawaban (min 2)
  const handleRemoveOption = (indexToRemove: number) => {
    if (options.length <= 2) return;
    const removedOption = options[indexToRemove];
    const newOptions = options.filter((_, idx) => idx !== indexToRemove);
    setOptions(newOptions);

    if (correctTempId === removedOption.tempId) {
      setCorrectTempId(newOptions[0].tempId);
    }
  };

  const handleOptionTextChange = (index: number, text: string) => {
    setOptions((prev) =>
      prev.map((opt, idx) => (idx === index ? { ...opt, text } : opt))
    );
    if (errorMsg) setErrorMsg(null);
  };

  const validate = (): boolean => {
    if (!questionText.trim()) {
      setErrorMsg("Teks pertanyaan butir soal wajib diisi.");
      return false;
    }

    for (let i = 0; i < options.length; i++) {
      if (!options[i].text.trim()) {
        setErrorMsg(`Teks opsi pilihan ${OPTION_LABELS[i]} belum diisi.`);
        return false;
      }
    }

    if (!correctTempId) {
      setErrorMsg("Silakan tandai salah satu opsi sebagai kunci jawaban benar.");
      return false;
    }

    setErrorMsg(null);
    return true;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;

    setIsSubmitting(true);
    try {
      const payloadOptions = options.map((opt) => ({
        optionText: opt.text.trim(),
        isCorrect: opt.tempId === correctTempId,
      }));

      const url =
        isEditing && initialQuestion
          ? `/api/admin/questions/${initialQuestion.id}`
          : "/api/admin/questions";
      const method = isEditing && initialQuestion ? "PUT" : "POST";

      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          questionText: questionText.trim(),
          targetLevel,
          options: payloadOptions,
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        setErrorMsg(data.error || "Gagal menyimpan butir soal.");
        return;
      }

      setSuccessMessage(
        isEditing
          ? "Perubahan butir soal berhasil disimpan!"
          : "Butir soal baru berhasil disimpan ke Bank Soal!"
      );

      setTimeout(() => {
        setSuccessMessage(null);
        onSuccess?.();
        onClose();
      }, 1000);
    } catch {
      setErrorMsg("Terjadi kendala jaringan saat menyimpan soal.");
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
      title={isEditing ? "Edit Butir Soal" : "Tambah Butir Soal"}
      description={
        isEditing
          ? "Perbarui teks soal, opsi pilihan, atau kunci jawaban."
          : "Tentukan teks soal, opsi pilihan, dan kunci jawaban benar."
      }
      maxWidth="lg"
    >
      {successMessage ? (
        <div className="py-6 flex flex-col items-center text-center">
          <div className="h-12 w-12 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center mb-3">
            <CheckCircle2 className="h-6 w-6" />
          </div>
          <p className="text-base font-semibold text-text-primary">{successMessage}</p>
          <p className="text-xs text-text-muted mt-1">Data bank soal aktif telah diperbarui.</p>
        </div>
      ) : (
        <form onSubmit={handleSubmit} className="space-y-4 pt-1 max-h-[75vh] overflow-y-auto pr-1">
          {errorMsg && (
            <div className="p-3 rounded-xl bg-accent-50 border border-accent-200 text-xs text-accent-700 flex items-center gap-2">
              <AlertCircle className="h-4 w-4 shrink-0 text-accent-500" />
              <span>{errorMsg}</span>
            </div>
          )}

          {/* Jenjang Soal */}
          <div>
            <label className="block text-sm font-medium text-text-secondary mb-1.5">
              Jenjang <span className="text-accent-500">*</span>
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

          {/* Teks Pertanyaan */}
          <div>
            <label className="block text-sm font-medium text-text-secondary mb-1.5">
              Pertanyaan / soal <span className="text-accent-500">*</span>
            </label>
            <textarea
              rows={3}
              value={questionText}
              onChange={(e) => {
                setQuestionText(e.target.value);
                if (errorMsg) setErrorMsg(null);
              }}
              placeholder="Tuliskan butir soal bahasa Inggris di sini..."
              className="w-full rounded-xl border border-surface-border p-3 text-xs sm:text-sm text-text-primary placeholder:text-text-muted focus:outline-none focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500"
            />
          </div>

          {/* Opsi Pilihan Jawaban Dinamis */}
          <div className="space-y-2.5 pt-2">
            <div className="flex items-center justify-between">
              <label className="text-sm font-medium text-text-secondary">
                Opsi pilihan jawaban ({options.length}/5)
              </label>
              <span className="text-[11px] text-text-muted">
                Pilih radio sebagai kunci jawaban benar
              </span>
            </div>

            <div className="space-y-2">
              {options.map((opt, idx) => (
                <div key={opt.tempId} className="flex items-center gap-2">
                  {/* Radio Kunci Jawaban */}
                  <div className="flex items-center justify-center p-2 rounded-lg bg-surface-subtle border border-surface-border">
                    <input
                      type="radio"
                      name="correctOption"
                      checked={correctTempId === opt.tempId}
                      onChange={() => setCorrectTempId(opt.tempId)}
                      title={`Tandai opsi ${OPTION_LABELS[idx]} sebagai jawaban benar`}
                      className="h-4 w-4 text-emerald-600 focus:ring-emerald-500 cursor-pointer"
                    />
                  </div>

                  {/* Label Huruf */}
                  <span className="w-6 text-center font-bold text-xs text-text-secondary">
                    {OPTION_LABELS[idx]}.
                  </span>

                  {/* Input Teks Opsi */}
                  <Input
                    type="text"
                    value={opt.text}
                    onChange={(e) => handleOptionTextChange(idx, e.target.value)}
                    placeholder={`Teks pilihan ${OPTION_LABELS[idx]}...`}
                    className="text-xs sm:text-sm py-2"
                  />

                  {/* Tombol Hapus Opsi (disable jika <= 2) */}
                  <button
                    type="button"
                    onClick={() => handleRemoveOption(idx)}
                    disabled={options.length <= 2}
                    title={
                      options.length <= 2
                        ? "Minimal 2 opsi pilihan jawaban"
                        : "Hapus baris pilihan ini"
                    }
                    className={`p-2 rounded-xl transition-colors shrink-0 ${
                      options.length <= 2
                        ? "text-slate-300 cursor-not-allowed"
                        : "text-accent-500 hover:bg-accent-50 hover:text-accent-600"
                    }`}
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>
              ))}
            </div>

            {/* Tombol Tambah Baris Opsi (disable jika >= 5) */}
            <div className="pt-2">
              <button
                type="button"
                onClick={handleAddOption}
                disabled={options.length >= 5}
                className={`inline-flex items-center gap-1.5 text-xs font-semibold px-3 py-1.5 rounded-xl border transition-all ${
                  options.length >= 5
                    ? "border-slate-200 text-slate-300 cursor-not-allowed bg-slate-50"
                    : "border-primary-200 text-primary-600 bg-primary-50 hover:bg-primary-100"
                }`}
              >
                <Plus className="h-3.5 w-3.5" />
                Tambah Baris Opsi (Maksimal 5)
              </button>
            </div>
          </div>

          {/* Form Actions */}
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
            >
              {isEditing ? "Perbarui Butir Soal" : "Simpan Butir Soal"}
            </Button>
          </div>
        </form>
      )}
    </Modal>
  );
};
