'use client';

import React, { useEffect, useState, useMemo, useCallback } from 'react';
import {
  BookOpen,
  Plus,
  Search,
  X,
  RefreshCw,
  Edit3,
  Trash2,
  CheckCircle2,
  AlertCircle,
  HelpCircle,
  Check,
  ChevronLeft,
  ChevronRight,
  Sparkles,
  GraduationCap,
} from 'lucide-react';
import { getQuestionsForAdmin, AdminQuestion } from '@/app/actions/questions';
import { QuestionDeleteModal } from '@/components/admin/QuestionDeleteModal';
import { QuestionFormModal } from '@/components/admin/QuestionFormModal';
import { EducationLevel } from '@/types';

const PAGE_SIZE = 10;
const OPTION_LETTERS = ['A', 'B', 'C', 'D', 'E', 'F', 'G', 'H'];

export default function AdminQuestionsPage() {
  const [questions, setQuestions] = useState<AdminQuestion[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [isRefreshing, setIsRefreshing] = useState<boolean>(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState<string>('');
  const [levelFilter, setLevelFilter] = useState<'all' | EducationLevel>('all');
  const [currentPage, setCurrentPage] = useState<number>(1);

  // State Modal Soft Delete
  const [selectedQuestionForDelete, setSelectedQuestionForDelete] =
    useState<AdminQuestion | null>(null);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState<boolean>(false);

  // State Modal Form Tambah / Edit Soal
  const [selectedQuestionForEdit, setSelectedQuestionForEdit] =
    useState<AdminQuestion | null>(null);
  const [isFormModalOpen, setIsFormModalOpen] = useState<boolean>(false);

  const [toastMessage, setToastMessage] = useState<string | null>(null);

  // Ambil daftar soal dari server
  const loadQuestions = useCallback(async (isManualRefresh = false) => {
    if (isManualRefresh) {
      setIsRefreshing(true);
    } else {
      setIsLoading(true);
    }
    setErrorMessage(null);

    try {
      const res = await getQuestionsForAdmin();
      if (res.success) {
        setQuestions(res.questions);
      } else {
        setErrorMessage(res.error || 'Gagal memuat daftar bank soal.');
      }
    } catch (err) {
      console.error('Error saat fetch questions:', err);
      setErrorMessage('Terjadi kendala koneksi saat mengambil bank soal.');
    } finally {
      setIsLoading(false);
      setIsRefreshing(false);
    }
  }, []);

  useEffect(() => {
    loadQuestions();
  }, [loadQuestions]);

  // Handler Hapus Soal (Soft Delete)
  const handleOpenDeleteModal = (q: AdminQuestion) => {
    setSelectedQuestionForDelete(q);
    setIsDeleteModalOpen(true);
  };

  const handleDeleteSuccess = (deletedQuestionId: string, message: string) => {
    setQuestions((prev) => prev.filter((item) => item.id !== deletedQuestionId));
    setToastMessage(message);
    setTimeout(() => {
      setToastMessage(null);
    }, 4500);
  };

  // Handler Sukses Tambah / Edit Soal
  const handleFormSuccess = (message: string) => {
    loadQuestions(true);
    setToastMessage(message);
    setTimeout(() => {
      setToastMessage(null);
    }, 4500);
  };

  // Hitung Statistik Soal Per Jenjang
  const stats = useMemo(() => {
    const total = questions.length;
    const elementary = questions.filter(
      (q) => q.educationLevel === 'elementary'
    ).length;
    const highSchool = questions.filter(
      (q) => q.educationLevel === 'high_school'
    ).length;
    return { total, elementary, highSchool };
  }, [questions]);

  // Filter Search & Jenjang Pendidikan
  const filteredQuestions = useMemo(() => {
    return questions.filter((item) => {
      // 1. Filter Jenjang Pendidikan
      if (levelFilter !== 'all' && item.educationLevel !== levelFilter) {
        return false;
      }

      // 2. Filter Teks Pertanyaan & Pilihan Jawaban
      if (searchTerm.trim()) {
        const q = searchTerm.toLowerCase().trim();
        const matchQuestion = item.questionText.toLowerCase().includes(q);
        const matchOption = item.options.some((opt) =>
          opt.optionText.toLowerCase().includes(q)
        );
        return matchQuestion || matchOption;
      }

      return true;
    });
  }, [questions, levelFilter, searchTerm]);

  // Pagination
  const totalPages = Math.ceil(filteredQuestions.length / PAGE_SIZE) || 1;
  const paginatedQuestions = useMemo(() => {
    const start = (currentPage - 1) * PAGE_SIZE;
    return filteredQuestions.slice(start, start + PAGE_SIZE);
  }, [filteredQuestions, currentPage]);

  return (
    <div className="space-y-6 sm:space-y-8 animate-fade-in relative">
      {/* Toast Notifikasi Berhasil */}
      {toastMessage && (
        <div className="fixed bottom-6 right-6 z-50 max-w-md bg-slate-900 text-white p-4 rounded-2xl shadow-2xl border border-slate-800 flex items-start gap-3 animate-fade-in">
          <div className="w-8 h-8 rounded-xl bg-emerald-500/20 text-emerald-400 flex items-center justify-center flex-shrink-0 mt-0.5">
            <CheckCircle2 className="w-5 h-5" />
          </div>
          <div className="flex-1 text-xs sm:text-sm">
            <p className="font-bold text-white">Bank Soal Diperbarui</p>
            <p className="text-slate-300 mt-0.5 leading-relaxed">{toastMessage}</p>
          </div>
          <button
            onClick={() => setToastMessage(null)}
            className="p-1 text-slate-400 hover:text-white transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* Banner Sambutan & Aksi Utama */}
      <div className="bg-white rounded-3xl border border-slate-100 p-6 sm:p-8 shadow-[0_4px_24px_-4px_rgba(0,0,0,0.04)]">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
          <div className="space-y-1.5">
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-sky-50 text-sky-800 border border-sky-200/80">
              <BookOpen className="w-3.5 h-3.5 text-sky-600" />
              <span>Manajemen Konten</span>
            </div>
            <h2 className="text-xl sm:text-2xl font-extrabold text-slate-900 tracking-tight">
              Bank Soal Placement Test
            </h2>
            <p className="text-xs sm:text-sm text-slate-500 max-w-2xl leading-relaxed">
              Kelola daftar pertanyaan pilihan ganda, kunci jawaban, dan opsi jawaban dinamis. Butir soal aktif akan diacak secara otomatis ke layar peserta.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2.5 sm:gap-3">
            {/* Tombol Refresh Data */}
            <button
              onClick={() => loadQuestions(true)}
              disabled={isLoading || isRefreshing}
              className="inline-flex items-center gap-2 px-3.5 py-2.5 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 text-slate-700 font-semibold text-xs sm:text-sm transition-colors shadow-2xs disabled:opacity-50"
              title="Segarkan data soal"
            >
              <RefreshCw
                className={`w-4 h-4 text-slate-500 ${
                  isRefreshing ? 'animate-spin text-sky-600' : ''
                }`}
              />
              <span>{isRefreshing ? 'Memperbarui...' : 'Segarkan'}</span>
            </button>

            {/* Tombol Tambah Soal Baru (ADM-08) */}
            <button
              type="button"
              onClick={() => {
                setSelectedQuestionForEdit(null);
                setIsFormModalOpen(true);
              }}
              className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-[#0e263e] hover:bg-[#1a385c] text-white font-bold text-xs sm:text-sm transition-colors shadow-xs"
            >
              <Plus className="w-4 h-4" />
              <span>Tambah Soal Baru</span>
            </button>
          </div>
        </div>
      </div>

      {/* Ringkasan Cepat */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {/* Total Soal Aktif */}
        <div className="bg-white rounded-2xl border border-slate-100 p-5 shadow-2xs flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-slate-100 text-slate-700 flex items-center justify-center flex-shrink-0">
            <BookOpen className="w-6 h-6" />
          </div>
          <div>
            <p className="text-xs font-bold text-slate-400">Total Soal Aktif</p>
            <h3 className="text-2xl font-extrabold text-slate-900 tracking-tight mt-0.5">
              {stats.total} Butir
            </h3>
          </div>
        </div>

        {/* Soal Elementary */}
        <div className="bg-white rounded-2xl border border-slate-100 p-5 shadow-2xs flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-sky-50 text-sky-600 flex items-center justify-center flex-shrink-0">
            <GraduationCap className="w-6 h-6" />
          </div>
          <div>
            <p className="text-xs font-bold text-slate-400">Elementary (SD)</p>
            <h3 className="text-2xl font-extrabold text-slate-900 tracking-tight mt-0.5">
              {stats.elementary} Butir
            </h3>
          </div>
        </div>

        {/* Soal High School */}
        <div className="bg-white rounded-2xl border border-slate-100 p-5 shadow-2xs flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center flex-shrink-0">
            <GraduationCap className="w-6 h-6" />
          </div>
          <div>
            <p className="text-xs font-bold text-slate-400">High School (SMP/SMA/Umum)</p>
            <h3 className="text-2xl font-extrabold text-slate-900 tracking-tight mt-0.5">
              {stats.highSchool} Butir
            </h3>
          </div>
        </div>
      </div>

      {/* Pesan Error (Jika Gagal Fetch) */}
      {errorMessage && (
        <div className="p-4 rounded-2xl bg-rose-50 border border-rose-200 text-rose-800 flex items-start gap-3">
          <AlertCircle className="w-5 h-5 text-rose-600 flex-shrink-0 mt-0.5" />
          <div className="flex-1 text-xs sm:text-sm">
            <p className="font-bold">Gagal Memuat Soal</p>
            <p className="mt-0.5 text-rose-700">{errorMessage}</p>
          </div>
          <button
            onClick={() => loadQuestions()}
            className="text-xs font-bold underline hover:no-underline text-rose-900"
          >
            Coba Lagi
          </button>
        </div>
      )}

      {/* Kontainer Utama Tabel Bank Soal */}
      <div className="bg-white rounded-3xl border border-slate-100 p-6 sm:p-8 shadow-[0_4px_24px_-4px_rgba(0,0,0,0.04)] space-y-6">
        {/* Toolbar: Filter Jenjang Tabs & Pencarian */}
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
          {/* Tabs Filter Jenjang */}
          <div className="flex items-center p-1 bg-slate-100 rounded-2xl border border-slate-200/80 w-full sm:w-auto">
            <button
              type="button"
              onClick={() => {
                setLevelFilter('all');
                setCurrentPage(1);
              }}
              className={`flex-1 sm:flex-initial px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all ${
                levelFilter === 'all'
                  ? 'bg-white text-slate-900 shadow-2xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Semua ({stats.total})
            </button>
            <button
              type="button"
              onClick={() => {
                setLevelFilter('elementary');
                setCurrentPage(1);
              }}
              className={`flex-1 sm:flex-initial inline-flex items-center justify-center gap-1.5 px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all ${
                levelFilter === 'elementary'
                  ? 'bg-sky-500 text-white shadow-2xs'
                  : 'text-slate-600 hover:text-sky-700'
              }`}
            >
              <span>Elementary (SD)</span>
              <span
                className={`text-[10px] px-1.5 py-0.5 rounded-full font-bold ${
                  levelFilter === 'elementary'
                    ? 'bg-white/20 text-white'
                    : 'bg-slate-200 text-slate-700'
                }`}
              >
                {stats.elementary}
              </span>
            </button>
            <button
              type="button"
              onClick={() => {
                setLevelFilter('high_school');
                setCurrentPage(1);
              }}
              className={`flex-1 sm:flex-initial inline-flex items-center justify-center gap-1.5 px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all ${
                levelFilter === 'high_school'
                  ? 'bg-indigo-600 text-white shadow-2xs'
                  : 'text-slate-600 hover:text-indigo-700'
              }`}
            >
              <span>High School</span>
              <span
                className={`text-[10px] px-1.5 py-0.5 rounded-full font-bold ${
                  levelFilter === 'high_school'
                    ? 'bg-white/20 text-white'
                    : 'bg-slate-200 text-slate-700'
                }`}
              >
                {stats.highSchool}
              </span>
            </button>
          </div>

          {/* Search Box & Info Count */}
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 flex-1 lg:max-w-md">
            <div className="relative flex-1">
              <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => {
                  setSearchTerm(e.target.value);
                  setCurrentPage(1);
                }}
                placeholder="Cari teks pertanyaan atau pilihan jawaban..."
                className="w-full pl-10 pr-9 py-2.5 rounded-xl bg-slate-50 border border-slate-200 focus:bg-white focus:border-sky-500 focus:ring-2 focus:ring-sky-100 outline-none text-xs sm:text-sm text-slate-800 placeholder-slate-400 transition-all"
              />
              {searchTerm && (
                <button
                  onClick={() => setSearchTerm('')}
                  className="absolute right-3 top-1/2 -translate-y-1/2 p-1 text-slate-400 hover:text-slate-600 rounded-md transition-colors"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              )}
            </div>
            <div className="text-xs text-slate-500 whitespace-nowrap">
              <strong className="text-slate-800 font-bold">
                {filteredQuestions.length}
              </strong>{' '}
              dari {questions.length} butir
            </div>
          </div>
        </div>

        {/* Tabel Soal */}
        <div className="overflow-x-auto rounded-2xl border border-slate-100 shadow-2xs">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-50/80 text-slate-600 text-xs font-bold border-b border-slate-100">
                <th className="py-3.5 px-4 w-12 text-center">#</th>
                <th className="py-3.5 px-4 min-w-[240px]">Teks Pertanyaan</th>
                <th className="py-3.5 px-4 min-w-[130px] text-center">Jenjang</th>
                <th className="py-3.5 px-4 min-w-[300px]">
                  Pilihan Jawaban & Kunci
                </th>
                <th className="py-3.5 px-4 min-w-[90px] text-center">
                  Jumlah Opsi
                </th>
                <th className="py-3.5 px-4 min-w-[110px] text-center">Aksi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-xs sm:text-sm">
              {isLoading ? (
                // Loading Skeleton
                Array.from({ length: 3 }).map((_, idx) => (
                  <tr key={idx} className="animate-pulse">
                    <td className="py-5 px-4 text-center">
                      <div className="w-5 h-5 bg-slate-200 rounded mx-auto" />
                    </td>
                    <td className="py-5 px-4">
                      <div className="w-48 h-4 bg-slate-200 rounded mb-2" />
                      <div className="w-32 h-3 bg-slate-100 rounded" />
                    </td>
                    <td className="py-5 px-4 text-center">
                      <div className="w-20 h-6 bg-slate-200 rounded-full mx-auto" />
                    </td>
                    <td className="py-5 px-4">
                      <div className="w-64 h-6 bg-slate-200 rounded-lg mb-1.5" />
                      <div className="w-52 h-6 bg-slate-100 rounded-lg" />
                    </td>
                    <td className="py-5 px-4 text-center">
                      <div className="w-16 h-6 bg-slate-200 rounded-full mx-auto" />
                    </td>
                    <td className="py-5 px-4 text-center">
                      <div className="w-20 h-8 bg-slate-200 rounded-xl mx-auto" />
                    </td>
                  </tr>
                ))
              ) : paginatedQuestions.length === 0 ? (
                // Empty State
                <tr>
                  <td colSpan={6} className="py-12 px-4 text-center">
                    <div className="w-12 h-12 rounded-2xl bg-slate-100 text-slate-400 flex items-center justify-center mx-auto mb-3">
                      <HelpCircle className="w-6 h-6" />
                    </div>
                    <h4 className="text-sm font-bold text-slate-800">
                      Tidak Ada Soal Ditemukan
                    </h4>
                    <p className="text-xs text-slate-400 max-w-sm mx-auto mt-1 leading-relaxed">
                      {searchTerm || levelFilter !== 'all'
                        ? 'Tidak ada butir soal yang cocok dengan filter atau pencarian saat ini.'
                        : 'Belum ada data butir soal aktif di bank soal.'}
                    </p>
                    {(searchTerm || levelFilter !== 'all') && (
                      <button
                        onClick={() => {
                          setSearchTerm('');
                          setLevelFilter('all');
                          setCurrentPage(1);
                        }}
                        className="mt-3 inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-[#0e263e] text-white font-bold text-xs hover:bg-[#1a385c] transition-colors"
                      >
                        <RefreshCw className="w-3.5 h-3.5" />
                        <span>Reset Filter & Pencarian</span>
                      </button>
                    )}
                  </td>
                </tr>
              ) : (
                // Data Rows
                paginatedQuestions.map((q, index) => {
                  const questionNumber =
                    (currentPage - 1) * PAGE_SIZE + index + 1;

                  return (
                    <tr
                      key={q.id}
                      className="hover:bg-slate-50/70 transition-colors group align-top"
                    >
                      {/* # */}
                      <td className="py-5 px-4 text-center text-xs font-bold text-slate-400">
                        {questionNumber}
                      </td>

                      {/* Teks Pertanyaan */}
                      <td className="py-5 px-4">
                        <div className="space-y-1">
                          <p className="font-bold text-slate-900 leading-snug group-hover:text-sky-800 transition-colors">
                            {q.questionText}
                          </p>
                          <span className="text-[11px] font-mono text-slate-400">
                            ID: {q.id.slice(0, 8)}...
                          </span>
                        </div>
                      </td>

                      {/* Jenjang */}
                      <td className="py-5 px-4 text-center">
                        {q.educationLevel === 'high_school' ? (
                          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-bold bg-indigo-50 text-indigo-700 border border-indigo-200/80 shadow-2xs whitespace-nowrap">
                            <span className="w-1.5 h-1.5 rounded-full bg-indigo-500" />
                            <span>High School</span>
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-bold bg-sky-50 text-sky-700 border border-sky-200/80 shadow-2xs whitespace-nowrap">
                            <span className="w-1.5 h-1.5 rounded-full bg-sky-500" />
                            <span>Elementary</span>
                          </span>
                        )}
                      </td>

                      {/* Pilihan Opsi & Kunci Jawaban */}
                      <td className="py-5 px-4">
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                          {q.options.map((opt, optIdx) => {
                            const letter =
                              OPTION_LETTERS[optIdx] || (optIdx + 1).toString();
                            return (
                              <div
                                key={opt.id}
                                className={`flex items-start gap-2 p-2 rounded-xl text-xs border transition-all ${
                                  opt.isCorrect
                                    ? 'bg-emerald-50/90 border-emerald-300 text-emerald-950 font-bold shadow-2xs'
                                    : 'bg-white border-slate-200/80 text-slate-700'
                                }`}
                              >
                                <span
                                  className={`w-5 h-5 rounded-md flex items-center justify-center font-bold text-[11px] flex-shrink-0 ${
                                    opt.isCorrect
                                      ? 'bg-emerald-600 text-white'
                                      : 'bg-slate-100 text-slate-600'
                                  }`}
                                >
                                  {letter}
                                </span>
                                <span className="flex-1 break-words leading-tight">
                                  {opt.optionText}
                                </span>
                                {opt.isCorrect && (
                                  <span className="inline-flex items-center gap-0.5 px-1.5 py-0.5 rounded text-[10px] font-extrabold bg-emerald-100 text-emerald-800 flex-shrink-0">
                                    <Check className="w-2.5 h-2.5 stroke-[3]" />
                                    <span>KUNCI</span>
                                  </span>
                                )}
                              </div>
                            );
                          })}
                        </div>
                      </td>

                      {/* Jumlah Opsi */}
                      <td className="py-5 px-4 text-center">
                        <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-bold bg-slate-100 text-slate-700">
                          {q.options.length} Opsi
                        </span>
                      </td>

                      {/* Aksi: Edit & Soft Delete */}
                      <td className="py-5 px-4 text-center">
                        <div className="inline-flex items-center gap-1.5">
                          {/* Tombol Edit */}
                          <button
                            type="button"
                            onClick={() => {
                              setSelectedQuestionForEdit(q);
                              setIsFormModalOpen(true);
                            }}
                            className="p-2 rounded-xl bg-slate-50 hover:bg-sky-50 text-slate-600 hover:text-sky-700 border border-slate-200/80 hover:border-sky-200 transition-colors shadow-2xs"
                            title="Edit butir soal & opsi"
                          >
                            <Edit3 className="w-4 h-4" />
                          </button>

                          {/* Tombol Soft Delete */}
                          <button
                            type="button"
                            onClick={() => handleOpenDeleteModal(q)}
                            className="p-2 rounded-xl bg-slate-50 hover:bg-rose-50 text-slate-600 hover:text-rose-600 border border-slate-200/80 hover:border-rose-200 transition-colors shadow-2xs"
                            title="Hapus (Nonaktifkan) butir soal"
                          >
                            <Trash2 className="w-4 h-4" />
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

        {/* Pagination Footer */}
        {!isLoading && totalPages > 1 && (
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4 pt-4 border-t border-slate-100 text-xs text-slate-500">
            <div>
              Halaman <strong className="text-slate-800">{currentPage}</strong>{' '}
              dari <strong className="text-slate-800">{totalPages}</strong>
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={() => setCurrentPage((p) => Math.max(p - 1, 1))}
                disabled={currentPage === 1}
                className="inline-flex items-center gap-1 px-3 py-1.5 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 text-slate-700 font-semibold disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
              >
                <ChevronLeft className="w-4 h-4" />
                <span>Sebelumnya</span>
              </button>

              <button
                onClick={() =>
                  setCurrentPage((p) => Math.min(p + 1, totalPages))
                }
                disabled={currentPage === totalPages}
                className="inline-flex items-center gap-1 px-3 py-1.5 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 text-slate-700 font-semibold disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
              >
                <span>Selanjutnya</span>
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Modal Konfirmasi Soft Delete Soal */}
      <QuestionDeleteModal
        isOpen={isDeleteModalOpen}
        onClose={() => setIsDeleteModalOpen(false)}
        question={selectedQuestionForDelete}
        onSuccess={handleDeleteSuccess}
      />

      {/* Modal Form Tambah / Edit Soal (ADM-08) */}
      <QuestionFormModal
        isOpen={isFormModalOpen}
        onClose={() => setIsFormModalOpen(false)}
        questionToEdit={selectedQuestionForEdit}
        defaultEducationLevel={
          levelFilter !== 'all' ? levelFilter : 'elementary'
        }
        onSuccess={handleFormSuccess}
      />
    </div>
  );
}

