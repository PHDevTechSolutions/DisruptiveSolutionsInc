import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export function middleware(request: NextRequest) {
  // Kunin ang cookie value
  const adminSession = request.cookies.get('admin_session')?.value;
  
  const isPathAdmin = request.nextUrl.pathname.startsWith('/admin-panel');
  const isPathLogin = request.nextUrl.pathname === '/login';

  // 1. KUNG walang session at pilit pumasok sa Admin Panel
  if (isPathAdmin && !adminSession) {
    return NextResponse.redirect(new URL('/login', request.url));
  }

  // 2. KUNG naka-login na (may session) pero bumalik sa Login page
  if (isPathLogin && adminSession) {
    return NextResponse.redirect(new URL('/admin-panel', request.url));
  }

  return NextResponse.next();
}

// Config: Saan lang gagana ang middleware
export const config = {
  matcher: ['/admin-panel/:path*', '/login'],
};