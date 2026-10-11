"use client";

import React from "react";
import { Check } from "lucide-react";

export interface QuestionPaletteProps {
  totalQuestions: number;
  currentIndex: number;
  answeredQuestionIndices: number[]; // 0-based indices of answered questions
  onSelectQuestion: (index: number) => void;
}

export const QuestionPalette: React.FC<QuestionPaletteProps> = ({
  totalQuestions,
  currentIndex,
  answeredQuestionIndices,
  onSelectQuestion,
}) => {
  const answeredSet = new Set(answeredQuestionIndices);

  return (
    <div className="w-full bg-surface-white rounded-2xl border border-surface-border p-5 shadow-card">
      <div className="flex items-center justify-between mb-4 pb-3 border-b border-surface-border">
        <h3 className="text-sm font-bold text-text-primary">
          Nomor Soal
        </h3>
        <span className="text-xs font-semibold text-success-600 bg-success-50 px-2 py-0.5 rounded-full border border-emerald-200">
          {answeredQuestionIndices.length}/{totalQuestions} Terjawab
        </span>
      </div>

      {/* Grid of question buttons with inner padding to prevent ring cutoff */}
      <div className="grid grid-cols-5 gap-2.5 max-h-[340px] overflow-y-auto p-1.5">
        {Array.from({ length: totalQuestions }, (_, i) => {
          const isCurrent = currentIndex === i;
          const isAnswered = answeredSet.has(i);

          let buttonStyle = "bg-surface-white border-surface-border text-text-secondary hover:bg-surface-subtle";

          if (isAnswered) {
            buttonStyle = "bg-success-500 text-surface-white border-success-600 shadow-sm";
          }

          if (isCurrent) {
            buttonStyle = `${buttonStyle} ring-2 ring-primary-500 ring-offset-1 font-bold z-10`;
          }

          return (
            <button
              key={i}
              type="button"
              onClick={() => onSelectQuestion(i)}
              className={`h-11 rounded-xl border text-xs font-semibold flex items-center justify-center transition-all relative active:scale-95 ${buttonStyle}`}
              aria-label={`Pindah ke soal nomor ${i + 1}`}
            >
              <span>{i + 1}</span>
              {isAnswered && (
                <Check className="w-2.5 h-2.5 absolute top-1 right-1 stroke-[3] text-surface-white/80" />
              )}
            </button>
          );
        })}
      </div>

      {/* Legend / Keterangan Warna */}
      <div className="mt-5 pt-3 border-t border-surface-border flex items-center justify-around text-xs text-text-muted">
        <div className="flex items-center gap-1.5">
          <div className="w-3.5 h-3.5 rounded bg-success-500" />
          <span>Terjawab</span>
        </div>
        <div className="flex items-center gap-1.5">
          <div className="w-3.5 h-3.5 rounded bg-surface-white border border-surface-border" />
          <span>Belum</span>
        </div>
        <div className="flex items-center gap-1.5">
          <div className="w-3.5 h-3.5 rounded ring-2 ring-primary-500 bg-surface-white" />
          <span>Aktif</span>
        </div>
      </div>
    </div>
  );
};
