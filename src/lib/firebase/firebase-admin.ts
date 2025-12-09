import admin from 'firebase-admin';

// 1. Definimos la variable global correctamente para que no de error en TS
declare global {
  var firebaseAdminApp: admin.app.App | undefined;
}

function formatPrivateKey(key?: string): string {
  if (!key) return '';
  // Esto arregla los símbolos \n que vimos en tu captura de Cloud Run
  return key.replace(/\\n/g, '\n');
}

function getInitializedApp(): admin.app.App {
  // Si ya existe la app global, la usamos (evita reinicios)
  if (global.firebaseAdminApp) {
    return global.firebaseAdminApp;
  }

  const privateKey = formatPrivateKey(process.env.FIREBASE_PRIVATE_KEY);
  const clientEmail = process.env.FIREBASE_CLIENT_EMAIL;
  const projectId = process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID;

  // Verificamos que las variables existan
  if (!privateKey || !clientEmail || !projectId) {
    throw new Error('Faltan las credenciales de Firebase en las variables de entorno.');
  }

  const app = admin.initializeApp({
    credential: admin.credential.cert({
      projectId,
      clientEmail,
      privateKey,
    }),
  });

  global.firebaseAdminApp = app;
  return app;
}

// 2. Exportamos como ASYNC para cumplir con Next.js 15
export async function getFirebaseAuth() {
  const app = getInitializedApp();
  
  return {
    app,
    auth: app.auth(),
    db: app.firestore(),
    admin, 
  };
}