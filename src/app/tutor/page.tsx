'use client';

import React, { useState, useEffect, useMemo, useCallback } from 'react';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import {
  Award,
  Clock,
  CheckCircle2,
  AlertCircle,
  Search,
  X,
  LogOut,
  RefreshCw,
  Copy,
  Check,
  ExternalLink,
  GraduationCap,
  Sparkles,
  ArrowUpDown,
  Calendar,
  Layers,
  ChevronLeft,
  ChevronRight,
  TrendingUp,
  RotateCcw,
} from 'lucide-react';
import { createClient } from '@/lib/supabase/client';
import {
  getTutorQueue,
  getAvailableLevels,
  getTutorDashboardStats,
  AvailableLevel,
  TutorDashboardStats,
} from '@/app/actions/tutor';
import { TutorQueueItem } from '@/types';
import { GradeModal } from '@/components/tutor/GradeModal';

const PAGE_SIZE = 10;

export default function TutorDashboardPage() {
  const router = useRouter();

  // State data utama
  const [stats, setStats] = useState<TutorDashboardStats | null>(null);
  const [queue, setQueue] = useState<TutorQueueItem[]>([]);
  const [availableLevels, setAvailableLevels] = useState<AvailableLevel[]>([]);

  // State loading & error
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  // State filter & UI
  const [activeTab, setActiveTab] = useState<'pending' | 'graded' | 'all'>('pending');
  const [searchTerm, setSearchTerm] = useState('');
  const [sortBy, setSortBy] = useState<'date' | 'score' | 'duration' | 'name'>('date');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');
  const [currentPage, setCurrentPage] = useState(1);
  const [copiedId, setCopiedId] = useState<string | null>(null);

  // State modal evaluasi & toast
  const [selectedItemForGrade, setSelectedItemForGrade] = useState<TutorQueueItem | null>(null);
  const [isGradeModalOpen, setIsGradeModalOpen] = useState(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  // Muat data antrean dan statistik tutor
  const loadData = useCallback(async (manual = false) => {
    if (manual) setIsRefreshing(true);
    else setIsLoading(true);
    setErrorMessage(null);

    try {
      const [statsRes, queueRes, levelsRes] = await Promise.all([
        getTutorDashboardStats(),
        getTutorQueue(undefined, 'all'),
        getAvailableLevels(),
      ]);

      if (statsRes.success) {
        setStats(statsRes.data);
      } else {
        setErrorMessage(statsRes.error || 'Gagal memuat profil tutor.');
      }

      if (queueRes.success) {
        setQueue(queueRes.data);
      } else {
        setErrorMessage((prev) => prev || queueRes.error || 'Gagal memuat antrean evaluasi.');
      }

      if (levelsRes.success && levelsRes.data) {
        setAvailableLevels(levelsRes.data);
      }
    } catch (err) {
      console.error('Error saat load data tutor:', err);
      setErrorMessage('Terjadi kendala saat menghubungi server.');
    } finally {
      setIsLoading(false);
      setIsRefreshing(false);
    }
  }, []);

  useEffect(() => {
    loadData();
  }, [loadData]);

  // Handler Logout Staf
  const handleLogout = async () => {
    try {
      const supabase = createClient();
      await supabase.auth.signOut();
      router.refresh();
      router.replace('/admin');
    } catch (err) {
      console.error('Gagal logout:', err);
    }
  };

  // Format Tanggal
  const formatDateTime = (dateStr: string) => {
    try {
      const d = new Date(dateStr);
      return (
        new Intl.DateTimeFormat('id-ID', {
          day: '2-digit',
          month: 'short',
          year: 'numeric',
          hour: '2-digit',
          minute: '2-digit',
          hour12: false,
        }).format(d) + ' WIB'
      );
    } catch {
      return dateStr;
    }
  };

  // Format Nomor WhatsApp (+62 812-3456-7890)
  const formatWhatsAppNumber = (num: string) => {
    const cleaned = num.replace(/\D/g, '');
    if (cleaned.startsWith('62')) {
      const rest = cleaned.slice(2);
      return `+62 ${rest.replace(/(\d{3,4})(\d{3,4})(\d+)?/, '$1-$2-$3').replace(/-$/, '')}`;
    }
    return num;
  };

  // Salin no WA
  const handleCopyWA = (id: string, num: string) => {
    navigator.clipboard.writeText(num);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  // Buka modal evaluasi
  const handleOpenGradeModal = (item: TutorQueueItem) => {
    setSelectedItemForGrade(item);
    setIsGradeModalOpen(true);
  };

  // Callback setelah sukses menetapkan level
  const handleGradeSuccess = (
    sessionId: string,
    assignedLevelId: number,
    levelName: string,
    message: string
  ) => {
    // Update local state queue
    setQueue((prev) =>
      prev.map((item) =>
        item.id === sessionId
          ? {
              ...item,
              status: 'graded',
              assignedLevelId,
              levelName,
            }
          : item
      )
    );

    // Update stats counter
    if (stats) {
      setStats({
        ...stats,
        pendingCount: Math.max(stats.pendingCount - 1, 0),
        gradedCount: stats.gradedCount + 1,
      });
    }

    setToastMessage(message);
    setTimeout(() => setToastMessage(null), 4500);
  };

  // Filter & Pengurutan
  const filteredAndSortedQueue = useMemo(() => {
    let result = [...queue];

    // Filter Tab Status
    if (activeTab === 'pending') {
      result = result.filter((item) => item.status === 'submitted');
    } else if (activeTab === 'graded') {
      result = result.filter(
        (item) => item.status === 'graded' || item.status === 'completed'
      );
    }

    // Filter Search (Nama / WA)
    if (searchTerm.trim() !== '') {
      const q = searchTerm.toLowerCase().trim();
      const qClean = searchTerm.replace(/\D/g, '');
      result = result.filter((item) => {
        const matchName = item.studentName.toLowerCase().includes(q);
        const matchWA =
          item.whatsappNumber.includes(q) ||
          (qClean && item.whatsappNumber.replace(/\D/g, '').includes(qClean));
        return matchName || matchWA;
      });
    }

    // Pengurutan
    result.sort((a, b) => {
      if (sortBy === 'date') {
        const tA = new Date(a.completedAt).getTime();
        const tB = new Date(b.completedAt).getTime();
        return sortOrder === 'asc' ? tA - tB : tB - tA;
      }
      if (sortBy === 'score') {
        return sortOrder === 'asc'
          ? a.finalScorePercent - b.finalScorePercent
          : b.finalScorePercent - a.finalScorePercent;
      }
      if (sortBy === 'duration') {
        const dA = a.durationMinutes ?? 0;
        const dB = b.durationMinutes ?? 0;
        return sortOrder === 'asc' ? dA - dB : dB - dA;
      }
      if (sortBy === 'name') {
        return sortOrder === 'asc'
          ? a.studentName.localeCompare(b.studentName)
          : b.studentName.localeCompare(a.studentName);
      }
      return 0;
    });

    return result;
  }, [queue, activeTab, searchTerm, sortBy, sortOrder]);

  const totalPages = Math.ceil(filteredAndSortedQueue.length / PAGE_SIZE) || 1;
  const paginatedQueue = useMemo(() => {
    const start = (currentPage - 1) * PAGE_SIZE;
    return filteredAndSortedQueue.slice(start, start + PAGE_SIZE);
  }, [filteredAndSortedQueue, currentPage]);

  const getLevelBadge = (levelName: string | null) => {
    if (!levelName) {
      return (
        <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-semibold bg-slate-100 text-slate-500">
          Belum Ditetapkan
        </span>
      );
    }
    const lower = levelName.toLowerCase();
    if (lower.includes('beginner')) {
      return (
        <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-bold bg-emerald-50 text-emerald-700 border border-emerald-200">
          <Sparkles className="w-3 h-3 text-emerald-500" />
          <span>Beginner</span>
        </span>
      );
    }
    if (lower.includes('intermediate')) {
      return (
        <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-bold bg-amber-50 text-amber-700 border border-amber-200">
          <Award className="w-3 h-3 text-amber-500" />
          <span>Intermediate</span>
        </span>
      );
    }
    return (
      <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-bold bg-indigo-50 text-indigo-700 border border-indigo-200">
        <Sparkles className="w-3 h-3 text-indigo-500" />
        <span>Advanced</span>
      </span>
    );
  };

  const pendingCount = queue.filter((item) => item.status === 'submitted').length;
  const gradedCount = queue.filter(
    (item) => item.status === 'graded' || item.status === 'completed'
  ).length;

  return (
    <div className="min-h-screen bg-[#f8fafc] flex flex-col justify-between">
      {/* Toast Notification */}
      {toastMessage && (
        <div className="fixed bottom-6 right-6 z-50 max-w-md bg-slate-900 text-white p-4 rounded-2xl shadow-2xl border border-slate-800 flex items-start gap-3 animate-fade-in">
          <div className="w-8 h-8 rounded-xl bg-emerald-500/20 text-emerald-400 flex items-center justify-center flex-shrink-0 mt-0.5">
            <CheckCircle2 className="w-5 h-5" />
          </div>
          <div className="flex-1 text-xs sm:text-sm">
            <p className="font-bold text-white">Evaluasi Berhasil</p>
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

      {/* Top Navbar */}
      <header className="bg-white border-b border-slate-100 sticky top-0 z-30 shadow-2xs">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 sm:h-20 flex items-center justify-between gap-4">
          {/* Logo & Brand */}
          <div className="flex items-center gap-3">
            <div className="relative w-9 h-9 sm:w-10 sm:h-10 flex-shrink-0">
              <Image
                src="/logo/logo_transparent.png"
                alt="Up Speaking Logo"
                fill
                sizes="40px"
                className="object-contain"
                priority
              />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-sm sm:text-base font-extrabold text-slate-900 tracking-tight">
                  Portal Evaluator Tutor
                </h1>
                <span className="hidden sm:inline-block px-2 py-0.5 text-[10px] font-bold rounded-full bg-sky-50 text-sky-700 border border-sky-200">
                  Up Speaking
                </span>
              </div>
              <p className="text-[11px] sm:text-xs text-slate-500">
                Digitalisasi Penilaian & Rekapitulasi Kemampuan Bahasa Inggris
              </p>
            </div>
          </div>

          {/* Profil Tutor & Aksi */}
          <div className="flex items-center gap-2.5 sm:gap-4">
            {stats && (
              <div className="flex items-center gap-2.5 bg-slate-50 border border-slate-200/80 rounded-2xl px-3 py-1.5">
                <div className="w-8 h-8 rounded-full bg-[#0e263e] text-white font-black text-xs flex items-center justify-center flex-shrink-0">
                  {stats.profile.fullName.charAt(0).toUpperCase()}
                </div>
                <div className="text-left hidden sm:block">
                  <p className="text-xs font-bold text-slate-900 leading-tight">
                    {stats.profile.fullName}
                  </p>
                  <p className="text-[11px] font-semibold text-sky-700 mt-0.5 flex items-center gap-1">
                    <GraduationCap className="w-3 h-3" />
                    <span>
                      {stats.profile.educationLevel === 'high_school'
                        ? 'Tutor High School'
                        : 'Tutor Elementary'}
                    </span>
                  </p>
                </div>
              </div>
            )}

            <button
              onClick={() => loadData(true)}
              disabled={isRefreshing || isLoading}
              className="p-2 sm:px-3 sm:py-2 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 text-slate-700 text-xs font-semibold flex items-center gap-1.5 transition-colors disabled:opacity-50"
              title="Perbarui antrean"
            >
              <RefreshCw
                className={`w-4 h-4 text-slate-500 ${isRefreshing ? 'animate-spin' : ''}`}
              />
              <span className="hidden md:inline">Refresh</span>
            </button>

            <button
              onClick={handleLogout}
              className="p-2 sm:px-3 sm:py-2 rounded-xl bg-rose-50 hover:bg-rose-100 text-rose-700 border border-rose-200/80 text-xs font-bold flex items-center gap-1.5 transition-colors"
              title="Keluar dari akun tutor"
            >
              <LogOut className="w-4 h-4 text-rose-600" />
              <span className="hidden md:inline">Keluar</span>
            </button>
          </div>
        </div>
      </header>

      {/* Main Container */}
      <main className="flex-1 max-w-7xl w-full mx-auto p-4 sm:p-6 lg:p-8 space-y-6 sm:space-y-8">
        {/* Error Alert Banner */}
        {errorMessage && (
          <div className="p-4 rounded-2xl bg-rose-50 border border-rose-200 text-rose-700 text-xs sm:text-sm flex items-center justify-between gap-3 animate-fade-in">
            <div className="flex items-center gap-2">
              <AlertCircle className="w-4 h-4 text-rose-500 flex-shrink-0" />
              <span>{errorMessage}</span>
            </div>
            <button
              onClick={() => setErrorMessage(null)}
              className="p-1 text-rose-400 hover:text-rose-700 transition-colors"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        )}

        {/* Banner Jenjang & Sambutan */}
        <div className="bg-white rounded-3xl border border-slate-100 p-6 sm:p-8 shadow-[0_4px_24px_-4px_rgba(0,0,0,0.04)]">
          <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
            <div className="space-y-1.5">
              <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-sky-50 text-sky-800 border border-sky-200/80">
                <GraduationCap className="w-3.5 h-3.5 text-sky-600" />
                <span>
                  Penugasan Jenjang:{' '}
                  {stats?.profile.educationLevel === 'high_school'
                    ? 'High School (SMP / SMA)'
                    : 'Elementary (SD)'}
                </span>
              </div>
              <h2 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight">
                Antrean Evaluasi Akademik Siswa
              </h2>
              <p className="text-xs sm:text-sm text-slate-500 max-w-2xl leading-relaxed">
                Tinjau data performa objektif siswa (akurasi skor dan durasi aktual pengerjaan), lalu
                tetapkan level kelas resmi secara profesional.
              </p>
            </div>

            {/* Indikator Status Jenjang Tutor */}
            {stats && (
              <div className="flex items-center gap-3 bg-gradient-to-br from-sky-500/10 to-indigo-500/10 p-4 rounded-2xl border border-sky-200/60">
                <div className="w-12 h-12 rounded-xl bg-white text-[#00a6f4] shadow-xs flex items-center justify-center flex-shrink-0">
                  <Award className="w-6 h-6" />
                </div>
                <div>
                  <span className="text-[11px] font-bold uppercase tracking-wider text-slate-500">
                    Otoritas Penilai
                  </span>
                  <p className="text-sm font-extrabold text-slate-900 mt-0.5">
                    {stats.profile.fullName}
                  </p>
                  <p className="text-xs text-sky-700 font-semibold">
                    Spesialis {stats.profile.educationLevel === 'high_school' ? 'High School' : 'Elementary'}
                  </p>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* 3 Kartu Metrik Beban Antrean */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 sm:gap-6">
          {/* Kartu 1: Menunggu Evaluasi */}
          <div className="bg-white rounded-3xl p-6 border border-slate-100 shadow-[0_4px_20px_-4px_rgba(0,0,0,0.04)] relative overflow-hidden">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-amber-700 bg-amber-50 px-2.5 py-1 rounded-full border border-amber-200">
                Prioritas Review
              </span>
              <div className="w-10 h-10 rounded-2xl bg-amber-500/10 text-amber-600 flex items-center justify-center">
                <Clock className="w-5 h-5 animate-pulse" />
              </div>
            </div>
            <div className="mt-4">
              <span className="text-3xl sm:text-4xl font-black text-slate-900 tracking-tight">
                {pendingCount}
              </span>
              <span className="text-xs text-slate-500 font-medium ml-2">siswa</span>
            </div>
            <p className="text-xs text-slate-500 mt-2">
              Siswa yang telah mengumpulkan ujian dan menunggu penetapan level Anda.
            </p>
          </div>

          {/* Kartu 2: Selesai Dinilai */}
          <div className="bg-white rounded-3xl p-6 border border-slate-100 shadow-[0_4px_20px_-4px_rgba(0,0,0,0.04)] relative overflow-hidden">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-emerald-700 bg-emerald-50 px-2.5 py-1 rounded-full border border-emerald-200">
                Selesai Dinilai
              </span>
              <div className="w-10 h-10 rounded-2xl bg-emerald-500/10 text-emerald-600 flex items-center justify-center">
                <CheckCircle2 className="w-5 h-5" />
              </div>
            </div>
            <div className="mt-4">
              <span className="text-3xl sm:text-4xl font-black text-slate-900 tracking-tight">
                {gradedCount}
              </span>
              <span className="text-xs text-slate-500 font-medium ml-2">siswa</span>
            </div>
            <p className="text-xs text-slate-500 mt-2">
              Total sesi siswa yang telah Anda beri penetapan level resmi.
            </p>
          </div>

          {/* Kartu 3: Rata-rata Skor Jenjang */}
          <div className="bg-white rounded-3xl p-6 border border-slate-100 shadow-[0_4px_20px_-4px_rgba(0,0,0,0.04)] relative overflow-hidden">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-indigo-700 bg-indigo-50 px-2.5 py-1 rounded-full border border-indigo-200">
                Rata-rata Nilai
              </span>
              <div className="w-10 h-10 rounded-2xl bg-indigo-500/10 text-indigo-600 flex items-center justify-center">
                <TrendingUp className="w-5 h-5" />
              </div>
            </div>
            <div className="mt-4">
              <span className="text-3xl sm:text-4xl font-black text-slate-900 tracking-tight">
                {stats?.averageScore ?? 0}%
              </span>
              <span className="text-xs text-slate-500 font-medium ml-2">rata-rata</span>
            </div>
            <p className="text-xs text-slate-500 mt-2">
              Akumulasi nilai objektif dari seluruh siswa di jenjang penugasan Anda.
            </p>
          </div>
        </div>

        {/* Tabel Antrean Evaluasi */}
        <div className="bg-white rounded-3xl border border-slate-100 p-6 sm:p-8 shadow-[0_4px_24px_-4px_rgba(0,0,0,0.04)] space-y-6">
          {/* Header & Tabs */}
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-6 border-b border-slate-100">
            <div>
              <h3 className="text-lg font-extrabold text-slate-900 tracking-tight flex items-center gap-2">
                <Layers className="w-5 h-5 text-sky-600" />
                <span>Daftar Antrean Siswa</span>
              </h3>
              <p className="text-xs sm:text-sm text-slate-500 mt-1">
                Pilih siswa untuk meninjau hasil tes dan menentukan level kelas yang sesuai.
              </p>
            </div>

            {/* Tab Filter Status */}
            <div className="flex items-center gap-1.5 p-1 bg-slate-100 rounded-2xl self-start md:self-auto">
              <button
                onClick={() => {
                  setActiveTab('pending');
                  setCurrentPage(1);
                }}
                className={`inline-flex items-center gap-2 px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                  activeTab === 'pending'
                    ? 'bg-white text-slate-900 shadow-xs'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                <span>Menunggu Review</span>
                <span className="px-1.5 py-0.5 rounded-full text-[10px] font-extrabold bg-amber-100 text-amber-800">
                  {pendingCount}
                </span>
              </button>

              <button
                onClick={() => {
                  setActiveTab('graded');
                  setCurrentPage(1);
                }}
                className={`inline-flex items-center gap-2 px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                  activeTab === 'graded'
                    ? 'bg-white text-slate-900 shadow-xs'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                <span>Sudah Dinilai</span>
                <span className="px-1.5 py-0.5 rounded-full text-[10px] font-extrabold bg-emerald-100 text-emerald-800">
                  {gradedCount}
                </span>
              </button>

              <button
                onClick={() => {
                  setActiveTab('all');
                  setCurrentPage(1);
                }}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                  activeTab === 'all'
                    ? 'bg-white text-slate-900 shadow-xs'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                Semua ({queue.length})
              </button>
            </div>
          </div>

          {/* Search & Sort Toolbar */}
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
            {/* Search Input */}
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

            {/* Sort Selector */}
            <div className="flex items-center gap-2">
              <div className="flex items-center gap-1.5 bg-slate-50 border border-slate-200 rounded-xl px-3 py-1.5">
                <ArrowUpDown className="w-3.5 h-3.5 text-slate-400" />
                <select
                  value={`${sortBy}-${sortOrder}`}
                  onChange={(e) => {
                    const [sb, so] = e.target.value.split('-') as [
                      'date' | 'score' | 'duration' | 'name',
                      'asc' | 'desc',
                    ];
                    setSortBy(sb);
                    setSortOrder(so);
                  }}
                  className="bg-transparent text-xs font-semibold text-slate-700 outline-none cursor-pointer pr-1"
                >
                  <option value="date-desc">Terbaru (Waktu Selesai)</option>
                  <option value="date-asc">Terlama (Waktu Selesai)</option>
                  <option value="score-desc">Skor Tertinggi</option>
                  <option value="score-asc">Skor Terendah</option>
                  <option value="duration-asc">Durasi Tercepat</option>
                  <option value="duration-desc">Durasi Terlama</option>
                  <option value="name-asc">Nama (A - Z)</option>
                </select>
              </div>

              {searchTerm && (
                <button
                  onClick={() => setSearchTerm('')}
                  className="px-2.5 py-1.5 text-xs font-semibold text-sky-700 hover:text-sky-800 bg-sky-50 hover:bg-sky-100 rounded-xl border border-sky-200/80 transition-colors"
                >
                  Reset
                </button>
              )}
            </div>
          </div>

          {/* Table Container */}
          <div className="overflow-x-auto rounded-2xl border border-slate-100 shadow-2xs">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-slate-50/80 text-slate-600 text-xs font-bold border-b border-slate-100">
                  <th className="py-3.5 px-4 w-12 text-center">#</th>
                  <th className="py-3.5 px-4 min-w-[130px]">Waktu Selesai</th>
                  <th className="py-3.5 px-4 min-w-[180px]">Nama Siswa</th>
                  <th className="py-3.5 px-4 min-w-[150px]">WhatsApp</th>
                  <th className="py-3.5 px-4 min-w-[110px] text-center">Skor Akurasi</th>
                  <th className="py-3.5 px-4 min-w-[90px] text-center">Durasi</th>
                  <th className="py-3.5 px-4 min-w-[130px] text-center">Status</th>
                  <th className="py-3.5 px-4 min-w-[140px] text-center">Level Resmi</th>
                  <th className="py-3.5 px-4 min-w-[140px] text-center">Aksi Evaluasi</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-xs sm:text-sm">
                {isLoading ? (
                  Array.from({ length: 3 }).map((_, idx) => (
                    <tr key={idx} className="animate-pulse">
                      <td className="py-4 px-4 text-center">
                        <div className="w-4 h-4 bg-slate-200 rounded mx-auto" />
                      </td>
                      <td className="py-4 px-4">
                        <div className="w-24 h-4 bg-slate-200 rounded mb-1" />
                        <div className="w-16 h-3 bg-slate-100 rounded" />
                      </td>
                      <td className="py-4 px-4">
                        <div className="w-32 h-4 bg-slate-200 rounded" />
                      </td>
                      <td className="py-4 px-4">
                        <div className="w-24 h-4 bg-slate-200 rounded" />
                      </td>
                      <td className="py-4 px-4 text-center">
                        <div className="w-16 h-5 bg-slate-200 rounded mx-auto" />
                      </td>
                      <td className="py-4 px-4 text-center">
                        <div className="w-12 h-5 bg-slate-200 rounded mx-auto" />
                      </td>
                      <td className="py-4 px-4 text-center">
                        <div className="w-20 h-6 bg-slate-200 rounded-full mx-auto" />
                      </td>
                      <td className="py-4 px-4 text-center">
                        <div className="w-20 h-6 bg-slate-200 rounded-full mx-auto" />
                      </td>
                      <td className="py-4 px-4 text-center">
                        <div className="w-24 h-8 bg-slate-200 rounded-xl mx-auto" />
                      </td>
                    </tr>
                  ))
                ) : paginatedQueue.length === 0 ? (
                  <tr>
                    <td colSpan={9} className="py-12 px-4 text-center">
                      <div className="w-12 h-12 rounded-2xl bg-slate-100 text-slate-400 flex items-center justify-center mx-auto mb-3">
                        <CheckCircle2 className="w-6 h-6 text-emerald-500" />
                      </div>
                      <h4 className="text-sm font-bold text-slate-800">
                        {activeTab === 'pending'
                          ? 'Tidak Ada Antrean Menunggu Review'
                          : 'Tidak Ada Data Ditemukan'}
                      </h4>
                      <p className="text-xs text-slate-400 max-w-sm mx-auto mt-1 leading-relaxed">
                        {activeTab === 'pending'
                          ? 'Seluruh siswa di jenjang Anda telah selesai dievaluasi! Kerja bagus, Tutor.'
                          : 'Tidak ada data siswa yang cocok dengan kriteria filter saat ini.'}
                      </p>
                      {searchTerm && (
                        <button
                          onClick={() => setSearchTerm('')}
                          className="mt-3 inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-[#0e263e] text-white font-bold text-xs hover:bg-[#1a385c] transition-colors"
                        >
                          <RotateCcw className="w-3.5 h-3.5" />
                          <span>Reset Pencarian</span>
                        </button>
                      )}
                    </td>
                  </tr>
                ) : (
                  paginatedQueue.map((item, index) => {
                    const rowNumber = (currentPage - 1) * PAGE_SIZE + index + 1;
                    const isCopied = copiedId === item.id;
                    const isGraded = item.status === 'graded' || item.status === 'completed';

                    return (
                      <tr
                        key={item.id}
                        className="hover:bg-slate-50/70 transition-colors group"
                      >
                        {/* # */}
                        <td className="py-4 px-4 text-center text-xs font-semibold text-slate-400">
                          {rowNumber}
                        </td>

                        {/* Waktu Selesai */}
                        <td className="py-4 px-4">
                          <div className="flex items-center gap-2">
                            <Calendar className="w-3.5 h-3.5 text-slate-400 flex-shrink-0" />
                            <span className="text-xs font-medium text-slate-700 whitespace-nowrap">
                              {formatDateTime(item.completedAt)}
                            </span>
                          </div>
                        </td>

                        {/* Nama Siswa */}
                        <td className="py-4 px-4">
                          <div className="flex items-center gap-2.5">
                            <div className="w-8 h-8 rounded-full bg-sky-100 text-sky-800 font-bold text-xs flex items-center justify-center flex-shrink-0 shadow-2xs">
                              {item.studentName.charAt(0).toUpperCase()}
                            </div>
                            <span className="font-bold text-slate-900 group-hover:text-sky-700 transition-colors">
                              {item.studentName}
                            </span>
                          </div>
                        </td>

                        {/* Nomor WhatsApp */}
                        <td className="py-4 px-4">
                          <div className="flex items-center gap-2">
                            <span className="font-mono text-xs text-slate-600 font-medium whitespace-nowrap">
                              {formatWhatsAppNumber(item.whatsappNumber)}
                            </span>
                            <div className="flex items-center gap-1">
                              <button
                                type="button"
                                onClick={() => handleCopyWA(item.id, item.whatsappNumber)}
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
                                href={`https://wa.me/${item.whatsappNumber.replace(/\D/g, '')}`}
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

                        {/* Skor Akurasi & Benar/Total */}
                        <td className="py-4 px-4 text-center">
                          <div className="inline-flex flex-col items-center">
                            <span className="text-sm font-extrabold text-slate-900">
                              {item.finalScorePercent}%
                            </span>
                            <span className="text-[11px] font-semibold text-slate-500">
                              ({item.correctAnswers}/{item.totalQuestions})
                            </span>
                          </div>
                        </td>

                        {/* Durasi Pengerjaan Aktual */}
                        <td className="py-4 px-4 text-center">
                          <span className="inline-flex items-center gap-1 text-xs font-bold text-slate-700 bg-slate-100 px-2.5 py-1 rounded-lg whitespace-nowrap">
                            <Clock className="w-3 h-3 text-slate-500" />
                            <span>{item.durationMinutes ?? 0} mnt</span>
                          </span>
                        </td>

                        {/* Status */}
                        <td className="py-4 px-4 text-center">
                          {isGraded ? (
                            <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-bold bg-emerald-50 text-emerald-700 border border-emerald-200 whitespace-nowrap">
                              <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                              <span>Selesai Dinilai</span>
                            </span>
                          ) : (
                            <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-bold bg-amber-50 text-amber-700 border border-amber-200/80 whitespace-nowrap">
                              <Clock className="w-3 h-3 text-amber-500 animate-pulse" />
                              <span>Menunggu Review</span>
                            </span>
                          )}
                        </td>

                        {/* Level Resmi */}
                        <td className="py-4 px-4 text-center">
                          {getLevelBadge(item.levelName)}
                        </td>

                        {/* Tombol Aksi Evaluasi */}
                        <td className="py-4 px-4 text-center">
                          {isGraded ? (
                            <button
                              type="button"
                              onClick={() => handleOpenGradeModal(item)}
                              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 text-slate-700 font-bold text-xs transition-colors shadow-2xs"
                              title="Tinjau atau perbarui level resmi"
                            >
                              <Award className="w-3.5 h-3.5 text-slate-500" />
                              <span>Ubah Level</span>
                            </button>
                          ) : (
                            <button
                              type="button"
                              onClick={() => handleOpenGradeModal(item)}
                              className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-[#00a6f4] hover:bg-[#0095dc] text-white font-bold text-xs transition-colors shadow-2xs active:scale-95 cursor-pointer"
                              title="Buka form evaluasi dan tetapkan level resmi"
                            >
                              <Award className="w-3.5 h-3.5" />
                              <span>Evaluasi</span>
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

          {/* Pagination */}
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
        </div>
      </main>

      {/* Modal Evaluasi & Penetapan Level (T3) */}
      <GradeModal
        isOpen={isGradeModalOpen}
        onClose={() => setIsGradeModalOpen(false)}
        item={selectedItemForGrade}
        availableLevels={availableLevels}
        onSuccess={handleGradeSuccess}
      />
    </div>
  );
}
