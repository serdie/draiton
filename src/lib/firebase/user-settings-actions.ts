
'use server';

import { doc, updateDoc } from "firebase/firestore";
import { db } from "./config";


export type Address = {
    addressLine1?: string;
    addressLine2?: string;
    city?: string;
    province?: string;
    postalCode?: string;
    country?: string;
};

export type CompanySettings = {
    name?: string;
    cif?: string;
    address?: Address;
    brandColor?: string;
    iban?: string;
    logoUrl?: string;
    terminos?: string;
    phone?: string;
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
