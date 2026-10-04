'use server';

import { createClient } from '@/lib/supabase/server';

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
