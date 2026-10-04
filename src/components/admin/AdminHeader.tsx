'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Menu, ExternalLink, ShieldCheck, HelpCircle } from 'lucide-react';

interface AdminHeaderProps {
  onOpenSidebar: () => void;
  adminEmail: string | null;
}

export default function AdminHeader({
  onOpenSidebar,
  adminEmail,
}: AdminHeaderProps) {
  const pathname = usePathname();

  // Tentukan judul halaman berdasarkan rute aktif
  const getPageInfo = () => {
    if (pathname.startsWith('/admin/questions')) {
      return {
        title: 'Manajemen Bank Soal',
        subtitle: 'Kelola butir pertanyaan, pilihan opsi, dan kunci jawaban',
      };
    }
    if (pathname.startsWith('/admin/settings')) {
      return {
        title: 'Pengaturan Ujian',
        subtitle: 'Konfigurasi durasi pengerjaan dan ambang skor level',
      };
    }
    return {
      title: 'Dashboard Rekapitulasi',
      subtitle: 'Ringkasan metrik peserta dan riwayat placement test siswa',
    };
  };

  const pageInfo = getPageInfo();

  return (
    <header className="sticky top-0 z-20 bg-white/95 backdrop-blur-xs border-b border-slate-200/80 h-16 sm:h-18 px-4 sm:px-6 lg:px-8 flex items-center justify-between">
      {/* Sisi Kiri: Tombol Hamburger Mobile + Judul Halaman */}
      <div className="flex items-center gap-3 min-w-0">
        <button
          type="button"
          onClick={onOpenSidebar}
          aria-label="Buka navigasi menu"
          className="lg:hidden p-2 rounded-xl text-slate-600 hover:text-slate-900 hover:bg-slate-100 focus:outline-none focus:ring-2 focus:ring-slate-300"
        >
          <Menu className="w-5 h-5" />
        </button>

        <div className="min-w-0">
          <h1 className="text-base sm:text-lg font-bold text-slate-900 truncate leading-tight">
            {pageInfo.title}
          </h1>
          <p className="text-xs text-slate-500 hidden sm:block truncate mt-0.5">
            {pageInfo.subtitle}
          </p>
        </div>
      </div>

      {/* Sisi Kanan: Status & Akses Cepat */}
      <div className="flex items-center gap-2 sm:gap-3 flex-shrink-0">
        <Link
          href="/"
          target="_blank"
          className="hidden sm:inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 text-slate-600 text-xs font-semibold transition-colors"
        >
          <span>Web Siswa</span>
          <ExternalLink className="w-3.5 h-3.5 text-slate-400" />
        </Link>

        {/* Badge Status Server */}
        <div className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200/80">
          <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
          <span className="hidden sm:inline">Database & Auth</span>
          <span>Online</span>
        </div>
      </div>
    </header>
  );
}
