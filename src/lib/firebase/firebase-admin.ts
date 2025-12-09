
import admin from 'firebase-admin';

// 1. Definición correcta de variable global para evitar reinicios en desarrollo
declare global {
  var firebaseAdminApp: admin.app.App | undefined;
}

function formatPrivateKey(key?: string): string {
  if (!key) return '';
  return key.replace(/\\n/g, '\n');
}

function getInitializedApp(): admin.app.App {
  // Verificamos si ya existe la app en la variable global
  if (global.firebaseAdminApp) {
    return global.firebaseAdminApp;
  }

  const privateKey = formatPrivateKey(process.env.FIREBASE_PRIVATE_KEY);
  const clientEmail = process.env.FIREBASE_CLIENT_EMAIL;
  const projectId = process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID;

  if (!privateKey || !clientEmail || !projectId) {
    throw new Error('Las credenciales del servidor de Firebase (FIREBASE_PRIVATE_KEY, FIREBASE_CLIENT_EMAIL, NEXT_PUBLIC_FIREBASE_PROJECT_ID) no están configuradas en las variables de entorno.');
  }

  // Inicializamos la app si no existe
  const app = admin.initializeApp({
    credential: admin.credential.cert({
      projectId,
      clientEmail,
      privateKey,
    }),
  });

  // Guardamos la instancia en global
  global.firebaseAdminApp = app;
  return app;
}

// 2. Exportamos como ASYNC para evitar conflictos con Server Actions en Next.js 15
export async function getFirebaseAuth() {
  const app = getInitializedApp();
  
  return {
    app,
    auth: app.auth(),
    db: app.firestore(),
    admin, // Export admin namespace
  };
}