'use server';

import { createClient } from '@/lib/supabase/server';

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
  completedAt: string;
  totalQuestions: number;
  correctAnswers: number;
  finalScorePercent: number;
  levelId: number;
  levelName: string;
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

    // Ambil seluruh sesi ujian yang berstatus 'completed'
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
      `)
      .eq('status', 'completed');

    if (error) {
      console.error('Error saat mengambil data metrik dashboard:', error);
      return {
        success: false,
        error: 'Gagal memuat ringkasan data metrik.',
      };
    }

    const totalParticipants = sessions?.length || 0;

    let beginnerCount = 0;
    let intermediateCount = 0;
    let advancedCount = 0;
    let totalScore = 0;

    sessions?.forEach((s) => {
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

    const beginnerPercent = totalParticipants > 0 ? Math.round((beginnerCount / totalParticipants) * 100) : 0;
    const intermediatePercent = totalParticipants > 0 ? Math.round((intermediateCount / totalParticipants) * 100) : 0;
    const advancedPercent = totalParticipants > 0 ? Math.round((advancedCount / totalParticipants) * 100) : 0;
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
 * Mengambil daftar riwayat hasil ujian siswa yang berstatus 'completed' dari yang terbaru.
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
        total_questions,
        correct_answers,
        final_score_percent,
        assigned_level_id,
        can_retest,
        completed_at,
        created_at,
        levels:assigned_level_id (
          id,
          name
        )
      `)
      .eq('status', 'completed')
      .order('completed_at', { ascending: false, nullsFirst: false });

    if (error) {
      console.error('Error saat mengambil riwayat siswa:', error);
      return {
        success: false,
        error: 'Gagal memuat tabel riwayat hasil siswa.',
      };
    }

    const records: StudentHistoryRecord[] = (sessions || []).map((s) => {
      const level = Array.isArray(s.levels) ? s.levels[0] : s.levels;
      return {
        id: s.id,
        studentName: s.student_name,
        whatsappNumber: s.whatsapp_number,
        completedAt: s.completed_at || s.created_at,
        totalQuestions: s.total_questions || 0,
        correctAnswers: s.correct_answers || 0,
        finalScorePercent: Number(s.final_score_percent ?? 0),
        levelId: s.assigned_level_id ?? 0,
        levelName: level?.name || 'Belum Ditentukan',
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

