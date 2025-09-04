
'use server';

import { getFirebaseAuth } from './firebase-admin';

type UserUpdateData = {
    displayName: string;
    email: string;
    role: 'free' | 'pro' | 'admin' | 'empresa' | 'employee';
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
export async function updateUserRole(uid: string, newRole: 'free' | 'pro' | 'admin' | 'empresa' | 'employee'): Promise<void> {
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


export async function createEmployeeUser(employeeData: {
  email: string;
  name: string;
  ownerId: string;
  position: string;
  nif: string;
  socialSecurityNumber: string;
  contractType: string;
  grossAnnualSalary: number;
}): Promise<{ uid: string; tempPassword?: string }> {
  const { auth, db } = getFirebaseAuth();

  // Generate a temporary password
  const tempPassword = Math.random().toString(36).slice(-8);

  // Create user in Firebase Auth
  const userRecord = await auth.createUser({
    email: employeeData.email,
    emailVerified: true,
    password: tempPassword,
    displayName: employeeData.name,
    disabled: false,
  });

  // Create user document in Firestore 'users' collection
  const userDocRef = db.collection('users').doc(userRecord.uid);
  await userDocRef.set({
    uid: userRecord.uid,
    displayName: employeeData.name,
    email: employeeData.email,
    role: 'employee',
    companyOwnerId: employeeData.ownerId, // Link to the 'empresa' user
    createdAt: admin.firestore.FieldValue.serverTimestamp(),
    providerData: [{ providerId: 'password' }],
  });

  // Create employee document in Firestore 'employees' collection
  const employeeDocRef = db.collection('employees').doc();
  await employeeDocRef.set({
    ...employeeData,
    userId: userRecord.uid, // Link back to the user auth record
    createdAt: admin.firestore.FieldValue.serverTimestamp(),
  });

  return { uid: userRecord.uid, tempPassword };
}
