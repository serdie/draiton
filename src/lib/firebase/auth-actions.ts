
'use server';

import { getFirebaseAuth } from './firebase-admin';
import { cookies } from 'next/headers';

export async function setSessionCookie(idToken: string) {
    const { auth } = getFirebaseAuth();

    // El token dura 14 días.
    const expiresIn = 60 * 60 * 24 * 14 * 1000;
    const sessionCookie = await auth.createSessionCookie(idToken, { expiresIn });

    const cookieStore = cookies();
    cookieStore.set('session', sessionCookie, {
        maxAge: expiresIn,
        httpOnly: true,
        secure: true,
        path: '/',
        sameSite: 'strict',
    });
}


export async function clearSessionCookie() {
  const cookieStore = cookies();
  cookieStore.delete('session');
}
