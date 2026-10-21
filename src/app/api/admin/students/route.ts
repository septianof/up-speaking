import { NextResponse } from 'next/server'
import { z } from 'zod'
import { createAdminClient } from '@/lib/supabase/admin'
import { verifyStaffAuth } from '@/lib/supabase/auth-guard'
import { normalizeSingleRelation } from '@/lib/utils'

export const dynamic = 'force-dynamic'

/**
 * Menormalisasi nomor HP ke format standar Indonesia (diawali '08').
 * Menangani input: '628xxx', '+628xxx', '8xxx', dan '08xxx'.
 */
function normalizePhoneNumber(phone: string): string {
  const digits = phone.replace(/\D/g, '')
  if (digits.startsWith('628')) return '0' + digits.slice(2)
  if (digits.startsWith('62')) return '0' + digits.slice(2)
  if (digits.startsWith('8')) return '0' + digits
  return digits
}

const phoneSchema = z
  .string()
  .min(1, 'Nomor HP wajib diisi')
  .transform((val) => normalizePhoneNumber(val.trim()))
  .pipe(
    z
      .string()
      .min(10, 'Nomor HP harus terdiri dari 10–14 digit')
      .max(14, 'Nomor HP harus terdiri dari 10–14 digit')
      .regex(/^08[0-9]+$/, 'Nomor HP harus diawali 08 dan berupa angka')
  )

const createStudentSchema = z.object({
  fullName: z
    .string()
    .min(2, 'Nama lengkap minimal 2 karakter')
    .max(150, 'Nama terlalu panjang'),
  phoneNumber: phoneSchema,
  targetLevel: z.enum(['ELEMENTARY', 'HIGH_SCHOOL']),
})

const updateStudentSchema = z.object({
  id: z.string().min(1, 'ID siswa wajib disertakan'),
  fullName: z
    .string()
    .min(2, 'Nama lengkap minimal 2 karakter')
    .max(150, 'Nama terlalu panjang'),
  phoneNumber: phoneSchema,
  targetLevel: z.enum(['ELEMENTARY', 'HIGH_SCHOOL']),
})

export async function GET(request: Request) {
  try {
    const auth = await verifyStaffAuth(['ADMIN'])
    if (!auth.isAuthorized) {
      return auth.errorResponse
    }

    const { searchParams } = new URL(request.url)
    const search = searchParams.get('search') || ''
    const level = searchParams.get('level') || 'ALL'

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
            finalized_at
          )
        )
      `)
      .order('created_at', { ascending: false })

    if (level !== 'ALL') {
      query = query.eq('target_level', level)
    }

    const sanitizedSearch = search.trim().replace(/[,()]/g, '')
    if (sanitizedSearch) {
      query = query.or(
        `full_name.ilike.%${sanitizedSearch}%,phone_number.ilike.%${sanitizedSearch}%`
      )
    }

    const { data: students, error: studentsError } = await query

    if (studentsError) {
      console.error('Error querying students:', studentsError)
      return NextResponse.json(
        { error: 'Gagal mengambil data siswa' },
        { status: 500 }
      )
    }

    interface SessionWithEval {
      id: string
      status: string
      score_percentage: number
      elapsed_seconds: number
      placement_evaluations?: Array<{
        assigned_level: string
        finalized_at: string
      }>
    }

    const formattedStudents = (students || []).map((st) => {
      // Ambil sesi aktif terakhir (bukan RESET)
      const sessions = (st.test_sessions as unknown as SessionWithEval[]) || []
      const validSessions = sessions.filter(
        (s) => s.status !== 'RESET'
      )
      const latestSession = validSessions[0]
      const evalData = normalizeSingleRelation(
        latestSession?.placement_evaluations as unknown as
          | { assigned_level: string; finalized_at: string }
          | { assigned_level: string; finalized_at: string }[]
      )

      return {
        id: st.id,
        fullName: st.full_name,
        phoneNumber: st.phone_number,
        targetLevel: st.target_level,
        createdAt: st.created_at,
        sessionId: latestSession?.id || null,
        sessionStatus: latestSession?.status || 'NOT_STARTED',
        scorePercentage: latestSession?.score_percentage ?? null,
        elapsedSeconds: latestSession?.elapsed_seconds ?? 0,
        assignedLevel: evalData?.assigned_level || null,
        finalizedAt: evalData?.finalized_at || null,
      }
    })

    return NextResponse.json({
      students: formattedStudents,
    })
  } catch (err) {
    console.error('Unexpected error in admin students GET:', err)
    return NextResponse.json(
      { error: 'Terjadi kesalahan internal server' },
      { status: 500 }
    )
  }
}

export async function POST(request: Request) {
  try {
    const auth = await verifyStaffAuth(['ADMIN'])
    if (!auth.isAuthorized) {
      return auth.errorResponse
    }

    const body = await request.json()
    const parsed = createStudentSchema.safeParse(body)

    if (!parsed.success) {
      return NextResponse.json(
        { error: parsed.error.issues[0]?.message || 'Input pendaftaran siswa tidak valid' },
        { status: 400 }
      )
    }

    // phoneNumber sudah dinormalisasi oleh Zod transform (628xxx → 08xxx)
    const { fullName, phoneNumber, targetLevel } = parsed.data
    const supabase = createAdminClient()

    // Cek duplikat berdasarkan kombinasi nama lengkap + nomor HP (lintas jenjang)
    const { data: existing } = await supabase
      .from('students')
      .select('id')
      .ilike('full_name', fullName.trim())
      .eq('phone_number', phoneNumber)
      .maybeSingle()

    if (existing) {
      return NextResponse.json(
        { error: 'Siswa dengan nama dan nomor HP ini sudah terdaftar di sistem.' },
        { status: 409 }
      )
    }

    const { data: newStudent, error: insertError } = await supabase
      .from('students')
      .insert({
        full_name: fullName.trim(),
        phone_number: phoneNumber,
        target_level: targetLevel,
      })
      .select('*')
      .single()

    if (insertError || !newStudent) {
      console.error('Error inserting student:', insertError)
      return NextResponse.json(
        { error: 'Gagal mendaftarkan siswa ke database' },
        { status: 500 }
      )
    }

    return NextResponse.json({
      success: true,
      student: {
        id: newStudent.id,
        fullName: newStudent.full_name,
        phoneNumber: newStudent.phone_number,
        targetLevel: newStudent.target_level,
        createdAt: newStudent.created_at,
        sessionStatus: 'NOT_STARTED',
      },
    })
  } catch (err) {
    console.error('Unexpected error in admin students POST:', err)
    return NextResponse.json(
      { error: 'Terjadi kesalahan internal server' },
      { status: 500 }
    )
  }
}

export async function PUT(request: Request) {
  try {
    const auth = await verifyStaffAuth(['ADMIN'])
    if (!auth.isAuthorized) {
      return auth.errorResponse
    }

    const body = await request.json()
    const parsed = updateStudentSchema.safeParse(body)

    if (!parsed.success) {
      return NextResponse.json(
        { error: parsed.error.issues[0]?.message || 'Input perbaruan siswa tidak valid' },
        { status: 400 }
      )
    }

    // phoneNumber sudah dinormalisasi oleh Zod transform (628xxx → 08xxx)
    const { id, fullName, phoneNumber, targetLevel } = parsed.data
    const supabase = createAdminClient()

    // Cek apakah siswa ada
    const { data: currentStudent, error: currentError } = await supabase
      .from('students')
      .select('id')
      .eq('id', id)
      .maybeSingle()

    if (currentError || !currentStudent) {
      return NextResponse.json(
        { error: 'Data siswa tidak ditemukan' },
        { status: 404 }
      )
    }

    // Cek duplikat nama + HP untuk siswa LAIN (lintas jenjang)
    const { data: existing } = await supabase
      .from('students')
      .select('id')
      .ilike('full_name', fullName.trim())
      .eq('phone_number', phoneNumber)
      .neq('id', id)
      .maybeSingle()

    if (existing) {
      return NextResponse.json(
        { error: 'Siswa lain dengan nama dan nomor HP yang sama sudah ada di sistem.' },
        { status: 409 }
      )
    }

    const { data: updatedStudent, error: updateError } = await supabase
      .from('students')
      .update({
        full_name: fullName.trim(),
        phone_number: phoneNumber,
        target_level: targetLevel,
      })
      .eq('id', id)
      .select('*')
      .single()

    if (updateError || !updatedStudent) {
      console.error('Error updating student:', updateError)
      return NextResponse.json(
        { error: 'Gagal memperbarui data siswa ke database' },
        { status: 500 }
      )
    }

    return NextResponse.json({
      success: true,
      student: {
        id: updatedStudent.id,
        fullName: updatedStudent.full_name,
        phoneNumber: updatedStudent.phone_number,
        targetLevel: updatedStudent.target_level,
        createdAt: updatedStudent.created_at,
      },
    })
  } catch (err) {
    console.error('Unexpected error in admin students PUT:', err)
    return NextResponse.json(
      { error: 'Terjadi kesalahan internal server' },
      { status: 500 }
    )
  }
}

export async function DELETE(request: Request) {
  try {
    const auth = await verifyStaffAuth(['ADMIN'])
    if (!auth.isAuthorized) {
      return auth.errorResponse
    }

    const { searchParams } = new URL(request.url)
    const id = searchParams.get('id')

    if (!id) {
      return NextResponse.json(
        { error: 'Parameter ID siswa diperlukan' },
        { status: 400 }
      )
    }

    const supabase = createAdminClient()
    const { error: deleteError } = await supabase
      .from('students')
      .delete()
      .eq('id', id)

    if (deleteError) {
      console.error('Error deleting student:', deleteError)
      return NextResponse.json(
        { error: 'Gagal menghapus data siswa' },
        { status: 500 }
      )
    }

    return NextResponse.json({
      success: true,
      message: 'Data siswa berhasil dihapus',
    })
  } catch (err) {
    console.error('Unexpected error in admin students DELETE:', err)
    return NextResponse.json(
      { error: 'Terjadi kesalahan internal server' },
      { status: 500 }
    )
  }
}
