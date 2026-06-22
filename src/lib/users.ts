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

export async function getUser(uid: string): Promise<UserProfile | null> {
  const snap = await getDoc(userDoc(uid));
  if (!snap.exists()) return null;
  const data = snap.data();
  return {
    ...data,
    updatedAt: data.updatedAt?.toDate?.() ?? new Date(),
  } as UserProfile;
}

export async function setUser(uid: string, data: UserProfile) {
  await setDoc(userDoc(uid), { ...data, updatedAt: serverTimestamp() });
}

export async function updateUser(uid: string, data: Partial<UserProfile>) {
  await updateDoc(userDoc(uid), { ...data, updatedAt: serverTimestamp() });
}
