"use client";

import React, { useEffect, useState } from "react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { Button, Badge } from "@/components/ui";
import { getActiveSession, clearSession } from "@/lib/session";
import { StudentSession } from "@/types/student";
import {
  CheckCircle2,
  Clock,
  Sparkles,
  Award,
  ArrowRight,
  RefreshCw,
  LogOut,
  HelpCircle,
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
      <main className="flex min-h-screen items-center justify-center p-6 bg-surface-bg">
        <div className="flex flex-col items-center gap-3">
          <div className="h-10 w-10 animate-spin rounded-full border-4 border-primary-500 border-t-transparent" />
          <p className="text-sm font-medium text-text-muted">
            Memuat ringkasan hasil tes...
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
      color: "border-accent-200 bg-accent-50/40 text-accent-700",
      description:
        "Fokus pembelajaran pada penguatan kosakata dasar, pelafalan (pronunciation), dan pembentukan kalimat sederhana sehari-hari dengan rasa percaya diri.",
    },
    INTERMEDIATE: {
      title: "Intermediate Level",
      badge: "Intermediate",
      badgeVariant: "warning" as const,
      color: "border-amber-200 bg-amber-50/40 text-amber-800",
      description:
        "Fokus pembelajaran pada kelancaran percakapan (fluency), pemahaman tata bahasa kompleks, dan diskusi topik situasional interaktif.",
    },
    ADVANCED: {
      title: "Advanced Level",
      badge: "Advanced",
      badgeVariant: "success" as const,
      color: "border-emerald-200 bg-emerald-50/40 text-emerald-800",
      description:
        "Fokus pembelajaran pada presentasi profesional, debat terstruktur, penguasaan idiom bahasa Inggris, dan kemampuan *public speaking* tingkat lanjut.",
    },
  };

  const activeLevel = session.finalLevel ? levelConfig[session.finalLevel] : null;

  const formatElapsed = (totalSeconds: number) => {
    const mins = Math.floor(totalSeconds / 60);
    const secs = totalSeconds % 60;
    return `${mins} menit ${secs} detik`;
  };

  return (
    <div className="min-h-screen bg-surface-bg flex flex-col justify-between">
      {/* Top Navbar */}
      <header className="w-full bg-surface-white border-b border-surface-border py-4 px-6 sm:px-10 sticky top-0 z-20">
        <div className="max-w-4xl mx-auto flex items-center justify-between">
          <Image
            src="/images/logo.png"
            alt="Up Speaking Logo"
            width={130}
            height={40}
            priority
            className="h-9 w-auto object-contain"
          />
          <div className="flex items-center gap-2">
            <span className="text-xs font-semibold text-text-muted hidden sm:inline">
              Peserta: {session.fullName}
            </span>
          </div>
        </div>
      </header>

      {/* Main Container */}
      <main className="flex-1 max-w-2xl mx-auto px-6 py-10 w-full flex flex-col items-center text-center justify-center">
        {isFinalized && activeLevel ? (
          /* KONDISI B: Status FINALIZED -> Menampilkan Kartu Level Resmi */
          <div className="w-full bg-surface-white rounded-3xl border border-surface-border p-6 sm:p-10 shadow-float">
            <div className="w-16 h-16 rounded-full bg-primary-50 text-primary-500 mx-auto flex items-center justify-center mb-5 border border-primary-100 shadow-sm">
              <Award className="w-8 h-8" />
            </div>

            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-success-50 text-success-700 text-xs font-bold border border-emerald-200 mb-3">
              <Sparkles className="w-3.5 h-3.5 text-success-500" />
              <span>Hasil Resmi Penempatan Kelas</span>
            </div>

            <h1 className="text-2xl sm:text-3xl font-extrabold text-text-primary mb-2">
              Selamat, {session.fullName}!
            </h1>
            <p className="text-xs sm:text-sm text-text-muted mb-8">
              Berdasarkan evaluasi lembar tes dan tinjauan tim pengajar Up Speaking, Anda ditempatkan pada level:
            </p>

            {/* Official Level Card */}
            <div className={`p-6 rounded-2xl border ${activeLevel.color} text-left mb-8 shadow-sm`}>
              <div className="flex items-center justify-between mb-3">
                <h2 className="text-xl font-bold tracking-tight">
                  {activeLevel.title}
                </h2>
                <Badge variant={activeLevel.badgeVariant} size="md">
                  {activeLevel.badge}
                </Badge>
              </div>
              <p className="text-xs sm:text-sm leading-relaxed">
                {activeLevel.description}
              </p>
            </div>

            {/* Session Info Details */}
            <div className="grid grid-cols-2 gap-3 p-4 rounded-xl bg-surface-subtle border border-surface-border text-xs mb-8">
              <div className="text-left">
                <span className="text-text-muted block">Jenjang Program:</span>
                <span className="font-bold text-text-primary capitalize">
                  {session.targetLevel.toLowerCase().replace("_", " ")}
                </span>
              </div>
              <div className="text-left">
                <span className="text-text-muted block">Durasi Pengerjaan:</span>
                <span className="font-bold text-text-primary">
                  {formatElapsed(session.elapsedSeconds || 0)}
                </span>
              </div>
            </div>

            <div className="flex flex-col sm:flex-row gap-3">
              <Button
                variant="primary"
                size="lg"
                onClick={handleFinishAndExit}
                className="w-full gap-2"
              >
                <span>Keluar & Selesai</span>
                <LogOut className="w-4 h-4" />
              </Button>
            </div>
          </div>
        ) : (
          /* KONDISI A: Status COMPLETED -> Konfirmasi Tes Berhasil Dikumpulkan */
          <div className="w-full bg-surface-white rounded-3xl border border-surface-border p-6 sm:p-10 shadow-float">
            <div className="w-16 h-16 rounded-full bg-success-50 text-success-500 mx-auto flex items-center justify-center mb-5 border border-emerald-100 shadow-sm animate-bounce">
              <CheckCircle2 className="w-9 h-9 stroke-[2.5]" />
            </div>

            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-primary-50 text-primary-700 text-xs font-semibold border border-primary-100 mb-3">
              <span>Status: Lembar Jawaban Berhasil Terkirim</span>
            </div>

            <h1 className="text-2xl sm:text-3xl font-extrabold text-text-primary mb-2">
              Terima Kasih, {session.fullName}!
            </h1>
            <p className="text-sm text-text-secondary max-w-md mx-auto mb-8 leading-relaxed">
              Jawaban tes penempatan Anda telah tersimpan dengan aman di sistem. Lembar tes Anda kini berada dalam tahap peninjauan oleh Tutor Up Speaking.
            </p>

            {/* Details Box */}
            <div className="p-5 rounded-2xl bg-surface-subtle border border-surface-border text-left space-y-3 mb-8">
              <div className="flex items-center justify-between text-xs pb-2 border-b border-surface-border">
                <span className="text-text-muted flex items-center gap-1.5">
                  <Clock className="w-3.5 h-3.5 text-text-secondary" />
                  Waktu Pengerjaan
                </span>
                <span className="font-semibold text-text-primary">
                  {formatElapsed(session.elapsedSeconds || 0)}
                </span>
              </div>

              <div className="flex items-center justify-between text-xs pb-2 border-b border-surface-border">
                <span className="text-text-muted">Total Soal Terisi</span>
                <span className="font-semibold text-text-primary">
                  {Object.keys(session.answers || {}).length} dari {session.totalQuestions || 25} Soal
                </span>
              </div>

              <div className="flex items-center justify-between text-xs">
                <span className="text-text-muted">Tahap Selanjutnya</span>
                <span className="font-bold text-amber-700">
                  Menunggu Evaluasi Tutor
                </span>
              </div>
            </div>

            {/* Information Notice */}
            <div className="flex items-start gap-2.5 p-3.5 rounded-xl bg-primary-50 border border-primary-100 text-primary-800 text-xs text-left mb-8">
              <HelpCircle className="w-4 h-4 text-primary-500 shrink-0 mt-0.5" />
              <p className="leading-relaxed">
                Tutor kami akan meninjau jawaban dan menentukan rekomendasi kelas terbaik untuk Anda. Silakan hubungi admin Up Speaking atau kembali ke beranda.
              </p>
            </div>

            {/* Actions */}
            <div className="flex flex-col sm:flex-row gap-3">
              <Button
                variant="outline"
                size="lg"
                onClick={() => window.location.reload()}
                className="w-full gap-2"
              >
                <RefreshCw className="w-4 h-4" />
                <span>Cek Status Hasil</span>
              </Button>

              <Button
                variant="primary"
                size="lg"
                onClick={handleFinishAndExit}
                className="w-full gap-2"
              >
                <span>Kembali ke Beranda</span>
                <ArrowRight className="w-4 h-4" />
              </Button>
            </div>
          </div>
        )}
      </main>

      {/* Footer */}
      <footer className="w-full border-t border-surface-border py-4 px-6 text-center text-xs text-text-muted bg-surface-white">
        <p>&copy; {new Date().getFullYear()} Up Speaking Learning Centre</p>
      </footer>
    </div>
  );
}
