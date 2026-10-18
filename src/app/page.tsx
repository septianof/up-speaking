"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui";
import { LoginModal } from "@/components/student/LoginModal";
import { Mascot } from "@/components/student/Mascot";
import { HeroMascotInteractive } from "@/components/student/HeroMascotInteractive";
import {
  InstagramIcon,
  TikTokIcon,
  FacebookIcon,
  WhatsAppIcon,
  CloudSvg,
  SpeechBubbleSvg,
  SparkleStar,
} from "@/components/student/LandingIcons";
import { LANDING_NAV_LINKS, LANDING_FAQS } from "@/lib/landing-data";
import { getActiveSession, saveSession, clearSession } from "@/lib/session";
import { StudentSession } from "@/types/student";
import { SITE_CONFIG } from "@/lib/site-config";
import {
  BookOpen,
  Timer,
  Shuffle,
  ShieldCheck,
  HelpCircle,
  ChevronDown,
  Menu,
  X,
  ChevronRight,
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

export default function Home() {
  const router = useRouter();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [checkingSession, setCheckingSession] = useState(true);
  const [activeSession, setActiveSession] = useState<ReturnType<typeof getActiveSession>>(null);
  const [openFaqIndex, setOpenFaqIndex] = useState<number | null>(null);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  // Tutup menu drawer mobile saat tombol Escape ditekan
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        setIsMobileMenuOpen(false);
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, []);

  const navLinks = LANDING_NAV_LINKS;

  const handleScrollTo = (e: React.MouseEvent<HTMLAnchorElement>, href: string) => {
    if (href.startsWith("#")) {
      e.preventDefault();
      setIsMobileMenuOpen(false);
      const targetId = href.replace("#", "");
      const targetEl = document.getElementById(targetId);
      if (targetEl) {
        targetEl.scrollIntoView({ behavior: "smooth", block: "start" });
        window.history.pushState(null, "", href);
      }
    }
  };

  // Auto-Redirect check for active ongoing test session (FR-005, SCR-001)
  useEffect(() => {
    const session = getActiveSession();
    if (!session) {
      setCheckingSession(false);
      return;
    }

    // Jika sedang offline, percayai status sesi di cache lokal
    if (typeof navigator !== "undefined" && !navigator.onLine) {
      if (session.status === "IN_PROGRESS") {
        setActiveSession(session);
        router.push("/test");
      } else if (session.status === "COMPLETED" || session.status === "FINALIZED") {
        router.push("/result");
      } else {
        setCheckingSession(false);
      }
      return;
    }

    // Validasi status sesi ke server Supabase untuk mencegah redirect data usang
    fetch("/api/student/verify", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        fullName: session.fullName,
        phoneNumber: session.phone,
      }),
    })
      .then((res) => {
        if (!res.ok) throw new Error("Verification failed");
        return res.json();
      })
      .then((data) => {
        if (data.status === "IN_PROGRESS") {
          setActiveSession(session);
          router.push("/test");
        } else if (data.status === "COMPLETED" || data.status === "FINALIZED") {
          const updatedSession: StudentSession = {
            ...session,
            sessionId: data.sessionId || session.sessionId,
            status: data.status,
          };
          saveSession(updatedSession);
          router.push("/result");
        } else {
          // Status RESET atau NOT_STARTED -> Bersihkan sesi usang
          clearSession();
          setActiveSession(null);
          setCheckingSession(false);
        }
      })
      .catch(() => {
        // Fallback jika verifikasi gagal (network error)
        if (session.status === "IN_PROGRESS") {
          setActiveSession(session);
          router.push("/test");
        } else if (session.status === "COMPLETED" || session.status === "FINALIZED") {
          router.push("/result");
        } else {
          setCheckingSession(false);
        }
      });
  }, [router]);

  if (checkingSession && activeSession) {
    return (
      <main className="flex min-h-screen items-center justify-center p-6 bg-sky-soft font-kid">
        <div className="flex flex-col items-center gap-4 text-center">
          <Mascot mood="think" size={90} floating />
          <div className="h-9 w-9 animate-spin rounded-full border-4 border-primary-500 border-t-transparent" />
          <p className="text-base font-bold text-text-secondary">
            Mendeteksi status sesi tesmu... Mengalihkan ke halaman yang sesuai ya!
          </p>
        </div>
      </main>
    );
  }

  const toggleFaq = (index: number) => {
    setOpenFaqIndex(openFaqIndex === index ? null : index);
  };

  const faqs = LANDING_FAQS;

  return (
    <div className="min-h-screen bg-sky-soft text-text-primary font-kid flex flex-col justify-between selection:bg-sun-100 selection:text-primary-800">
      {/* Top Navbar */}
      <motion.header
        initial={{ y: -20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.45, ease: "easeOut" }}
        className="w-full bg-surface-white/95 backdrop-blur-md border-b border-primary-100/60 sticky top-0 z-30 shadow-xs"
      >
        <div className="max-w-6xl mx-auto flex items-center justify-between py-3 px-4 sm:px-8 gap-3">
          {/* Logo Brand */}
          <motion.a
            href="#hero"
            onClick={(e) => handleScrollTo(e, "#hero")}
            whileHover={{ scale: 1.03 }}
            whileTap={{ scale: 0.97 }}
            transition={{ type: "spring", stiffness: 400, damping: 20 }}
            className="flex items-center gap-2 sm:gap-2.5 shrink-0 focus:outline-none focus-visible:ring-2 focus-visible:ring-primary-400 rounded-lg cursor-pointer"
          >
            <Image
              src="/images/logo.png"
              alt="Up Speaking Logo"
              width={130}
              height={40}
              priority
              className="h-8 sm:h-9 w-auto object-contain"
            />
            <span className="font-display font-black text-xl sm:text-2xl text-text-primary tracking-tight">
              Speaking
            </span>
          </motion.a>

          {/* Navigasi Desktop di Bagian Tengah */}
          <nav className="hidden md:flex items-center gap-1 lg:gap-2">
            {navLinks.map((item) => (
              <motion.a
                key={item.href}
                href={item.href}
                onClick={(e) => handleScrollTo(e, item.href)}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                transition={{ type: "spring", stiffness: 400, damping: 20 }}
                className="px-3.5 py-1.5 rounded-full text-xs lg:text-sm font-bold text-text-secondary hover:text-primary-600 hover:bg-sky-soft transition-colors duration-150 cursor-pointer"
              >
                {item.label}
              </motion.a>
            ))}
          </nav>

          {/* Aksi Kanan: Tombol CTA Desktop & Hamburger Mobile */}
          <div className="flex items-center gap-2 sm:gap-3 shrink-0">
            <motion.div
              whileHover={{ scale: 1.03 }}
              whileTap={{ scale: 0.96 }}
              transition={{ type: "spring", stiffness: 400, damping: 20 }}
              className="hidden md:block"
            >
              <Button
                size="md"
                variant="kid"
                onClick={() => {
                  setIsMobileMenuOpen(false);
                  setIsModalOpen(true);
                }}
                className="text-xs sm:text-sm px-3.5 sm:px-5 h-9 sm:h-10 shadow-[0_3px_0_0_#B91C1C]"
              >
                <span>Mulai Tes</span>
              </Button>
            </motion.div>

            {/* Tombol Hamburger Mobile */}
            <motion.button
              type="button"
              whileTap={{ scale: 0.9 }}
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              aria-label={isMobileMenuOpen ? "Tutup menu" : "Buka menu navigasi"}
              className="md:hidden w-9 h-9 rounded-xl bg-sky-soft hover:bg-primary-50 text-text-primary border border-primary-100 flex items-center justify-center transition-colors active:scale-95 cursor-pointer"
            >
              {isMobileMenuOpen ? (
                <X className="w-5 h-5 text-primary-600" />
              ) : (
                <Menu className="w-5 h-5 text-text-secondary" />
              )}
            </motion.button>
          </div>
        </div>

        {/* Laci Navigasi Dropdown Mobile (Overlay Floating) */}
        <AnimatePresence>
          {isMobileMenuOpen && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.2, ease: "easeOut" }}
              className="absolute top-full left-0 right-0 w-full md:hidden border-b border-primary-100/80 bg-surface-white px-5 py-4 shadow-xl z-30"
            >
              <nav className="flex flex-col gap-1 pb-3">
                {navLinks.map((item) => (
                  <a
                    key={item.href}
                    href={item.href}
                    onClick={(e) => handleScrollTo(e, item.href)}
                    className="flex items-center justify-between px-3.5 py-2.5 rounded-xl text-sm font-bold text-text-secondary hover:text-primary-600 hover:bg-sky-soft transition-colors cursor-pointer"
                  >
                    <span>{item.label}</span>
                    <ChevronRight className="w-4 h-4 text-text-muted" />
                  </a>
                ))}
              </nav>

              <div className="pt-2 border-t border-slate-100">
                <Button
                  variant="kid"
                  size="md"
                  onClick={() => {
                    setIsMobileMenuOpen(false);
                    setIsModalOpen(true);
                  }}
                  className="w-full text-sm h-10 justify-center shadow-[0_3px_0_0_#B91C1C]"
                >
                  <span>Mulai Tes Sekarang</span>
                </Button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.header>

      {/* Backdrop Mobile Drawer */}
      <AnimatePresence>
        {isMobileMenuOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="fixed inset-0 bg-slate-900/30 backdrop-blur-2xs z-20 md:hidden"
            onClick={() => setIsMobileMenuOpen(false)}
          />
        )}
      </AnimatePresence>

      {/* Main Content */}
      <main className="flex-1 w-full flex flex-col items-center">
        {/* HERO SECTION DENGAN AMBIENT MOTION */}
        <section
          id="hero"
          className="relative w-full overflow-hidden scroll-mt-24"
        >
          {/* Latar Belakang Ambient Animasi (Awan, Bintang Sparkle, Obrolan Kartun) */}
          <div
            className="absolute inset-0 pointer-events-none select-none overflow-hidden z-0"
            aria-hidden="true"
          >
            {/* Awan 1 - Melayang lembut di kiri atas */}
            <motion.div
              animate={{ x: [-15, 25, -15], y: [0, -6, 0] }}
              transition={{ duration: 18, repeat: Infinity, ease: "easeInOut" }}
              className="absolute -top-4 -left-6 sm:left-10 w-36 sm:w-52 text-white/70 drop-shadow-xs"
            >
              <CloudSvg />
            </motion.div>

            {/* Awan 2 - Melayang lembut di kanan atas di belakang maskot */}
            <motion.div
              animate={{ x: [20, -20, 20], y: [0, 8, 0] }}
              transition={{ duration: 22, repeat: Infinity, ease: "easeInOut" }}
              className="absolute top-10 right-4 sm:right-16 w-32 sm:w-48 text-white/60 drop-shadow-xs"
            >
              <CloudSvg />
            </motion.div>

            {/* Awan 3 - Melayang halus di bagian bawah lipatan layar */}
            <motion.div
              animate={{ x: [-25, 20, -25] }}
              transition={{ duration: 24, repeat: Infinity, ease: "easeInOut" }}
              className="hidden lg:block absolute bottom-8 left-1/4 w-44 text-white/50"
            >
              <CloudSvg />
            </motion.div>

            {/* Bintang Sparkle 1 - Berdenyut di atas tulisan Placement Test */}
            <motion.div
              animate={{
                scale: [0.85, 1.25, 0.85],
                rotate: [0, 15, 0],
                opacity: [0.45, 0.95, 0.45],
              }}
              transition={{ duration: 3.5, repeat: Infinity, ease: "easeInOut" }}
              className="absolute top-16 left-8 sm:left-24 text-sun-400 w-5 h-5 drop-shadow-xs"
            >
              <SparkleStar />
            </motion.div>

            {/* Bintang Sparkle 2 - Berdenyut di kanan atas maskot */}
            <motion.div
              animate={{
                scale: [1.2, 0.8, 1.2],
                rotate: [15, -15, 15],
                opacity: [0.8, 0.35, 0.8],
              }}
              transition={{
                duration: 4,
                repeat: Infinity,
                ease: "easeInOut",
                delay: 1,
              }}
              className="absolute top-20 right-16 sm:right-32 text-sun-400 w-6 h-6 drop-shadow-xs"
            >
              <SparkleStar />
            </motion.div>

            {/* Bintang Sparkle 3 - Kecil di kiri bawah */}
            <motion.div
              animate={{
                scale: [0.75, 1.2, 0.75],
                opacity: [0.35, 0.9, 0.35],
              }}
              transition={{
                duration: 3.2,
                repeat: Infinity,
                ease: "easeInOut",
                delay: 1.8,
              }}
              className="hidden sm:block absolute bottom-20 left-16 text-sun-400/80 w-4 h-4"
            >
              <SparkleStar />
            </motion.div>

            {/* Gelembung Bicara Speaking Bubble Doodle */}
            <motion.div
              animate={{
                y: [0, -12, 0],
                rotate: [-4, 4, -4],
                opacity: [0.35, 0.65, 0.35],
              }}
              transition={{ duration: 6, repeat: Infinity, ease: "easeInOut" }}
              className="absolute top-36 right-8 sm:right-28 text-primary-300/60 w-8 h-8"
            >
              <SpeechBubbleSvg />
            </motion.div>

            {/* Gelembung Pastel Melayang */}
            <motion.div
              animate={{ y: [0, -14, 0], scale: [1, 1.08, 1] }}
              transition={{
                duration: 5.5,
                repeat: Infinity,
                ease: "easeInOut",
                delay: 0.5,
              }}
              className="hidden sm:block absolute bottom-16 right-1/4 w-8 h-8 rounded-full bg-primary-200/40 border border-primary-300/30 backdrop-blur-2xs"
            />
          </div>

          {/* Konten Hero Utama */}
          <div className="relative z-10 w-full max-w-5xl mx-auto px-6 pt-10 pb-16 sm:py-20 lg:min-h-[calc(100vh-68px)] lg:py-0 flex flex-col-reverse md:flex-row items-center justify-between gap-10">
            {/* Teks Hero */}
            <div className="flex-1 text-center md:text-left flex flex-col items-center md:items-start">
              {/* Judul Utama + Deskripsi + Tombol CTA */}
              <motion.div
                initial={{ opacity: 0, y: 24 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.1 }}
              >
                {/* Judul Utama */}
                <h1 className="font-display tracking-tight leading-tight mb-4">
                  <span className="block text-xs sm:text-sm md:text-base font-bold uppercase tracking-widest text-primary-600 mb-2">
                    Up Speaking Learning Centre
                  </span>
                  <span className="block text-4xl sm:text-5xl lg:text-6xl font-black text-text-primary">
                    Placement{" "}
                    <span className="text-primary-500 underline decoration-sun-400 decoration-wavy decoration-2 sm:decoration-4 underline-offset-6 sm:underline-offset-8 [text-decoration-skip-ink:none]">
                      Test
                    </span>
                  </span>
                </h1>

                {/* Deskripsi */}
                <p className="text-base sm:text-lg text-text-secondary max-w-xl mb-7 leading-relaxed">
                  Kerjakan placement test secara mandiri dan teliti. Cukup masukkan nama dan nomor telepon yang telah didaftarkan untuk memulai tes.
                </p>

                {/* Tombol CTA */}
                <div className="flex flex-col sm:flex-row items-center gap-4 w-full sm:w-auto">
                  <Button
                    size="xl"
                    variant="kid"
                    onClick={() => setIsModalOpen(true)}
                    className="w-full sm:w-auto px-9 text-lg shadow-[0_6px_0_0_#B91C1C]"
                  >
                    <span>Mulai Tes Sekarang</span>
                  </Button>
                </div>
              </motion.div>
            </div>

            {/* Maskot Ilustrasi Hero */}
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.5, delay: 0.15 }}
              className="flex-1 flex justify-center items-center relative"
            >
              {/* Blob Background Dekoratif */}
              <div className="absolute w-64 h-64 sm:w-80 sm:h-80 bg-primary-100/70 rounded-full blur-2xl -z-10 animate-pulse" />
              <HeroMascotInteractive />
            </motion.div>
          </div>
        </section>

        {/* SECTION: 3 LANGKAH PELAKSANAAN TES */}
        <section
          id="alur"
          className="relative w-full bg-surface-white py-14 px-6 border-y border-primary-100/60 scroll-mt-20 overflow-hidden"
        >
          {/* Latar Belakang Ambient Animasi Alur */}
          <div
            className="absolute inset-0 pointer-events-none select-none overflow-hidden z-0"
            aria-hidden="true"
          >
            {/* Awan melayang lembut di kanan atas */}
            <motion.div
              animate={{ x: [0, 24, 0], y: [0, -4, 0] }}
              transition={{ duration: 20, repeat: Infinity, ease: "easeInOut" }}
              className="absolute -top-6 -right-10 w-36 sm:w-48 text-primary-50/70"
            >
              <CloudSvg />
            </motion.div>

            {/* Sparkle di kiri */}
            <motion.div
              animate={{
                scale: [0.8, 1.2, 0.8],
                opacity: [0.3, 0.85, 0.3],
                rotate: [0, 10, 0],
              }}
              transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
              className="absolute top-12 left-6 sm:left-16 text-sun-400/80 w-5 h-5"
            >
              <SparkleStar />
            </motion.div>

            {/* Bubble pastel di kiri bawah */}
            <motion.div
              animate={{ y: [0, -10, 0] }}
              transition={{
                duration: 5,
                repeat: Infinity,
                ease: "easeInOut",
                delay: 1,
              }}
              className="absolute bottom-6 left-10 w-6 h-6 rounded-full bg-primary-100/60 border border-primary-200/40"
            />

            {/* Sparkle kecil di kanan bawah */}
            <motion.div
              animate={{ scale: [1, 0.75, 1], opacity: [0.75, 0.25, 0.75] }}
              transition={{
                duration: 3.6,
                repeat: Infinity,
                ease: "easeInOut",
                delay: 1.5,
              }}
              className="hidden sm:block absolute bottom-8 right-20 text-sun-300/70 w-4 h-4"
            >
              <SparkleStar />
            </motion.div>
          </div>

          <div className="relative z-10 max-w-5xl mx-auto">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.4 }}
              className="text-center max-w-xl mx-auto mb-10"
            >
              <h2 className="font-display text-2xl sm:text-3xl font-black text-text-primary">
                3 Langkah Pelaksanaan Tes
              </h2>
              <p className="text-sm sm:text-base text-text-muted mt-2">
                Ikuti alur pengerjaan tes dengan tertib dan teliti:
              </p>
            </motion.div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {/* Langkah 1 */}
              <motion.div
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                whileHover={{ y: -6 }}
                transition={{ duration: 0.4, delay: 0 }}
                className="p-6 rounded-[24px] bg-sky-soft border-2 border-primary-100 shadow-sm flex flex-col items-center text-center relative group hover:border-primary-300 transition-colors"
              >
                <div className="w-12 h-12 rounded-2xl bg-primary-500 text-white font-display text-xl font-black flex items-center justify-center mb-4 shadow-[0_3px_0_0_#206798]">
                  1
                </div>
                <h3 className="font-display text-lg font-bold text-text-primary mb-1.5">
                  Isi Nama &amp; No. HP
                </h3>
                <p className="text-xs sm:text-sm text-text-secondary leading-relaxed">
                  Masukkan nama lengkap dan nomor telepon yang telah didaftarkan pada sistem Up Speaking.
                </p>
              </motion.div>

              {/* Langkah 2 */}
              <motion.div
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                whileHover={{ y: -6 }}
                transition={{ duration: 0.4, delay: 0.1 }}
                className="p-6 rounded-[24px] bg-sun-50 border-2 border-sun-300/80 shadow-sm flex flex-col items-center text-center relative group hover:border-sun-400 transition-colors"
              >
                <div className="w-12 h-12 rounded-2xl bg-amber-500 text-white font-display text-xl font-black flex items-center justify-center mb-4 shadow-[0_3px_0_0_#B45309]">
                  2
                </div>
                <h3 className="font-display text-lg font-bold text-text-primary mb-1.5">
                  Jawab Soal Pilihan Ganda
                </h3>
                <p className="text-xs sm:text-sm text-text-secondary leading-relaxed">
                  Pilih satu jawaban yang menurutmu paling tepat. Baca perlahan karena tidak ada batasan waktu kaku.
                </p>
              </motion.div>

              {/* Langkah 3 */}
              <motion.div
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                whileHover={{ y: -6 }}
                transition={{ duration: 0.4, delay: 0.2 }}
                className="p-6 rounded-[24px] bg-mint-50 border-2 border-mint-400/60 shadow-sm flex flex-col items-center text-center relative group hover:border-mint-500 transition-colors"
              >
                <div className="w-12 h-12 rounded-2xl bg-mint-500 text-white font-display text-xl font-black flex items-center justify-center mb-4 shadow-[0_3px_0_0_#047857]">
                  3
                </div>
                <h3 className="font-display text-lg font-bold text-text-primary mb-1.5">
                  Penilaian Hasil Tes
                </h3>
                <p className="text-xs sm:text-sm text-text-secondary leading-relaxed">
                  Setelah tes dikumpulkan, lembar jawabanmu akan dinilai untuk penentuan kelas yang paling tepat.
                </p>
              </motion.div>
            </div>
          </div>
        </section>

        {/* SECTION: KETENTUAN PENGERJAAN TES */}
        <section
          id="ketentuan"
          className="relative w-full max-w-5xl mx-auto px-6 py-14 sm:py-18 scroll-mt-20 overflow-hidden"
        >
          {/* Latar Belakang Ambient Animasi Ketentuan */}
          <div
            className="absolute inset-0 pointer-events-none select-none overflow-hidden z-0"
            aria-hidden="true"
          >
            {/* Awan melayang di kiri atas */}
            <motion.div
              animate={{ x: [-15, 15, -15], y: [0, 5, 0] }}
              transition={{ duration: 22, repeat: Infinity, ease: "easeInOut" }}
              className="absolute top-2 -left-10 w-40 sm:w-52 text-white/70 drop-shadow-xs"
            >
              <CloudSvg />
            </motion.div>

            {/* Sparkle di kanan atas */}
            <motion.div
              animate={{
                scale: [0.85, 1.25, 0.85],
                rotate: [0, 15, 0],
                opacity: [0.35, 0.85, 0.35],
              }}
              transition={{ duration: 4.2, repeat: Infinity, ease: "easeInOut" }}
              className="absolute top-10 right-8 sm:right-16 text-sun-400 w-5 h-5 drop-shadow-xs"
            >
              <SparkleStar />
            </motion.div>

            {/* Speech bubble doodle di kanan tengah */}
            <motion.div
              animate={{
                y: [0, -10, 0],
                rotate: [4, -4, 4],
                opacity: [0.25, 0.55, 0.25],
              }}
              transition={{
                duration: 6,
                repeat: Infinity,
                ease: "easeInOut",
                delay: 0.8,
              }}
              className="hidden sm:block absolute top-1/2 -right-2 text-primary-300/50 w-7 h-7"
            >
              <SpeechBubbleSvg />
            </motion.div>

            {/* Pastel bubble di kiri bawah */}
            <motion.div
              animate={{ y: [0, -12, 0], scale: [1, 1.1, 1] }}
              transition={{
                duration: 5,
                repeat: Infinity,
                ease: "easeInOut",
                delay: 1.2,
              }}
              className="absolute bottom-10 left-6 w-8 h-8 rounded-full bg-mint-100/50 border border-mint-200/40"
            />
          </div>

          <div className="relative z-10">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.4 }}
              className="text-center max-w-xl mx-auto mb-10"
            >
              <h2 className="font-display text-2xl sm:text-3xl font-black text-text-primary">
                Ketentuan Pengerjaan Tes
              </h2>
              <p className="text-sm sm:text-base text-text-muted mt-2">
                Sistem tes dirancang agar pelaksanaan ujian berjalan tertib, mandiri, dan akurat.
              </p>
            </motion.div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
              {/* Poin 1 */}
              <motion.div
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                whileHover={{ y: -4 }}
                transition={{ duration: 0.4, delay: 0 }}
                className="p-6 rounded-[24px] bg-surface-white border-2 border-primary-100 hover:border-primary-300 shadow-kid-card flex gap-4 items-start transition-colors"
              >
                <div className="p-3 rounded-2xl bg-primary-100 text-primary-600 shrink-0">
                  <Shuffle className="w-6 h-6" />
                </div>
                <div>
                  <h3 className="font-display text-base font-bold text-text-primary mb-1">
                    Urutan Soal Diacak
                  </h3>
                  <p className="text-xs sm:text-sm text-text-muted leading-relaxed">
                    Setiap peserta mendapatkan susunan soal acak secara adil. Fokuslah pada lembar tes masing-masing.
                  </p>
                </div>
              </motion.div>

              {/* Poin 2 */}
              <motion.div
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                whileHover={{ y: -4 }}
                transition={{ duration: 0.4, delay: 0.08 }}
                className="p-6 rounded-[24px] bg-surface-white border-2 border-primary-100 hover:border-primary-300 shadow-kid-card flex gap-4 items-start transition-colors"
              >
                <div className="p-3 rounded-2xl bg-sun-100 text-amber-600 shrink-0">
                  <Timer className="w-6 h-6" />
                </div>
                <div>
                  <h3 className="font-display text-base font-bold text-text-primary mb-1">
                    Pencatatan Waktu Pengerjaan
                  </h3>
                  <p className="text-xs sm:text-sm text-text-muted leading-relaxed">
                    Waktu pengerjaan dicatat secara otomatis oleh sistem selama sesi tes berlangsung tanpa alarm mendadak.
                  </p>
                </div>
              </motion.div>

              {/* Poin 3 */}
              <motion.div
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                whileHover={{ y: -4 }}
                transition={{ duration: 0.4, delay: 0.16 }}
                className="p-6 rounded-[24px] bg-surface-white border-2 border-primary-100 hover:border-primary-300 shadow-kid-card flex gap-4 items-start transition-colors"
              >
                <div className="p-3 rounded-2xl bg-mint-100 text-mint-600 shrink-0">
                  <ShieldCheck className="w-6 h-6" />
                </div>
                <div>
                  <h3 className="font-display text-base font-bold text-text-primary mb-1">
                    Penyimpanan Jawaban Otomatis
                  </h3>
                  <p className="text-xs sm:text-sm text-text-muted leading-relaxed">
                    Semua jawaban tersimpan otomatis di perangkat sehingga tidak hilang jika terjadi kendala jaringan.
                  </p>
                </div>
              </motion.div>

              {/* Poin 4 */}
              <motion.div
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                whileHover={{ y: -4 }}
                transition={{ duration: 0.4, delay: 0.24 }}
                className="p-6 rounded-[24px] bg-surface-white border-2 border-primary-100 hover:border-primary-300 shadow-kid-card flex gap-4 items-start transition-colors"
              >
                <div className="p-3 rounded-2xl bg-accent-100 text-accent-600 shrink-0">
                  <BookOpen className="w-6 h-6" />
                </div>
                <div>
                  <h3 className="font-display text-base font-bold text-text-primary mb-1">
                    Penilaian Tim Pengajar
                  </h3>
                  <p className="text-xs sm:text-sm text-text-muted leading-relaxed">
                    Lembar tes akan dinilai langsung oleh tim pengajar untuk menentukan hasil penempatan kelas.
                  </p>
                </div>
              </motion.div>
            </div>
          </div>
        </section>

        {/* SECTION: FAQ (PERTANYAAN UMUM) */}
        <section
          id="faq"
          className="relative w-full bg-surface-white py-14 px-6 border-t border-primary-100/60 scroll-mt-20 overflow-hidden"
        >
          {/* Latar Belakang Ambient Animasi FAQ */}
          <div
            className="absolute inset-0 pointer-events-none select-none overflow-hidden z-0"
            aria-hidden="true"
          >
            {/* Awan melayang di kiri atas */}
            <motion.div
              animate={{ x: [0, -25, 0], y: [0, -5, 0] }}
              transition={{ duration: 24, repeat: Infinity, ease: "easeInOut" }}
              className="absolute -top-4 -left-10 w-44 text-primary-50/70"
            >
              <CloudSvg />
            </motion.div>

            {/* Sparkle di kanan dekat judul */}
            <motion.div
              animate={{
                scale: [0.75, 1.2, 0.75],
                opacity: [0.3, 0.9, 0.3],
                rotate: [0, 12, 0],
              }}
              transition={{ duration: 3.8, repeat: Infinity, ease: "easeInOut" }}
              className="absolute top-12 right-12 sm:right-28 text-sun-400/90 w-5 h-5"
            >
              <SparkleStar />
            </motion.div>

            {/* Mini Speech bubble doodle di kiri bawah */}
            <motion.div
              animate={{
                y: [0, -8, 0],
                rotate: [-6, 6, -6],
                opacity: [0.3, 0.6, 0.3],
              }}
              transition={{
                duration: 5.5,
                repeat: Infinity,
                ease: "easeInOut",
                delay: 1,
              }}
              className="absolute bottom-16 left-8 sm:left-20 text-primary-200/70 w-8 h-8"
            >
              <SpeechBubbleSvg />
            </motion.div>

            {/* Bubble pastel di kanan bawah */}
            <motion.div
              animate={{ y: [0, -10, 0] }}
              transition={{
                duration: 4.8,
                repeat: Infinity,
                ease: "easeInOut",
                delay: 0.5,
              }}
              className="hidden sm:block absolute bottom-12 right-16 w-7 h-7 rounded-full bg-sun-100/50 border border-sun-200/50"
            />
          </div>

          <div className="relative z-10 max-w-3xl mx-auto">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.4 }}
              className="text-center mb-10"
            >
              <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-primary-50 text-primary-600 text-xs font-bold mb-2">
                <HelpCircle className="w-3.5 h-3.5" />
                <span>Bantuan &amp; Tanya Jawab</span>
              </div>
              <h2 className="font-display text-2xl sm:text-3xl font-black text-text-primary">
                Pertanyaan yang Sering Diajukan
              </h2>
            </motion.div>

            <div className="space-y-3.5">
              {faqs.map((faq, idx) => {
                const isOpen = openFaqIndex === idx;
                return (
                  <motion.div
                    key={idx}
                    initial={{ opacity: 0, y: 24 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.35, delay: idx * 0.08, ease: "easeOut" }}
                    whileHover={{ scale: 1.01 }}
                    className="rounded-2xl border-2 border-primary-100 hover:border-primary-200 overflow-hidden bg-sky-soft/40 transition-colors"
                  >
                    <button
                      type="button"
                      onClick={() => toggleFaq(idx)}
                      className="w-full p-4 sm:p-5 text-left flex items-center justify-between gap-3 font-display font-bold text-base sm:text-lg text-text-primary hover:text-primary-600 transition-colors"
                    >
                      <span>{faq.q}</span>
                      <ChevronDown
                        className={`w-5 h-5 text-primary-500 transition-transform duration-200 shrink-0 ${
                          isOpen ? "rotate-180" : ""
                        }`}
                      />
                    </button>
                    <AnimatePresence initial={false}>
                      {isOpen && (
                        <motion.div
                          initial={{ opacity: 0, height: 0 }}
                          animate={{ opacity: 1, height: "auto" }}
                          exit={{ opacity: 0, height: 0 }}
                          transition={{ duration: 0.2 }}
                          className="px-5 pb-5 pt-1 text-xs sm:text-sm text-text-secondary leading-relaxed border-t border-primary-100/50 bg-white overflow-hidden"
                        >
                          {faq.a}
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </motion.div>
                );
              })}
            </div>
          </div>
        </section>

        {/* BANNER AJAKAN AKHIR */}
        <section className="w-full max-w-4xl mx-auto px-6 py-12">
          <motion.div
            initial={{ opacity: 0, scale: 0.97 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 0.4 }}
            className="rounded-[32px] bg-gradient-to-r from-primary-500 to-primary-600 p-8 sm:p-10 text-white text-center shadow-kid relative overflow-hidden"
          >
            <div className="absolute -top-10 -right-10 w-40 h-40 bg-white/10 rounded-full blur-xl pointer-events-none" />
            <h2 className="font-display text-2xl sm:text-3xl font-black mb-3">
              Siap Memulai Placement Test?
            </h2>
            <p className="text-sm sm:text-base text-primary-100 max-w-lg mx-auto mb-6">
              Pastikan kamu sudah siap dan kerjakan soal secara mandiri semampumu!
            </p>
            <Button
              size="xl"
              variant="kid"
              onClick={() => setIsModalOpen(true)}
              className="px-7 sm:px-9 text-sm sm:text-base shadow-[0_5px_0_0_#B91C1C] max-w-xs w-full sm:w-auto"
            >
              <span>Mulai Tes Sekarang</span>
            </Button>
          </motion.div>
        </section>
      </main>

      {/* FOOTER BERSIH & MINIMALIS */}
      <motion.footer
        initial={{ opacity: 0, y: 24 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.5, ease: "easeOut" }}
        className="w-full border-t border-primary-100/80 py-8 px-6 bg-surface-white text-center"
      >
        <div className="max-w-4xl mx-auto flex flex-col items-center gap-3.5">
          <motion.div
            whileHover={{ scale: 1.05 }}
            transition={{ type: "spring", stiffness: 400, damping: 20 }}
            className="flex items-center gap-2"
          >
            <Image
              src="/images/logo.png"
              alt="Up Speaking Logo"
              width={110}
              height={34}
              className="h-8 w-auto object-contain opacity-90"
            />
            <span className="font-display font-black text-xl text-text-primary tracking-tight opacity-90">
              Speaking
            </span>
          </motion.div>

          <p className="text-xs text-text-secondary max-w-md">
            Pusat Pelatihan &amp; Pembelajaran Bahasa Inggris — Up Speaking Learning Centre.
          </p>

          {/* Deretan Tombol Ikon Sosial Media Minimalis */}
          <div className="flex items-center justify-center gap-2.5 pt-1">
            <motion.a
              href={SITE_CONFIG.socials.instagram}
              target="_blank"
              rel="noopener noreferrer"
              aria-label="Instagram Up Speaking"
              whileHover={{ scale: 1.15, y: -2 }}
              whileTap={{ scale: 0.92 }}
              transition={{ type: "spring", stiffness: 400, damping: 17 }}
              className="w-9 h-9 rounded-full bg-sky-soft hover:bg-pink-50 text-slate-500 hover:text-pink-600 flex items-center justify-center transition-colors border border-primary-100 shadow-2xs cursor-pointer"
            >
              <InstagramIcon className="w-4 h-4" />
            </motion.a>
            <motion.a
              href={SITE_CONFIG.socials.tiktok}
              target="_blank"
              rel="noopener noreferrer"
              aria-label="TikTok Up Speaking"
              whileHover={{ scale: 1.15, y: -2 }}
              whileTap={{ scale: 0.92 }}
              transition={{ type: "spring", stiffness: 400, damping: 17 }}
              className="w-9 h-9 rounded-full bg-sky-soft hover:bg-slate-900 text-slate-500 hover:text-white flex items-center justify-center transition-colors border border-primary-100 shadow-2xs cursor-pointer"
            >
              <TikTokIcon className="w-4 h-4" />
            </motion.a>
            <motion.a
              href={SITE_CONFIG.socials.facebook}
              target="_blank"
              rel="noopener noreferrer"
              aria-label="Facebook Up Speaking"
              whileHover={{ scale: 1.15, y: -2 }}
              whileTap={{ scale: 0.92 }}
              transition={{ type: "spring", stiffness: 400, damping: 17 }}
              className="w-9 h-9 rounded-full bg-sky-soft hover:bg-blue-50 text-slate-500 hover:text-blue-600 flex items-center justify-center transition-colors border border-primary-100 shadow-2xs cursor-pointer"
            >
              <FacebookIcon className="w-4 h-4" />
            </motion.a>
            <motion.a
              href={SITE_CONFIG.socials.whatsapp}
              target="_blank"
              rel="noopener noreferrer"
              aria-label="WhatsApp Up Speaking"
              whileHover={{ scale: 1.15, y: -2 }}
              whileTap={{ scale: 0.92 }}
              transition={{ type: "spring", stiffness: 400, damping: 17 }}
              className="w-9 h-9 rounded-full bg-sky-soft hover:bg-emerald-50 text-slate-500 hover:text-emerald-600 flex items-center justify-center transition-colors border border-primary-100 shadow-2xs cursor-pointer"
            >
              <WhatsAppIcon className="w-4 h-4" />
            </motion.a>
          </div>

          <p className="text-[11px] text-text-muted pt-2 border-t border-slate-100 w-full">
            &copy; {new Date().getFullYear()} {SITE_CONFIG.name}. All rights reserved.
          </p>
        </div>
      </motion.footer>

      {/* Student Login Modal */}
      <LoginModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
      />
    </div>
  );
}
