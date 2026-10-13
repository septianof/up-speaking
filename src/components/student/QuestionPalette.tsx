"use client";

import React from "react";
import { Check, Sparkles } from "lucide-react";

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
    <div className="w-full bg-surface-white rounded-[28px] border-2 border-primary-100 p-5 sm:p-6 shadow-kid-card font-kid">
      {/* Header Palet */}
      <div className="flex items-center justify-between mb-4 pb-3 border-b border-primary-100/60">
        <h3 className="font-display text-base font-bold text-text-primary flex items-center gap-1.5">
          <Sparkles className="w-4 h-4 text-sun-500" />
          <span>Nomor Soal</span>
        </h3>
        <span className="text-xs font-bold text-mint-700 bg-mint-50 px-2.5 py-1 rounded-full border border-mint-200 shadow-2xs">
          {answeredQuestionIndices.length}/{totalQuestions} Terjawab
        </span>
      </div>

      {/* Grid of question buttons with inner padding */}
      <div className="grid grid-cols-5 gap-2.5 max-h-[340px] overflow-y-auto p-1.5 custom-scrollbar">
        {Array.from({ length: totalQuestions }, (_, i) => {
          const isCurrent = currentIndex === i;
          const isAnswered = answeredSet.has(i);

          let buttonStyle = "bg-white border-2 border-primary-100 text-text-secondary hover:bg-sky-soft hover:border-primary-300";

          if (isAnswered) {
            buttonStyle = "bg-mint-500 text-white border-2 border-mint-600 shadow-[0_3px_0_0_#059669]";
          }

          if (isCurrent) {
            buttonStyle = `${buttonStyle} ring-3 ring-primary-400 ring-offset-2 font-black z-10 scale-105`;
          }

          return (
            <button
              key={i}
              type="button"
              onClick={() => onSelectQuestion(i)}
              className={`h-11 rounded-2xl text-sm font-bold flex items-center justify-center transition-all relative active:scale-95 cursor-pointer ${buttonStyle}`}
              aria-label={`Pindah ke soal nomor ${i + 1}`}
            >
              <span>{i + 1}</span>
              {isAnswered && (
                <Check className="w-3 h-3 absolute top-1 right-1 stroke-[3] text-white/90" />
              )}
            </button>
          );
        })}
      </div>

      {/* Legend / Keterangan Warna */}
      <div className="mt-5 pt-3.5 border-t border-primary-100/60 flex items-center justify-around text-xs font-semibold text-text-muted">
        <div className="flex items-center gap-1.5">
          <div className="w-3.5 h-3.5 rounded-md bg-mint-500 shadow-2xs" />
          <span>Terjawab</span>
        </div>
        <div className="flex items-center gap-1.5">
          <div className="w-3.5 h-3.5 rounded-md bg-white border-2 border-primary-100" />
          <span>Belum</span>
        </div>
        <div className="flex items-center gap-1.5">
          <div className="w-3.5 h-3.5 rounded-md ring-2 ring-primary-500 bg-white" />
          <span>Sedang Buka</span>
        </div>
      </div>
    </div>
  );
};
