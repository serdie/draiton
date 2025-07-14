
'use server';

import { revalidatePath } from 'next/cache';
import { getFirebaseAuth } from './firebase-admin';
import { cookies } from 'next/headers';

export type CompanySettings = {
    name?: string;
    cif?: string;
    address?: string;
    brandColor?: string;
}

export async function updateCompanySettings(
    currentState: { message: string; error: boolean; },
    formData: FormData
): Promise<{ message: string; error: boolean; }> {
    const sessionCookie = cookies().get('session')?.value;
    if (!sessionCookie) {
        return { message: 'No estás autenticado.', error: true };
    }
    
    try {
        const { auth, db } = getFirebaseAuth();
        const decodedToken = await auth.verifySessionCookie(sessionCookie, true); // Check if revoked
        const uid = decodedToken.uid;
        
        const companyData: CompanySettings = {
            name: formData.get('companyName') as string,
            cif: formData.get('companyCif') as string,
            address: formData.get('companyAddress') as string,
            brandColor: formData.get('brandColor') as string,
        };

        const userDocRef = db.collection('users').doc(uid);
        await userDocRef.update({
            company: companyData,
        });
        
        revalidatePath('/dashboard/configuracion');
        return { message: 'Los detalles de tu empresa han sido actualizados.', error: false };

    } catch (e: any) {
        console.error("Error updating company settings:", e);
        if (e.code === 'auth/session-cookie-revoked' || e.code === 'auth/session-cookie-expired') {
            return { message: 'Tu sesión ha expirado. Por favor, inicia sesión de nuevo.', error: true };
        }
        return { message: 'Ocurrió un error al guardar la configuración.', error: true };
    }
}
