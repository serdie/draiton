
'use server';

import { doc, updateDoc } from "firebase/firestore";
import { db } from "./config";


export type CompanySettings = {
    name?: string;
    cif?: string;
    address?: string;
    brandColor?: string;
}

export type UserProfileData = {
    displayName?: string;
    photoURL?: string;
}

export async function updateUserProfile(userId: string, data: UserProfileData) {
    if (!db) {
        throw new Error("La base de datos no está inicializada.");
    }
    if (!userId) {
        throw new Error("Se requiere el ID de usuario.");
    }

    const userDocRef = doc(db, 'users', userId);
    await updateDoc(userDocRef, data);
}
