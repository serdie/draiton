'use server';

import { getFirebaseAuth } from './firebase-admin';
import { cookies } from 'next/headers';

export async function setSessionCookie(idToken: string) {
    const { auth } = getFirebaseAuth();

    // El token dura 14 días.
    const expiresIn = 60 * 60 * 24 * 14 * 1000;
    const sessionCookie = await auth.createSessionCookie(idToken, { expiresIn });

    // --- CORRECCIÓN (con await) ---
    // 1. Obtenemos el almacén de cookies
    const cookieStore = await cookies(); 
    
    // 2. Leemos (para cumplir con Next.js)
    cookieStore.get('session');
    
    // 3. Escribimos en el almacén
    cookieStore.set('session', sessionCookie, {
        maxAge: expiresIn,
        httpOnly: true,
        secure: true,
        path: '/',
        sameSite: 'strict',
    });
}


export async function clearSessionCookie() {
    // --- CORRECCIÓN (con await) ---
    // 1. Obtenemos el almacén
    const cookieStore = await cookies(); 

    // 2. Leemos (para cumplir con Next.js)
    cookieStore.get('session');
    
    // 3. Borramos del almacén
    cookieStore.delete('session');
}