"use client";

import React, { useState, useEffect, useMemo } from "react";
import {
  Users,
  UserPlus,
  Search,
  RotateCcw,
  Pencil,
  Trash2,
  AlertTriangle,
} from "lucide-react";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";
import { Input } from "@/components/ui/Input";
import { Modal } from "@/components/ui/Modal";
import { StudentRegisterModal } from "@/components/staff/StudentRegisterModal";
import { ResetSessionModal } from "@/components/staff/ResetSessionModal";
import { StudentRecord } from "@/lib/mock-data";
import { TargetLevel, SessionStatus, FinalLevel } from "@/types/student";

interface ApiStudent {
  id: string;
  fullName: string;
  phoneNumber: string;
  targetLevel: TargetLevel;
  sessionStatus: SessionStatus;
  scorePercentage?: number;
  assignedLevel?: FinalLevel;
  elapsedSeconds?: number;
  createdAt: string;
  sessionId?: string;
  resetCount?: number;
}

export default function AdminStudentsPage() {
  const [students, setStudents] = useState<StudentRecord[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedLevel, setSelectedLevel] = useState<string>("ALL");
  const [selectedStatus, setSelectedStatus] = useState<string>("ALL");

  const [isRegisterOpen, setIsRegisterOpen] = useState(false);
  const [editTargetStudent, setEditTargetStudent] = useState<StudentRecord | null>(null);
  const [deleteTargetStudent, setDeleteTargetStudent] = useState<StudentRecord | null>(null);
  const [resetTargetStudent, setResetTargetStudent] = useState<StudentRecord | null>(null);

  const [isLoading, setIsLoading] = useState(true);

  // Load students
  const loadData = async () => {
    try {
      setIsLoading(true);
      const res = await fetch("/api/admin/students");
      if (res.ok) {
        const data = await res.json();
        const mapped = ((data.students || []) as ApiStudent[]).map((s: ApiStudent) => ({
          id: s.id,
          fullName: s.fullName,
          phone: s.phoneNumber,
          targetLevel: s.targetLevel,
          status: s.sessionStatus,
          score: s.scorePercentage,
          finalLevel: s.assignedLevel,
          elapsedSeconds: s.elapsedSeconds,
          createdAt: s.createdAt,
          sessionId: s.sessionId,
          resetCount: s.resetCount,
        }));
        setStudents(mapped);
      }
    } catch (err) {
      console.error("Error loading students:", err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  // Filter students
  const filteredStudents = useMemo(() => {
    return students.filter((std) => {
      const matchSearch =
        std.fullName.toLowerCase().includes(searchQuery.toLowerCase()) ||
        std.phone.includes(searchQuery);

      const matchLevel =
        selectedLevel === "ALL" || std.targetLevel === selectedLevel;

      const matchStatus =
        selectedStatus === "ALL" || std.status === selectedStatus;

      return matchSearch && matchLevel && matchStatus;
    });
  }, [students, searchQuery, selectedLevel, selectedStatus]);

  const handleDeleteConfirm = async () => {
    if (!deleteTargetStudent) return;
    try {
      const res = await fetch(`/api/admin/students?id=${deleteTargetStudent.id}`, {
        method: "DELETE",
      });
      if (res.ok) {
        setDeleteTargetStudent(null);
        loadData();
      } else {
        const data = await res.json();
        alert(data.error || "Gagal menghapus data siswa.");
      }
    } catch {
      alert("Terjadi kendala jaringan saat menghapus siswa.");
    }
  };

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

  const getLevelBadge = (level: TargetLevel) => {
    if (level === "ELEMENTARY") {
      return (
        <span className="inline-flex items-center text-xs font-medium text-primary-700 bg-primary-50 px-2 py-0.5 rounded border border-primary-100">
          Elementary (SD)
        </span>
      );
    }
    return (
      <span className="inline-flex items-center text-xs font-medium text-text-secondary bg-surface-subtle px-2 py-0.5 rounded border border-surface-border">
        High School
      </span>
    );
  };

  const formatDate = (isoStr: string) => {
    try {
      const d = new Date(isoStr);
      return d.toLocaleDateString("id-ID", {
        day: "numeric",
        month: "short",
        year: "numeric",
        hour: "2-digit",
        minute: "2-digit",
      });
    } catch {
      return isoStr;
    }
  };

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 pb-2 border-b border-surface-border">
        <div>
          <h1 className="text-2xl font-black text-text-primary">
            Kelola Siswa &amp; Sesi Tes
          </h1>
          <p className="text-sm text-text-muted mt-1">
            Daftarkan peserta baru, koreksi data siswa, hapus pendaftaran, dan kelola soft reset sesi pengerjaan siswa.
          </p>
        </div>

        <Button
          type="button"
          variant="primary"
          size="md"
          onClick={() => {
            setEditTargetStudent(null);
            setIsRegisterOpen(true);
          }}
          className="shrink-0 gap-2"
        >
          <UserPlus className="h-4 w-4" />
          Daftarkan Siswa Baru
        </Button>
      </div>

      {/* Filter and Search Bar */}
      <div className="space-y-3">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
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

          {/* Level Filter */}
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

          {/* Status Filter */}
          <div>
            <select
              value={selectedStatus}
              onChange={(e) => setSelectedStatus(e.target.value)}
              className="w-full rounded-xl border border-surface-border bg-surface-white px-3 py-2 text-xs sm:text-sm font-medium text-text-primary focus:outline-none focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500"
            >
              <option value="ALL">Semua Status Sesi</option>
              <option value="NOT_STARTED">Belum Mulai</option>
              <option value="IN_PROGRESS">Sedang Mengerjakan</option>
              <option value="COMPLETED">Menunggu Evaluasi</option>
              <option value="FINALIZED">Selesai & Dinilai</option>
              <option value="RESET">Direset</option>
            </select>
          </div>
        </div>

        {/* Info count */}
        <div className="flex items-center justify-between text-xs text-text-muted pt-1">
          <span>Menampilkan <strong>{filteredStudents.length}</strong> dari <strong>{students.length}</strong> siswa</span>
          {(searchQuery || selectedLevel !== "ALL" || selectedStatus !== "ALL") && (
            <button
              onClick={() => {
                setSearchQuery("");
                setSelectedLevel("ALL");
                setSelectedStatus("ALL");
              }}
              className="text-primary-600 hover:underline font-semibold"
            >
              Reset Filter
            </button>
          )}
        </div>
      </div>

      {/* Students Data Table */}
      <div className="rounded-2xl bg-surface-white shadow-card border border-surface-border overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-surface-subtle/80 border-b border-surface-border text-xs font-bold text-text-muted uppercase tracking-wider">
                <th className="py-3.5 px-4 w-12 text-center">No</th>
                <th className="py-3.5 px-4">Nama Siswa</th>
                <th className="py-3.5 px-4">Nomor WhatsApp</th>
                <th className="py-3.5 px-4">Jenjang</th>
                <th className="py-3.5 px-4">Status Sesi</th>
                <th className="py-3.5 px-4">Tanggal Daftar</th>
                <th className="py-3.5 px-4 text-center w-44">Aksi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-surface-border text-xs sm:text-sm">
              {isLoading ? (
                <tr>
                  <td colSpan={7} className="py-12 text-center text-text-muted">
                    <p className="font-medium">Memuat data siswa...</p>
                  </td>
                </tr>
              ) : students.length === 0 ? (
                <tr>
                  <td colSpan={7} className="py-12 text-center text-text-muted">
                    <Users className="h-8 w-8 mx-auto mb-2 opacity-30" />
                    <p className="font-semibold text-text-primary text-sm mb-1">Belum ada data siswa terdaftar di sistem.</p>
                    <p className="text-xs text-text-muted mb-4">Mulai dengan mendaftarkan peserta tes baru.</p>
                    <Button
                      type="button"
                      variant="primary"
                      size="sm"
                      onClick={() => {
                        setEditTargetStudent(null);
                        setIsRegisterOpen(true);
                      }}
                      className="gap-2"
                    >
                      <UserPlus className="h-4 w-4" />
                      Daftarkan Siswa Pertama
                    </Button>
                  </td>
                </tr>
              ) : filteredStudents.length === 0 ? (
                <tr>
                  <td colSpan={7} className="py-12 text-center text-text-muted">
                    <Users className="h-8 w-8 mx-auto mb-2 opacity-30" />
                    <p className="font-medium">Tidak ada data siswa yang cocok dengan filter pencarian.</p>
                    <button
                      type="button"
                      onClick={() => {
                        setSearchQuery("");
                        setSelectedLevel("ALL");
                        setSelectedStatus("ALL");
                      }}
                      className="mt-2 text-xs text-primary-600 hover:underline font-semibold"
                    >
                      Reset Filter Pencarian
                    </button>
                  </td>
                </tr>
              ) : (
                filteredStudents.map((std, idx) => {
                  const canReset = std.status === "IN_PROGRESS" || std.status === "COMPLETED";

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
                        {std.resetCount ? (
                          <span className="text-[10px] text-accent-600 font-medium">
                            (Pernah di-reset {std.resetCount}x)
                          </span>
                        ) : null}
                      </td>
                      <td className="py-3.5 px-4 font-mono text-xs text-text-secondary">
                        {std.phone}
                      </td>
                      <td className="py-3.5 px-4">
                        {getLevelBadge(std.targetLevel)}
                      </td>
                      <td className="py-3.5 px-4">
                        {getStatusBadge(std.status)}
                      </td>
                      <td className="py-3.5 px-4 text-xs text-text-muted">
                        {formatDate(std.createdAt)}
                      </td>
                      <td className="py-3.5 px-4 text-center">
                        <div className="flex items-center justify-center gap-1.5">
                          {/* Soft Reset */}
                          <button
                            type="button"
                            onClick={() => setResetTargetStudent(std)}
                            disabled={!canReset}
                            title={
                              canReset
                                ? "Lakukan soft reset sesi tes siswa"
                                : "Reset hanya untuk siswa berstatus Sedang Tes atau Selesai"
                            }
                            className={`inline-flex items-center gap-1 px-2 py-1 rounded-lg text-[11px] font-semibold transition-all ${
                              canReset
                                ? "bg-accent-50 text-accent-700 hover:bg-accent-100 border border-accent-200"
                                : "bg-surface-subtle text-slate-300 border border-slate-200 cursor-not-allowed"
                            }`}
                          >
                            <RotateCcw className="h-3 w-3" />
                            <span>Reset</span>
                          </button>

                          {/* Edit Siswa */}
                          <button
                            type="button"
                            onClick={() => setEditTargetStudent(std)}
                            className="p-1.5 rounded-lg text-text-muted hover:text-primary-600 hover:bg-primary-50 border border-transparent hover:border-primary-200 transition-colors"
                            title="Edit identitas atau jenjang siswa"
                          >
                            <Pencil className="h-3.5 w-3.5" />
                          </button>

                          {/* Hapus Siswa */}
                          <button
                            type="button"
                            onClick={() => setDeleteTargetStudent(std)}
                            className="p-1.5 rounded-lg text-text-muted hover:text-accent-600 hover:bg-accent-50 border border-transparent hover:border-accent-200 transition-colors"
                            title="Hapus data pendaftaran siswa"
                          >
                            <Trash2 className="h-3.5 w-3.5" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Registration & Edit Modal */}
      <StudentRegisterModal
        isOpen={isRegisterOpen || Boolean(editTargetStudent)}
        initialStudent={editTargetStudent}
        onClose={() => {
          setIsRegisterOpen(false);
          setEditTargetStudent(null);
        }}
        onSuccess={() => loadData()}
      />

      {/* Reset Session Modal */}
      <ResetSessionModal
        isOpen={Boolean(resetTargetStudent)}
        student={resetTargetStudent}
        onClose={() => setResetTargetStudent(null)}
        onSuccess={() => loadData()}
      />

      {/* Delete Student Confirmation Modal */}
      <Modal
        isOpen={Boolean(deleteTargetStudent)}
        onClose={() => setDeleteTargetStudent(null)}
        title="Hapus Data Siswa"
        maxWidth="sm"
      >
        <div className="space-y-4 pt-1">
          <div className="p-3.5 rounded-xl bg-accent-50 border border-accent-200 text-xs text-accent-700 flex items-start gap-2">
            <AlertTriangle className="h-5 w-5 shrink-0 text-accent-500" />
            <p className="leading-relaxed">
              Apakah Anda yakin ingin menghapus data siswa <strong>{deleteTargetStudent?.fullName}</strong>?
              {deleteTargetStudent?.status !== "NOT_STARTED" && (
                <span className="block mt-1 font-semibold text-accent-800">
                  Perhatian: Siswa ini memiliki status pengerjaan ({deleteTargetStudent?.status}). Riwayat sesi akan ikut terhapus.
                </span>
              )}
            </p>
          </div>

          <div className="flex items-center justify-end gap-2.5 pt-2 border-t border-surface-border">
            <Button
              type="button"
              variant="outline"
              size="md"
              onClick={() => setDeleteTargetStudent(null)}
            >
              Batal
            </Button>
            <Button
              type="button"
              variant="accent"
              size="md"
              onClick={handleDeleteConfirm}
            >
              Hapus Siswa
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
}
