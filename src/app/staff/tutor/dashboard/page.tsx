"use client";

import React, { useState, useEffect, useMemo } from "react";
import Link from "next/link";
import {
  Award,
  CheckCircle2,
  HelpCircle,
  FileSpreadsheet,
  ArrowRight,
} from "lucide-react";
import { Badge } from "@/components/ui/Badge";
import { getActiveStaff } from "@/lib/staff-session";
import { getMockStudents, StudentRecord } from "@/lib/mock-data";
import { EvaluationModal } from "@/components/staff/EvaluationModal";
import { TargetLevel } from "@/types/student";

export default function TutorDashboardPage() {
  const staff = getActiveStaff();
  const tutorLevel: TargetLevel = staff?.targetLevel || "ELEMENTARY";

  const [students, setStudents] = useState<StudentRecord[]>([]);
  const [selectedStudent, setSelectedStudent] = useState<StudentRecord | null>(null);

  const loadData = () => {
    setStudents(getMockStudents());
  };

  useEffect(() => {
    loadData();
  }, []);

  // Metrik jenjang yang diampu tutor
  const metrics = useMemo(() => {
    const levelStudents = students.filter((s) => s.targetLevel === tutorLevel);
    const total = levelStudents.length;
    const needEvaluation = levelStudents.filter((s) => s.status === "COMPLETED").length;
    const finalized = levelStudents.filter((s) => s.status === "FINALIZED").length;
    const inProgress = levelStudents.filter((s) => s.status === "IN_PROGRESS").length;

    return { total, needEvaluation, finalized, inProgress };
  }, [students, tutorLevel]);

  // Siswa menunggu evaluasi terbaru
  const pendingStudents = useMemo(() => {
    return students
      .filter((s) => s.targetLevel === tutorLevel && s.status === "COMPLETED")
      .slice(0, 5);
  }, [students, tutorLevel]);

  return (
    <div className="space-y-8">
      {/* Welcome Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 pb-4 border-b border-surface-border">
        <div>
          <h1 className="text-2xl font-black text-text-primary">
            Dashboard Pengajar
          </h1>
          <p className="text-sm text-text-muted mt-1">
            Selamat datang, <strong>{staff?.fullName || "Tutor Pengajar"}</strong>. Berikut ringkasan lembar pengerjaan siswa jenjang Anda.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Badge variant="primary" size="md">
            Jenjang: {tutorLevel === "ELEMENTARY" ? "Elementary (SD)" : "High School (SMP/SMA)"}
          </Badge>
        </div>
      </div>

      {/* 3 Kartu Metrik Jenjang */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {/* Siswa Perlu Dinilai */}
        <div className="p-5 rounded-2xl bg-surface-white border border-surface-border shadow-card">
          <p className="text-xs text-text-muted mb-1">Perlu Dinilai</p>
          <p className="text-2xl sm:text-3xl font-black text-amber-600">{metrics.needEvaluation}</p>
          <p className="text-[11px] text-text-muted mt-1.5">Menunggu penetapan level</p>
        </div>

        {/* Siswa Selesai Dinilai */}
        <div className="p-5 rounded-2xl bg-surface-white border border-surface-border shadow-card">
          <p className="text-xs text-text-muted mb-1">Selesai Dinilai</p>
          <p className="text-2xl sm:text-3xl font-black text-emerald-600">{metrics.finalized}</p>
          <p className="text-[11px] text-text-muted mt-1.5">Level resmi telah diterbitkan</p>
        </div>

        {/* Total Peserta Jenjang */}
        <div className="p-5 rounded-2xl bg-surface-white border border-surface-border shadow-card">
          <p className="text-xs text-text-muted mb-1">Total Peserta</p>
          <p className="text-2xl sm:text-3xl font-black text-text-primary">{metrics.total}</p>
          <p className="text-[11px] text-text-muted mt-1.5">Peserta terdaftar di jenjang Anda</p>
        </div>
      </div>

      {/* Baris Tombol Aksi Cepat Tutor (Quick Actions) */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3.5">
        {/* Penilaian Siswa */}
        <Link
          href="/staff/tutor/evaluations"
          className="flex items-center gap-3.5 p-4 rounded-2xl bg-surface-white border border-surface-border hover:border-primary-200 hover:shadow-card transition-all text-left group"
        >
          <div className="h-10 w-10 rounded-xl bg-primary-50 text-primary-600 flex items-center justify-center shrink-0 group-hover:bg-primary-500 group-hover:text-white transition-colors">
            <Award className="h-4.5 w-4.5" />
          </div>
          <div>
            <p className="text-sm font-bold text-text-primary">
              Evaluasi &amp; Penilaian
            </p>
            <p className="text-xs text-text-muted">Buka lembar pengerjaan siswa</p>
          </div>
        </Link>

        {/* Kelola Bank Soal */}
        <Link
          href="/staff/tutor/questions"
          className="flex items-center gap-3.5 p-4 rounded-2xl bg-surface-white border border-surface-border hover:border-slate-300 hover:shadow-card transition-all text-left group"
        >
          <div className="h-10 w-10 rounded-xl bg-surface-subtle text-text-muted flex items-center justify-center shrink-0 group-hover:bg-slate-200 transition-colors">
            <HelpCircle className="h-4.5 w-4.5" />
          </div>
          <div>
            <p className="text-sm font-bold text-text-primary">
              Bank Soal Jenjang
            </p>
            <p className="text-xs text-text-muted">Kurasi soal jenjang binaan</p>
          </div>
        </Link>

        {/* Rekap & Laporan */}
        <Link
          href="/staff/tutor/reports"
          className="flex items-center gap-3.5 p-4 rounded-2xl bg-surface-white border border-surface-border hover:border-slate-300 hover:shadow-card transition-all text-left group"
        >
          <div className="h-10 w-10 rounded-xl bg-surface-subtle text-text-muted flex items-center justify-center shrink-0 group-hover:bg-slate-200 transition-colors">
            <FileSpreadsheet className="h-4.5 w-4.5" />
          </div>
          <div>
            <p className="text-sm font-bold text-text-primary">
              Laporan &amp; Rekap
            </p>
            <p className="text-xs text-text-muted">Ekspor hasil penempatan</p>
          </div>
        </Link>
      </div>

      {/* Tabel Menunggu Evaluasi */}
      <div className="rounded-2xl bg-surface-white shadow-card border border-surface-border overflow-hidden">
        <div className="p-5 flex items-center justify-between border-b border-surface-border">
          <div>
            <h2 className="text-base font-bold text-text-primary">Lembar Tes Perlu Dinilai Segera</h2>
            <p className="text-xs text-text-muted mt-0.5">Siswa yang telah mengumpulkan tes objektif dan menunggu keputusan level.</p>
          </div>
          <Link
            href="/staff/tutor/evaluations"
            className="inline-flex items-center gap-1.5 text-xs font-bold text-primary-600 hover:text-primary-700 hover:underline"
          >
            Lihat Semua Antrean
            <ArrowRight className="h-3.5 w-3.5" />
          </Link>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-surface-subtle/80 border-b border-surface-border text-xs font-bold text-text-muted uppercase tracking-wider">
                <th className="py-3 px-4">Nama Siswa</th>
                <th className="py-3 px-4">Nomor HP</th>
                <th className="py-3 px-4 text-center">Skor Objektif</th>
                <th className="py-3 px-4 text-center w-32">Aksi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-surface-border text-xs sm:text-sm">
              {pendingStudents.length === 0 ? (
                <tr>
                  <td colSpan={4} className="py-8 text-center text-text-muted">
                    <CheckCircle2 className="h-6 w-6 mx-auto mb-1 text-emerald-500 opacity-60" />
                    <p className="font-medium text-xs">Semua lembar tes yang terkumpul pada jenjang Anda telah selesai dievaluasi!</p>
                  </td>
                </tr>
              ) : (
                pendingStudents.map((std) => {
                  const scorePercent = Math.round(
                    ((std.score || 0) / (std.totalQuestions || 10)) * 100
                  );

                  return (
                    <tr key={std.id} className="hover:bg-surface-subtle/30 transition-colors">
                      <td className="py-3 px-4 font-semibold text-text-primary">
                        {std.fullName}
                      </td>
                      <td className="py-3 px-4 font-mono text-xs text-text-secondary">
                        {std.phone}
                      </td>
                      <td className="py-3 px-4 text-center font-bold text-primary-600">
                        {std.score || 0}/{std.totalQuestions || 10} ({scorePercent}%)
                      </td>
                      <td className="py-3 px-4 text-center">
                        <button
                          type="button"
                          onClick={() => setSelectedStudent(std)}
                          className="text-xs font-semibold px-3 py-1.5 rounded-xl bg-primary-500 text-white hover:bg-primary-600 transition-colors shadow-sm"
                        >
                          Evaluasi
                        </button>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modal Evaluasi */}
      <EvaluationModal
        isOpen={Boolean(selectedStudent)}
        student={selectedStudent}
        onClose={() => setSelectedStudent(null)}
        onSuccess={() => loadData()}
      />
    </div>
  );
}
