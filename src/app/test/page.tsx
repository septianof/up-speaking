"use client";

import React, { useState, useEffect } from "react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { Button, Modal } from "@/components/ui";
import { QuestionCard } from "@/components/student/QuestionCard";
import { QuestionPalette } from "@/components/student/QuestionPalette";
import { ElapsedTimer } from "@/components/student/ElapsedTimer";
import { OfflineBanner } from "@/components/student/OfflineBanner";
import { SubmitConfirmModal } from "@/components/student/SubmitConfirmModal";
import { Mascot } from "@/components/student/Mascot";
import { getActiveSession, saveSession, clearSession } from "@/lib/session";
import { useOfflineSync } from "@/hooks/useOfflineSync";
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
  AlertCircle,
} from "lucide-react";

// Slide variants for QuestionCard transitions
const slideVariants = {
  enter: (dir: number) => ({ x: dir > 0 ? 60 : -60, opacity: 0 }),
  center: { x: 0, opacity: 1 },
  exit: (dir: number) => ({ x: dir > 0 ? -60 : 60, opacity: 0 }),
};

export default function TestPage() {
  const router = useRouter();
  const [session, setSession] = useState<StudentSession | null>(null);
  const [questions, setQuestions] = useState<QuestionItem[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [answers, setAnswers] = useState<Record<string, string>>({});
  const [isSubmitModalOpen, setIsSubmitModalOpen] = useState(false);
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [direction, setDirection] = useState(0);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [isDeviceConflictModalOpen, setIsDeviceConflictModalOpen] = useState(false);

  // Hook offline sync & autosave
  const {
    isOnline,
    isSyncing,
    hasPendingSync,
    deviceConflict,
    syncAnswer,
    flushPendingSync,
    syncElapsedSeconds,
  } = useOfflineSync({
    sessionId: session?.sessionId,
    deviceToken: session?.deviceToken,
    getElapsedSeconds: () => session?.elapsedSeconds || 0,
    onDeviceConflict: () => setIsDeviceConflictModalOpen(true),
    onSessionCompleted: () => {
      if (session) {
        const completedSession: StudentSession = {
          ...session,
          status: "COMPLETED",
        };
        saveSession(completedSession);
      }
      router.push("/result");
    },
  });

  useEffect(() => {
    if (deviceConflict) {
      setIsDeviceConflictModalOpen(true);
    }
  }, [deviceConflict]);

  // Periodic heartbeat sinkronisasi detik pengerjaan ke database setiap 15 detik
  useEffect(() => {
    if (!session || deviceConflict) return;
    const interval = setInterval(() => {
      syncElapsedSeconds();
    }, 15000);
    return () => clearInterval(interval);
  }, [session, deviceConflict, syncElapsedSeconds]);

  useEffect(() => {
    const active = getActiveSession();
    if (!active) {
      router.push("/");
      return;
    }

    if (active.status === "COMPLETED" || active.status === "FINALIZED") {
      router.push("/result");
      return;
    }

    if (active.status !== "IN_PROGRESS") {
      router.push("/");
      return;
    }

    setSession(active);
    setCurrentIndex(active.currentQuestionIndex || 0);
    setAnswers(active.answers || {});

    // Jika session sudah memiliki butir soal acak dari /api/student/start
    if (active.questions && active.questions.length > 0) {
      setQuestions(active.questions);
      setIsLoading(false);
    } else {
      // Fallback reload dari endpoint start
      fetch("/api/student/start", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          studentId: active.studentId,
          deviceToken: active.deviceToken,
        }),
      })
        .then((res) => {
          if (res.status === 409) {
            router.push("/result");
            return null;
          }
          return res.json();
        })
        .then((data) => {
          if (!data) return;
          if (data.isCompleted || data.status === "COMPLETED" || data.status === "FINALIZED") {
            const updated = { ...active, status: data.status || "COMPLETED" };
            saveSession(updated);
            router.push("/result");
            return;
          }
          if (data.session?.questions) {
            setQuestions(data.session.questions);
            const firstUnanswered = data.session.questions.findIndex(
              (q: { selectedOptionId?: string | null }) => !q.selectedOptionId
            );
            const resumeIdx =
              typeof data.session.currentQuestionIndex === "number"
                ? data.session.currentQuestionIndex
                : (firstUnanswered !== -1 ? firstUnanswered : 0);

            setCurrentIndex(resumeIdx);
            const updated: StudentSession = {
              ...active,
              questions: data.session.questions,
              elapsedSeconds: data.session.elapsedSeconds || active.elapsedSeconds,
              currentQuestionIndex: resumeIdx,
            };
            setSession(updated);
            saveSession(updated);
          } else {
            router.push("/");
          }
        })
        .catch(() => router.push("/"))
        .finally(() => setIsLoading(false));
    }
  }, [router]);

  // Handle option selection with toggle deselect
  const handleSelectOption = (optionId: string) => {
    if (!session || questions.length === 0 || deviceConflict) return;
    const questionId = questions[currentIndex].id;

    const newAnswers = { ...answers };
    let newSelected: string | null = null;
    if (newAnswers[questionId] === optionId) {
      delete newAnswers[questionId];
      newSelected = null;
    } else {
      newAnswers[questionId] = optionId;
      newSelected = optionId;
    }

    setAnswers(newAnswers);

    const updatedSession: StudentSession = {
      ...session,
      answers: newAnswers,
      currentQuestionIndex: currentIndex,
    };
    setSession(updatedSession);
    saveSession(updatedSession);

    // Kirim sinkronisasi ke antrean lokal dan autosave server
    syncAnswer(questionId, newSelected);
  };

  // Navigate between questions
  const handleNavigate = (newIndex: number) => {
    if (newIndex < 0 || newIndex >= questions.length) return;
    setDirection(newIndex > currentIndex ? 1 : -1);
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
      const updated: StudentSession = { ...session, elapsedSeconds: seconds };
      setSession(updated);
      saveSession(updated);
    }
  };

  // Open confirmation modal
  const handleOpenSubmit = () => {
    setSubmitError(null);
    setIsSubmitModalOpen(true);
  };

  // Final confirm submit
  const handleConfirmSubmit = async () => {
    if (!session) return;

    if (!isOnline) {
      setSubmitError(
        "Kamu sedang dalam mode offline. Sambungkan kembali internetmu untuk mengumpulkan ujian."
      );
      return;
    }

    setIsSubmitting(true);
    setSubmitError(null);

    try {
      // Pastikan antrean sync terkirim habis
      await flushPendingSync(answers);

      const finalResponses = questions.map((q) => ({
        questionId: q.id,
        selectedOptionId: answers[q.id] || null,
      }));

      const res = await fetch("/api/student/submit", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          sessionId: session.sessionId,
          deviceToken: session.deviceToken,
          elapsedSeconds: session.elapsedSeconds || 0,
          finalResponses,
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        if (data.deviceConflict) {
          setIsSubmitModalOpen(false);
          setIsDeviceConflictModalOpen(true);
          return;
        }
        setSubmitError(data.error || "Gagal mengumpulkan lembar jawaban.");
        return;
      }

      const completedSession: StudentSession = {
        ...session,
        totalQuestions: questions.length,
        status: "COMPLETED",
        completedAt: new Date().toISOString(),
        scorePercentage: data.scorePercentage,
      };

      saveSession(completedSession);
      setIsSubmitModalOpen(false);
      router.push("/result");
    } catch {
      setSubmitError("Terjadi kendala jaringan saat mengumpulkan ujian. Coba lagi.");
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isLoading || !session || questions.length === 0) {
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

  const currentQuestion = questions[currentIndex];
  const totalQuestions = questions.length;
  const answeredIndices = questions
    .map((q, idx) => (answers[q.id] ? idx : -1))
    .filter((idx) => idx !== -1);
  const progressPercent = Math.round((answeredIndices.length / totalQuestions) * 100);

  return (
    <div className="min-h-screen bg-sky-soft text-text-primary font-kid flex flex-col justify-between selection:bg-sun-100 selection:text-primary-800">
      {/* Topbar Header */}
      <motion.header
        initial={{ y: -15, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.35, ease: "easeOut" }}
        className="sticky top-0 z-30 bg-surface-white/95 backdrop-blur-md border-b border-primary-100 px-4 sm:px-8 py-3 shadow-xs"
      >
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
                {session.targetLevel === "ELEMENTARY" ? "Elementary" : "High School"}
              </span>
            </div>
          </div>

          {/* Connection Status & Elapsed Timer */}
          <div className="flex items-center gap-2.5">
            <OfflineBanner
              isOnline={isOnline}
              isSyncing={isSyncing}
              hasPendingSync={hasPendingSync}
            />
            <ElapsedTimer
              initialSeconds={session.elapsedSeconds || 0}
              onTick={handleTimerTick}
            />
          </div>
        </div>
      </motion.header>

      {/* PROGRES BAR */}
      <div className="sticky top-[57px] z-20 w-full bg-surface-white/95 backdrop-blur-sm border-b border-primary-100 shadow-2xs">
        <div className="max-w-6xl mx-auto px-4 sm:px-8 py-2.5 flex items-center gap-3">
          <span className="flex items-center gap-1 text-xs font-bold text-primary-700 shrink-0 whitespace-nowrap">
            <Sparkles className="w-3.5 h-3.5 text-sun-500" />
            <span className="hidden sm:inline">Progres</span>
          </span>
          <div className="flex-1 h-3 bg-sky-soft rounded-full overflow-hidden border border-primary-100">
            <motion.div
              animate={{ width: progressPercent + "%" }}
              transition={{ type: "spring", stiffness: 60, damping: 15 }}
              style={{ height: "100%" }}
              className="rounded-full bg-gradient-to-r from-sun-400 via-primary-500 to-mint-500"
            />
          </div>
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
            {session.targetLevel === "ELEMENTARY" ? "Elementary" : "High School"}
          </span>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
          {/* Left Column: Question Stepper (8 cols) */}
          <div className="lg:col-span-8 flex flex-col gap-5">
            <AnimatePresence mode="wait" custom={direction}>
              <motion.div
                key={currentIndex}
                custom={direction}
                variants={slideVariants}
                initial="enter"
                animate="center"
                exit="exit"
                transition={{ duration: 0.25, ease: "easeInOut" }}
              >
                <QuestionCard
                  question={currentQuestion}
                  selectedOptionId={answers[currentQuestion.id]}
                  onSelectOption={handleSelectOption}
                />
              </motion.div>
            </AnimatePresence>

            {/* Navigation Stepper Action Bar */}
            <div className="flex items-center justify-between gap-2 bg-surface-white p-3 sm:p-4 rounded-[24px] border-2 border-primary-100 shadow-kid-card overflow-hidden">
              <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.97 }}>
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
              </motion.div>

              {/* Middle Palette Trigger Button */}
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
                <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.97 }}>
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
                </motion.div>
              ) : (
                <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.97 }}>
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
                </motion.div>
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

            {/* Kartu Petunjuk Samping */}
            <div className="p-4 rounded-[24px] bg-sun-50 border-2 border-sun-200 text-xs text-amber-900 shadow-2xs flex items-center gap-3">
              <Smile className="w-8 h-8 text-amber-600 shrink-0" />
              <div>
                <p className="font-bold text-sm text-amber-950 font-display">Petunjuk Pengerjaan</p>
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

      {/* Submit Error Toast / Alert (if any) */}
      {submitError && (
        <div className="fixed bottom-6 right-6 z-50 max-w-md p-4 rounded-2xl bg-rose-50 border-2 border-rose-300 text-rose-800 text-sm font-bold shadow-lg flex items-start gap-3 animate-bounce">
          <AlertCircle className="w-5 h-5 shrink-0 mt-0.5 text-rose-600" />
          <div className="flex-1">
            <p>{submitError}</p>
          </div>
          <button
            type="button"
            onClick={() => setSubmitError(null)}
            className="text-rose-500 hover:text-rose-800 font-bold"
          >
            ✕
          </button>
        </div>
      )}

      {/* Device Conflict Modal */}
      {isDeviceConflictModalOpen && (
        <Modal
          isOpen={true}
          onClose={() => {}}
          variant="kid"
          topSlot={<Mascot mood="think" size={100} />}
          title="Sesi Diambil Alih"
          description="Sesi tes ini telah dilanjutkan pada perangkat atau browser lain. Pengerjaan di perangkat ini telah dihentikan untuk menjaga keamanan data ujianmu."
        >
          <div className="pt-3">
            <Button
              type="button"
              variant="kid"
              size="lg"
              className="w-full text-sm"
              onClick={() => {
                clearSession();
                router.push("/");
              }}
            >
              Kembali ke Beranda
            </Button>
          </div>
        </Modal>
      )}

      {/* Mobile Bottom-Sheet Drawer for Question Palette */}
      <AnimatePresence>
        {isDrawerOpen && (
          <div className="fixed inset-0 z-50 lg:hidden flex flex-col justify-end">
            <div
              onClick={() => setIsDrawerOpen(false)}
              className="fixed inset-0 bg-primary-950/40 backdrop-blur-xs transition-opacity"
            />
            <motion.div
              initial={{ y: "100%" }}
              animate={{ y: 0 }}
              exit={{ y: "100%" }}
              transition={{ type: "spring", stiffness: 300, damping: 30 }}
              className="relative bg-surface-white rounded-t-[32px] p-6 shadow-float border-t-2 border-primary-100 z-10 max-h-[80vh] flex flex-col font-kid"
            >
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
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Footer */}
      <motion.footer
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.4, delay: 0.3 }}
        className="w-full border-t border-primary-100 py-4 px-6 text-center text-xs text-text-muted bg-surface-white font-kid"
      >
        <p>Up Speaking Learning Centre &bull; Lembar Placement Test Siswa</p>
      </motion.footer>
    </div>
  );
}
