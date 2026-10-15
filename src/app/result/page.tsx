"use client";

import React, { useEffect, useState } from "react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { Button } from "@/components/ui";
import { Mascot } from "@/components/student/Mascot";
import { getActiveSession, clearSession, saveSession } from "@/lib/session";
import { StudentSession } from "@/types/student";
import {
  Clock,
  Sparkles,
  ArrowRight,
  RefreshCw,
} from "lucide-react";

export default function ResultPage() {
  const router = useRouter();
  const [session, setSession] = useState<StudentSession | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);

  const fetchLiveResult = async (active: StudentSession) => {
    try {
      setIsRefreshing(true);
      const baseUrl = active.sessionId
        ? `/api/student/result?sessionId=${active.sessionId}`
        : `/api/student/result?studentId=${active.studentId}`;
      const url = `${baseUrl}&_t=${Date.now()}`;

      const res = await fetch(url, { cache: "no-store" });
      if (res.ok) {
        const data = await res.json();
        const refreshedSession: StudentSession = {
          ...active,
          status: data.status,
          scorePercentage: data.scorePercentage ?? active.scorePercentage,
          elapsedSeconds: data.elapsedSeconds ?? active.elapsedSeconds,
          completedAt: data.submittedAt ?? active.completedAt,
          finalLevel: data.evaluation?.assignedLevel ?? active.finalLevel,
          notes: data.evaluation?.tutorNotes ?? active.notes,
        };
        saveSession(refreshedSession);
        setSession(refreshedSession);
      }
    } catch (err) {
      console.error("Error fetching live student result:", err);
    } finally {
      setIsLoading(false);
      setIsRefreshing(false);
    }
  };

  useEffect(() => {
    const active = getActiveSession();
    if (!active) {
      router.push("/");
      return;
    }

    setSession(active);
    fetchLiveResult(active);
  }, [router]);

  const handleFinishAndExit = () => {
    clearSession();
    router.push("/");
  };

  if (isLoading || !session) {
    return (
      <main className="flex min-h-screen items-center justify-center p-6 bg-sky-soft font-kid">
        <div className="flex flex-col items-center gap-4 text-center">
          <Mascot mood="think" size={90} floating />
          <div className="h-9 w-9 animate-spin rounded-full border-4 border-primary-500 border-t-transparent" />
          <p className="text-base font-bold text-text-secondary">
            Memuat hasil tesmu...
          </p>
        </div>
      </main>
    );
  }

  // Check if session status is FINALIZED by Tutor or still COMPLETED (pending tutor evaluation)
  const isFinalized = (session.status === "FINALIZED" || session.status === "COMPLETED") && !!session.finalLevel;

  // Level configuration
  const levelConfig = {
    BEGINNER: {
      title: "Beginner Level",
      color: "border-sun-300 bg-sun-50 text-amber-900",
    },
    INTERMEDIATE: {
      title: "Intermediate Level",
      color: "border-primary-200 bg-primary-50 text-primary-950",
    },
    ADVANCED: {
      title: "Advanced Level",
      color: "border-mint-300 bg-mint-50 text-mint-950",
    },
  };

  const activeLevel = session.finalLevel ? levelConfig[session.finalLevel] : null;

  const formatElapsed = (totalSeconds: number) => {
    const mins = Math.floor(totalSeconds / 60);
    const secs = totalSeconds % 60;
    return `${mins} menit ${secs} detik`;
  };

  const totalQuestionsDisplay =
    session.totalQuestions === 25 && Object.keys(session.answers || {}).length <= 10
      ? 10
      : session.totalQuestions || 10;

  return (
    <div className="min-h-screen bg-sky-soft text-text-primary font-kid flex flex-col justify-between selection:bg-sun-100 selection:text-primary-800">
      {/* Top Navbar */}
      <motion.header
        initial={{ y: -15, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.35, ease: "easeOut" }}
        className="w-full bg-surface-white/95 backdrop-blur-md border-b border-primary-100 py-3 px-4 sm:px-8 sticky top-0 z-20 shadow-xs"
      >
        <div className="max-w-4xl mx-auto flex items-center justify-between">
          <Image
            src="/images/logo.png"
            alt="Up Speaking Logo"
            width={110}
            height={34}
            priority
            className="h-8 w-auto object-contain"
          />
          <div className="flex items-center gap-2">
            <span className="text-xs sm:text-sm font-bold text-primary-700 bg-primary-50 px-3 py-1 rounded-full border border-primary-100">
              Siswa: {session.fullName}
            </span>
          </div>
        </div>
      </motion.header>

      {/* Main Container */}
      <main className="flex-1 max-w-2xl mx-auto px-4 sm:px-6 py-6 sm:py-10 w-full flex flex-col items-center text-center justify-center">
        {isFinalized && activeLevel ? (
          /* KONDISI B: Status FINALIZED -> Menampilkan Kartu Level Resmi yang Ramping */
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 24 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            transition={{ duration: 0.45, ease: "easeOut" }}
            className="w-full bg-surface-white rounded-[28px] sm:rounded-[32px] border-2 border-primary-100 p-5 sm:p-8 shadow-kid-card"
          >
            {/* Maskot Bersorak */}
            <div className="flex justify-center -mt-12 sm:-mt-16 mb-1 sm:mb-2">
              <div className="sm:hidden">
                <Mascot mood="cheer" size={88} floating />
              </div>
              <div className="hidden sm:block">
                <Mascot mood="cheer" size={120} floating />
              </div>
            </div>

            <motion.div
              initial={{ opacity: 0, y: -8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2, duration: 0.3 }}
              className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-mint-50 text-mint-800 text-[11px] sm:text-xs font-bold border border-mint-200 mb-2 sm:mb-3 shadow-2xs"
            >
              <Sparkles className="w-3.5 h-3.5 text-mint-600" />
              <span>Hasil Placement Test</span>
            </motion.div>

            <motion.h1
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.3, duration: 0.35 }}
              className="font-display text-xl sm:text-3xl font-black text-text-primary mb-1"
            >
              Selamat, {session.fullName}!
            </motion.h1>
            <p className="text-xs sm:text-sm text-text-muted mb-5 max-w-md mx-auto">
              Kamu resmi ditempatkan di kelas:
            </p>

            {/* Official Level Card - Bersih, Tegas, Berwibawa */}
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.4, duration: 0.35 }}
              className={`p-6 sm:p-7 rounded-[22px] sm:rounded-[26px] border-2 ${activeLevel.color} text-center mb-5 shadow-2xs`}
            >
              <span className="text-[11px] sm:text-xs font-bold uppercase tracking-wider text-text-muted mb-1 block">
                Level Penempatan Resmi
              </span>
              <h2 className="font-display text-2xl sm:text-4xl font-black tracking-tight">
                {activeLevel.title}
              </h2>
            </motion.div>

            {/* Info Jenjang Singkat */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.5, duration: 0.3 }}
              className="flex items-center justify-between px-4 py-3 rounded-2xl bg-sky-soft border border-primary-100 text-xs sm:text-sm mb-6"
            >
              <span className="text-text-muted">Jenjang Pendidikan</span>
              <span className="font-bold text-text-primary">
                {session.targetLevel === "ELEMENTARY" ? "Elementary (SD)" : "High School (SMP/SMA)"}
              </span>
            </motion.div>

            {/* Tombol Aksi Bersahabat */}
            <motion.div
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.55, duration: 0.3 }}
              className="flex flex-col gap-2"
            >
              <Button
                variant="kidBlue"
                size="lg"
                onClick={handleFinishAndExit}
                className="w-full gap-2 text-sm shadow-[0_4px_0_0_#206798]"
              >
                <span>Kembali ke Beranda</span>
                <ArrowRight className="w-4 h-4 ml-1" />
              </Button>
            </motion.div>
          </motion.div>
        ) : (
          /* KONDISI A: Status COMPLETED -> Konfirmasi Tes Berhasil Dikumpulkan */
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 24 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            transition={{ duration: 0.45, ease: "easeOut" }}
            className="w-full bg-surface-white rounded-[28px] sm:rounded-[32px] border-2 border-primary-100 p-5 sm:p-8 shadow-kid-card"
          >
            {/* Maskot Bersorak */}
            <div className="flex justify-center -mt-12 sm:-mt-16 mb-1 sm:mb-2">
              <div className="sm:hidden">
                <Mascot mood="cheer" size={88} floating />
              </div>
              <div className="hidden sm:block">
                <Mascot mood="cheer" size={120} floating />
              </div>
            </div>

            <motion.div
              initial={{ opacity: 0, y: -8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2, duration: 0.3 }}
              className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-mint-50 text-mint-800 text-[11px] sm:text-xs font-bold border border-mint-200 mb-2 sm:mb-3 shadow-2xs"
            >
              <Sparkles className="w-3.5 h-3.5 text-mint-600" />
              <span>Lembar Jawaban Berhasil Dikumpulkan</span>
            </motion.div>

            <motion.h1
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.3, duration: 0.35 }}
              className="font-display text-xl sm:text-3xl font-black text-text-primary mb-1"
            >
              Terima Kasih, {session.fullName}! ⭐
            </motion.h1>
            <p className="text-xs sm:text-sm text-text-secondary max-w-md mx-auto mb-4 sm:mb-5 leading-relaxed">
              Lembar jawabanmu telah berhasil dikumpulkan dan akan segera dinilai.
            </p>

            {/* Details Box */}
            <motion.div
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4, duration: 0.35 }}
              className="p-3.5 sm:p-4 rounded-2xl bg-sky-soft border border-primary-100 text-left space-y-2 sm:space-y-2.5 mb-5 font-kid text-xs sm:text-sm"
            >
              <div className="flex items-center justify-between pb-1.5 border-b border-primary-100/60">
                <span className="text-text-muted flex items-center gap-1.5">
                  <Clock className="w-3.5 h-3.5 text-primary-500" />
                  Waktu Pengerjaan
                </span>
                <span className="font-bold text-text-primary">
                  {formatElapsed(session.elapsedSeconds || 0)}
                </span>
              </div>

              <div className="flex items-center justify-between pb-1.5 border-b border-primary-100/60">
                <span className="text-text-muted">Total Soal Terisi</span>
                <span className="font-bold text-text-primary">
                  {Object.keys(session.answers || {}).length} dari {totalQuestionsDisplay} Soal
                </span>
              </div>

              <div className="flex items-center justify-between">
                <span className="text-text-muted">Status</span>
                <motion.span
                  animate={{ opacity: [1, 0.5, 1] }}
                  transition={{ repeat: Infinity, duration: 2 }}
                  className="font-bold text-amber-800 bg-sun-100 px-2 py-0.5 rounded-full text-[11px] sm:text-xs"
                >
                  Menunggu Penilaian Placement Test
                </motion.span>
              </div>
            </motion.div>

            {/* Actions */}
            <motion.div
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.55, duration: 0.3 }}
              className="flex flex-col gap-2.5"
            >
              <Button
                variant="kidBlue"
                size="lg"
                onClick={handleFinishAndExit}
                className="w-full gap-2 text-sm shadow-[0_4px_0_0_#206798]"
              >
                <span>Kembali ke Beranda</span>
                <ArrowRight className="w-4 h-4" />
              </Button>

              <button
                type="button"
                disabled={isRefreshing}
                onClick={() => session && fetchLiveResult(session)}
                className="text-xs font-bold text-primary-600 hover:text-primary-800 disabled:opacity-50 flex items-center justify-center gap-1.5 py-1 transition-colors cursor-pointer"
              >
                <RefreshCw className={`w-3.5 h-3.5 ${isRefreshing ? "animate-spin" : ""}`} />
                <span>{isRefreshing ? "Memeriksa..." : "Cek Ulang Status Hasil"}</span>
              </button>
            </motion.div>
          </motion.div>
        )}
      </main>

      {/* Footer */}
      <motion.footer
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.4, delay: 0.3 }}
        className="w-full border-t border-primary-100 py-4 px-6 text-center text-xs text-text-muted bg-surface-white font-kid"
      >
        <p className="flex items-center justify-center gap-1">
          <span>&copy; {new Date().getFullYear()} Up Speaking Learning Centre. All rights reserved.</span>
        </p>
      </motion.footer>
    </div>
  );
}
