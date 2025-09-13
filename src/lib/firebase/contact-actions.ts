
'use server';

import { doc, deleteDoc, collection, writeBatch, serverTimestamp, getDocs, query, where } from 'firebase/firestore';
import { db } from './config';
import { getFirebaseAuth } from './firebase-admin';
import { cookies } from 'next/headers';

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
        const sessionCookie = cookies().get('session')?.value;
        if (!sessionCookie) {
             return { success: false, count: 0, error: 'Usuario no autenticado.' };
        }
        const decodedToken = await auth.verifySessionCookie(sessionCookie, true);
        const ownerUid = decodedToken.uid;


        const batch = db.batch();
        const contactsRef = db.collection('contacts');
        
        for (const contact of contacts) {
             // Evitar duplicados por email para el mismo usuario
            const q = query(contactsRef, where('ownerId', '==', ownerUid), where('email', '==', contact.email));
            const existingContact = await getDocs(q);

            if (existingContact.empty && contact.email) { // Solo importar si no existe y tiene email
                const newContactRef = contactsRef.doc();
                 batch.set(newContactRef, {
                    ownerId: ownerUid,
                    name: contact.name,
                    email: contact.email,
                    phone: contact.phone || '',
                    type: 'Lead', // Default type for imported contacts
                    company: '',
                    cif: '',
                    notes: 'Importado desde Google Contacts',
                    createdAt: serverTimestamp(),
                });
            }
        }

        await batch.commit();

        return { success: true, count: contacts.length };
    } catch (error: any) {
        console.error('Error al importar contactos de Google: ', error);
        return { success: false, count: 0, error: 'No se pudieron guardar los contactos en la base de datos.' };
    }
}
