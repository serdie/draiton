
import admin from 'firebase-admin';

function formatPrivateKey(key: string) {
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

  const app = admin.initializeApp({
    credential: admin.credential.cert({
      projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
      clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
      privateKey: formatPrivateKey(process.env.FIREBASE_PRIVATE_KEY!),
    }),
  });

  return {
    app,
    auth: admin.auth(),
    db: admin.firestore(),
  };
}
