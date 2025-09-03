
'use server';

import { storage } from './config';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';

export async function uploadAvatar(userId: string, file: File): Promise<string> {
    if (!storage) {
        throw new Error("El servicio de almacenamiento no está inicializado.");
    }
    if (!userId) {
        throw new Error("Se requiere el ID de usuario.");
    }
    if (!file) {
        throw new Error("No se ha proporcionado ningún archivo.");
    }

    const filePath = `avatars/${userId}/${file.name}`;
    const storageRef = ref(storage, filePath);

    await uploadBytes(storageRef, file);
    const downloadURL = await getDownloadURL(storageRef);

    return downloadURL;
}
