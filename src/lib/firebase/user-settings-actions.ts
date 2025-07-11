
'use server';

import { revalidatePath } from 'next/cache';
import { doc, updateDoc } from 'firebase/firestore';
import { auth, db } from './config';
import { getAuth } from 'firebase-admin/auth';
import { adminApp } from './admin-config';

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
    const { session } = auth; // This gets the session cookie on the server.
    if (!session) {
        return { message: 'No estás autenticado.', error: true };
    }

    try {
        const decodedToken = await getAuth(adminApp).verifySessionCookie(session);
        const uid = decodedToken.uid;
        
        const companyData: CompanySettings = {
            name: formData.get('companyName') as string,
            cif: formData.get('companyCif') as string,
            address: formData.get('companyAddress') as string,
            brandColor: formData.get('brandColor') as string,
        };

        const userDocRef = doc(db, 'users', uid);
        await updateDoc(userDocRef, {
            company: companyData,
        });
        
        revalidatePath('/dashboard/configuracion', 'page');
        return { message: 'Los detalles de tu empresa han sido actualizados.', error: false };

    } catch (e: any) {
        console.error("Error updating company settings:", e);
        return { message: 'Ocurrió un error al guardar la configuración.', error: true };
    }
}
