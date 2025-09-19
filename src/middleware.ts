
import {NextResponse} from 'next/server';
import type {NextRequest} from 'next/server';

export async function middleware(request: NextRequest) {
  const {pathname} = request.nextUrl;

  // Since login is removed, we only need to handle the case where
  // someone might try to navigate to a non-existent login page.
  // We will redirect them to the home page.
  if (pathname.startsWith('/admin/login') || pathname.startsWith('/login') || pathname.startsWith('/signup')) {
      return NextResponse.redirect(new URL('/', request.url));
  }
  
  if(pathname === '/submit-prompt') {
    return NextResponse.redirect(new URL('/admin', request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: ['/((?!api|_next/static|_next/image|favicon.ico).*)'],
};
