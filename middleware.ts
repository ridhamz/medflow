import { getToken } from 'next-auth/jwt'
import { NextRequest, NextResponse } from 'next/server'

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl

  // Allow auth and debug endpoints to bypass middleware
  if (pathname.startsWith('/api/auth') || pathname.startsWith('/api/debug')) {
    return NextResponse.next()
  }

  // Allow public routes to bypass middleware
  const publicRoutes = ['/login', '/register', '/about'] // add any public routes here
  if (publicRoutes.some((route) => pathname.startsWith(route))) {
    return NextResponse.next()
  }

  // Allow NextAuth callback to complete before checking token
  if (pathname.startsWith('/api/auth/callback')) {
    return NextResponse.next()
  }

  // Get token (lightweight, no Prisma import)
  const token = await getToken({ 
    req: request,
    secret: process.env.NEXTAUTH_SECRET 
  })

  // If user is not authenticated, redirect to login for protected routes
  const protectedRoutes = ['/admin', '/doctor', '/receptionist', '/patient']
  // Don't protect /api routes in middleware - let API routes handle auth
  if (!token && protectedRoutes.some((route) => pathname.startsWith(route))) {
    const loginUrl = new URL('/login', request.url)
    loginUrl.searchParams.set('callbackUrl', pathname)
    return NextResponse.redirect(loginUrl)
  }

  // Role-based access
  if (token) {
    const role = token.role as string

    // Redirect root '/' to user dashboard
    if (pathname === '/') {
      switch (role) {
        case 'ADMIN':
          return NextResponse.redirect(new URL('/admin', request.url))
        case 'DOCTOR':
          return NextResponse.redirect(new URL('/doctor', request.url))
        case 'RECEPTIONIST':
          return NextResponse.redirect(new URL('/receptionist', request.url))
        case 'PATIENT':
          return NextResponse.redirect(new URL('/patient', request.url))
        default:
          return NextResponse.redirect(new URL('/login', request.url))
      }
    }

    // Block access to unauthorized dashboards
    if (
      (pathname.startsWith('/admin') && role !== 'ADMIN') ||
      (pathname.startsWith('/doctor') && role !== 'DOCTOR') ||
      (pathname.startsWith('/receptionist') && role !== 'RECEPTIONIST') ||
      (pathname.startsWith('/patient') && role !== 'PATIENT')
    ) {
      return NextResponse.redirect(new URL('/', request.url))
    }
  }

  return NextResponse.next()
}

export const config = {
  matcher: [
    '/admin/:path*',
    '/doctor/:path*',
    '/receptionist/:path*',
    '/patient/:path*',
    '/',
  ],
}
