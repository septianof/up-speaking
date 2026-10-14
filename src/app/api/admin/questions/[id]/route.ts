import { NextResponse } from 'next/server'
import { z } from 'zod'
import { createAdminClient } from '@/lib/supabase/admin'

const updateQuestionSchema = z.object({
  questionText: z.string().min(5, 'Teks pertanyaan minimal 5 karakter'),
  targetLevel: z.enum(['ELEMENTARY', 'HIGH_SCHOOL']),
  isActive: z.boolean().default(true),
  options: z
    .array(
      z.object({
        id: z.string().uuid().optional(),
        optionText: z.string().min(1, 'Teks opsi tidak boleh kosong'),
        isCorrect: z.boolean(),
      })
    )
    .min(2, 'Minimal 2 pilihan opsi jawaban')
    .max(5, 'Maksimal 5 pilihan opsi jawaban')
    .refine(
      (opts) => opts.filter((o) => o.isCorrect).length === 1,
      'Harus ada tepat satu opsi yang ditandai sebagai kunci jawaban benar'
    ),
})

export async function PUT(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const questionId = params.id
    const body = await request.json()
    const parsed = updateQuestionSchema.safeParse(body)

    if (!parsed.success) {
      return NextResponse.json(
        { error: parsed.error.issues[0]?.message || 'Input perubahan soal tidak valid' },
        { status: 400 }
      )
    }

    const { questionText, targetLevel, isActive, options } = parsed.data
    const supabase = createAdminClient()

    // 1. Perbarui tabel questions
    const { error: updateError } = await supabase
      .from('questions')
      .update({
        question_text: questionText.trim(),
        target_level: targetLevel,
        is_active: isActive,
      })
      .eq('id', questionId)

    if (updateError) {
      console.error('Error updating question:', updateError)
      return NextResponse.json(
        { error: 'Gagal memperbarui butir soal' },
        { status: 500 }
      )
    }

    // 2. Gantikan opsi lama dengan opsi baru secara terstruktur
    await supabase
      .from('question_options')
      .delete()
      .eq('question_id', questionId)

    const optionInserts = options.map((opt, index) => ({
      question_id: questionId,
      option_text: opt.optionText.trim(),
      is_correct: opt.isCorrect,
      sort_order: index + 1,
    }))

    const { data: insertedOptions, error: optError } = await supabase
      .from('question_options')
      .insert(optionInserts)
      .select('*')

    if (optError) {
      console.error('Error re-inserting question options:', optError)
      return NextResponse.json(
        { error: 'Gagal memperbarui opsi jawaban' },
        { status: 500 }
      )
    }

    return NextResponse.json({
      success: true,
      question: {
        id: questionId,
        questionText,
        targetLevel,
        isActive,
        options: (insertedOptions || []).map((o) => ({
          id: o.id,
          optionText: o.option_text,
          isCorrect: o.is_correct,
          sortOrder: o.sort_order,
        })),
      },
    })
  } catch (err) {
    console.error('Unexpected error in question PUT:', err)
    return NextResponse.json(
      { error: 'Terjadi kesalahan internal server' },
      { status: 500 }
    )
  }
}

export async function DELETE(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const questionId = params.id
    const supabase = createAdminClient()

    const { error } = await supabase
      .from('questions')
      .delete()
      .eq('id', questionId)

    if (error) {
      console.error('Error deleting question:', error)
      return NextResponse.json(
        { error: 'Gagal menghapus soal dari database' },
        { status: 500 }
      )
    }

    return NextResponse.json({
      success: true,
      message: 'Soal berhasil dihapus',
    })
  } catch (err) {
    console.error('Unexpected error in question DELETE:', err)
    return NextResponse.json(
      { error: 'Terjadi kesalahan internal server' },
      { status: 500 }
    )
  }
}
