'use client';

import React from 'react';
import { Check } from 'lucide-react';
import type { SanitizedQuestion } from '@/types';

interface QuestionCardProps {
  question: SanitizedQuestion;
  selectedOptionId?: string;
  onSelectOption: (questionId: string, optionId: string) => void;
  disabled?: boolean;
}

export default function QuestionCard({
  question,
  selectedOptionId,
  onSelectOption,
  disabled = false,
}: QuestionCardProps) {
  return (
    <section
      aria-label="Lembar Pertanyaan Ujian"
      className="bg-white rounded-3xl border border-slate-100/90 p-6 sm:p-10 shadow-[0_4px_24px_-4px_rgba(0,0,0,0.04)] transition-all animate-fade-in"
    >
      {/* Teks Butir Pertanyaan */}
      <h2 className="text-lg sm:text-xl md:text-2xl font-bold text-slate-900 leading-relaxed sm:leading-snug mb-6 sm:mb-8">
        {question.question_text}
      </h2>

      {/* Daftar Radio Card Opsi Jawaban (Mobile Tap-Friendly) */}
      <div
        role="radiogroup"
        aria-label="Pilihan Jawaban"
        className="space-y-3 sm:space-y-3.5"
      >
        {question.options.map((option, idx) => {
          const optionLabel = String.fromCharCode(65 + idx); // A, B, C, D, ...
          const isSelected = selectedOptionId === option.id;

          return (
            <button
              key={option.id}
              type="button"
              role="radio"
              aria-checked={isSelected}
              disabled={disabled}
              onClick={() => onSelectOption(question.id, option.id)}
              className={`w-full p-4 sm:p-4.5 rounded-2xl flex items-center justify-between text-left transition-all duration-200 cursor-pointer select-none group focus:outline-none focus-visible:ring-2 focus-visible:ring-[#0e263e] focus-visible:ring-offset-2 active:scale-[0.99] disabled:cursor-not-allowed disabled:opacity-60 ${
                isSelected
                  ? 'border-2 border-[#0e263e] bg-white text-slate-900 shadow-xs'
                  : 'border border-slate-200/90 bg-white hover:border-slate-300 hover:bg-slate-50/60 text-slate-700'
              }`}
            >
              {/* Sisi Kiri: Badge Huruf Opsi + Teks Opsi Jawaban */}
              <div className="flex items-center gap-3.5 sm:gap-4 min-w-0 pr-2">
                <span
                  className={`w-9 h-9 sm:w-10 sm:h-10 rounded-xl font-bold text-sm sm:text-base flex items-center justify-center transition-colors flex-shrink-0 ${
                    isSelected
                      ? 'bg-[#0e263e] text-white shadow-xs'
                      : 'bg-slate-100 text-slate-500 group-hover:bg-slate-200/70 group-hover:text-slate-700'
                  }`}
                >
                  {optionLabel}
                </span>
                <span
                  className={`text-sm sm:text-base leading-snug break-words ${
                    isSelected
                      ? 'font-semibold text-slate-900'
                      : 'font-medium text-slate-700'
                  }`}
                >
                  {option.option_text}
                </span>
              </div>

              {/* Sisi Kanan: Ikon Centang (Checkmark) Saat Terpilih */}
              <div className="flex-shrink-0 w-6 flex items-center justify-center">
                {isSelected ? (
                  <Check
                    className="w-5 h-5 text-[#0e263e] stroke-[2.5] animate-scale-in"
                    aria-hidden="true"
                  />
                ) : (
                  <div className="w-5 h-5 rounded-full border border-transparent" />
                )}
              </div>
            </button>
          );
        })}
      </div>
    </section>
  );
}
