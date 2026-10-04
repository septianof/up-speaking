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
