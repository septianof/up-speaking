'use client';

import React, { useEffect, useState, useCallback } from 'react';
import Link from 'next/link';
import {
  LayoutDashboard,
  Users,
  BookOpen,
  TrendingUp,
  Award,
  ArrowRight,
  RefreshCw,
  AlertCircle,
} from 'lucide-react';
import { MetricCard } from '@/components/admin/MetricCard';
import { StudentHistoryTable } from '@/components/admin/StudentHistoryTable';
import {
  getDashboardMetrics,
  getStudentHistory,
  DashboardMetrics,
  StudentHistoryRecord,
} from '@/app/actions/admin';

export default function AdminDashboardPage() {
  const [metrics, setMetrics] = useState<DashboardMetrics | null>(null);
  const [students, setStudents] = useState<StudentHistoryRecord[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [isRefreshing, setIsRefreshing] = useState<boolean>(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const loadDashboardData = useCallback(async (isManualRefresh = false) => {
    if (isManualRefresh) {
      setIsRefreshing(true);
    } else {
      setIsLoading(true);
    }
    setErrorMessage(null);

    try {
      const [metricsRes, studentsRes] = await Promise.all([
        getDashboardMetrics(),
        getStudentHistory(),
      ]);

      if (metricsRes.success) {
        setMetrics(metricsRes.metrics);
      } else {
        setErrorMessage(metricsRes.error || 'Gagal memuat metrik dashboard.');
      }

      if (studentsRes.success) {
        setStudents(studentsRes.data);
      } else {
        setErrorMessage((prev) => prev || studentsRes.error || 'Gagal memuat riwayat siswa.');
      }
    } catch (err) {
      console.error('Gagal mengambil data dashboard:', err);
      setErrorMessage('Terjadi kendala koneksi saat mengambil data dashboard.');
    } finally {
      setIsLoading(false);
      setIsRefreshing(false);
    }
  }, []);

  useEffect(() => {
    loadDashboardData();
  }, [loadDashboardData]);

  return (
    <div className="space-y-6 sm:space-y-8 animate-fade-in">
      {/* Banner Sambutan & Aksi Cepat */}
      <div className="bg-white rounded-3xl border border-slate-100 p-6 sm:p-8 shadow-[0_4px_24px_-4px_rgba(0,0,0,0.04)]">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
          <div className="space-y-1.5">
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-sky-50 text-sky-800 border border-sky-200/80">
              <LayoutDashboard className="w-3.5 h-3.5 text-sky-600" />
              <span>Ringkasan Eksekutif</span>
            </div>
            <h2 className="text-xl sm:text-2xl font-extrabold text-slate-900 tracking-tight">
              Dashboard Rekapitulasi Placement Test
            </h2>
            <p className="text-xs sm:text-sm text-slate-500 max-w-2xl leading-relaxed">
              Pantau distribusi pencapaian siswa per level secara real-time, evaluasi rata-rata nilai, dan kelola izin tes ulang peserta.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2.5 sm:gap-3">
            {/* Tombol Refresh Data Terpadu */}
            <button
              onClick={() => loadDashboardData(true)}
              disabled={isLoading || isRefreshing}
              className="inline-flex items-center gap-2 px-3.5 py-2.5 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 text-slate-700 font-semibold text-xs sm:text-sm transition-colors shadow-2xs disabled:opacity-50"
              title="Segarkan seluruh data dashboard & tabel riwayat"
            >
              <RefreshCw
                className={`w-4 h-4 text-slate-500 ${
                  isRefreshing ? 'animate-spin text-sky-600' : ''
                }`}
              />
              <span>{isRefreshing ? 'Memperbarui...' : 'Segarkan Data'}</span>
            </button>

            {/* Quick Link Bank Soal */}
            <Link
              href="/admin/questions"
              className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-[#0e263e] hover:bg-[#1a385c] text-white font-bold text-xs sm:text-sm transition-colors shadow-xs"
            >
              <span>Bank Soal</span>
              <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
        </div>
      </div>

      {/* Pesan Error (Jika Gagal Fetch) */}
      {errorMessage && (
        <div className="p-4 rounded-2xl bg-rose-50 border border-rose-200 text-rose-800 flex items-start gap-3">
          <AlertCircle className="w-5 h-5 text-rose-600 flex-shrink-0 mt-0.5" />
          <div className="flex-1 text-xs sm:text-sm">
            <p className="font-bold">Gagal Memuat Data</p>
            <p className="mt-0.5 text-rose-700">{errorMessage}</p>
          </div>
          <button
            onClick={() => loadDashboardData()}
            className="text-xs font-bold underline hover:no-underline text-rose-900"
          >
            Coba Lagi
          </button>
        </div>
      )}

      {/* Grid 4 Kartu Ringkasan Metrik (ADM-03) */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
        {/* Kartu 1: Total Peserta */}
        <MetricCard
          title="Total Peserta Ujian"
          value={metrics ? metrics.totalParticipants : 0}
          description="Siswa telah menyelesaikan tes"
          badgeText={
            metrics && metrics.totalParticipants > 0
              ? `Rerata: ${metrics.averageScore}%`
              : undefined
          }
          icon={Users}
          variant="navy"
          isLoading={isLoading}
        />

        {/* Kartu 2: Level Beginner */}
        <MetricCard
          title="Level Beginner"
          value={metrics ? metrics.beginnerCount : 0}
          description="Skor 0% – 49%"
          badgeText={metrics ? `${metrics.beginnerPercent}% Peserta` : undefined}
          icon={BookOpen}
          variant="emerald"
          isLoading={isLoading}
        />

        {/* Kartu 3: Level Intermediate */}
        <MetricCard
          title="Level Intermediate"
          value={metrics ? metrics.intermediateCount : 0}
          description="Skor 50% – 74%"
          badgeText={metrics ? `${metrics.intermediatePercent}% Peserta` : undefined}
          icon={TrendingUp}
          variant="amber"
          isLoading={isLoading}
        />

        {/* Kartu 4: Level Advanced */}
        <MetricCard
          title="Level Advanced"
          value={metrics ? metrics.advancedCount : 0}
          description="Skor 75% – 100%"
          badgeText={metrics ? `${metrics.advancedPercent}% Peserta` : undefined}
          icon={Award}
          variant="indigo"
          isLoading={isLoading}
        />
      </div>

      {/* Tabel Riwayat Hasil Siswa & Rekapitulasi (ADM-04) */}
      <StudentHistoryTable
        data={students}
        isLoading={isLoading}
        isRefreshing={isRefreshing}
        onRefresh={() => loadDashboardData(true)}
      />
    </div>
  );
}
