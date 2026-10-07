'use server';

import { createClient } from '@/lib/supabase/server';
import { normalizeWhatsAppNumber } from '@/lib/whatsapp';
import type { EducationLevel, RegisterStudentResult, TestSessionStatus } from '@/types';

export interface DashboardMetrics {
  totalParticipants: number;
  beginnerCount: number;
  beginnerPercent: number;
  intermediateCount: number;
  intermediatePercent: number;
  advancedCount: number;
  advancedPercent: number;
  averageScore: number;
}

export type GetDashboardMetricsResult =
  | {
      success: true;
      metrics: DashboardMetrics;
    }
  | {
      success: false;
      error: string;
    };

export interface StudentHistoryRecord {
  id: string;
  studentName: string;
  whatsappNumber: string;
  educationLevel: EducationLevel;
  status: TestSessionStatus;
  durationMinutes: number | null;
  completedAt: string;
  totalQuestions: number;
  correctAnswers: number;
  finalScorePercent: number;
  levelId: number;
  levelName: string;
  reviewerName?: string | null;
  canRetest: boolean;
}

export type GetStudentHistoryResult =
  | {
      success: true;
      data: StudentHistoryRecord[];
    }
  | {
      success: false;
      error: string;
    };

/**
 * Server Action: getDashboardMetrics
 * Mengambil ringkasan agregasi data peserta untuk 4 kartu metrik utama di dashboard admin.
 */
export async function getDashboardMetrics(): Promise<GetDashboardMetricsResult> {
  try {
    const supabase = createClient();

    // Ambil seluruh sesi ujian untuk rekapitulasi metrik global
    const { data: sessions, error } = await supabase
      .from('test_sessions')
      .select(`
        id,
        status,
        final_score_percent,
        assigned_level_id,
        levels:assigned_level_id (
          id,
          name
        )
      `);

    if (error) {
      console.error('Error saat mengambil data metrik dashboard:', error);
      return {
        success: false,
        error: 'Gagal memuat ringkasan data metrik.',
      };
    }

    // Peserta yang telah mengerjakan (submitted, graded, atau completed)
    const evaluatedSessions =
      sessions?.filter(
        (s) => s.status === 'submitted' || s.status === 'graded' || s.status === 'completed'
      ) || [];

    const totalParticipants = evaluatedSessions.length;

    let beginnerCount = 0;
    let intermediateCount = 0;
    let advancedCount = 0;
    let totalScore = 0;

    evaluatedSessions.forEach((s) => {
      const level = Array.isArray(s.levels) ? s.levels[0] : s.levels;
      const levelName = level?.name?.toLowerCase() || '';

      if (levelName.includes('beginner')) {
        beginnerCount++;
      } else if (levelName.includes('intermediate')) {
        intermediateCount++;
      } else if (levelName.includes('advanced')) {
        advancedCount++;
      }

      totalScore += Number(s.final_score_percent || 0);
    });

    const gradedOrLevelCount = beginnerCount + intermediateCount + advancedCount;
    const denominator = gradedOrLevelCount > 0 ? gradedOrLevelCount : totalParticipants;

    const beginnerPercent = denominator > 0 ? Math.round((beginnerCount / denominator) * 100) : 0;
    const intermediatePercent = denominator > 0 ? Math.round((intermediateCount / denominator) * 100) : 0;
    const advancedPercent = denominator > 0 ? Math.round((advancedCount / denominator) * 100) : 0;
    const averageScore = totalParticipants > 0 ? Math.round((totalScore / totalParticipants) * 10) / 10 : 0;

    return {
      success: true,
      metrics: {
        totalParticipants,
        beginnerCount,
        beginnerPercent,
        intermediateCount,
        intermediatePercent,
        advancedCount,
        advancedPercent,
        averageScore,
      },
    };
  } catch (err) {
    console.error('Unexpected error di getDashboardMetrics:', err);
    return {
      success: false,
      error: 'Terjadi kesalahan sistem saat mengagregasi data.',
    };
  }
}

/**
 * Server Action: getStudentHistory
 * Mengambil daftar riwayat hasil ujian siswa seluruh status dari yang terbaru.
 */
export async function getStudentHistory(): Promise<GetStudentHistoryResult> {
  try {
    const supabase = createClient();

    const { data: sessions, error } = await supabase
      .from('test_sessions')
      .select(`
        id,
        student_name,
        whatsapp_number,
        education_level,
        status,
        duration_minutes,
        total_questions,
        correct_answers,
        final_score_percent,
        assigned_level_id,
        can_retest,
        completed_at,
        created_at,
        reviewed_by,
        levels:assigned_level_id (
          id,
          name
        ),
        reviewer:reviewed_by (
          id,
          full_name
        )
      `)
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error saat mengambil riwayat siswa:', error);
      return {
        success: false,
        error: 'Gagal memuat tabel riwayat hasil siswa.',
      };
    }

    const records: StudentHistoryRecord[] = (sessions || []).map((s) => {
      const level = Array.isArray(s.levels) ? s.levels[0] : s.levels;
      const reviewer = Array.isArray(s.reviewer) ? s.reviewer[0] : s.reviewer;
      const sessionStatus = (s.status as TestSessionStatus) || 'registered';

      let defaultLevelName = 'Belum Ditentukan';
      if (sessionStatus === 'submitted') {
        defaultLevelName = 'Menunggu Review';
      } else if (sessionStatus === 'registered') {
        defaultLevelName = 'Belum Ujian';
      } else if (sessionStatus === 'in_progress') {
        defaultLevelName = 'Sedang Tes';
      }

      return {
        id: s.id,
        studentName: s.student_name,
        whatsappNumber: s.whatsapp_number,
        educationLevel: (s.education_level as EducationLevel) || 'elementary',
        status: sessionStatus,
        durationMinutes:
          s.duration_minutes !== null && s.duration_minutes !== undefined
            ? Number(s.duration_minutes)
            : null,
        completedAt: s.completed_at || s.created_at,
        totalQuestions: s.total_questions || 0,
        correctAnswers: s.correct_answers || 0,
        finalScorePercent: Number(s.final_score_percent ?? 0),
        levelId: s.assigned_level_id ?? 0,
        levelName: level?.name || defaultLevelName,
        reviewerName: reviewer?.full_name || null,
        canRetest: Boolean(s.can_retest),
      };
    });

    return {
      success: true,
      data: records,
    };
  } catch (err) {
    console.error('Unexpected error di getStudentHistory:', err);
    return {
      success: false,
      error: 'Terjadi kesalahan sistem saat memuat riwayat siswa.',
    };
  }
}

export interface ToggleRetestResult {
  success: boolean;
  canRetest?: boolean;
  error?: string;
  message?: string;
}

/**
 * Server Action: toggleRetestPermission
 * Memberikan atau mencabut izin 1x tes ulang untuk sesi peserta tertentu tanpa menghapus riwayat lama.
 */
export async function toggleRetestPermission(
  sessionId: string,
  canRetest: boolean
): Promise<ToggleRetestResult> {
  try {
    if (!sessionId) {
      return { success: false, error: 'ID sesi tidak valid.' };
    }

    const supabase = createClient();

    // 1. Verifikasi bahwa user yang memanggil adalah admin terotentikasi
    const {
      data: { user },
      error: authErr,
    } = await supabase.auth.getUser();

    if (authErr || !user) {
      return {
        success: false,
        error: 'Akses ditolak. Anda harus login sebagai admin terlebih dahulu.',
      };
    }

    // 2. Ambil data sesi untuk memastikan sesi ada
    const { data: sessionData, error: fetchErr } = await supabase
      .from('test_sessions')
      .select('id, student_name, whatsapp_number')
      .eq('id', sessionId)
      .maybeSingle();

    if (fetchErr || !sessionData) {
      return {
        success: false,
        error: 'Sesi ujian siswa tidak ditemukan di database.',
      };
    }

    // 3. Update can_retest pada record test_sessions
    const { error: updateErr } = await supabase
      .from('test_sessions')
      .update({ can_retest: canRetest })
      .eq('id', sessionId);

    if (updateErr) {
      console.error('Error saat update can_retest:', updateErr);
      return {
        success: false,
        error: 'Gagal memperbarui status izin tes ulang di database.',
      };
    }

    return {
      success: true,
      canRetest,
      message: canRetest
        ? `Izin tes ulang berhasil diberikan untuk ${sessionData.student_name}. Siswa sekarang dapat membuka web dan memulai 1x tes baru.`
        : `Izin tes ulang untuk ${sessionData.student_name} telah dicabut.`,
    };
  } catch (err) {
    console.error('Unexpected error di toggleRetestPermission:', err);
    return {
      success: false,
      error: 'Terjadi kesalahan sistem saat memperbarui izin tes ulang.',
    };
  }
}

/**
 * Server Action: registerStudent
 * Digunakan oleh staf Admin di meja pendaftaran untuk mendaftarkan calon siswa baru.
 * 
 * Tanggung Jawab:
 * 1. Verifikasi autentikasi staf pemanggil (admin).
 * 2. Validasi input nama siswa (2-150 karakter), nomor WhatsApp (normalisasi format 628xxx), dan jenjang pendidikan.
 * 3. Cek apakah ada sesi berstatus 'registered' atau 'in_progress' untuk pasangan (WA + Nama).
 * 4. Cek apakah siswa sudah pernah menyelesaikan tes tanpa izin tes ulang.
 * 5. Buat record baru di tabel test_sessions dengan status 'registered'.
 * 6. Kembalikan data sesi terdaftar.
 */
export async function registerStudent(
  rawName: string,
  rawWhatsApp: string,
  rawEducationLevel: EducationLevel
): Promise<RegisterStudentResult> {
  try {
    const supabase = createClient();

    // 1. Verifikasi autentikasi admin
    const {
      data: { user },
      error: authErr,
    } = await supabase.auth.getUser();

    if (authErr || !user) {
      return {
        success: false,
        error: 'Akses ditolak. Anda harus login sebagai admin terlebih dahulu.',
        code: 'INVALID_INPUT',
      };
    }

    // 2. Validasi input nama
    const studentName = rawName?.trim();
    if (!studentName || studentName.length < 2) {
      return {
        success: false,
        error: 'Nama lengkap calon siswa wajib diisi minimal 2 karakter.',
        code: 'INVALID_INPUT',
      };
    }

    if (studentName.length > 150) {
      return {
        success: false,
        error: 'Nama lengkap maksimal 150 karakter.',
        code: 'INVALID_INPUT',
      };
    }

    // 3. Normalisasi & validasi nomor WhatsApp
    const normalizedWhatsApp = normalizeWhatsAppNumber(rawWhatsApp);
    if (!normalizedWhatsApp) {
      return {
        success: false,
        error: 'Nomor WhatsApp tidak valid. Masukkan nomor HP/WA yang aktif (contoh: 08123456789).',
        code: 'INVALID_INPUT',
      };
    }

    // 4. Validasi jenjang pendidikan
    const educationLevel = rawEducationLevel;
    if (educationLevel !== 'elementary' && educationLevel !== 'high_school') {
      return {
        success: false,
        error: 'Jenjang pendidikan wajib dipilih (Elementary atau High School).',
        code: 'INVALID_INPUT',
      };
    }

    // 5. Cek apakah ada sesi aktif atau riwayat pengerjaan untuk pasangan (WA + Nama)
    const { data: existingSessions, error: checkErr } = await supabase
      .from('test_sessions')
      .select('id, status, can_retest, created_at')
      .eq('whatsapp_number', normalizedWhatsApp)
      .ilike('student_name', studentName)
      .order('created_at', { ascending: false });

    if (checkErr) {
      console.error('Error saat cek sesi pendaftaran siswa:', checkErr);
      return {
        success: false,
        error: 'Gagal memverifikasi data siswa ke database.',
        code: 'SERVER_ERROR',
      };
    }

    if (existingSessions && existingSessions.length > 0) {
      // a. Cek sesi yang masih aktif (registered atau in_progress)
      const activeSession = existingSessions.find(
        (s) => s.status === 'registered' || s.status === 'in_progress'
      );
      if (activeSession) {
        return {
          success: false,
          error: `Siswa "${studentName}" dengan nomor WhatsApp ini sudah terdaftar (${
            activeSession.status === 'in_progress' ? 'sedang ujian' : 'siap mengerjakan'
          }). Siswa dapat langsung menuju halaman ujian.`,
          code: 'SESSION_EXISTS',
        };
      }

      // b. Cek sesi selesai yang belum diizinkan tes ulang
      const completedWithoutRetest = existingSessions.find(
        (s) =>
          (s.status === 'submitted' || s.status === 'graded' || s.status === 'completed') &&
          !s.can_retest
      );
      if (completedWithoutRetest) {
        return {
          success: false,
          error: `Siswa "${studentName}" sudah pernah menyelesaikan placement test sebelumnya. Silakan berikan "Izin Tes Ulang" di tabel riwayat dashboard jika ingin mendaftarkan kembali.`,
          code: 'PREVIOUSLY_COMPLETED',
        };
      }
    }

    // 6. Buat sesi baru berstatus 'registered'
    const nowIso = new Date().toISOString();
    const { data: newSession, error: insertErr } = await supabase
      .from('test_sessions')
      .insert({
        student_name: studentName,
        whatsapp_number: normalizedWhatsApp,
        education_level: educationLevel,
        status: 'registered',
        start_time: nowIso,
        end_time: nowIso,
        can_retest: false,
        total_questions: 0,
        correct_answers: 0,
      })
      .select('id, student_name, whatsapp_number, education_level, status, created_at')
      .single();

    if (insertErr || !newSession) {
      console.error('Error saat insert sesi pendaftaran:', insertErr);
      return {
        success: false,
        error: 'Gagal menyimpan pendaftaran siswa baru ke database.',
        code: 'SERVER_ERROR',
      };
    }

    return {
      success: true,
      session: {
        id: newSession.id,
        studentName: newSession.student_name,
        whatsappNumber: newSession.whatsapp_number,
        educationLevel: newSession.education_level as EducationLevel,
        status: newSession.status,
        createdAt: newSession.created_at,
      },
    };
  } catch (err) {
    console.error('Unexpected error di registerStudent:', err);
    return {
      success: false,
      error: 'Terjadi kesalahan sistem saat mendaftarkan siswa baru.',
      code: 'SERVER_ERROR',
    };
  }
}

