import {
  DocumentSnapshot,
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

function mapProfile(snap: DocumentSnapshot): UserProfile | null {
  if (!snap.exists()) return null;
  const data = snap.data()!;
  return {
    ...data,
    updatedAt: (data.updatedAt as { toDate?: () => Date })?.toDate?.() ?? new Date(),
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

export interface UserDisplayInfo {
  displayName: string;
  avatarUrl?: string;
  avatarColor: string;
}

export async function getUserDisplayMap(uids: string[]): Promise<Record<string, UserDisplayInfo>> {
  const map: Record<string, UserDisplayInfo> = {};
  const results = await Promise.allSettled(uids.map((uid) => getProfile(uid)));
  uids.forEach((uid, i) => {
    const res = results[i];
    if (res.status === "fulfilled" && res.value) {
      map[uid] = {
        displayName: res.value.displayName,
        avatarUrl: res.value.avatarUrl,
        avatarColor: res.value.avatarColor,
      };
    } else {
      map[uid] = {
        displayName: uid.slice(0, 8),
        avatarColor: "#2ED9A4",
      };
    }
  });
  return map;
}
