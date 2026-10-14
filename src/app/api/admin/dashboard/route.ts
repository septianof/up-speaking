import { NextResponse } from 'next/server'
import { createAdminClient } from '@/lib/supabase/admin'

export const dynamic = 'force-dynamic'

export async function GET() {
  try {
    const supabase = createAdminClient()

    // 1. Ambil seluruh data siswa dan status sesi mereka
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
          created_at,
          submitted_at,
          placement_evaluations (
            assigned_level,
            finalized_at
          )
        )
      `)
      .order('created_at', { ascending: false })

    if (studentsError) {
      console.error('Error fetching dashboard students:', studentsError)
      return NextResponse.json(
        { error: 'Gagal memuat data dashboard' },
        { status: 500 }
      )
    }

    const totalStudents = students?.length || 0
    let inProgressCount = 0
    let completedCount = 0
    let finalizedCount = 0
    let notStartedCount = 0

    interface EvalItem {
      assigned_level: string
      finalized_at: string
    }

    interface SessionItem {
      id: string
      status: string
      score_percentage: number
      elapsed_seconds: number
      created_at: string
      submitted_at: string | null
      placement_evaluations?: EvalItem[]
    }

    interface ActivityItem {
      id: string
      studentName: string
      targetLevel: string
      type: 'STARTED' | 'SUBMITTED' | 'FINALIZED'
      message: string
      timestamp: string
    }

    const activities: ActivityItem[] = []

    students?.forEach((st) => {
      // Ambil sesi aktif terakhir (bukan RESET)
      const sessions = (st.test_sessions as unknown as SessionItem[]) || []
      const validSessions = sessions.filter(
        (s) => s.status !== 'RESET'
      )
      const latestSession = validSessions[0]

      if (!latestSession) {
        notStartedCount++
      } else if (latestSession.status === 'IN_PROGRESS') {
        inProgressCount++
        activities.push({
          id: latestSession.id,
          studentName: st.full_name,
          targetLevel: st.target_level,
          type: 'STARTED',
          message: `${st.full_name} memulai pengerjaan tes ${st.target_level === 'ELEMENTARY' ? 'SD' : 'High School'}`,
          timestamp: latestSession.created_at,
        })
      } else if (latestSession.status === 'COMPLETED') {
        completedCount++
        activities.push({
          id: latestSession.id,
          studentName: st.full_name,
          targetLevel: st.target_level,
          type: 'SUBMITTED',
          message: `${st.full_name} selesai mengumpulkan tes (Skor: ${latestSession.score_percentage}%)`,
          timestamp: latestSession.submitted_at || latestSession.created_at,
        })
      } else if (latestSession.status === 'FINALIZED') {
        finalizedCount++
        const evalData = latestSession.placement_evaluations?.[0]
        activities.push({
          id: latestSession.id,
          studentName: st.full_name,
          targetLevel: st.target_level,
          type: 'FINALIZED',
          message: `Tutor menetapkan level ${evalData?.assigned_level || 'Siswa'} untuk ${st.full_name}`,
          timestamp: evalData?.finalized_at || latestSession.created_at,
        })
      }
    })

    const recentStudents = (students || []).slice(0, 5).map((st) => {
      const sessions = (st.test_sessions as unknown as SessionItem[]) || []
      const validSessions = sessions.filter((s) => s.status !== 'RESET')
      const latestSession = validSessions[0]
      return {
        id: st.id,
        fullName: st.full_name,
        phone: st.phone_number,
        targetLevel: st.target_level,
        status: latestSession?.status || 'NOT_STARTED',
        createdAt: st.created_at,
      }
    })

    // Urutkan aktivitas terbaru (maks 10)
    activities.sort(
      (a, b) =>
        new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()
    )

    return NextResponse.json({
      metrics: {
        total: totalStudents,
        totalStudents,
        notStarted: notStartedCount,
        notStartedCount,
        inProgress: inProgressCount,
        inProgressCount,
        completed: completedCount,
        completedCount,
        finalized: finalizedCount,
        finalizedCount,
      },
      recentStudents,
      recentActivities: activities.slice(0, 10),
    })
  } catch (err) {
    console.error('Unexpected error in admin dashboard:', err)
    return NextResponse.json(
      { error: 'Terjadi kesalahan internal server' },
      { status: 500 }
    )
  }
}
