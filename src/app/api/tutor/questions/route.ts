import { NextResponse } from 'next/server'
import { z } from 'zod'
import { createAdminClient } from '@/lib/supabase/admin'
import { verifyStaffAuth } from '@/lib/supabase/auth-guard'

export const dynamic = 'force-dynamic'

const tutorQuestionSchema = z.object({
  questionText: z.string().min(5, 'Teks pertanyaan minimal 5 karakter'),
  targetLevel: z.enum(['ELEMENTARY', 'HIGH_SCHOOL']),
  isActive: z.boolean().default(true),
  options: z
    .array(
      z.object({
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

export async function GET(request: Request) {
  try {
    const auth = await verifyStaffAuth(['ADMIN', 'TUTOR'])
    if (!auth.isAuthorized) {
      return auth.errorResponse
    }

    const { searchParams } = new URL(request.url)
    const level = searchParams.get('level') || 'ELEMENTARY'
    const search = searchParams.get('search') || ''

    const supabase = createAdminClient()

    let query = supabase
      .from('questions')
      .select(`
        id,
        question_text,
        target_level,
        is_active,
        created_at,
        question_options (
          id,
          option_text,
          is_correct,
          sort_order
        )
      `)
      .eq('target_level', level)
      .order('created_at', { ascending: false })

    if (search.trim()) {
      query = query.ilike('question_text', `%${search.trim()}%`)
    }

    const { data: questions, error } = await query

    if (error) {
      console.error('Error fetching tutor questions:', error)
      return NextResponse.json(
        { error: 'Gagal memuat bank soal pengajar' },
        { status: 500 }
      )
    }

    interface OptionItem {
      id: string
      option_text: string
      is_correct: boolean
      sort_order: number
    }

    const formattedQuestions = (questions || []).map((q) => {
      const options = (q.question_options as unknown as OptionItem[]) || []
      const sortedOptions = options.sort(
        (a, b) => a.sort_order - b.sort_order
      )

      return {
        id: q.id,
        questionText: q.question_text,
        targetLevel: q.target_level,
        isActive: q.is_active,
        createdAt: q.created_at,
        options: sortedOptions.map((opt) => ({
          id: opt.id,
          optionText: opt.option_text,
          isCorrect: opt.is_correct,
          sortOrder: opt.sort_order,
        })),
      }
    })

    return NextResponse.json({
      questions: formattedQuestions,
    })
  } catch (err) {
    console.error('Unexpected error in tutor questions GET:', err)
    return NextResponse.json(
      { error: 'Terjadi kesalahan internal server' },
      { status: 500 }
    )
  }
}

export async function POST(request: Request) {
  try {
    const auth = await verifyStaffAuth(['ADMIN', 'TUTOR'])
    if (!auth.isAuthorized) {
      return auth.errorResponse
    }

    const body = await request.json()
    const parsed = tutorQuestionSchema.safeParse(body)

    if (!parsed.success) {
      return NextResponse.json(
        { error: parsed.error.issues[0]?.message || 'Input soal tidak valid' },
        { status: 400 }
      )
    }

    const { questionText, targetLevel, isActive, options } = parsed.data
    const supabase = createAdminClient()

    const { data: newQuestion, error: qError } = await supabase
      .from('questions')
      .insert({
        question_text: questionText.trim(),
        target_level: targetLevel,
        is_active: isActive,
      })
      .select('*')
      .single()

    if (qError || !newQuestion) {
      console.error('Error creating question by tutor:', qError)
      return NextResponse.json(
        { error: 'Gagal menambahkan butir soal' },
        { status: 500 }
      )
    }

    const optionInserts = options.map((opt, index) => ({
      question_id: newQuestion.id,
      option_text: opt.optionText.trim(),
      is_correct: opt.isCorrect,
      sort_order: index + 1,
    }))

    const { data: insertedOptions, error: optError } = await supabase
      .from('question_options')
      .insert(optionInserts)
      .select('*')

    if (optError) {
      console.error('Error inserting question options by tutor:', optError)
      await supabase.from('questions').delete().eq('id', newQuestion.id)
      return NextResponse.json(
        { error: 'Gagal menambahkan opsi jawaban' },
        { status: 500 }
      )
    }

    return NextResponse.json({
      success: true,
      question: {
        id: newQuestion.id,
        questionText: newQuestion.question_text,
        targetLevel: newQuestion.target_level,
        isActive: newQuestion.is_active,
        createdAt: newQuestion.created_at,
        options: (insertedOptions || []).map((o) => ({
          id: o.id,
          optionText: o.option_text,
          isCorrect: o.is_correct,
          sortOrder: o.sort_order,
        })),
      },
    })
  } catch (err) {
    console.error('Unexpected error in tutor questions POST:', err)
    return NextResponse.json(
      { error: 'Terjadi kesalahan internal server' },
      { status: 500 }
    )
  }
}
