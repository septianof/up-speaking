"use client";

import React, { useState, useEffect, useMemo, useCallback } from "react";
import { Download, Printer, Search } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";
import { Input } from "@/components/ui/Input";
import { getActiveStaff } from "@/lib/staff-session";
import { exportReportsToExcel, ReportItem } from "@/lib/export/excel-generator";
import { exportReportsToPdf } from "@/lib/export/pdf-generator";
import { TargetLevel } from "@/types/student";

export default function TutorReportsPage() {
  const staff = getActiveStaff();
  const tutorLevel: TargetLevel = staff?.targetLevel || "ELEMENTARY";

  const [reports, setReports] = useState<ReportItem[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedFinalLevel, setSelectedFinalLevel] = useState<string>("ALL");
  const [isLoading, setIsLoading] = useState(true);

  const loadData = useCallback(async () => {
    try {
      setIsLoading(true);
      const res = await fetch(`/api/admin/reports?level=${tutorLevel}`);
      if (res.ok) {
        const data = await res.json();
        setReports(data.reports || []);
      }
    } catch (err) {
      console.error("Error loading tutor reports:", err);
    } finally {
      setIsLoading(false);
    }
  }, [tutorLevel]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const filteredReports = useMemo(() => {
    return reports.filter((r) => {
      const matchSearch =
        r.fullName.toLowerCase().includes(searchQuery.toLowerCase()) ||
        r.phoneNumber.includes(searchQuery);

      const matchFinalLevel =
        selectedFinalLevel === "ALL" ||
        (selectedFinalLevel === "NONE" && !r.assignedLevel) ||
        r.assignedLevel === selectedFinalLevel;

      return matchSearch && matchFinalLevel;
    });
  }, [reports, searchQuery, selectedFinalLevel]);

  const stats = useMemo(() => {
    const evaluated = filteredReports.filter((s) => s.assignedLevel);
    const avgScore = evaluated.length
      ? Math.round(
          evaluated.reduce((acc, curr) => acc + (curr.scorePercentage || 0), 0) /
            evaluated.length
        )
      : 0;

    return {
      total: filteredReports.length,
      evaluatedCount: evaluated.length,
      avgPercent: avgScore,
    };
  }, [filteredReports]);

  const handleExportExcel = () => {
    const levelLabel = tutorLevel === "ELEMENTARY" ? "Elementary" : "HighSchool";
    exportReportsToExcel(filteredReports, {
      title: `Laporan Hasil Placement Test Siswa - Jenjang ${tutorLevel === "ELEMENTARY" ? "Elementary (SD)" : "High School"}`,
      filename: `Rekap_Placement_Test_${levelLabel}_${new Date().toISOString().slice(0, 10)}`,
    });
  };

  const handleExportPdf = () => {
    const levelLabel = tutorLevel === "ELEMENTARY" ? "Elementary" : "HighSchool";
    exportReportsToPdf(filteredReports, {
      title: `Laporan Hasil Placement Test Siswa - Jenjang ${tutorLevel === "ELEMENTARY" ? "Elementary (SD)" : "High School"}`,
      filename: `Rekap_Placement_Test_${levelLabel}_${new Date().toISOString().slice(0, 10)}`,
    });
  };

  return (
    <div className="space-y-6">
      {/* Header and Export Actions */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 pb-2 border-b border-surface-border">
        <div>
          <h1 className="text-2xl font-black text-text-primary">
            Laporan Hasil Placement Test {tutorLevel === "ELEMENTARY" ? "Elementary" : "High School"}
          </h1>
          <p className="text-sm text-text-muted mt-1">
            Rekapitulasi penetapan level kelas siswa khusus untuk jenjang binaan Anda.
          </p>
        </div>

        {/* Action Bar Ekspor */}
        <div className="flex items-center gap-2.5 shrink-0">
          <Button
            type="button"
            variant="outline"
            size="md"
            onClick={handleExportPdf}
            disabled={filteredReports.length === 0 || isLoading}
            className="gap-2"
          >
            <Printer className="h-4 w-4" />
            Export PDF (.pdf)
          </Button>

          <Button
            type="button"
            variant="primary"
            size="md"
            onClick={handleExportExcel}
            disabled={filteredReports.length === 0 || isLoading}
            className="gap-2"
          >
            <Download className="h-4 w-4" />
            Export Excel (.xlsx)
          </Button>
        </div>
      </div>

      {/* Mini Stats Banner */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="p-4 rounded-2xl bg-surface-white border border-surface-border shadow-card">
          <p className="text-xs text-text-muted mb-0.5">Total Siswa Selesai Tes</p>
          <p className="text-2xl font-black text-text-primary">{stats.total}</p>
        </div>

        <div className="p-4 rounded-2xl bg-surface-white border border-surface-border shadow-card">
          <p className="text-xs text-text-muted mb-0.5">Telah Difinalisasi</p>
          <p className="text-2xl font-black text-emerald-600">{stats.evaluatedCount}</p>
        </div>

        <div className="p-4 rounded-2xl bg-surface-white border border-surface-border shadow-card">
          <p className="text-xs text-text-muted mb-0.5">Rata-rata Skor Terfinalisasi</p>
          <p className="text-2xl font-black text-primary-600">{stats.avgPercent}%</p>
        </div>
      </div>

      {/* Filter and Search */}
      <div className="space-y-3">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
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
              value={selectedFinalLevel}
              onChange={(e) => setSelectedFinalLevel(e.target.value)}
              className="w-full rounded-xl border border-surface-border bg-surface-white px-3 py-2 text-xs sm:text-sm font-medium text-text-primary focus:outline-none focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500"
            >
              <option value="ALL">Semua Level Final</option>
              <option value="BEGINNER">Beginner</option>
              <option value="INTERMEDIATE">Intermediate</option>
              <option value="ADVANCED">Advanced</option>
              <option value="NONE">Menunggu Penilaian</option>
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
                <th className="py-3.5 px-4 text-center">Skor Objektif</th>
                <th className="py-3.5 px-4 text-center">Level Final Resmi</th>
                <th className="py-3.5 px-4 text-center">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-surface-border text-xs sm:text-sm">
              {isLoading ? (
                <tr>
                  <td colSpan={6} className="py-12 text-center text-text-muted">
                    <p className="font-medium">Memuat data rekap jenjang...</p>
                  </td>
                </tr>
              ) : reports.length === 0 ? (
                <tr>
                  <td colSpan={6} className="py-12 text-center text-text-muted">
                    <p className="font-semibold text-text-primary text-sm mb-1">Belum ada data pengerjaan siswa pada jenjang ini.</p>
                    <p className="text-xs text-text-muted">Rekapitulasi nilai dan status placement test akan terisi setelah siswa mengikuti tes.</p>
                  </td>
                </tr>
              ) : filteredReports.length === 0 ? (
                <tr>
                  <td colSpan={6} className="py-12 text-center text-text-muted">
                    <p className="font-medium text-sm">Tidak ada data siswa yang cocok dengan filter pencarian.</p>
                    <button
                      type="button"
                      onClick={() => {
                        setSearchQuery("");
                        setSelectedFinalLevel("ALL");
                      }}
                      className="mt-2 text-xs text-primary-600 hover:underline font-semibold"
                    >
                      Reset Filter Pencarian
                    </button>
                  </td>
                </tr>
              ) : (
                filteredReports.map((r, idx) => {
                  return (
                    <tr key={r.studentId} className="hover:bg-surface-subtle/40 transition-colors">
                      <td className="py-3.5 px-4 text-center font-mono text-text-muted text-xs">
                        {idx + 1}
                      </td>
                      <td className="py-3.5 px-4 font-bold text-text-primary">
                        {r.fullName}
                      </td>
                      <td className="py-3.5 px-4 font-mono text-xs text-text-secondary">
                        {r.phoneNumber}
                      </td>
                      <td className="py-3.5 px-4 text-center">
                        <span className="font-bold text-primary-600">
                          {r.scorePercentage !== null && r.scorePercentage !== undefined
                            ? `${Math.round(r.scorePercentage)}%`
                            : "-"}
                        </span>
                      </td>
                      <td className="py-3.5 px-4 text-center">
                        {r.assignedLevel ? (
                          <Badge
                            variant={
                              r.assignedLevel === "ADVANCED"
                                ? "success"
                                : r.assignedLevel === "INTERMEDIATE"
                                ? "primary"
                                : "warning"
                            }
                            size="sm"
                          >
                            {r.assignedLevel}
                          </Badge>
                        ) : (
                          <span className="inline-flex items-center text-xs font-semibold text-amber-700 bg-amber-50 px-2.5 py-1 rounded-full border border-amber-200">
                            Menunggu Penilaian
                          </span>
                        )}
                      </td>
                      <td className="py-3.5 px-4 text-center">
                        <span className="text-xs font-medium text-text-muted">
                          {r.sessionStatus === "FINALIZED"
                            ? "Selesai"
                            : "Perlu Dinilai"}
                        </span>
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
