import { NextResponse } from 'next/server'
import { z } from 'zod'
import { createAdminClient } from '@/lib/supabase/admin'

const createTutorSchema = z.object({
  fullName: z
    .string()
    .min(2, 'Nama lengkap minimal 2 karakter')
    .max(150, 'Nama terlalu panjang'),
  email: z.string().email('Format email tidak valid'),
  password: z
    .string()
    .min(6, 'Password sementara minimal 6 karakter'),
  role: z.enum(['TUTOR_ELEMENTARY', 'TUTOR_HIGH_SCHOOL']),
})

export async function GET() {
  try {
    const supabase = createAdminClient()

    // Ambil seluruh profil staf dengan peran Tutor
    const { data: tutors, error: tutorsError } = await supabase
      .from('profiles')
      .select(`
        id,
        full_name,
        email,
        role,
        created_at,
        placement_evaluations (
          id
        )
      `)
      .in('role', ['TUTOR_ELEMENTARY', 'TUTOR_HIGH_SCHOOL'])
      .order('created_at', { ascending: false })

    if (tutorsError) {
      console.error('Error querying tutors:', tutorsError)
      return NextResponse.json(
        { error: 'Gagal mengambil daftar tutor' },
        { status: 500 }
      )
    }

    const formattedTutors = (tutors || []).map((t) => {
      const evaluationCount = (t.placement_evaluations || []).length
      return {
        id: t.id,
        fullName: t.full_name,
        email: t.email,
        role: t.role,
        targetLevel:
          t.role === 'TUTOR_ELEMENTARY' ? 'ELEMENTARY' : 'HIGH_SCHOOL',
        evaluationCount,
        createdAt: t.created_at,
      }
    })

    return NextResponse.json({
      tutors: formattedTutors,
    })
  } catch (err) {
    console.error('Unexpected error in admin tutors GET:', err)
    return NextResponse.json(
      { error: 'Terjadi kesalahan internal server' },
      { status: 500 }
    )
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json()
    const parsed = createTutorSchema.safeParse(body)

    if (!parsed.success) {
      return NextResponse.json(
        { error: parsed.error.issues[0]?.message || 'Input akun tutor tidak valid' },
        { status: 400 }
      )
    }

    const { fullName, email, password, role } = parsed.data
    const supabase = createAdminClient()

    // 1. Cek apakah email sudah terdaftar di profiles
    const { data: existingProfile } = await supabase
      .from('profiles')
      .select('id')
      .eq('email', email.trim().toLowerCase())
      .maybeSingle()

    if (existingProfile) {
      return NextResponse.json(
        { error: 'Email ini sudah terdaftar sebagai akun staf' },
        { status: 409 }
      )
    }

    // 2. Buat user di Supabase Auth melalui Admin Auth API
    const { data: authUser, error: authError } =
      await supabase.auth.admin.createUser({
        email: email.trim().toLowerCase(),
        password,
        email_confirm: true,
        user_metadata: {
          full_name: fullName.trim(),
        },
      })

    if (authError || !authUser.user) {
      console.error('Error creating user in Supabase Auth:', authError)
      return NextResponse.json(
        {
          error:
            authError?.message ||
            'Gagal membuat akun autentikasi di Supabase Auth',
        },
        { status: 500 }
      )
    }

    // 3. Catat ke tabel profiles
    const { data: newProfile, error: profileError } = await supabase
      .from('profiles')
      .insert({
        id: authUser.user.id,
        full_name: fullName.trim(),
        email: email.trim().toLowerCase(),
        role,
      })
      .select('*')
      .single()

    if (profileError || !newProfile) {
      console.error('Error inserting into profiles:', profileError)
      // Rollback user jika gagal mencatat profil
      await supabase.auth.admin.deleteUser(authUser.user.id)
      return NextResponse.json(
        { error: 'Gagal mencatat profil akun pengajar ke database' },
        { status: 500 }
      )
    }

    return NextResponse.json({
      success: true,
      tutor: {
        id: newProfile.id,
        fullName: newProfile.full_name,
        email: newProfile.email,
        role: newProfile.role,
        targetLevel:
          newProfile.role === 'TUTOR_ELEMENTARY'
            ? 'ELEMENTARY'
            : 'HIGH_SCHOOL',
        createdAt: newProfile.created_at,
        evaluationCount: 0,
      },
    })
  } catch (err) {
    console.error('Unexpected error in admin tutors POST:', err)
    return NextResponse.json(
      { error: 'Terjadi kesalahan internal server' },
      { status: 500 }
    )
  }
}
