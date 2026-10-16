import { NextResponse } from 'next/server'
import { createAdminClient } from '@/lib/supabase/admin'
import { verifyStaffAuth } from '@/lib/supabase/auth-guard'

export const dynamic = 'force-dynamic'

export async function GET(request: Request) {
  try {
    const auth = await verifyStaffAuth(['ADMIN', 'TUTOR'])
    if (!auth.isAuthorized) {
      return auth.errorResponse
    }

    const { searchParams } = new URL(request.url)
    const level = searchParams.get('level') || 'ELEMENTARY'

    const supabase = createAdminClient()

    // 1. Ambil data siswa dan sesi ujian khusus jenjang yang diampu tutor
    const { data: students, error: studentsError } = await supabase
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
            assigned_level,
            finalized_at
          )
        )
      `)
      .eq('target_level', level)
      .order('created_at', { ascending: false })

    if (studentsError) {
      console.error('Error fetching tutor dashboard data:', studentsError)
      return NextResponse.json(
        { error: 'Gagal memuat dashboard tutor' },
        { status: 500 }
      )
    }

    const totalStudentsInLevel = students?.length || 0
    let pendingEvaluationCount = 0
    let finalizedCount = 0
    let totalScore = 0
    let evaluatedOrCompletedCount = 0

    interface TutorSessionItem {
      id: string
      status: string
      score_percentage: number | null
      elapsed_seconds: number
      started_at: string
      submitted_at: string | null
    }

    interface RecentSubmission {
      sessionId: string
      studentId: string
      studentName: string
      scorePercentage: number | null
      elapsedSeconds: number
      submittedAt: string
      status: string
    }

    const recentSubmissions: RecentSubmission[] = []
    const pendingStudentsList: Array<{
      id: string
      sessionId: string
      fullName: string
      phone: string
      targetLevel: string
      status: string
      score: number
      totalQuestions: number
      elapsedSeconds: number
      createdAt: string
    }> = []

    students?.forEach((st) => {
      const sessions = (st.test_sessions as unknown as TutorSessionItem[]) || []
      const validSessions = sessions.filter(
        (s) => s.status !== 'RESET'
      )
      const session = validSessions[0]

      if (!session) return

      if (session.status === 'COMPLETED') {
        pendingEvaluationCount++
        totalScore += Number(session.score_percentage || 0)
        evaluatedOrCompletedCount++

        recentSubmissions.push({
          sessionId: session.id,
          studentId: st.id,
          studentName: st.full_name,
          scorePercentage: session.score_percentage,
          elapsedSeconds: session.elapsed_seconds,
          submittedAt: session.submitted_at || session.started_at,
          status: 'COMPLETED',
        })

        const rawScore = Math.round(
          ((Number(session.score_percentage) || 0) / 100) * 10
        )

        pendingStudentsList.push({
          id: st.id,
          sessionId: session.id,
          fullName: st.full_name,
          phone: st.phone_number,
          targetLevel: st.target_level,
          status: session.status,
          score: rawScore,
          totalQuestions: 10,
          elapsedSeconds: session.elapsed_seconds,
          createdAt: st.created_at,
        })
      } else if (session.status === 'FINALIZED') {
        finalizedCount++
        totalScore += Number(session.score_percentage || 0)
        evaluatedOrCompletedCount++
      }
    })

    const averageScore =
      evaluatedOrCompletedCount > 0
        ? Math.round((totalScore / evaluatedOrCompletedCount) * 10) / 10
        : 0

    recentSubmissions.sort(
      (a, b) =>
        new Date(b.submittedAt).getTime() - new Date(a.submittedAt).getTime()
    )

    return NextResponse.json({
      metrics: {
        total: totalStudentsInLevel,
        totalStudentsInLevel,
        needEvaluation: pendingEvaluationCount,
        pendingEvaluationCount,
        finalized: finalizedCount,
        finalizedCount,
        averageScore,
      },
      pendingStudents: pendingStudentsList.slice(0, 5),
      recentSubmissions: recentSubmissions.slice(0, 5),
    })
  } catch (err) {
    console.error('Unexpected error in tutor dashboard GET:', err)
    return NextResponse.json(
      { error: 'Terjadi kesalahan internal server' },
      { status: 500 }
    )
  }
}
