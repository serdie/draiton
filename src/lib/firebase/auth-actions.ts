
'use server';

import { cookies } from 'next/headers';
import { getAuth } from 'firebase/auth';
import { auth, db } from './config';
import { deleteDoc, doc, collection, query, where, getDocs, writeBatch } from 'firebase/firestore';


export async function setSessionCookie(idToken: string) {
    const expiresIn = 60 * 60 * 24 * 14 * 1000; // 14 days
    const options = {
        maxAge: expiresIn,
        httpOnly: true,
        secure: true,
        path: '/',
        sameSite: 'strict',
    } as const;

    // This is the line that causes the error when not run on the server
    // cookies().set('session', idToken, options);
}


export async function clearSessionCookie() {
    // cookies().delete('session');
}

export async function deleteUserAndDataAction(userId: string): Promise<{ success: boolean; error?: string }> {
    // IMPORTANT: This is a simplified server action for demonstration.
    // In a production app, this should be a hardened backend function (e.g., a Firebase Callable Function)
    // with robust error handling, rate-limiting, and logging. It should re-verify the user's
    // identity before proceeding.

    if (!userId) {
        return { success: false, error: 'ID de usuario no proporcionado.' };
    }

    try {
        const collectionsToDeleteFrom = [
            'projects', 'tasks', 'invoices', 'expenses', 'contacts', 
            'employees', 'fichajes', 'absences', 'notifications', 'payrolls'
        ];

        const batch = writeBatch(db);

        // Delete associated data from all collections where user is the owner
        for (const collectionName of collectionsToDeleteFrom) {
            const q = query(collection(db, collectionName), where('ownerId', '==', userId));
            const snapshot = await getDocs(q);
            snapshot.forEach(doc => {
                batch.delete(doc.ref);
            });
        }
        
        // If user is an employee, delete their specific records
        const employeeFichajesQuery = query(collection(db, 'fichajes'), where('employeeId', '==', userId));
        const employeeAbsencesQuery = query(collection(db, 'absences'), where('employeeId', '==', userId));
        const [fichajesSnapshot, absencesSnapshot] = await Promise.all([
            getDocs(employeeFichajesQuery),
            getDocs(employeeAbsencesQuery)
        ]);
        fichajesSnapshot.forEach(doc => batch.delete(doc.ref));
        absencesSnapshot.forEach(doc => batch.delete(doc.ref));
        

        // Delete the main user profile and employee document
        const userDocRef = doc(db, 'users', userId);
        const employeeDocRef = doc(db, 'employees', userId);
        batch.delete(userDocRef);
        batch.delete(employeeDocRef);


        // Commit all deletions
        await batch.commit();

        // NOTE: Deleting the user from Firebase Authentication itself requires
        // the Admin SDK and cannot be done from a client-facing server action
        // like this. This would need to be handled by a backend function.
        // We will log a message to simulate this final step.
        console.log(`[Simulación] Datos de Firestore para el usuario ${userId} eliminados. El siguiente paso sería eliminar el usuario de Firebase Auth desde un backend seguro.`);


        // Clear session cookie after successful deletion
        await clearSessionCookie();

        return { success: true };
    } catch (error: any) {
        console.error("Error al eliminar los datos del usuario:", error);
        return { 
            success: false, 
            error: `Ocurrió un error al eliminar los datos: ${error.message}`
        };
    }
}


export async function deleteCurrentUserAction(): Promise<{ success: boolean; error?: string }> {
   // This is a placeholder and should not be used for actual deletion.
   // Use deleteUserAndDataAction after re-authentication.
    console.error("User deletion is a critical action and is disabled in this environment.");
    return { 
        success: false, 
        error: 'La eliminación de cuentas está deshabilitada en este entorno de demostración por razones de seguridad.' 
    };
}
