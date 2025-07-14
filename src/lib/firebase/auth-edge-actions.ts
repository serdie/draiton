
'use server';

import {
  setTokens,
} from 'next-firebase-auth-edge/lib/next/tokens';
import { cookies } from 'next/headers';
import { authConfig } from '@/config/auth-config';

export async function sessionLogin(idToken: string) {
  if (!idToken) {
    throw new Error('ID token is required');
  }

  await setTokens(cookies(), {
    idToken,
    refreshToken: '', // The client SDK does not return a refresh token.
    ...authConfig
  });
}

export async function sessionLogout() {
  const cookieStore = cookies();
  const cookieName = authConfig.cookieName;

  if (cookieStore.get(cookieName)) {
    cookieStore.set({
      name: cookieName,
      value: '',
      expires: new Date(0),
      httpOnly: true,
      path: '/',
      secure: process.env.USE_SECURE_COOKIES === 'true',
      sameSite: 'lax',
    });
  }
}
