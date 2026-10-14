import { NextResponse } from 'next/server'
import { z } from 'zod'
import { createClient } from '@/lib/supabase/server'
import { createAdminClient } from '@/lib/supabase/admin'

const loginSchema = z.object({
  email: z.string().email('Format email tidak valid'),
  password: z.string().min(1, 'Password wajib diisi'),
})

export async function POST(request: Request) {
  try {
    const body = await request.json()
    const parsed = loginSchema.safeParse(body)

    if (!parsed.success) {
      return NextResponse.json(
        { error: parsed.error.issues[0]?.message || 'Input tidak valid' },
        { status: 400 }
      )
    }

    const { email, password } = parsed.data
    const supabase = createClient()

    // 1. Autentikasi dengan Supabase Auth
    const { data: authData, error: authError } =
      await supabase.auth.signInWithPassword({
        email: email.trim(),
        password,
      })

    if (authError || !authData.user) {
      return NextResponse.json(
        { error: 'Email atau kata sandi tidak sesuai' },
        { status: 401 }
      )
    }

    // 2. Ambil profil staf dan peran dari database
    const adminSupabase = createAdminClient()
    const { data: profile, error: profileError } = await adminSupabase
      .from('profiles')
      .select('*')
      .eq('id', authData.user.id)
      .single()

    if (profileError || !profile) {
      return NextResponse.json(
        { error: 'Profil staf lembaga tidak ditemukan untuk akun ini' },
        { status: 403 }
      )
    }

    const targetLevel =
      profile.role === 'TUTOR_ELEMENTARY'
        ? 'ELEMENTARY'
        : profile.role === 'TUTOR_HIGH_SCHOOL'
          ? 'HIGH_SCHOOL'
          : undefined

    const userPayload = {
      id: profile.id,
      email: profile.email,
      fullName: profile.full_name,
      role: profile.role === 'ADMIN' ? 'ADMIN' : 'TUTOR',
      targetLevel,
    }

    return NextResponse.json({
      success: true,
      user: userPayload,
    })
  } catch (err) {
    console.error('Unexpected error in staff login:', err)
    return NextResponse.json(
      { error: 'Terjadi kesalahan internal server' },
      { status: 500 }
    )
  }
}
