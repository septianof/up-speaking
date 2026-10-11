"use client";

import React, { useState, useEffect, useMemo } from "react";
import Link from "next/link";
import {
  Users,
  Award,
  Clock,
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
            Dashboard Pengajar (Tutor)
          </h1>
          <p className="text-sm text-text-muted mt-1">
            Selamat datang, <strong>{staff?.fullName || "Tutor Pengajar"}</strong>. Berikut ringkasan lembar pengerjaan siswa jenjang Anda.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Badge variant="success" size="md">
            🎓 Jenjang Binaan: {tutorLevel === "ELEMENTARY" ? "Elementary (SD)" : "High School (SMP/SMA)"}
          </Badge>
        </div>
      </div>

      {/* 3 Kartu Metrik Jenjang */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {/* Siswa Perlu Dinilai */}
        <div className="p-5 rounded-2xl bg-surface-white border border-surface-border shadow-card flex items-center justify-between">
          <div>
            <p className="text-xs font-semibold uppercase tracking-wider text-amber-700">Perlu Dinilai</p>
            <p className="text-2xl sm:text-3xl font-black text-amber-600 mt-1">{metrics.needEvaluation}</p>
            <p className="text-[11px] text-amber-700/80 mt-1 flex items-center gap-1">
              <Clock className="h-3 w-3" />
              Menunggu penetapan level
            </p>
          </div>
          <div className="h-12 w-12 rounded-2xl bg-amber-50 text-amber-600 flex items-center justify-center shrink-0">
            <Award className="h-6 w-6" />
          </div>
        </div>

        {/* Siswa Selesai Dinilai */}
        <div className="p-5 rounded-2xl bg-surface-white border border-surface-border shadow-card flex items-center justify-between">
          <div>
            <p className="text-xs font-semibold uppercase tracking-wider text-emerald-700">Selesai Dinilai</p>
            <p className="text-2xl sm:text-3xl font-black text-emerald-600 mt-1">{metrics.finalized}</p>
            <p className="text-[11px] text-emerald-700/80 mt-1 flex items-center gap-1">
              <CheckCircle2 className="h-3 w-3" />
              Level resmi telah diterbitkan
            </p>
          </div>
          <div className="h-12 w-12 rounded-2xl bg-emerald-50 text-emerald-600 flex items-center justify-center shrink-0">
            <CheckCircle2 className="h-6 w-6" />
          </div>
        </div>

        {/* Total Peserta Jenjang */}
        <div className="p-5 rounded-2xl bg-surface-white border border-surface-border shadow-card flex items-center justify-between">
          <div>
            <p className="text-xs font-semibold uppercase tracking-wider text-primary-700">Total Peserta</p>
            <p className="text-2xl sm:text-3xl font-black text-primary-600 mt-1">{metrics.total}</p>
            <p className="text-[11px] text-text-muted mt-1 flex items-center gap-1">
              <Users className="h-3 w-3" />
              Peserta terdaftar di jenjang Anda
            </p>
          </div>
          <div className="h-12 w-12 rounded-2xl bg-primary-50 text-primary-600 flex items-center justify-center shrink-0">
            <Users className="h-6 w-6" />
          </div>
        </div>
      </div>

      {/* Baris Tombol Aksi Cepat Tutor (Quick Actions) */}
      <div className="space-y-3">
        <h2 className="text-sm font-bold uppercase tracking-wider text-text-muted">
          Aksi Cepat Pengajar (Tutor Quick Actions)
        </h2>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3.5">
          {/* Penilaian Siswa */}
          <Link
            href="/staff/tutor/evaluations"
            className="flex items-center gap-3.5 p-4 rounded-2xl bg-surface-white border border-surface-border hover:border-emerald-300 hover:shadow-card hover:-translate-y-0.5 transition-all text-left group"
          >
            <div className="h-11 w-11 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center group-hover:bg-emerald-600 group-hover:text-white transition-colors shrink-0">
              <Award className="h-5 w-5" />
            </div>
            <div>
              <p className="text-sm font-bold text-text-primary group-hover:text-emerald-600 transition-colors">
                Evaluasi & Penilaian
              </p>
              <p className="text-xs text-text-muted">Buka lembar pengerjaan siswa</p>
            </div>
          </Link>

          {/* Kelola Bank Soal */}
          <Link
            href="/staff/tutor/questions"
            className="flex items-center gap-3.5 p-4 rounded-2xl bg-surface-white border border-surface-border hover:border-amber-300 hover:shadow-card hover:-translate-y-0.5 transition-all text-left group"
          >
            <div className="h-11 w-11 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center group-hover:bg-amber-600 group-hover:text-white transition-colors shrink-0">
              <HelpCircle className="h-5 w-5" />
            </div>
            <div>
              <p className="text-sm font-bold text-text-primary group-hover:text-amber-600 transition-colors">
                Bank Soal Jenjang
              </p>
              <p className="text-xs text-text-muted">Kurasi soal jenjang binaan</p>
            </div>
          </Link>

          {/* Rekap & Laporan */}
          <Link
            href="/staff/tutor/reports"
            className="flex items-center gap-3.5 p-4 rounded-2xl bg-surface-white border border-surface-border hover:border-primary-300 hover:shadow-card hover:-translate-y-0.5 transition-all text-left group"
          >
            <div className="h-11 w-11 rounded-xl bg-primary-50 text-primary-600 flex items-center justify-center group-hover:bg-primary-600 group-hover:text-white transition-colors shrink-0">
              <FileSpreadsheet className="h-5 w-5" />
            </div>
            <div>
              <p className="text-sm font-bold text-text-primary group-hover:text-primary-600 transition-colors">
                Laporan & Rekap
              </p>
              <p className="text-xs text-text-muted">Ekspor hasil penempatan</p>
            </div>
          </Link>
        </div>
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
            className="inline-flex items-center gap-1.5 text-xs font-bold text-emerald-600 hover:text-emerald-700 hover:underline"
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
                          className="text-xs font-bold px-3 py-1.5 rounded-xl bg-emerald-600 text-white hover:bg-emerald-700 transition-colors shadow-sm"
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
