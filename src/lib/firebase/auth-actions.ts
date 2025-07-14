
'use server';

import { cookies } from 'next/headers';
import { getFirebaseAuth } from './firebase-admin';

const COOKIE_NAME = 'session';
// 7 days
const expiresIn = 60 * 60 * 24 * 7 * 1000;

export async function sessionLogin(idToken: string) {
  const { auth } = getFirebaseAuth();
  try {
    const sessionCookie = await auth.createSessionCookie(idToken, { expiresIn });
    cookies().set(COOKIE_NAME, sessionCookie, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      maxAge: expiresIn,
      path: '/',
    });
    return { success: true };
  } catch (error) {
    console.error('Session login error:', error);
    return { success: false, error: 'Failed to create session.' };
  }
}

export async function sessionLogout() {
  cookies().delete(COOKIE_NAME);
}
