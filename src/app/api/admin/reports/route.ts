import { NextResponse } from 'next/server'
import { createAdminClient } from '@/lib/supabase/admin'
import { verifyStaffAuth } from '@/lib/supabase/auth-guard'
import { normalizeSingleRelation } from '@/lib/utils'

export const dynamic = 'force-dynamic'

export async function GET(request: Request) {
  try {
    const auth = await verifyStaffAuth(['ADMIN'])
    if (!auth.isAuthorized) {
      return auth.errorResponse
    }

    const { searchParams } = new URL(request.url)
    const level = searchParams.get('level') || 'ALL'
    const status = searchParams.get('status') || 'ALL'

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
            assigned_level,
            tutor_notes,
            finalized_at,
            profiles (
              full_name
            )
          )
        )
      `)
      .order('created_at', { ascending: false })

    if (level !== 'ALL') {
      query = query.eq('target_level', level)
    }

    const { data: students, error } = await query

    if (error) {
      console.error('Error fetching admin reports data:', error)
      return NextResponse.json(
        { error: 'Gagal mengambil data laporan' },
        { status: 500 }
      )
    }

    interface TutorProfile {
      full_name: string
    }

    interface ReportEval {
      assigned_level: string
      tutor_notes: string | null
      finalized_at: string
      profiles?: TutorProfile
    }

    interface ReportSession {
      id: string
      status: string
      score_percentage: number | null
      elapsed_seconds: number
      started_at: string
      submitted_at: string | null
      placement_evaluations?: ReportEval[]
    }

    interface ReportRow {
      studentId: string
      fullName: string
      phoneNumber: string
      targetLevel: string
      registeredAt: string
      sessionId: string | null
      sessionStatus: string
      scorePercentage: number | null
      elapsedSeconds: number
      submittedAt: string | null
      assignedLevel: string | null
      tutorNotes: string | null
      tutorName: string | null
      finalizedAt: string | null
    }

    const reportRows: ReportRow[] = []

    students?.forEach((st) => {
      // Saring sesi yang bukan RESET dan urutkan sesi terbaru
      const sessions = (st.test_sessions as unknown as ReportSession[]) || []
      const validSessions = sessions
        .filter((s) => s.status !== 'RESET')
        .sort((a, b) => new Date(b.started_at || 0).getTime() - new Date(a.started_at || 0).getTime())
      const session = validSessions[0]

      // OPSI A: Laporan Hasil Placement Test hanya memuat siswa yang sudah menyelesaikan ujian
      if (!session || (session.status !== 'COMPLETED' && session.status !== 'FINALIZED')) {
        return
      }

      const sessionStatus = session.status
      if (status !== 'ALL' && sessionStatus !== status) {
        return
      }

      const evalData = normalizeSingleRelation(
        session?.placement_evaluations as unknown as ReportEval | ReportEval[]
      )
      const tutorProfile = normalizeSingleRelation(
        evalData?.profiles as unknown as
          | { full_name: string }
          | { full_name: string }[]
      )

      reportRows.push({
        studentId: st.id,
        fullName: st.full_name,
        phoneNumber: st.phone_number,
        targetLevel: st.target_level,
        registeredAt: st.created_at,
        sessionId: session?.id || null,
        sessionStatus,
        scorePercentage: session?.score_percentage ?? null,
        elapsedSeconds: session?.elapsed_seconds ?? 0,
        submittedAt: session?.submitted_at || null,
        assignedLevel: evalData?.assigned_level || null,
        tutorNotes: evalData?.tutor_notes || null,
        tutorName: tutorProfile?.full_name || null,
        finalizedAt: evalData?.finalized_at || null,
      })
    })

    // Smart Default Sorting:
    // Urutkan laporan rekapitulasi berdasarkan waktu finalisasi / waktu pengumpulan ujian terbaru (DESC).
    reportRows.sort((a, b) => {
      const timeA = new Date(a.finalizedAt || a.submittedAt || a.registeredAt).getTime()
      const timeB = new Date(b.finalizedAt || b.submittedAt || b.registeredAt).getTime()
      return timeB - timeA
    })

    return NextResponse.json({
      reports: reportRows,
    })
  } catch (err) {
    console.error('Unexpected error in admin reports GET:', err)
    return NextResponse.json(
      { error: 'Terjadi kesalahan internal server' },
      { status: 500 }
    )
  }
}
