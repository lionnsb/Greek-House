import { cert, getApps, initializeApp, type App } from "firebase-admin/app";
import { getAuth, type Auth } from "firebase-admin/auth";
import { getFirestore, type Firestore } from "firebase-admin/firestore";

let adminApp: App | null = null;
let firestoreInstance: Firestore | null = null;
let authInstance: Auth | null = null;

function getRequiredServiceAccountJson() {
  const raw = process.env.FIREBASE_SERVICE_ACCOUNT_JSON;
  if (!raw) {
    throw new Error(
      "FIREBASE_SERVICE_ACCOUNT_JSON fehlt. Bitte Firebase Admin Service Account als JSON setzen."
    );
  }
  return raw;
}

function getAdminApp() {
  if (adminApp) {
    return adminApp;
  }

  const existingApps = getApps();
  if (existingApps.length > 0) {
    adminApp = existingApps[0];
    return adminApp;
  }

  const serviceAccount = JSON.parse(getRequiredServiceAccountJson());
  adminApp = initializeApp({
    credential: cert(serviceAccount)
  });

  return adminApp;
}

function getFirestoreInstance() {
  if (!firestoreInstance) {
    firestoreInstance = getFirestore(getAdminApp());
  }
  return firestoreInstance;
}

export function getAdminAuth() {
  if (!authInstance) {
    authInstance = getAuth(getAdminApp());
  }
  return authInstance;
}

export const adminDb = new Proxy({} as Firestore, {
  get(_target, prop) {
    const instance = getFirestoreInstance();
    const value = Reflect.get(instance as object, prop);
    if (typeof value === "function") {
      return value.bind(instance);
    }
    return value;
  }
});
