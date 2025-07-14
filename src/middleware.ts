
import { NextResponse, type NextRequest } from 'next/server'
import { getFirebaseAuth } from '@/lib/firebase/firebase-admin';

const PUBLIC_PATHS = ['/register', '/login', '/', '/#features', '/#pricing', '/politica-de-privacidad', '/politica-de-cookies', '/aviso-legal', '/condiciones-de-uso'];
const COOKIE_NAME = 'session';

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  if (PUBLIC_PATHS.some(path => pathname === path) || pathname.startsWith('/_next/')) {
    return NextResponse.next();
  }

  const sessionCookie = request.cookies.get(COOKIE_NAME)?.value;

  if (!sessionCookie) {
    console.log('No session cookie found, redirecting to login.');
    return NextResponse.redirect(new URL('/login', request.url));
  }

  try {
    const { auth } = getFirebaseAuth();
    await auth.verifySessionCookie(sessionCookie, true);
    return NextResponse.next();
  } catch (error) {
    console.log('Invalid session cookie, redirecting to login.', error);
    const response = NextResponse.redirect(new URL('/login', request.url));
    response.cookies.delete(COOKIE_NAME); // Clean up invalid cookie
    return response;
  }
}

export const config = {
  matcher: ['/((?!_next/static|favicon.ico|api/).*)'],
};
