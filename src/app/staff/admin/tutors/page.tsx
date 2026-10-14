"use client";

import React, { useState, useEffect, useMemo } from "react";
import {
  GraduationCap,
  UserPlus,
  Search,
  Pencil,
  Trash2,
  AlertTriangle,
} from "lucide-react";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Modal } from "@/components/ui/Modal";
import { TutorRegisterModal } from "@/components/staff/TutorRegisterModal";
import { TutorAccount } from "@/lib/mock-tutors";
import { TargetLevel } from "@/types/student";

interface ApiTutor {
  id: string;
  fullName: string;
  email: string;
  targetLevel: TargetLevel;
  evaluationCount?: number;
  createdAt: string;
}

export default function AdminTutorsPage() {
  const [tutors, setTutors] = useState<TutorAccount[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedLevel, setSelectedLevel] = useState<string>("ALL");
  const [isRegisterOpen, setIsRegisterOpen] = useState(false);
  const [editTargetTutor, setEditTargetTutor] = useState<TutorAccount | null>(null);
  const [deleteTargetTutor, setDeleteTargetTutor] = useState<TutorAccount | null>(null);

  const [isLoading, setIsLoading] = useState(true);

  const loadData = async () => {
    try {
      setIsLoading(true);
      const res = await fetch("/api/admin/tutors");
      if (res.ok) {
        const data = await res.json();
        const mapped = ((data.tutors || []) as ApiTutor[]).map((t: ApiTutor) => ({
          id: t.id,
          fullName: t.fullName,
          email: t.email,
          targetLevel: t.targetLevel,
          evaluationCount: t.evaluationCount || 0,
          createdAt: t.createdAt,
          isActive: true,
          isDeleted: false,
        }));
        setTutors(mapped);
      }
    } catch (err) {
      console.error("Error loading tutors:", err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const filteredTutors = useMemo(() => {
    return tutors.filter((tut) => {
      const matchSearch =
        tut.fullName.toLowerCase().includes(searchQuery.toLowerCase()) ||
        tut.email.toLowerCase().includes(searchQuery.toLowerCase());

      const matchLevel =
        selectedLevel === "ALL" || tut.targetLevel === selectedLevel;

      return matchSearch && matchLevel;
    });
  }, [tutors, searchQuery, selectedLevel]);

  const handleDeleteConfirm = async () => {
    if (!deleteTargetTutor) return;
    try {
      const res = await fetch(`/api/admin/tutors?id=${deleteTargetTutor.id}`, {
        method: "DELETE",
      });
      if (res.ok) {
        setDeleteTargetTutor(null);
        loadData();
      } else {
        const data = await res.json();
        alert(data.error || "Gagal menghapus akun pengajar.");
      }
    } catch {
      alert("Terjadi kendala jaringan saat menghapus akun pengajar.");
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
      });
    } catch {
      return isoStr;
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 pb-2 border-b border-surface-border">
        <div>
          <h1 className="text-2xl font-black text-text-primary">
            Kelola Akun Tutor
          </h1>
          <p className="text-sm text-text-muted mt-1">
            Daftarkan pengajar baru, edit jenjang penugasan, atau hapus akun tutor (soft delete).
          </p>
        </div>

        <Button
          type="button"
          variant="primary"
          size="md"
          onClick={() => {
            setEditTargetTutor(null);
            setIsRegisterOpen(true);
          }}
          className="shrink-0 gap-2"
        >
          <UserPlus className="h-4 w-4" />
          Tambah Akun Tutor
        </Button>
      </div>

      {/* Filter and Search */}
      <div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
          <div className="md:col-span-2 relative">
            <Input
              type="text"
              placeholder="Cari berdasarkan nama atau email tutor..."
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
              <option value="ALL">Semua Jenjang Pengampu</option>
              <option value="ELEMENTARY">Elementary (SD)</option>
              <option value="HIGH_SCHOOL">High School (SMP/SMA)</option>
            </select>
          </div>
        </div>
      </div>

      {/* Table */}
      <div className="rounded-2xl bg-surface-white shadow-card border border-surface-border overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-surface-subtle/80 border-b border-surface-border text-xs font-bold text-text-muted uppercase tracking-wider">
                <th className="py-3.5 px-4 w-12 text-center">No</th>
                <th className="py-3.5 px-4">Nama Lengkap Tutor</th>
                <th className="py-3.5 px-4">Email Staf</th>
                <th className="py-3.5 px-4">Jenjang Pengampu</th>
                <th className="py-3.5 px-4">Terdaftar</th>
                <th className="py-3.5 px-4 text-center w-28">Aksi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-surface-border text-xs sm:text-sm">
              {isLoading ? (
                <tr>
                  <td colSpan={6} className="py-12 text-center text-text-muted">
                    <p className="font-medium">Memuat data akun tutor...</p>
                  </td>
                </tr>
              ) : tutors.length === 0 ? (
                <tr>
                  <td colSpan={6} className="py-12 text-center text-text-muted">
                    <GraduationCap className="h-8 w-8 mx-auto mb-2 opacity-30" />
                    <p className="font-semibold text-text-primary text-sm mb-1">Belum ada akun tutor terdaftar.</p>
                    <p className="text-xs text-text-muted mb-4">Daftarkan akun pengajar baru untuk jenjang Elementary atau High School.</p>
                    <Button
                      type="button"
                      variant="primary"
                      size="sm"
                      onClick={() => {
                        setEditTargetTutor(null);
                        setIsRegisterOpen(true);
                      }}
                      className="gap-2"
                    >
                      <UserPlus className="h-4 w-4" />
                      Tambah Akun Tutor
                    </Button>
                  </td>
                </tr>
              ) : filteredTutors.length === 0 ? (
                <tr>
                  <td colSpan={6} className="py-12 text-center text-text-muted">
                    <GraduationCap className="h-8 w-8 mx-auto mb-2 opacity-30" />
                    <p className="font-medium">Tidak ada akun tutor yang cocok dengan filter pencarian.</p>
                    <button
                      type="button"
                      onClick={() => {
                        setSearchQuery("");
                        setSelectedLevel("ALL");
                      }}
                      className="mt-2 text-xs text-primary-600 hover:underline font-semibold"
                    >
                      Reset Filter Pencarian
                    </button>
                  </td>
                </tr>
              ) : (
                filteredTutors.map((tut, idx) => (
                  <tr key={tut.id} className="hover:bg-surface-subtle/40 transition-colors">
                    <td className="py-3.5 px-4 text-center font-mono text-text-muted text-xs">
                      {idx + 1}
                    </td>
                    <td className="py-3.5 px-4 font-bold text-text-primary">
                      {tut.fullName}
                    </td>
                    <td className="py-3.5 px-4 font-mono text-xs text-text-secondary">
                      {tut.email}
                    </td>
                    <td className="py-3.5 px-4">
                      {getLevelBadge(tut.targetLevel)}
                    </td>
                    <td className="py-3.5 px-4 text-xs text-text-muted">
                      {formatDate(tut.createdAt)}
                    </td>
                    <td className="py-3.5 px-4 text-center">
                      <div className="flex items-center justify-center gap-1.5">
                        {/* Edit Tutor */}
                        <button
                          type="button"
                          onClick={() => setEditTargetTutor(tut)}
                          className="p-1.5 rounded-lg text-text-muted hover:text-indigo-600 hover:bg-indigo-50 border border-transparent hover:border-indigo-200 transition-colors"
                          title="Edit profil atau jenjang tutor"
                        >
                          <Pencil className="h-4 w-4" />
                        </button>

                        {/* Hapus Tutor (Soft Delete) */}
                        <button
                          type="button"
                          onClick={() => setDeleteTargetTutor(tut)}
                          className="p-1.5 rounded-lg text-text-muted hover:text-accent-600 hover:bg-accent-50 border border-transparent hover:border-accent-200 transition-colors"
                          title="Hapus akun tutor (soft delete)"
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modal Tambah / Edit Tutor */}
      <TutorRegisterModal
        isOpen={isRegisterOpen || Boolean(editTargetTutor)}
        initialTutor={editTargetTutor}
        onClose={() => {
          setIsRegisterOpen(false);
          setEditTargetTutor(null);
        }}
        onSuccess={() => loadData()}
      />

      {/* Modal Konfirmasi Hapus Tutor (Soft Delete) */}
      <Modal
        isOpen={Boolean(deleteTargetTutor)}
        onClose={() => setDeleteTargetTutor(null)}
        title="Konfirmasi Hapus Akun Tutor"
        maxWidth="sm"
      >
        <div className="space-y-4 pt-1">
          <div className="p-3.5 rounded-xl bg-accent-50 border border-accent-200 text-xs text-accent-700 flex items-start gap-2">
            <AlertTriangle className="h-5 w-5 shrink-0 text-accent-500" />
            <div className="leading-relaxed space-y-1">
              <p>
                Apakah Anda yakin ingin menghapus akun pengajar <strong>{deleteTargetTutor?.fullName}</strong>?
              </p>
              <p className="text-[11px] text-accent-800">
                Akun akan dihapus dari sistem (soft delete). Riwayat penilaian siswa yang pernah dilakukan pengajar tetap aman tersimpan dalam database.
              </p>
            </div>
          </div>

          <div className="flex items-center justify-end gap-2.5 pt-2 border-t border-surface-border">
            <Button
              type="button"
              variant="outline"
              size="md"
              onClick={() => setDeleteTargetTutor(null)}
            >
              Batal
            </Button>
            <Button
              type="submit"
              variant="accent"
              size="md"
              onClick={handleDeleteConfirm}
            >
              Hapus Akun
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
}
