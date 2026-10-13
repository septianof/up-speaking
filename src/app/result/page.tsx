"use client";

import React, { useEffect, useState } from "react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { Button, Badge } from "@/components/ui";
import { Mascot } from "@/components/student/Mascot";
import { getActiveSession, clearSession } from "@/lib/session";
import { StudentSession } from "@/types/student";
import {
  Clock,
  Sparkles,
  ArrowRight,
  RefreshCw,
  LogOut,
  HelpCircle,
  Smile,
} from "lucide-react";

export default function ResultPage() {
  const router = useRouter();
  const [session, setSession] = useState<StudentSession | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const active = getActiveSession();
    if (!active) {
      router.push("/");
      return;
    }
    setSession(active);
    setIsLoading(false);
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
  const isFinalized = session.status === "FINALIZED" && !!session.finalLevel;

  // Level configuration
  const levelConfig = {
    BEGINNER: {
      title: "Beginner Level",
      badge: "Beginner",
      badgeVariant: "accent" as const,
      color: "border-sun-300 bg-sun-50 text-amber-900",
      description:
        "Fokus pembelajaran pada penguatan kosakata dasar, pelafalan (pronunciation) seru, dan belajar berani berbicara sehari-hari dengan percaya diri!",
    },
    INTERMEDIATE: {
      title: "Intermediate Level",
      badge: "Intermediate",
      badgeVariant: "primary" as const,
      color: "border-primary-200 bg-primary-50 text-primary-950",
      description:
        "Fokus pembelajaran pada kelancaran percakapan (fluency), cerita pengalaman, dan diskusi topik-topik menarik bersama teman kelas.",
    },
    ADVANCED: {
      title: "Advanced Level",
      badge: "Advanced",
      badgeVariant: "success" as const,
      color: "border-mint-300 bg-mint-50 text-mint-950",
      description:
        "Fokus pembelajaran pada presentasi percaya diri, debat seru, penguasaan idiom bahasa Inggris, dan kemampuan *public speaking* tingkat lanjut!",
    },
  };

  const activeLevel = session.finalLevel ? levelConfig[session.finalLevel] : null;

  const formatElapsed = (totalSeconds: number) => {
    const mins = Math.floor(totalSeconds / 60);
    const secs = totalSeconds % 60;
    return `${mins} menit ${secs} detik`;
  };

  return (
    <div className="min-h-screen bg-sky-soft text-text-primary font-kid flex flex-col justify-between selection:bg-sun-100 selection:text-primary-800">
      {/* Top Navbar */}
      <header className="w-full bg-surface-white/95 backdrop-blur-md border-b border-primary-100 py-3 px-4 sm:px-8 sticky top-0 z-20 shadow-xs">
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
      </header>

      {/* Main Container */}
      <main className="flex-1 max-w-2xl mx-auto px-6 py-10 w-full flex flex-col items-center text-center justify-center">
        {isFinalized && activeLevel ? (
          /* KONDISI B: Status FINALIZED -> Menampilkan Kartu Level Resmi */
          <div className="w-full bg-surface-white rounded-[32px] border-2 border-primary-100 p-7 sm:p-10 shadow-kid-card">
            {/* Maskot Bersorak */}
            <div className="flex justify-center -mt-16 mb-2">
              <Mascot mood="cheer" size={130} floating />
            </div>

            <div className="inline-flex items-center gap-1.5 px-3.5 py-1 rounded-full bg-mint-50 text-mint-800 text-xs font-bold border border-mint-200 mb-3 shadow-2xs">
              <Sparkles className="w-3.5 h-3.5 text-mint-600" />
              <span>Pengumuman Level Resmi Kelasmu</span>
            </div>

            <h1 className="font-display text-2xl sm:text-3xl lg:text-4xl font-black text-text-primary mb-2">
              Selamat, {session.fullName}! 🎉
            </h1>
            <p className="text-sm text-text-muted mb-8 max-w-md mx-auto">
              Berdasarkan hasil tes dan evaluasi Kak Tutor Up Speaking, kamu ditempatkan pada level:
            </p>

            {/* Official Level Card */}
            <div className={`p-6 sm:p-7 rounded-[24px] border-2 ${activeLevel.color} text-left mb-8 shadow-sm`}>
              <div className="flex items-center justify-between mb-3">
                <h2 className="font-display text-2xl font-black tracking-tight">
                  {activeLevel.title}
                </h2>
                <Badge variant={activeLevel.badgeVariant} size="md">
                  {activeLevel.badge}
                </Badge>
              </div>
              <p className="text-sm sm:text-base leading-relaxed font-semibold">
                {activeLevel.description}
              </p>
            </div>

            {/* Session Info Details */}
            <div className="grid grid-cols-2 gap-3.5 p-4 rounded-2xl bg-sky-soft border border-primary-100 text-xs sm:text-sm mb-8 text-left">
              <div>
                <span className="text-text-muted block font-normal">Jenjang Pilihan:</span>
                <span className="font-bold text-text-primary capitalize">
                  {session.targetLevel === "ELEMENTARY" ? "Elementary (SD)" : "High School"}
                </span>
              </div>
              <div>
                <span className="text-text-muted block font-normal">Waktu Pengerjaan:</span>
                <span className="font-bold text-text-primary">
                  {formatElapsed(session.elapsedSeconds || 0)}
                </span>
              </div>
            </div>

            <div className="flex flex-col sm:flex-row gap-3">
              <Button
                variant="kidBlue"
                size="xl"
                onClick={handleFinishAndExit}
                className="w-full gap-2 shadow-[0_5px_0_0_#206798]"
              >
                <span>Keluar & Selesai</span>
                <LogOut className="w-4 h-4 ml-1" />
              </Button>
            </div>
          </div>
        ) : (
          /* KONDISI A: Status COMPLETED -> Konfirmasi Tes Berhasil Dikumpulkan */
          <div className="w-full bg-surface-white rounded-[32px] border-2 border-primary-100 p-7 sm:p-10 shadow-kid-card">
            {/* Maskot Bersorak */}
            <div className="flex justify-center -mt-16 mb-2">
              <Mascot mood="cheer" size={130} floating />
            </div>

            <div className="inline-flex items-center gap-1.5 px-3.5 py-1 rounded-full bg-mint-50 text-mint-800 text-xs font-bold border border-mint-200 mb-3 shadow-2xs">
              <Sparkles className="w-3.5 h-3.5 text-mint-600" />
              <span>Hore! Lembar Jawaban Berhasil Terkirim</span>
            </div>

            <h1 className="font-display text-2xl sm:text-3xl font-black text-text-primary mb-2">
              Terima Kasih, {session.fullName}! ⭐
            </h1>
            <p className="text-sm sm:text-base text-text-secondary max-w-md mx-auto mb-7 leading-relaxed">
              Semua jawabanmu sudah tersimpan aman. Sekarang giliran Kak Tutor Up Speaking yang akan memeriksa lembar tesmu!
            </p>

            {/* Details Box */}
            <div className="p-5 rounded-2xl bg-sky-soft border border-primary-100 text-left space-y-3 mb-7 font-kid">
              <div className="flex items-center justify-between text-xs sm:text-sm pb-2 border-b border-primary-100">
                <span className="text-text-muted flex items-center gap-1.5">
                  <Clock className="w-4 h-4 text-primary-500" />
                  Waktu Pengerjaan
                </span>
                <span className="font-bold text-text-primary">
                  {formatElapsed(session.elapsedSeconds || 0)}
                </span>
              </div>

              <div className="flex items-center justify-between text-xs sm:text-sm pb-2 border-b border-primary-100">
                <span className="text-text-muted">Total Soal Terisi</span>
                <span className="font-bold text-text-primary">
                  {Object.keys(session.answers || {}).length} dari {session.totalQuestions || 10} Soal
                </span>
              </div>

              <div className="flex items-center justify-between text-xs sm:text-sm">
                <span className="text-text-muted">Tahap Selanjutnya</span>
                <span className="font-bold text-amber-800 bg-sun-100 px-2.5 py-0.5 rounded-full">
                  Menunggu Evaluasi Kak Tutor
                </span>
              </div>
            </div>

            {/* Information Notice */}
            <div className="flex items-start gap-3 p-4 rounded-2xl bg-sun-50 border border-sun-200 text-amber-900 text-xs sm:text-sm text-left mb-8">
              <HelpCircle className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
              <p className="leading-relaxed">
                Kamu boleh kembali ke beranda sekarang atau menutup halaman ini. Pengumuman resmi level kelas akan disampaikan oleh admin / Kak Tutor Up Speaking.
              </p>
            </div>

            {/* Actions */}
            <div className="flex flex-col sm:flex-row gap-3.5">
              <Button
                variant="kidSoft"
                size="lg"
                onClick={() => window.location.reload()}
                className="w-full gap-2 text-sm"
              >
                <RefreshCw className="w-4 h-4" />
                <span>Cek Status Hasil</span>
              </Button>

              <Button
                variant="kidBlue"
                size="lg"
                onClick={handleFinishAndExit}
                className="w-full gap-2 text-sm shadow-[0_4px_0_0_#206798]"
              >
                <span>Kembali ke Beranda</span>
                <ArrowRight className="w-4 h-4" />
              </Button>
            </div>
          </div>
        )}
      </main>

      {/* Footer */}
      <footer className="w-full border-t border-primary-100 py-4 px-6 text-center text-xs text-text-muted bg-surface-white font-kid">
        <p className="flex items-center justify-center gap-1">
          <span>&copy; {new Date().getFullYear()} Up Speaking Learning Centre</span>
          <Smile className="w-3.5 h-3.5 text-sun-500 inline" />
        </p>
      </footer>
    </div>
  );
}
