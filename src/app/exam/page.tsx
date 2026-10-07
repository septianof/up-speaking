'use client';

import React, { useEffect, useState, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { Loader2 } from 'lucide-react';
import ExamHeader from '@/components/exam/ExamHeader';
import QuestionCard from '@/components/exam/QuestionCard';
import QuestionPaletteModal from '@/components/exam/QuestionPaletteModal';
import SubmitConfirmModal from '@/components/exam/SubmitConfirmModal';
import { saveAnswer, submitExam } from '@/app/actions/session';
import type { SessionInfo, SanitizedQuestion } from '@/types';

export default function ExamPage() {
  const router = useRouter();

  const [session, setSession] = useState<SessionInfo | null>(null);
  const [questions, setQuestions] = useState<SanitizedQuestion[]>([]);
  const [answers, setAnswers] = useState<Record<string, string>>({});
  const [currentIndex, setCurrentIndex] = useState(0);
  const [autoSaveStatus, setAutoSaveStatus] = useState<'saved' | 'saving' | 'error' | 'offline'>('saved');
  const [isPaletteOpen, setIsPaletteOpen] = useState(false);
  const [isSubmitModalOpen, setIsSubmitModalOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  // Inisialisasi data ujian dari LocalStorage saat halaman dimuat (Crash Recovery STU-06)
  useEffect(() => {
    try {
      if (typeof window === 'undefined') return;

      const storedSession = localStorage.getItem('upspeaking_session');
      const storedQuestions = localStorage.getItem('upspeaking_questions');
      const storedAnswers = localStorage.getItem('upspeaking_answers');
      const storedCurrentIndex = localStorage.getItem('upspeaking_current_index');

      // Jika tidak ada data sesi aktif, arahkan siswa kembali ke Landing Page
      if (!storedSession) {
        router.replace('/');
        return;
      }

      const parsedSession: SessionInfo = JSON.parse(storedSession);
      setSession(parsedSession);

      if (storedQuestions) {
        setQuestions(JSON.parse(storedQuestions));
      }

      if (storedAnswers) {
        setAnswers(JSON.parse(storedAnswers));
      }

      // Restorasi posisi nomor soal terakhir yang dibuka
      if (storedCurrentIndex !== null) {
        const parsedIdx = parseInt(storedCurrentIndex, 10);
        if (!isNaN(parsedIdx) && parsedIdx >= 0) {
          setCurrentIndex(parsedIdx);
        }
      }

      setIsLoading(false);
    } catch (err) {
      console.error('Error saat inisialisasi sesi ujian:', err);
      router.replace('/');
    }
  }, [router]);

  // Simpan posisi nomor soal aktif ke LocalStorage agar tidak reset saat refresh (STU-06)
  useEffect(() => {
    if (typeof window !== 'undefined' && !isLoading) {
      localStorage.setItem('upspeaking_current_index', currentIndex.toString());
    }
  }, [currentIndex, isLoading]);

  // Deteksi status koneksi internet & auto-sync jawaban saat online kembali (STU-06)
  useEffect(() => {
    if (typeof window === 'undefined') return;

    const handleOffline = () => {
      setAutoSaveStatus('offline');
    };

    const handleOnline = async () => {
      if (!session?.id) return;
      try {
        setAutoSaveStatus('saving');
        const storedAnswersStr = localStorage.getItem('upspeaking_answers');
        if (storedAnswersStr) {
          const currentAnswers: Record<string, string> = JSON.parse(storedAnswersStr);
          const syncPromises = Object.entries(currentAnswers).map(([qId, optId]) =>
            saveAnswer(session.id, qId, optId)
          );
          await Promise.all(syncPromises);
        }
        setAutoSaveStatus('saved');
      } catch (err) {
        console.error('Error saat sinkronisasi offline-ke-online:', err);
        setAutoSaveStatus('error');
      }
    };

    window.addEventListener('offline', handleOffline);
    window.addEventListener('online', handleOnline);

    return () => {
      window.removeEventListener('offline', handleOffline);
      window.removeEventListener('online', handleOnline);
    };
  }, [session]);

  // Handler pemilihan opsi jawaban (STU-04 & DB-05 Auto-save)
  const handleSelectOption = useCallback((questionId: string, optionId: string) => {
    // 1. Simpan jawaban di state lokal (optimistic update)
    setAnswers((prev) => {
      const nextAnswers = { ...prev, [questionId]: optionId };
      // 2. Simpan ke LocalStorage untuk crash recovery instan (STU-06)
      try {
        localStorage.setItem('upspeaking_answers', JSON.stringify(nextAnswers));
      } catch (err) {
        console.error('Gagal menyimpan jawaban ke localStorage:', err);
      }
      return nextAnswers;
    });

    // 3. Auto-save ke database di background
    if (session?.id) {
      // Jika browser offline, tandai bahwa data aman di HP
      if (typeof navigator !== 'undefined' && !navigator.onLine) {
        setAutoSaveStatus('offline');
        return;
      }

      setAutoSaveStatus('saving');
      saveAnswer(session.id, questionId, optionId)
        .then((res) => {
          if (res.success) {
            setAutoSaveStatus('saved');
          } else {
            console.error('Gagal auto-save ke server:', res.error);
            setAutoSaveStatus('error');
          }
        })
        .catch((err) => {
          console.error('Error saat auto-save ke server:', err);
          setAutoSaveStatus('error');
        });
    }
  }, [session?.id]);

  // Dukungan navigasi keyboard untuk pengguna laptop / desktop
  useEffect(() => {
    if (isLoading || isPaletteOpen || isSubmitModalOpen) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      // Abaikan jika fokus sedang berada pada elemen form atau tombol dialog
      const target = e.target as HTMLElement;
      if (target && (target.tagName === 'INPUT' || target.tagName === 'TEXTAREA')) {
        return;
      }

      if (e.key === 'ArrowLeft') {
        setCurrentIndex((prev) => Math.max(0, prev - 1));
      } else if (e.key === 'ArrowRight') {
        const total = questions.length || 10;
        setCurrentIndex((prev) => Math.min(total - 1, prev + 1));
      } else {
        const currentQ = questions[currentIndex];
        if (!currentQ || !currentQ.options) return;

        let optIdx = -1;
        const key = e.key.toUpperCase();
        if (key === 'A' || e.key === '1') optIdx = 0;
        else if (key === 'B' || e.key === '2') optIdx = 1;
        else if (key === 'C' || e.key === '3') optIdx = 2;
        else if (key === 'D' || e.key === '4') optIdx = 3;
        else if (key === 'E' || e.key === '5') optIdx = 4;

        if (optIdx >= 0 && optIdx < currentQ.options.length) {
          handleSelectOption(currentQ.id, currentQ.options[optIdx].id);
        }
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isLoading, isPaletteOpen, isSubmitModalOpen, questions, currentIndex, handleSelectOption]);

  // Handler klik tombol Kumpulkan Ujian di soal terakhir (STU-07)
  const handleSubmitClick = () => {
    setIsSubmitModalOpen(true);
  };

  // Eksekusi pengumpulan lembar ujian ke Server Action submitExam (STU-07 & DB-06)
  const executeExamSubmission = async () => {
    if (!session?.id || isSubmitting) return;

    setIsSubmitting(true);
    try {
      const res = await submitExam(session.id);
      if (res.success) {
        // 1. Simpan data hasil evaluasi ke LocalStorage untuk halaman /result (STU-08)
        localStorage.setItem('upspeaking_result', JSON.stringify(res.result));

        // 2. Bersihkan sesi ujian aktif dari LocalStorage
        localStorage.removeItem('upspeaking_session');
        localStorage.removeItem('upspeaking_answers');
        localStorage.removeItem('upspeaking_current_index');

        // 3. Arahkan siswa ke Halaman Hasil (/result)
        router.replace('/result');
      } else {
        alert(`Gagal mengumpulkan ujian: ${res.error}`);
        setIsSubmitting(false);
      }
    } catch (err) {
      console.error('Error saat submit ujian:', err);
      alert('Terjadi kendala saat mengirim jawaban. Pastikan koneksi internet aktif lalu coba kembali.');
      setIsSubmitting(false);
    }
  };

  // Handler aksi periksa lagi: menutup modal submit dan membuka drawer palet soal
  const handleReviewUnanswered = () => {
    setIsSubmitModalOpen(false);
    setIsPaletteOpen(true);
  };

  if (isLoading || !session) {
    return (
      <div className="min-h-screen bg-[#f8fafc] flex flex-col items-center justify-center p-4">
        <Loader2 className="w-10 h-10 text-sky-600 animate-spin mb-4" />
        <h2 className="text-base sm:text-lg font-bold text-slate-800">Menyiapkan Ruang Ujian...</h2>
        <p className="text-xs sm:text-sm text-slate-500 mt-1">Memuat lembar soal dan waktu pengerjaan</p>
      </div>
    );
  }

  const totalQuestions = questions.length > 0 ? questions.length : session.total_questions || 10;
  const answeredCount = Object.keys(answers).length;
  const currentQuestion = questions[currentIndex];

  return (
    <div className="min-h-screen bg-[#f8fafc] flex flex-col selection:bg-rose-100 selection:text-rose-900">
      {/* ======================================================================= */}
      {/* 1. STICKY EXAM HEADER & PROGRESS TRACKER (STU-03)                       */}
      {/* ======================================================================= */}
      <ExamHeader
        studentName={session.student_name}
        startTime={session.start_time}
        educationLevel={session.education_level}
        autoSaveStatus={autoSaveStatus}
        currentQuestionIndex={currentIndex}
        totalQuestions={totalQuestions}
        answeredCount={answeredCount}
      />

      {/* ======================================================================= */}
      {/* 2. MAIN EXAM CONTENT AREA (Tempat Soal STU-04 & Navigasi STU-05)        */}
      {/* ======================================================================= */}
      <main className="flex-1 max-w-4xl w-full mx-auto px-4 sm:px-6 py-6 sm:py-10 pb-28">
        {currentQuestion ? (
          <QuestionCard
            key={currentQuestion.id}
            question={currentQuestion}
            selectedOptionId={answers[currentQuestion.id]}
            onSelectOption={handleSelectOption}
          />
        ) : (
          <div className="bg-white rounded-3xl border border-slate-100 p-8 text-center text-slate-500">
            Memuat soal ujian...
          </div>
        )}
      </main>

      {/* ======================================================================= */}
      {/* 3. BOTTOM STICKY NAVIGATION BAR (STU-05)                                */}
      {/* ======================================================================= */}
      <footer className="fixed inset-x-0 bottom-0 bg-white/95 backdrop-blur-sm border-t border-slate-200/80 py-3 sm:py-3.5 px-3 sm:px-8 z-30 shadow-[0_-4px_20px_-4px_rgba(0,0,0,0.05)]">
        <div className="max-w-4xl mx-auto flex items-center justify-between gap-1.5 sm:gap-4">
          {/* Tombol Sebelumnya */}
          <button
            type="button"
            disabled={currentIndex === 0}
            onClick={() => setCurrentIndex((prev) => Math.max(0, prev - 1))}
            className="px-3 sm:px-5 py-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold text-xs sm:text-sm transition-colors disabled:opacity-40 disabled:cursor-not-allowed flex items-center justify-center gap-1.5 shrink-0"
          >
            <span className="text-sm">←</span>
            <span className="hidden sm:inline">Sebelumnya</span>
          </button>

          {/* Tombol Palet / Daftar Soal */}
          <button
            type="button"
            onClick={() => setIsPaletteOpen(true)}
            className="px-2.5 min-[380px]:px-3.5 sm:px-5 py-2.5 rounded-xl bg-sky-50 hover:bg-sky-100 text-sky-800 border border-sky-200/80 font-semibold text-xs sm:text-sm inline-flex items-center justify-center gap-1.5 sm:gap-2 whitespace-nowrap transition-colors shrink-0 cursor-pointer active:scale-95"
            aria-label="Buka daftar seluruh nomor soal"
          >
            <span className="text-sm shrink-0">📑</span>
            <span className="whitespace-nowrap shrink-0">Daftar Soal</span>
            <span className="bg-[#0e2a47] text-white text-[10px] sm:text-xs px-2 py-0.5 rounded-md font-bold shrink-0">
              {currentIndex + 1}/{totalQuestions}
            </span>
          </button>

          {/* Tombol Selanjutnya atau Kumpulkan Ujian di Nomor Terakhir */}
          {currentIndex < totalQuestions - 1 ? (
            <button
              type="button"
              onClick={() => setCurrentIndex((prev) => Math.min(totalQuestions - 1, prev + 1))}
              className="px-3 min-[380px]:px-4 sm:px-6 py-2.5 rounded-xl bg-[#0e2a47] hover:bg-[#1a385c] text-white font-bold text-xs sm:text-sm flex items-center justify-center gap-1.5 transition-colors shadow-xs shrink-0 whitespace-nowrap cursor-pointer active:scale-95"
            >
              <span>Selanjutnya</span>
              <span className="text-sm">→</span>
            </button>
          ) : (
            <button
              type="button"
              onClick={handleSubmitClick}
              className="px-3.5 min-[380px]:px-5 sm:px-6 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs sm:text-sm flex items-center justify-center gap-1.5 transition-colors shadow-sm shrink-0 whitespace-nowrap cursor-pointer active:scale-95 animate-pulse"
            >
              <span>Kumpulkan Ujian</span>
              <span className="text-sm">✓</span>
            </button>
          )}
        </div>
      </footer>

      {/* ======================================================================= */}
      {/* 4. MODAL / BOTTOM SHEET KISI PALET SOAL (STU-05)                        */}
      {/* ======================================================================= */}
      <QuestionPaletteModal
        isOpen={isPaletteOpen}
        onClose={() => setIsPaletteOpen(false)}
        questions={questions}
        currentIndex={currentIndex}
        answers={answers}
        onSelectQuestion={(idx) => setCurrentIndex(idx)}
      />

      {/* ======================================================================= */}
      {/* 5. MODAL KONFIRMASI PENGUMPULAN & AUTO-SUBMIT (STU-07)                 */}
      {/* ======================================================================= */}
      <SubmitConfirmModal
        isOpen={isSubmitModalOpen}
        onClose={() => setIsSubmitModalOpen(false)}
        onConfirm={executeExamSubmission}
        onReview={handleReviewUnanswered}
        isSubmitting={isSubmitting}
        totalQuestions={totalQuestions}
        answeredCount={answeredCount}
      />
    </div>
  );
}
