'use server';

import { createClient } from '@/lib/supabase/server';
import { normalizeWhatsAppNumber } from '@/lib/whatsapp';
import type {
  StartSessionResult,
  SanitizedQuestion,
  SanitizedOption,
  SaveAnswerResult,
  SubmitExamResult,
  GetSessionResultResponse,
  EducationLevel,
  VerifyStudentAccessResult,
  TestSessionStatus,
} from '@/types';

/**
 * Algoritma Fisher-Yates (Knuth) Shuffle untuk mengacak urutan elemen array secara merata.
 */
function shuffle<T>(array: T[]): T[] {
  const shuffled = [...array];
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
  }
  return shuffled;
}

/**
 * Server Action: verifyStudentAccess
 * Memeriksa status pendaftaran siswa tanpa memicu perubahan status ujian.
 * Digunakan untuk validasi gerbang masuk awal di halaman landing page.
 */
export async function verifyStudentAccess(
  rawName: string,
  rawWhatsApp: string
): Promise<VerifyStudentAccessResult> {
  try {
    const studentName = rawName?.trim();
    if (!studentName || studentName.length < 2) {
      return {
        success: false,
        error: 'Nama lengkap wajib diisi minimal 2 karakter.',
        code: 'INVALID_INPUT',
      };
    }

    const normalizedWA = normalizeWhatsAppNumber(rawWhatsApp);
    if (!normalizedWA) {
      return {
        success: false,
        error: 'Nomor WhatsApp tidak valid. Masukkan nomor HP/WA yang aktif (contoh: 08123456789).',
        code: 'INVALID_INPUT',
      };
    }

    const supabase = createClient();
    const { data: sessions, error } = await supabase
      .from('test_sessions')
      .select('id, student_name, whatsapp_number, education_level, status, can_retest, created_at')
      .eq('whatsapp_number', normalizedWA)
      .ilike('student_name', studentName)
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error saat verifikasi akses siswa:', error);
      return {
        success: false,
        error: 'Terjadi gangguan saat memverifikasi data peserta.',
        code: 'SERVER_ERROR',
      };
    }

    if (!sessions || sessions.length === 0) {
      return {
        success: false,
        error: `Data atas nama "${studentName}" dengan nomor ini belum terdaftar di sistem. Silakan temui staf kami di meja pendaftaran untuk registrasi terlebih dahulu.`,
        code: 'NOT_REGISTERED',
      };
    }

    // 1. Cek sesi in_progress
    const inProgress = sessions.find((s) => s.status === 'in_progress');
    if (inProgress) {
      return {
        success: true,
        code: 'IN_PROGRESS',
        session: {
          id: inProgress.id,
          studentName: inProgress.student_name,
          whatsappNumber: inProgress.whatsapp_number,
          educationLevel: inProgress.education_level as EducationLevel,
          status: inProgress.status as TestSessionStatus,
        },
      };
    }

    // 2. Cek sesi registered (siap ujian)
    const registered = sessions.find((s) => s.status === 'registered');
    if (registered) {
      return {
        success: true,
        code: 'READY_TO_START',
        session: {
          id: registered.id,
          studentName: registered.student_name,
          whatsappNumber: registered.whatsapp_number,
          educationLevel: registered.education_level as EducationLevel,
          status: registered.status as TestSessionStatus,
        },
      };
    }

    // 3. Jika hanya ada sesi yang sudah selesai (submitted, graded, completed)
    const completedSession = sessions.find(
      (s) => (s.status === 'submitted' || s.status === 'graded' || s.status === 'completed') && !s.can_retest
    );
    if (completedSession) {
      return {
        success: false,
        error: `Peserta atas nama "${studentName}" telah menyelesaikan tes penempatan. Hasil tes Anda sedang atau telah dievaluasi oleh Tutor kami. Silakan hubungi staf/tutor jika Anda memerlukan bantuan.`,
        code: 'SESSION_BLOCKED',
      };
    }

    return {
      success: false,
      error: `Data peserta ditemukan, namun tidak memiliki sesi tes yang dapat dikerjakan. Silakan hubungi admin di meja pendaftaran.`,
      code: 'NOT_REGISTERED',
    };
  } catch (err) {
    console.error('Unexpected error di verifyStudentAccess:', err);
    return {
      success: false,
      error: 'Terjadi kesalahan sistem saat memverifikasi akses pendaftaran.',
      code: 'SERVER_ERROR',
    };
  }
}

/**
 * Server Action: startSession
 * 
 * Tanggung Jawab:
 * 1. Validasi nama siswa & nomor WhatsApp (format 628xxx).
 * 2. Cek sesi di database yang didaftarkan oleh admin (status: 'registered' atau 'in_progress').
 *    - Jika belum terdaftar -> tolak dengan code: 'NOT_REGISTERED'.
 *    - Jika sudah selesai -> tolak dengan code: 'SESSION_BLOCKED'.
 * 3. Crash Recovery: Jika status 'in_progress', pulihkan jawaban yang sudah disimpan (auto-saved) dan muat soal sesuai jenjang.
 * 4. Sesi Baru: Jika status 'registered', ambil soal aktif sesuai jenjang sesi, acak urutan & opsi dengan Fisher-Yates, ubah status ke 'in_progress', dan catat waktu mulai.
 * 5. Kembalikan daftar soal & opsi teracak TANPA kolom is_correct.
 */
export async function startSession(
  rawName: string,
  rawWhatsApp: string,
  rawEducationLevel?: EducationLevel
): Promise<StartSessionResult> {
  try {
    const studentName = rawName?.trim();
    if (!studentName || studentName.length < 2) {
      return {
        success: false,
        error: 'Nama lengkap wajib diisi minimal 2 karakter.',
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

    const normalizedWA = normalizeWhatsAppNumber(rawWhatsApp);
    if (!normalizedWA) {
      return {
        success: false,
        error: 'Nomor WhatsApp tidak valid. Masukkan nomor ponsel aktif dengan format yang benar (contoh: 081234567890).',
        code: 'INVALID_INPUT',
      };
    }

    const supabase = createClient();
    const nowIso = new Date().toISOString();

    // 1. Ambil seluruh sesi siswa ini
    const { data: studentSessions, error: fetchErr } = await supabase
      .from('test_sessions')
      .select('*')
      .eq('whatsapp_number', normalizedWA)
      .ilike('student_name', studentName)
      .order('created_at', { ascending: false });

    if (fetchErr) {
      console.error('Error saat memeriksa sesi peserta:', fetchErr);
      return {
        success: false,
        error: 'Terjadi gangguan saat memeriksa sesi ujian. Silakan coba kembali.',
        code: 'SERVER_ERROR',
      };
    }

    // 2. Jika belum ada sesi sama sekali yang didaftarkan oleh admin
    if (!studentSessions || studentSessions.length === 0) {
      return {
        success: false,
        error: `Data atas nama "${studentName}" dengan nomor ini belum terdaftar di sistem. Silakan temui staf kami di meja pendaftaran untuk registrasi terlebih dahulu.`,
        code: 'NOT_REGISTERED',
      };
    }

    // 3. Cek apakah ada sesi berjalan (in_progress) -> Crash Recovery
    const inProgressSession = studentSessions.find((s) => s.status === 'in_progress');
    if (inProgressSession) {
      const sessionEduLevel = (inProgressSession.education_level as EducationLevel) || rawEducationLevel || 'elementary';

      // Ambil jawaban yang sebelumnya sudah disimpan (auto-saved)
      const { data: answersData } = await supabase
        .from('student_answers')
        .select('question_id, selected_option_id')
        .eq('session_id', inProgressSession.id);

      const savedAnswers: Record<string, string> = {};
      answersData?.forEach((ans) => {
        if (ans.selected_option_id) {
          savedAnswers[ans.question_id] = ans.selected_option_id;
        }
      });

      // Ambil soal aktif sesuai jenjang sesi tanpa is_correct
      const { data: questionsData, error: qErr } = await supabase
        .from('questions')
        .select(`
          id,
          question_text,
          education_level,
          question_options (
            id,
            question_id,
            option_text,
            order_index
          )
        `)
        .eq('is_active', true)
        .eq('education_level', sessionEduLevel);

      if (qErr || !questionsData || questionsData.length === 0) {
        console.error('Error saat mengambil soal untuk sesi recovery:', qErr);
        return {
          success: false,
          error: 'Gagal memuat soal ujian.',
          code: 'SERVER_ERROR',
        };
      }

      const resumedQuestions: SanitizedQuestion[] = questionsData.map((q) => {
        const rawOptions = (q.question_options as Array<{
          id: string;
          question_id: string;
          option_text: string;
          order_index: number;
        }>) || [];

        const sortedOptions: SanitizedOption[] = [...rawOptions]
          .sort((a, b) => a.order_index - b.order_index)
          .map((opt) => ({
            id: opt.id,
            question_id: opt.question_id,
            option_text: opt.option_text,
          }));

        return {
          id: q.id,
          question_text: q.question_text,
          education_level: q.education_level as EducationLevel,
          options: sortedOptions,
        };
      });

      return {
        success: true,
        isResumed: true,
        session: {
          id: inProgressSession.id,
          student_name: inProgressSession.student_name,
          whatsapp_number: inProgressSession.whatsapp_number,
          education_level: sessionEduLevel,
          start_time: inProgressSession.start_time,
          end_time: inProgressSession.end_time,
          total_questions: inProgressSession.total_questions || resumedQuestions.length,
        },
        questions: resumedQuestions,
        savedAnswers,
      };
    }

    // 4. Cek apakah ada sesi berstatus 'registered' (baru didaftarkan admin di meja registrasi)
    const registeredSession = studentSessions.find((s) => s.status === 'registered');
    if (registeredSession) {
      const sessionEduLevel = (registeredSession.education_level as EducationLevel) || rawEducationLevel || 'elementary';

      // Ambil seluruh butir pertanyaan aktif sesuai jenjang sesi tanpa is_correct
      const { data: questionsData, error: qErr } = await supabase
        .from('questions')
        .select(`
          id,
          question_text,
          education_level,
          question_options (
            id,
            question_id,
            option_text,
            order_index
          )
        `)
        .eq('is_active', true)
        .eq('education_level', sessionEduLevel);

      const levelLabel =
        sessionEduLevel === 'elementary' ? 'Elementary (SD)' : 'High School (SMP/SMA/Umum)';

      if (qErr || !questionsData || questionsData.length === 0) {
        console.error(`Error atau butir soal kosong untuk jenjang ${levelLabel}:`, qErr);
        return {
          success: false,
          error: `Belum ada butir soal ujian aktif untuk jenjang ${levelLabel}. Silakan hubungi admin Up Speaking.`,
          code: 'SERVER_ERROR',
        };
      }

      // Perbarui sesi menjadi 'in_progress', catat waktu mulai (start_time)
      const { error: updateErr } = await supabase
        .from('test_sessions')
        .update({
          status: 'in_progress',
          start_time: nowIso,
          total_questions: questionsData.length,
        })
        .eq('id', registeredSession.id);

      if (updateErr) {
        console.error('Error saat memulai sesi ujian dari status registered:', updateErr);
        return {
          success: false,
          error: 'Gagal memulai sesi ujian. Silakan coba kembali.',
          code: 'SERVER_ERROR',
        };
      }

      // Acak urutan butir soal & opsi jawaban dengan Fisher-Yates Shuffle
      const sanitizedQuestions: SanitizedQuestion[] = shuffle(questionsData).map((q) => {
        const rawOptions = (q.question_options as Array<{
          id: string;
          question_id: string;
          option_text: string;
          order_index: number;
        }>) || [];

        const shuffledOptions: SanitizedOption[] = shuffle(rawOptions).map((opt) => ({
          id: opt.id,
          question_id: opt.question_id,
          option_text: opt.option_text,
        }));

        return {
          id: q.id,
          question_text: q.question_text,
          education_level: q.education_level as EducationLevel,
          options: shuffledOptions,
        };
      });

      return {
        success: true,
        isResumed: false,
        session: {
          id: registeredSession.id,
          student_name: registeredSession.student_name,
          whatsapp_number: registeredSession.whatsapp_number,
          education_level: sessionEduLevel,
          start_time: nowIso,
          end_time: nowIso,
          total_questions: questionsData.length,
        },
        questions: sanitizedQuestions,
      };
    }

    // 5. Jika tidak ada sesi 'in_progress' maupun 'registered', periksa apakah sudah selesai
    const completedSession = studentSessions.find(
      (s) => (s.status === 'submitted' || s.status === 'graded' || s.status === 'completed') && !s.can_retest
    );

    if (completedSession) {
      return {
        success: false,
        error: `Peserta atas nama "${studentName}" telah menyelesaikan tes penempatan sebelumnya. Hasil tes Anda sedang atau telah dievaluasi oleh Tutor kami. Silakan hubungi staf/tutor jika Anda memerlukan bantuan atau izin tes ulang.`,
        code: 'SESSION_BLOCKED',
      };
    }

    return {
      success: false,
      error: `Data pendaftaran ditemukan, namun tidak ada sesi ujian yang siap dikerjakan. Silakan hubungi staf di meja pendaftaran.`,
      code: 'NOT_REGISTERED',
    };
  } catch (error) {
    console.error('Unexpected error di startSession:', error);
    return {
      success: false,
      error: 'Terjadi kesalahan sistem yang tidak terduga. Silakan coba lagi nanti.',
      code: 'SERVER_ERROR',
    };
  }
}

/**
 * Server Action: saveAnswer
 * 
 * Tanggung Jawab:
 * 1. Validasi ID parameter (sessionId, questionId, selectedOptionId).
 * 2. Memastikan sesi ujian masih aktif (in_progress & end_time > now).
 * 3. Memverifikasi bahwa pilihan jawaban terdaftar untuk butir soal tersebut.
 * 4. Melakukan upsert jawaban siswa ke tabel student_answers secara aman.
 */
export async function saveAnswer(
  sessionId: string,
  questionId: string,
  selectedOptionId: string
): Promise<SaveAnswerResult> {
  try {
    if (!sessionId || !questionId || !selectedOptionId) {
      return {
        success: false,
        error: 'Parameter penyimpanan jawaban tidak lengkap.',
      };
    }

    const supabase = createClient();
    const nowIso = new Date().toISOString();

    // 1. Verifikasi status sesi ujian
    const { data: session, error: sessionErr } = await supabase
      .from('test_sessions')
      .select('id, status, end_time')
      .eq('id', sessionId)
      .maybeSingle();

    if (sessionErr || !session) {
      return {
        success: false,
        error: 'Sesi ujian tidak ditemukan.',
      };
    }

    if (session.status !== 'in_progress') {
      return {
        success: false,
        error: 'Sesi ujian sudah diselesaikan atau ditutup.',
      };
    }

    if (new Date(session.end_time) <= new Date(nowIso)) {
      return {
        success: false,
        error: 'Waktu ujian telah berakhir.',
      };
    }

    // 2. Verifikasi kesesuaian opsi jawaban dengan butir soal
    const { data: validOption, error: optErr } = await supabase
      .from('question_options')
      .select('id')
      .eq('id', selectedOptionId)
      .eq('question_id', questionId)
      .maybeSingle();

    if (optErr || !validOption) {
      return {
        success: false,
        error: 'Pilihan jawaban tidak valid untuk butir soal ini.',
      };
    }

    // 3. Upsert jawaban ke tabel student_answers
    const { error: upsertErr } = await supabase
      .from('student_answers')
      .upsert(
        {
          session_id: sessionId,
          question_id: questionId,
          selected_option_id: selectedOptionId,
          updated_at: nowIso,
        },
        {
          onConflict: 'session_id,question_id',
        }
      );

    if (upsertErr) {
      console.error('Error saat menyimpan jawaban siswa:', upsertErr);
      return {
        success: false,
        error: 'Gagal menyimpan jawaban ke database.',
      };
    }

    return {
      success: true,
      questionId,
      selectedOptionId,
    };
  } catch (error) {
    console.error('Unexpected error di saveAnswer:', error);
    return {
      success: false,
      error: 'Terjadi kesalahan sistem saat menyimpan jawaban.',
    };
  }
}

/**
 * Server Action: submitExam
 * 
 * Tanggung Jawab:
 * 1. Validasi sesi pengerjaan siswa.
 * 2. Penanganan idempotensi: jika sesi sudah 'completed', kembalikan hasil sebelumnya beserta durasi dan tutor.
 * 3. Ambil seluruh jawaban siswa pada sesi dan cocokkan dengan kunci jawaban di question_options.
 * 4. Hitung jumlah benar, persentase skor akhir (0.00% - 100.00%), dan durasi pengerjaan riil (menit).
 * 5. Evaluasi Matrix Penentuan Level (Skor % + Waktu Pengerjaan):
 *    - Siswa dengan skor >= 80% (Advanced), jika waktu > 25 menit -> degradasi ke Intermediate.
 *    - Siswa dengan skor 60-79% (Intermediate), jika waktu > 20 menit -> degradasi ke Beginner.
 * 6. Update status sesi menjadi 'completed', catat correct_answers, final_score_percent, assigned_level_id, duration_minutes, dan completed_at.
 * 7. Kembalikan detail pencapaian, durasi pengerjaan, dan kontak WhatsApp tutor jenjang terkait.
 */
export async function submitExam(sessionId: string): Promise<SubmitExamResult> {
  try {
    if (!sessionId) {
      return {
        success: false,
        error: 'ID sesi ujian tidak valid.',
      };
    }

    const supabase = createClient();

    // 1. Ambil data sesi ujian saat ini beserta level jika sudah ada
    const { data: session, error: sessionErr } = await supabase
      .from('test_sessions')
      .select(`
        id,
        student_name,
        whatsapp_number,
        education_level,
        start_time,
        duration_minutes,
        status,
        total_questions,
        correct_answers,
        final_score_percent,
        assigned_level_id,
        completed_at,
        levels:assigned_level_id (
          id,
          name,
          description
        )
      `)
      .eq('id', sessionId)
      .maybeSingle();

    if (sessionErr || !session) {
      console.error('Error saat mengambil sesi ujian:', sessionErr);
      return {
        success: false,
        error: 'Sesi ujian tidak ditemukan.',
      };
    }

    // Ambil data kontak tutor dari tabel settings sesuai jenjang
    const { data: settingData } = await supabase
      .from('settings')
      .select('tutor_elementary_name, tutor_elementary_whatsapp, tutor_highschool_name, tutor_highschool_whatsapp')
      .eq('id', 1)
      .maybeSingle();

    const sessionEduLevel: EducationLevel =
      (session.education_level as EducationLevel) || 'elementary';

    const tutorContact =
      sessionEduLevel === 'high_school'
        ? {
            name: settingData?.tutor_highschool_name || 'Mr. David',
            whatsapp: settingData?.tutor_highschool_whatsapp || '6281234567891',
          }
        : {
            name: settingData?.tutor_elementary_name || 'Miss Sarah',
            whatsapp: settingData?.tutor_elementary_whatsapp || '6281234567890',
          };

    // Penanganan Idempotensi: Jika sesi sudah berstatus completed sebelumnya
    if (session.status === 'completed') {
      const assignedLevel = Array.isArray(session.levels) ? session.levels[0] : session.levels;
      const completedTime = session.completed_at || new Date().toISOString();
      const elapsedMinutes =
        session.duration_minutes ??
        Math.max(1, Math.round((new Date(completedTime).getTime() - new Date(session.start_time).getTime()) / 60000));

      return {
        success: true,
        result: {
          sessionId: session.id,
          studentName: session.student_name,
          whatsappNumber: session.whatsapp_number,
          educationLevel: sessionEduLevel,
          durationMinutes: elapsedMinutes,
          totalQuestions: session.total_questions,
          correctAnswers: session.correct_answers,
          finalScorePercent: Number(session.final_score_percent ?? 0),
          level: {
            id: assignedLevel?.id ?? 0,
            name: assignedLevel?.name ?? 'Level Selesai',
            description: assignedLevel?.description ?? null,
          },
          tutor: tutorContact,
          completedAt: completedTime,
        },
      };
    }

    // 2. Ambil seluruh jawaban siswa untuk sesi ini
    const { data: answersData, error: answersErr } = await supabase
      .from('student_answers')
      .select(`
        question_id,
        selected_option_id,
        question_options:selected_option_id (
          id,
          is_correct
        )
      `)
      .eq('session_id', sessionId);

    if (answersErr) {
      console.error('Error saat mengambil jawaban siswa:', answersErr);
      return {
        success: false,
        error: 'Gagal memuat jawaban ujian untuk dinilai.',
      };
    }

    // 3. Hitung jumlah jawaban benar
    let correctCount = 0;
    if (answersData) {
      for (const ans of answersData) {
        const option = Array.isArray(ans.question_options)
          ? ans.question_options[0]
          : ans.question_options;

        if (option && option.is_correct === true) {
          correctCount++;
        }
      }
    }

    const totalQuestions = session.total_questions > 0 ? session.total_questions : 10;
    const finalScorePercent = Number(((correctCount / totalQuestions) * 100).toFixed(2));

    // 4. Hitung durasi pengerjaan riil siswa (dalam satuan menit)
    const completedAt = new Date().toISOString();
    const startMs = new Date(session.start_time).getTime();
    const completedMs = new Date(completedAt).getTime();
    const durationMinutes = Math.max(1, Math.round((completedMs - startMs) / 60000));

    // 5. Ambil daftar konfigurasi level dan tentukan level penempatan (Matrix Evaluasi Skor + Waktu)
    const { data: levelsData, error: levelsErr } = await supabase
      .from('levels')
      .select('id, name, min_score_percent, max_score_percent, max_duration_minutes, description')
      .order('min_score_percent', { ascending: true });

    if (levelsErr || !levelsData || levelsData.length === 0) {
      console.error('Error saat mengambil data level:', levelsErr);
      return {
        success: false,
        error: 'Konfigurasi level belum diatur dalam sistem.',
      };
    }

    // Cari index level awal berdasarkan persentase skor
    let matchedIndex = levelsData.findIndex(
      (lvl) =>
        finalScorePercent >= lvl.min_score_percent &&
        finalScorePercent <= lvl.max_score_percent
    );

    if (matchedIndex === -1) {
      if (finalScorePercent >= 100) {
        matchedIndex = levelsData.length - 1;
      } else {
        matchedIndex = 0;
      }
    }

    // Terapkan evaluasi waktu: jika durasi melebihi batas waktu level, turunkan 1 level
    const initialLevel = levelsData[matchedIndex];
    let finalLevel = initialLevel;

    if (
      initialLevel.max_duration_minutes !== null &&
      initialLevel.max_duration_minutes !== undefined &&
      durationMinutes > initialLevel.max_duration_minutes
    ) {
      // Degradasi 1 level ke bawah (misal Advanced -> Intermediate, Intermediate -> Beginner)
      const demotedIndex = Math.max(0, matchedIndex - 1);
      finalLevel = levelsData[demotedIndex];
    }

    // 6. Update data sesi menjadi 'completed' dan simpan durasi riil
    const { error: updateErr } = await supabase
      .from('test_sessions')
      .update({
        status: 'completed',
        correct_answers: correctCount,
        final_score_percent: finalScorePercent,
        assigned_level_id: finalLevel.id,
        duration_minutes: durationMinutes,
        completed_at: completedAt,
      })
      .eq('id', sessionId);

    if (updateErr) {
      console.error('Error saat memperbarui status sesi completed:', updateErr);
      return {
        success: false,
        error: 'Gagal menyimpan hasil penilaian ujian.',
      };
    }

    return {
      success: true,
      result: {
        sessionId: session.id,
        studentName: session.student_name,
        whatsappNumber: session.whatsapp_number,
        educationLevel: sessionEduLevel,
        durationMinutes,
        totalQuestions,
        correctAnswers: correctCount,
        finalScorePercent,
        level: {
          id: finalLevel.id,
          name: finalLevel.name,
          description: finalLevel.description,
        },
        tutor: tutorContact,
        completedAt,
      },
    };
  } catch (error) {
    console.error('Unexpected error di submitExam:', error);
    return {
      success: false,
      error: 'Terjadi kesalahan sistem saat memproses pengumpulan ujian.',
    };
  }
}

/**
 * Server Action: getSessionResult
 * 
 * Digunakan oleh Halaman Hasil (/result) untuk memuat data penilaian sesi yang telah berstatus completed.
 */
export async function getSessionResult(sessionId: string): Promise<GetSessionResultResponse> {
  try {
    if (!sessionId) {
      return {
        success: false,
        error: 'ID sesi tidak valid.',
      };
    }

    const supabase = createClient();

    const { data: session, error: sessionErr } = await supabase
      .from('test_sessions')
      .select(`
        id,
        student_name,
        whatsapp_number,
        education_level,
        start_time,
        duration_minutes,
        status,
        total_questions,
        correct_answers,
        final_score_percent,
        completed_at,
        levels:assigned_level_id (
          id,
          name,
          description
        )
      `)
      .eq('id', sessionId)
      .maybeSingle();

    if (sessionErr || !session) {
      return {
        success: false,
        error: 'Sesi ujian tidak ditemukan.',
      };
    }

    if (session.status !== 'completed') {
      return {
        success: false,
        error: 'Sesi ujian ini belum diselesaikan.',
      };
    }

    const assignedLevel = Array.isArray(session.levels) ? session.levels[0] : session.levels;

    // Ambil data kontak tutor dari tabel settings
    const { data: settingData } = await supabase
      .from('settings')
      .select('tutor_elementary_name, tutor_elementary_whatsapp, tutor_highschool_name, tutor_highschool_whatsapp')
      .eq('id', 1)
      .maybeSingle();

    const sessionEduLevel: EducationLevel =
      (session.education_level as EducationLevel) || 'elementary';

    const tutorContact =
      sessionEduLevel === 'high_school'
        ? {
            name: settingData?.tutor_highschool_name || 'Mr. David',
            whatsapp: settingData?.tutor_highschool_whatsapp || '6281234567891',
          }
        : {
            name: settingData?.tutor_elementary_name || 'Miss Sarah',
            whatsapp: settingData?.tutor_elementary_whatsapp || '6281234567890',
          };

    const completedTime = session.completed_at || new Date().toISOString();
    const elapsedMinutes =
      session.duration_minutes ??
      Math.max(1, Math.round((new Date(completedTime).getTime() - new Date(session.start_time).getTime()) / 60000));

    return {
      success: true,
      result: {
        sessionId: session.id,
        studentName: session.student_name,
        whatsappNumber: session.whatsapp_number,
        educationLevel: sessionEduLevel,
        durationMinutes: elapsedMinutes,
        totalQuestions: session.total_questions,
        correctAnswers: session.correct_answers,
        finalScorePercent: Number(session.final_score_percent ?? 0),
        level: {
          id: assignedLevel?.id ?? 0,
          name: assignedLevel?.name ?? 'Level Selesai',
          description: assignedLevel?.description ?? null,
        },
        tutor: tutorContact,
        completedAt: completedTime,
      },
    };
  } catch (error) {
    console.error('Unexpected error di getSessionResult:', error);
    return {
      success: false,
      error: 'Terjadi kesalahan sistem saat mengambil hasil ujian.',
    };
  }
}


