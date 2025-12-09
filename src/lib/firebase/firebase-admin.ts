
'use server';

import admin from 'firebase-admin';
import dotenv from 'dotenv';

dotenv.config();

// Define a global symbol to store the initialized Firebase Admin app
const FIREBASE_ADMIN_APP_SYMBOL = Symbol.for('firebase_admin_app');

interface GlobalWithFirebase extends NodeJS.Global {
  [FIREBASE_ADMIN_APP_SYMBOL]?: admin.app.App;
}

const customGlobal = global as GlobalWithFirebase;

function formatPrivateKey(key?: string): string {
  if (!key) return '';
  return key.replace(/\\n/g, '\n');
}

function getInitializedApp(): admin.app.App {
  if (customGlobal[FIREBASE_ADMIN_APP_SYMBOL]) {
    return customGlobal[FIREBASE_ADMIN_APP_SYMBOL]!;
  }

  const privateKey = formatPrivateKey(process.env.FIREBASE_PRIVATE_KEY);
  const clientEmail = process.env.FIREBASE_CLIENT_EMAIL;
  const projectId = process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID;

  if (!privateKey || !clientEmail || !projectId) {
      throw new Error('Las credenciales del servidor de Firebase (FIREBASE_PRIVATE_KEY, FIREBASE_CLIENT_EMAIL, NEXT_PUBLIC_FIREBASE_PROJECT_ID) no están configuradas en las variables de entorno.');
  }

  const app = admin.initializeApp({
    credential: admin.credential.cert({
      projectId,
      clientEmail,
      privateKey,
    }),
  });

  customGlobal[FIREBASE_ADMIN_APP_SYMBOL] = app;
  return app;
}

export function getFirebaseAuth() {
  const app = getInitializedApp();
  
  return {
    app,
    auth: app.auth(),
    db: app.firestore(),
    admin, // Export admin namespace
  };
}
