
import { NextResponse, type NextRequest } from 'next/server'

const PUBLIC_PATHS = ['/register', '/login', '/', '/#features', '/#pricing', '/politica-de-privacidad', '/politica-de-cookies', '/aviso-legal', '/condiciones-de-uso'];
const COOKIE_NAME = 'session';

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Allow access to public paths and Next.js internal files
  if (PUBLIC_PATHS.some(path => pathname === path || pathname.startsWith(path + '/')) || pathname.startsWith('/_next/')) {
    return NextResponse.next();
  }

  // Get the session cookie
  const sessionCookie = request.cookies.get(COOKIE_NAME)?.value;

  // If there's no session cookie, redirect to the login page
  if (!sessionCookie) {
    const loginUrl = new URL('/login', request.url)
    loginUrl.searchParams.set('next', pathname);
    return NextResponse.redirect(loginUrl);
  }

  // If the cookie exists, let the request through.
  // The actual verification will happen client-side in the AuthContext
  // or on API routes/Server Actions that require strict authentication.
  return NextResponse.next();
}

export const config = {
  matcher: ['/((?!api|_next/static|_next/image|favicon.ico).*)'],
};
