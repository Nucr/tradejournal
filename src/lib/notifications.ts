import {
  collection,
  doc,
  addDoc,
  getDocs,
  onSnapshot,
  orderBy,
  query,
  updateDoc,
  where,
  serverTimestamp,
  Timestamp,
  Unsubscribe,
} from "firebase/firestore";
import { db } from "./firebase";
import { AppNotification, NotificationType } from "./types";

function notificationsRef(uid: string) {
  return collection(db, "users", uid, "notifications");
}

function notificationDoc(uid: string, id: string) {
  return doc(db, "users", uid, "notifications", id);
}

function mapNotification(id: string, data: Record<string, unknown>): AppNotification {
  return {
    id,
    type: data.type as NotificationType,
    fromUid: data.fromUid as string,
    fromDisplayName: data.fromDisplayName as string,
    fromAvatarUrl: data.fromAvatarUrl as string | undefined,
    fromAvatarColor: (data.fromAvatarColor as string) ?? "#2ED9A4",
    toUid: data.toUid as string,
    data: data.data as Record<string, unknown> | undefined,
    read: (data.read as boolean) ?? false,
    createdAt: (data.createdAt as Timestamp)?.toDate?.() ?? new Date(),
  };
}

export async function createNotification(params: {
  type: NotificationType;
  fromUid: string;
  fromDisplayName: string;
  fromAvatarUrl?: string;
  fromAvatarColor: string;
  toUid: string;
  data?: Record<string, unknown>;
}) {
  await addDoc(notificationsRef(params.toUid), {
    type: params.type,
    fromUid: params.fromUid,
    fromDisplayName: params.fromDisplayName,
    fromAvatarUrl: params.fromAvatarUrl ?? null,
    fromAvatarColor: params.fromAvatarColor,
    toUid: params.toUid,
    data: params.data ?? null,
    read: false,
    createdAt: serverTimestamp(),
  });
}

export function subscribeToNotifications(
  uid: string,
  callback: (notifications: AppNotification[]) => void
): Unsubscribe {
  const q = query(
    notificationsRef(uid),
    orderBy("createdAt", "desc")
  );
  return onSnapshot(q, (snap) => {
    const list = snap.docs.map((d) =>
      mapNotification(d.id, d.data() as Record<string, unknown>)
    );
    callback(list);
  });
}

export async function markNotificationRead(uid: string, notificationId: string) {
  await updateDoc(notificationDoc(uid, notificationId), { read: true });
}

export async function getUnreadNotificationCount(uid: string): Promise<number> {
  const q = query(
    notificationsRef(uid),
    where("read", "==", false)
  );
  const snap = await getDocs(q);
  return snap.size;
}
