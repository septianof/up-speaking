"use client";

import React, { useState, useEffect, useMemo } from "react";
import {
  GraduationCap,
  UserPlus,
  Search,
  CheckCircle2,
  XCircle,
  Mail,
  Calendar,
  Pencil,
  Trash2,
  AlertTriangle,
} from "lucide-react";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";
import { Input } from "@/components/ui/Input";
import { Modal } from "@/components/ui/Modal";
import { TutorRegisterModal } from "@/components/staff/TutorRegisterModal";
import {
  getMockTutors,
  toggleMockTutorStatus,
  deleteMockTutor,
  TutorAccount,
} from "@/lib/mock-tutors";
import { TargetLevel } from "@/types/student";

export default function AdminTutorsPage() {
  const [tutors, setTutors] = useState<TutorAccount[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedLevel, setSelectedLevel] = useState<string>("ALL");
  const [isRegisterOpen, setIsRegisterOpen] = useState(false);
  const [editTargetTutor, setEditTargetTutor] = useState<TutorAccount | null>(null);
  const [deleteTargetTutor, setDeleteTargetTutor] = useState<TutorAccount | null>(null);

  const loadData = () => {
    setTutors(getMockTutors());
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

  const handleToggleStatus = (id: string) => {
    toggleMockTutorStatus(id);
    loadData();
  };

  const handleDeleteConfirm = () => {
    if (!deleteTargetTutor) return;
    deleteMockTutor(deleteTargetTutor.id);
    setDeleteTargetTutor(null);
    loadData();
  };

  const getLevelBadge = (level: TargetLevel) => {
    if (level === "ELEMENTARY") {
      return (
        <span className="inline-flex items-center gap-1 text-xs font-semibold text-primary-700 bg-primary-50 px-2.5 py-0.5 rounded-md border border-primary-100">
          <GraduationCap className="h-3.5 w-3.5" />
          Elementary (SD)
        </span>
      );
    }
    return (
      <span className="inline-flex items-center gap-1 text-xs font-semibold text-indigo-700 bg-indigo-50 px-2.5 py-0.5 rounded-md border border-indigo-100">
        <GraduationCap className="h-3.5 w-3.5" />
        High School (SMP/SMA)
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
          <h1 className="text-2xl font-black text-text-primary flex items-center gap-2.5">
            <GraduationCap className="h-7 w-7 text-indigo-600" />
            Kelola Akun Tutor (SCR-014)
          </h1>
          <p className="text-sm text-text-muted mt-1">
            Daftarkan pengajar baru, edit jenjang penugasan, kelola status aktif, atau hapus akun tutor.
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
          className="shrink-0 gap-2 bg-indigo-600 hover:bg-indigo-700 focus:ring-indigo-400"
        >
          <UserPlus className="h-4 w-4" />
          Tambah Akun Tutor
        </Button>
      </div>

      {/* Filter and Search */}
      <div className="rounded-2xl bg-surface-white p-4 shadow-card border border-surface-border">
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
                <th className="py-3.5 px-4">Status</th>
                <th className="py-3.5 px-4 text-center w-40">Aksi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-surface-border text-xs sm:text-sm">
              {filteredTutors.length === 0 ? (
                <tr>
                  <td colSpan={7} className="py-12 text-center text-text-muted">
                    <GraduationCap className="h-8 w-8 mx-auto mb-2 opacity-30" />
                    <p className="font-medium">Tidak ada akun tutor yang ditemukan.</p>
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
                    <td className="py-3.5 px-4 font-mono text-xs text-text-secondary flex items-center gap-1.5 pt-4">
                      <Mail className="h-3.5 w-3.5 text-text-muted shrink-0" />
                      {tut.email}
                    </td>
                    <td className="py-3.5 px-4">
                      {getLevelBadge(tut.targetLevel)}
                    </td>
                    <td className="py-3.5 px-4 text-xs text-text-muted">
                      <span className="flex items-center gap-1">
                        <Calendar className="h-3.5 w-3.5" />
                        {formatDate(tut.createdAt)}
                      </span>
                    </td>
                    <td className="py-3.5 px-4">
                      {tut.isActive ? (
                        <Badge variant="success" size="sm">
                          <CheckCircle2 className="h-3 w-3 mr-1 inline" />
                          Aktif
                        </Badge>
                      ) : (
                        <Badge variant="neutral" size="sm">
                          <XCircle className="h-3 w-3 mr-1 inline" />
                          Nonaktif
                        </Badge>
                      )}
                    </td>
                    <td className="py-3.5 px-4 text-center">
                      <div className="flex items-center justify-center gap-1.5">
                        {/* Toggle Status */}
                        <button
                          type="button"
                          onClick={() => handleToggleStatus(tut.id)}
                          className={`text-[11px] font-semibold px-2 py-1 rounded-lg border transition-colors ${
                            tut.isActive
                              ? "border-amber-200 text-amber-700 bg-amber-50 hover:bg-amber-100"
                              : "border-emerald-200 text-emerald-700 bg-emerald-50 hover:bg-emerald-100"
                          }`}
                          title={tut.isActive ? "Nonaktifkan akun" : "Aktifkan akun"}
                        >
                          {tut.isActive ? "Nonaktif" : "Aktifkan"}
                        </button>

                        {/* Edit Tutor */}
                        <button
                          type="button"
                          onClick={() => setEditTargetTutor(tut)}
                          className="p-1.5 rounded-lg text-text-muted hover:text-indigo-600 hover:bg-indigo-50 border border-transparent hover:border-indigo-200 transition-colors"
                          title="Edit profil atau jenjang tutor"
                        >
                          <Pencil className="h-3.5 w-3.5" />
                        </button>

                        {/* Hapus Tutor */}
                        <button
                          type="button"
                          onClick={() => setDeleteTargetTutor(tut)}
                          className="p-1.5 rounded-lg text-text-muted hover:text-accent-600 hover:bg-accent-50 border border-transparent hover:border-accent-200 transition-colors"
                          title="Hapus akun tutor"
                        >
                          <Trash2 className="h-3.5 w-3.5" />
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

      {/* Modal Konfirmasi Hapus Tutor */}
      <Modal
        isOpen={Boolean(deleteTargetTutor)}
        onClose={() => setDeleteTargetTutor(null)}
        title="Hapus Akun Tutor"
        maxWidth="sm"
      >
        <div className="space-y-4 pt-1">
          <div className="p-3.5 rounded-xl bg-accent-50 border border-accent-200 text-xs text-accent-700 flex items-start gap-2">
            <AlertTriangle className="h-5 w-5 shrink-0 text-accent-500" />
            <p className="leading-relaxed">
              Apakah Anda yakin ingin menghapus akun pengajar <strong>{deleteTargetTutor?.fullName}</strong>?
              Tutor tidak akan dapat lagi masuk ke portal sistem.
            </p>
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
              type="button"
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
