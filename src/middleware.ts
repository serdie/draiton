
import { NextRequest, NextResponse } from 'next/server';
import {
  authMiddleware,
  redirectToLogin,
} from 'next-firebase-auth-edge';
import { authConfig } from './config/auth-config';

const PUBLIC_PATHS = ['/register', '/login', '/', '/#features', '/#pricing', '/politica-de-privacidad', '/politica-de-cookies', '/aviso-legal', '/condiciones-de-uso'];

export async function middleware(request: NextRequest) {
  if (PUBLIC_PATHS.includes(request.nextUrl.pathname) || request.nextUrl.pathname.startsWith('/_next/')) {
    return NextResponse.next();
  }
  
  return authMiddleware(request, {
    loginPath: '/api/auth',
    logoutPath: '/api/auth',
    apiKey: authConfig.apiKey,
    cookieName: authConfig.cookieName,
    cookieSignatureKeys: authConfig.cookieSignatureKeys,
    cookieSerializeOptions: authConfig.cookieSerializeOptions,
    serviceAccount: authConfig.serviceAccount,
    handleValidToken: async ({ token, decodedToken }, headers) => {
      // Authenticated user. You can fetch custom claims from your database.
      return NextResponse.next({
        request: {
          headers,
        },
      });
    },
    handleInvalidToken: async () => {
      return redirectToLogin(request, {
        path: '/login',
        publicPaths: ['/login'],
      });
    },
    handleError: async (error) => {
      console.error('Middleware auth error:', error);
      return redirectToLogin(request, {
        path: '/login',
        publicPaths: ['/login'],
      });
    },
  });
}


export const config = {
  matcher: ['/((?!_next/static|favicon.ico|api/auth).*)'],
};
