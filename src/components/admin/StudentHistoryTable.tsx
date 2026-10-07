'use client';

import React, { useState, useMemo, useEffect } from 'react';
import {
  Search,
  Filter,
  X,
  FileSpreadsheet,
  FileText,
  Copy,
  Check,
  ExternalLink,
  RotateCcw,
  CheckCircle2,
  Calendar,
  ChevronLeft,
  ChevronRight,
  ArrowUpDown,
  XCircle,
  Loader2,
  RefreshCw,
  GraduationCap,
  Clock,
} from 'lucide-react';
import { StudentHistoryRecord } from '@/app/actions/admin';
import { RetestConfirmModal } from '@/components/admin/RetestConfirmModal';
import { exportToExcel, exportToPDF } from '@/lib/export';
import { EducationLevel, TestSessionStatus } from '@/types';

interface StudentHistoryTableProps {
  data: StudentHistoryRecord[];
  isLoading?: boolean;
  onRefresh?: () => void;
  isRefreshing?: boolean;
  onAllowRetest?: (record: StudentHistoryRecord) => void;
}

const PAGE_SIZE = 10;

export const StudentHistoryTable: React.FC<StudentHistoryTableProps> = ({
  data = [],
  isLoading = false,
  onRefresh,
  isRefreshing = false,
  onAllowRetest,
}) => {
  const [localData, setLocalData] = useState<StudentHistoryRecord[]>(data);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedStatus, setSelectedStatus] = useState<string>('all');
  const [selectedLevel, setSelectedLevel] = useState<string>('all');
  const [selectedEducationLevel, setSelectedEducationLevel] =
    useState<'all' | EducationLevel>('all');
  const [currentPage, setCurrentPage] = useState(1);
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [sortBy, setSortBy] = useState<'date' | 'score' | 'name' | 'duration'>('date');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');

  // State Modal Retest & Toast
  const [selectedRecordForRetest, setSelectedRecordForRetest] =
    useState<StudentHistoryRecord | null>(null);
  const [isRetestModalOpen, setIsRetestModalOpen] = useState(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const [isExportingExcel, setIsExportingExcel] = useState(false);
  const [isExportingPDF, setIsExportingPDF] = useState(false);

  // Selaraskan localData jika data dari parent diperbarui
  useEffect(() => {
    setLocalData(data);
  }, [data]);

  // Format Tanggal & Jam (WIB)
  const formatDateTime = (dateString: string) => {
    try {
      const date = new Date(dateString);
      return (
        new Intl.DateTimeFormat('id-ID', {
          day: '2-digit',
          month: 'short',
          year: 'numeric',
          hour: '2-digit',
          minute: '2-digit',
          hour12: false,
        }).format(date) + ' WIB'
      );
    } catch {
      return dateString;
    }
  };

  // Format Nomor WhatsApp agar mudah dibaca (+62 812-3456-7890)
  const formatWhatsAppNumber = (num: string) => {
    const cleaned = num.replace(/\D/g, '');
    if (cleaned.startsWith('62')) {
      const rest = cleaned.slice(2);
      return `+62 ${rest.replace(/(\d{3,4})(\d{3,4})(\d+)?/, '$1-$2-$3').replace(/-$/, '')}`;
    }
    return num;
  };

  // Salin nomor WA ke clipboard
  const handleCopyWA = (id: string, num: string) => {
    navigator.clipboard.writeText(num);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  // Buka modal retest
  const handleOpenRetestModal = (record: StudentHistoryRecord) => {
    if (onAllowRetest) {
      onAllowRetest(record);
      return;
    }
    setSelectedRecordForRetest(record);
    setIsRetestModalOpen(true);
  };

  // Callback sukses setelah izin retest diubah di server
  const handleRetestSuccess = (
    sessionId: string,
    newCanRetest: boolean,
    message: string
  ) => {
    setLocalData((prev) =>
      prev.map((item) =>
        item.id === sessionId ? { ...item, canRetest: newCanRetest } : item
      )
    );
    setToastMessage(message);
    setTimeout(() => {
      setToastMessage(null);
    }, 4500);
    onRefresh?.();
  };

  // Handler Ekspor Excel
  const handleExportExcel = () => {
    if (filteredAndSortedData.length === 0) {
      alert('Tidak ada data siswa yang cocok dengan kriteria filter saat ini untuk diekspor.');
      return;
    }
    setIsExportingExcel(true);
    try {
      exportToExcel(filteredAndSortedData, {
        status: selectedStatus,
        level: selectedLevel,
        educationLevel: selectedEducationLevel,
        search: searchTerm,
      });
      setToastMessage(
        `Berhasil mengekspor ${filteredAndSortedData.length} data riwayat siswa ke Excel (.xlsx)!`
      );
      setTimeout(() => setToastMessage(null), 4000);
    } catch (err) {
      console.error('Gagal mengekspor data ke Excel:', err);
      alert('Terjadi kesalahan saat membuat file Excel. Silakan coba lagi.');
    } finally {
      setIsExportingExcel(false);
    }
  };

  // Handler Ekspor PDF
  const handleExportPDF = () => {
    if (filteredAndSortedData.length === 0) {
      alert('Tidak ada data siswa yang cocok dengan kriteria filter saat ini untuk dicetak ke PDF.');
      return;
    }
    setIsExportingPDF(true);
    try {
      exportToPDF(filteredAndSortedData, {
        status: selectedStatus,
        level: selectedLevel,
        educationLevel: selectedEducationLevel,
        search: searchTerm,
      });
      setToastMessage(
        `Berhasil mengunduh dokumen cetak PDF untuk ${filteredAndSortedData.length} siswa!`
      );
      setTimeout(() => setToastMessage(null), 4000);
    } catch (err) {
      console.error('Gagal mengekspor data ke PDF:', err);
      alert('Terjadi kesalahan saat memproses dokumen PDF. Silakan coba lagi.');
    } finally {
      setIsExportingPDF(false);
    }
  };

  // Filter & Pengurutan Data
  const filteredAndSortedData = useMemo(() => {
    let result = [...localData];

    // Filter Status Sesi
    if (selectedStatus !== 'all') {
      result = result.filter((item) => item.status === selectedStatus);
    }

    // Filter Jenjang Pendidikan (Elementary vs High School)
    if (selectedEducationLevel !== 'all') {
      result = result.filter(
        (item) => item.educationLevel === selectedEducationLevel
      );
    }

    // Filter Level Penempatan
    if (selectedLevel !== 'all') {
      result = result.filter(
        (item) => item.levelName.toLowerCase() === selectedLevel.toLowerCase()
      );
    }

    // Filter Search (Nama atau No. WA)
    if (searchTerm.trim() !== '') {
      const q = searchTerm.toLowerCase().trim();
      const qCleanNum = searchTerm.replace(/\D/g, '');
      result = result.filter((item) => {
        const matchName = item.studentName.toLowerCase().includes(q);
        const matchWA =
          item.whatsappNumber.includes(q) ||
          (qCleanNum &&
            item.whatsappNumber.replace(/\D/g, '').includes(qCleanNum));
        return matchName || matchWA;
      });
    }

    // Pengurutan
    result.sort((a, b) => {
      if (sortBy === 'date') {
        const timeA = new Date(a.completedAt).getTime();
        const timeB = new Date(b.completedAt).getTime();
        return sortOrder === 'asc' ? timeA - timeB : timeB - timeA;
      }
      if (sortBy === 'score') {
        return sortOrder === 'asc'
          ? a.finalScorePercent - b.finalScorePercent
          : b.finalScorePercent - a.finalScorePercent;
      }
      if (sortBy === 'name') {
        return sortOrder === 'asc'
          ? a.studentName.localeCompare(b.studentName)
          : b.studentName.localeCompare(a.studentName);
      }
      if (sortBy === 'duration') {
        const durA = a.durationMinutes ?? 0;
        const durB = b.durationMinutes ?? 0;
        return sortOrder === 'asc' ? durA - durB : durB - durA;
      }
      return 0;
    });

    return result;
  }, [localData, selectedStatus, selectedEducationLevel, selectedLevel, searchTerm, sortBy, sortOrder]);

  // Pagination calculation
  const totalPages = Math.ceil(filteredAndSortedData.length / PAGE_SIZE) || 1;
  const paginatedData = useMemo(() => {
    const start = (currentPage - 1) * PAGE_SIZE;
    return filteredAndSortedData.slice(start, start + PAGE_SIZE);
  }, [filteredAndSortedData, currentPage]);

  const handleResetFilters = () => {
    setSearchTerm('');
    setSelectedStatus('all');
    setSelectedLevel('all');
    setSelectedEducationLevel('all');
    setCurrentPage(1);
  };

  const getStatusBadge = (status: TestSessionStatus) => {
    switch (status) {
      case 'submitted':
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-bold bg-amber-50 text-amber-700 border border-amber-200/80 shadow-2xs whitespace-nowrap">
            <Clock className="w-3 h-3 text-amber-500 animate-pulse" />
            <span>Menunggu Review</span>
          </span>
        );
      case 'graded':
      case 'completed':
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-bold bg-emerald-50 text-emerald-700 border border-emerald-200/80 shadow-2xs whitespace-nowrap">
            <CheckCircle2 className="w-3 h-3 text-emerald-600" />
            <span>Selesai Dinilai</span>
          </span>
        );
      case 'in_progress':
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-bold bg-sky-50 text-sky-700 border border-sky-200/80 shadow-2xs whitespace-nowrap">
            <span className="w-1.5 h-1.5 rounded-full bg-sky-500 animate-ping" />
            <span>Mengerjakan</span>
          </span>
        );
      case 'registered':
      default:
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-bold bg-slate-100 text-slate-700 border border-slate-200 shadow-2xs whitespace-nowrap">
            <span className="w-1.5 h-1.5 rounded-full bg-slate-400" />
            <span>Terdaftar</span>
          </span>
        );
    }
  };

  const getLevelBadge = (levelName: string) => {
    const lower = levelName.toLowerCase();
    if (lower.includes('beginner')) {
      return (
        <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-bold bg-emerald-50 text-emerald-700 border border-emerald-200/80">
          Beginner
        </span>
      );
    }
    if (lower.includes('intermediate')) {
      return (
        <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-bold bg-amber-50 text-amber-700 border border-amber-200/80">
          Intermediate
        </span>
      );
    }
    if (lower.includes('advanced')) {
      return (
        <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-bold bg-indigo-50 text-indigo-700 border border-indigo-200/80">
          Advanced
        </span>
      );
    }
    return (
      <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-bold bg-slate-100 text-slate-700 border border-slate-200">
        {levelName}
      </span>
    );
  };

  return (
    <div className="bg-white rounded-3xl border border-slate-100 p-6 sm:p-8 shadow-[0_4px_24px_-4px_rgba(0,0,0,0.04)] space-y-6 relative">
      {/* Toast Notifikasi Berhasil (Retest Permission Toast) */}
      {toastMessage && (
        <div className="fixed bottom-6 right-6 z-50 max-w-md bg-slate-900 text-white p-4 rounded-2xl shadow-2xl border border-slate-800 flex items-start gap-3 animate-fade-in">
          <div className="w-8 h-8 rounded-xl bg-emerald-500/20 text-emerald-400 flex items-center justify-center flex-shrink-0 mt-0.5">
            <CheckCircle2 className="w-5 h-5" />
          </div>
          <div className="flex-1 text-xs sm:text-sm">
            <p className="font-bold text-white">Status Izin Diperbarui</p>
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

      {/* Header Bagian Atas: Judul, Info Rekap, dan Tombol Ekspor */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 pb-6 border-b border-slate-100">
        <div>
          <h3 className="text-lg sm:text-xl font-extrabold text-slate-900 tracking-tight flex items-center gap-2">
            <FileSpreadsheet className="w-5 h-5 text-sky-600" />
            <span>Riwayat Hasil Siswa & Rekapitulasi</span>
          </h3>
          <p className="text-xs sm:text-sm text-slate-500 mt-1">
            Menampilkan data peserta yang telah menyelesaikan ujian penempatan beserta kontrol izin tes ulang.
          </p>
        </div>

        {/* Tombol Ekspor (Task ADM-06) */}
        <div className="flex flex-wrap items-center gap-2.5">
          <button
            type="button"
            disabled={isExportingExcel || isExportingPDF || isLoading}
            className="inline-flex items-center gap-2 px-3.5 py-2 rounded-xl bg-slate-50 hover:bg-slate-100 text-slate-700 font-semibold text-xs transition-colors border border-slate-200/80 shadow-2xs disabled:opacity-50"
            title="Unduh seluruh data terfilter ke spreadsheet Excel (.xlsx)"
            onClick={handleExportExcel}
          >
            {isExportingExcel ? (
              <Loader2 className="w-4 h-4 text-emerald-600 animate-spin" />
            ) : (
              <FileSpreadsheet className="w-4 h-4 text-emerald-600" />
            )}
            <span>{isExportingExcel ? 'Mengunduh...' : 'Ekspor Excel'}</span>
          </button>

          <button
            type="button"
            disabled={isExportingExcel || isExportingPDF || isLoading}
            className="inline-flex items-center gap-2 px-3.5 py-2 rounded-xl bg-slate-50 hover:bg-slate-100 text-slate-700 font-semibold text-xs transition-colors border border-slate-200/80 shadow-2xs disabled:opacity-50"
            title="Cetak & unduh laporan resmi ke dokumen PDF (.pdf)"
            onClick={handleExportPDF}
          >
            {isExportingPDF ? (
              <Loader2 className="w-4 h-4 text-rose-600 animate-spin" />
            ) : (
              <FileText className="w-4 h-4 text-rose-600" />
            )}
            <span>{isExportingPDF ? 'Membuat PDF...' : 'Ekspor PDF'}</span>
          </button>

          {onRefresh && (
            <button
              type="button"
              disabled={isRefreshing || isLoading}
              className="inline-flex items-center gap-2 px-3 py-2 rounded-xl bg-slate-50 hover:bg-slate-100 text-slate-700 font-semibold text-xs transition-colors border border-slate-200/80 shadow-2xs disabled:opacity-50"
              title="Perbarui data"
              onClick={onRefresh}
            >
              <RefreshCw className={`w-4 h-4 text-slate-500 ${isRefreshing ? 'animate-spin' : ''}`} />
              <span className="hidden sm:inline">Refresh</span>
            </button>
          )}
        </div>
      </div>

      {/* Toolbar Filter & Pencarian */}
      <div className="flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3">
        {/* Search Bar Instan */}
        <div className="relative flex-1 max-w-md">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => {
              setSearchTerm(e.target.value);
              setCurrentPage(1);
            }}
            placeholder="Cari nama siswa atau no. WhatsApp..."
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

        {/* Dropdown Filter Status, Jenjang, Level & Urutan */}
        <div className="flex flex-wrap items-center gap-2.5">
          {/* Filter Status Sesi */}
          <div className="flex items-center gap-2 bg-slate-50 border border-slate-200 rounded-xl px-3 py-1.5">
            <Clock className="w-3.5 h-3.5 text-slate-400" />
            <select
              value={selectedStatus}
              onChange={(e) => {
                setSelectedStatus(e.target.value);
                setCurrentPage(1);
              }}
              className="bg-transparent text-xs font-semibold text-slate-700 outline-none cursor-pointer pr-1"
            >
              <option value="all">Semua Status</option>
              <option value="submitted">Menunggu Review</option>
              <option value="graded">Selesai Dinilai</option>
              <option value="in_progress">Sedang Mengerjakan</option>
              <option value="registered">Terdaftar</option>
            </select>
          </div>

          {/* Filter Jenjang Pendidikan */}
          <div className="flex items-center gap-2 bg-slate-50 border border-slate-200 rounded-xl px-3 py-1.5">
            <GraduationCap className="w-3.5 h-3.5 text-slate-400" />
            <select
              value={selectedEducationLevel}
              onChange={(e) => {
                setSelectedEducationLevel(e.target.value as 'all' | EducationLevel);
                setCurrentPage(1);
              }}
              className="bg-transparent text-xs font-semibold text-slate-700 outline-none cursor-pointer pr-1"
            >
              <option value="all">Semua Jenjang</option>
              <option value="elementary">Elementary (SD)</option>
              <option value="high_school">High School</option>
            </select>
          </div>

          {/* Filter Level */}
          <div className="flex items-center gap-2 bg-slate-50 border border-slate-200 rounded-xl px-3 py-1.5">
            <Filter className="w-3.5 h-3.5 text-slate-400" />
            <select
              value={selectedLevel}
              onChange={(e) => {
                setSelectedLevel(e.target.value);
                setCurrentPage(1);
              }}
              className="bg-transparent text-xs font-semibold text-slate-700 outline-none cursor-pointer pr-1"
            >
              <option value="all">Semua Level</option>
              <option value="Beginner">Beginner</option>
              <option value="Intermediate">Intermediate</option>
              <option value="Advanced">Advanced</option>
            </select>
          </div>

          {/* Pengurutan */}
          <div className="flex items-center gap-1.5 bg-slate-50 border border-slate-200 rounded-xl px-3 py-1.5">
            <ArrowUpDown className="w-3.5 h-3.5 text-slate-400" />
            <select
              value={`${sortBy}-${sortOrder}`}
              onChange={(e) => {
                const [sb, so] = e.target.value.split('-') as [
                  'date' | 'score' | 'name' | 'duration',
                  'asc' | 'desc',
                ];
                setSortBy(sb);
                setSortOrder(so);
              }}
              className="bg-transparent text-xs font-semibold text-slate-700 outline-none cursor-pointer pr-1"
            >
              <option value="date-desc">Terbaru (Waktu)</option>
              <option value="date-asc">Terlama (Waktu)</option>
              <option value="score-desc">Skor Tertinggi</option>
              <option value="score-asc">Skor Terendah</option>
              <option value="duration-asc">Durasi Tercepat</option>
              <option value="duration-desc">Durasi Terlama</option>
              <option value="name-asc">Nama (A - Z)</option>
              <option value="name-desc">Nama (Z - A)</option>
            </select>
          </div>

          {(searchTerm || selectedStatus !== 'all' || selectedLevel !== 'all' || selectedEducationLevel !== 'all') && (
            <button
              onClick={handleResetFilters}
              className="px-2.5 py-1.5 text-xs font-semibold text-sky-700 hover:text-sky-800 bg-sky-50 hover:bg-sky-100 rounded-xl border border-sky-200/80 transition-colors"
            >
              Reset
            </button>
          )}
        </div>
      </div>

      {/* Ringkasan Jumlah Filter */}
      <div className="flex items-center justify-between text-xs text-slate-500 px-1">
        <span>
          Menampilkan{' '}
          <strong className="text-slate-800 font-bold">
            {filteredAndSortedData.length}
          </strong>{' '}
          dari {localData.length} hasil ujian siswa
        </span>
      </div>

      {/* Tabel Data Responsif */}
      <div className="overflow-x-auto rounded-2xl border border-slate-100 shadow-2xs">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="bg-slate-50/80 text-slate-600 text-xs font-bold border-b border-slate-100">
              <th className="py-3.5 px-4 w-12 text-center">#</th>
              <th className="py-3.5 px-4 min-w-[130px]">Waktu</th>
              <th className="py-3.5 px-4 min-w-[170px]">Nama Lengkap</th>
              <th className="py-3.5 px-4 min-w-[150px]">Nomor WhatsApp</th>
              <th className="py-3.5 px-4 min-w-[110px] text-center">Jenjang</th>
              <th className="py-3.5 px-4 min-w-[130px] text-center">Status Sesi</th>
              <th className="py-3.5 px-4 min-w-[90px] text-center">Durasi</th>
              <th className="py-3.5 px-4 min-w-[100px] text-center">Benar / Total</th>
              <th className="py-3.5 px-4 min-w-[90px] text-center">Skor Akhir</th>
              <th className="py-3.5 px-4 min-w-[120px] text-center">Level Siswa</th>
              <th className="py-3.5 px-4 min-w-[130px] text-center">Tutor Penilai</th>
              <th className="py-3.5 px-4 min-w-[130px] text-center">Aksi Retest</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100 text-xs sm:text-sm">
            {isLoading ? (
              // Loading Skeleton
              Array.from({ length: 3 }).map((_, idx) => (
                <tr key={idx} className="animate-pulse">
                  <td className="py-4 px-4 text-center">
                    <div className="w-4 h-4 bg-slate-200 rounded mx-auto" />
                  </td>
                  <td className="py-4 px-4">
                    <div className="w-28 h-4 bg-slate-200 rounded mb-1" />
                    <div className="w-16 h-3 bg-slate-100 rounded" />
                  </td>
                  <td className="py-4 px-4">
                    <div className="w-32 h-4 bg-slate-200 rounded" />
                  </td>
                  <td className="py-4 px-4">
                    <div className="w-24 h-4 bg-slate-200 rounded" />
                  </td>
                  <td className="py-4 px-4 text-center">
                    <div className="w-20 h-6 bg-slate-200 rounded-full mx-auto" />
                  </td>
                  <td className="py-4 px-4 text-center">
                    <div className="w-24 h-6 bg-slate-200 rounded-full mx-auto" />
                  </td>
                  <td className="py-4 px-4 text-center">
                    <div className="w-16 h-6 bg-slate-200 rounded-lg mx-auto" />
                  </td>
                  <td className="py-4 px-4 text-center">
                    <div className="w-16 h-4 bg-slate-200 rounded mx-auto" />
                  </td>
                  <td className="py-4 px-4 text-center">
                    <div className="w-12 h-6 bg-slate-200 rounded-full mx-auto" />
                  </td>
                  <td className="py-4 px-4 text-center">
                    <div className="w-20 h-6 bg-slate-200 rounded-full mx-auto" />
                  </td>
                  <td className="py-4 px-4 text-center">
                    <div className="w-20 h-6 bg-slate-200 rounded-full mx-auto" />
                  </td>
                  <td className="py-4 px-4 text-center">
                    <div className="w-20 h-7 bg-slate-200 rounded-xl mx-auto" />
                  </td>
                </tr>
              ))
            ) : paginatedData.length === 0 ? (
              // Empty State
              <tr>
                <td colSpan={12} className="py-12 px-4 text-center">
                  <div className="w-12 h-12 rounded-2xl bg-slate-100 text-slate-400 flex items-center justify-center mx-auto mb-3">
                    <Search className="w-6 h-6" />
                  </div>
                  <h4 className="text-sm font-bold text-slate-800">
                    Tidak Ada Hasil Ditemukan
                  </h4>
                  <p className="text-xs text-slate-400 max-w-sm mx-auto mt-1 leading-relaxed">
                    {searchTerm || selectedStatus !== 'all' || selectedLevel !== 'all' || selectedEducationLevel !== 'all'
                      ? 'Tidak ada data peserta yang cocok dengan kriteria pencarian atau filter yang dipilih.'
                      : 'Belum ada data siswa di sistem.'}
                  </p>
                  {(searchTerm || selectedStatus !== 'all' || selectedLevel !== 'all' || selectedEducationLevel !== 'all') && (
                    <button
                      onClick={handleResetFilters}
                      className="mt-3 inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-[#0e263e] text-white font-bold text-xs hover:bg-[#1a385c] transition-colors"
                    >
                      <RotateCcw className="w-3.5 h-3.5" />
                      <span>Reset Pencarian</span>
                    </button>
                  )}
                </td>
              </tr>
            ) : (
              // Data Rows
              paginatedData.map((row, index) => {
                const rowNumber = (currentPage - 1) * PAGE_SIZE + index + 1;
                const isCopied = copiedId === row.id;
                const isFinished =
                  row.status === 'submitted' || row.status === 'graded' || row.status === 'completed';

                return (
                  <tr
                    key={row.id}
                    className="hover:bg-slate-50/70 transition-colors group"
                  >
                    {/* # */}
                    <td className="py-4 px-4 text-center text-xs font-semibold text-slate-400">
                      {rowNumber}
                    </td>

                    {/* Tanggal & Waktu */}
                    <td className="py-4 px-4">
                      <div className="flex items-center gap-2">
                        <Calendar className="w-3.5 h-3.5 text-slate-400 flex-shrink-0" />
                        <span className="text-xs font-medium text-slate-700 whitespace-nowrap">
                          {formatDateTime(row.completedAt)}
                        </span>
                      </div>
                    </td>

                    {/* Nama Lengkap Siswa */}
                    <td className="py-4 px-4">
                      <div className="flex items-center gap-2.5">
                        <div className="w-8 h-8 rounded-full bg-sky-100 text-sky-800 font-bold text-xs flex items-center justify-center flex-shrink-0 shadow-2xs">
                          {row.studentName.charAt(0).toUpperCase()}
                        </div>
                        <span className="font-bold text-slate-900 group-hover:text-sky-700 transition-colors">
                          {row.studentName}
                        </span>
                      </div>
                    </td>

                    {/* Nomor WhatsApp */}
                    <td className="py-4 px-4">
                      <div className="flex items-center gap-2">
                        <span className="font-mono text-xs text-slate-600 font-medium whitespace-nowrap">
                          {formatWhatsAppNumber(row.whatsappNumber)}
                        </span>
                        <div className="flex items-center gap-1">
                          <button
                            type="button"
                            onClick={() => handleCopyWA(row.id, row.whatsappNumber)}
                            className="p-1 rounded-md text-slate-400 hover:text-slate-700 hover:bg-slate-200/60 transition-colors"
                            title="Salin nomor WhatsApp"
                          >
                            {isCopied ? (
                              <Check className="w-3.5 h-3.5 text-emerald-600" />
                            ) : (
                              <Copy className="w-3.5 h-3.5" />
                            )}
                          </button>
                          <a
                            href={`https://wa.me/${row.whatsappNumber.replace(/\D/g, '')}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="p-1 rounded-md text-emerald-600 hover:text-emerald-700 hover:bg-emerald-50 transition-colors"
                            title="Buka chat WhatsApp"
                          >
                            <ExternalLink className="w-3.5 h-3.5" />
                          </a>
                        </div>
                      </div>
                    </td>

                    {/* Jenjang Pendidikan */}
                    <td className="py-4 px-4 text-center">
                      {row.educationLevel === 'high_school' ? (
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

                    {/* Status Sesi */}
                    <td className="py-4 px-4 text-center">
                      {getStatusBadge(row.status)}
                    </td>

                    {/* Durasi Pengerjaan Riil */}
                    <td className="py-4 px-4 text-center">
                      {row.status === 'in_progress' ? (
                        <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-sky-600 bg-sky-50 px-2 py-0.5 rounded-md whitespace-nowrap">
                          <Clock className="w-3 h-3 text-sky-500 animate-spin" />
                          <span>Berjalan...</span>
                        </span>
                      ) : row.durationMinutes !== null && row.durationMinutes !== undefined ? (
                        <span className="inline-flex items-center gap-1 text-xs font-bold text-slate-700 bg-slate-100 px-2.5 py-1 rounded-lg whitespace-nowrap">
                          <Clock className="w-3 h-3 text-slate-500" />
                          <span>{row.durationMinutes} mnt</span>
                        </span>
                      ) : (
                        <span className="text-xs text-slate-400 font-mono">-</span>
                      )}
                    </td>

                    {/* Benar / Total */}
                    <td className="py-4 px-4 text-center">
                      {isFinished ? (
                        <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-slate-100 text-slate-700 whitespace-nowrap">
                          <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                          <span>
                            {row.correctAnswers} / {row.totalQuestions}
                          </span>
                        </span>
                      ) : (
                        <span className="text-xs text-slate-400 font-mono">-</span>
                      )}
                    </td>

                    {/* Skor Akhir (%) */}
                    <td className="py-4 px-4 text-center">
                      {isFinished ? (
                        <span className="text-sm font-extrabold text-slate-900">
                          {row.finalScorePercent}%
                        </span>
                      ) : (
                        <span className="text-xs text-slate-400 font-mono">-</span>
                      )}
                    </td>

                    {/* Level Siswa */}
                    <td className="py-4 px-4 text-center">
                      {row.status === 'graded' || row.status === 'completed' ? (
                        getLevelBadge(row.levelName)
                      ) : row.status === 'submitted' ? (
                        <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-bold bg-amber-50 text-amber-700 border border-amber-200/80 shadow-2xs whitespace-nowrap">
                          Menunggu Review
                        </span>
                      ) : row.status === 'in_progress' ? (
                        <span className="text-xs text-slate-400 italic">Sedang Ujian</span>
                      ) : (
                        <span className="text-xs text-slate-400 italic">Belum Ujian</span>
                      )}
                    </td>

                    {/* Tutor Penilai */}
                    <td className="py-4 px-4 text-center">
                      {row.reviewerName ? (
                        <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-slate-100/90 border border-slate-200/80">
                          <div className="w-4 h-4 rounded-full bg-[#0e263e] text-white font-bold text-[9px] flex items-center justify-center flex-shrink-0">
                            {row.reviewerName.charAt(0).toUpperCase()}
                          </div>
                          <span className="text-xs font-semibold text-slate-700 whitespace-nowrap">
                            {row.reviewerName}
                          </span>
                        </div>
                      ) : row.status === 'submitted' ? (
                        <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-amber-700 bg-amber-50 px-2 py-0.5 rounded-full border border-amber-200/60 whitespace-nowrap">
                          <Clock className="w-3 h-3 text-amber-500" />
                          <span>Antrean Evaluasi</span>
                        </span>
                      ) : (
                        <span className="text-xs text-slate-400 font-mono">-</span>
                      )}
                    </td>

                    {/* Aksi Retest */}
                    <td className="py-4 px-4 text-center">
                      {row.canRetest ? (
                        <div className="inline-flex items-center gap-1.5">
                          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-bold bg-sky-50 text-sky-700 border border-sky-200/80">
                            <Check className="w-3 h-3" />
                            <span>Izin Aktif</span>
                          </span>
                          <button
                            type="button"
                            onClick={() => handleOpenRetestModal(row)}
                            className="p-1 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-rose-50 transition-colors"
                            title="Cabut izin tes ulang"
                          >
                            <XCircle className="w-4 h-4" />
                          </button>
                        </div>
                      ) : (
                        <button
                          type="button"
                          onClick={() => handleOpenRetestModal(row)}
                          className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-50 hover:bg-sky-50 text-slate-700 hover:text-sky-700 border border-slate-200/80 hover:border-sky-200 text-xs font-bold transition-all shadow-2xs"
                          title="Buka izin 1x tes baru untuk siswa ini"
                        >
                          <RotateCcw className="w-3.5 h-3.5 text-slate-500 hover:text-sky-600" />
                          <span>Izinkan Tes</span>
                        </button>
                      )}
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
            Halaman <strong className="text-slate-800">{currentPage}</strong> dari{' '}
            <strong className="text-slate-800">{totalPages}</strong>
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
              onClick={() => setCurrentPage((p) => Math.min(p + 1, totalPages))}
              disabled={currentPage === totalPages}
              className="inline-flex items-center gap-1 px-3 py-1.5 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 text-slate-700 font-semibold disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
            >
              <span>Selanjutnya</span>
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}

      {/* Modal Dialog Konfirmasi Retest Permission (ADM-05) */}
      <RetestConfirmModal
        isOpen={isRetestModalOpen}
        onClose={() => setIsRetestModalOpen(false)}
        record={selectedRecordForRetest}
        onSuccess={handleRetestSuccess}
      />
    </div>
  );
};
