import admin from 'firebase-admin';
import serverConfig from '@/config/server-config';

export function getFirebaseAuth() {
  if (admin.apps.length > 0) {
    return {
      app: admin.app(),
      auth: admin.auth(),
      db: admin.firestore(),
      admin: admin, // Export admin namespace
    };
  }
  
  const { privateKey, clientEmail, projectId } = serverConfig.firebase;

  const app = admin.initializeApp({
    credential: admin.credential.cert({
      projectId: projectId,
      clientEmail: clientEmail,
      privateKey: privateKey,
    }),
  });

  return {
    app,
    auth: admin.auth(),
    db: admin.firestore(),
    admin: admin, // Export admin namespace
  };
}
