import {
  doc,
  getDoc,
  setDoc,
  updateDoc,
  serverTimestamp,
} from "firebase/firestore";
import { db } from "./firebase";
import { UserProfile } from "./types";

function userDoc(uid: string) {
  return doc(db, "users", uid);
}

export async function getProfile(uid: string): Promise<UserProfile | null> {
  const snap = await getDoc(userDoc(uid));
  if (!snap.exists()) return null;
  const data = snap.data();
  return {
    ...data,
    updatedAt: data.updatedAt?.toDate?.() ?? new Date(),
  } as UserProfile;
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
