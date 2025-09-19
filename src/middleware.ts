
import {NextResponse} from 'next/server';
import type {NextRequest} from 'next/server';
import {getSessionCookie} from '@/lib/auth';

export async function middleware(request: NextRequest) {
  const {pathname} = request.nextUrl;

  // Public pages that don't require any checks
  if (
    !pathname.startsWith('/admin') ||
    pathname === '/admin/login'
  ) {
    return NextResponse.next();
  }
  
  // Check for session cookie on admin routes
  const session = await getSessionCookie();

  if (!session) {
    // Redirect to login if no session
    return NextResponse.redirect(new URL('/admin/login', request.url));
  }
  
  return NextResponse.next();
}

export const config = {
  matcher: ['/((?!api|_next/static|_next/image|favicon.ico).*)'],
};
