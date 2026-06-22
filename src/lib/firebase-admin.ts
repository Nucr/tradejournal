import "server-only";

import {
  initializeApp,
  getApps,
  cert,
  AppOptions,
} from "firebase-admin/app";
import { getFirestore } from "firebase-admin/firestore";

function getServiceAccount(): AppOptions {
  const raw = process.env.FIREBASE_SERVICE_ACCOUNT_KEY;
  if (raw) {
    return { credential: cert(JSON.parse(raw)) };
  }
  return {
    projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
  };
}

export const adminApp =
  getApps().find((a) => a.name === "[DEFAULT]") ??
  initializeApp(getServiceAccount());

export const adminDb = getFirestore(adminApp);
