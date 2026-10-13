"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui";
import { LoginModal } from "@/components/student/LoginModal";
import { Mascot } from "@/components/student/Mascot";
import { getActiveSession } from "@/lib/session";
import { SITE_CONFIG } from "@/lib/site-config";
import {
  Sparkles,
  BookOpen,
  Timer,
  Shuffle,
  ShieldCheck,
  ArrowRight,
  HelpCircle,
  ChevronDown,
  MessageCircle,
  CheckCircle2,
  Smile,
  Heart,
} from "lucide-react";

const InstagramIcon: React.FC<{ className?: string }> = ({ className }) => (
  <svg
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
    className={className}
  >
    <rect width="20" height="20" x="2" y="2" rx="5" ry="5" />
    <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z" />
    <line x1="17.5" x2="17.51" y1="6.5" y2="6.5" />
  </svg>
);

export default function Home() {
  const router = useRouter();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [checkingSession, setCheckingSession] = useState(true);
  const [activeSession, setActiveSession] = useState<ReturnType<typeof getActiveSession>>(null);
  const [openFaqIndex, setOpenFaqIndex] = useState<number | null>(null);

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
      <main className="flex min-h-screen items-center justify-center p-6 bg-sky-soft font-kid">
        <div className="flex flex-col items-center gap-4 text-center">
          <Mascot mood="think" size={90} floating />
          <div className="h-9 w-9 animate-spin rounded-full border-4 border-primary-500 border-t-transparent" />
          <p className="text-base font-bold text-text-secondary">
            Mendeteksi sesi tesmu yang sedang berjalan... Mengalihkan ke lembar soal ya!
          </p>
        </div>
      </main>
    );
  }

  const toggleFaq = (index: number) => {
    setOpenFaqIndex(openFaqIndex === index ? null : index);
  };

  const faqs = [
    {
      q: "Apakah ada batasan waktu saat mengerjakan tes?",
      a: "Tidak ada batas waktu mundur (countdown)! Jam di atas hanya mencatat total waktu pengerjaanmu. Kamu bisa membaca dan menjawab soal dengan tenang dan teliti.",
    },
    {
      q: "Bagaimana jika koneksi internet tiba-tiba terputus?",
      a: "Jangan panik! Jawabanmu otomatis tersimpan aman di HP/komputermu. Kamu tetap bisa lanjut menjawab, dan jawaban akan tersimpan otomatis saat internet terhubung kembali.",
    },
    {
      q: "Bolehkah saya mengubah jawaban sebelum mengumpulkan?",
      a: "Tentu saja boleh! Kamu bebas kembali ke nomor sebelumnya dan mengganti pilihan jawaban kapan saja sebelum menekan tombol 'Kumpulkan'.",
    },
    {
      q: "Kapan saya bisa mengetahui hasil level kelas saya?",
      a: "Setelah kamu mengumpulkan jawaban, hasil tes akan ditinjau langsung oleh Kak Tutor Up Speaking untuk menetapkan level kelas resmi yang paling cocok untukmu.",
    },
  ];

  return (
    <div className="min-h-screen bg-sky-soft text-text-primary font-kid flex flex-col justify-between selection:bg-sun-100 selection:text-primary-800">
      {/* Top Navbar */}
      <header className="w-full bg-surface-white/90 backdrop-blur-md border-b border-primary-100/60 py-3.5 px-6 sm:px-10 sticky top-0 z-30 shadow-xs">
        <div className="max-w-6xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Image
              src="/images/logo.png"
              alt="Up Speaking Logo"
              width={130}
              height={40}
              priority
              className="h-9 w-auto object-contain"
            />
          </div>

          {/* Quick Action Button */}
          <Button
            size="md"
            variant="kid"
            onClick={() => setIsModalOpen(true)}
            className="text-xs sm:text-sm px-4 sm:px-6 h-10 shadow-[0_3px_0_0_#B91C1C]"
          >
            <span>Mulai Tes</span>
            <ArrowRight className="w-4 h-4 ml-1" />
          </Button>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 w-full flex flex-col items-center">
        {/* HERO SECTION */}
        <section className="w-full max-w-5xl mx-auto px-6 pt-10 pb-16 sm:py-20 flex flex-col-reverse md:flex-row items-center justify-between gap-10">
          {/* Teks Hero */}
          <div className="flex-1 text-center md:text-left flex flex-col items-center md:items-start">
            {/* Badge Sambutan */}
            <div className="inline-flex items-center gap-2 rounded-full bg-sun-100 px-4 py-1.5 text-xs sm:text-sm font-bold text-amber-800 mb-5 border border-sun-300 shadow-xs">
              <Sparkles className="w-4 h-4 text-amber-600 animate-spin" style={{ animationDuration: "6s" }} />
              <span>Hai Teman-Teman Calon Siswa! 🌟</span>
            </div>

            {/* Judul Utama */}
            <h1 className="font-display text-3xl sm:text-4xl lg:text-5xl font-black text-text-primary tracking-tight leading-tight mb-4">
              Yuk, Cari Tahu Level <br className="hidden sm:inline" />
              <span className="text-primary-500 underline decoration-sun-400 decoration-wavy decoration-2">
                Bahasa Inggrismu
              </span>{" "}
              Di Sini!
            </h1>

            {/* Deskripsi */}
            <p className="text-base sm:text-lg text-text-secondary max-w-xl mb-8 leading-relaxed">
              Tes penempatan ini santai, adil, dan menyenangkan. Cukup jawab dengan percaya diri agar Kak Tutor tahu materi kelas yang paling seru buat kamu!
            </p>

            {/* Tombol CTA */}
            <div className="flex flex-col sm:flex-row items-center gap-4 w-full sm:w-auto">
              <Button
                size="xl"
                variant="kid"
                onClick={() => setIsModalOpen(true)}
                className="w-full sm:w-auto px-9 text-lg gap-2.5 shadow-[0_6px_0_0_#B91C1C]"
              >
                <span>Ayo Mulai Sekarang!</span>
                <ArrowRight className="w-5 h-5" />
              </Button>
            </div>

            <p className="text-xs text-text-muted mt-3.5 flex items-center gap-1.5">
              <CheckCircle2 className="w-4 h-4 text-mint-500 shrink-0" />
              Mudah & cepat! Cukup masukkan Nama dan No HP yang terdaftar.
            </p>
          </div>

          {/* Maskot Ilustrasi Hero */}
          <div className="flex-1 flex justify-center items-center relative">
            {/* Blob Background Dekoratif */}
            <div className="absolute w-64 h-64 sm:w-80 sm:h-80 bg-primary-100/70 rounded-full blur-2xl -z-10 animate-pulse" />
            <div className="relative p-6 sm:p-8 rounded-[36px] bg-white/70 backdrop-blur-xs border-2 border-primary-200/50 shadow-kid-card flex flex-col items-center">
              <Mascot mood="wave" size={210} floating />
              <div className="mt-3 px-4 py-1.5 rounded-full bg-sun-50 border border-sun-300 text-xs font-bold text-amber-800 flex items-center gap-1.5 shadow-2xs">
                <Smile className="w-3.5 h-3.5 text-amber-600" />
                <span>Kenalan yuk! Aku <strong>Upi</strong>, teman belajarmu</span>
              </div>
            </div>
          </div>
        </section>

        {/* SECTION: 3 LANGKAH MUDAH */}
        <section className="w-full bg-surface-white py-14 px-6 border-y border-primary-100/60">
          <div className="max-w-5xl mx-auto">
            <div className="text-center max-w-xl mx-auto mb-10">
              <h2 className="font-display text-2xl sm:text-3xl font-black text-text-primary">
                3 Langkah Mudah Menemukan Levelmu
              </h2>
              <p className="text-sm sm:text-base text-text-muted mt-2">
                Tidak perlu cemas atau terburu-buru, ikuti langkah santai berikut:
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {/* Langkah 1 */}
              <div className="p-6 rounded-[24px] bg-sky-soft border-2 border-primary-100 shadow-sm flex flex-col items-center text-center relative group hover:border-primary-300 transition-colors">
                <div className="w-12 h-12 rounded-2xl bg-primary-500 text-white font-display text-xl font-black flex items-center justify-center mb-4 shadow-[0_3px_0_0_#206798]">
                  1
                </div>
                <h3 className="font-display text-lg font-bold text-text-primary mb-1.5">
                  Isi Nama & No. HP
                </h3>
                <p className="text-xs sm:text-sm text-text-secondary leading-relaxed">
                  Masukkan nama lengkap dan nomor telepon yang telah didaftarkan orang tuamu di Up Speaking.
                </p>
              </div>

              {/* Langkah 2 */}
              <div className="p-6 rounded-[24px] bg-sun-50 border-2 border-sun-300/80 shadow-sm flex flex-col items-center text-center relative group hover:border-sun-400 transition-colors">
                <div className="w-12 h-12 rounded-2xl bg-amber-500 text-white font-display text-xl font-black flex items-center justify-center mb-4 shadow-[0_3px_0_0_#B45309]">
                  2
                </div>
                <h3 className="font-display text-lg font-bold text-text-primary mb-1.5">
                  Jawab Soal Pilihan Ganda
                </h3>
                <p className="text-xs sm:text-sm text-text-secondary leading-relaxed">
                  Pilih jawaban yang menurutmu paling tepat. Baca perlahan karena tidak ada batasan waktu kaku.
                </p>
              </div>

              {/* Langkah 3 */}
              <div className="p-6 rounded-[24px] bg-mint-50 border-2 border-mint-400/60 shadow-sm flex flex-col items-center text-center relative group hover:border-mint-500 transition-colors">
                <div className="w-12 h-12 rounded-2xl bg-mint-500 text-white font-display text-xl font-black flex items-center justify-center mb-4 shadow-[0_3px_0_0_#047857]">
                  3
                </div>
                <h3 className="font-display text-lg font-bold text-text-primary mb-1.5">
                  Dapatkan Level Resmimu!
                </h3>
                <p className="text-xs sm:text-sm text-text-secondary leading-relaxed">
                  Kak Tutor akan memeriksa lembar tesmu dan menentukan kelas yang paling pas untuk kemampuanmu.
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* SECTION: 4 PANDUAN PENGERJAAN RAMAH SISWA */}
        <section className="w-full max-w-5xl mx-auto px-6 py-14 sm:py-18">
          <div className="text-center max-w-xl mx-auto mb-10">
            <h2 className="font-display text-2xl sm:text-3xl font-black text-text-primary">
              Kenapa Tes Ini Nyaman Buat Kamu?
            </h2>
            <p className="text-sm sm:text-base text-text-muted mt-2">
              Sistem tes Up Speaking dirancang agar kamu merasa tenang tanpa rasa takut salah.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
            {/* Poin 1 */}
            <div className="p-6 rounded-[24px] bg-surface-white border-2 border-primary-100 shadow-kid-card flex gap-4 items-start">
              <div className="p-3 rounded-2xl bg-primary-100 text-primary-600 shrink-0">
                <Shuffle className="w-6 h-6" />
              </div>
              <div>
                <h3 className="font-display text-base font-bold text-text-primary mb-1">
                  Urutan Soal Diacak Adil
                </h3>
                <p className="text-xs sm:text-sm text-text-muted leading-relaxed">
                  Tiap teman mendapatkan susunan soal acak yang adil dan unik, jadi kamu cukup fokus pada lembar tesmu sendiri ya!
                </p>
              </div>
            </div>

            {/* Poin 2 */}
            <div className="p-6 rounded-[24px] bg-surface-white border-2 border-primary-100 shadow-kid-card flex gap-4 items-start">
              <div className="p-3 rounded-2xl bg-sun-100 text-amber-600 shrink-0">
                <Timer className="w-6 h-6" />
              </div>
              <div>
                <h3 className="font-display text-base font-bold text-text-primary mb-1">
                  Santai Saja, Tanpa Buru-Buru
                </h3>
                <p className="text-xs sm:text-sm text-text-muted leading-relaxed">
                  Penghitung waktu hanya mencatat durasi belajarmu tanpa ada alarm mundur yang membuat kaget atau berhenti mendadak.
                </p>
              </div>
            </div>

            {/* Poin 3 */}
            <div className="p-6 rounded-[24px] bg-surface-white border-2 border-primary-100 shadow-kid-card flex gap-4 items-start">
              <div className="p-3 rounded-2xl bg-mint-100 text-mint-600 shrink-0">
                <ShieldCheck className="w-6 h-6" />
              </div>
              <div>
                <h3 className="font-display text-base font-bold text-text-primary mb-1">
                  Aman Walau Internet Putus
                </h3>
                <p className="text-xs sm:text-sm text-text-muted leading-relaxed">
                  Semua jawabanmu tersimpan otomatis di perangkat. Jika sinyal internet terputus di tengah jalan, jawabanmu tidak akan hilang!
                </p>
              </div>
            </div>

            {/* Poin 4 */}
            <div className="p-6 rounded-[24px] bg-surface-white border-2 border-primary-100 shadow-kid-card flex gap-4 items-start">
              <div className="p-3 rounded-2xl bg-accent-100 text-accent-600 shrink-0">
                <BookOpen className="w-6 h-6" />
              </div>
              <div>
                <h3 className="font-display text-base font-bold text-text-primary mb-1">
                  Ditemani & Dinilai Kak Tutor
                </h3>
                <p className="text-xs sm:text-sm text-text-muted leading-relaxed">
                  Hasil tesmu akan dievaluasi langsung oleh Kak Tutor pengajar ahli kami agar kamu mendapatkan kelas yang paling seru.
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* SECTION: FAQ (PERTANYAAN UMUM) */}
        <section className="w-full bg-surface-white py-14 px-6 border-t border-primary-100/60">
          <div className="max-w-3xl mx-auto">
            <div className="text-center mb-10">
              <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-primary-50 text-primary-600 text-xs font-bold mb-2">
                <HelpCircle className="w-3.5 h-3.5" />
                <span>Bantuan & Tanya Jawab</span>
              </div>
              <h2 className="font-display text-2xl sm:text-3xl font-black text-text-primary">
                Pertanyaan yang Sering Diajukan
              </h2>
            </div>

            <div className="space-y-3.5">
              {faqs.map((faq, idx) => {
                const isOpen = openFaqIndex === idx;
                return (
                  <div
                    key={idx}
                    className="rounded-2xl border-2 border-primary-100 overflow-hidden bg-sky-soft/40 transition-colors"
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
                    {isOpen && (
                      <div className="px-5 pb-5 pt-1 text-xs sm:text-sm text-text-secondary leading-relaxed border-t border-primary-100/50 bg-white">
                        {faq.a}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        </section>

        {/* BANNER AJAKAN AKHIR */}
        <section className="w-full max-w-4xl mx-auto px-6 py-12">
          <div className="rounded-[32px] bg-gradient-to-r from-primary-500 to-primary-600 p-8 sm:p-10 text-white text-center shadow-kid relative overflow-hidden">
            <div className="absolute -top-10 -right-10 w-40 h-40 bg-white/10 rounded-full blur-xl pointer-events-none" />
            <h2 className="font-display text-2xl sm:text-3xl font-black mb-3">
              Sudah Siap Mencoba Kemampuanmu?
            </h2>
            <p className="text-sm sm:text-base text-primary-100 max-w-lg mx-auto mb-6">
              Ayo buktikan kemampuan bahasa Inggrismu sekarang. Santai saja dan kerjakan semampumu!
            </p>
            <Button
              size="xl"
              variant="kid"
              onClick={() => setIsModalOpen(true)}
              className="px-7 sm:px-9 text-sm sm:text-base shadow-[0_5px_0_0_#B91C1C] max-w-xs w-full sm:w-auto"
            >
              <span>Mulai Tes Sekarang</span>
              <ArrowRight className="w-5 h-5 ml-1 shrink-0" />
            </Button>
          </div>
        </section>
      </main>

      {/* FOOTER HANGAT */}
      <footer className="w-full border-t border-primary-100/80 py-8 px-6 bg-surface-white text-center">
        <div className="max-w-4xl mx-auto flex flex-col items-center gap-4">
          <div className="flex items-center gap-2">
            <Image
              src="/images/logo.png"
              alt="Up Speaking Logo"
              width={110}
              height={34}
              className="h-8 w-auto object-contain opacity-90"
            />
          </div>

          <p className="text-xs text-text-secondary max-w-md">
            Pusat Pelatihan & Pembelajaran Bahasa Inggris Ramah Anak & Remaja — Up Speaking Learning Centre.
          </p>

          {/* Kontak Lembaga Placeholder */}
          <div className="flex flex-wrap items-center justify-center gap-3 text-xs font-semibold text-text-muted">
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-primary-50 text-primary-700">
              <InstagramIcon className="w-3.5 h-3.5 text-pink-500" />
              <span>Instagram: {SITE_CONFIG.instagram.handle}</span>
            </span>
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-50 text-emerald-700">
              <MessageCircle className="w-3.5 h-3.5 text-emerald-600" />
              <span>WhatsApp: {SITE_CONFIG.whatsapp.display}</span>
            </span>
          </div>

          <p className="text-[11px] text-text-muted pt-2 border-t border-slate-100 w-full flex items-center justify-center gap-1">
            <span>&copy; {new Date().getFullYear()} {SITE_CONFIG.name}. Dibuat dengan</span>
            <Heart className="w-3 h-3 text-accent-500 fill-accent-500 inline" />
            <span>untuk masa depan anak bangsa.</span>
          </p>
        </div>
      </footer>

      {/* Student Login Modal */}
      <LoginModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
      />
    </div>
  );
}
