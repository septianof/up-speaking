"use client";

import React, { useEffect, useState } from "react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui";
import { QuestionCard } from "@/components/student/QuestionCard";
import { QuestionPalette } from "@/components/student/QuestionPalette";
import { ElapsedTimer } from "@/components/student/ElapsedTimer";
import { OfflineBanner } from "@/components/student/OfflineBanner";
import { SubmitConfirmModal } from "@/components/student/SubmitConfirmModal";
import { getActiveSession, saveSession } from "@/lib/session";
import { MOCK_QUESTIONS } from "@/lib/mock-questions";
import { StudentSession } from "@/types/student";
import {
  ChevronLeft,
  ChevronRight,
  Send,
  LayoutGrid,
  X,
  User,
} from "lucide-react";

export default function TestPage() {
  const router = useRouter();
  const [session, setSession] = useState<StudentSession | null>(null);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [answers, setAnswers] = useState<Record<string, string>>({});
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const [isSubmitModalOpen, setIsSubmitModalOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  // Initialize or resume student session
  useEffect(() => {
    const active = getActiveSession();
    if (!active) {
      // If no session found, redirect back to landing page
      router.push("/");
      return;
    }

    setSession(active);
    setCurrentIndex(active.currentQuestionIndex || 0);
    setAnswers(active.answers || {});
    setIsLoading(false);
  }, [router]);

  // Handle Option Select
  const handleSelectOption = (optionId: string) => {
    if (!session) return;
    const currentQ = MOCK_QUESTIONS[currentIndex];
    const newAnswers = { ...answers, [currentQ.id]: optionId };
    setAnswers(newAnswers);

    // Persist to session
    const updatedSession: StudentSession = {
      ...session,
      currentQuestionIndex: currentIndex,
      answers: newAnswers,
    };
    setSession(updatedSession);
    saveSession(updatedSession);
  };

  // Handle Question Navigation
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
      // Mock calculation for UI phase
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
      <main className="flex min-h-screen items-center justify-center p-6 bg-surface-bg">
        <div className="flex flex-col items-center gap-3">
          <div className="h-10 w-10 animate-spin rounded-full border-4 border-primary-500 border-t-transparent" />
          <p className="text-sm font-medium text-text-muted">
            Memuat lembar tes siswa...
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

  return (
    <div className="min-h-screen bg-surface-bg flex flex-col justify-between">
      {/* Sticky Topbar Header (CMP-003, CMP-004) */}
      <header className="sticky top-0 z-30 bg-surface-white border-b border-surface-border px-4 sm:px-8 py-3.5 shadow-sm">
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
            <div className="hidden md:flex items-center gap-1.5 pl-3 border-l border-surface-border text-xs text-text-muted">
              <User className="w-3.5 h-3.5 text-text-secondary" />
              <span className="font-semibold text-text-primary">
                {session.fullName}
              </span>
              <span className="text-text-disabled">({session.targetLevel})</span>
            </div>
          </div>

          {/* Connection Status & Elapsed Timer */}
          <div className="flex items-center gap-2.5">
            <OfflineBanner />
            <ElapsedTimer
              initialSeconds={session.elapsedSeconds || 0}
              onTick={handleTimerTick}
            />

            {/* Mobile Drawer Toggle Button */}
            <button
              type="button"
              onClick={() => setIsDrawerOpen(true)}
              className="lg:hidden p-2 rounded-xl border border-surface-border bg-surface-white text-text-secondary hover:bg-surface-subtle transition-colors flex items-center gap-1.5 text-xs font-semibold"
              aria-label="Buka palet nomor soal"
            >
              <LayoutGrid className="w-4 h-4 text-primary-500" />
              <span>{answeredIndices.length}/{totalQuestions}</span>
            </button>
          </div>
        </div>
      </header>

      {/* Main Content Area */}
      <main className="flex-1 max-w-6xl w-full mx-auto p-4 sm:p-6 lg:p-8">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
          {/* Left Column: Question Stepper (8 cols) */}
          <div className="lg:col-span-8 flex flex-col gap-6">
            <QuestionCard
              question={currentQuestion}
              questionNumber={currentIndex + 1}
              totalQuestions={totalQuestions}
              selectedOptionId={answers[currentQuestion.id]}
              onSelectOption={handleSelectOption}
            />

            {/* Navigation Stepper Action Bar */}
            <div className="flex items-center justify-between bg-surface-white p-4 rounded-2xl border border-surface-border shadow-card">
              <Button
                variant="outline"
                size="md"
                disabled={currentIndex === 0}
                onClick={() => handleNavigate(currentIndex - 1)}
                className="gap-1.5"
              >
                <ChevronLeft className="w-4 h-4" />
                <span>Sebelumnya</span>
              </Button>

              <div className="text-xs font-semibold text-text-muted">
                Soal <span className="text-text-primary">{currentIndex + 1}</span> dari {totalQuestions}
              </div>

              {currentIndex < totalQuestions - 1 ? (
                <Button
                  variant="primary"
                  size="md"
                  onClick={() => handleNavigate(currentIndex + 1)}
                  className="gap-1.5"
                >
                  <span>Selanjutnya</span>
                  <ChevronRight className="w-4 h-4" />
                </Button>
              ) : (
                <Button
                  variant="accent"
                  size="md"
                  onClick={handleOpenSubmit}
                  className="gap-1.5"
                >
                  <span>Kumpulkan Tes</span>
                  <Send className="w-4 h-4" />
                </Button>
              )}
            </div>
          </div>

          {/* Right Column: Sticky Question Palette Desktop (4 cols) */}
          <div className="hidden lg:block lg:col-span-4 sticky top-24">
            <QuestionPalette
              totalQuestions={totalQuestions}
              currentIndex={currentIndex}
              answeredQuestionIndices={answeredIndices}
              onSelectQuestion={handleNavigate}
            />

            <div className="mt-4 p-4 rounded-xl bg-primary-50/70 border border-primary-100 text-xs text-primary-800">
              <p className="font-semibold mb-1">Tips Pengerjaan:</p>
              <p className="text-primary-700 leading-relaxed">
                Anda dapat langsung melompati atau meninjau ulang soal dengan mengeklik nomor di atas kapan saja.
              </p>
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
            className="fixed inset-0 bg-slate-900/50 backdrop-blur-xs transition-opacity"
          />

          {/* Drawer Sheet */}
          <div className="relative bg-surface-white rounded-t-3xl p-6 shadow-float border-t border-surface-border z-10 max-h-[80vh] flex flex-col">
            <div className="flex items-center justify-between pb-3 mb-2 border-b border-surface-border">
              <h3 className="text-base font-bold text-text-primary">
                Palet Nomor Soal
              </h3>
              <button
                type="button"
                onClick={() => setIsDrawerOpen(false)}
                className="p-1 rounded-full text-text-muted hover:bg-surface-subtle"
              >
                <X className="w-5 h-5" />
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
      <footer className="w-full border-t border-surface-border py-4 px-6 text-center text-xs text-text-muted bg-surface-white">
        <p>Up Speaking Learning Centre &bull; Lembar Ujian Siswa</p>
      </footer>
    </div>
  );
}
