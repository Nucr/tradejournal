import {
  collection,
  doc,
  addDoc,
  getDoc,
  getDocs,
  onSnapshot,
  orderBy,
  query,
  updateDoc,
  deleteDoc,
  where,
  arrayRemove,
  arrayUnion,
  serverTimestamp,
  Unsubscribe,
  Timestamp,
} from "firebase/firestore";
import { db } from "./firebase";
import { FriendRequest } from "./types";

function friendRequestsRef() {
  return collection(db, "friendRequests");
}

function friendRequestDoc(id: string) {
  return doc(db, "friendRequests", id);
}

function mapFriendRequest(id: string, data: Record<string, unknown>): FriendRequest {
  return {
    id,
    fromUid: data.fromUid as string,
    toUid: data.toUid as string,
    fromDisplayName: data.fromDisplayName as string,
    fromAvatarColor: (data.fromAvatarColor as string) ?? "#2ED9A4",
    fromAvatarUrl: data.fromAvatarUrl as string | undefined,
    status: (data.status as FriendRequest["status"]) ?? "pending",
    createdAt: (data.createdAt as Timestamp)?.toDate?.() ?? new Date(),
  };
}

export async function sendFriendRequest(
  fromUid: string,
  toUid: string,
  fromDisplayName: string,
  fromAvatarColor: string,
  fromAvatarUrl?: string
): Promise<string> {
  const existing = query(
    friendRequestsRef(),
    where("fromUid", "==", fromUid),
    where("toUid", "==", toUid),
    where("status", "==", "pending")
  );
  const snap = await getDocs(existing);
  if (!snap.empty) {
    throw new Error("Zaten bekleyen bir arkadaşlık isteğin var");
  }

  const reverse = query(
    friendRequestsRef(),
    where("fromUid", "==", toUid),
    where("toUid", "==", fromUid),
    where("status", "==", "pending")
  );
  const reverseSnap = await getDocs(reverse);
  if (!reverseSnap.empty) {
    throw new Error("Bu kullanıcıdan zaten bekleyen bir istek var");
  }

  const docRef = await addDoc(friendRequestsRef(), {
    fromUid,
    toUid,
    fromDisplayName,
    fromAvatarColor,
    fromAvatarUrl: fromAvatarUrl ?? null,
    status: "pending",
    createdAt: serverTimestamp(),
  });
  return docRef.id;
}

export async function acceptFriendRequest(requestId: string, fromUid: string, toUid: string) {
  await updateDoc(friendRequestDoc(requestId), { status: "accepted" });

  const batch = [];
  batch.push(
    updateDoc(doc(db, "users", fromUid), {
      friends: arrayUnion(toUid),
    })
  );
  batch.push(
    updateDoc(doc(db, "users", toUid), {
      friends: arrayUnion(fromUid),
    })
  );
  await Promise.all(batch);
}

export async function rejectFriendRequest(requestId: string) {
  await updateDoc(friendRequestDoc(requestId), { status: "rejected" });
}

export async function removeFriend(uid: string, friendUid: string) {
  await Promise.all([
    updateDoc(doc(db, "users", uid), { friends: arrayRemove(friendUid) }),
    updateDoc(doc(db, "users", friendUid), { friends: arrayRemove(uid) }),
  ]);
}

export function subscribeToFriendRequests(
  uid: string,
  callback: (requests: FriendRequest[]) => void
): Unsubscribe {
  const q = query(
    friendRequestsRef(),
    where("toUid", "==", uid),
    where("status", "==", "pending"),
    orderBy("createdAt", "desc")
  );
  return onSnapshot(q, (snap) => {
    const list = snap.docs.map((d) =>
      mapFriendRequest(d.id, d.data() as Record<string, unknown>)
    );
    callback(list);
  });
}

export function subscribeToSentRequests(
  uid: string,
  callback: (requests: FriendRequest[]) => void
): Unsubscribe {
  const q = query(
    friendRequestsRef(),
    where("fromUid", "==", uid),
    where("status", "==", "pending"),
    orderBy("createdAt", "desc")
  );
  return onSnapshot(q, (snap) => {
    const list = snap.docs.map((d) =>
      mapFriendRequest(d.id, d.data() as Record<string, unknown>)
    );
    callback(list);
  });
}

export async function areFriends(uid1: string, uid2: string): Promise<boolean> {
  const snap = await getDoc(doc(db, "users", uid1));
  if (!snap.exists()) return false;
  const friends: string[] = snap.data()?.friends ?? [];
  return friends.includes(uid2);
}

export async function getFriendStatus(
  uid: string,
  otherUid: string
): Promise<"none" | "friends" | "requested" | "received"> {
  if (uid === otherUid) return "none";

  const areF = await areFriends(uid, otherUid);
  if (areF) return "friends";

  const sent = query(
    friendRequestsRef(),
    where("fromUid", "==", uid),
    where("toUid", "==", otherUid),
    where("status", "==", "pending")
  );
  const sentSnap = await getDocs(sent);
  if (!sentSnap.empty) return "requested";

  const received = query(
    friendRequestsRef(),
    where("fromUid", "==", otherUid),
    where("toUid", "==", uid),
    where("status", "==", "pending")
  );
  const receivedSnap = await getDocs(received);
  if (!receivedSnap.empty) return "received";

  return "none";
}
