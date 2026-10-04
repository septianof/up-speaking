'use server';

import { createClient } from '@/lib/supabase/server';
import { normalizeWhatsAppNumber } from '@/lib/whatsapp';

export interface LevelSetting {
  id: number;
  name: string;
  minScore: number;
  maxScore: number;
  maxDurationMinutes: number | null;
  description: string;
}

export interface TutorContactSetting {
  name: string;
  whatsapp: string;
}

export type GetSettingsResult =
  | {
      success: true;
      durationMinutes: number;
      tutorElementary: TutorContactSetting;
      tutorHighSchool: TutorContactSetting;
      levels: LevelSetting[];
    }
  | {
      success: false;
      error: string;
    };

export interface UpdateSettingsPayload {
  durationMinutes: number;
  tutorElementary: TutorContactSetting;
  tutorHighSchool: TutorContactSetting;
  levels: {
    id: number;
    minScore: number;
    maxScore: number;
    maxDurationMinutes?: number | null;
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
 * Mengambil pengaturan durasi ujian, kontak tutor per jenjang, dan konfigurasi matrix level penempatan.
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

    // 2. Ambil pengaturan durasi dan tutor dari tabel settings
    const { data: settingData, error: settingErr } = await supabase
      .from('settings')
      .select(`
        test_duration_minutes,
        tutor_elementary_name,
        tutor_elementary_whatsapp,
        tutor_highschool_name,
        tutor_highschool_whatsapp
      `)
      .eq('id', 1)
      .maybeSingle();

    if (settingErr) {
      console.error('Error saat fetch settings:', settingErr);
      return {
        success: false,
        error: 'Gagal memuat pengaturan sistem dari database.',
      };
    }

    const durationMinutes = settingData?.test_duration_minutes ?? 45;
    const tutorElementary: TutorContactSetting = {
      name: settingData?.tutor_elementary_name || 'Miss Sarah',
      whatsapp: settingData?.tutor_elementary_whatsapp || '6281234567890',
    };
    const tutorHighSchool: TutorContactSetting = {
      name: settingData?.tutor_highschool_name || 'Mr. David',
      whatsapp: settingData?.tutor_highschool_whatsapp || '6289876543210',
    };

    // 3. Ambil konfigurasi 3 level dari tabel levels
    const { data: levelsData, error: levelsErr } = await supabase
      .from('levels')
      .select('id, name, min_score_percent, max_score_percent, max_duration_minutes, description')
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
      maxDurationMinutes:
        l.max_duration_minutes !== null && l.max_duration_minutes !== undefined
          ? Number(l.max_duration_minutes)
          : null,
      description: l.description || '',
    }));

    return {
      success: true,
      durationMinutes,
      tutorElementary,
      tutorHighSchool,
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
 * Memperbarui durasi ujian, kontak tutor per jenjang, dan matrix evaluasi 3 level penempatan.
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

    // 2. Validasi Durasi Ujian (5 - 180 menit)
    const duration = Math.round(Number(payload.durationMinutes));
    if (isNaN(duration) || duration < 5 || duration > 180) {
      return {
        success: false,
        error: 'Durasi ujian harus berupa angka antara 5 hingga 180 menit.',
      };
    }

    // 3. Validasi Kontak Tutor Elementary
    const elemName = payload.tutorElementary?.name?.trim() || '';
    if (elemName.length < 2) {
      return {
        success: false,
        error: 'Nama tutor jenjang Elementary (SD) harus diisi minimal 2 karakter.',
      };
    }
    const elemWaNorm = normalizeWhatsAppNumber(payload.tutorElementary?.whatsapp || '');
    if (!elemWaNorm) {
      return {
        success: false,
        error: 'Nomor WhatsApp tutor Elementary tidak valid (wajib diawali 08/628, min 10 digit).',
      };
    }

    // 4. Validasi Kontak Tutor High School
    const highName = payload.tutorHighSchool?.name?.trim() || '';
    if (highName.length < 2) {
      return {
        success: false,
        error: 'Nama tutor jenjang High School harus diisi minimal 2 karakter.',
      };
    }
    const highWaNorm = normalizeWhatsAppNumber(payload.tutorHighSchool?.whatsapp || '');
    if (!highWaNorm) {
      return {
        success: false,
        error: 'Nomor WhatsApp tutor High School tidak valid (wajib diawali 08/628, min 10 digit).',
      };
    }

    // 5. Validasi Struktur 3 Level & Matrix
    if (!payload.levels || payload.levels.length !== 3) {
      return {
        success: false,
        error: 'Konfigurasi wajib mencakup tepat 3 level penempatan (Beginner, Intermediate, Advanced).',
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

    if (
      intermediate.maxDurationMinutes !== null &&
      intermediate.maxDurationMinutes !== undefined &&
      (Number(intermediate.maxDurationMinutes) < 1 || Number(intermediate.maxDurationMinutes) > duration)
    ) {
      return {
        success: false,
        error: `Batas waktu pengerjaan Intermediate harus antara 1 menit hingga ${duration} menit (durasi ujian).`,
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

    if (
      advanced.maxDurationMinutes !== null &&
      advanced.maxDurationMinutes !== undefined &&
      (Number(advanced.maxDurationMinutes) < 1 || Number(advanced.maxDurationMinutes) > duration)
    ) {
      return {
        success: false,
        error: `Batas waktu pengerjaan Advanced harus antara 1 menit hingga ${duration} menit (durasi ujian).`,
      };
    }

    // 6. Update tabel settings (durasi & tutor per jenjang)
    const { error: updateSettingErr } = await supabase
      .from('settings')
      .update({
        test_duration_minutes: duration,
        tutor_elementary_name: elemName,
        tutor_elementary_whatsapp: elemWaNorm,
        tutor_highschool_name: highName,
        tutor_highschool_whatsapp: highWaNorm,
        updated_at: new Date().toISOString(),
      })
      .eq('id', 1);

    if (updateSettingErr) {
      console.error('Error saat update settings:', updateSettingErr);
      return {
        success: false,
        error: 'Gagal memperbarui pengaturan sistem di database.',
      };
    }

    // 7. Update masing-masing level di tabel levels (rentang skor & batas waktu menit)
    for (const lvl of sortedLevels) {
      const updatePayload: Record<string, unknown> = {
        min_score_percent: lvl.minScore,
        max_score_percent: lvl.maxScore,
        max_duration_minutes:
          lvl.maxDurationMinutes !== null && lvl.maxDurationMinutes !== undefined
            ? Math.round(Number(lvl.maxDurationMinutes))
            : null,
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
      message: 'Seluruh pengaturan (durasi ujian, matrix level, dan kontak tutor) berhasil disimpan!',
    };
  } catch (err) {
    console.error('Unexpected error di updateExamSettings:', err);
    return {
      success: false,
      error: 'Terjadi kesalahan sistem saat menyimpan pengaturan.',
    };
  }
}
