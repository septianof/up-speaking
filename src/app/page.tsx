"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui";
import { LoginModal } from "@/components/student/LoginModal";
import { getActiveSession } from "@/lib/session";
import {
  Sparkles,
  BookOpen,
  Timer,
  Shuffle,
  ShieldCheck,
  ArrowRight,
} from "lucide-react";

export default function Home() {
  const router = useRouter();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [checkingSession, setCheckingSession] = useState(true);
  const [activeSession, setActiveSession] = useState<ReturnType<typeof getActiveSession>>(null);

  // Auto-Redirect check for active ongoing test session (FR-005, SCR-001)
  useEffect(() => {
    const session = getActiveSession();
    if (session && session.status === "IN_PROGRESS") {
      setActiveSession(session);
      // Auto-redirect directly to the active test sheet
      router.push("/test");
    } else {
      setCheckingSession(false);
    }
  }, [router]);

  if (checkingSession && activeSession) {
    return (
      <main className="flex min-h-screen items-center justify-center p-6 bg-surface-bg">
        <div className="flex flex-col items-center gap-3">
          <div className="h-10 w-10 animate-spin rounded-full border-4 border-primary-500 border-t-transparent" />
          <p className="text-sm font-medium text-text-muted">
            Mendeteksi sesi tes berjalan. Mengalihkan ke lembar soal...
          </p>
        </div>
      </main>
    );
  }

  return (
    <div className="min-h-screen bg-surface-bg flex flex-col justify-between">
      {/* Top Navbar */}
      <header className="w-full bg-surface-white border-b border-surface-border py-4 px-6 sm:px-10 sticky top-0 z-20">
        <div className="max-w-6xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Image
              src="/images/logo.png"
              alt="Up Speaking Logo"
              width={140}
              height={45}
              priority
              className="h-10 w-auto object-contain"
            />
            <div className="hidden sm:block border-l border-surface-border pl-3">
              <span className="text-xs font-semibold text-text-muted uppercase tracking-wider">
                Placement Test System
              </span>
            </div>
          </div>

          {/* Active System Status Pill Badge */}
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-emerald-50 border border-emerald-200 text-xs font-semibold text-emerald-700 shadow-xs">
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
            </span>
            <span>Sesi Tes Aktif</span>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <main className="flex-1 max-w-4xl mx-auto px-6 py-10 sm:py-16 w-full flex flex-col items-center text-center">
        {/* Badge */}
        <div className="inline-flex items-center gap-2 rounded-full bg-primary-50 px-3.5 py-1.5 text-xs font-semibold text-primary-600 mb-6 border border-primary-100 shadow-sm">
          <Sparkles className="w-3.5 h-3.5 text-primary-500" />
          <span>Selamat Datang Calon Siswa Up Speaking</span>
        </div>

        {/* Title & Subtitle */}
        <h1 className="text-3xl sm:text-4xl md:text-5xl font-extrabold text-text-primary tracking-tight leading-tight mb-4">
          Temukan Level Bahasa Inggrismu dengan Tepat & Akurat
        </h1>
        <p className="text-base sm:text-lg text-text-secondary max-w-2xl mb-8 leading-relaxed">
          Tes penempatan ini dirancang khusus untuk memetakan kemampuan bahasa Inggris Anda secara objektif menggunakan pengacakan cerdas, sehingga materi pembelajaran yang Anda terima tepat sasaran.
        </p>

        {/* Action Button */}
        <div className="mb-14">
          <Button
            size="lg"
            variant="primary"
            onClick={() => setIsModalOpen(true)}
            className="h-13 px-8 text-base shadow-float gap-2"
          >
            <span>Mulai Tes Sekarang</span>
            <ArrowRight className="w-4 h-4" />
          </Button>
          <p className="text-xs text-text-muted mt-3">
            Tidak memerlukan registrasi rumit. Cukup masukkan Nama dan No HP terdaftar.
          </p>
        </div>

        {/* 4 Panduan Pengerjaan Card Grid */}
        <div className="w-full text-left">
          <h2 className="text-lg font-bold text-text-primary mb-4 text-center sm:text-left">
            Panduan Pengerjaan Tes
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {/* Poin 1 */}
            <div className="p-5 rounded-2xl bg-surface-white border border-surface-border shadow-card flex gap-4 items-start">
              <div className="p-2.5 rounded-xl bg-primary-50 text-primary-600 shrink-0">
                <Shuffle className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-sm font-bold text-text-primary mb-1">
                  Urutan Soal Acak
                </h3>
                <p className="text-xs text-text-muted leading-relaxed">
                  Soal dan opsi jawaban diacak secara mandiri oleh algoritma Fisher-Yates untuk memastikan tes objektif dan adil bagi setiap peserta.
                </p>
              </div>
            </div>

            {/* Poin 2 */}
            <div className="p-5 rounded-2xl bg-surface-white border border-surface-border shadow-card flex gap-4 items-start">
              <div className="p-2.5 rounded-xl bg-primary-50 text-primary-600 shrink-0">
                <Timer className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-sm font-bold text-text-primary mb-1">
                  Kerjakan dengan Tenang
                </h3>
                <p className="text-xs text-text-muted leading-relaxed">
                  Timer hitung maju akan mencatat waktu pengerjaan Anda sebagai bahan pertimbangan evaluasi Tutor tanpa tekanan batas waktu kaku.
                </p>
              </div>
            </div>

            {/* Poin 3 */}
            <div className="p-5 rounded-2xl bg-surface-white border border-surface-border shadow-card flex gap-4 items-start">
              <div className="p-2.5 rounded-xl bg-success-50 text-success-600 shrink-0">
                <ShieldCheck className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-sm font-bold text-text-primary mb-1">
                  Toleransi Gangguan Internet
                </h3>
                <p className="text-xs text-text-muted leading-relaxed">
                  Jawaban Anda disimpan otomatis di perangkat. Jika koneksi terputus, Anda tetap dapat melanjutkan pengerjaan tanpa khawatir hilang.
                </p>
              </div>
            </div>

            {/* Poin 4 */}
            <div className="p-5 rounded-2xl bg-surface-white border border-surface-border shadow-card flex gap-4 items-start">
              <div className="p-2.5 rounded-xl bg-primary-50 text-primary-600 shrink-0">
                <BookOpen className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-sm font-bold text-text-primary mb-1">
                  Evaluasi Langsung oleh Tutor
                </h3>
                <p className="text-xs text-text-muted leading-relaxed">
                  Hasil tes Anda ditinjau dan divalidasi langsung oleh tim pengajar profesional untuk rekomendasi penempatan kelas terbaik.
                </p>
              </div>
            </div>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="w-full border-t border-surface-border py-6 px-6 bg-surface-white text-center">
        <p className="text-xs text-text-muted">
          &copy; {new Date().getFullYear()} Up Speaking Learning Centre. All rights reserved.
        </p>
      </footer>

      {/* Student Login Modal */}
      <LoginModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
      />
    </div>
  );
}
