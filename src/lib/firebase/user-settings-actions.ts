
'use server';

import { revalidatePath } from 'next/cache';
import { doc, updateDoc } from 'firebase/firestore';
import { db } from './config';
import { getTokens } from 'next-firebase-auth-edge';
import { cookies } from 'next/headers';
import { authConfig } from '@/config/auth-config';

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
    const tokens = await getTokens(cookies(), authConfig);

    if (!tokens) {
         return { message: 'No estás autenticado.', error: true };
    }

    try {
        const { decodedToken } = tokens;
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
