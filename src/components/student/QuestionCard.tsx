"use client";

import React from "react";
import { motion } from "framer-motion";
import { QuestionItem } from "@/types/student";
import { Check } from "lucide-react";

export interface QuestionCardProps {
  question: QuestionItem;
  selectedOptionId?: string;
  onSelectOption: (optionId: string) => void;
}

export const QuestionCard: React.FC<QuestionCardProps> = ({
  question,
  selectedOptionId,
  onSelectOption,
}) => {
  const optionLabels = ["A", "B", "C", "D", "E"];

  return (
    <motion.div
      key={question.id}
      initial={{ opacity: 0, x: 12 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: -12 }}
      transition={{ duration: 0.2, ease: "easeOut" }}
      className="w-full rounded-2xl bg-surface-white border border-surface-border p-5 sm:p-8 shadow-card"
    >
      {/* Question Text */}
      <h2 className="text-base sm:text-lg md:text-xl font-semibold text-text-primary leading-relaxed mb-6">
        {question.questionText}
      </h2>

      {/* Dynamic Options List */}
      <div className="space-y-3">
        {question.options.map((option, idx) => {
          const isSelected = selectedOptionId === option.id;
          const label = optionLabels[idx] || String.fromCharCode(65 + idx);

          return (
            <button
              key={option.id}
              type="button"
              onClick={() => onSelectOption(option.id)}
              className={`w-full p-4 rounded-xl text-left border transition-all duration-150 flex items-center gap-3.5 group cursor-pointer select-none active:scale-[0.99] min-h-[52px] ${
                isSelected
                  ? "bg-primary-50/70 border-primary-500 shadow-sm ring-1 ring-primary-500"
                  : "bg-surface-white border-surface-border hover:bg-surface-subtle hover:border-slate-300"
              }`}
            >
              {/* Option Letter Circle */}
              <div
                className={`w-8 h-8 rounded-full flex items-center justify-center font-bold text-xs shrink-0 transition-colors ${
                  isSelected
                    ? "bg-primary-500 text-surface-white"
                    : "bg-surface-subtle text-text-secondary group-hover:bg-slate-200"
                }`}
              >
                {isSelected ? <Check className="w-4 h-4 stroke-[3]" /> : label}
              </div>

              {/* Option Text */}
              <span
                className={`text-sm sm:text-base leading-snug flex-1 ${
                  isSelected
                    ? "font-semibold text-primary-900"
                    : "font-normal text-text-secondary"
                }`}
              >
                {option.optionText}
              </span>
            </button>
          );
        })}
      </div>
    </motion.div>
  );
};
