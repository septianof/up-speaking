import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { createAdminClient } from '@/lib/supabase/admin'
import type { Database } from '@/types/database.types'

export type ProfileRow = Database['public']['Tables']['profiles']['Row']

export interface AuthSuccess {
  user: { id: string; email?: string }
  profile: ProfileRow
  isAuthorized: true
}

export interface AuthFailure {
  errorResponse: NextResponse
  isAuthorized: false
}

export type AuthResult = AuthSuccess | AuthFailure

/**
 * Memvalidasi sesi dan otorisasi peran staf (Admin / Tutor) pada Route Handlers API.
 * Mengembalikan objek AuthSuccess jika valid, atau AuthFailure dengan respon JSON (401/403).
 */
export async function verifyStaffAuth(
  allowedRoles: ('ADMIN' | 'TUTOR')[] = ['ADMIN']
): Promise<AuthResult> {
  try {
    const supabase = createClient()
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser()

    if (authError || !user) {
      return {
        isAuthorized: false,
        errorResponse: NextResponse.json(
          { error: 'Autentikasi diperlukan. Sesi Anda tidak valid atau telah kedaluwarsa.' },
          { status: 401 }
        ),
      }
    }

    const adminClient = createAdminClient()
    const { data: profile, error: profileError } = await adminClient
      .from('profiles')
      .select('*')
      .eq('id', user.id)
      .single()

    if (profileError || !profile) {
      return {
        isAuthorized: false,
        errorResponse: NextResponse.json(
          { error: 'Profil staf lembaga tidak ditemukan atau akun tidak terdaftar.' },
          { status: 403 }
        ),
      }
    }

    const userRoleCategory: 'ADMIN' | 'TUTOR' =
      profile.role === 'ADMIN' ? 'ADMIN' : 'TUTOR'

    if (!allowedRoles.includes(userRoleCategory)) {
      return {
        isAuthorized: false,
        errorResponse: NextResponse.json(
          { error: 'Akses ditolak: Anda tidak memiliki wewenang untuk tindakan ini.' },
          { status: 403 }
        ),
      }
    }

    return {
      isAuthorized: true,
      user: { id: user.id, email: user.email },
      profile,
    }
  } catch (err) {
    console.error('Terjadi kesalahan saat memverifikasi autentikasi staf:', err)
    return {
      isAuthorized: false,
      errorResponse: NextResponse.json(
        { error: 'Terjadi kesalahan internal server saat verifikasi izin.' },
        { status: 500 }
      ),
    }
  }
}
