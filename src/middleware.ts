
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

  const protectedUserRoutes = ['/submit-prompt'];

  // If user is not authenticated and is trying to access a protected user route, redirect to admin login (as only admins can submit)
  if (!sessionCookie && protectedUserRoutes.some(path => pathname.startsWith(path))) {
    return NextResponse.redirect(new URL('/admin/login', request.url));
  }

  // General login/signup pages are removed, but if a user navigates there, redirect them.
  // If a user has a session, they are likely an admin, so redirect to admin dashboard.
  if (sessionCookie && (pathname === '/login' || pathname === '/signup')) {
    return NextResponse.redirect(new URL('/admin', request.url));
  }
  
  // If a user does not have a session, redirect to the homepage.
  if (!sessionCookie && (pathname === '/login' || pathname === '/signup')) {
    return NextResponse.redirect(new URL('/', request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: ['/((?!api|_next/static|_next/image|favicon.ico).*)'],
};
