
'use server';

import { doc, deleteDoc, collection, writeBatch, serverTimestamp, getDocs, query, where } from 'firebase/firestore';
import { db, auth } from './config';
import { cookies } from 'next/headers';
import { type User } from 'firebase/auth';


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
    const currentUser = auth.currentUser;
    if (!currentUser) {
        return { success: false, count: 0, error: 'Usuario no autenticado.' };
    }
    const ownerUid = currentUser.uid;

    try {
        const batch = writeBatch(db);
        const contactsRef = collection(db, 'contacts');
        
        let importedCount = 0;
        for (const contact of contacts) {
            const q = query(contactsRef, where('ownerId', '==', ownerUid), where('email', '==', contact.email));
            const existingContactSnapshot = await getDocs(q);

            if (existingContactSnapshot.empty && contact.email) {
                const newContactRef = doc(contactsRef);
                batch.set(newContactRef, {
                    ownerId: ownerUid,
                    name: contact.name,
                    email: contact.email,
                    phone: contact.phone || '',
                    type: 'Lead', 
                    company: '',
                    cif: '',
                    notes: 'Importado desde Google Contacts',
                    createdAt: serverTimestamp(),
                });
                importedCount++;
            }
        }

        await batch.commit();
        return { success: true, count: importedCount };

    } catch (error: any) {
        console.error('Error al importar contactos de Google: ', error);
        return { success: false, count: 0, error: 'No se pudieron guardar los contactos en la base de datos.' };
    }
}


export async function getGoogleContacts(): Promise<{ contacts: any[] | null; error: string | null; }> {
    // This is a placeholder as getting the real access token on the server is complex
    // and requires a full OAuth2 flow with refresh tokens stored securely.
    // We will simulate this by returning mock data.
    const mockContacts = [
        { resourceName: 'people/c1', names: [{ displayName: 'Ana García (Google)' }], emailAddresses: [{ value: 'ana.garcia@example.com' }] },
        { resourceName: 'people/c2', names: [{ displayName: 'Carlos Martínez (Google)' }], emailAddresses: [{ value: 'carlos.martinez@example.com' }], phoneNumbers: [{ value: '+34 600 111 222' }] },
        { resourceName: 'people/c3', names: [{ displayName: 'Laura Sánchez (Google)' }], emailAddresses: [{ value: 'laura.sanchez@example.com' }] },
    ];
    return { contacts: mockContacts, error: null };
}


export async function importOutlookContacts(contacts: ContactToImport[]): Promise<{ success: boolean; count: number; error?: string }> {
     const currentUser = auth.currentUser;
    if (!currentUser) {
        return { success: false, count: 0, error: 'Usuario no autenticado.' };
    }
    const ownerUid = currentUser.uid;

    try {
        const batch = writeBatch(db);
        const contactsRef = collection(db, 'contacts');
        
        let importedCount = 0;
        for (const contact of contacts) {
            const q = query(contactsRef, where('ownerId', '==', ownerUid), where('email', '==', contact.email));
            const existingContactSnapshot = await getDocs(q);

            if (existingContactSnapshot.empty && contact.email) {
                const newContactRef = doc(contactsRef);
                batch.set(newContactRef, {
                    ownerId: ownerUid,
                    name: contact.name,
                    email: contact.email,
                    phone: contact.phone || '',
                    type: 'Lead',
                    company: '',
                    cif: '',
                    notes: 'Importado desde Outlook/Microsoft',
                    createdAt: serverTimestamp(),
                });
                importedCount++;
            }
        }
        await batch.commit();
        return { success: true, count: importedCount };
    } catch (error: any) {
        console.error('Error al importar contactos de Outlook: ', error);
        return { success: false, count: 0, error: 'No se pudieron guardar los contactos en la base de datos.' };
    }
}


export async function getOutlookContacts(): Promise<{ contacts: any[] | null; error: string | null; }> {
    // This is a placeholder for a real Microsoft Graph API call.
    const mockContacts = [
        { id: '1', displayName: 'Pedro Ramírez (Outlook)', emailAddresses: [{ address: 'pedro.ramirez@outlook.com' }], businessPhones: ['+34 600 333 444'] },
        { id: '2', displayName: 'Sofía Torres (Outlook)', emailAddresses: [{ address: 'sofia.torres@hotmail.com' }], businessPhones: [] },
    ];
    return { contacts: mockContacts, error: null };
}
