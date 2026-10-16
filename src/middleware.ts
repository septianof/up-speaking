import { createServerClient } from '@supabase/ssr'
import { NextResponse, type NextRequest } from 'next/server'

export async function middleware(request: NextRequest) {
  let supabaseResponse = NextResponse.next({
    request,
  })

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll()
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value }) =>
            request.cookies.set(name, value)
          )
          supabaseResponse = NextResponse.next({
            request,
          })
          cookiesToSet.forEach(({ name, value, options }) =>
            supabaseResponse.cookies.set(name, value, options)
          )
        },
      },
    }
  )

  const { pathname } = request.nextUrl

  // 1. Tangani shortcut /login
  if (pathname === '/login') {
    const {
      data: { user },
    } = await supabase.auth.getUser()

    const redirectUrl = request.nextUrl.clone()
    if (!user) {
      redirectUrl.pathname = '/staff/login'
      return NextResponse.redirect(redirectUrl)
    }

    // Jika sudah login, lempar ke dashboard sesuai role
    const { data: profile } = await supabase
      .from('profiles')
      .select('role')
      .eq('id', user.id)
      .single()

    if (profile?.role === 'ADMIN') {
      redirectUrl.pathname = '/staff/admin/dashboard'
    } else {
      redirectUrl.pathname = '/staff/tutor/dashboard'
    }
    return NextResponse.redirect(redirectUrl)
  }

  // 2. Tangani /staff/login saat pengguna SUDAH login
  if (pathname === '/staff/login') {
    const {
      data: { user },
    } = await supabase.auth.getUser()

    if (user) {
      const { data: profile } = await supabase
        .from('profiles')
        .select('role')
        .eq('id', user.id)
        .single()

      const redirectUrl = request.nextUrl.clone()
      const targetParam = request.nextUrl.searchParams.get('redirect')

      if (targetParam && targetParam.startsWith('/staff/')) {
        if (targetParam.startsWith('/staff/admin') && profile?.role !== 'ADMIN') {
          redirectUrl.pathname = '/staff/tutor/dashboard'
        } else {
          redirectUrl.pathname = targetParam
        }
        redirectUrl.search = ''
      } else {
        if (profile?.role === 'ADMIN') {
          redirectUrl.pathname = '/staff/admin/dashboard'
        } else {
          redirectUrl.pathname = '/staff/tutor/dashboard'
        }
      }
      return NextResponse.redirect(redirectUrl)
    }

    return supabaseResponse
  }

  // 3. Tangani rute /staff (portal root staf)
  if (pathname === '/staff') {
    const {
      data: { user },
    } = await supabase.auth.getUser()

    const redirectUrl = request.nextUrl.clone()
    if (!user) {
      redirectUrl.pathname = '/staff/login'
      return NextResponse.redirect(redirectUrl)
    }

    const { data: profile } = await supabase
      .from('profiles')
      .select('role')
      .eq('id', user.id)
      .single()

    if (profile?.role === 'ADMIN') {
      redirectUrl.pathname = '/staff/admin/dashboard'
    } else {
      redirectUrl.pathname = '/staff/tutor/dashboard'
    }
    return NextResponse.redirect(redirectUrl)
  }

  // 4. Normalisasi shortcut alias /admin dan /tutor ke rute internal /staff/admin dan /staff/tutor
  let canonicalPath = pathname
  let isAlias = false

  if (pathname === '/admin') {
    canonicalPath = '/staff/admin/dashboard'
    isAlias = true
  } else if (pathname.startsWith('/admin/')) {
    canonicalPath = `/staff${pathname}`
    isAlias = true
  } else if (pathname === '/tutor') {
    canonicalPath = '/staff/tutor/dashboard'
    isAlias = true
  } else if (pathname.startsWith('/tutor/')) {
    canonicalPath = `/staff${pathname}`
    isAlias = true
  }

  // 5. Proteksi rute staf (baik rute asli /staff/... maupun via shortcut alias)
  const isStaffRoute =
    canonicalPath.startsWith('/staff/admin') ||
    canonicalPath.startsWith('/staff/tutor')

  if (isStaffRoute) {
    const {
      data: { user },
    } = await supabase.auth.getUser()

    // Jika belum login: arahkan ke /staff/login dengan param redirect ke canonicalPath
    if (!user) {
      const redirectUrl = request.nextUrl.clone()
      redirectUrl.pathname = '/staff/login'
      redirectUrl.search = ''
      redirectUrl.searchParams.set('redirect', canonicalPath)
      return NextResponse.redirect(redirectUrl)
    }

    // Otorisasi Peran: Verifikasi hak akses admin
    const { data: profile } = await supabase
      .from('profiles')
      .select('role')
      .eq('id', user.id)
      .single()

    // Jika mencoba akses rute Admin tapi role bukan ADMIN -> alihkan ke Dashboard Tutor
    if (canonicalPath.startsWith('/staff/admin')) {
      if (!profile || profile.role !== 'ADMIN') {
        const redirectUrl = request.nextUrl.clone()
        redirectUrl.pathname = '/staff/tutor/dashboard'
        redirectUrl.search = ''
        return NextResponse.redirect(redirectUrl)
      }
    }

    // Jika pengguna mengakses melalui shortcut alias (misal /admin/students), redirect ke URL resminya
    if (isAlias) {
      const redirectUrl = request.nextUrl.clone()
      redirectUrl.pathname = canonicalPath
      return NextResponse.redirect(redirectUrl)
    }
  }

  return supabaseResponse
}

export const config = {
  matcher: [
    '/admin',
    '/admin/:path*',
    '/tutor',
    '/tutor/:path*',
    '/staff',
    '/staff/:path*',
    '/login',
  ],
}
