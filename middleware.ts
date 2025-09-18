import {NextResponse} from 'next/server';
import type {NextRequest} from 'next/server';
import {getSession} from '@/lib/auth';

export async function middleware(request: NextRequest) {
  const session = await getSession();
  const {pathname} = request.nextUrl;

  const adminRoutes = ['/admin'];
  const isAdminRoute = adminRoutes.some(path => pathname.startsWith(path) && path !== '/admin/login');
  
  // If user is not authenticated and is trying to access an admin route, redirect to admin login
  if (!session && isAdminRoute) {
    return NextResponse.redirect(new URL('/admin/login', request.url));
  }

  // If user is authenticated as non-admin and tries to access admin route, redirect to home
  if (session && isAdminRoute && session.role !== 'admin') {
    return NextResponse.redirect(new URL('/', request.url));
  }

  // If user is authenticated as admin and tries to access admin login, redirect to admin dashboard
  if (session && session.role === 'admin' && pathname === '/admin/login') {
    return NextResponse.redirect(new URL('/admin', request.url));
  }

  const protectedUserRoutes = ['/submit-prompt'];

  // If user is not authenticated and is trying to access a protected user route, redirect to general login
  if (!session && protectedUserRoutes.some(path => pathname.startsWith(path))) {
    return NextResponse.redirect(new URL('/login', request.url));
  }

  // If user is authenticated and is trying to access login or signup, redirect to home
  if (session && (pathname === '/login' || pathname === '/signup')) {
    return NextResponse.redirect(new URL('/', request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: ['/((?!api|_next/static|_next/image|favicon.ico).*)'],
};
