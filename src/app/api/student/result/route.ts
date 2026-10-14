import { NextResponse } from 'next/server'
import { createAdminClient } from '@/lib/supabase/admin'

export const dynamic = 'force-dynamic'

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const studentId = searchParams.get('studentId')
    const sessionId = searchParams.get('sessionId')

    if (!studentId && !sessionId) {
      return NextResponse.json(
        { error: 'Parameter studentId atau sessionId wajib disertakan' },
        { status: 400 }
      )
    }

    const supabase = createAdminClient()

    let query = supabase
      .from('test_sessions')
      .select(`
        id,
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
          assigned_level,
          tutor_notes,
          finalized_at
        )
      `)

    if (sessionId) {
      query = query.eq('id', sessionId)
    } else if (studentId) {
      query = query
        .eq('student_id', studentId)
        .neq('status', 'RESET')
        .order('created_at', { ascending: false })
        .limit(1)
    }

    const { data: session, error: sessionError } = await query.maybeSingle()

    if (sessionError) {
      console.error('Error fetching test result:', sessionError)
      return NextResponse.json(
        { error: 'Gagal mengambil hasil tes' },
        { status: 500 }
      )
    }

    if (!session) {
      return NextResponse.json(
        { error: 'Data hasil tes tidak ditemukan' },
        { status: 404 }
      )
    }

    interface StudentItem {
      id: string
      full_name: string
      phone_number: string
      target_level: string
    }

    interface EvalResultItem {
      id: string
      assigned_level: string
      tutor_notes: string | null
      finalized_at: string
    }

    const studentData = session.students as unknown as StudentItem
    const evaluations = session.placement_evaluations as unknown as EvalResultItem[]
    const evaluationData = evaluations?.[0] || null

    return NextResponse.json({
      sessionId: session.id,
      status: session.status,
      scorePercentage: session.score_percentage,
      elapsedSeconds: session.elapsed_seconds,
      submittedAt: session.submitted_at,
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
            finalizedAt: evaluationData.finalized_at,
          }
        : null,
    })
  } catch (err) {
    console.error('Unexpected error in student result:', err)
    return NextResponse.json(
      { error: 'Terjadi kesalahan internal server' },
      { status: 500 }
    )
  }
}
