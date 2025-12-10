
'use server';

import { cookies } from 'next/headers';
import { getAuth } from 'firebase/auth';
import { auth, db } from './config';
import { deleteDoc, doc } from 'firebase/firestore';


export async function setSessionCookie(idToken: string) {
    const expiresIn = 60 * 60 * 24 * 14 * 1000; // 14 days
    const options = {
        maxAge: expiresIn,
        httpOnly: true,
        secure: true,
        path: '/',
        sameSite: 'strict',
    } as const;

    cookies().set('session', idToken, options);
}


export async function clearSessionCookie() {
    cookies().delete('session');
}

export async function deleteCurrentUserAction(): Promise<{ success: boolean; error?: string }> {
   // IMPORTANT: Deleting users requires elevated privileges not available in this environment's
   // server actions. This is a placeholder for a real implementation using a backend service
   // with the Firebase Admin SDK.
    console.error("User deletion is a critical action and is disabled in this environment.");
    return { 
        success: false, 
        error: 'La eliminación de cuentas está deshabilitada en este entorno de demostración por razones de seguridad.' 
    };
}
