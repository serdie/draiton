
'use server';

import { getFirebaseAuth } from './firebase-admin';
import { cookies } from 'next/headers';

export async function setSessionCookie(idToken: string) {
    const { auth } = getFirebaseAuth();

    // El token dura 14 días.
    const expiresIn = 60 * 60 * 24 * 14 * 1000;
    const sessionCookie = await auth.createSessionCookie(idToken, { expiresIn });

    const cookieStore = await cookies();
    cookieStore.get('session');
    
    cookieStore.set('session', sessionCookie, {
        maxAge: expiresIn,
        httpOnly: true,
        secure: true,
        path: '/',
        sameSite: 'strict',
    });
}


export async function clearSessionCookie() {
    const cookieStore = await cookies(); 
    cookieStore.get('session');
    cookieStore.delete('session');
}

export async function deleteCurrentUserAction(): Promise<{ success: boolean; error?: string }> {
    try {
        const { auth, db } = getFirebaseAuth();
        const sessionCookie = cookies().get('session')?.value;

        if (!sessionCookie) {
            return { success: false, error: 'No se encontró la sesión de usuario. Por favor, inicia sesión de nuevo.' };
        }

        const decodedToken = await auth.verifySessionCookie(sessionCookie, true);
        const uid = decodedToken.uid;

        // 1. Eliminar el usuario de Firebase Authentication
        await auth.deleteUser(uid);

        // 2. Eliminar el documento de usuario en Firestore
        const userDocRef = db.collection('users').doc(uid);
        await userDocRef.delete();
        
        // Aquí podrías añadir la lógica para borrar otros datos asociados al usuario
        // como proyectos, facturas, etc. en una transacción o batch write.
        // Por simplicidad, por ahora solo borramos el documento principal del usuario.

        // 3. Limpiar la cookie de sesión del navegador
        clearSessionCookie();

        return { success: true };

    } catch (error: any) {
        console.error("Error al eliminar el usuario:", error);
        return { success: false, error: 'Ocurrió un error al intentar eliminar la cuenta. Por favor, inténtalo de nuevo.' };
    }
}
