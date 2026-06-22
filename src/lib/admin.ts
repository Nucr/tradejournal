import { doc, getDoc, setDoc, updateDoc, serverTimestamp } from "firebase/firestore";
import { db } from "./firebase";

const ADMIN_UID = process.env.NEXT_PUBLIC_ADMIN_UID;

export async function isAdmin(uid: string): Promise<boolean> {
  if (ADMIN_UID && uid === ADMIN_UID) return true;
  try {
    const snap = await getDoc(doc(db, "users", uid));
    return snap.exists() && snap.data().role === "admin";
  } catch {
    return false;
  }
}

export async function setAdminRole(uid: string, role: "user" | "admin") {
  await updateDoc(doc(db, "users", uid), { role, updatedAt: serverTimestamp() });
}
