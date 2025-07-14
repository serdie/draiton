
import {
  getTokens,
  setTokens,
} from 'next-firebase-auth-edge/lib/next/tokens';
import { NextRequest, NextResponse } from 'next/server';
import { authConfig } from '@/config/auth-config';

export async function sessionLogin(request: NextRequest) {
  const { idToken } = await request.json();

  if (!idToken) {
    return NextResponse.json({ error: 'ID token is required' }, { status: 400 });
  }

  const response = new NextResponse();

  // The client SDK does not return a refresh token.
  // We don't need to worry about the refresh token since we are using session cookies.
  // The session cookie will be refreshed automatically by the middleware.
  await setTokens(response.cookies, {
    idToken,
    refreshToken: '', 
    ...authConfig
  });

  return response;
}

export async function sessionLogout(request: NextRequest) {
  const tokens = await getTokens(request.cookies, {
    ...authConfig,
    cookieName: authConfig.cookieName,
    cookieSignatureKeys: authConfig.cookieSignatureKeys,
  });

  if (!tokens) {
    return NextResponse.json({}, { status: 200 });
  }

  const response = new NextResponse();
  
  response.cookies.set({
    name: authConfig.cookieName,
    value: '',
    expires: new Date(0),
    httpOnly: true,
    path: '/',
    secure: process.env.USE_SECURE_COOKIES === 'true',
    sameSite: 'lax',
  });

  return response;
}
