

'use server';

import admin from 'firebase-admin';
import { getFirebaseAuth } from './firebase-admin';
import { nanoid } from 'nanoid';

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
  phone?: string;
  ownerId: string; // The company owner's UID
  position: string;
  nif: string;
  socialSecurityNumber: string;
  contractType: string;
  workModality: string;
  weeklyHours: number;
  annualHours: number;
  vacationDays: number;
  grossAnnualSalary: number;
  hireDate?: Date;
  paymentFrequency: string;
  proratedExtraPays: boolean;
  salaryType: string;
  convenio: string;
  companyOwnerId?: string; // For admin simulation
}): Promise<{ uid: string; tempPassword?: string; message: string }> {
  const { auth, db } = getFirebaseAuth();
  
  let userRecord;
  let tempPassword;
  let message;

  try {
    userRecord = await auth.getUserByEmail(employeeData.email);
    message = `El usuario ${userRecord.displayName} ya existía y ha sido vinculado a tu empresa.`;
  } catch (error: any) {
    if (error.code === 'auth/user-not-found') {
      tempPassword = Math.random().toString(36).slice(-8);
      userRecord = await auth.createUser({
        email: employeeData.email,
        emailVerified: true,
        password: tempPassword,
        displayName: employeeData.name,
        photoURL: '', // Provide a default or leave empty
      });
      message = `Se ha creado un usuario para ${employeeData.name}.`;
    } else {
      throw error;
    }
  }

  const userDocRef = db.collection('users').doc(userRecord.uid);
  await userDocRef.set({
      uid: userRecord.uid,
      displayName: employeeData.name,
      email: employeeData.email,
      role: 'employee',
      companyOwnerId: employeeData.companyOwnerId || employeeData.ownerId, 
      createdAt: admin.firestore.FieldValue.serverTimestamp(),
      providerData: [{ providerId: 'password' }],
  }, { merge: true });

  const employeeDocRef = db.collection('employees').doc(userRecord.uid); 
  await employeeDocRef.set({
    ...employeeData,
    userId: userRecord.uid,
    createdAt: admin.firestore.FieldValue.serverTimestamp(),
    employeePortalActive: false,
    employeePortalId: nanoid(12),
  }, { merge: true });

  return { uid: userRecord.uid, tempPassword, message };
}


export async function updateEmployeeAction(employeeId: string, updatedData: any): Promise<{ success: boolean; error?: string }> {
    const { db, auth } = getFirebaseAuth();

    try {
        const employeeRef = db.collection('employees').doc(employeeId);
        const userRef = db.collection('users').doc(employeeId);
        
        // El objeto de datos que llega puede tener `email` y `name` en el nivel superior,
        // que deben ir al documento de usuario, no al de empleado.
        const { name, email, ...employeeSpecificData } = updatedData;

        const batch = db.batch();

        // Actualizar el documento del empleado
        batch.update(employeeRef, employeeSpecificData);
        
        // Actualizar el documento de usuario
        if (name || email) {
            const userUpdatePayload: { [key: string]: any } = {};
            if (name) userUpdatePayload.displayName = name;
            if (email) userUpdatePayload.email = email;
            batch.update(userRef, userUpdatePayload);
        }

        await batch.commit();
        
        // Actualizar el usuario en Firebase Authentication también si el email cambió
        if (email) {
            await auth.updateUser(employeeId, { email });
        }
         if (name) {
            await auth.updateUser(employeeId, { displayName: name });
        }

        return { success: true };

    } catch (error: any) {
        console.error("Error al actualizar empleado:", error);
        return { success: false, error: 'No se pudo actualizar el empleado en el servidor.' };
    }
}


export async function updateEmployeePasswordAction(employeeId: string, newPassword: string): Promise<{ success: boolean; error?: string }> {
  if (!employeeId || !newPassword) {
    return { success: false, error: 'Se requiere el ID del empleado y la nueva contraseña.' };
  }

  const { auth } = getFirebaseAuth();

  try {
    await auth.updateUser(employeeId, {
      password: newPassword,
    });
    return { success: true };
  } catch (error: any) {
    console.error("Error updating employee password:", error);
    if (error.code === 'auth/user-not-found') {
        return { success: false, error: 'El empleado no existe en el sistema de autenticación.' };
    }
    return { success: false, error: 'No se pudo actualizar la contraseña.' };
  }
}

    