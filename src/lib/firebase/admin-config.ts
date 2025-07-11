
import { initializeApp, getApps, cert, App } from 'firebase-admin/app';

const serviceAccount = process.env.FIREBASE_SERVICE_ACCOUNT_KEY
  ? JSON.parse(process.env.FIREBASE_SERVICE_ACCOUNT_KEY)
  : null;

let adminApp: App;

if (serviceAccount) {
    if (!getApps().some(app => app.name === 'admin')) {
        adminApp = initializeApp({
            credential: cert(serviceAccount)
        }, 'admin');
    } else {
        adminApp = getApps().find(app => app.name === 'admin')!;
    }
} else {
    console.warn("Firebase Admin SDK service account key is missing. Admin features will be disabled.");
    adminApp = null as any;
}


export { adminApp };
