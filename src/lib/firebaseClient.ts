import { getApp, getApps, initializeApp, type FirebaseApp } from "firebase/app";
import { getAuth, type Auth } from "firebase/auth";
import { getFirestore, type Firestore } from "firebase/firestore";

let firebaseApp: FirebaseApp | null = null;
let authInstance: Auth | null = null;
let dbInstance: Firestore | null = null;

function getFirebaseConfig() {
  const config = {
    apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
    authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
    projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
    storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
    messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
    appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID
  };

  const missing = Object.entries(config)
    .filter(([, value]) => !value)
    .map(([key]) => key);

  if (missing.length > 0) {
    throw new Error(
      `Firebase Public Config fehlt: ${missing.join(", ")}`
    );
  }

  return config as {
    apiKey: string;
    authDomain: string;
    projectId: string;
    storageBucket: string;
    messagingSenderId: string;
    appId: string;
  };
}

function getClientApp() {
  if (typeof window === "undefined") {
    throw new Error("Firebase Client darf nur im Browser initialisiert werden.");
  }

  if (firebaseApp) {
    return firebaseApp;
  }

  firebaseApp = getApps().length ? getApp() : initializeApp(getFirebaseConfig());
  return firebaseApp;
}

export function getClientAuth() {
  if (!authInstance) {
    authInstance = getAuth(getClientApp());
  }
  return authInstance;
}

export function getClientDb() {
  if (!dbInstance) {
    dbInstance = getFirestore(getClientApp());
  }
  return dbInstance;
}
