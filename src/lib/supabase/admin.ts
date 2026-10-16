import { createClient } from '@supabase/supabase-js'
import type { Database } from '@/types/database.types'

/**
 * Supabase admin client dengan Service Role Key.
 * Digunakan untuk operasi server berprivilese tinggi:
 * - Pembuatan user staf baru via Auth Admin API (supabase.auth.admin.createUser)
 * - Operasi database internal yang mengabaikan batasan akses
 *
 * HANYA dipanggil di Server (Route Handlers).
 * JANGAN diekspos ke browser / Client Components!
 */
function isServiceRoleKey(key?: string): boolean {
  if (!key) return false
  try {
    const parts = key.split('.')
    if (parts.length < 2) return false
    const payload = JSON.parse(Buffer.from(parts[1], 'base64').toString('utf8'))
    return payload.role === 'service_role' || payload.role === 'supabase_admin'
  } catch {
    return false
  }
}

export function createAdminClient() {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY

  if (!supabaseUrl) {
    throw new Error('Konfigurasi Supabase gagal: NEXT_PUBLIC_SUPABASE_URL belum diatur.')
  }

  if (!serviceRoleKey || !isServiceRoleKey(serviceRoleKey)) {
    throw new Error(
      'Konfigurasi Supabase Admin gagal: SUPABASE_SERVICE_ROLE_KEY belum diatur atau tidak valid di environment server.'
    )
  }

  return createClient<Database>(supabaseUrl, serviceRoleKey, {
    auth: {
      autoRefreshToken: false,
      persistSession: false,
    },
    global: {
      fetch: (url, options = {}) =>
        fetch(url, {
          ...options,
          cache: 'no-store',
        }),
    },
  })
}
