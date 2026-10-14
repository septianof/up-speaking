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
export function createAdminClient() {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
  const serviceRoleKey =
    process.env.SUPABASE_SERVICE_ROLE_KEY ||
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!

  return createClient<Database>(supabaseUrl, serviceRoleKey, {
    auth: {
      autoRefreshToken: false,
      persistSession: false,
    },
  })
}
