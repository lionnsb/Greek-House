import { getApp, getApps, initializeApp, type FirebaseApp } from "firebase/app";
import { getAuth, type Auth } from "firebase/auth";
import { getFirestore, type Firestore } from "firebase/firestore";

const DEFAULT_PUBLIC_FIREBASE_CONFIG = {
  apiKey: "AIzaSyCnjlFpZu5s5j7uxfSsrEpAVNfSIOaFhDs",
  authDomain: "greek-house-cdf06.firebaseapp.com",
  projectId: "greek-house-cdf06",
  storageBucket: "greek-house-cdf06.firebasestorage.app",
  messagingSenderId: "768056597788",
  appId: "1:768056597788:web:c2308f306c7ce8fab02ed9"
} as const;

let firebaseApp: FirebaseApp | null = null;
let authInstance: Auth | null = null;
let dbInstance: Firestore | null = null;

function getFirebaseConfig() {
  return {
    apiKey:
      process.env.NEXT_PUBLIC_FIREBASE_API_KEY ??
      DEFAULT_PUBLIC_FIREBASE_CONFIG.apiKey,
    authDomain:
      process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN ??
      DEFAULT_PUBLIC_FIREBASE_CONFIG.authDomain,
    projectId:
      process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID ??
      DEFAULT_PUBLIC_FIREBASE_CONFIG.projectId,
    storageBucket:
      process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET ??
      DEFAULT_PUBLIC_FIREBASE_CONFIG.storageBucket,
    messagingSenderId:
      process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID ??
      DEFAULT_PUBLIC_FIREBASE_CONFIG.messagingSenderId,
    appId:
      process.env.NEXT_PUBLIC_FIREBASE_APP_ID ??
      DEFAULT_PUBLIC_FIREBASE_CONFIG.appId
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
