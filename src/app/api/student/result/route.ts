import { NextResponse } from 'next/server'
import { cookies } from 'next/headers'
import { createAdminClient } from '@/lib/supabase/admin'
import { createClient } from '@/lib/supabase/server'
import { normalizeSingleRelation } from '@/lib/utils'
import {
  verifyStudentToken,
  STUDENT_TOKEN_COOKIE_NAME,
} from '@/lib/student-token'

export const dynamic = 'force-dynamic'
export const fetchCache = 'force-no-store'
export const revalidate = 0

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

    // 1. Cek apakah diakses oleh staf lembaga terautentikasi (Admin atau Tutor)
    const serverClient = createClient()
    const {
      data: { user: staffUser },
    } = await serverClient.auth.getUser()

    // 2. Jika bukan staf lembaga, wajib divalidasi kepemilikan sesi via cookie token siswa
    if (!staffUser) {
      const cookieStore = cookies()
      const rawToken = cookieStore.get(STUDENT_TOKEN_COOKIE_NAME)?.value
      const verifiedToken = verifyStudentToken(rawToken)

      if (!verifiedToken) {
        return NextResponse.json(
          { error: 'Akses ditolak: Autentikasi sesi siswa diperlukan untuk melihat hasil ujian.' },
          { status: 401 }
        )
      }

      // Pastikan token siswa cocok dengan studentId atau sessionId yang diminta
      const matchesStudent =
        !!studentId && verifiedToken.studentId === studentId
      const matchesSession =
        !!sessionId &&
        (verifiedToken.sessionId === sessionId ||
          verifiedToken.studentId === studentId)

      if (!matchesStudent && !matchesSession) {
        return NextResponse.json(
          { error: 'Akses ditolak: Anda tidak memiliki wewenang untuk melihat lembar hasil ujian ini.' },
          { status: 403 }
        )
      }
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

    if (session.status === 'IN_PROGRESS') {
      return NextResponse.json(
        {
          error: 'Ujian masih sedang berlangsung. Mengalihkan ke lembar ujian...',
          status: 'IN_PROGRESS',
          sessionId: session.id,
        },
        { status: 403 }
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

    const studentData = normalizeSingleRelation(session.students as unknown as StudentItem | StudentItem[])
    const evaluationData = normalizeSingleRelation(
      session.placement_evaluations as unknown as
        | EvalResultItem
        | EvalResultItem[]
    )

    return NextResponse.json(
      {
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
    console.error('Unexpected error in student result:', err)
    return NextResponse.json(
      { error: 'Terjadi kesalahan internal server' },
      { status: 500 }
    )
  }
}
