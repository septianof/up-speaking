import { NextResponse } from 'next/server'
import { createAdminClient } from '@/lib/supabase/admin'
import { normalizeSingleRelation } from '@/lib/utils'

export const dynamic = 'force-dynamic'
export const fetchCache = 'force-no-store'
export const revalidate = 0

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const level = searchParams.get('level') || 'ELEMENTARY'
    const status = searchParams.get('status') || 'ALL'
    const search = searchParams.get('search') || ''

    const supabase = createAdminClient()

    let query = supabase
      .from('students')
      .select(`
        id,
        full_name,
        phone_number,
        target_level,
        created_at,
        test_sessions (
          id,
          status,
          score_percentage,
          elapsed_seconds,
          started_at,
          submitted_at,
          placement_evaluations (
            id,
            assigned_level,
            tutor_notes,
            finalized_at,
            profiles (
              full_name
            )
          )
        )
      `)
      .eq('target_level', level)
      .order('created_at', { ascending: false })

    if (search.trim()) {
      query = query.or(
        `full_name.ilike.%${search.trim()}%,phone_number.ilike.%${search.trim()}%`
      )
    }

    const { data: students, error } = await query

    if (error) {
      console.error('Error fetching tutor evaluations:', error)
      return NextResponse.json(
        { error: 'Gagal mengambil data evaluasi siswa' },
        { status: 500 }
      )
    }

    interface TutorProfile {
      full_name: string
    }

    interface EvalInfo {
      id: string
      assigned_level: string
      tutor_notes: string | null
      finalized_at: string
      profiles?: TutorProfile
    }

    interface TutorSessionData {
      id: string
      status: string
      score_percentage: number | null
      elapsed_seconds: number
      started_at: string
      submitted_at: string | null
      placement_evaluations?: EvalInfo[]
    }

    interface EvaluationItem {
      sessionId: string | null
      studentId: string
      fullName: string
      phoneNumber: string
      targetLevel: string
      sessionStatus: string
      scorePercentage: number | null
      elapsedSeconds: number
      submittedAt: string | null
      assignedLevel: string | null
      tutorNotes: string | null
      tutorName: string | null
      finalizedAt: string | null
      createdAt: string
    }

    const evaluationList: EvaluationItem[] = []

    students?.forEach((st) => {
      const sessions = (st.test_sessions as unknown as TutorSessionData[]) || []
      const validSessions = sessions.filter(
        (s) => s.status !== 'RESET'
      )
      const session = validSessions[0]
      const sessionStatus = session?.status || 'NOT_STARTED'

      if (status !== 'ALL' && sessionStatus !== status) {
        return
      }

      const evalData = normalizeSingleRelation(
        session?.placement_evaluations as unknown as EvalInfo | EvalInfo[]
      )
      const tutorProfile = normalizeSingleRelation(
        evalData?.profiles as unknown as TutorProfile | TutorProfile[]
      )

      evaluationList.push({
        sessionId: session?.id || null,
        studentId: st.id,
        fullName: st.full_name,
        phoneNumber: st.phone_number,
        targetLevel: st.target_level,
        sessionStatus: sessionStatus,
        scorePercentage: session?.score_percentage ?? null,
        elapsedSeconds: session?.elapsed_seconds ?? 0,
        submittedAt: session?.submitted_at || session?.started_at || null,
        assignedLevel: evalData?.assigned_level || null,
        tutorNotes: evalData?.tutor_notes || null,
        tutorName: tutorProfile?.full_name || null,
        finalizedAt: evalData?.finalized_at || null,
        createdAt: st.created_at,
      })
    })

    return NextResponse.json(
      {
        evaluations: evaluationList,
      },
      {
        headers: {
          'Cache-Control':
            'no-store, no-cache, must-revalidate, proxy-revalidate, max-age=0',
          Pragma: 'no-cache',
          Expires: '0',
        },
      }
    )
  } catch (err) {
    console.error('Unexpected error in tutor evaluations GET:', err)
    return NextResponse.json(
      { error: 'Terjadi kesalahan internal server' },
      { status: 500 }
    )
  }
}
