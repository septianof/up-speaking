import { createServerClient, type CookieOptions } from '@supabase/ssr';
import { NextResponse, type NextRequest } from 'next/server';

/**
 * Next.js Middleware: Proteksi Rute Admin Panel
 * 
 * Tanggung Jawab:
 * 1. Memperbarui session token Supabase secara berkala di background cookies.
 * 2. Mencegat akses ke /admin/dashboard, /admin/questions, /admin/settings jika belum login.
 * 3. Mengalihkan admin yang sudah login langsung ke dashboard jika membuka /admin.
 */
export async function middleware(request: NextRequest) {
  let response = NextResponse.next({
    request: {
      headers: request.headers,
    },
  });

  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  if (!supabaseUrl || !supabaseAnonKey) {
    return response;
  }

  const supabase = createServerClient(supabaseUrl, supabaseAnonKey, {
    cookies: {
      getAll() {
        return request.cookies.getAll();
      },
      setAll(cookiesToSet: Array<{ name: string; value: string; options: CookieOptions }>) {
        cookiesToSet.forEach(({ name, value }) => request.cookies.set(name, value));
        response = NextResponse.next({
          request,
        });
        cookiesToSet.forEach(({ name, value, options }) =>
          response.cookies.set(name, value, options)
        );
      },
    },
  });

  // Validasi user autentikasi via Supabase Auth
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const { pathname } = request.nextUrl;

  // 1. Proteksi rute /tutor: Wajib login
  if (pathname.startsWith('/tutor')) {
    if (!user) {
      const loginUrl = new URL('/admin', request.url);
      loginUrl.searchParams.set('redirect', pathname);
      return NextResponse.redirect(loginUrl);
    }
  }

  // 2. Proteksi rute admin: /admin/* (kecuali halaman login /admin itu sendiri)
  if (pathname.startsWith('/admin') && pathname !== '/admin') {
    if (!user) {
      const loginUrl = new URL('/admin', request.url);
      loginUrl.searchParams.set('redirect', pathname);
      return NextResponse.redirect(loginUrl);
    }

    // Jika user login sebagai tutor mencoba masuk ke admin panel, arahkan ke antrean tutor
    const { data: profile } = await supabase
      .from('profiles')
      .select('role')
      .eq('id', user.id)
      .maybeSingle();

    if (profile?.role === 'tutor') {
      return NextResponse.redirect(new URL('/tutor', request.url));
    }
  }

  // 3. Jika user sudah login dan mengakses halaman /admin (login), redirect sesuai role
  if (pathname === '/admin' && user) {
    const { data: profile } = await supabase
      .from('profiles')
      .select('role')
      .eq('id', user.id)
      .maybeSingle();

    if (profile?.role === 'tutor') {
      return NextResponse.redirect(new URL('/tutor', request.url));
    }

    return NextResponse.redirect(new URL('/admin/dashboard', request.url));
  }

  return response;
}

export const config = {
  matcher: ['/admin/:path*', '/tutor/:path*'],
};
