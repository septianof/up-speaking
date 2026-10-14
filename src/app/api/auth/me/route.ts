import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { createAdminClient } from '@/lib/supabase/admin'

export async function GET() {
  try {
    const supabase = createClient()
    const {
      data: { user: authUser },
      error: authError,
    } = await supabase.auth.getUser()

    if (authError || !authUser) {
      return NextResponse.json(
        { authenticated: false, user: null },
        { status: 401 }
      )
    }

    const adminSupabase = createAdminClient()
    const { data: profile, error: profileError } = await adminSupabase
      .from('profiles')
      .select('*')
      .eq('id', authUser.id)
      .single()

    if (profileError || !profile) {
      return NextResponse.json(
        { authenticated: false, user: null },
        { status: 403 }
      )
    }

    const targetLevel =
      profile.role === 'TUTOR_ELEMENTARY'
        ? 'ELEMENTARY'
        : profile.role === 'TUTOR_HIGH_SCHOOL'
          ? 'HIGH_SCHOOL'
          : undefined

    return NextResponse.json({
      authenticated: true,
      user: {
        id: profile.id,
        email: profile.email,
        fullName: profile.full_name,
        role: profile.role === 'ADMIN' ? 'ADMIN' : 'TUTOR',
        targetLevel,
      },
    })
  } catch (err) {
    console.error('Unexpected error in auth me:', err)
    return NextResponse.json(
      { error: 'Terjadi kesalahan internal server' },
      { status: 500 }
    )
  }
}
