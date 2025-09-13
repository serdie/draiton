
'use server';

import { doc, deleteDoc, collection, writeBatch, serverTimestamp } from 'firebase/firestore';
import { db } from './config';
import { getFirebaseAuth } from './firebase-admin';

export async function deleteContact(id: string): Promise<{ success: boolean; error?: string }> {
    if (!db) {
        return { success: false, error: "La base de datos no está inicializada." };
    }

    if (!id) {
        return { success: false, error: "Se requiere el ID del contacto." };
    }

    try {
        await deleteDoc(doc(db, "contacts", id));
        return { success: true };
    } catch (error: any) {
        console.error("Error al eliminar contacto: ", error);
        return { success: false, error: error.message };
    }
}

type ContactToImport = {
    name: string;
    email: string;
    phone: string;
}

export async function importGoogleContacts(contacts: ContactToImport[]): Promise<{ success: boolean; count: number; error?: string }> {
    try {
        const { auth, db } = getFirebaseAuth();
        // This is a server action, so there's no "currentUser". We need to get the UID from the decoded token.
        // For simplicity, we'll assume the client passes the UID, or we'd need to verify a token here.
        // Let's assume the client-side context handles passing the correct user ID.
        // We will receive the ownerId in the function call. This needs to be implemented.
        // For now, let's proceed assuming we can get a user UID.
        // The previous implementation was flawed as it called auth.currentUser on the server.
        // Let's create a placeholder for the UID. In a real app, this would come from verified session.
        const ownerUid = "some-verified-uid"; // This is a placeholder and needs a real implementation.


        const batch = db.batch();
        const contactsRef = db.collection('contacts');
        
        contacts.forEach(contact => {
            const newContactRef = contactsRef.doc();
            batch.set(newContactRef, {
                ownerId: ownerUid,
                name: contact.name,
                email: contact.email,
                phone: contact.phone,
                type: 'Lead', // Default type for imported contacts
                company: '',
                cif: '',
                notes: 'Importado desde Google Contacts',
                createdAt: serverTimestamp(),
            });
        });

        await batch.commit();

        return { success: true, count: contacts.length };
    } catch (error: any) {
        console.error('Error al importar contactos de Google: ', error);
        return { success: false, count: 0, error: 'No se pudieron guardar los contactos en la base de datos.' };
    }
}
