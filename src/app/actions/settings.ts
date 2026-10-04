'use server';

import { createClient } from '@/lib/supabase/server';

export interface LevelSetting {
  id: number;
  name: string;
  minScore: number;
  maxScore: number;
  description: string;
}

export type GetSettingsResult =
  | {
      success: true;
      durationMinutes: number;
      levels: LevelSetting[];
    }
  | {
      success: false;
      error: string;
    };

export interface UpdateSettingsPayload {
  durationMinutes: number;
  levels: {
    id: number;
    minScore: number;
    maxScore: number;
    description?: string;
  }[];
}

export type UpdateSettingsResult =
  | {
      success: true;
      message: string;
    }
  | {
      success: false;
      error: string;
    };

/**
 * Server Action: getExamSettings
 * Mengambil pengaturan durasi ujian dan konfigurasi 3 level penempatan.
 */
export async function getExamSettings(): Promise<GetSettingsResult> {
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
        error: 'Akses ditolak. Anda harus login sebagai admin.',
      };
    }

    // 2. Ambil pengaturan durasi dari tabel settings
    const { data: settingData, error: settingErr } = await supabase
      .from('settings')
      .select('test_duration_minutes')
      .eq('id', 1)
      .maybeSingle();

    if (settingErr) {
      console.error('Error saat fetch settings:', settingErr);
      return {
        success: false,
        error: 'Gagal memuat durasi ujian dari database.',
      };
    }

    const durationMinutes = settingData?.test_duration_minutes ?? 45;

    // 3. Ambil konfigurasi 3 level dari tabel levels
    const { data: levelsData, error: levelsErr } = await supabase
      .from('levels')
      .select('id, name, min_score_percent, max_score_percent, description')
      .order('id', { ascending: true });

    if (levelsErr || !levelsData) {
      console.error('Error saat fetch levels:', levelsErr);
      return {
        success: false,
        error: 'Gagal memuat konfigurasi level dari database.',
      };
    }

    const levels: LevelSetting[] = levelsData.map((l) => ({
      id: l.id,
      name: l.name,
      minScore: Number(l.min_score_percent),
      maxScore: Number(l.max_score_percent),
      description: l.description || '',
    }));

    return {
      success: true,
      durationMinutes,
      levels,
    };
  } catch (err) {
    console.error('Unexpected error di getExamSettings:', err);
    return {
      success: false,
      error: 'Terjadi kesalahan sistem saat mengambil pengaturan.',
    };
  }
}

/**
 * Server Action: updateExamSettings
 * Memperbarui durasi ujian dan rentang persentase 3 level dengan validasi bersambung ketat (0% - 100%).
 */
export async function updateExamSettings(
  payload: UpdateSettingsPayload
): Promise<UpdateSettingsResult> {
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
        error: 'Akses ditolak. Anda harus login sebagai admin.',
      };
    }

    // 2. Validasi Durasi Ujian (10 - 180 menit)
    const duration = Math.round(Number(payload.durationMinutes));
    if (isNaN(duration) || duration < 5 || duration > 180) {
      return {
        success: false,
        error: 'Durasi ujian harus berupa angka antara 5 hingga 180 menit.',
      };
    }

    // 3. Validasi Struktur 3 Level
    if (!payload.levels || payload.levels.length !== 3) {
      return {
        success: false,
        error: 'Konfigurasi wajib mencakup tepat 3 level penempatan.',
      };
    }

    // Urutkan berdasarkan ID (1: Beginner, 2: Intermediate, 3: Advanced)
    const sortedLevels = [...payload.levels].sort((a, b) => a.id - b.id);
    const [beginner, intermediate, advanced] = sortedLevels;

    // A. Validasi Beginner: mulai dari 0
    if (beginner.minScore !== 0) {
      return {
        success: false,
        error: 'Rentang nilai level Beginner wajib dimulai dari 0%.',
      };
    }

    if (beginner.maxScore < beginner.minScore) {
      return {
        success: false,
        error: 'Batas atas nilai Beginner tidak boleh lebih kecil dari 0%.',
      };
    }

    // B. Validasi Intermediate: bersambung dari Beginner + 1
    if (intermediate.minScore !== beginner.maxScore + 1) {
      return {
        success: false,
        error: `Batas bawah Intermediate (${intermediate.minScore}%) harus tepat 1 angka di atas batas atas Beginner (${beginner.maxScore}%).`,
      };
    }

    if (intermediate.maxScore < intermediate.minScore) {
      return {
        success: false,
        error: 'Batas atas nilai Intermediate tidak boleh lebih kecil dari batas bawahnya.',
      };
    }

    // C. Validasi Advanced: bersambung dari Intermediate + 1 dan berakhir di 100
    if (advanced.minScore !== intermediate.maxScore + 1) {
      return {
        success: false,
        error: `Batas bawah Advanced (${advanced.minScore}%) harus tepat 1 angka di atas batas atas Intermediate (${intermediate.maxScore}%).`,
      };
    }

    if (advanced.maxScore !== 100) {
      return {
        success: false,
        error: 'Batas akhir nilai level Advanced wajib tepat di 100%.',
      };
    }

    // 4. Update tabel settings (durasi)
    const { error: updateSettingErr } = await supabase
      .from('settings')
      .update({
        test_duration_minutes: duration,
        updated_at: new Date().toISOString(),
      })
      .eq('id', 1);

    if (updateSettingErr) {
      console.error('Error saat update settings:', updateSettingErr);
      return {
        success: false,
        error: 'Gagal memperbarui durasi ujian di database.',
      };
    }

    // 5. Update masing-masing level di tabel levels (rentang skor)
    for (const lvl of sortedLevels) {
      const updatePayload: Record<string, unknown> = {
        min_score_percent: lvl.minScore,
        max_score_percent: lvl.maxScore,
        updated_at: new Date().toISOString(),
      };

      if (lvl.description !== undefined && lvl.description.trim().length > 0) {
        updatePayload.description = lvl.description.trim();
      }

      const { error: updateLevelErr } = await supabase
        .from('levels')
        .update(updatePayload)
        .eq('id', lvl.id);

      if (updateLevelErr) {
        console.error(`Error saat update level id ${lvl.id}:`, updateLevelErr);
        return {
          success: false,
          error: `Gagal memperbarui data level ${lvl.id}.`,
        };
      }
    }

    return {
      success: true,
      message: 'Pengaturan durasi ujian dan rentang 3 level berhasil disimpan!',
    };
  } catch (err) {
    console.error('Unexpected error di updateExamSettings:', err);
    return {
      success: false,
      error: 'Terjadi kesalahan sistem saat menyimpan pengaturan.',
    };
  }
}
