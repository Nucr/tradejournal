import {
  collection,
  addDoc,
  doc,
  onSnapshot,
  orderBy,
  query,
  serverTimestamp,
  updateDoc,
  deleteDoc,
  Timestamp,
} from "firebase/firestore";
import { db } from "./firebase";
import type { Account, AccountInput } from "./types";

function accountsCollection(uid: string) {
  return collection(db, "users", uid, "accounts");
}

function accountDoc(uid: string, id: string) {
  return doc(db, "users", uid, "accounts", id);
}

function mapAccount(d: { id: string; data: () => Record<string, unknown> }): Account {
  const data = d.data();
  return {
    id: d.id,
    name: (data.name as string) ?? "",
    balance: (data.balance as number) ?? 0,
    createdAt:
      (data.createdAt as Timestamp)?.toDate?.().toISOString?.() ??
      new Date().toISOString(),
    updatedAt:
      (data.updatedAt as Timestamp)?.toDate?.().toISOString?.() ??
      new Date().toISOString(),
  };
}

export function subscribeToAccounts(
  uid: string,
  callback: (accounts: Account[]) => void
) {
  const q = query(accountsCollection(uid), orderBy("createdAt", "desc"));
  return onSnapshot(q, (snapshot) => {
    const accounts = snapshot.docs.map(mapAccount);
    callback(accounts);
  });
}

export async function addAccount(uid: string, input: AccountInput) {
  const docRef = await addDoc(accountsCollection(uid), {
    ...input,
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp(),
  });
  return docRef.id;
}

export async function updateAccount(uid: string, id: string, input: Partial<AccountInput>) {
  await updateDoc(accountDoc(uid, id), {
    ...input,
    updatedAt: serverTimestamp(),
  });
}

export async function deleteAccount(uid: string, id: string) {
  await deleteDoc(accountDoc(uid, id));
}
