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
 * Server Action: startSession
 * 
 * Tanggung Jawab:
 * 1. Validasi nama siswa & normalisasi nomor WhatsApp ke format internasional 628xxx.
 * 2. Cek apakah ada sesi berjalan (in_progress & end_time > now) untuk Crash Recovery.
 * 3. Cek pencegahan fraud 24 jam (siswa tidak boleh tes ulang dalam 24 jam kecuali can_retest = true).
 * 4. Buat sesi ujian baru di test_sessions dengan batas waktu server-side.
 * 5. Kembalikan daftar soal aktif & opsi jawaban teracak TANPA kolom is_correct.
 */
export async function startSession(
  rawName: string,
  rawWhatsApp: string
): Promise<StartSessionResult> {
  try {
    // --------------------------------------------------------------------------
    // 1. VALIDASI NAMA & NORMALISASI WHATSAPP
    // --------------------------------------------------------------------------
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
        error:
          'Nomor WhatsApp tidak valid. Masukkan nomor ponsel aktif dengan format yang benar (contoh: 081234567890).',
        code: 'INVALID_INPUT',
      };
    }

    const supabase = createClient();
    const nowIso = new Date().toISOString();

    // --------------------------------------------------------------------------
    // 2. CEK SESI BERJALAN (CRASH RECOVERY)
    // --------------------------------------------------------------------------
    const { data: activeSessions, error: activeErr } = await supabase
      .from('test_sessions')
      .select('*')
      .eq('whatsapp_number', normalizedWA)
      .eq('status', 'in_progress')
      .gt('end_time', nowIso)
      .order('created_at', { ascending: false })
      .limit(1);

    if (activeErr) {
      console.error('Error saat memeriksa sesi aktif:', activeErr);
      return {
        success: false,
        error: 'Terjadi gangguan saat memeriksa sesi ujian. Silakan coba kembali.',
        code: 'SERVER_ERROR',
      };
    }

    // Jika siswa masih memiliki sesi yang sedang berjalan dan belum habis waktu
    if (activeSessions && activeSessions.length > 0) {
      const activeSession = activeSessions[0];

      // Ambil jawaban yang sebelumnya sudah disimpan (auto-saved)
      const { data: answersData } = await supabase
        .from('student_answers')
        .select('question_id, selected_option_id')
        .eq('session_id', activeSession.id);

      const savedAnswers: Record<string, string> = {};
      answersData?.forEach((ans) => {
        if (ans.selected_option_id) {
          savedAnswers[ans.question_id] = ans.selected_option_id;
        }
      });

      // Ambil seluruh butir pertanyaan aktif tanpa menyertakan kolom is_correct
      const { data: questionsData, error: qErr } = await supabase
        .from('questions')
        .select(`
          id,
          question_text,
          question_options (
            id,
            question_id,
            option_text,
            order_index
          )
        `)
        .eq('is_active', true);

      if (qErr || !questionsData) {
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

        // Urutkan opsi sesuai order_index yang ada
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
          options: sortedOptions,
        };
      });

      return {
        success: true,
        isResumed: true,
        session: {
          id: activeSession.id,
          student_name: activeSession.student_name,
          whatsapp_number: activeSession.whatsapp_number,
          start_time: activeSession.start_time,
          end_time: activeSession.end_time,
          total_questions: activeSession.total_questions,
        },
        questions: resumedQuestions,
        savedAnswers,
      };
    }

    // --------------------------------------------------------------------------
    // 3. CEK FRAUD 24 JAM
    // --------------------------------------------------------------------------
    const twentyFourHoursAgo = new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString();

    const { data: recentSessions, error: recentErr } = await supabase
      .from('test_sessions')
      .select('id, status, can_retest, created_at, completed_at')
      .eq('whatsapp_number', normalizedWA)
      .in('status', ['completed', 'expired'])
      .gte('created_at', twentyFourHoursAgo)
      .order('created_at', { ascending: false })
      .limit(1);

    if (recentErr) {
      console.error('Error saat memeriksa riwayat sesi 24 jam:', recentErr);
      return {
        success: false,
        error: 'Terjadi gangguan saat memverifikasi data peserta.',
        code: 'SERVER_ERROR',
      };
    }

    // Jika sudah pernah tes dalam 24 jam terakhir dan belum mendapat izin tes ulang
    if (recentSessions && recentSessions.length > 0) {
      const latestSession = recentSessions[0];
      if (!latestSession.can_retest) {
        return {
          success: false,
          error:
            'Nomor WhatsApp ini telah menyelesaikan tes penempatan dalam kurun 24 jam terakhir. Anda hanya dapat mengikuti tes 1 kali per hari. Silakan hubungi admin Up Speaking jika Anda membutuhkan izin tes ulang.',
          code: 'SESSION_BLOCKED',
        };
      }
    }

    // --------------------------------------------------------------------------
    // 4. AMBIL PENGATURAN DURASI & BANK SOAL
    // --------------------------------------------------------------------------
    const { data: settingData } = await supabase
      .from('settings')
      .select('test_duration_minutes')
      .eq('id', 1)
      .maybeSingle();

    const durationMinutes = settingData?.test_duration_minutes ?? 45;

    // Ambil butir soal aktif dan pilihan opsi (TIDAK menyertakan is_correct)
    const { data: questionsData, error: qErr } = await supabase
      .from('questions')
      .select(`
        id,
        question_text,
        question_options (
          id,
          question_id,
          option_text,
          order_index
        )
      `)
      .eq('is_active', true);

    if (qErr || !questionsData || questionsData.length === 0) {
      console.error('Error atau soal kosong:', qErr);
      return {
        success: false,
        error: 'Belum ada butir soal ujian yang aktif di sistem. Silakan hubungi admin.',
        code: 'SERVER_ERROR',
      };
    }

    // --------------------------------------------------------------------------
    // 5. BUAT SESI BARU DI TEST_SESSIONS
    // --------------------------------------------------------------------------
    const startTime = new Date();
    const endTime = new Date(startTime.getTime() + durationMinutes * 60 * 1000);

    const { data: createdSession, error: createSessionErr } = await supabase
      .from('test_sessions')
      .insert({
        student_name: studentName,
        whatsapp_number: normalizedWA,
        start_time: startTime.toISOString(),
        end_time: endTime.toISOString(),
        status: 'in_progress',
        total_questions: questionsData.length,
        correct_answers: 0,
        can_retest: false,
      })
      .select()
      .single();

    if (createSessionErr || !createdSession) {
      console.error('Error saat membuat sesi baru:', createSessionErr);
      return {
        success: false,
        error: 'Gagal memulai sesi ujian baru. Silakan coba sesaat lagi.',
        code: 'SERVER_ERROR',
      };
    }

    // Konsumsi izin tes ulang jika sebelumnya siswa diberikan akses retest
    if (recentSessions && recentSessions.length > 0 && recentSessions[0].can_retest) {
      await supabase
        .from('test_sessions')
        .update({ can_retest: false })
        .eq('id', recentSessions[0].id);
    }

    // --------------------------------------------------------------------------
    // 6. ACAK URUTAN SOAL & PILIHAN OPSI (FISHER-YATES SHUFFLE)
    // --------------------------------------------------------------------------
    const sanitizedQuestions: SanitizedQuestion[] = shuffle(questionsData).map((q) => {
      const rawOptions = (q.question_options as Array<{
        id: string;
        question_id: string;
        option_text: string;
        order_index: number;
      }>) || [];

      // Acak urutan opsi jawaban untuk setiap butir soal
      const shuffledOptions: SanitizedOption[] = shuffle(rawOptions).map((opt) => ({
        id: opt.id,
        question_id: opt.question_id,
        option_text: opt.option_text,
      }));

      return {
        id: q.id,
        question_text: q.question_text,
        options: shuffledOptions,
      };
    });

    return {
      success: true,
      isResumed: false,
      session: {
        id: createdSession.id,
        student_name: createdSession.student_name,
        whatsapp_number: createdSession.whatsapp_number,
        start_time: createdSession.start_time,
        end_time: createdSession.end_time,
        total_questions: createdSession.total_questions,
      },
      questions: sanitizedQuestions,
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
 * 2. Penanganan idempotensi: jika sesi sudah 'completed', langsung kembalikan hasil sebelumnya.
 * 3. Ambil seluruh jawaban siswa pada sesi dan cocokkan dengan kunci jawaban di question_options.
 * 4. Hitung jumlah benar dan persentase skor akhir (0.00% - 100.00%).
 * 5. Tentukan level penempatan berdasarkan rentang level di tabel levels.
 * 6. Update status sesi menjadi 'completed', catat correct_answers, final_score_percent, assigned_level_id, dan completed_at.
 * 7. Kembalikan detail pencapaian untuk halaman hasil siswa.
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

    // Penanganan Idempotensi: Jika sesi sudah berstatus completed sebelumnya
    if (session.status === 'completed') {
      const assignedLevel = Array.isArray(session.levels) ? session.levels[0] : session.levels;
      return {
        success: true,
        result: {
          sessionId: session.id,
          studentName: session.student_name,
          whatsappNumber: session.whatsapp_number,
          totalQuestions: session.total_questions,
          correctAnswers: session.correct_answers,
          finalScorePercent: Number(session.final_score_percent ?? 0),
          level: {
            id: assignedLevel?.id ?? 0,
            name: assignedLevel?.name ?? 'Level Selesai',
            description: assignedLevel?.description ?? null,
          },
          completedAt: session.completed_at || new Date().toISOString(),
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

    // 4. Ambil daftar konfigurasi level dan tentukan level penempatan
    const { data: levelsData, error: levelsErr } = await supabase
      .from('levels')
      .select('id, name, min_score_percent, max_score_percent, description')
      .order('min_score_percent', { ascending: true });

    if (levelsErr || !levelsData || levelsData.length === 0) {
      console.error('Error saat mengambil data level:', levelsErr);
      return {
        success: false,
        error: 'Konfigurasi level belum diatur dalam sistem.',
      };
    }

    // Cocokkan persentase nilai dengan rentang level yang sesuai
    let matchedLevel = levelsData.find(
      (lvl) =>
        finalScorePercent >= lvl.min_score_percent &&
        finalScorePercent <= lvl.max_score_percent
    );

    // Fallback jika tidak pas (misal karena batas pembulatan)
    if (!matchedLevel) {
      if (finalScorePercent >= 100) {
        matchedLevel = levelsData[levelsData.length - 1];
      } else {
        matchedLevel = levelsData[0];
      }
    }

    const completedAt = new Date().toISOString();

    // 5. Update data sesi menjadi 'completed'
    const { error: updateErr } = await supabase
      .from('test_sessions')
      .update({
        status: 'completed',
        correct_answers: correctCount,
        final_score_percent: finalScorePercent,
        assigned_level_id: matchedLevel.id,
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
        totalQuestions,
        correctAnswers: correctCount,
        finalScorePercent,
        level: {
          id: matchedLevel.id,
          name: matchedLevel.name,
          description: matchedLevel.description,
        },
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

    return {
      success: true,
      result: {
        sessionId: session.id,
        studentName: session.student_name,
        whatsappNumber: session.whatsapp_number,
        totalQuestions: session.total_questions,
        correctAnswers: session.correct_answers,
        finalScorePercent: Number(session.final_score_percent ?? 0),
        level: {
          id: assignedLevel?.id ?? 0,
          name: assignedLevel?.name ?? 'Level Selesai',
          description: assignedLevel?.description ?? null,
        },
        completedAt: session.completed_at || new Date().toISOString(),
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


