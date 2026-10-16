"use client";

import React, { useState, useMemo } from "react";
import Link from "next/link";
import useSWR from "swr";
import {
  UserPlus,
  GraduationCap,
  HelpCircle,
  FileSpreadsheet,
  ArrowRight,
  RefreshCw,
} from "lucide-react";
import { Badge } from "@/components/ui/Badge";
import { getActiveStaff } from "@/lib/staff-session";
import { StudentRegisterModal } from "@/components/staff/StudentRegisterModal";
import { TargetLevel, SessionStatus } from "@/types/student";
import { fetcher } from "@/lib/fetcher";

interface RecentStudentItem {
  id: string;
  fullName: string;
  phone: string;
  targetLevel: TargetLevel;
  status: SessionStatus;
  createdAt: string;
}

interface AdminDashboardResponse {
  metrics: {
    total?: number;
    totalStudents?: number;
    notStarted?: number;
    notStartedCount?: number;
    inProgress?: number;
    inProgressCount?: number;
    completed?: number;
    completedCount?: number;
    finalized?: number;
    finalizedCount?: number;
  };
  recentStudents: RecentStudentItem[];
}

export default function AdminDashboardPage() {
  const staff = getActiveStaff();
  const [isRegisterOpen, setIsRegisterOpen] = useState(false);

  const { data, isLoading, isValidating, mutate } = useSWR<AdminDashboardResponse>(
    "/api/admin/dashboard",
    fetcher,
    { revalidateOnFocus: true }
  );

  const metrics = useMemo(() => {
    if (!data?.metrics) {
      return { total: 0, notStarted: 0, inProgress: 0, finished: 0 };
    }
    return {
      total: data.metrics.total ?? data.metrics.totalStudents ?? 0,
      notStarted: data.metrics.notStarted ?? data.metrics.notStartedCount ?? 0,
      inProgress: data.metrics.inProgress ?? data.metrics.inProgressCount ?? 0,
      finished:
        (data.metrics.completed ?? data.metrics.completedCount ?? 0) +
        (data.metrics.finalized ?? data.metrics.finalizedCount ?? 0),
    };
  }, [data]);

  const recentStudents = data?.recentStudents || [];

  const getStatusBadge = (status: SessionStatus) => {
    switch (status) {
      case "NOT_STARTED":
        return <Badge variant="neutral" size="sm">Belum Mulai</Badge>;
      case "IN_PROGRESS":
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-amber-50 text-amber-700 border border-amber-200">
            <span className="h-1.5 w-1.5 rounded-full bg-amber-500 animate-pulse" />
            Sedang Tes
          </span>
        );
      case "COMPLETED":
        return <Badge variant="primary" size="sm">Menunggu Evaluasi</Badge>;
      case "FINALIZED":
        return <Badge variant="success" size="sm">Selesai & Dinilai</Badge>;
      case "RESET":
        return <Badge variant="accent" size="sm">Direset</Badge>;
      default:
        return <Badge variant="neutral" size="sm">{status}</Badge>;
    }
  };

  return (
    <div className="space-y-8">
      {/* Welcome Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 pb-4 border-b border-surface-border">
        <div>
          <h1 className="text-2xl font-black text-text-primary">
            Dashboard Utama Admin
          </h1>
          <p className="text-sm text-text-muted mt-1">
            Selamat datang kembali, <strong>{staff?.fullName || "Administrator"}</strong>. Berikut ringkasan aktivitas tes hari ini.
          </p>
        </div>

        <div className="flex items-center gap-2.5 shrink-0">
          <button
            type="button"
            onClick={() => mutate()}
            disabled={isValidating}
            title="Segarkan data terbaru dari database"
            className="inline-flex items-center gap-1.5 px-3 py-2 text-xs sm:text-sm font-semibold text-text-primary bg-surface-white border border-surface-border rounded-xl hover:bg-slate-50 transition shadow-sm disabled:opacity-50"
          >
            <RefreshCw className={`h-4 w-4 text-text-muted ${isValidating ? "animate-spin text-primary-500" : ""}`} />
            <span>{isValidating ? "Menyinkronkan..." : "Segarkan"}</span>
          </button>
        </div>
      </div>

      {/* 4 Kartu Metrik Ringkasan */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Total Siswa */}
        <div className="p-5 rounded-2xl bg-surface-white border border-surface-border shadow-card">
          <p className="text-xs text-text-muted mb-1">Total Peserta</p>
          <p className="text-2xl sm:text-3xl font-black text-text-primary">{metrics.total}</p>
          <p className="text-[11px] text-text-muted mt-1.5">Siswa terdaftar di sistem</p>
        </div>

        {/* Belum Mulai */}
        <div className="p-5 rounded-2xl bg-surface-white border border-surface-border shadow-card">
          <p className="text-xs text-text-muted mb-1">Belum Mulai</p>
          <p className="text-2xl sm:text-3xl font-black text-text-primary">{metrics.notStarted}</p>
          <p className="text-[11px] text-text-muted mt-1.5">Menunggu masuk ke tes</p>
        </div>

        {/* Sedang Mengerjakan */}
        <div className="p-5 rounded-2xl bg-surface-white border border-surface-border shadow-card">
          <p className="text-xs text-text-muted mb-1">Sedang Tes</p>
          <p className="text-2xl sm:text-3xl font-black text-amber-600">{metrics.inProgress}</p>
          <p className="text-[11px] text-text-muted mt-1.5">Sesi aktif berjalan</p>
        </div>

        {/* Selesai / Dinilai */}
        <div className="p-5 rounded-2xl bg-surface-white border border-surface-border shadow-card">
          <p className="text-xs text-text-muted mb-1">Selesai</p>
          <p className="text-2xl sm:text-3xl font-black text-emerald-600">{metrics.finished}</p>
          <p className="text-[11px] text-text-muted mt-1.5">Terkumpul / Dinilai</p>
        </div>
      </div>

      {/* Baris Tombol Aksi Cepat (Quick Actions) */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3.5">
          {/* Daftarkan Siswa Baru */}
          <button
            type="button"
            onClick={() => setIsRegisterOpen(true)}
            className="flex items-center gap-3.5 p-4 rounded-2xl bg-surface-white border border-surface-border hover:border-primary-200 hover:shadow-card transition-all text-left group"
          >
            <div className="h-10 w-10 rounded-xl bg-primary-50 text-primary-600 flex items-center justify-center shrink-0 group-hover:bg-primary-500 group-hover:text-white transition-colors">
              <UserPlus className="h-4.5 w-4.5" />
            </div>
            <div>
              <p className="text-sm font-bold text-text-primary">
                Daftarkan Siswa
              </p>
              <p className="text-xs text-text-muted">Tambah peserta tes baru</p>
            </div>
          </button>

          {/* Tambah Akun Tutor */}
          <Link
            href="/staff/admin/tutors"
            className="flex items-center gap-3.5 p-4 rounded-2xl bg-surface-white border border-surface-border hover:border-slate-300 hover:shadow-card transition-all text-left group"
          >
            <div className="h-10 w-10 rounded-xl bg-surface-subtle text-text-muted flex items-center justify-center shrink-0 group-hover:bg-slate-200 transition-colors">
              <GraduationCap className="h-4.5 w-4.5" />
            </div>
            <div>
              <p className="text-sm font-bold text-text-primary">
                Tambah Akun Tutor
              </p>
              <p className="text-xs text-text-muted">Daftarkan akun pengajar</p>
            </div>
          </Link>

          {/* Tambah Butir Soal */}
          <Link
            href="/staff/admin/questions"
            className="flex items-center gap-3.5 p-4 rounded-2xl bg-surface-white border border-surface-border hover:border-slate-300 hover:shadow-card transition-all text-left group"
          >
            <div className="h-10 w-10 rounded-xl bg-surface-subtle text-text-muted flex items-center justify-center shrink-0 group-hover:bg-slate-200 transition-colors">
              <HelpCircle className="h-4.5 w-4.5" />
            </div>
            <div>
              <p className="text-sm font-bold text-text-primary">
                Kelola Bank Soal
              </p>
              <p className="text-xs text-text-muted">Tambah butir soal dinamis</p>
            </div>
          </Link>

          {/* Rekap & Ekspor Laporan */}
          <Link
            href="/staff/admin/reports"
            className="flex items-center gap-3.5 p-4 rounded-2xl bg-surface-white border border-surface-border hover:border-slate-300 hover:shadow-card transition-all text-left group"
          >
            <div className="h-10 w-10 rounded-xl bg-surface-subtle text-text-muted flex items-center justify-center shrink-0 group-hover:bg-slate-200 transition-colors">
              <FileSpreadsheet className="h-4.5 w-4.5" />
            </div>
            <div>
              <p className="text-sm font-bold text-text-primary">
                Buka Laporan
              </p>
              <p className="text-xs text-text-muted">Ekspor Excel & PDF</p>
            </div>
          </Link>
        </div>

      {/* Tabel Aktivitas Siswa Terbaru */}
      <div className="rounded-2xl bg-surface-white shadow-card border border-surface-border overflow-hidden">
        <div className="p-5 flex items-center justify-between border-b border-surface-border">
          <div>
            <h2 className="text-base font-bold text-text-primary">Aktivitas Pendaftaran Terbaru</h2>
            <p className="text-xs text-text-muted mt-0.5">5 peserta terakhir yang terdaftar dalam sistem.</p>
          </div>
          <Link
            href="/staff/admin/students"
            className="inline-flex items-center gap-1.5 text-xs font-bold text-primary-600 hover:text-primary-700 hover:underline"
          >
            Lihat Semua Siswa
            <ArrowRight className="h-3.5 w-3.5" />
          </Link>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-surface-subtle/80 border-b border-surface-border text-xs font-bold text-text-muted uppercase tracking-wider">
                <th className="py-3 px-4">Nama Siswa</th>
                <th className="py-3 px-4">Nomor HP</th>
                <th className="py-3 px-4">Jenjang</th>
                <th className="py-3 px-4">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-surface-border text-xs sm:text-sm">
              {isLoading ? (
                <tr>
                  <td colSpan={4} className="py-6 text-center text-text-muted">
                    Memuat aktivitas terbaru...
                  </td>
                </tr>
              ) : recentStudents.length === 0 ? (
                <tr>
                  <td colSpan={4} className="py-8 text-center text-text-muted">
                    <p className="font-medium text-xs">Belum ada data pendaftaran siswa di sistem.</p>
                  </td>
                </tr>
              ) : (
                recentStudents.map((std) => (
                  <tr key={std.id} className="hover:bg-surface-subtle/30 transition-colors">
                    <td className="py-3 px-4 font-semibold text-text-primary">
                      {std.fullName}
                    </td>
                    <td className="py-3 px-4 font-mono text-xs text-text-secondary">
                      {std.phone}
                    </td>
                    <td className="py-3 px-4">
                      <span className="text-xs font-medium text-text-muted">
                        {std.targetLevel === "ELEMENTARY" ? "Elementary" : "High School"}
                      </span>
                    </td>
                    <td className="py-3 px-4">
                      {getStatusBadge(std.status)}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modal Pendaftaran Siswa */}
      <StudentRegisterModal
        isOpen={isRegisterOpen}
        onClose={() => setIsRegisterOpen(false)}
        onSuccess={() => mutate()}
      />
    </div>
  );
}
