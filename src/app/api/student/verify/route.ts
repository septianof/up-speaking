import { NextResponse } from 'next/server'
import { z } from 'zod'
import { createAdminClient } from '@/lib/supabase/admin'

const verifySchema = z.object({
  fullName: z.string().min(2, 'Nama lengkap minimal 2 karakter'),
  phoneNumber: z.string().min(8, 'Nomor HP minimal 8 digit'),
})

export async function POST(request: Request) {
  try {
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

    return NextResponse.json({
      studentId: student.id,
      fullName: student.full_name,
      phoneNumber: student.phone_number,
      targetLevel: student.target_level,
      hasActiveSession,
      sessionId: latestSession?.id || null,
      status: latestSession?.status || 'NOT_STARTED',
    })
  } catch (err) {
    console.error('Unexpected error in student verify:', err)
    return NextResponse.json(
      { error: 'Terjadi kesalahan internal server' },
      { status: 500 }
    )
  }
}
