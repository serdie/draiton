
import admin from 'firebase-admin';
import serverConfig from '@/config/server-config';

// Define a global symbol to store the initialized Firebase Admin app
const FIREBASE_ADMIN_APP_SYMBOL = Symbol.for('firebase_admin_app');

interface GlobalWithFirebase extends NodeJS.Global {
  [FIREBASE_ADMIN_APP_SYMBOL]?: admin.app.App;
}

const customGlobal = global as GlobalWithFirebase;

function getInitializedApp(): admin.app.App {
  if (customGlobal[FIREBASE_ADMIN_APP_SYMBOL]) {
    return customGlobal[FIREBASE_ADMIN_APP_SYMBOL]!;
  }

  const { privateKey, clientEmail, projectId } = serverConfig.firebase;

  const app = admin.initializeApp({
    credential: admin.credential.cert({
      projectId: projectId,
      clientEmail: clientEmail,
      privateKey: privateKey,
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
