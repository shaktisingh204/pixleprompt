
import {NextResponse} from 'next/server';
import type {NextRequest} from 'next/server';
import {getSessionCookie} from '@/lib/auth';

export async function middleware(request: NextRequest) {
  const sessionCookie = await getSessionCookie();
  const {pathname} = request.nextUrl;

  const isAdminRoute = pathname.startsWith('/admin') && pathname !== '/admin/login';

  // If user is not authenticated and is trying to access an admin route, redirect to admin login
  if (!sessionCookie && isAdminRoute) {
    return NextResponse.redirect(new URL('/admin/login', request.url));
  }

  // If user has a session and tries to access admin login, redirect to admin dashboard
  if (sessionCookie && pathname === '/admin/login') {
    return NextResponse.redirect(new URL('/admin', request.url));
  }

  // The /submit-prompt route is protected and only accessible by admins.
  if (!sessionCookie && pathname.startsWith('/submit-prompt')) {
    return NextResponse.redirect(new URL('/admin/login', request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: ['/((?!api|_next/static|_next/image|favicon.ico).*)'],
};
