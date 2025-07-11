
// Import the functions you need from the SDKs you need
import { initializeApp, getApps, getApp, type FirebaseApp } from "firebase/app";
import { getAuth, type Auth } from "firebase/auth";
import { getFirestore, type Firestore } from "firebase/firestore";
import { getSession } from 'next-firebase-auth-edge/lib/auth';
import { cookies } from 'next/headers';
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID
};

// Initialize Firebase
let app: FirebaseApp;
let clientAuth: Auth;
let db: Firestore;

// This guard prevents the app from crashing on the server if the environment variables are not set.
if (firebaseConfig.apiKey) {
    app = !getApps().length ? initializeApp(firebaseConfig) : getApp();
    clientAuth = getAuth(app);
    db = getFirestore(app);
} else {
    console.warn("Firebase configuration is missing. Firebase features will be disabled.");
    // Provide default null values or mock implementations if needed
    app = null as any;
    clientAuth = null as any;
    db = null as any;
}

const auth = {
    client: clientAuth,
    get session() {
        try {
            return cookies().get('session')?.value ?? null;
        } catch (error) {
            // cookies() will throw an error in non-request environments
            // like route handlers, so we return null as a fallback.
            return null;
        }
    }
}


export { app, auth, db };
