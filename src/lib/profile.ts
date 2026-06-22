import {
  doc,
  getDoc,
  onSnapshot,
  setDoc,
  updateDoc,
  serverTimestamp,
  Unsubscribe,
} from "firebase/firestore";
import { db } from "./firebase";
import { UserProfile } from "./types";

function userDoc(uid: string) {
  return doc(db, "users", uid);
}

function mapProfile(doc: { exists: boolean; data: () => Record<string, unknown> }): UserProfile | null {
  if (!doc.exists) return null;
  const data = doc.data();
  return {
    ...data,
    updatedAt: data.updatedAt?.toDate?.() ?? new Date(),
  } as UserProfile;
}

export async function getProfile(uid: string): Promise<UserProfile | null> {
  const snap = await getDoc(userDoc(uid));
  return mapProfile(snap);
}

export function subscribeToProfile(
  uid: string,
  callback: (profile: UserProfile | null) => void
): Unsubscribe {
  return onSnapshot(userDoc(uid), (snap) => {
    callback(mapProfile(snap));
  });
}

export async function saveProfile(uid: string, profile: Partial<UserProfile>) {
  const ref = userDoc(uid);
  const snap = await getDoc(ref);
  const payload = { ...profile, updatedAt: serverTimestamp() };
  if (snap.exists()) {
    await updateDoc(ref, payload);
  } else {
    await setDoc(ref, payload);
  }
}
