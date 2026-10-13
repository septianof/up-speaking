"use client";

import { motion } from "framer-motion";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { Mascot } from "@/components/student/Mascot";
import { Button } from "@/components/ui";
import { Home, ArrowLeft } from "lucide-react";

export default function NotFound() {
  const router = useRouter();

  return (
    <div className="min-h-screen bg-sky-soft font-kid flex flex-col items-center justify-center px-6 selection:bg-sun-100 selection:text-primary-800">
      {/* Decorative blobs */}
      <div className="absolute top-10 left-10 w-48 h-48 bg-primary-100/60 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-16 right-10 w-60 h-60 bg-sun-100/60 rounded-full blur-3xl pointer-events-none" />

      <div className="relative z-10 flex flex-col items-center text-center max-w-lg w-full">
        {/* Logo */}
        <motion.div
          initial={{ opacity: 0, y: -16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
          className="mb-8"
        >
          <Image
            src="/images/logo.png"
            alt="Up Speaking Logo"
            width={120}
            height={38}
            className="h-9 w-auto object-contain opacity-80"
          />
        </motion.div>

        {/* 404 Number */}
        <motion.div
          initial={{ opacity: 0, scale: 0.7 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ type: "spring", stiffness: 160, damping: 14, delay: 0.1 }}
          className="relative mb-2"
        >
          <span className="font-display text-[120px] sm:text-[160px] font-black leading-none text-primary-100 select-none">
            404
          </span>
        </motion.div>

        {/* Mascot — sits over the 404 number */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.2 }}
          className="-mt-16 sm:-mt-20 z-10"
        >
          <Mascot mood="think" size={130} floating />
        </motion.div>

        {/* Text content */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.45, delay: 0.35 }}
          className="mt-5 flex flex-col items-center gap-2"
        >
          <h1 className="font-display text-2xl sm:text-3xl font-black text-text-primary">
            Halaman Tidak Ditemukan
          </h1>
          <p className="text-sm sm:text-base text-text-secondary leading-relaxed max-w-xs">
            Sepertinya halaman yang kamu cari tidak ada atau sudah dipindahkan.
            Yuk balik ke beranda! 🙌
          </p>
        </motion.div>

        {/* Action buttons */}
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: 0.5 }}
          className="mt-7 flex flex-col sm:flex-row items-center gap-3 w-full"
        >
          <Button
            variant="kid"
            size="lg"
            onClick={() => router.push("/")}
            className="w-full sm:flex-1 gap-2 shadow-[0_5px_0_0_#B91C1C] whitespace-nowrap"
          >
            <Home className="w-4 h-4 shrink-0" />
            <span>Kembali ke Beranda</span>
          </Button>

          <Button
            variant="kidSoft"
            size="lg"
            onClick={() => router.back()}
            className="w-full sm:flex-1 gap-2 whitespace-nowrap"
          >
            <ArrowLeft className="w-4 h-4 shrink-0" />
            <span>Halaman Sebelumnya</span>
          </Button>
        </motion.div>
      </div>
    </div>
  );
}
