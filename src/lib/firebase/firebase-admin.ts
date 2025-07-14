// 'use server';

import admin from 'firebase-admin';
import { config } from 'dotenv';

// Cargar variables de entorno del archivo .env
config();

function formatPrivateKey(key: string) {
  if (!key) {
    return '';
  }
  return key.replace(/\\n/g, '\n');
}

export function getFirebaseAuth() {
  if (admin.apps.length > 0) {
    return {
      app: admin.app(),
      auth: admin.auth(),
      db: admin.firestore(),
    };
  }
  
  const privateKey = process.env.FIREBASE_PRIVATE_KEY;
  const clientEmail = process.env.FIREBASE_CLIENT_EMAIL;
  const projectId = process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID;

  if (!privateKey || !clientEmail || !projectId) {
    throw new Error('Las credenciales del servidor de Firebase (FIREBASE_PRIVATE_KEY, FIREBASE_CLIENT_EMAIL, NEXT_PUBLIC_FIREBASE_PROJECT_ID) no están configuradas en las variables de entorno.');
  }

  const app = admin.initializeApp({
    credential: admin.credential.cert({
      projectId: projectId,
      clientEmail: clientEmail,
      privateKey: formatPrivateKey(privateKey),
    }),
  });

  return {
    app,
    auth: admin.auth(),
    db: admin.firestore(),
  };
}
