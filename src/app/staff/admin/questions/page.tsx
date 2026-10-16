"use client";

import React, { useState, useEffect, useMemo } from "react";
import useSWR from "swr";
import {
  Plus,
  Search,
  Trash2,
  Pencil,
  AlertTriangle,
  RefreshCw,
  CheckCircle2,
} from "lucide-react";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Modal } from "@/components/ui/Modal";
import { Pagination } from "@/components/ui/Pagination";
import { QuestionFormModal } from "@/components/staff/QuestionFormModal";
import { QuestionItem, TargetLevel } from "@/types/student";
import { fetcher } from "@/lib/fetcher";

interface ApiOption {
  id: string;
  optionText: string;
}

interface ApiQuestion {
  id: string;
  questionText: string;
  targetLevel: TargetLevel;
  options: ApiOption[];
  correctOptionId: string;
}

export default function AdminQuestionsPage() {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedLevel, setSelectedLevel] = useState<string>("ALL");

  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);

  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editTarget, setEditTarget] = useState<QuestionItem | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<QuestionItem | null>(null);

  // SWR: Otomatis cache-first dengan revalidasi fokus
  const { data, isLoading, isValidating, mutate } = useSWR<{ questions: ApiQuestion[] }>(
    "/api/admin/questions",
    fetcher,
    { revalidateOnFocus: true }
  );

  const questions = useMemo<QuestionItem[]>(() => {
    return ((data?.questions || []) as ApiQuestion[]).map((q: ApiQuestion) => ({
      id: q.id,
      questionText: q.questionText,
      targetLevel: q.targetLevel,
      options: (q.options || []).map((o: ApiOption) => ({
        id: o.id,
        optionText: o.optionText,
      })),
      correctOptionId: q.correctOptionId,
    }));
  }, [data]);

  // Reset pagination ke halaman 1 saat filter atau pencarian berubah
  useEffect(() => {
    setCurrentPage(1);
  }, [searchQuery, selectedLevel]);

  const filteredQuestions = useMemo(() => {
    return questions.filter((q) => {
      const matchSearch = q.questionText
        .toLowerCase()
        .includes(searchQuery.toLowerCase());
      const matchLevel =
        selectedLevel === "ALL" || q.targetLevel === selectedLevel;
      return matchSearch && matchLevel;
    });
  }, [questions, searchQuery, selectedLevel]);

  // Hitung total halaman dan butir soal terpaginasi
  const totalPages = Math.max(1, Math.ceil(filteredQuestions.length / itemsPerPage));
  const paginatedQuestions = useMemo(() => {
    const start = (currentPage - 1) * itemsPerPage;
    return filteredQuestions.slice(start, start + itemsPerPage);
  }, [filteredQuestions, currentPage, itemsPerPage]);

  const handleDeleteConfirm = async () => {
    if (!deleteTarget) return;
    try {
      const res = await fetch(`/api/admin/questions/${deleteTarget.id}`, {
        method: "DELETE",
      });
      if (res.ok) {
        setDeleteTarget(null);
        mutate();
      } else {
        const data = await res.json();
        alert(data.error || "Gagal menghapus butir soal.");
      }
    } catch {
      alert("Terjadi kendala jaringan saat menghapus soal.");
    }
  };

  const getLevelBadge = (level: TargetLevel) => {
    if (level === "ELEMENTARY") {
      return (
        <span className="inline-flex items-center text-xs font-medium text-primary-700 bg-primary-50 px-2 py-0.5 rounded border border-primary-100">
          Elementary
        </span>
      );
    }
    return (
      <span className="inline-flex items-center text-xs font-medium text-text-secondary bg-surface-subtle px-2 py-0.5 rounded border border-surface-border">
        High School
      </span>
    );
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 pb-2 border-b border-surface-border">
        <div>
          <h1 className="text-2xl font-black text-text-primary">
            Bank Soal Ujian
          </h1>
          <p className="text-sm text-text-muted mt-1">
            Kelola paket butir soal placement test dengan format pilihan dinamis (2 hingga 5 opsi pilihan).
          </p>
        </div>

        <div className="flex items-center gap-2.5 shrink-0">
          <button
            type="button"
            onClick={() => mutate()}
            disabled={isValidating}
            title="Segarkan data terbaru dari database"
            className="inline-flex items-center gap-1.5 px-3 py-2 text-xs sm:text-sm font-semibold text-text-primary bg-surface-white border border-surface-border rounded-xl hover:bg-slate-50 transition shadow-sm disabled:opacity-50"
          >
            <RefreshCw className={`h-4 w-4 text-text-muted ${isValidating ? "animate-spin text-primary-500" : ""}`} />
            <span>{isValidating ? "Menyinkronkan..." : "Segarkan"}</span>
          </button>

          <Button
            type="button"
            variant="primary"
            size="md"
            onClick={() => setIsFormOpen(true)}
            className="shrink-0 gap-2"
          >
            <Plus className="h-4 w-4" />
            Tambah Butir Soal
          </Button>
        </div>
      </div>

      {/* Filter and Search */}
      <div className="space-y-3">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
          <div className="md:col-span-2 relative">
            <Input
              type="text"
              placeholder="Cari teks butir soal bahasa Inggris..."
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
              <option value="ELEMENTARY">Elementary</option>
              <option value="HIGH_SCHOOL">High School</option>
            </select>
          </div>
        </div>

        <div className="flex items-center justify-between text-xs text-text-muted pt-1">
          <span>Menampilkan <strong>{filteredQuestions.length}</strong> dari <strong>{questions.length}</strong> butir soal aktif</span>
          {(searchQuery || selectedLevel !== "ALL") && (
            <button
              onClick={() => {
                setSearchQuery("");
                setSelectedLevel("ALL");
              }}
              className="text-primary-600 hover:underline font-semibold"
            >
              Reset Filter
            </button>
          )}
        </div>
      </div>

      {/* Question Cards List */}
      <div className="space-y-3.5">
        {isLoading ? (
          <div className="p-12 text-center rounded-2xl bg-surface-white border border-surface-border shadow-card text-text-muted">
            <p className="font-medium">Memuat bank soal...</p>
          </div>
        ) : questions.length === 0 ? (
          <div className="p-12 text-center rounded-2xl bg-surface-white border border-surface-border shadow-card text-text-muted">
            <p className="font-semibold text-text-primary text-sm mb-1">Belum ada butir soal yang dibuat dalam bank soal.</p>
            <p className="text-xs text-text-muted mb-4">Tambahkan butir soal baru dengan pilihan opsi jawaban.</p>
            <Button
              type="button"
              variant="primary"
              size="sm"
              onClick={() => {
                setEditTarget(null);
                setIsFormOpen(true);
              }}
              className="gap-2"
            >
              <Plus className="h-4 w-4" />
              Tambah Soal Baru
            </Button>
          </div>
        ) : filteredQuestions.length === 0 ? (
          <div className="p-12 text-center rounded-2xl bg-surface-white border border-surface-border shadow-card text-text-muted">
            <p className="font-medium text-sm">Tidak ada butir soal yang cocok dengan filter pencarian.</p>
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
          </div>
        ) : (
          paginatedQuestions.map((q, idx) => {
            const questionNum = (currentPage - 1) * itemsPerPage + idx + 1;

            return (
              <div
                key={q.id}
                className="p-5 rounded-2xl bg-surface-white border border-surface-border shadow-card hover:border-slate-300 transition-all space-y-3"
              >
                {/* Question Header */}
                <div className="flex items-start justify-between gap-3">
                  <div className="flex items-center gap-2">
                    <span className="h-6 w-6 rounded-full bg-surface-subtle border border-surface-border text-text-secondary font-bold text-xs flex items-center justify-center shrink-0">
                      {questionNum}
                    </span>
                    {getLevelBadge(q.targetLevel)}
                    <span className="text-[11px] font-semibold text-text-muted">
                      ({q.options.length} pilihan opsi)
                    </span>
                  </div>

                  <div className="flex items-center gap-1">
                    <button
                      type="button"
                      onClick={() => setEditTarget(q)}
                      className="p-1.5 rounded-lg text-text-muted hover:text-primary-600 hover:bg-primary-50 transition-colors"
                      title="Edit butir soal ini"
                    >
                      <Pencil className="h-4 w-4" />
                    </button>

                    <button
                      type="button"
                      onClick={() => setDeleteTarget(q)}
                      className="p-1.5 rounded-lg text-text-muted hover:text-accent-600 hover:bg-accent-50 transition-colors"
                      title="Hapus butir soal ini"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>
                </div>

                {/* Question Text */}
                <p className="text-sm font-semibold text-text-primary leading-relaxed pl-8">
                  {q.questionText}
                </p>

                {/* Options Grid */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 pl-8 pt-1">
                  {q.options.map((opt, optIdx) => {
                    const isCorrect =
                      q.correctOptionId === opt.id || optIdx === 0;

                    return (
                      <div
                        key={opt.id}
                        className={`flex items-center gap-2 p-2.5 rounded-xl border text-xs ${
                          isCorrect
                            ? "border-emerald-300 bg-emerald-50/60 text-emerald-900 font-semibold"
                            : "border-surface-border bg-surface-white text-text-secondary"
                        }`}
                      >
                        <span className="font-bold shrink-0">
                          {String.fromCharCode(65 + optIdx)}.
                        </span>
                        <span className="flex-1">{opt.optionText}</span>
                        {isCorrect && (
                          <span className="inline-flex items-center gap-1 text-[10px] text-emerald-700 bg-emerald-100 px-1.5 py-0.5 rounded font-bold shrink-0">
                            <CheckCircle2 className="h-3 w-3" />
                            Kunci
                          </span>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* Pagination Controls */}
      {filteredQuestions.length > 0 && (
        <div className="rounded-2xl bg-surface-white border border-surface-border shadow-card px-4">
          <Pagination
            currentPage={currentPage}
            totalPages={totalPages}
            totalItems={filteredQuestions.length}
            itemsPerPage={itemsPerPage}
            onPageChange={setCurrentPage}
            onItemsPerPageChange={(limit) => {
              setItemsPerPage(limit);
              setCurrentPage(1);
            }}
          />
        </div>
      )}

      {/* Form Modal (Create & Edit) */}
      <QuestionFormModal
        isOpen={isFormOpen || Boolean(editTarget)}
        initialQuestion={editTarget}
        onClose={() => {
          setIsFormOpen(false);
          setEditTarget(null);
        }}
        defaultLevel={selectedLevel === "HIGH_SCHOOL" ? "HIGH_SCHOOL" : "ELEMENTARY"}
        onSuccess={() => mutate()}
      />

      {/* Delete Confirmation Modal */}
      <Modal
        isOpen={Boolean(deleteTarget)}
        onClose={() => setDeleteTarget(null)}
        title="Hapus Butir Soal"
        maxWidth="sm"
      >
        <div className="space-y-4 pt-1">
          <div className="p-3.5 rounded-xl bg-accent-50 border border-accent-200 text-xs text-accent-700 flex items-start gap-2">
            <AlertTriangle className="h-5 w-5 shrink-0 text-accent-500" />
            <p className="leading-relaxed">
              Apakah Anda yakin ingin menghapus butir soal ini? Tindakan ini akan menghapus soal dari paket ujian aktif.
            </p>
          </div>

          {deleteTarget && (
            <p className="text-xs text-text-secondary italic line-clamp-2 bg-surface-subtle p-2.5 rounded-lg border border-surface-border">
              &quot;{deleteTarget.questionText}&quot;
            </p>
          )}

          <div className="flex items-center justify-end gap-2.5 pt-2 border-t border-surface-border">
            <Button
              type="button"
              variant="outline"
              size="md"
              onClick={() => setDeleteTarget(null)}
            >
              Batal
            </Button>
            <Button
              type="button"
              variant="accent"
              size="md"
              onClick={handleDeleteConfirm}
            >
              Hapus Soal
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
}
