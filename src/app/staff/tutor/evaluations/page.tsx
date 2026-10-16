"use client";

import React, { useState, useEffect, useMemo, useCallback } from "react";
import { Search, Award } from "lucide-react";
import { Badge } from "@/components/ui/Badge";
import { Input } from "@/components/ui/Input";
import { EvaluationModal } from "@/components/staff/EvaluationModal";
import { StudentRecord } from "@/lib/mock-data";
import { getActiveStaff } from "@/lib/staff-session";
import { TargetLevel, SessionStatus, FinalLevel } from "@/types/student";

interface ApiEvaluationItem {
  sessionId: string | null;
  studentId: string;
  fullName: string;
  phoneNumber: string;
  targetLevel: TargetLevel;
  sessionStatus: SessionStatus;
  scorePercentage: number | null;
  elapsedSeconds: number;
  assignedLevel?: FinalLevel | null;
  submittedAt?: string | null;
  tutorNotes?: string | null;
  createdAt: string;
}

export default function TutorEvaluationsPage() {
  const staff = getActiveStaff();
  const tutorAssignedLevel: TargetLevel = staff?.targetLevel || "ELEMENTARY";

  const [students, setStudents] = useState<StudentRecord[]>([]);
  const [selectedStatus, setSelectedStatus] = useState<string>("ALL");
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedStudent, setSelectedStudent] = useState<StudentRecord | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const loadData = useCallback(async () => {
    try {
      setIsLoading(true);
      const res = await fetch(
        `/api/tutor/evaluations?level=${tutorAssignedLevel}&_t=${Date.now()}`,
        { cache: "no-store" }
      );
      if (res.ok) {
        const data = await res.json();
        const mapped = ((data.evaluations || []) as ApiEvaluationItem[]).map((e: ApiEvaluationItem) => ({
          id: e.studentId,
          sessionId: e.sessionId || undefined,
          fullName: e.fullName,
          phone: e.phoneNumber,
          targetLevel: e.targetLevel,
          status: e.sessionStatus,
          score: e.scorePercentage !== null ? Math.round(((e.scorePercentage || 0) / 100) * 10) : undefined,
          totalQuestions: 10,
          elapsedSeconds: e.elapsedSeconds,
          finalLevel: e.assignedLevel || undefined,
          submittedAt: e.submittedAt || undefined,
          notes: e.tutorNotes || undefined,
          createdAt: e.createdAt || new Date().toISOString(),
        }));
        setStudents(mapped);
      }
    } catch (err) {
      console.error("Error loading tutor evaluations:", err);
    } finally {
      setIsLoading(false);
    }
  }, [tutorAssignedLevel]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  // Filter siswa berdasarkan pencarian dan status sesi
  const filteredStudents = useMemo(() => {
    return students.filter((std) => {
      const matchSearch =
        std.fullName.toLowerCase().includes(searchQuery.toLowerCase()) ||
        std.phone.includes(searchQuery);

      const matchStatus =
        selectedStatus === "ALL" || std.status === selectedStatus;

      return matchSearch && matchStatus;
    });
  }, [students, searchQuery, selectedStatus]);

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
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 pb-2 border-b border-surface-border">
        <div>
          <h1 className="text-2xl font-black text-text-primary">
            Penilaian &amp; Evaluasi Siswa
          </h1>
          <p className="text-sm text-text-muted mt-1">
            Peninjauan hasil lembar placement test dan penetapan level resmi siswa.
          </p>
        </div>

        {/* Badge Jenjang Pengampu Terkunci */}
        <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-xl bg-surface-subtle border border-surface-border self-start sm:self-auto">
          <span className="text-xs text-text-muted">Jenjang:</span>
          <span className="text-xs font-bold text-primary-700">
            {tutorAssignedLevel === "ELEMENTARY" ? "Elementary" : "High School"}
          </span>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="space-y-3">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
          {/* Search Input */}
          <div className="md:col-span-2 relative">
            <Input
              type="text"
              placeholder="Cari berdasarkan nama siswa atau nomor HP..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10 text-xs sm:text-sm"
            />
            <Search className="absolute left-3.5 top-3 h-4 w-4 text-text-muted pointer-events-none" />
          </div>

          {/* Status Filter Dropdown */}
          <div>
            <select
              value={selectedStatus}
              onChange={(e) => setSelectedStatus(e.target.value)}
              className="w-full rounded-xl border border-surface-border bg-surface-white px-3 py-2 text-xs sm:text-sm font-medium text-text-primary focus:outline-none focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500"
            >
              <option value="ALL">Semua Status Sesi</option>
              <option value="NOT_STARTED">Belum Mulai</option>
              <option value="IN_PROGRESS">Sedang Mengerjakan</option>
              <option value="COMPLETED">Perlu Dinilai</option>
              <option value="FINALIZED">Selesai Dinilai</option>
            </select>
          </div>
        </div>

        {/* Info count and Reset */}
        <div className="flex items-center justify-between text-xs text-text-muted pt-1">
          <span>
            Menampilkan <strong>{filteredStudents.length}</strong> dari <strong>{students.length}</strong> siswa
          </span>
          {(searchQuery || selectedStatus !== "ALL") && (
            <button
              type="button"
              onClick={() => {
                setSearchQuery("");
                setSelectedStatus("ALL");
              }}
              className="text-xs text-primary-600 hover:underline font-semibold"
            >
              Reset Filter
            </button>
          )}
        </div>
      </div>

      {/* Table */}
      <div className="rounded-2xl bg-surface-white shadow-card border border-surface-border overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-surface-subtle/80 border-b border-surface-border text-xs font-bold text-text-muted uppercase tracking-wider">
                <th className="py-3.5 px-4 w-12 text-center">No</th>
                <th className="py-3.5 px-4">Nama Siswa</th>
                <th className="py-3.5 px-4">Nomor HP</th>
                <th className="py-3.5 px-4 text-center">Status Sesi</th>
                <th className="py-3.5 px-4 text-center">Skor Objektif</th>
                <th className="py-3.5 px-4 text-center">Level Final</th>
                <th className="py-3.5 px-4 text-center w-36">Aksi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-surface-border text-xs sm:text-sm">
              {isLoading ? (
                <tr>
                  <td colSpan={7} className="py-12 text-center text-text-muted">
                    <p className="font-medium">Memuat data siswa...</p>
                  </td>
                </tr>
              ) : filteredStudents.length === 0 ? (
                <tr>
                  <td colSpan={7} className="py-12 text-center text-text-muted">
                    <Award className="h-8 w-8 mx-auto mb-2 opacity-30" />
                    {searchQuery.trim() || selectedStatus !== "ALL" ? (
                      <div>
                        <p className="font-medium text-sm">Tidak ada siswa yang cocok dengan filter pencarian.</p>
                        <button
                          type="button"
                          onClick={() => {
                            setSearchQuery("");
                            setSelectedStatus("ALL");
                          }}
                          className="mt-2 text-xs text-primary-600 hover:underline font-semibold"
                        >
                          Reset Filter
                        </button>
                      </div>
                    ) : (
                      <p className="font-medium text-sm">
                        Belum ada siswa yang terdaftar pada jenjang ini.
                      </p>
                    )}
                  </td>
                </tr>
              ) : (
                filteredStudents.map((std, idx) => {
                  const hasScore = typeof std.score === "number";
                  const scorePercent = hasScore
                    ? Math.round(((std.score || 0) / (std.totalQuestions || 10)) * 100)
                    : 0;

                  return (
                    <tr
                      key={std.id}
                      className="hover:bg-surface-subtle/40 transition-colors"
                    >
                      <td className="py-3.5 px-4 text-center font-mono text-text-muted text-xs">
                        {idx + 1}
                      </td>
                      <td className="py-3.5 px-4">
                        <div className="font-bold text-text-primary">{std.fullName}</div>
                      </td>
                      <td className="py-3.5 px-4 font-mono text-xs text-text-secondary">
                        {std.phone}
                      </td>
                      <td className="py-3.5 px-4 text-center">
                        {getStatusBadge(std.status)}
                      </td>
                      <td className="py-3.5 px-4 text-center">
                        {hasScore ? (
                          <>
                            <span className="font-black text-primary-600">
                              {std.score}/{std.totalQuestions || 10}
                            </span>
                            <span className="text-xs text-text-muted ml-1">({scorePercent}%)</span>
                          </>
                        ) : (
                          <span className="text-text-muted">-</span>
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
                        ) : std.status === "COMPLETED" ? (
                          <span className="text-xs text-text-muted italic">Belum ditetapkan</span>
                        ) : (
                          <span className="text-text-muted">-</span>
                        )}
                      </td>
                      <td className="py-3.5 px-4 text-center">
                        {std.status === "COMPLETED" ? (
                          <button
                            type="button"
                            onClick={() => setSelectedStudent(std)}
                            className="text-xs font-bold px-3 py-1.5 rounded-xl transition-all shadow-xs bg-primary-500 text-white hover:bg-primary-600"
                          >
                            Evaluasi
                          </button>
                        ) : std.status === "FINALIZED" ? (
                          <button
                            type="button"
                            onClick={() => setSelectedStudent(std)}
                            className="text-xs font-bold px-3 py-1.5 rounded-xl transition-all shadow-xs bg-surface-subtle text-text-primary border border-surface-border hover:bg-slate-200"
                          >
                            Ubah Evaluasi
                          </button>
                        ) : (
                          <span className="text-xs text-text-muted font-medium">-</span>
                        )}
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
        onSuccess={() => {
          loadData();
        }}
      />
    </div>
  );
}
