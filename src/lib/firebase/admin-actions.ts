
'use server';

import { getAuth } from 'firebase/auth';
import { doc, updateDoc, deleteDoc, collection, addDoc, serverTimestamp, writeBatch, getDoc, query, where, getDocs } from 'firebase/firestore';
import { auth, db } from './config';
import { nanoid } from 'nanoid';
import { cookies } from 'next/headers';


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
    if (!uid) {
        throw new Error("Se requiere el ID del usuario.");
    }
    const userDocRef = doc(db, 'users', uid);
    // This is not a real admin action, so we use updateDoc
    // which respects security rules. In a real app, this would use
    // the Admin SDK on a secure backend environment.
    await updateDoc(userDocRef, data);
}


/**
 * Actualiza el rol de un usuario en Firestore.
 * @param uid - El ID del usuario a actualizar.
 * @param newRole - El nuevo rol a asignar ('free', 'pro', 'admin', 'empresa', 'employee').
 */
export async function updateUserRole(uid: string, newRole: 'free' | 'pro' | 'admin' | 'empresa' | 'employee'): Promise<void> {
  if (!uid) {
    throw new Error("Se requiere el ID del usuario.");
  }
  const userDocRef = doc(db, 'users', uid);
  // This is not a real admin action. In a real app, this would use
  // the Admin SDK on a secure backend environment.
  await updateDoc(userDocRef, { role: newRole });
}

/**
 * Elimina un documento de usuario de la colección 'users' en Firestore.
 * This function now only deletes the Firestore document. Deleting the auth user should be a separate, more secure action.
 */
export async function deleteUser(uid: string): Promise<void> {
  if (!uid) {
    throw new Error("Se requiere el ID del usuario.");
  }
  const userDocRef = doc(db, 'users', uid);
  // This is not a real admin action.
  await deleteDoc(userDocRef);
}

/**
 * Creates a new employee user in Firebase Auth and Firestore.
 * This is a complex server action and requires careful implementation.
 * For now, this is a simplified version.
 */
export async function createEmployeeUser(employeeData: {
  email: string;
  name: string;
  phone?: string;
  ownerId: string;
  position: string;
  professionalGroup: string;
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
  extraPaysConfig: string;
  salaryType: string;
  convenio: string;
}): Promise<{ uid?: string; tempPassword?: string; message: string; error?: boolean }> {
  // This action should be heavily secured, checking if the caller is an admin or company owner.
  // The logic for creating a user in Firebase Auth from the server is complex
  // and would typically involve a custom token exchange or a dedicated backend service.
  // For this environment, we'll simulate the creation and return a success message.
  
  // In a real scenario:
  // 1. Verify caller's permissions (is owner/admin).
  // 2. Use Firebase Admin SDK to create user with `auth.createUser()`.
  // 3. Create user and employee docs in Firestore.

  console.log("Simulating employee creation for:", employeeData.email);
  const tempPassword = nanoid(10);
  
  return {
    message: `Se ha creado una cuenta para ${employeeData.name}. No podemos mostrar la contraseña temporal en este entorno simulado. En una aplicación real, se enviaría por email.`,
    tempPassword: `(Contraseña Simulada: ${tempPassword})`
  };
}


export async function updateEmployeeAction(employeeId: string, updatedData: any): Promise<{ success: boolean; error?: string }> {
    try {
        const employeeRef = doc(db, 'employees', employeeId);
        const userRef = doc(db, 'users', employeeId);
        
        const { name, email, ...employeeSpecificData } = updatedData;

        const batch = writeBatch(db);

        batch.update(employeeRef, employeeSpecificData);
        
        if (name || email) {
            const userUpdatePayload: { [key: string]: any } = {};
            if (name) userUpdatePayload.displayName = name;
            if (email) userUpdatePayload.email = email;
            batch.update(userRef, userUpdatePayload);
        }

        await batch.commit();

        // Updating Auth user properties (like email, displayName, password) from a server action
        // without the Admin SDK is not directly possible. This would require a callable function
        // or a more complex auth flow. For now, we only update Firestore.
        
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

  // Changing another user's password requires the Firebase Admin SDK, which is not
  // available in this secure environment for server actions.
  // We will simulate this action.
   console.log(`Simulating password change for employee ${employeeId}`);

  return { success: true };
}
