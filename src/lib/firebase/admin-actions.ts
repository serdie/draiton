
'use server';

import { doc, updateDoc, deleteDoc } from 'firebase/firestore';
import { db } from './config';

// Asegúrate de tener reglas de seguridad en Firestore que solo permitan a los administradores ejecutar estas acciones.
// Por ejemplo: `allow write: if get(/databases/$(database)/documents/users/$(request.auth.uid)).data.role == 'admin';`

type UserUpdateData = {
    displayName: string;
    email: string;
    role: 'free' | 'pro' | 'admin';
}

/**
 * Actualiza los datos de un usuario en Firestore.
 * @param uid - El ID del usuario a actualizar.
 * @param data - Los nuevos datos del usuario.
 */
export async function updateUser(uid: string, data: UserUpdateData): Promise<void> {
    if (!db) {
        throw new Error("Firestore no está inicializado.");
    }
    if (!uid) {
        throw new Error("Se requiere el ID del usuario.");
    }
    const userDocRef = doc(db, 'users', uid);
    // The data object from the form already has the correct shape.
    await updateDoc(userDocRef, data);
}


/**
 * Actualiza el rol de un usuario en Firestore.
 * @param uid - El ID del usuario a actualizar.
 * @param newRole - El nuevo rol a asignar ('free', 'pro', 'admin').
 */
export async function updateUserRole(uid: string, newRole: 'free' | 'pro' | 'admin'): Promise<void> {
  if (!db) {
    throw new Error("Firestore no está inicializado.");
  }
  if (!uid) {
    throw new Error("Se requiere el ID del usuario.");
  }
  const userDocRef = doc(db, 'users', uid);
  await updateDoc(userDocRef, { role: newRole });
}

/**
 * Elimina un documento de usuario de la colección 'users' en Firestore.
 * @param uid - El ID del usuario a eliminar.
 */
export async function deleteUser(uid: string): Promise<void> {
  if (!db) {
    throw new Error("Firestore no está inicializado.");
  }
  if (!uid) {
    throw new Error("Se requiere el ID del usuario.");
  }
  const userDocRef = doc(db, 'users', uid);
  await deleteDoc(userDocRef);
}
