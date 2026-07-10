import {
  collection,
  doc,
  addDoc,
  getDocs,
  onSnapshot,
  orderBy,
  query,
  updateDoc,
  deleteDoc,
  serverTimestamp,
  where,
  arrayUnion,
  Unsubscribe,
  Timestamp,
} from "firebase/firestore";
import { db } from "../firebase";
import { ConversationInvitation } from "../types";
import { conversationDoc } from "./conversations";

function invitationsRef() {
  return collection(db, "invitations");
}

function mapInvitation(id: string, data: Record<string, unknown>): ConversationInvitation {
  return {
    id,
    conversationId: data.conversationId as string,
    conversationName: data.conversationName as string,
    inviterId: data.inviterId as string,
    inviterName: data.inviterName as string,
    inviteeId: data.inviteeId as string,
    status: (data.status as ConversationInvitation["status"]) ?? "pending",
    createdAt: (data.createdAt as Timestamp)?.toDate?.() ?? new Date(),
  };
}

export async function createInvitation(
  conversationId: string,
  conversationName: string,
  inviterId: string,
  inviterName: string,
  inviteeId: string
): Promise<string> {
  const existing = query(
    invitationsRef(),
    where("conversationId", "==", conversationId),
    where("inviteeId", "==", inviteeId),
    where("status", "==", "pending")
  );
  const snap = await getDocs(existing);
  if (!snap.empty) {
    throw new Error("Bu kullanıcıya zaten bekleyen bir davet var");
  }

  const docRef = await addDoc(invitationsRef(), {
    conversationId,
    conversationName,
    inviterId,
    inviterName,
    inviteeId,
    status: "pending",
    createdAt: serverTimestamp(),
  });
  return docRef.id;
}

export function subscribeToInvitations(
  uid: string,
  callback: (invitations: ConversationInvitation[]) => void
): Unsubscribe {
  const q = query(
    invitationsRef(),
    where("inviteeId", "==", uid),
    where("status", "==", "pending"),
    orderBy("createdAt", "desc")
  );
  return onSnapshot(q, (snapshot) => {
    const list = snapshot.docs.map((d) =>
      mapInvitation(d.id, d.data() as Record<string, unknown>)
    );
    callback(list);
  });
}

export async function acceptInvitation(invitationId: string, conversationId: string, uid: string) {
  await updateDoc(doc(invitationsRef(), invitationId), { status: "accepted" });
  await updateDoc(conversationDoc(conversationId), {
    participants: arrayUnion(uid),
    updatedAt: serverTimestamp(),
  });
}

export async function rejectInvitation(invitationId: string) {
  await updateDoc(doc(invitationsRef(), invitationId), { status: "rejected" });
}

export async function deleteInvitation(invitationId: string) {
  await deleteDoc(doc(invitationsRef(), invitationId));
}
