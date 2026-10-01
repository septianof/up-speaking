import { createBrowserClient } from '@supabase/ssr';

/**
 * Supabase client instance khusus untuk Client Components di sisi browser.
 */
export function createClient() {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  if (!supabaseUrl || !supabaseAnonKey) {
    throw new Error(
      'Kredensial Supabase belum dikonfigurasi. Pastikan NEXT_PUBLIC_SUPABASE_URL dan NEXT_PUBLIC_SUPABASE_ANON_KEY ada di .env.local'
    );
  }

  return createBrowserClient(supabaseUrl, supabaseAnonKey);
}
