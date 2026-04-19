import { cert, getApps, initializeApp } from "firebase-admin/app";
import { getFirestore } from "firebase-admin/firestore";

const rawServiceAccount = process.env.FIREBASE_SERVICE_ACCOUNT_JSON;

if (!rawServiceAccount) {
  throw new Error(
    "FIREBASE_SERVICE_ACCOUNT_JSON fehlt. Bitte Firebase Admin Service Account als JSON setzen."
  );
}

const serviceAccount = JSON.parse(rawServiceAccount);

const app = getApps().length
  ? getApps()[0]
  : initializeApp({
      credential: cert(serviceAccount)
    });

export const adminDb = getFirestore(app);
