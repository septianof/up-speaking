import { NextResponse } from 'next/server'
import { z } from 'zod'
import { createAdminClient } from '@/lib/supabase/admin'
import { createClient } from '@/lib/supabase/server'
import { uuidSchema } from '@/lib/validators'
import { normalizeSingleRelation } from '@/lib/utils'

export const dynamic = 'force-dynamic'
export const fetchCache = 'force-no-store'
export const revalidate = 0

const finalizeEvaluationSchema = z.object({
  assignedLevel: z.enum(['BEGINNER', 'INTERMEDIATE', 'ADVANCED']),
  tutorId: uuidSchema('ID tutor tidak valid').optional(),
  tutorNotes: z.string().optional().nullable(),
})

export async function GET(
  request: Request,
  { params }: { params: { sessionId: string } }
) {
  try {
    const sessionId = params.sessionId
    if (!sessionId) {
      return NextResponse.json(
        { error: 'ID sesi tidak valid' },
        { status: 400 }
      )
    }

    const supabase = createAdminClient()

    // 1. Ambil data sesi, profil siswa, dan hasil evaluasi (jika sudah ada)
    const { data: session, error: sessionError } = await supabase
      .from('test_sessions')
      .select(`
        id,
        student_id,
        started_at,
        submitted_at,
        elapsed_seconds,
        score_percentage,
        status,
        students (
          id,
          full_name,
          phone_number,
          target_level
        ),
        placement_evaluations (
          id,
          tutor_id,
          assigned_level,
          tutor_notes,
          finalized_at,
          profiles (
            full_name
          )
        )
      `)
      .eq('id', sessionId)
      .single()

    if (sessionError || !session) {
      return NextResponse.json(
        { error: 'Sesi tes tidak ditemukan' },
        { status: 404 }
      )
    }

    // 2. Ambil lembar respon jawaban siswa secara urut
    const { data: responses, error: responsesError } = await supabase
      .from('test_responses')
      .select(`
        display_order,
        question_id,
        selected_option_id,
        questions (
          id,
          question_text,
          target_level,
          question_options (
            id,
            option_text,
            is_correct,
            sort_order
          )
        )
      `)
      .eq('session_id', sessionId)
      .order('display_order', { ascending: true })

    if (responsesError) {
      console.error('Error fetching responses for evaluation:', responsesError)
      return NextResponse.json(
        { error: 'Gagal memuat lembar jawaban siswa' },
        { status: 500 }
      )
    }

    interface EvalOptionDetail {
      id: string
      option_text: string
      is_correct: boolean
      sort_order: number
    }

    interface EvalQuestionDetail {
      id: string
      question_text: string
      target_level: string
      question_options?: EvalOptionDetail[]
    }

    interface StudentProfileData {
      id: string
      full_name: string
      phone_number: string
      target_level: string
    }

    interface PlacementEvalData {
      id: string
      tutor_id: string
      assigned_level: string
      tutor_notes: string | null
      finalized_at: string
      profiles?: {
        full_name: string
      }
    }

    // 3. Format rincian jawaban siswa vs kunci jawaban
    const studentAnswers = (responses || []).map((resp) => {
      const q = resp.questions as unknown as EvalQuestionDetail
      const options = (q?.question_options || []).sort(
        (a, b) => a.sort_order - b.sort_order
      )

      const selectedOption = options.find(
        (opt) => opt.id === resp.selected_option_id
      )
      const correctOption = options.find((opt) => opt.is_correct === true)

      const isCorrect =
        !!resp.selected_option_id &&
        resp.selected_option_id === correctOption?.id

      return {
        displayOrder: resp.display_order,
        questionId: q?.id,
        questionText: q?.question_text,
        selectedOptionId: resp.selected_option_id,
        selectedOptionText: selectedOption?.option_text || 'Tidak dijawab',
        correctOptionId: correctOption?.id,
        correctOptionText: correctOption?.option_text || '',
        isCorrect,
        options: options.map((opt) => ({
          id: opt.id,
          optionText: opt.option_text,
          isCorrect: opt.is_correct,
        })),
      }
    })

    const studentData = normalizeSingleRelation(
      session.students as unknown as StudentProfileData | StudentProfileData[]
    )
    const evaluationData = normalizeSingleRelation(
      session.placement_evaluations as unknown as
        | PlacementEvalData
        | PlacementEvalData[]
    )
    const tutorProfile = normalizeSingleRelation(
      evaluationData?.profiles as unknown as
        | { full_name: string }
        | { full_name: string }[]
    )

    return NextResponse.json({
      session: {
        id: session.id,
        status: session.status,
        scorePercentage: session.score_percentage,
        elapsedSeconds: session.elapsed_seconds,
        startedAt: session.started_at,
        submittedAt: session.submitted_at,
      },
      student: {
        id: studentData?.id,
        fullName: studentData?.full_name,
        phoneNumber: studentData?.phone_number,
        targetLevel: studentData?.target_level,
      },
      evaluation: evaluationData
        ? {
            id: evaluationData.id,
            assignedLevel: evaluationData.assigned_level,
            tutorNotes: evaluationData.tutor_notes,
            tutorName: tutorProfile?.full_name || null,
            finalizedAt: evaluationData.finalized_at,
          }
        : null,
      answers: studentAnswers,
    })
  } catch (err) {
    console.error('Unexpected error in tutor evaluation detail GET:', err)
    return NextResponse.json(
      { error: 'Terjadi kesalahan internal server' },
      { status: 500 }
    )
  }
}

export async function POST(
  request: Request,
  { params }: { params: { sessionId: string } }
) {
  try {
    const sessionId = params.sessionId
    const body = await request.json()
    const parsed = finalizeEvaluationSchema.safeParse(body)

    if (!parsed.success) {
      return NextResponse.json(
        { error: parsed.error.issues[0]?.message || 'Input penetapan level tidak valid' },
        { status: 400 }
      )
    }

    const { assignedLevel, tutorNotes } = parsed.data
    let tutorId = parsed.data.tutorId

    const supabase = createAdminClient()

    // Jika tutorId tidak dikirim dari body, coba baca dari session cookie
    if (!tutorId) {
      const serverClient = createClient()
      const {
        data: { user },
      } = await serverClient.auth.getUser()

      if (user) {
        tutorId = user.id
      } else {
        // Fallback default tutor jika testing
        const { data: defaultTutor } = await supabase
          .from('profiles')
          .select('id')
          .in('role', ['TUTOR_ELEMENTARY', 'TUTOR_HIGH_SCHOOL'])
          .limit(1)
          .single()
        tutorId = defaultTutor?.id
      }
    }

    if (!tutorId) {
      return NextResponse.json(
        { error: 'Identitas tutor penilai tidak terdeteksi' },
        { status: 401 }
      )
    }

    // 1. Upsert ke tabel placement_evaluations
    const { data: evaluation, error: evalError } = await supabase
      .from('placement_evaluations')
      .upsert(
        {
          session_id: sessionId,
          tutor_id: tutorId,
          assigned_level: assignedLevel,
          tutor_notes: tutorNotes || null,
          finalized_at: new Date().toISOString(),
        },
        { onConflict: 'session_id' }
      )
      .select('*')
      .single()

    if (evalError || !evaluation) {
      console.error('Error saving placement evaluation:', evalError)
      return NextResponse.json(
        { error: 'Gagal menyimpan keputusan level siswa' },
        { status: 500 }
      )
    }

    // 2. Perbarui status sesi tes menjadi 'FINALIZED'
    const { error: sessionUpdateError } = await supabase
      .from('test_sessions')
      .update({ status: 'FINALIZED' })
      .eq('id', sessionId)

    if (sessionUpdateError) {
      console.error('Error finalizing session status:', sessionUpdateError)
      return NextResponse.json(
        { error: 'Gagal memperbarui status sesi ujian' },
        { status: 500 }
      )
    }

    return NextResponse.json({
      success: true,
      message: 'Level resmi siswa berhasil ditetapkan',
      evaluation: {
        id: evaluation.id,
        sessionId: evaluation.session_id,
        assignedLevel: evaluation.assigned_level,
        finalizedAt: evaluation.finalized_at,
      },
    })
  } catch (err) {
    console.error('Unexpected error in tutor evaluation POST:', err)
    return NextResponse.json(
      { error: 'Terjadi kesalahan internal server' },
      { status: 500 }
    )
  }
}
