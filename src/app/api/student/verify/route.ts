import { NextResponse } from 'next/server'
import { z } from 'zod'
import { createAdminClient } from '@/lib/supabase/admin'
import {
  createStudentToken,
  STUDENT_TOKEN_COOKIE_NAME,
} from '@/lib/student-token'
import { checkRateLimit, getClientIp } from '@/lib/rate-limiter'

const verifySchema = z.object({
  fullName: z.string().min(2, 'Nama lengkap minimal 2 karakter'),
  phoneNumber: z.string().min(8, 'Nomor HP minimal 8 digit'),
})

export async function POST(request: Request) {
  try {
    const clientIp = getClientIp(request)
    const rateLimit = checkRateLimit(`student-verify:${clientIp}`, {
      maxRequests: 10,
      windowMs: 60_000,
    })

    if (!rateLimit.success) {
      const retryAfter = Math.max(1, Math.ceil((rateLimit.resetTime - Date.now()) / 1000))
      return NextResponse.json(
        {
          error: `Terlalu banyak permintaan verifikasi. Harap tunggu ${retryAfter} detik sebelum mencoba kembali.`,
        },
        {
          status: 429,
          headers: {
            'Retry-After': String(retryAfter),
          },
        }
      )
    }

    const body = await request.json()
    const parsed = verifySchema.safeParse(body)

    if (!parsed.success) {
      return NextResponse.json(
        { error: parsed.error.issues[0]?.message || 'Input tidak valid' },
        { status: 400 }
      )
    }

    const { fullName, phoneNumber } = parsed.data
    const supabase = createAdminClient()

    // Cari siswa berdasarkan nama lengkap dan nomor HP
    const { data: student, error: studentError } = await supabase
      .from('students')
      .select('*')
      .ilike('full_name', fullName.trim())
      .eq('phone_number', phoneNumber.trim())
      .maybeSingle()

    if (studentError) {
      console.error('Error querying student:', studentError)
      return NextResponse.json(
        { error: 'Gagal memverifikasi data siswa' },
        { status: 500 }
      )
    }

    if (!student) {
      return NextResponse.json(
        {
          error:
            'Data siswa tidak ditemukan. Pastikan nama lengkap dan nomor HP sesuai dengan pendaftaran di Up Speaking.',
        },
        { status: 404 }
      )
    }

    // Ambil sesi tes terakhir yang belum di-reset
    const { data: latestSession, error: sessionError } = await supabase
      .from('test_sessions')
      .select('*')
      .eq('student_id', student.id)
      .neq('status', 'RESET')
      .order('created_at', { ascending: false })
      .limit(1)
      .maybeSingle()

    if (sessionError) {
      console.error('Error querying session:', sessionError)
      return NextResponse.json(
        { error: 'Gagal memuat sesi tes' },
        { status: 500 }
      )
    }

    const hasActiveSession =
      !!latestSession && latestSession.status === 'IN_PROGRESS'

    const studentToken = createStudentToken({
      studentId: student.id,
      sessionId: latestSession?.id || null,
    })

    const response = NextResponse.json({
      studentId: student.id,
      fullName: student.full_name,
      phoneNumber: student.phone_number,
      targetLevel: student.target_level,
      hasActiveSession,
      sessionId: latestSession?.id || null,
      status: latestSession?.status || 'NOT_STARTED',
    })

    response.cookies.set({
      name: STUDENT_TOKEN_COOKIE_NAME,
      value: studentToken,
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      path: '/',
      maxAge: 60 * 60 * 24 * 7, // 7 hari
    })

    return response
  } catch (err) {
    console.error('Unexpected error in student verify:', err)
    return NextResponse.json(
      { error: 'Terjadi kesalahan internal server' },
      { status: 500 }
    )
  }
}
