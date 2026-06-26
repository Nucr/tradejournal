import {
  collection,
  doc,
  addDoc,
  getDoc,
  getDocs,
  onSnapshot,
  orderBy,
  query,
  setDoc,
  updateDoc,
  serverTimestamp,
  where,
  arrayUnion,
  arrayRemove,
  Unsubscribe,
  Timestamp,
  deleteDoc,
} from "firebase/firestore";
import { db } from "./firebase";
import {
  Conversation,
  ConversationInvitation,
  ConversationType,
  GroupType,
  Message,
} from "./types";

// ─── Conversations ───

function conversationsRef() {
  return collection(db, "conversations");
}

function conversationDoc(id: string) {
  return doc(db, "conversations", id);
}

function messagesRef(conversationId: string) {
  return collection(db, "conversations", conversationId, "messages");
}

function readStatusDoc(conversationId: string, uid: string) {
  return doc(db, "conversations", conversationId, "readStatus", uid);
}

function mapConversation(id: string, data: Record<string, unknown>): Conversation {
  const rawTimestamps = data.lastReadTimestamps as Record<string, unknown> | undefined;
  const lastReadTimestamps: Record<string, Date> | undefined = rawTimestamps
    ? Object.fromEntries(
        Object.entries(rawTimestamps).map(([uid, ts]) => [
          uid,
          (ts as Timestamp)?.toDate?.() ?? new Date(),
        ])
      )
    : undefined;

  return {
    id,
    type: data.type as ConversationType,
    name: data.name as string | undefined,
    description: data.description as string | undefined,
    photoUrl: data.photoUrl as string | undefined,
    groupType: data.groupType as GroupType | undefined,
    ownerId: data.ownerId as string | undefined,
    participants: (data.participants as string[]) ?? [],
    invitedUsers: data.invitedUsers as string[] | undefined,
    createdBy: data.createdBy as string,
    lastMessage: data.lastMessage
      ? {
          text: (data.lastMessage as Record<string, unknown>).text as string,
          senderId: (data.lastMessage as Record<string, unknown>).senderId as string,
          senderName: (data.lastMessage as Record<string, unknown>).senderName as string,
          createdAt: ((data.lastMessage as Record<string, unknown>).createdAt as Timestamp)?.toDate?.() ?? new Date(),
        }
      : undefined,
    lastReadTimestamps,
    createdAt: (data.createdAt as Timestamp)?.toDate?.() ?? new Date(),
    updatedAt: (data.updatedAt as Timestamp)?.toDate?.() ?? new Date(),
  };
}

function mapMessage(id: string, data: Record<string, unknown>): Message {
  return {
    id,
    senderId: data.senderId as string,
    senderName: data.senderName as string,
    text: data.text as string,
    createdAt: (data.createdAt as Timestamp)?.toDate?.() ?? new Date(),
  };
}

export function subscribeToConversations(
  uid: string,
  callback: (conversations: Conversation[]) => void,
  onError?: (err: Error) => void
): Unsubscribe {
  const q = query(
    conversationsRef(),
    where("participants", "array-contains", uid),
    orderBy("updatedAt", "desc")
  );
  return onSnapshot(
    q,
    (snapshot) => {
      const list = snapshot.docs.map((d) =>
        mapConversation(d.id, d.data() as Record<string, unknown>)
      );
      callback(list);
    },
    (err) => {
      console.error("subscribeToConversations error:", err);
      onError?.(err);
    }
  );
}

export function subscribeToMessages(
  conversationId: string,
  callback: (messages: Message[]) => void
): Unsubscribe {
  const q = query(
    messagesRef(conversationId),
    orderBy("createdAt", "asc")
  );
  return onSnapshot(q, (snapshot) => {
    const list = snapshot.docs.map((d) =>
      mapMessage(d.id, d.data() as Record<string, unknown>)
    );
    callback(list);
  });
}

export async function getConversation(
  conversationId: string
): Promise<Conversation | null> {
  const snap = await getDoc(conversationDoc(conversationId));
  if (!snap.exists()) return null;
  return mapConversation(snap.id, snap.data() as Record<string, unknown>);
}

export async function sendMessage(
  conversationId: string,
  senderId: string,
  senderName: string,
  text: string
) {
  const msgData = {
    senderId,
    senderName,
    text,
    createdAt: serverTimestamp(),
  };
  await addDoc(messagesRef(conversationId), msgData);
  await updateDoc(conversationDoc(conversationId), {
    lastMessage: {
      text,
      senderId,
      senderName,
      createdAt: serverTimestamp(),
    },
    updatedAt: serverTimestamp(),
    [`lastReadTimestamps.${senderId}`]: serverTimestamp(),
  });
}

export async function createConversation(
  type: ConversationType,
  participants: string[],
  createdBy: string,
  extra?: { name?: string; description?: string; photoUrl?: string; groupType?: GroupType; invitedUsers?: string[] }
): Promise<string> {
  const docRef = await addDoc(conversationsRef(), {
    type,
    name: extra?.name ?? null,
    description: extra?.description ?? null,
    photoUrl: extra?.photoUrl ?? null,
    groupType: extra?.groupType ?? null,
    ownerId: type === "group" ? createdBy : null,
    participants,
    invitedUsers: extra?.invitedUsers ?? [],
    createdBy,
    lastMessage: null,
    lastReadTimestamps: { [createdBy]: serverTimestamp() },
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp(),
  });
  return docRef.id;
}

export async function createDirectConversation(
  uid1: string,
  uid2: string
): Promise<string | null> {
  // Check recipient's messaging privacy
  const recipientSnap = await getDoc(doc(db, "users", uid2));
  if (recipientSnap.exists()) {
    const privacy = recipientSnap.data()?.messagingPrivacy as string | undefined;
    if (privacy === "nobody") {
      throw new Error("Bu kullanıcı mesaj almıyor.");
    }
    if (privacy === "friends") {
      const senderFriends: string[] = recipientSnap.data()?.friends ?? [];
      if (!senderFriends.includes(uid1)) {
        throw new Error("Bu kullanıcı sadece arkadaşlarının mesaj alıyor.");
      }
    }
  }

  const q = query(
    conversationsRef(),
    where("participants", "array-contains", uid1),
    where("type", "==", "direct")
  );
  const snap = await getDocs(q);
  const existing = snap.docs.find((d) => {
    const data = d.data();
    return data.participants?.includes(uid2);
  });
  if (existing) return existing.id;

  return createConversation("direct", [uid1, uid2], uid1);
}

export async function createGroup(
  name: string,
  description: string,
  groupType: GroupType,
  ownerId: string,
  initialMembers: string[]
): Promise<string> {
  return createConversation("group", [ownerId, ...initialMembers], ownerId, {
    name,
    description,
    groupType,
    invitedUsers: groupType === "closed" ? initialMembers : undefined,
  });
}

export async function joinGroup(conversationId: string, uid: string) {
  const convSnap = await getDoc(conversationDoc(conversationId));
  if (!convSnap.exists()) throw new Error("Group not found");
  const data = convSnap.data();
  if (data.type !== "group") throw new Error("Not a group");
  if (data.groupType === "closed") {
    const invited: string[] = data.invitedUsers ?? [];
    if (!invited.includes(uid)) throw new Error("You are not invited to this group");
  }
  await updateDoc(conversationDoc(conversationId), {
    participants: arrayUnion(uid),
    updatedAt: serverTimestamp(),
  });
}

export async function leaveGroup(conversationId: string, uid: string) {
  await updateDoc(conversationDoc(conversationId), {
    participants: arrayRemove(uid),
    updatedAt: serverTimestamp(),
  });
}

export async function inviteToGroup(conversationId: string, uid: string) {
  await updateDoc(conversationDoc(conversationId), {
    invitedUsers: arrayUnion(uid),
    updatedAt: serverTimestamp(),
  });
}

export async function transferOwnership(conversationId: string, newOwnerId: string) {
  await updateDoc(conversationDoc(conversationId), {
    ownerId: newOwnerId,
    updatedAt: serverTimestamp(),
  });
}

export async function removeFromGroup(conversationId: string, uid: string) {
  await updateDoc(conversationDoc(conversationId), {
    participants: arrayRemove(uid),
    updatedAt: serverTimestamp(),
  });
}

export async function markAsRead(conversationId: string, uid: string) {
  await setDoc(
    readStatusDoc(conversationId, uid),
    { lastReadAt: serverTimestamp() },
    { merge: true }
  );
  await updateDoc(conversationDoc(conversationId), {
    [`lastReadTimestamps.${uid}`]: serverTimestamp(),
  });
}

export async function getUnreadCounts(
  uid: string,
  conversations: Conversation[]
): Promise<Map<string, number>> {
  const result = new Map<string, number>();
  for (const conv of conversations) {
    if (!conv.lastMessage) continue;
    const statusSnap = await getDoc(readStatusDoc(conv.id, uid));
    let lastReadAt = 0;
    if (statusSnap.exists()) {
      const d = statusSnap.data().lastReadAt as Timestamp | undefined;
      lastReadAt = d?.toMillis?.() ?? 0;
    }
    const lastMsgTime = (conv.lastMessage.createdAt as Date).getTime();
    if (lastMsgTime > lastReadAt) {
      const msgSnap = await getDocs(
        query(
          messagesRef(conv.id),
          where("createdAt", ">", new Date(lastReadAt))
        )
      );
      result.set(
        conv.id,
        msgSnap.docs.filter((d) => d.data().senderId !== uid).length
      );
    }
  }
  return result;
}

export function subscribeToReadStatus(
  conversationId: string,
  uid: string,
  callback: (lastReadAt: Date | null) => void
): Unsubscribe {
  return onSnapshot(readStatusDoc(conversationId, uid), (snap) => {
    if (!snap.exists()) {
      callback(null);
      return;
    }
    const ts = (snap.data().lastReadAt as Timestamp | undefined)?.toDate?.();
    callback(ts ?? null);
  });
}

// ─── Group Update ───

export async function updateConversation(
  conversationId: string,
  updates: { name?: string; description?: string; photoUrl?: string }
) {
  const payload: Record<string, unknown> = { updatedAt: serverTimestamp() };
  if (updates.name !== undefined) payload.name = updates.name;
  if (updates.description !== undefined) payload.description = updates.description;
  if (updates.photoUrl !== undefined) payload.photoUrl = updates.photoUrl;
  await updateDoc(conversationDoc(conversationId), payload);
}

// ─── Invitations ───

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
  // Check for existing pending invitation
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

// ─── Group Photo Upload ───

export async function uploadGroupPhoto(
  conversationId: string,
  file: File,
  onProgress?: (pct: number) => void
): Promise<string> {
  if (!file.type.startsWith("image/")) {
    throw new Error("Sadece resim dosyaları kabul edilir");
  }
  if (file.size > 500 * 1024) {
    throw new Error("Dosya boyutu 500KB'dan büyük olamaz");
  }

  const signRes = await fetch("/api/cloudinary/sign", { method: "POST" });
  if (!signRes.ok) throw new Error("Cloudinary imza alınamadı");
  const { signature, timestamp, api_key, cloud_name, folder } = await signRes.json();

  const formData = new FormData();
  formData.append("file", file);
  formData.append("folder", folder + "/groups");
  formData.append("timestamp", String(timestamp));
  formData.append("api_key", api_key);
  formData.append("signature", signature);

  return new Promise((resolve, reject) => {
    const xhr = new XMLHttpRequest();
    xhr.upload.onprogress = (e) => {
      if (e.lengthComputable && onProgress) {
        onProgress(Math.round((e.loaded / e.total) * 100));
      }
    };
    xhr.onload = async () => {
      if (xhr.status === 200) {
        const data = JSON.parse(xhr.responseText);
        const url = data.secure_url;
        await updateDoc(conversationDoc(conversationId), {
          photoUrl: url,
          updatedAt: serverTimestamp(),
        });
        resolve(url);
      } else {
        try {
          const err = JSON.parse(xhr.responseText);
          reject(new Error(err.error?.message || "Cloudinary yükleme hatası"));
        } catch {
          reject(new Error("Cloudinary yükleme hatası"));
        }
      }
    };
    xhr.onerror = () => reject(new Error("Cloudinary bağlantı hatası"));
    xhr.open("POST", `https://api.cloudinary.com/v1_1/${cloud_name}/image/upload`);
    xhr.send(formData);
  });
}
