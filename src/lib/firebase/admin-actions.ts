
'use server';

import { getFirebaseAuth } from './firebase-admin';

type UserUpdateData = {
    displayName: string;
    email: string;
    role: 'free' | 'pro' | 'admin' | 'empresa';
}

/**
 * Actualiza los datos de un usuario en Firestore.
 * @param uid - El ID del usuario a actualizar.
 * @param data - Los nuevos datos del usuario.
 */
export async function updateUser(uid: string, data: UserUpdateData): Promise<void> {
    const { db } = getFirebaseAuth();
    if (!uid) {
        throw new Error("Se requiere el ID del usuario.");
    }
    const userDocRef = db.collection('users').doc(uid);
    await userDocRef.update(data);
}


/**
 * Actualiza el rol de un usuario en Firestore.
 * @param uid - El ID del usuario a actualizar.
 * @param newRole - El nuevo rol a asignar ('free', 'pro', 'admin', 'empresa').
 */
export async function updateUserRole(uid: string, newRole: 'free' | 'pro' | 'admin' | 'empresa'): Promise<void> {
  const { db } = getFirebaseAuth();
  if (!uid) {
    throw new Error("Se requiere el ID del usuario.");
  }
  const userDocRef = db.collection('users').doc(uid);
  await userDocRef.update({ role: newRole });
}

/**
 * Elimina un documento de usuario de la colección 'users' en Firestore.
 * @param uid - El ID del usuario a eliminar.
 */
export async function deleteUser(uid: string): Promise<void> {
  const { db } = getFirebaseAuth();
  if (!uid) {
    throw new Error("Se requiere el ID del usuario.");
  }
  const userDocRef = db.collection('users').doc(uid);
  await userDocRef.delete();
}

/**
 * Elimina un usuario del servicio de Autenticación de Firebase.
 * ¡CUIDADO! Esta acción es destructiva e irreversible.
 * @param uid - El ID del usuario a eliminar.
 */
export async function deleteAuthUser(uid: string): Promise<void> {
    const { auth } = getFirebaseAuth();
     if (!uid) {
        throw new Error("Se requiere el ID del usuario.");
    }
    await auth.deleteUser(uid);
}
