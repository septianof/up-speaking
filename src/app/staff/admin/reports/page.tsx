"use client";

import React, { useState, useEffect, useMemo } from "react";
import {
  FileSpreadsheet,
  Download,
  Printer,
  Search,
  Users,
  Award,
  GraduationCap,
} from "lucide-react";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";
import { Input } from "@/components/ui/Input";
import { getMockStudents, StudentRecord } from "@/lib/mock-data";
import { exportStudentsToCsv, printPdfDocument } from "@/lib/export-utils";
import { TargetLevel } from "@/types/student";

export default function AdminReportsPage() {
  const [students, setStudents] = useState<StudentRecord[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedLevel, setSelectedLevel] = useState<string>("ALL");
  const [selectedFinalLevel, setSelectedFinalLevel] = useState<string>("ALL");

  useEffect(() => {
    setStudents(getMockStudents());
  }, []);

  const filteredStudents = useMemo(() => {
    return students.filter((std) => {
      const matchSearch =
        std.fullName.toLowerCase().includes(searchQuery.toLowerCase()) ||
        std.phone.includes(searchQuery);

      const matchLevel =
        selectedLevel === "ALL" || std.targetLevel === selectedLevel;

      const matchFinalLevel =
        selectedFinalLevel === "ALL" ||
        (selectedFinalLevel === "NONE" && !std.finalLevel) ||
        std.finalLevel === selectedFinalLevel;

      return matchSearch && matchLevel && matchFinalLevel;
    });
  }, [students, searchQuery, selectedLevel, selectedFinalLevel]);

  // Statistik Ringkas
  const stats = useMemo(() => {
    const evaluated = filteredStudents.filter((s) => s.finalLevel);
    const avgScore = evaluated.length
      ? Math.round(
          evaluated.reduce((acc, curr) => acc + (curr.score || 0), 0) /
            evaluated.length *
            10
        )
      : 0;

    return {
      total: filteredStudents.length,
      evaluatedCount: evaluated.length,
      avgPercent: avgScore,
    };
  }, [filteredStudents]);

  const handleExportExcel = () => {
    exportStudentsToCsv(
      filteredStudents,
      `Rekap_Hasil_Tes_Penempatan_UpSpeaking_${new Date().toISOString().slice(0, 10)}`
    );
  };

  const getLevelBadge = (level: TargetLevel) => {
    if (level === "ELEMENTARY") {
      return (
        <span className="inline-flex items-center gap-1 text-xs font-semibold text-primary-700 bg-primary-50 px-2.5 py-0.5 rounded-md border border-primary-100">
          <GraduationCap className="h-3.5 w-3.5" />
          Elementary
        </span>
      );
    }
    return (
      <span className="inline-flex items-center gap-1 text-xs font-semibold text-indigo-700 bg-indigo-50 px-2.5 py-0.5 rounded-md border border-indigo-100">
        <GraduationCap className="h-3.5 w-3.5" />
        High School
      </span>
    );
  };

  return (
    <div className="space-y-6">
      {/* Header and Export Actions */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 pb-2 border-b border-surface-border">
        <div>
          <h1 className="text-2xl font-black text-text-primary flex items-center gap-2.5">
            <FileSpreadsheet className="h-7 w-7 text-emerald-600" />
            Hasil & Laporan Keseluruhan (SCR-008)
          </h1>
          <p className="text-sm text-text-muted mt-1">
            Rekapitulasi resmi hasil penempatan seluruh jenjang, statistik capaian skor, dan ekspor dokumen.
          </p>
        </div>

        {/* Action Bar Ekspor */}
        <div className="flex items-center gap-2.5 shrink-0">
          <Button
            type="button"
            variant="outline"
            size="md"
            onClick={printPdfDocument}
            className="gap-2"
          >
            <Printer className="h-4 w-4" />
            Export PDF
          </Button>

          <Button
            type="button"
            variant="primary"
            size="md"
            onClick={handleExportExcel}
            className="gap-2 bg-emerald-600 hover:bg-emerald-700 focus:ring-emerald-400 text-white"
          >
            <Download className="h-4 w-4" />
            Export Excel (.csv)
          </Button>
        </div>
      </div>

      {/* Mini Stats Banner */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="p-4 rounded-2xl bg-surface-white border border-surface-border shadow-card flex items-center justify-between">
          <div>
            <p className="text-xs font-semibold text-text-muted uppercase tracking-wider">Total Siswa Terfilter</p>
            <p className="text-2xl font-black text-text-primary mt-0.5">{stats.total}</p>
          </div>
          <div className="h-10 w-10 rounded-xl bg-primary-50 text-primary-600 flex items-center justify-center">
            <Users className="h-5 w-5" />
          </div>
        </div>

        <div className="p-4 rounded-2xl bg-surface-white border border-surface-border shadow-card flex items-center justify-between">
          <div>
            <p className="text-xs font-semibold text-text-muted uppercase tracking-wider">Selesai Difinalisasi</p>
            <p className="text-2xl font-black text-emerald-600 mt-0.5">{stats.evaluatedCount}</p>
          </div>
          <div className="h-10 w-10 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center">
            <Award className="h-5 w-5" />
          </div>
        </div>

        <div className="p-4 rounded-2xl bg-surface-white border border-surface-border shadow-card flex items-center justify-between">
          <div>
            <p className="text-xs font-semibold text-text-muted uppercase tracking-wider">Rata-rata Skor %</p>
            <p className="text-2xl font-black text-indigo-600 mt-0.5">{stats.avgPercent}%</p>
          </div>
          <div className="h-10 w-10 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center">
            <FileSpreadsheet className="h-5 w-5" />
          </div>
        </div>
      </div>

      {/* Filter and Search */}
      <div className="rounded-2xl bg-surface-white p-4 shadow-card border border-surface-border space-y-3">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
          <div className="md:col-span-2 relative">
            <Input
              type="text"
              placeholder="Cari nama siswa atau nomor telepon..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10 text-xs sm:text-sm"
            />
            <Search className="absolute left-3.5 top-3 h-4 w-4 text-text-muted pointer-events-none" />
          </div>

          <div>
            <select
              value={selectedLevel}
              onChange={(e) => setSelectedLevel(e.target.value)}
              className="w-full rounded-xl border border-surface-border bg-surface-white px-3 py-2 text-xs sm:text-sm font-medium text-text-primary focus:outline-none focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500"
            >
              <option value="ALL">Semua Jenjang</option>
              <option value="ELEMENTARY">Elementary (SD)</option>
              <option value="HIGH_SCHOOL">High School (SMP/SMA)</option>
            </select>
          </div>

          <div>
            <select
              value={selectedFinalLevel}
              onChange={(e) => setSelectedFinalLevel(e.target.value)}
              className="w-full rounded-xl border border-surface-border bg-surface-white px-3 py-2 text-xs sm:text-sm font-medium text-text-primary focus:outline-none focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500"
            >
              <option value="ALL">Semua Level Final</option>
              <option value="BEGINNER">Beginner</option>
              <option value="INTERMEDIATE">Intermediate</option>
              <option value="ADVANCED">Advanced</option>
              <option value="NONE">Belum Ditetapkan</option>
            </select>
          </div>
        </div>
      </div>

      {/* Report Table */}
      <div className="rounded-2xl bg-surface-white shadow-card border border-surface-border overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-surface-subtle/80 border-b border-surface-border text-xs font-bold text-text-muted uppercase tracking-wider">
                <th className="py-3.5 px-4 w-12 text-center">No</th>
                <th className="py-3.5 px-4">Nama Siswa</th>
                <th className="py-3.5 px-4">Nomor HP</th>
                <th className="py-3.5 px-4">Jenjang</th>
                <th className="py-3.5 px-4 text-center">Skor Objektif</th>
                <th className="py-3.5 px-4 text-center">Level Final Resmi</th>
                <th className="py-3.5 px-4">Catatan Evaluasi Tutor</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-surface-border text-xs sm:text-sm">
              {filteredStudents.length === 0 ? (
                <tr>
                  <td colSpan={7} className="py-12 text-center text-text-muted">
                    <FileSpreadsheet className="h-8 w-8 mx-auto mb-2 opacity-30" />
                    <p className="font-medium">Tidak ada data hasil pengerjaan siswa yang sesuai filter.</p>
                  </td>
                </tr>
              ) : (
                filteredStudents.map((std, idx) => {
                  const scorePercent = std.totalQuestions
                    ? Math.round(((std.score || 0) / std.totalQuestions) * 100)
                    : 0;

                  return (
                    <tr key={std.id} className="hover:bg-surface-subtle/40 transition-colors">
                      <td className="py-3.5 px-4 text-center font-mono text-text-muted text-xs">
                        {idx + 1}
                      </td>
                      <td className="py-3.5 px-4 font-bold text-text-primary">
                        {std.fullName}
                      </td>
                      <td className="py-3.5 px-4 font-mono text-xs text-text-secondary">
                        {std.phone}
                      </td>
                      <td className="py-3.5 px-4">
                        {getLevelBadge(std.targetLevel)}
                      </td>
                      <td className="py-3.5 px-4 text-center">
                        <span className="font-bold text-primary-600">
                          {std.score !== undefined ? `${std.score}/${std.totalQuestions || 10}` : "-"}
                        </span>
                        {std.score !== undefined && (
                          <span className="text-xs text-text-muted ml-1">({scorePercent}%)</span>
                        )}
                      </td>
                      <td className="py-3.5 px-4 text-center">
                        {std.finalLevel ? (
                          <Badge
                            variant={
                              std.finalLevel === "ADVANCED"
                                ? "success"
                                : std.finalLevel === "INTERMEDIATE"
                                ? "primary"
                                : "warning"
                            }
                            size="sm"
                          >
                            {std.finalLevel}
                          </Badge>
                        ) : (
                          <span className="text-xs text-text-muted italic">Belum Dinilai</span>
                        )}
                      </td>
                      <td className="py-3.5 px-4 text-xs text-text-secondary max-w-xs truncate">
                        {std.notes || "-"}
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
