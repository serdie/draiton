
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
        const user = auth.currentUser;
        
        if (!user) {
            throw new Error('Usuario no autenticado.');
        }

        const batch = db.batch();
        const contactsRef = db.collection('contacts');
        
        contacts.forEach(contact => {
            const newContactRef = contactsRef.doc();
            batch.set(newContactRef, {
                ownerId: user.uid,
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
