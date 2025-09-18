
import {NextResponse} from 'next/server';
import type {NextRequest} from 'next/server';
import {getSessionCookie} from '@/lib/auth';

export async function middleware(request: NextRequest) {
  const sessionCookie = await getSessionCookie();
  const {pathname} = request.nextUrl;

  const adminRoutes = ['/admin'];
  const isAdminRoute = adminRoutes.some(path => pathname.startsWith(path) && path !== '/admin/login');
  
  // If user is not authenticated and is trying to access an admin route, redirect to admin login
  if (!sessionCookie && isAdminRoute) {
    return NextResponse.redirect(new URL('/admin/login', request.url));
  }

  // If user has a session and tries to access admin login, redirect to admin dashboard
  if (sessionCookie && pathname === '/admin/login') {
    return NextResponse.redirect(new URL('/admin', request.url));
  }

  const protectedUserRoutes = ['/submit-prompt'];

  // If user is not authenticated and is trying to access a protected user route, redirect to general login
  if (!sessionCookie && protectedUserRoutes.some(path => pathname.startsWith(path))) {
    return NextResponse.redirect(new URL('/login', request.url));
  }

  // If user is authenticated and is trying to access login or signup, redirect to home
  if (sessionCookie && (pathname === '/login' || pathname === '/signup')) {
    return NextResponse.redirect(new URL('/', request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: ['/((?!api|_next/static|_next/image|favicon.ico).*)'],
};
