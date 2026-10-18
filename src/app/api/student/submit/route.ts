import { NextResponse } from 'next/server'
import { cookies } from 'next/headers'
import { z } from 'zod'
import { createAdminClient } from '@/lib/supabase/admin'
import { uuidSchema, optionalUuidSchema } from '@/lib/validators'
import {
  createStudentToken,
  verifyStudentToken,
  STUDENT_TOKEN_COOKIE_NAME,
} from '@/lib/student-token'

const submitSchema = z.object({
  sessionId: uuidSchema('ID sesi tidak valid'),
  deviceToken: z.string().min(1, 'Device token wajib disertakan'),
  elapsedSeconds: z.number().int().nonnegative(),
  finalResponses: z
    .array(
      z.object({
        questionId: uuidSchema('ID butir soal tidak valid'),
        selectedOptionId: optionalUuidSchema('ID pilihan tidak valid'),
      })
    )
    .optional(),
})

export async function POST(request: Request) {
  try {
    const body = await request.json()
    const parsed = submitSchema.safeParse(body)

    if (!parsed.success) {
      return NextResponse.json(
        { error: parsed.error.issues[0]?.message || 'Input tidak valid' },
        { status: 400 }
      )
    }

    const { sessionId, deviceToken, elapsedSeconds, finalResponses } = parsed.data

    // Verifikasi token cookie identitas siswa
    const cookieStore = cookies()
    const rawToken = cookieStore.get(STUDENT_TOKEN_COOKIE_NAME)?.value
    const verifiedToken = verifyStudentToken(rawToken)

    if (!verifiedToken) {
      return NextResponse.json(
        { error: 'Akses tidak sah: Sesi siswa tidak valid atau telah berakhir.' },
        { status: 401 }
      )
    }

    if (verifiedToken.sessionId && verifiedToken.sessionId !== sessionId) {
      return NextResponse.json(
        { error: 'Akses ditolak: Token tidak sesuai dengan sesi ujian ini.' },
        { status: 403 }
      )
    }

    const supabase = createAdminClient()

    // 1. Verifikasi status sesi
    const { data: session, error: sessionError } = await supabase
      .from('test_sessions')
      .select('id, student_id, device_token, status')
      .eq('id', sessionId)
      .single()

    if (sessionError || !session) {
      return NextResponse.json(
        { error: 'Sesi tes tidak ditemukan' },
        { status: 404 }
      )
    }

    if (session.student_id !== verifiedToken.studentId) {
      return NextResponse.json(
        { error: 'Akses ditolak: Anda tidak memiliki wewenang untuk sesi ini.' },
        { status: 403 }
      )
    }

    if (session.status !== 'IN_PROGRESS') {
      return NextResponse.json(
        {
          error: 'Sesi tes sudah pernah dikumpulkan sebelumnya',
          status: session.status,
        },
        { status: 409 }
      )
    }

    // Single active device check
    if (session.device_token !== deviceToken) {
      return NextResponse.json(
        {
          error:
            'Sesi telah diambil alih di perangkat lain. Pengumpulan ditolak.',
          deviceConflict: true,
        },
        { status: 403 }
      )
    }

    // 2. Simpan final responses jika disertakan
    if (finalResponses && finalResponses.length > 0) {
      for (const item of finalResponses) {
        await supabase
          .from('test_responses')
          .update({
            selected_option_id: item.selectedOptionId,
            synced_at: new Date().toISOString(),
          })
          .match({
            session_id: sessionId,
            question_id: item.questionId,
          })
      }
    }

    // 3. Hitung skor otomatis di server
    // Ambil seluruh respon siswa untuk sesi ini
    const { data: responses, error: responsesError } = await supabase
      .from('test_responses')
      .select('question_id, selected_option_id')
      .eq('session_id', sessionId)

    if (responsesError || !responses || responses.length === 0) {
      return NextResponse.json(
        { error: 'Lembar jawaban sesi tidak ditemukan' },
        { status: 500 }
      )
    }

    const questionIds = responses.map((r) => r.question_id)

    // Ambil opsi kunci jawaban benar dari database
    const { data: correctOptions, error: correctOptionsError } = await supabase
      .from('question_options')
      .select('id, question_id')
      .in('question_id', questionIds)
      .eq('is_correct', true)

    if (correctOptionsError || !correctOptions) {
      console.error('Error fetching correct options:', correctOptionsError)
      return NextResponse.json(
        { error: 'Gagal memverifikasi kunci jawaban' },
        { status: 500 }
      )
    }

    // Petakan kunci jawaban benar per question_id
    const correctMap = new Map<string, string>()
    correctOptions.forEach((opt) => {
      correctMap.set(opt.question_id, opt.id)
    })

    // Hitung jumlah jawaban benar
    let correctCount = 0
    responses.forEach((resp) => {
      if (
        resp.selected_option_id &&
        resp.selected_option_id === correctMap.get(resp.question_id)
      ) {
        correctCount++
      }
    })

    const totalQuestions = responses.length
    const rawScorePercentage =
      totalQuestions > 0 ? (correctCount / totalQuestions) * 100 : 0
    const scorePercentage = Math.round(rawScorePercentage * 100) / 100

    // 4. Kunci status sesi menjadi COMPLETED
    const { data: updatedSession, error: updateSessionError } = await supabase
      .from('test_sessions')
      .update({
        status: 'COMPLETED',
        submitted_at: new Date().toISOString(),
        elapsed_seconds: elapsedSeconds,
        score_percentage: scorePercentage,
      })
      .eq('id', sessionId)
      .select('*')
      .single()

    if (updateSessionError || !updatedSession) {
      console.error('Error completing session:', updateSessionError)
      return NextResponse.json(
        { error: 'Gagal mengunci sesi tes' },
        { status: 500 }
      )
    }

    const updatedToken = createStudentToken({
      studentId: session.student_id,
      sessionId,
      deviceToken,
    })

    const response = NextResponse.json({
      success: true,
      status: 'COMPLETED',
      scorePercentage,
      elapsedSeconds,
      correctCount,
      totalQuestions,
    })

    response.cookies.set({
      name: STUDENT_TOKEN_COOKIE_NAME,
      value: updatedToken,
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      path: '/',
      maxAge: 60 * 60 * 24 * 7,
    })

    return response
  } catch (err) {
    console.error('Unexpected error in student submit:', err)
    return NextResponse.json(
      { error: 'Terjadi kesalahan internal server' },
      { status: 500 }
    )
  }
}
