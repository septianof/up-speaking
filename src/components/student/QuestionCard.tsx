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
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -8 }}
      transition={{ duration: 0.25, ease: "easeOut" }}
      className="w-full rounded-[28px] bg-surface-white border-2 border-primary-100 p-6 sm:p-9 shadow-kid-card"
    >
      {/* Question Text */}
      <h2 className="text-lg sm:text-xl md:text-2xl font-bold text-text-primary leading-relaxed mb-7 font-kid">
        {question.questionText}
      </h2>

      {/* Dynamic Options List */}
      <div className="space-y-3.5">
        {question.options.map((option, idx) => {
          const isSelected = selectedOptionId === option.id;
          const label = optionLabels[idx] || String.fromCharCode(65 + idx);

          return (
            <button
              key={option.id}
              type="button"
              onClick={() => onSelectOption(option.id)}
              className={`w-full p-4 sm:p-5 rounded-2xl text-left border-2 transition-all duration-150 flex items-center gap-4 group cursor-pointer select-none active:scale-[0.99] min-h-[58px] ${
                isSelected
                  ? "bg-primary-50 border-primary-500 shadow-sm ring-2 ring-primary-300/60"
                  : "bg-surface-white border-primary-100 hover:bg-sky-soft hover:border-primary-300"
              }`}
            >
              {/* Option Letter Circle */}
              <div
                className={`w-9 h-9 sm:w-10 sm:h-10 rounded-xl flex items-center justify-center font-display font-black text-sm shrink-0 transition-colors shadow-2xs ${
                  isSelected
                    ? "bg-primary-500 text-white"
                    : "bg-primary-50 text-primary-700 group-hover:bg-primary-100"
                }`}
              >
                {isSelected ? <Check className="w-5 h-5 stroke-[3]" /> : label}
              </div>

              {/* Option Text */}
              <span
                className={`text-base sm:text-lg leading-snug flex-1 font-kid ${
                  isSelected
                    ? "font-bold text-primary-950"
                    : "font-semibold text-text-secondary group-hover:text-text-primary"
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
