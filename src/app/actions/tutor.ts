'use server';

import { createClient } from '@/lib/supabase/server';
import type {
  EducationLevel,
  GradeSessionResult,
  GetTutorQueueResult,
  TutorQueueItem,
} from '@/types';

/**
 * Server Action: gradeSession (Task DB-07)
 * 
 * Tanggung Jawab:
 * 1. Memverifikasi autentikasi staf (Tutor atau Admin).
 * 2. Memeriksa kecocokan jenjang jika aktor adalah Tutor (Elementary vs High School).
 * 3. Memvalidasi bahwa sesi sudah berstatus 'submitted' (atau 'graded' jika revisi penilaian).
 * 4. Memvalidasi level resmi (Beginner, Intermediate, atau Advanced) di tabel levels.
 * 5. Memperbarui status sesi menjadi 'graded', mencatat level_id dan reviewed_by (UUID tutor).
 */
export async function gradeSession(
  sessionId: string,
  levelId: number
): Promise<GradeSessionResult> {
  try {
    if (!sessionId) {
      return {
        success: false,
        error: 'ID sesi ujian wajib disertakan.',
      };
    }

    if (!levelId || isNaN(levelId)) {
      return {
        success: false,
        error: 'Pilihan level penempatan resmi wajib ditentukan.',
      };
    }

    const supabase = createClient();

    // 1. Verifikasi autentikasi pengguna staf
    const {
      data: { user },
      error: authErr,
    } = await supabase.auth.getUser();

    if (authErr || !user) {
      return {
        success: false,
        error: 'Akses ditolak. Anda harus login sebagai staf/tutor terlebih dahulu.',
      };
    }

    // 2. Ambil data profil penilai dari tabel profiles
    const { data: profile, error: profileErr } = await supabase
      .from('profiles')
      .select('id, full_name, role, education_level')
      .eq('id', user.id)
      .maybeSingle();

    if (profileErr || !profile) {
      console.error('Error saat mengambil data profil staf:', profileErr);
      return {
        success: false,
        error: 'Profil akun staf tidak ditemukan di sistem.',
      };
    }

    // 3. Ambil data sesi ujian peserta
    const { data: session, error: sessionErr } = await supabase
      .from('test_sessions')
      .select('id, student_name, education_level, status')
      .eq('id', sessionId)
      .maybeSingle();

    if (sessionErr || !session) {
      console.error('Error saat mengambil data sesi ujian:', sessionErr);
      return {
        success: false,
        error: 'Data sesi ujian peserta tidak ditemukan.',
      };
    }

    // Validasi status sesi: hanya sesi yang telah dikumpulkan (submitted / graded) yang dapat dinilai
    const validStatuses = ['submitted', 'graded', 'completed'];
    if (!validStatuses.includes(session.status)) {
      return {
        success: false,
        error: `Siswa "${session.student_name}" belum menyelesaikan lembar ujian (status: ${session.status}). Penilaian hanya dapat dilakukan setelah ujian dikumpulkan.`,
      };
    }

    // Validasi wewenang jenjang tutor (Kedaulatan Evaluasi Jenjang)
    if (
      profile.role === 'tutor' &&
      profile.education_level &&
      profile.education_level !== session.education_level
    ) {
      const tutorLevelLabel =
        profile.education_level === 'elementary' ? 'Elementary (SD)' : 'High School (SMP/SMA)';
      const studentLevelLabel =
        session.education_level === 'elementary' ? 'Elementary (SD)' : 'High School (SMP/SMA)';

      return {
        success: false,
        error: `Akses ditolak: Anda terdaftar sebagai Tutor jenjang ${tutorLevelLabel}, tidak memiliki wewenang untuk menilai siswa jenjang ${studentLevelLabel}.`,
      };
    }

    // 4. Verifikasi pilihan level penempatan di tabel levels
    const { data: levelData, error: levelErr } = await supabase
      .from('levels')
      .select('id, name, description')
      .eq('id', levelId)
      .maybeSingle();

    if (levelErr || !levelData) {
      return {
        success: false,
        error: 'Level penempatan yang dipilih tidak valid di database.',
      };
    }

    // 5. Update data sesi menjadi 'graded' dan simpan reviewed_by
    const { error: updateErr } = await supabase
      .from('test_sessions')
      .update({
        assigned_level_id: levelId,
        reviewed_by: user.id,
        status: 'graded',
      })
      .eq('id', sessionId);

    if (updateErr) {
      console.error('Error saat memperbarui penetapan level tutor:', updateErr);
      return {
        success: false,
        error: 'Gagal menyimpan penetapan level ke database.',
      };
    }

    return {
      success: true,
      message: `Level resmi "${levelData.name}" berhasil ditetapkan untuk siswa ${session.student_name}.`,
      session: {
        id: session.id,
        studentName: session.student_name,
        educationLevel: session.education_level as EducationLevel,
        status: 'graded',
        levelId: levelData.id,
        levelName: levelData.name,
        reviewedBy: profile.full_name || profile.id,
      },
    };
  } catch (err) {
    console.error('Unexpected error di gradeSession:', err);
    return {
      success: false,
      error: 'Terjadi kesalahan sistem saat menyimpan evaluasi tutor.',
    };
  }
}

/**
 * Server Action: getTutorQueue (Task TUT-02 & DB-07)
 * 
 * Tanggung Jawab:
 * Mengambil daftar antrean siswa yang berstatus 'submitted' (prioritas review)
 * dan 'graded' (riwayat evaluasi), terfilter otomatis sesuai jenjang tutor yang login.
 */
export async function getTutorQueue(
  explicitLevel?: EducationLevel,
  statusFilter: 'all' | 'pending' | 'graded' = 'all'
): Promise<GetTutorQueueResult> {
  try {
    const supabase = createClient();

    // 1. Verifikasi autentikasi staf
    const {
      data: { user },
      error: authErr,
    } = await supabase.auth.getUser();

    if (authErr || !user) {
      return {
        success: false,
        error: 'Akses ditolak. Anda harus login sebagai staf/tutor terlebih dahulu.',
      };
    }

    // 2. Ambil profil staf untuk memeriksa spesialisasi jenjang
    const { data: profile } = await supabase
      .from('profiles')
      .select('id, role, education_level')
      .eq('id', user.id)
      .maybeSingle();

    // Tentukan jenjang yang akan difilter
    // Jika tutor memiliki jenjang spesifik di profile, kunci ke jenjang tersebut
    let targetEducationLevel: EducationLevel | undefined = explicitLevel;
    if (profile?.role === 'tutor' && profile.education_level) {
      targetEducationLevel = profile.education_level as EducationLevel;
    }

    // 3. Query sesi siswa yang berstatus submitted dan graded
    let query = supabase
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
        completed_at,
        created_at,
        assigned_level_id,
        reviewed_by,
        levels:assigned_level_id (
          id,
          name
        ),
        reviewer:reviewed_by (
          id,
          full_name,
          email
        )
      `)
      .in('status', ['submitted', 'graded', 'completed'])
      .order('created_at', { ascending: false });

    if (targetEducationLevel) {
      query = query.eq('education_level', targetEducationLevel);
    }

    if (statusFilter === 'pending') {
      query = query.eq('status', 'submitted');
    } else if (statusFilter === 'graded') {
      query = query.in('status', ['graded', 'completed']);
    }

    const { data: sessionsData, error: fetchErr } = await query;

    if (fetchErr) {
      console.error('Error saat mengambil antrean evaluasi tutor:', fetchErr);
      return {
        success: false,
        error: 'Gagal memuat antrean evaluasi siswa.',
      };
    }

    // Format data output yang bersih dan ramah frontend
    const formattedQueue: TutorQueueItem[] = (sessionsData || []).map((s) => {
      const levelObj = Array.isArray(s.levels) ? s.levels[0] : s.levels;
      const reviewerObj = Array.isArray(s.reviewer) ? s.reviewer[0] : s.reviewer;

      return {
        id: s.id,
        studentName: s.student_name,
        whatsappNumber: s.whatsapp_number,
        educationLevel: s.education_level as EducationLevel,
        status: s.status,
        durationMinutes: s.duration_minutes ?? null,
        totalQuestions: s.total_questions,
        correctAnswers: s.correct_answers,
        finalScorePercent: Number(s.final_score_percent ?? 0),
        completedAt: s.completed_at || s.created_at,
        assignedLevelId: s.assigned_level_id ?? null,
        levelName: levelObj?.name ?? null,
        reviewedBy: s.reviewed_by ?? null,
        reviewerName: reviewerObj?.full_name ?? null,
      };
    });

    return {
      success: true,
      data: formattedQueue,
    };
  } catch (err) {
    console.error('Unexpected error di getTutorQueue:', err);
    return {
      success: false,
      error: 'Terjadi kesalahan sistem saat mengambil antrean evaluasi.',
    };
  }
}

export interface AvailableLevel {
  id: number;
  name: string;
  description: string | null;
}

export interface TutorDashboardStats {
  profile: {
    id: string;
    email: string;
    fullName: string;
    role: 'tutor' | 'admin';
    educationLevel: EducationLevel;
  };
  pendingCount: number;
  gradedCount: number;
  totalEvaluated: number;
  averageScore: number;
}

export type GetTutorDashboardStatsResult =
  | {
      success: true;
      data: TutorDashboardStats;
    }
  | {
      success: false;
      error: string;
    };

/**
 * Server Action: getAvailableLevels
 * Mengambil daftar level penempatan resmi dari tabel levels (Beginner, Intermediate, Advanced).
 */
export async function getAvailableLevels(): Promise<{
  success: boolean;
  data?: AvailableLevel[];
  error?: string;
}> {
  try {
    const supabase = createClient();
    const { data, error } = await supabase
      .from('levels')
      .select('id, name, description')
      .order('id', { ascending: true });

    if (error) {
      console.error('Error saat fetch levels:', error);
      return { success: false, error: 'Gagal memuat master data level penempatan.' };
    }

    return {
      success: true,
      data: data || [],
    };
  } catch (err) {
    console.error('Unexpected error di getAvailableLevels:', err);
    return { success: false, error: 'Terjadi kesalahan sistem saat memuat level.' };
  }
}

/**
 * Server Action: getTutorDashboardStats
 * Mengambil informasi profil tutor yang login dan metrik agregasi antrean jenjangnya.
 */
export async function getTutorDashboardStats(): Promise<GetTutorDashboardStatsResult> {
  try {
    const supabase = createClient();

    const {
      data: { user },
      error: authErr,
    } = await supabase.auth.getUser();

    if (authErr || !user) {
      return {
        success: false,
        error: 'Akses ditolak. Anda belum login.',
      };
    }

    const { data: profile, error: profileErr } = await supabase
      .from('profiles')
      .select('id, email, full_name, role, education_level')
      .eq('id', user.id)
      .maybeSingle();

    if (profileErr || !profile) {
      return {
        success: false,
        error: 'Profil staf tidak ditemukan.',
      };
    }

    const tutorEducationLevel = (profile.education_level as EducationLevel) || 'elementary';

    // Ambil seluruh sesi untuk jenjang ini
    const { data: sessions, error: sessionsErr } = await supabase
      .from('test_sessions')
      .select('id, status, final_score_percent')
      .eq('education_level', tutorEducationLevel)
      .in('status', ['submitted', 'graded', 'completed']);

    if (sessionsErr) {
      console.error('Error fetch sessions stats:', sessionsErr);
      return {
        success: false,
        error: 'Gagal memuat statistik antrean tutor.',
      };
    }

    const pendingCount = (sessions || []).filter((s) => s.status === 'submitted').length;
    const gradedSessions = (sessions || []).filter(
      (s) => s.status === 'graded' || s.status === 'completed'
    );
    const gradedCount = gradedSessions.length;
    const totalEvaluated = (sessions || []).length;

    let totalScore = 0;
    (sessions || []).forEach((s) => {
      totalScore += Number(s.final_score_percent || 0);
    });

    const averageScore =
      totalEvaluated > 0 ? Math.round((totalScore / totalEvaluated) * 10) / 10 : 0;

    return {
      success: true,
      data: {
        profile: {
          id: profile.id,
          email: profile.email || user.email || '',
          fullName: profile.full_name || 'Tutor Up Speaking',
          role: (profile.role as 'tutor' | 'admin') || 'tutor',
          educationLevel: tutorEducationLevel,
        },
        pendingCount,
        gradedCount,
        totalEvaluated,
        averageScore,
      },
    };
  } catch (err) {
    console.error('Unexpected error di getTutorDashboardStats:', err);
    return {
      success: false,
      error: 'Terjadi kesalahan sistem saat memuat profil dan statistik tutor.',
    };
  }
}
