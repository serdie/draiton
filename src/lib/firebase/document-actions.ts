
'use server';

import { doc, deleteDoc, updateDoc } from 'firebase/firestore';
import { db } from './config';
import type { Document } from '@/app/dashboard/documentos/page';

export async function deleteDocument(id: string): Promise<void> {
    if (!db) {
        throw new Error("La base de datos no está inicializada.");
    }
    if (!id) {
        throw new Error("Se requiere el ID del documento.");
    }
    const docRef = doc(db, "invoices", id);
    await deleteDoc(docRef);
}

export async function updateDocument(id: string, documentData: Partial<Omit<Document, 'id' | 'ownerId' | 'fechaCreacion'>>): Promise<void> {
    if (!db) {
        throw new Error("La base de datos no está inicializada.");
    }
    if (!id) {
        throw new Error("Se requiere el ID del documento para actualizar.");
    }
    const docRef = doc(db, "invoices", id);
    await updateDoc(docRef, documentData);
}
