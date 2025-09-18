
import {NextResponse} from 'next/server';
import type {NextRequest} from 'next/server';
import {getSessionCookie} from '@/lib/auth';

export async function middleware(request: NextRequest) {
  const sessionCookie = await getSessionCookie();
  const {pathname} = request.nextUrl;

  const adminRoutes = ['/admin', '/submit-prompt'];
  const isAdminRoute = adminRoutes.some(path => pathname.startsWith(path));

  // If user is not authenticated (no cookie) and is trying to access an admin route, redirect to admin login
  if (!sessionCookie && isAdminRoute && pathname !== '/admin/login') {
    return NextResponse.redirect(new URL('/admin/login', request.url));
  }
  
  // If a user has a session cookie and tries to access a login page, redirect them.
  // The actual role-based redirect (e.g., admin to /admin, user to /) is handled
  // client-side in AppShell to avoid DB calls here.
  if (sessionCookie && (pathname === '/admin/login' || pathname === '/login' || pathname === '/signup')) {
      if (pathname === '/admin/login') {
          return NextResponse.redirect(new URL('/admin', request.url));
      }
      if (pathname === '/login' || pathname === '/signup') {
        return NextResponse.redirect(new URL('/', request.url));
      }
  }
  
  const protectedUserRoutes: string[] = [];

  // If user is not authenticated and is trying to access a protected user route, redirect to general login
  if (!sessionCookie && protectedUserRoutes.some(path => pathname.startsWith(path))) {
    return NextResponse.redirect(new URL('/login', request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: ['/((?!api|_next/static|_next/image|favicon.ico).*)'],
};
