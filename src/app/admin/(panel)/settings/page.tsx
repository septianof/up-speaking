'use client';

import React, { useEffect, useState, useCallback } from 'react';
import {
  Settings,
  Clock,
  BookOpen,
  TrendingUp,
  Award,
  Save,
  RotateCcw,
  CheckCircle2,
  AlertCircle,
  Loader2,
  RefreshCw,
  Sliders,
  Check,
  X,
  ShieldCheck,
  GraduationCap,
  Phone,
  User,
  MessageCircle,
  AlertTriangle,
} from 'lucide-react';
import {
  getExamSettings,
  updateExamSettings,
  LevelSetting,
  TutorContactSetting,
} from '@/app/actions/settings';

export default function AdminSettingsPage() {
  const [durationMinutes, setDurationMinutes] = useState<number>(45);
  const [levels, setLevels] = useState<LevelSetting[]>([]);
  const [tutorElementary, setTutorElementary] = useState<TutorContactSetting>({
    name: 'Miss Sarah',
    whatsapp: '6281234567890',
  });
  const [tutorHighSchool, setTutorHighSchool] = useState<TutorContactSetting>({
    name: 'Mr. David',
    whatsapp: '6289876543210',
  });

  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [isRefreshing, setIsRefreshing] = useState<boolean>(false);
  const [isSaving, setIsSaving] = useState<boolean>(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  // Ambil pengaturan dari server
  const loadSettings = useCallback(async (isManualRefresh = false) => {
    if (isManualRefresh) {
      setIsRefreshing(true);
    } else {
      setIsLoading(true);
    }
    setErrorMessage(null);

    try {
      const res = await getExamSettings();
      if (res.success) {
        setDurationMinutes(res.durationMinutes);
        setLevels(res.levels);
        setTutorElementary(res.tutorElementary);
        setTutorHighSchool(res.tutorHighSchool);
      } else {
        setErrorMessage(res.error || 'Gagal memuat pengaturan.');
      }
    } catch (err) {
      console.error('Error saat load settings:', err);
      setErrorMessage('Terjadi kendala koneksi saat mengambil pengaturan.');
    } finally {
      setIsLoading(false);
      setIsRefreshing(false);
    }
  }, []);

  useEffect(() => {
    loadSettings();
  }, [loadSettings]);

  // Handler ubah batas atas Beginner (Level 1)
  const handleBeginnerMaxChange = (newMax: number) => {
    setLevels((prev) => {
      if (prev.length !== 3) return prev;
      const safeMax = Math.min(Math.max(newMax, 5), 90);
      const intermediateMin = safeMax + 1;
      const intermediateMax = Math.max(prev[1].maxScore, intermediateMin + 5);
      const advancedMin = intermediateMax + 1;

      return [
        { ...prev[0], minScore: 0, maxScore: safeMax },
        { ...prev[1], minScore: intermediateMin, maxScore: Math.min(intermediateMax, 98) },
        { ...prev[2], minScore: Math.min(advancedMin, 99), maxScore: 100 },
      ];
    });
  };

  // Handler ubah batas atas Intermediate (Level 2)
  const handleIntermediateMaxChange = (newMax: number) => {
    setLevels((prev) => {
      if (prev.length !== 3) return prev;
      const safeMax = Math.min(Math.max(newMax, prev[1].minScore + 1), 98);
      const advancedMin = safeMax + 1;

      return [
        prev[0],
        { ...prev[1], maxScore: safeMax },
        { ...prev[2], minScore: advancedMin, maxScore: 100 },
      ];
    });
  };

  // Handler ubah batas waktu menit level (Intermediate / Advanced)
  const handleLevelDurationChange = (levelId: number, durationVal: number | null) => {
    setLevels((prev) =>
      prev.map((l) => (l.id === levelId ? { ...l, maxDurationMinutes: durationVal } : l))
    );
  };

  // Preset Durasi Cepat
  const handlePresetDuration = (mins: number) => {
    setDurationMinutes(mins);
  };

  // Reset ke Default Standar Up Speaking
  const handleResetToDefault = () => {
    if (confirm('Kembalikan seluruh konfigurasi ke nilai default standar Up Speaking?')) {
      setDurationMinutes(45);
      setTutorElementary({
        name: 'Miss Sarah',
        whatsapp: '6281234567890',
      });
      setTutorHighSchool({
        name: 'Mr. David',
        whatsapp: '6289876543210',
      });
      setLevels((prev) => [
        {
          id: 1,
          name: 'Beginner',
          minScore: 0,
          maxScore: 59,
          maxDurationMinutes: null,
          description: prev.find((l) => l.id === 1)?.description || '',
        },
        {
          id: 2,
          name: 'Intermediate',
          minScore: 60,
          maxScore: 79,
          maxDurationMinutes: 20,
          description: prev.find((l) => l.id === 2)?.description || '',
        },
        {
          id: 3,
          name: 'Advanced',
          minScore: 80,
          maxScore: 100,
          maxDurationMinutes: 25,
          description: prev.find((l) => l.id === 3)?.description || '',
        },
      ]);
    }
  };

  // Simpan Pengaturan ke Server
  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);
    setIsSaving(true);

    try {
      const res = await updateExamSettings({
        durationMinutes,
        tutorElementary,
        tutorHighSchool,
        levels: levels.map((l) => ({
          id: l.id,
          minScore: l.minScore,
          maxScore: l.maxScore,
          maxDurationMinutes: l.maxDurationMinutes,
          description: l.description,
        })),
      });

      if (res.success) {
        setToastMessage(res.message);
        setTimeout(() => setToastMessage(null), 4500);
      } else {
        setErrorMessage(res.error || 'Gagal menyimpan pengaturan.');
      }
    } catch (err) {
      console.error('Error saat simpan settings:', err);
      setErrorMessage('Terjadi kendala koneksi server saat menyimpan.');
    } finally {
      setIsSaving(false);
    }
  };

  const beginner = levels.find((l) => l.id === 1) || {
    id: 1,
    name: 'Beginner',
    minScore: 0,
    maxScore: 59,
    maxDurationMinutes: null,
    description: '',
  };
  const intermediate = levels.find((l) => l.id === 2) || {
    id: 2,
    name: 'Intermediate',
    minScore: 60,
    maxScore: 79,
    maxDurationMinutes: 20,
    description: '',
  };
  const advanced = levels.find((l) => l.id === 3) || {
    id: 3,
    name: 'Advanced',
    minScore: 80,
    maxScore: 100,
    maxDurationMinutes: 25,
    description: '',
  };

  return (
    <div className="space-y-6 sm:space-y-8 animate-fade-in relative pb-12">
      {/* Toast Notifikasi Berhasil */}
      {toastMessage && (
        <div className="fixed bottom-6 right-6 z-50 max-w-md bg-slate-900 text-white p-4 rounded-2xl shadow-2xl border border-slate-800 flex items-start gap-3 animate-fade-in">
          <div className="w-8 h-8 rounded-xl bg-emerald-500/20 text-emerald-400 flex items-center justify-center flex-shrink-0 mt-0.5">
            <CheckCircle2 className="w-5 h-5" />
          </div>
          <div className="flex-1 text-xs sm:text-sm">
            <p className="font-bold text-white">Pengaturan Disimpan</p>
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

      {/* Banner Sambutan */}
      <div className="bg-white rounded-3xl border border-slate-100 p-6 sm:p-8 shadow-[0_4px_24px_-4px_rgba(0,0,0,0.04)]">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
          <div className="space-y-1.5">
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-sky-50 text-sky-800 border border-sky-200/80">
              <Settings className="w-3.5 h-3.5 text-sky-600" />
              <span>Konfigurasi Global</span>
            </div>
            <h2 className="text-xl sm:text-2xl font-extrabold text-slate-900 tracking-tight">
              Pengaturan Sistem & Penilaian Ujian
            </h2>
            <p className="text-xs sm:text-sm text-slate-500 max-w-2xl leading-relaxed">
              Atur parameter durasi ujian, matrix evaluasi level penempatan berbasis skor & waktu, serta kontak WhatsApp tutor pembimbing per jenjang pendidikan.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2.5 sm:gap-3">
            {/* Tombol Segarkan */}
            <button
              onClick={() => loadSettings(true)}
              disabled={isLoading || isRefreshing || isSaving}
              className="inline-flex items-center gap-2 px-3.5 py-2.5 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 text-slate-700 font-semibold text-xs sm:text-sm transition-colors shadow-2xs disabled:opacity-50"
              title="Segarkan data pengaturan dari database"
            >
              <RefreshCw
                className={`w-4 h-4 text-slate-500 ${
                  isRefreshing ? 'animate-spin text-sky-600' : ''
                }`}
              />
              <span>{isRefreshing ? 'Memperbarui...' : 'Segarkan'}</span>
            </button>

            {/* Tombol Reset Default */}
            <button
              type="button"
              onClick={handleResetToDefault}
              disabled={isLoading || isSaving}
              className="inline-flex items-center gap-2 px-3.5 py-2.5 rounded-xl border border-slate-200 hover:bg-slate-50 text-slate-600 font-semibold text-xs sm:text-sm transition-colors shadow-2xs disabled:opacity-50"
              title="Kembalikan ke pengaturan standar bawaan"
            >
              <RotateCcw className="w-4 h-4 text-slate-500" />
              <span>Reset Default</span>
            </button>
          </div>
        </div>
      </div>

      {/* Error Alert */}
      {errorMessage && (
        <div className="p-4 rounded-2xl bg-rose-50 border border-rose-200 text-rose-800 flex items-start gap-3">
          <AlertCircle className="w-5 h-5 text-rose-600 flex-shrink-0 mt-0.5" />
          <div className="flex-1 text-xs sm:text-sm">
            <p className="font-bold">Gagal Menyimpan Pengaturan</p>
            <p className="mt-0.5 text-rose-700">{errorMessage}</p>
          </div>
          <button
            onClick={() => setErrorMessage(null)}
            className="text-xs font-bold underline hover:no-underline text-rose-900"
          >
            Tutup
          </button>
        </div>
      )}

      <form onSubmit={handleSave} className="space-y-6 sm:space-y-8">
        {/* ========================================================================= */}
        {/* BAGIAN 1: DURASI UJIAN GLOBAL */}
        {/* ========================================================================= */}
        <div className="bg-white rounded-3xl border border-slate-100 p-6 sm:p-8 shadow-[0_4px_24px_-4px_rgba(0,0,0,0.04)] space-y-5">
          <div className="flex items-center gap-3 pb-4 border-b border-slate-100">
            <div className="w-10 h-10 rounded-xl bg-sky-50 text-sky-600 flex items-center justify-center shadow-2xs">
              <Clock className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base sm:text-lg font-extrabold text-slate-900 tracking-tight">
                1. Batas Durasi Ujian Global
              </h3>
              <p className="text-xs text-slate-500">
                Alokasi waktu total yang diberikan kepada peserta untuk menyelesaikan lembar ujian.
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-start">
            <div className="space-y-3">
              <label className="block text-xs sm:text-sm font-bold text-slate-800">
                Durasi Ujian (Menit)
              </label>
              <div className="flex items-center gap-3">
                <div className="relative flex-1 max-w-[200px]">
                  <input
                    type="number"
                    min={5}
                    max={180}
                    value={durationMinutes}
                    onChange={(e) => setDurationMinutes(Number(e.target.value))}
                    className="w-full pl-4 pr-16 py-3 rounded-2xl bg-slate-50 border border-slate-200 focus:bg-white focus:border-sky-500 focus:ring-2 focus:ring-sky-100 outline-none text-lg font-extrabold text-slate-900 transition-all font-mono"
                  />
                  <span className="absolute right-4 top-1/2 -translate-y-1/2 text-xs font-bold text-slate-400">
                    Menit
                  </span>
                </div>

                <span className="text-xs text-slate-400 font-medium">
                  (Rekomendasi: 30 – 60 menit)
                </span>
              </div>

              {/* Preset Cepat */}
              <div className="space-y-1.5 pt-1">
                <span className="text-[11px] font-bold text-slate-400">Pilihan Cepat:</span>
                <div className="flex flex-wrap gap-2">
                  {[30, 45, 60, 90].map((mins) => (
                    <button
                      key={mins}
                      type="button"
                      onClick={() => handlePresetDuration(mins)}
                      className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${
                        durationMinutes === mins
                          ? 'bg-[#0e263e] text-white shadow-2xs'
                          : 'bg-slate-100 hover:bg-slate-200 text-slate-700'
                      }`}
                    >
                      {mins} Menit {mins === 45 && '(Standar)'}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            <div className="bg-slate-50/80 border border-slate-200/80 rounded-2xl p-4 space-y-2 text-xs text-slate-600">
              <div className="flex items-center gap-2 font-bold text-slate-800">
                <ShieldCheck className="w-4 h-4 text-emerald-600" />
                <span>Integritas Waktu Ujian Server</span>
              </div>
              <p className="leading-relaxed text-slate-500">
                Waktu ujian diikat pada jam server (`end_time = start_time + durasi`). Countdown timer di browser siswa akan otomatis tersinkronisasi sehingga sisa waktu tidak dapat dimanipulasi dengan me-refresh browser atau memajukan jam perangkat.
              </p>
            </div>
          </div>
        </div>

        {/* ========================================================================= */}
        {/* BAGIAN 2: MATRIX EVALUASI LEVEL (SKOR % & BATAS WAKTU MENIT) */}
        {/* ========================================================================= */}
        <div className="bg-white rounded-3xl border border-slate-100 p-6 sm:p-8 shadow-[0_4px_24px_-4px_rgba(0,0,0,0.04)] space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-slate-100">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center shadow-2xs">
                <Sliders className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-base sm:text-lg font-extrabold text-slate-900 tracking-tight">
                  2. Matrix Evaluasi Level Penempatan (Skor % & Waktu Pengerjaan)
                </h3>
                <p className="text-xs text-slate-500">
                  Kombinasi ambang batas skor (0% – 100%) dan batas durasi riil pengerjaan untuk menentukan rekomendasi kelas siswa.
                </p>
              </div>
            </div>

            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200/80">
              <Check className="w-3.5 h-3.5" />
              <span>Aturan Degradasi Waktu Aktif</span>
            </span>
          </div>

          {/* Banner Aturan Matrix Waktu */}
          <div className="p-4 rounded-2xl bg-amber-50/70 border border-amber-200 text-xs text-amber-950 space-y-2">
            <div className="flex items-center gap-2 font-bold text-amber-900">
              <AlertTriangle className="w-4 h-4 text-amber-600 flex-shrink-0" />
              <span>Aturan Degradasi Evaluasi Waktu (Dual Matrix Evaluation):</span>
            </div>
            <ul className="list-disc list-inside space-y-1 text-amber-900/90 pl-1 leading-relaxed">
              <li>
                Siswa dengan skor <strong>Advanced (≥ {advanced.minScore}%)</strong> yang menyelesaikan tes melebihi <strong>{advanced.maxDurationMinutes ?? 25} menit</strong> otomatis diturunkan ke level <strong>Intermediate</strong>.
              </li>
              <li>
                Siswa dengan skor <strong>Intermediate ({intermediate.minScore}% – {intermediate.maxScore}%)</strong> yang menyelesaikan tes melebihi <strong>{intermediate.maxDurationMinutes ?? 20} menit</strong> otomatis diturunkan ke level <strong>Beginner</strong>.
              </li>
              <li>
                Level <strong>Beginner</strong> tidak memiliki batas waktu pengerjaan khusus (fondasi dasar).
              </li>
            </ul>
          </div>

          {/* Visual Spectrum Bar (0% - 100%) */}
          <div className="space-y-2 pt-2">
            <div className="flex justify-between text-xs font-bold text-slate-500">
              <span>0% (Skor Terendah)</span>
              <span>Proporsi Spektrum Skor Level</span>
              <span>100% (Sempurna)</span>
            </div>

            <div className="h-6 w-full rounded-xl overflow-hidden flex shadow-2xs font-extrabold text-[11px] text-white">
              {/* Beginner Bar */}
              <div
                style={{ width: `${beginner.maxScore + 1}%` }}
                className="bg-emerald-500 flex items-center justify-center transition-all duration-300 px-2 truncate"
                title={`Beginner: 0% - ${beginner.maxScore}%`}
              >
                Beginner (0% – {beginner.maxScore}%)
              </div>

              {/* Intermediate Bar */}
              <div
                style={{
                  width: `${intermediate.maxScore - intermediate.minScore + 1}%`,
                }}
                className="bg-amber-500 flex items-center justify-center transition-all duration-300 px-2 truncate"
                title={`Intermediate: ${intermediate.minScore}% - ${intermediate.maxScore}%`}
              >
                Intermediate ({intermediate.minScore}% – {intermediate.maxScore}%)
              </div>

              {/* Advanced Bar */}
              <div
                style={{
                  width: `${100 - advanced.minScore + 1}%`,
                }}
                className="bg-indigo-600 flex items-center justify-center transition-all duration-300 px-2 truncate"
                title={`Advanced: ${advanced.minScore}% - 100%`}
              >
                Advanced ({advanced.minScore}% – 100%)
              </div>
            </div>
          </div>

          {/* 3 Kartu Level Konfigurasi */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 pt-2">
            {/* KARTU 1: BEGINNER */}
            <div className="p-5 rounded-3xl border border-emerald-200 bg-emerald-50/20 space-y-4 shadow-2xs flex flex-col justify-between">
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2.5">
                    <div className="w-9 h-9 rounded-xl bg-emerald-100 text-emerald-700 flex items-center justify-center">
                      <BookOpen className="w-5 h-5" />
                    </div>
                    <div>
                      <h4 className="font-extrabold text-sm text-slate-900">
                        Level 1: Beginner
                      </h4>
                      <span className="text-[11px] font-bold text-emerald-700">
                        Fondasi Dasar
                      </span>
                    </div>
                  </div>

                  <span className="px-2.5 py-0.5 rounded-full text-xs font-extrabold bg-emerald-100 text-emerald-800 border border-emerald-200">
                    0% – {beginner.maxScore}%
                  </span>
                </div>

                {/* Input Batas Skor */}
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="text-[11px] font-bold text-slate-500">
                      Batas Bawah
                    </label>
                    <input
                      type="text"
                      disabled
                      value="0%"
                      className="w-full mt-1 px-3 py-2 rounded-xl bg-slate-100 border border-slate-200 text-xs font-bold text-slate-500 cursor-not-allowed text-center"
                    />
                  </div>
                  <div>
                    <label className="text-[11px] font-bold text-slate-700">
                      Batas Atas (%)
                    </label>
                    <input
                      type="number"
                      min={5}
                      max={90}
                      value={beginner.maxScore}
                      onChange={(e) =>
                        handleBeginnerMaxChange(Number(e.target.value))
                      }
                      className="w-full mt-1 px-3 py-2 rounded-xl bg-white border border-emerald-300 focus:ring-2 focus:ring-emerald-200 outline-none text-xs font-bold text-slate-900 text-center"
                    />
                  </div>
                </div>

                {/* Batas Waktu */}
                <div className="space-y-1 pt-1">
                  <label className="text-[11px] font-bold text-slate-600">
                    Batas Waktu Pengerjaan
                  </label>
                  <input
                    type="text"
                    disabled
                    value="Bebas Waktu (Tanpa Batasan)"
                    className="w-full px-3 py-2 rounded-xl bg-slate-100 border border-slate-200 text-xs font-semibold text-slate-500 cursor-not-allowed text-center"
                  />
                  <p className="text-[10px] text-slate-400 text-center">
                    Level dasar tidak mengalami penurunan level
                  </p>
                </div>
              </div>
            </div>

            {/* KARTU 2: INTERMEDIATE */}
            <div className="p-5 rounded-3xl border border-amber-200 bg-amber-50/20 space-y-4 shadow-2xs flex flex-col justify-between">
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2.5">
                    <div className="w-9 h-9 rounded-xl bg-amber-100 text-amber-700 flex items-center justify-center">
                      <TrendingUp className="w-5 h-5" />
                    </div>
                    <div>
                      <h4 className="font-extrabold text-sm text-slate-900">
                        Level 2: Intermediate
                      </h4>
                      <span className="text-[11px] font-bold text-amber-700">
                        Percakapan Menengah
                      </span>
                    </div>
                  </div>

                  <span className="px-2.5 py-0.5 rounded-full text-xs font-extrabold bg-amber-100 text-amber-800 border border-amber-200">
                    {intermediate.minScore}% – {intermediate.maxScore}%
                  </span>
                </div>

                {/* Input Batas Skor */}
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="text-[11px] font-bold text-slate-500">
                      Batas Bawah
                    </label>
                    <input
                      type="text"
                      disabled
                      value={`${intermediate.minScore}% (Auto)`}
                      className="w-full mt-1 px-3 py-2 rounded-xl bg-slate-100 border border-slate-200 text-xs font-bold text-slate-500 cursor-not-allowed text-center"
                    />
                  </div>
                  <div>
                    <label className="text-[11px] font-bold text-slate-700">
                      Batas Atas (%)
                    </label>
                    <input
                      type="number"
                      min={intermediate.minScore + 1}
                      max={98}
                      value={intermediate.maxScore}
                      onChange={(e) =>
                        handleIntermediateMaxChange(Number(e.target.value))
                      }
                      className="w-full mt-1 px-3 py-2 rounded-xl bg-white border border-amber-300 focus:ring-2 focus:ring-amber-200 outline-none text-xs font-bold text-slate-900 text-center"
                    />
                  </div>
                </div>

                {/* Batas Waktu */}
                <div className="space-y-1 pt-1">
                  <label className="text-[11px] font-bold text-slate-700 flex items-center justify-between">
                    <span>Maksimal Waktu Riil (Menit)</span>
                    <span className="text-amber-700 font-extrabold">≤ {intermediate.maxDurationMinutes ?? 20}m</span>
                  </label>
                  <div className="relative">
                    <input
                      type="number"
                      min={1}
                      max={durationMinutes}
                      value={intermediate.maxDurationMinutes ?? ''}
                      onChange={(e) =>
                        handleLevelDurationChange(
                          2,
                          e.target.value ? Number(e.target.value) : null
                        )
                      }
                      placeholder="Contoh: 20"
                      className="w-full pl-3 pr-14 py-2 rounded-xl bg-white border border-amber-300 focus:ring-2 focus:ring-amber-200 outline-none text-xs font-bold text-slate-900 text-center font-mono"
                    />
                    <span className="absolute right-3 top-1/2 -translate-y-1/2 text-[11px] font-bold text-slate-400">
                      Menit
                    </span>
                  </div>
                  <p className="text-[10px] text-amber-700 text-center">
                    Jika &gt; {intermediate.maxDurationMinutes ?? 20}m, turun ke Beginner
                  </p>
                </div>
              </div>
            </div>

            {/* KARTU 3: ADVANCED */}
            <div className="p-5 rounded-3xl border border-indigo-200 bg-indigo-50/20 space-y-4 shadow-2xs flex flex-col justify-between">
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2.5">
                    <div className="w-9 h-9 rounded-xl bg-indigo-100 text-indigo-700 flex items-center justify-center">
                      <Award className="w-5 h-5" />
                    </div>
                    <div>
                      <h4 className="font-extrabold text-sm text-slate-900">
                        Level 3: Advanced
                      </h4>
                      <span className="text-[11px] font-bold text-indigo-700">
                        Mahir & Profesional
                      </span>
                    </div>
                  </div>

                  <span className="px-2.5 py-0.5 rounded-full text-xs font-extrabold bg-indigo-100 text-indigo-800 border border-indigo-200">
                    {advanced.minScore}% – 100%
                  </span>
                </div>

                {/* Input Batas Skor */}
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="text-[11px] font-bold text-slate-500">
                      Batas Bawah
                    </label>
                    <input
                      type="text"
                      disabled
                      value={`${advanced.minScore}% (Auto)`}
                      className="w-full mt-1 px-3 py-2 rounded-xl bg-slate-100 border border-slate-200 text-xs font-bold text-slate-500 cursor-not-allowed text-center"
                    />
                  </div>
                  <div>
                    <label className="text-[11px] font-bold text-slate-500">
                      Batas Atas
                    </label>
                    <input
                      type="text"
                      disabled
                      value="100% (Maksimal)"
                      className="w-full mt-1 px-3 py-2 rounded-xl bg-slate-100 border border-slate-200 text-xs font-bold text-slate-500 cursor-not-allowed text-center"
                    />
                  </div>
                </div>

                {/* Batas Waktu */}
                <div className="space-y-1 pt-1">
                  <label className="text-[11px] font-bold text-slate-700 flex items-center justify-between">
                    <span>Maksimal Waktu Riil (Menit)</span>
                    <span className="text-indigo-700 font-extrabold">≤ {advanced.maxDurationMinutes ?? 25}m</span>
                  </label>
                  <div className="relative">
                    <input
                      type="number"
                      min={1}
                      max={durationMinutes}
                      value={advanced.maxDurationMinutes ?? ''}
                      onChange={(e) =>
                        handleLevelDurationChange(
                          3,
                          e.target.value ? Number(e.target.value) : null
                        )
                      }
                      placeholder="Contoh: 25"
                      className="w-full pl-3 pr-14 py-2 rounded-xl bg-white border border-indigo-300 focus:ring-2 focus:ring-indigo-200 outline-none text-xs font-bold text-slate-900 text-center font-mono"
                    />
                    <span className="absolute right-3 top-1/2 -translate-y-1/2 text-[11px] font-bold text-slate-400">
                      Menit
                    </span>
                  </div>
                  <p className="text-[10px] text-indigo-700 text-center">
                    Jika &gt; {advanced.maxDurationMinutes ?? 25}m, turun ke Intermediate
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* ========================================================================= */}
        {/* BAGIAN 3: KONTAK TUTOR PER JENJANG */}
        {/* ========================================================================= */}
        <div className="bg-white rounded-3xl border border-slate-100 p-6 sm:p-8 shadow-[0_4px_24px_-4px_rgba(0,0,0,0.04)] space-y-6">
          <div className="flex items-center gap-3 pb-4 border-b border-slate-100">
            <div className="w-10 h-10 rounded-xl bg-sky-50 text-sky-600 flex items-center justify-center shadow-2xs">
              <MessageCircle className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base sm:text-lg font-extrabold text-slate-900 tracking-tight">
                3. Kontak WhatsApp Tutor Pembimbing Per Jenjang
              </h3>
              <p className="text-xs text-slate-500">
                Data tutor ini akan tampil pada kartu instruktur di halaman hasil siswa (`/result`) dengan tautan langsung (*Direct WhatsApp*).
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* KARTU TUTOR ELEMENTARY */}
            <div className="p-5 sm:p-6 rounded-3xl border border-sky-200 bg-sky-50/20 space-y-4 shadow-2xs">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-2xl bg-sky-500 text-white flex items-center justify-center shadow-xs">
                  <GraduationCap className="w-5 h-5" />
                </div>
                <div>
                  <h4 className="font-extrabold text-sm sm:text-base text-slate-900">
                    Tutor Jenjang Elementary (SD)
                  </h4>
                  <p className="text-xs text-slate-500">
                    Penanggung jawab peserta tingkat Sekolah Dasar
                  </p>
                </div>
              </div>

              <div className="space-y-3.5 pt-2">
                <div className="space-y-1.5">
                  <label className="block text-xs font-bold text-slate-700 flex items-center gap-1.5">
                    <User className="w-3.5 h-3.5 text-sky-600" />
                    <span>Nama Tutor</span>
                    <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="text"
                    value={tutorElementary.name}
                    onChange={(e) =>
                      setTutorElementary((prev) => ({ ...prev, name: e.target.value }))
                    }
                    placeholder="Contoh: Miss Sarah"
                    className="w-full px-3.5 py-2.5 rounded-xl bg-white border border-sky-300 focus:ring-2 focus:ring-sky-200 outline-none text-xs sm:text-sm font-semibold text-slate-900"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="block text-xs font-bold text-slate-700 flex items-center gap-1.5">
                    <Phone className="w-3.5 h-3.5 text-sky-600" />
                    <span>Nomor WhatsApp</span>
                    <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="text"
                    value={tutorElementary.whatsapp}
                    onChange={(e) =>
                      setTutorElementary((prev) => ({ ...prev, whatsapp: e.target.value }))
                    }
                    placeholder="Contoh: 081234567890 / 6281234567890"
                    className="w-full px-3.5 py-2.5 rounded-xl bg-white border border-sky-300 focus:ring-2 focus:ring-sky-200 outline-none text-xs sm:text-sm font-semibold text-slate-900 font-mono"
                  />
                  <p className="text-[11px] text-slate-400">
                    Format: Otomatis distandarisasi ke format internasional (628xxx).
                  </p>
                </div>
              </div>
            </div>

            {/* KARTU TUTOR HIGH SCHOOL */}
            <div className="p-5 sm:p-6 rounded-3xl border border-indigo-200 bg-indigo-50/20 space-y-4 shadow-2xs">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-2xl bg-indigo-600 text-white flex items-center justify-center shadow-xs">
                  <GraduationCap className="w-5 h-5" />
                </div>
                <div>
                  <h4 className="font-extrabold text-sm sm:text-base text-slate-900">
                    Tutor Jenjang High School
                  </h4>
                  <p className="text-xs text-slate-500">
                    Penanggung jawab peserta SMP, SMA & Umum
                  </p>
                </div>
              </div>

              <div className="space-y-3.5 pt-2">
                <div className="space-y-1.5">
                  <label className="block text-xs font-bold text-slate-700 flex items-center gap-1.5">
                    <User className="w-3.5 h-3.5 text-indigo-600" />
                    <span>Nama Tutor</span>
                    <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="text"
                    value={tutorHighSchool.name}
                    onChange={(e) =>
                      setTutorHighSchool((prev) => ({ ...prev, name: e.target.value }))
                    }
                    placeholder="Contoh: Mr. David"
                    className="w-full px-3.5 py-2.5 rounded-xl bg-white border border-indigo-300 focus:ring-2 focus:ring-indigo-200 outline-none text-xs sm:text-sm font-semibold text-slate-900"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="block text-xs font-bold text-slate-700 flex items-center gap-1.5">
                    <Phone className="w-3.5 h-3.5 text-indigo-600" />
                    <span>Nomor WhatsApp</span>
                    <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="text"
                    value={tutorHighSchool.whatsapp}
                    onChange={(e) =>
                      setTutorHighSchool((prev) => ({ ...prev, whatsapp: e.target.value }))
                    }
                    placeholder="Contoh: 089876543210 / 6289876543210"
                    className="w-full px-3.5 py-2.5 rounded-xl bg-white border border-indigo-300 focus:ring-2 focus:ring-indigo-200 outline-none text-xs sm:text-sm font-semibold text-slate-900 font-mono"
                  />
                  <p className="text-[11px] text-slate-400">
                    Format: Otomatis distandarisasi ke format internasional (628xxx).
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* ========================================================================= */}
        {/* TOMBOL SIMPAN STICKY BAR */}
        {/* ========================================================================= */}
        <div className="bg-white rounded-3xl border border-slate-100 p-5 sm:p-6 shadow-[0_4px_24px_-4px_rgba(0,0,0,0.04)] flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="text-xs text-slate-500">
            Pastikan seluruh konfigurasi durasi, matrix evaluasi level, dan nomor WhatsApp tutor sudah benar sebelum menyimpan.
          </div>

          <button
            type="submit"
            disabled={isLoading || isSaving}
            className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-8 py-3 rounded-xl bg-[#0e263e] hover:bg-[#1a385c] text-white font-extrabold text-sm transition-all shadow-md hover:shadow-lg disabled:opacity-50"
          >
            {isSaving ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                <span>Menyimpan Seluruh Pengaturan...</span>
              </>
            ) : (
              <>
                <Save className="w-4 h-4 text-emerald-400" />
                <span>Simpan Seluruh Pengaturan</span>
              </>
            )}
          </button>
        </div>
      </form>
    </div>
  );
}
