'use client';

import React from 'react';
import Link from 'next/link';
import { LayoutDashboard, Users, BookOpen, Settings, ArrowRight } from 'lucide-react';

export default function AdminDashboardPage() {
  return (
    <div className="space-y-6 animate-fade-in">
      {/* Banner Sambutan */}
      <div className="bg-white rounded-3xl border border-slate-100 p-6 sm:p-8 shadow-[0_4px_24px_-4px_rgba(0,0,0,0.04)]">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div>
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-sky-50 text-sky-800 border border-sky-200/80 mb-2">
              <LayoutDashboard className="w-3.5 h-3.5 text-sky-600" />
              <span>Portal Manajemen</span>
            </div>
            <h2 className="text-xl sm:text-2xl font-extrabold text-slate-900 tracking-tight">
              Selamat Datang di Admin Panel Up Speaking
            </h2>
            <p className="text-xs sm:text-sm text-slate-500 mt-1 max-w-2xl leading-relaxed">
              Pantau rekapitulasi nilai placement test peserta secara real-time, kelola butir pertanyaan bank soal, dan atur konfigurasi durasi tes.
            </p>
          </div>

          <Link
            href="/admin/questions"
            className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-[#0e263e] hover:bg-[#1a385c] text-white font-bold text-xs sm:text-sm transition-colors shadow-xs flex-shrink-0"
          >
            <span>Kelola Bank Soal</span>
            <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
      </div>

      {/* Info Status Task ADM-02 */}
      <div className="p-6 bg-slate-50 border border-slate-200/80 rounded-3xl text-center space-y-2">
        <div className="w-12 h-12 rounded-2xl bg-white border border-slate-200 text-sky-600 flex items-center justify-center mx-auto shadow-2xs">
          <LayoutDashboard className="w-6 h-6" />
        </div>
        <h3 className="text-base font-bold text-slate-900">Layout Admin Panel Telah Siap!</h3>
        <p className="text-xs text-slate-500 max-w-lg mx-auto leading-relaxed">
          Sidebar navigasi responsif (dengan drawer mobile), header dinamis, dan tombol logout terpadu telah aktif.
          4 Kartu Ringkasan Metrik & Tabel Riwayat Hasil Ujian lengkap akan diimplementasikan pada task <strong>ADM-03 & ADM-04</strong>.
        </p>
      </div>
    </div>
  );
}
