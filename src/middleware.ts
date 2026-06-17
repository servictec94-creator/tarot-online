import { createMiddlewareClient } from '@supabase/auth-helpers-nextjs'
import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

export async function middleware(req: NextRequest) {
  const res = NextResponse.next()
  const supabase = createMiddlewareClient({ req, res })

  const { data: { session } } = await supabase.auth.getSession()

  const { pathname } = req.nextUrl

  // Rutas protegidas que requieren auth
  const protectedPaths = ['/dashboard', '/consultas', '/reservas', '/perfil', '/chat', '/admin']
  const isProtected = protectedPaths.some(p => pathname.startsWith(p))

  // Rutas solo para no-autenticados
  const authPaths = ['/auth/login', '/auth/register']
  const isAuthPath = authPaths.some(p => pathname.startsWith(p))

  if (isProtected && !session) {
    const loginUrl = new URL('/auth/login', req.url)
    loginUrl.searchParams.set('redirect', pathname)
    return NextResponse.redirect(loginUrl)
  }

  if (isAuthPath && session) {
    return NextResponse.redirect(new URL('/dashboard', req.url))
  }

  return res
}

export const config = {
  matcher: [
    '/dashboard/:path*',
    '/consultas/:path*',
    '/reservas/:path*',
    '/perfil/:path*',
    '/chat/:path*',
    '/admin/:path*',
    '/auth/:path*',
  ],
}
