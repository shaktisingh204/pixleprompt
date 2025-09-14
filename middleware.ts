import {NextResponse} from 'next/server';
import type {NextRequest} from 'next/server';
import {getSession} from '@/lib/auth';

export async function middleware(request: NextRequest) {
  const session = await getSession();
  const {pathname} = request.nextUrl;

  // If user is not authenticated and is trying to access a protected route, redirect to login
  if (!session && pathname !== '/login' && pathname !== '/signup') {
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
