"use client";

import React, { useState, useEffect, useMemo, useCallback } from "react";
import {
  Award,
  Search,
  CheckCircle2,
  Clock,
} from "lucide-react";
import { Badge } from "@/components/ui/Badge";
import { Input } from "@/components/ui/Input";
import { EvaluationModal } from "@/components/staff/EvaluationModal";
import { StudentRecord } from "@/lib/mock-data";
import { getActiveStaff } from "@/lib/staff-session";
import { TargetLevel, SessionStatus, FinalLevel } from "@/types/student";

interface ApiEvaluationItem {
  sessionId: string;
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
  const tutorAssignedLevel: TargetLevel =
    staff?.targetLevel || "ELEMENTARY";

  const [students, setStudents] = useState<StudentRecord[]>([]);
  const [activeTab, setActiveTab] = useState<"PENDING" | "FINALIZED">("PENDING");
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
          sessionId: e.sessionId,
          fullName: e.fullName,
          phone: e.phoneNumber,
          targetLevel: e.targetLevel,
          status: e.sessionStatus,
          score: Math.round(((e.scorePercentage || 0) / 100) * 10),
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

  // Filter siswa: sesuai jenjang yang diampu tutor dan tab aktif
  const filteredStudents = useMemo(() => {
    return students
      .filter((std) => {
        // Filter jenjang tutor
        const matchLevel = std.targetLevel === tutorAssignedLevel;

        // Filter tab: PENDING (COMPLETED) vs FINALIZED
        const matchStatus =
          activeTab === "PENDING"
            ? std.status === "COMPLETED"
            : std.status === "FINALIZED";

        // Filter search
        const matchSearch =
          std.fullName.toLowerCase().includes(searchQuery.toLowerCase()) ||
          std.phone.includes(searchQuery);

        return matchLevel && matchStatus && matchSearch;
      });
  }, [students, tutorAssignedLevel, activeTab, searchQuery]);

  const pendingCount = useMemo(() => {
    return students.filter(
      (s) => s.targetLevel === tutorAssignedLevel && s.status === "COMPLETED"
    ).length;
  }, [students, tutorAssignedLevel]);

  const finalizedCount = useMemo(() => {
    return students.filter(
      (s) => s.targetLevel === tutorAssignedLevel && s.status === "FINALIZED"
    ).length;
  }, [students, tutorAssignedLevel]);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 pb-2 border-b border-surface-border">
        <div>
          <h1 className="text-2xl font-black text-text-primary">
            Penilaian &amp; Evaluasi Siswa
          </h1>
          <p className="text-sm text-text-muted mt-1">
            Peninjauan hasil lembar placement test dan penetapan level resmi siswa.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Badge variant="primary" size="md">
            Jenjang: {tutorAssignedLevel === "ELEMENTARY" ? "Elementary" : "High School"}
          </Badge>
        </div>
      </div>

      {/* Filter Tabs and Search Bar */}
      <div className="space-y-4">
        {/* Tabs */}
        <div className="flex items-center gap-2 border-b border-surface-border pb-3">
          <button
            type="button"
            onClick={() => setActiveTab("PENDING")}
            className={`px-4 py-2 rounded-xl text-xs sm:text-sm font-bold transition-all flex items-center gap-2 ${
              activeTab === "PENDING"
                ? "bg-primary-500 text-white shadow-sm"
                : "bg-surface-subtle text-text-muted hover:text-text-primary"
            }`}
          >
            <Clock className="h-4 w-4" />
            Perlu Dinilai
            <span
              className={`px-2 py-0.5 rounded-full text-xs font-black ${
                activeTab === "PENDING"
                  ? "bg-white/20 text-white"
                  : "bg-primary-100 text-primary-700"
              }`}
            >
              {pendingCount}
            </span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab("FINALIZED")}
            className={`px-4 py-2 rounded-xl text-xs sm:text-sm font-bold transition-all flex items-center gap-2 ${
              activeTab === "FINALIZED"
                ? "bg-primary-500 text-white shadow-sm"
                : "bg-surface-subtle text-text-muted hover:text-text-primary"
            }`}
          >
            <CheckCircle2 className="h-4 w-4" />
            Selesai Dinilai
            <span
              className={`px-2 py-0.5 rounded-full text-xs font-black ${
                activeTab === "FINALIZED"
                  ? "bg-white/20 text-white"
                  : "bg-surface-subtle text-text-muted"
              }`}
            >
              {finalizedCount}
            </span>
          </button>
        </div>

        {/* Search */}
        <div className="relative">
          <Input
            type="text"
            placeholder="Cari berdasarkan nama siswa atau nomor HP..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10 text-xs sm:text-sm"
          />
          <Search className="absolute left-3.5 top-3 h-4 w-4 text-text-muted pointer-events-none" />
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
                <th className="py-3.5 px-4 text-center">Skor Objektif</th>
                <th className="py-3.5 px-4 text-center">Level Final</th>
                <th className="py-3.5 px-4 text-center w-36">Aksi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-surface-border text-xs sm:text-sm">
              {isLoading ? (
                <tr>
                  <td colSpan={6} className="py-12 text-center text-text-muted">
                    <p className="font-medium">Memuat antrean evaluasi...</p>
                  </td>
                </tr>
              ) : filteredStudents.length === 0 ? (
                <tr>
                  <td colSpan={6} className="py-12 text-center text-text-muted">
                    <Award className="h-8 w-8 mx-auto mb-2 opacity-30" />
                    {searchQuery.trim() ? (
                      <div>
                        <p className="font-medium text-sm">Tidak ada siswa yang cocok dengan filter pencarian.</p>
                        <button
                          type="button"
                          onClick={() => setSearchQuery("")}
                          className="mt-2 text-xs text-primary-600 hover:underline font-semibold"
                        >
                          Reset Pencarian
                        </button>
                      </div>
                    ) : (
                      <p className="font-medium text-sm">
                        {activeTab === "PENDING"
                          ? "Belum ada lembar tes siswa yang menunggu evaluasi saat ini."
                          : "Belum ada siswa yang telah difinalisasi pada jenjang ini."}
                      </p>
                    )}
                  </td>
                </tr>
              ) : (
                filteredStudents.map((std, idx) => {
                  const scorePercent = Math.round(
                    ((std.score || 0) / (std.totalQuestions || 10)) * 100
                  );

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
                        <span className="font-black text-primary-600">
                          {std.score || 0}/{std.totalQuestions || 10}
                        </span>
                        <span className="text-xs text-text-muted ml-1">({scorePercent}%)</span>
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
                          <span className="text-xs text-text-muted italic">Belum ditetapkan</span>
                        )}
                      </td>
                      <td className="py-3.5 px-4 text-center">
                        <button
                          type="button"
                          onClick={() => setSelectedStudent(std)}
                          className={`text-xs font-bold px-3 py-1.5 rounded-xl transition-all shadow-sm ${
                            activeTab === "PENDING"
                              ? "bg-primary-500 text-white hover:bg-primary-600"
                              : "bg-surface-subtle text-text-primary border border-surface-border hover:bg-slate-200"
                          }`}
                        >
                          {activeTab === "PENDING" ? "Evaluasi" : "Ubah Evaluasi"}
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
        onSuccess={() => {
          loadData();
          setActiveTab("FINALIZED");
        }}
      />
    </div>
  );
}
