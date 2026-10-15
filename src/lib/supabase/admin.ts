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
const DEFAULT_SERVICE_ROLE_KEY =
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InBybWx0YmhrcnZkamRmemh3Y3h2Iiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc5MTk1NDg1MywiZXhwIjoyMTA3NTMwODUzfQ.o0RV3HX-30BYaFYaT1VTV3z2LkqcCVtX3UOrm5GxaY4'

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
  const supabaseUrl =
    process.env.NEXT_PUBLIC_SUPABASE_URL ||
    'https://prmltbhkrvdjdfzhwcxv.supabase.co'

  const envKey = process.env.SUPABASE_SERVICE_ROLE_KEY
  const serviceRoleKey = isServiceRoleKey(envKey)
    ? (envKey as string)
    : DEFAULT_SERVICE_ROLE_KEY

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
