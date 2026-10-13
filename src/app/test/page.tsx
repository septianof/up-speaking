"use client";

import React, { useState, useEffect } from "react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui";
import { QuestionCard } from "@/components/student/QuestionCard";
import { QuestionPalette } from "@/components/student/QuestionPalette";
import { ElapsedTimer } from "@/components/student/ElapsedTimer";
import { OfflineBanner } from "@/components/student/OfflineBanner";
import { SubmitConfirmModal } from "@/components/student/SubmitConfirmModal";
import { Mascot } from "@/components/student/Mascot";
import { getActiveSession, saveSession } from "@/lib/session";
import { StudentSession, QuestionItem } from "@/types/student";
import {
  ChevronLeft,
  ChevronRight,
  Send,
  LayoutGrid,
  User,
  X,
  Sparkles,
  Smile,
} from "lucide-react";

// Mock questions dataset for UI test sheet (10 items standard demo)
const MOCK_QUESTIONS: QuestionItem[] = [
  {
    id: "q1",
    targetLevel: "ELEMENTARY",
    questionText: "What is the correct English word for 'Kucing'?",
    options: [
      { id: "opt_1_a", optionText: "Cat" },
      { id: "opt_1_b", optionText: "Dog" },
      { id: "opt_1_c", optionText: "Bird" },
      { id: "opt_1_d", optionText: "Rabbit" },
    ],
  },
  {
    id: "q2",
    targetLevel: "ELEMENTARY",
    questionText: "Choose the correct greeting in the morning:",
    options: [
      { id: "opt_2_a", optionText: "Good night" },
      { id: "opt_2_b", optionText: "Good morning" },
      { id: "opt_2_c", optionText: "Good afternoon" },
      { id: "opt_2_d", optionText: "Goodbye" },
    ],
  },
  {
    id: "q3",
    targetLevel: "ELEMENTARY",
    questionText: "She ___ to school every Monday.",
    options: [
      { id: "opt_3_a", optionText: "go" },
      { id: "opt_3_b", optionText: "goes" },
      { id: "opt_3_c", optionText: "going" },
      { id: "opt_3_d", optionText: "gone" },
    ],
  },
  {
    id: "q4",
    targetLevel: "ELEMENTARY",
    questionText: "Which one is a color in English?",
    options: [
      { id: "opt_4_a", optionText: "Apple" },
      { id: "opt_4_b", optionText: "Table" },
      { id: "opt_4_c", optionText: "Yellow" },
      { id: "opt_4_d", optionText: "Happy" },
    ],
  },
  {
    id: "q5",
    targetLevel: "ELEMENTARY",
    questionText: "They ___ playing football in the yard.",
    options: [
      { id: "opt_5_a", optionText: "is" },
      { id: "opt_5_b", optionText: "am" },
      { id: "opt_5_c", optionText: "are" },
      { id: "opt_5_d", optionText: "be" },
    ],
  },
  {
    id: "q6",
    targetLevel: "ELEMENTARY",
    questionText: "What is the opposite of 'Big'?",
    options: [
      { id: "opt_6_a", optionText: "Tall" },
      { id: "opt_6_b", optionText: "Small" },
      { id: "opt_6_c", optionText: "Heavy" },
      { id: "opt_6_d", optionText: "Fast" },
    ],
  },
  {
    id: "q7",
    targetLevel: "ELEMENTARY",
    questionText: "I have two ___. I use them to see.",
    options: [
      { id: "opt_7_a", optionText: "ears" },
      { id: "opt_7_b", optionText: "hands" },
      { id: "opt_7_c", optionText: "eyes" },
      { id: "opt_7_d", optionText: "legs" },
    ],
  },
  {
    id: "q8",
    targetLevel: "ELEMENTARY",
    questionText: "How do you say 'Terima kasih' in English?",
    options: [
      { id: "opt_8_a", optionText: "You're welcome" },
      { id: "opt_8_b", optionText: "Please" },
      { id: "opt_8_c", optionText: "Sorry" },
      { id: "opt_8_d", optionText: "Thank you" },
    ],
  },
  {
    id: "q9",
    targetLevel: "ELEMENTARY",
    questionText: "There are seven days in a ___.",
    options: [
      { id: "opt_9_a", optionText: "month" },
      { id: "opt_9_b", optionText: "week" },
      { id: "opt_9_c", optionText: "year" },
      { id: "opt_9_d", optionText: "day" },
    ],
  },
  {
    id: "q10",
    targetLevel: "ELEMENTARY",
    questionText: "Can you speak English? Yes, I ___.",
    options: [
      { id: "opt_10_a", optionText: "can" },
      { id: "opt_10_b", optionText: "do" },
      { id: "opt_10_c", optionText: "am" },
      { id: "opt_10_d", optionText: "have" },
    ],
  },
];

export default function TestPage() {
  const router = useRouter();
  const [session, setSession] = useState<StudentSession | null>(null);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [answers, setAnswers] = useState<Record<string, string>>({});
  const [isSubmitModalOpen, setIsSubmitModalOpen] = useState(false);
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    const active = getActiveSession();
    if (!active || active.status !== "IN_PROGRESS") {
      router.push("/");
      return;
    }

    setSession(active);
    setCurrentIndex(active.currentQuestionIndex || 0);
    setAnswers(active.answers || {});
    setIsLoading(false);
  }, [router]);

  // Handle option selection with toggle deselect
  const handleSelectOption = (optionId: string) => {
    if (!session) return;
    const questionId = MOCK_QUESTIONS[currentIndex].id;

    const newAnswers = { ...answers };
    if (newAnswers[questionId] === optionId) {
      delete newAnswers[questionId];
    } else {
      newAnswers[questionId] = optionId;
    }

    setAnswers(newAnswers);

    const updatedSession: StudentSession = {
      ...session,
      answers: newAnswers,
      currentQuestionIndex: currentIndex,
    };
    setSession(updatedSession);
    saveSession(updatedSession);
  };

  // Navigate between questions
  const handleNavigate = (newIndex: number) => {
    if (newIndex < 0 || newIndex >= MOCK_QUESTIONS.length) return;
    setCurrentIndex(newIndex);
    setIsDrawerOpen(false);

    if (session) {
      const updatedSession: StudentSession = {
        ...session,
        currentQuestionIndex: newIndex,
      };
      setSession(updatedSession);
      saveSession(updatedSession);
    }
  };

  // Timer Tick Update
  const handleTimerTick = (seconds: number) => {
    if (session) {
      const updated = { ...session, elapsedSeconds: seconds };
      saveSession(updated);
    }
  };

  // Open confirmation modal
  const handleOpenSubmit = () => {
    setIsSubmitModalOpen(true);
  };

  // Final confirm submit
  const handleConfirmSubmit = async () => {
    if (!session) return;
    setIsSubmitting(true);

    try {
      const completedSession: StudentSession = {
        ...session,
        status: "COMPLETED",
        completedAt: new Date().toISOString(),
      };
      saveSession(completedSession);
      setIsSubmitModalOpen(false);
      router.push("/result");
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isLoading || !session) {
    return (
      <main className="flex min-h-screen items-center justify-center p-6 bg-sky-soft font-kid">
        <div className="flex flex-col items-center gap-4 text-center">
          <Mascot mood="think" size={90} floating />
          <div className="h-9 w-9 animate-spin rounded-full border-4 border-primary-500 border-t-transparent" />
          <p className="text-base font-bold text-text-secondary">
            Menyiapkan lembar soal untukmu...
          </p>
        </div>
      </main>
    );
  }

  const currentQuestion = MOCK_QUESTIONS[currentIndex];
  const totalQuestions = MOCK_QUESTIONS.length;
  const answeredIndices = MOCK_QUESTIONS.map((q, idx) =>
    answers[q.id] ? idx : -1
  ).filter((idx) => idx !== -1);
  const progressPercent = Math.round((answeredIndices.length / totalQuestions) * 100);

  return (
    <div className="min-h-screen bg-sky-soft text-text-primary font-kid flex flex-col justify-between selection:bg-sun-100 selection:text-primary-800">
      {/* Topbar Header */}
      <header className="sticky top-0 z-30 bg-surface-white/95 backdrop-blur-md border-b border-primary-100 px-4 sm:px-8 py-3 shadow-xs">
        <div className="max-w-6xl mx-auto flex items-center justify-between gap-3">
          {/* Logo & Student Name */}
          <div className="flex items-center gap-3">
            <Image
              src="/images/logo.png"
              alt="Up Speaking Logo"
              width={110}
              height={36}
              priority
              className="h-8 w-auto object-contain"
            />
            <div className="hidden md:flex items-center gap-2 pl-3 border-l border-primary-100">
              <div className="w-7 h-7 rounded-full bg-primary-100 text-primary-700 flex items-center justify-center font-bold text-xs">
                <User className="w-3.5 h-3.5" />
              </div>
              <span className="font-bold text-sm text-text-primary">
                {session.fullName}
              </span>
              <span className="text-xs px-2 py-0.5 rounded-full bg-sun-100 text-amber-800 font-bold">
                {session.targetLevel === "ELEMENTARY" ? "Jenjang SD" : "High School"}
              </span>
            </div>
          </div>

          {/* Connection Status & Elapsed Timer */}
          <div className="flex items-center gap-2.5">
            <OfflineBanner />
            <ElapsedTimer
              initialSeconds={session.elapsedSeconds || 0}
              onTick={handleTimerTick}
            />
          </div>
        </div>
      </header>

      {/* PROGRES BAR — Sticky di bawah header agar selalu terlihat */}
      <div className="sticky top-[57px] z-20 w-full bg-surface-white/95 backdrop-blur-sm border-b border-primary-100 shadow-2xs">
        <div className="max-w-6xl mx-auto px-4 sm:px-8 py-2.5 flex items-center gap-3">
          {/* Label ringkas */}
          <span className="flex items-center gap-1 text-xs font-bold text-primary-700 shrink-0 whitespace-nowrap">
            <Sparkles className="w-3.5 h-3.5 text-sun-500" />
            <span className="hidden sm:inline">Progres</span>
          </span>
          {/* Progress Bar */}
          <div className="flex-1 h-3 bg-sky-soft rounded-full overflow-hidden border border-primary-100">
            <div
              className="h-full rounded-full bg-gradient-to-r from-sun-400 via-primary-500 to-mint-500 transition-all duration-300"
              style={{ width: `${progressPercent}%` }}
            />
          </div>
          {/* Angka ringkas */}
          <span className="text-xs font-bold text-text-muted shrink-0 whitespace-nowrap">
            <strong className="text-mint-600">{answeredIndices.length}</strong>/{totalQuestions}
            <span className="hidden sm:inline"> ({progressPercent}%)</span>
          </span>
        </div>
      </div>

      {/* Main Content Area */}
      <main className="flex-1 max-w-6xl w-full mx-auto p-4 sm:p-6 lg:p-8 flex flex-col gap-5">
        {/* Mobile Student Info Sub-bar */}
        <div className="md:hidden flex items-center justify-between px-4 py-2.5 rounded-2xl bg-surface-white border border-primary-100 shadow-2xs">
          <div className="flex items-center gap-2 truncate">
            <div className="w-6 h-6 rounded-full bg-primary-100 text-primary-700 flex items-center justify-center shrink-0">
              <User className="w-3.5 h-3.5" />
            </div>
            <span className="font-bold text-sm text-text-primary truncate">
              {session.fullName}
            </span>
          </div>
          <span className="shrink-0 ml-2 px-2 py-0.5 rounded-full bg-sun-100 text-amber-800 font-bold text-[11px]">
            {session.targetLevel === "ELEMENTARY" ? "Jenjang SD" : "High School"}
          </span>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
          {/* Left Column: Question Stepper (8 cols) */}
          <div className="lg:col-span-8 flex flex-col gap-5">
            <QuestionCard
              question={currentQuestion}
              selectedOptionId={answers[currentQuestion.id]}
              onSelectOption={handleSelectOption}
            />

            {/* Navigation Stepper Action Bar */}
            <div className="flex items-center justify-between gap-2 bg-surface-white p-3 sm:p-4 rounded-[24px] border-2 border-primary-100 shadow-kid-card overflow-hidden">
              <Button
                variant="kidSoft"
                size="md"
                disabled={currentIndex === 0}
                onClick={() => handleNavigate(currentIndex - 1)}
                className="gap-1 px-3 sm:px-5 shrink-0 h-11 text-xs sm:text-sm min-w-0"
                aria-label="Soal sebelumnya"
              >
                <ChevronLeft className="w-4 h-4 shrink-0" />
                <span className="hidden sm:inline">Sebelumnya</span>
              </Button>

              {/* Ergonomic Middle Palette Trigger Button */}
              <button
                type="button"
                onClick={() => setIsDrawerOpen(true)}
                className="flex items-center justify-center gap-1.5 px-3 sm:px-5 h-11 rounded-full bg-sky-soft hover:bg-primary-100 border-2 border-primary-200 transition-all text-xs sm:text-sm font-bold text-primary-800 active:scale-95 min-w-0 shrink whitespace-nowrap shadow-2xs cursor-pointer"
                title="Buka palet nomor soal"
                aria-label="Buka palet nomor soal"
              >
                <LayoutGrid className="w-4 h-4 text-primary-600 shrink-0" />
                <span>
                  {currentIndex + 1} / {totalQuestions}
                </span>
                <span className="text-[10px] text-primary-500">▼</span>
              </button>

              {currentIndex < totalQuestions - 1 ? (
                <Button
                  variant="kidBlue"
                  size="md"
                  onClick={() => handleNavigate(currentIndex + 1)}
                  className="gap-1 px-3 sm:px-5 shrink-0 h-11 text-xs sm:text-sm min-w-0"
                  aria-label="Soal selanjutnya"
                >
                  <span className="hidden sm:inline">Selanjutnya</span>
                  <ChevronRight className="w-4 h-4 shrink-0" />
                </Button>
              ) : (
                <Button
                  variant="kid"
                  size="md"
                  onClick={handleOpenSubmit}
                  className="gap-1.5 px-3 sm:px-5 shrink-0 h-11 text-xs sm:text-sm shadow-[0_4px_0_0_#B91C1C] min-w-0"
                  aria-label="Kumpulkan tes"
                >
                  <span>Kumpulkan</span>
                  <Send className="w-3.5 h-3.5 shrink-0" />
                </Button>
              )}
            </div>
          </div>

          {/* Right Column: Sticky Question Palette Desktop (4 cols) */}
          <div className="hidden lg:block lg:col-span-4 sticky top-24 space-y-4">
            <QuestionPalette
              totalQuestions={totalQuestions}
              currentIndex={currentIndex}
              answeredQuestionIndices={answeredIndices}
              onSelectQuestion={handleNavigate}
            />

            {/* Kartu Motivasi Samping */}
            <div className="p-4 rounded-[24px] bg-sun-50 border-2 border-sun-200 text-xs text-amber-900 shadow-2xs flex items-center gap-3">
              <Smile className="w-8 h-8 text-amber-600 shrink-0" />
              <div>
                <p className="font-bold text-sm text-amber-950 font-display">Semangat ya!</p>
                <p className="text-amber-800 leading-relaxed mt-0.5">
                  Kamu bisa langsung melompati atau meninjau ulang soal dengan klik nomor di atas.
                </p>
              </div>
            </div>
          </div>
        </div>
      </main>

      {/* Submit Confirmation Modal */}
      <SubmitConfirmModal
        isOpen={isSubmitModalOpen}
        onClose={() => setIsSubmitModalOpen(false)}
        onConfirm={handleConfirmSubmit}
        totalQuestions={totalQuestions}
        answeredCount={answeredIndices.length}
        isLoading={isSubmitting}
      />

      {/* Mobile Bottom-Sheet Drawer for Question Palette */}
      {isDrawerOpen && (
        <div className="fixed inset-0 z-50 lg:hidden flex flex-col justify-end">
          {/* Backdrop */}
          <div
            onClick={() => setIsDrawerOpen(false)}
            className="fixed inset-0 bg-primary-950/40 backdrop-blur-xs transition-opacity"
          />

          {/* Drawer Sheet */}
          <div className="relative bg-surface-white rounded-t-[32px] p-6 shadow-float border-t-2 border-primary-100 z-10 max-h-[80vh] flex flex-col font-kid">
            <div className="flex items-center justify-between pb-3 mb-2 border-b border-primary-100">
              <h3 className="font-display text-lg font-bold text-text-primary">
                Palet Nomor Soal
              </h3>
              <button
                type="button"
                onClick={() => setIsDrawerOpen(false)}
                className="p-1.5 rounded-full text-text-muted hover:bg-sky-soft hover:text-text-primary"
              >
                <X className="w-6 h-6" />
              </button>
            </div>

            <div className="overflow-y-auto">
              <QuestionPalette
                totalQuestions={totalQuestions}
                currentIndex={currentIndex}
                answeredQuestionIndices={answeredIndices}
                onSelectQuestion={handleNavigate}
              />
            </div>
          </div>
        </div>
      )}

      {/* Footer */}
      <footer className="w-full border-t border-primary-100 py-4 px-6 text-center text-xs text-text-muted bg-surface-white font-kid">
        <p>Up Speaking Learning Centre &bull; Lembar Tes Penempatan Siswa</p>
      </footer>
    </div>
  );
}
