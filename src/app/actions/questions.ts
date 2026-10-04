'use server';

import { createClient } from '@/lib/supabase/server';
import { EducationLevel } from '@/types';

export interface AdminQuestionOption {
  id: string;
  questionId: string;
  optionText: string;
  isCorrect: boolean;
  orderIndex: number;
}

export interface AdminQuestion {
  id: string;
  questionText: string;
  educationLevel: EducationLevel;
  isActive: boolean;
  createdAt: string;
  options: AdminQuestionOption[];
}

export type GetQuestionsResult =
  | {
      success: true;
      questions: AdminQuestion[];
    }
  | {
      success: false;
      error: string;
    };

export type SoftDeleteQuestionResult =
  | {
      success: true;
      message: string;
    }
  | {
      success: false;
      error: string;
    };

/**
 * Server Action: getQuestionsForAdmin
 * Mengambil seluruh butir soal aktif beserta seluruh opsi dan status kunci jawaban (is_correct).
 * Terproteksi khusus untuk admin yang telah login.
 */
export async function getQuestionsForAdmin(): Promise<GetQuestionsResult> {
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
      };
    }

    // 2. Ambil seluruh butir pertanyaan aktif dengan relasi opsi
    const { data: questionsData, error: qErr } = await supabase
      .from('questions')
      .select(`
        id,
        question_text,
        education_level,
        is_active,
        created_at,
        question_options (
          id,
          question_id,
          option_text,
          is_correct,
          order_index
        )
      `)
      .eq('is_active', true)
      .order('created_at', { ascending: true });

    if (qErr) {
      console.error('Error saat mengambil daftar soal admin:', qErr);
      return {
        success: false,
        error: 'Gagal memuat daftar bank soal.',
      };
    }

    // 3. Format dan urutkan opsi per butir soal
    const questions: AdminQuestion[] = (questionsData || []).map((q) => {
      const rawOptions = (q.question_options as Array<{
        id: string;
        question_id: string;
        option_text: string;
        is_correct: boolean;
        order_index: number;
      }>) || [];

      // Urutkan opsi berdasarkan order_index
      const sortedOptions: AdminQuestionOption[] = [...rawOptions]
        .sort((a, b) => a.order_index - b.order_index)
        .map((opt) => ({
          id: opt.id,
          questionId: opt.question_id,
          optionText: opt.option_text,
          isCorrect: Boolean(opt.is_correct),
          orderIndex: opt.order_index,
        }));

      return {
        id: q.id,
        questionText: q.question_text,
        educationLevel: (q.education_level as EducationLevel) || 'elementary',
        isActive: Boolean(q.is_active),
        createdAt: q.created_at,
        options: sortedOptions,
      };
    });

    return {
      success: true,
      questions,
    };
  } catch (err) {
    console.error('Unexpected error di getQuestionsForAdmin:', err);
    return {
      success: false,
      error: 'Terjadi kesalahan sistem saat mengambil data soal.',
    };
  }
}

/**
 * Server Action: softDeleteQuestion
 * Melakukan soft delete pada butir soal (is_active = false)
 * Menjamin integritas data: riwayat jawaban siswa terdahulu tidak akan rusak/hilang.
 */
export async function softDeleteQuestion(
  questionId: string
): Promise<SoftDeleteQuestionResult> {
  try {
    if (!questionId) {
      return {
        success: false,
        error: 'ID butir soal tidak valid.',
      };
    }

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

    // 2. Lakukan soft delete (update is_active = false)
    const { error: updateErr } = await supabase
      .from('questions')
      .update({ is_active: false })
      .eq('id', questionId);

    if (updateErr) {
      console.error('Error saat soft delete soal:', updateErr);
      return {
        success: false,
        error: 'Gagal menonaktifkan butir soal.',
      };
    }

    return {
      success: true,
      message: 'Butir soal berhasil dinonaktifkan dari lembar ujian.',
    };
  } catch (err) {
    console.error('Unexpected error di softDeleteQuestion:', err);
    return {
      success: false,
      error: 'Terjadi kesalahan sistem saat menghapus soal.',
    };
  }
}

export interface SaveQuestionOptionInput {
  id?: string;
  optionText: string;
  isCorrect: boolean;
}

export interface SaveQuestionPayload {
  id?: string; // Jika ada = mode edit, jika null/undefined = mode tambah baru
  questionText: string;
  educationLevel: EducationLevel;
  options: SaveQuestionOptionInput[];
}

export type SaveQuestionResult =
  | {
      success: true;
      message: string;
      questionId: string;
    }
  | {
      success: false;
      error: string;
    };

/**
 * Server Action: saveQuestion
 * Menyimpan butir soal baru atau memperbarui butir soal yang sudah ada beserta deret opsi dinamisnya.
 */
export async function saveQuestion(
  payload: SaveQuestionPayload
): Promise<SaveQuestionResult> {
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

    // 2. Validasi input ketat
    if (
      !payload.educationLevel ||
      !['elementary', 'high_school'].includes(payload.educationLevel)
    ) {
      return {
        success: false,
        error: 'Jenjang pendidikan wajib dipilih (Elementary atau High School).',
      };
    }

    const trimmedQuestion = payload.questionText?.trim() || '';
    if (trimmedQuestion.length < 5) {
      return {
        success: false,
        error: 'Teks pertanyaan harus diisi (minimal 5 karakter).',
      };
    }

    if (!payload.options || payload.options.length < 2) {
      return {
        success: false,
        error: 'Soal harus memiliki minimal 2 pilihan jawaban.',
      };
    }

    const hasEmptyOption = payload.options.some(
      (opt) => !opt.optionText || opt.optionText.trim().length === 0
    );
    if (hasEmptyOption) {
      return {
        success: false,
        error: 'Semua pilihan opsi jawaban harus diisi teksnya.',
      };
    }

    const correctCount = payload.options.filter((opt) => opt.isCorrect).length;
    if (correctCount !== 1) {
      return {
        success: false,
        error: 'Wajib memilih tepat 1 opsi jawaban sebagai kunci jawaban yang benar.',
      };
    }

    // --------------------------------------------------------------------------
    // CASE A: MODE EDIT (Jika id terdefinisi)
    // --------------------------------------------------------------------------
    if (payload.id) {
      // 1. Perbarui teks pertanyaan & jenjang pendidikan
      const { error: updateQErr } = await supabase
        .from('questions')
        .update({
          question_text: trimmedQuestion,
          education_level: payload.educationLevel,
          updated_at: new Date().toISOString(),
        })
        .eq('id', payload.id);

      if (updateQErr) {
        console.error('Error saat update soal:', updateQErr);
        return {
          success: false,
          error: 'Gagal memperbarui teks pertanyaan.',
        };
      }

      // 2. Ambil opsi yang saat ini ada di DB
      const { data: existingOpts, error: fetchOptErr } = await supabase
        .from('question_options')
        .select('id')
        .eq('question_id', payload.id);

      if (fetchOptErr) {
        console.error('Error fetch opsi eksisting:', fetchOptErr);
        return {
          success: false,
          error: 'Gagal memeriksa opsi jawaban di database.',
        };
      }

      const existingIds = (existingOpts || []).map((o) => o.id);
      const submittedIds = payload.options
        .filter((o) => o.id)
        .map((o) => o.id as string);

      // Hapus opsi yang dibuang oleh admin
      const idsToDelete = existingIds.filter((id) => !submittedIds.includes(id));
      if (idsToDelete.length > 0) {
        await supabase
          .from('question_options')
          .delete()
          .in('id', idsToDelete);
      }

      // Update opsi lama atau Insert opsi baru
      for (let idx = 0; idx < payload.options.length; idx++) {
        const opt = payload.options[idx];
        if (opt.id && existingIds.includes(opt.id)) {
          // Update opsi lama
          await supabase
            .from('question_options')
            .update({
              option_text: opt.optionText.trim(),
              is_correct: opt.isCorrect,
              order_index: idx,
            })
            .eq('id', opt.id);
        } else {
          // Tambah opsi baru
          await supabase.from('question_options').insert({
            question_id: payload.id,
            option_text: opt.optionText.trim(),
            is_correct: opt.isCorrect,
            order_index: idx,
          });
        }
      }

      return {
        success: true,
        message: 'Perubahan butir soal berhasil disimpan!',
        questionId: payload.id,
      };
    }

    // --------------------------------------------------------------------------
    // CASE B: MODE TAMBAH BARU (Jika id kosong)
    // --------------------------------------------------------------------------
    const { data: newQuestion, error: insertQErr } = await supabase
      .from('questions')
      .insert({
        question_text: trimmedQuestion,
        education_level: payload.educationLevel,
        is_active: true,
      })
      .select('id')
      .single();

    if (insertQErr || !newQuestion) {
      console.error('Error saat membuat soal baru:', insertQErr);
      return {
        success: false,
        error: 'Gagal menambahkan butir soal baru.',
      };
    }

    // Masukkan seluruh opsi jawaban
    const optionsToInsert = payload.options.map((opt, idx) => ({
      question_id: newQuestion.id,
      option_text: opt.optionText.trim(),
      is_correct: opt.isCorrect,
      order_index: idx,
    }));

    const { error: insertOptErr } = await supabase
      .from('question_options')
      .insert(optionsToInsert);

    if (insertOptErr) {
      console.error('Error saat insert opsi baru:', insertOptErr);
      return {
        success: false,
        error: 'Soal dibuat, tetapi gagal menyimpan daftar opsi jawaban.',
      };
    }

    return {
      success: true,
      message: 'Butir soal baru berhasil ditambahkan ke bank soal!',
      questionId: newQuestion.id,
    };
  } catch (err) {
    console.error('Unexpected error di saveQuestion:', err);
    return {
      success: false,
      error: 'Terjadi kesalahan sistem saat menyimpan butir soal.',
    };
  }
}

