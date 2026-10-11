"use client";

import React, { useState, useEffect, useMemo } from "react";
import Link from "next/link";
import {
  Users,
  Clock,
  PlayCircle,
  CheckCircle2,
  UserPlus,
  GraduationCap,
  HelpCircle,
  FileSpreadsheet,
  ArrowRight,
  TrendingUp,
} from "lucide-react";
import { Badge } from "@/components/ui/Badge";
import { getActiveStaff } from "@/lib/staff-session";
import { getMockStudents, StudentRecord } from "@/lib/mock-data";
import { StudentRegisterModal } from "@/components/staff/StudentRegisterModal";
import { SessionStatus } from "@/types/student";

export default function AdminDashboardPage() {
  const staff = getActiveStaff();
  const [students, setStudents] = useState<StudentRecord[]>([]);
  const [isRegisterOpen, setIsRegisterOpen] = useState(false);

  const loadData = () => {
    setStudents(getMockStudents());
  };

  useEffect(() => {
    loadData();
  }, []);

  // Metrik ringkasan
  const metrics = useMemo(() => {
    const total = students.length;
    const notStarted = students.filter((s) => s.status === "NOT_STARTED").length;
    const inProgress = students.filter((s) => s.status === "IN_PROGRESS").length;
    const finished = students.filter(
      (s) => s.status === "COMPLETED" || s.status === "FINALIZED"
    ).length;

    return { total, notStarted, inProgress, finished };
  }, [students]);

  const recentStudents = useMemo(() => {
    return [...students]
      .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
      .slice(0, 5);
  }, [students]);

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
        <div className="flex items-center gap-2">
          <Badge variant="primary" size="md">
            🛡️ Hak Akses: Administrator
          </Badge>
        </div>
      </div>

      {/* 4 Kartu Metrik Ringkasan */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Total Siswa */}
        <div className="p-5 rounded-2xl bg-surface-white border border-surface-border shadow-card flex items-center justify-between">
          <div>
            <p className="text-xs font-semibold uppercase tracking-wider text-text-muted">Total Peserta</p>
            <p className="text-2xl sm:text-3xl font-black text-text-primary mt-1">{metrics.total}</p>
            <p className="text-[11px] text-text-muted mt-1 flex items-center gap-1">
              <TrendingUp className="h-3 w-3 text-primary-500" />
              Siswa terdaftar di sistem
            </p>
          </div>
          <div className="h-12 w-12 rounded-2xl bg-primary-50 text-primary-600 flex items-center justify-center shrink-0">
            <Users className="h-6 w-6" />
          </div>
        </div>

        {/* Belum Mulai */}
        <div className="p-5 rounded-2xl bg-surface-white border border-surface-border shadow-card flex items-center justify-between">
          <div>
            <p className="text-xs font-semibold uppercase tracking-wider text-text-muted">Belum Mulai</p>
            <p className="text-2xl sm:text-3xl font-black text-slate-700 mt-1">{metrics.notStarted}</p>
            <p className="text-[11px] text-text-muted mt-1">Menunggu masuk ke tes</p>
          </div>
          <div className="h-12 w-12 rounded-2xl bg-slate-100 text-slate-600 flex items-center justify-center shrink-0">
            <Clock className="h-6 w-6" />
          </div>
        </div>

        {/* Sedang Mengerjakan */}
        <div className="p-5 rounded-2xl bg-surface-white border border-surface-border shadow-card flex items-center justify-between">
          <div>
            <p className="text-xs font-semibold uppercase tracking-wider text-amber-700">Sedang Tes</p>
            <p className="text-2xl sm:text-3xl font-black text-amber-600 mt-1">{metrics.inProgress}</p>
            <p className="text-[11px] text-amber-600/80 mt-1">Sesi aktif berjalan</p>
          </div>
          <div className="h-12 w-12 rounded-2xl bg-amber-50 text-amber-600 flex items-center justify-center shrink-0">
            <PlayCircle className="h-6 w-6" />
          </div>
        </div>

        {/* Selesai / Dinilai */}
        <div className="p-5 rounded-2xl bg-surface-white border border-surface-border shadow-card flex items-center justify-between">
          <div>
            <p className="text-xs font-semibold uppercase tracking-wider text-emerald-700">Selesai</p>
            <p className="text-2xl sm:text-3xl font-black text-emerald-600 mt-1">{metrics.finished}</p>
            <p className="text-[11px] text-emerald-600/80 mt-1">Terkumpul / Dinilai</p>
          </div>
          <div className="h-12 w-12 rounded-2xl bg-emerald-50 text-emerald-600 flex items-center justify-center shrink-0">
            <CheckCircle2 className="h-6 w-6" />
          </div>
        </div>
      </div>

      {/* Baris Tombol Aksi Cepat (Quick Actions) */}
      <div className="space-y-3">
        <h2 className="text-sm font-bold uppercase tracking-wider text-text-muted">
          Aksi Cepat Admin
        </h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3.5">
          {/* Daftarkan Siswa Baru */}
          <button
            type="button"
            onClick={() => setIsRegisterOpen(true)}
            className="flex items-center gap-3.5 p-4 rounded-2xl bg-surface-white border border-surface-border hover:border-primary-300 hover:shadow-card hover:-translate-y-0.5 transition-all text-left group"
          >
            <div className="h-11 w-11 rounded-xl bg-primary-50 text-primary-600 flex items-center justify-center group-hover:bg-primary-500 group-hover:text-white transition-colors shrink-0">
              <UserPlus className="h-5 w-5" />
            </div>
            <div>
              <p className="text-sm font-bold text-text-primary group-hover:text-primary-600 transition-colors">
                Daftarkan Siswa
              </p>
              <p className="text-xs text-text-muted">Tambah peserta tes baru</p>
            </div>
          </button>

          {/* Tambah Akun Tutor */}
          <Link
            href="/staff/admin/tutors"
            className="flex items-center gap-3.5 p-4 rounded-2xl bg-surface-white border border-surface-border hover:border-indigo-300 hover:shadow-card hover:-translate-y-0.5 transition-all text-left group"
          >
            <div className="h-11 w-11 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center group-hover:bg-indigo-600 group-hover:text-white transition-colors shrink-0">
              <GraduationCap className="h-5 w-5" />
            </div>
            <div>
              <p className="text-sm font-bold text-text-primary group-hover:text-indigo-600 transition-colors">
                Tambah Akun Tutor
              </p>
              <p className="text-xs text-text-muted">Daftarkan akun pengajar</p>
            </div>
          </Link>

          {/* Tambah Butir Soal */}
          <Link
            href="/staff/admin/questions"
            className="flex items-center gap-3.5 p-4 rounded-2xl bg-surface-white border border-surface-border hover:border-amber-300 hover:shadow-card hover:-translate-y-0.5 transition-all text-left group"
          >
            <div className="h-11 w-11 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center group-hover:bg-amber-600 group-hover:text-white transition-colors shrink-0">
              <HelpCircle className="h-5 w-5" />
            </div>
            <div>
              <p className="text-sm font-bold text-text-primary group-hover:text-amber-600 transition-colors">
                Kelola Bank Soal
              </p>
              <p className="text-xs text-text-muted">Tambah butir soal dinamis</p>
            </div>
          </Link>

          {/* Rekap & Ekspor Laporan */}
          <Link
            href="/staff/admin/reports"
            className="flex items-center gap-3.5 p-4 rounded-2xl bg-surface-white border border-surface-border hover:border-emerald-300 hover:shadow-card hover:-translate-y-0.5 transition-all text-left group"
          >
            <div className="h-11 w-11 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center group-hover:bg-emerald-600 group-hover:text-white transition-colors shrink-0">
              <FileSpreadsheet className="h-5 w-5" />
            </div>
            <div>
              <p className="text-sm font-bold text-text-primary group-hover:text-emerald-600 transition-colors">
                Buka Laporan
              </p>
              <p className="text-xs text-text-muted">Ekspor Excel & PDF</p>
            </div>
          </Link>
        </div>
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
                <th className="py-3 px-4">Nomor WhatsApp</th>
                <th className="py-3 px-4">Jenjang</th>
                <th className="py-3 px-4">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-surface-border text-xs sm:text-sm">
              {recentStudents.map((std) => (
                <tr key={std.id} className="hover:bg-surface-subtle/30 transition-colors">
                  <td className="py-3 px-4 font-semibold text-text-primary">
                    {std.fullName}
                  </td>
                  <td className="py-3 px-4 font-mono text-xs text-text-secondary">
                    {std.phone}
                  </td>
                  <td className="py-3 px-4">
                    <span className="text-xs font-medium text-text-muted">
                      {std.targetLevel === "ELEMENTARY" ? "Elementary (SD)" : "High School (SMP/SMA)"}
                    </span>
                  </td>
                  <td className="py-3 px-4">
                    {getStatusBadge(std.status)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modal Pendaftaran Siswa */}
      <StudentRegisterModal
        isOpen={isRegisterOpen}
        onClose={() => setIsRegisterOpen(false)}
        onSuccess={() => loadData()}
      />
    </div>
  );
}
