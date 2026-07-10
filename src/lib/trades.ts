import {
  collection,
  addDoc,
  doc,
  getDocs,
  getDoc,
  setDoc,
  deleteDoc,
  onSnapshot,
  orderBy,
  query,
  serverTimestamp,
  updateDoc,
  increment,
  writeBatch,
  where,
  Timestamp,
} from "firebase/firestore";
import { db } from "./firebase";
import { Trade, TradeInput, TradeReaction, TradeComment } from "./types";
import { syncUserScore } from "./sync-score";
import { mapTrade } from "./trade-utils";

function tradesCollection(uid: string) {
  return collection(db, "users", uid, "trades");
}

function tradeDoc(uid: string, id: string) {
  return doc(db, "users", uid, "trades", id);
}

export function subscribeToTrades(
  uid: string,
  callback: (trades: Trade[]) => void
) {
  const q = query(
    tradesCollection(uid),
    orderBy("entryDate", "desc")
  );
  return onSnapshot(q, (snapshot) => {
    let allTrades: Trade[] = [];
    try {
      allTrades = snapshot.docs.map(mapTrade);
    } catch (mapErr) {
      console.error("subscribeToTrades: mapTrade error", mapErr);
      return;
    }
    const trades = allTrades.filter((t) => t.deletedAt == null);
    callback(trades);
  }, (err) => {
    console.error("subscribeToTrades error:", err?.message);
  });
}

export async function addTrade(uid: string, trade: TradeInput) {
  try {
    const docRef = await addDoc(tradesCollection(uid), {
      ...trade,
      tradeId: "",
      createdAt: serverTimestamp(),
    });
    await updateDoc(docRef, { tradeId: docRef.id }).catch((err) =>
      console.error("set tradeId failed:", err)
    );
  } catch (err) {
    console.error("addTrade failed:", err);
    throw err;
  }
  syncUserScore(uid).catch((err) => console.error("syncUserScore error:", err));
}

export async function updateTrade(uid: string, id: string, trade: Partial<TradeInput>) {
  await updateDoc(tradeDoc(uid, id), trade);
  await syncUserScore(uid);
}

export async function deleteTrade(uid: string, id: string) {
  await updateDoc(tradeDoc(uid, id), { deletedAt: serverTimestamp() });
  await syncUserScore(uid);
}

export async function restoreTrade(uid: string, id: string) {
  await updateDoc(tradeDoc(uid, id), { deletedAt: null });
  await syncUserScore(uid);
}

export async function shareTrade(uid: string, id: string, visibility?: "public" | "friends" | "private") {
  const v = visibility ?? "public";
  const tradeRef = tradeDoc(uid, id);
  await updateDoc(tradeRef, { isShared: true, visibility: v });

  if (v !== "public") {
    await deleteDoc(doc(db, "sharedTrades", id)).catch(() => {});
    return;
  }

  // Root-level sharedTrades koleksiyonuna yaz (collectionGroup index gerekmez)
  const tradeSnap = await getDoc(tradeRef);
  if (!tradeSnap.exists()) return;
  const data = tradeSnap.data();
  const userSnap = await getDoc(doc(db, "users", uid));
  const userData = userSnap.exists() ? userSnap.data() : null;
  await setDoc(doc(db, "sharedTrades", id), {
    ownerUid: uid,
    pair: data.pair,
    direction: data.direction,
    entryDate: data.entryDate,
    exitDate: data.exitDate,
    result: data.result ?? 0,
    rr: data.rr ?? 0,
    netPnl: data.netPnl ?? 0,
    strategy: data.strategy ?? "",
    note: data.note ?? "",
    screenshotUrl: data.screenshotUrl ?? "",
    likeCount: data.likeCount ?? 0,
    dislikeCount: data.dislikeCount ?? 0,
    userDisplayName: userData?.displayName ?? "Trader",
    userAvatarUrl: userData?.avatarUrl ?? null,
    userAvatarColor: userData?.avatarColor ?? "#2ED9A4",
    entryDateServer: data.entryDate,
    createdAt: serverTimestamp(),
  });
}

export async function unshareTrade(uid: string, id: string) {
  await updateDoc(tradeDoc(uid, id), { isShared: false, visibility: "private" });
  await deleteDoc(doc(db, "sharedTrades", id)).catch(() => {});
}

export async function cleanupOldDeletedTrades(uid: string) {
  const ninetyDaysAgo = new Date();
  ninetyDaysAgo.setDate(ninetyDaysAgo.getDate() - 90);

  const q = query(
    tradesCollection(uid),
    where("deletedAt", "<", ninetyDaysAgo)
  );
  const snap = await getDocs(q);
  if (snap.empty) return 0;

  const batch = writeBatch(db);
  snap.docs.forEach((d) => batch.delete(d.ref));
  await batch.commit();
  return snap.size;
}

// ─── Social Interactions (Likes, Comments, Reactions) ───

function likesCollection(ownerUid: string, tradeId: string) {
  return collection(db, "users", ownerUid, "trades", tradeId, "likes");
}

function likeDoc(ownerUid: string, tradeId: string, userUid: string) {
  return doc(db, "users", ownerUid, "trades", tradeId, "likes", userUid);
}

function commentsCollection(ownerUid: string, tradeId: string) {
  return collection(db, "users", ownerUid, "trades", tradeId, "comments");
}

function commentDoc(ownerUid: string, tradeId: string, commentId: string) {
  return doc(db, "users", ownerUid, "trades", tradeId, "comments", commentId);
}

function reactionsCollection(ownerUid: string, tradeId: string) {
  return collection(db, "users", ownerUid, "trades", tradeId, "reactions");
}

function reactionDoc(ownerUid: string, tradeId: string, userUid: string) {
  return doc(db, "users", ownerUid, "trades", tradeId, "reactions", userUid);
}

export async function toggleLike(ownerUid: string, tradeId: string, userUid: string) {
  const ref = likeDoc(ownerUid, tradeId, userUid);
  const snap = await getDoc(ref);
  if (snap.exists()) {
    await deleteDoc(ref);
    await updateDoc(tradeDoc(ownerUid, tradeId), { likeCount: increment(-1) });
    return false; // unliked
  } else {
    await setDoc(ref, { uid: userUid, createdAt: serverTimestamp() });
    await updateDoc(tradeDoc(ownerUid, tradeId), { likeCount: increment(1) });
    // Ensure likeCount starts at 0
    return true; // liked
  }
}

export function subscribeToLikeCount(ownerUid: string, tradeId: string, callback: (count: number) => void) {
  return onSnapshot(tradeDoc(ownerUid, tradeId), (snap) => {
    if (snap.exists()) {
      callback((snap.data()?.likeCount as number) ?? 0);
    }
  });
}

export async function isLiked(ownerUid: string, tradeId: string, userUid: string): Promise<boolean> {
  const snap = await getDoc(likeDoc(ownerUid, tradeId, userUid));
  return snap.exists();
}

export function subscribeToIsLiked(ownerUid: string, tradeId: string, userUid: string, callback: (liked: boolean) => void) {
  return onSnapshot(likeDoc(ownerUid, tradeId, userUid), (snap) => {
    callback(snap.exists());
  });
}

function dislikesCollection(ownerUid: string, tradeId: string) {
  return collection(db, "users", ownerUid, "trades", tradeId, "dislikes");
}

function dislikeDoc(ownerUid: string, tradeId: string, userUid: string) {
  return doc(db, "users", ownerUid, "trades", tradeId, "dislikes", userUid);
}

export async function toggleDislike(ownerUid: string, tradeId: string, userUid: string) {
  const ref = dislikeDoc(ownerUid, tradeId, userUid);
  const snap = await getDoc(ref);
  if (snap.exists()) {
    await deleteDoc(ref);
    await updateDoc(tradeDoc(ownerUid, tradeId), { dislikeCount: increment(-1) });
    return false;
  } else {
    await setDoc(ref, { uid: userUid, createdAt: serverTimestamp() });
    await updateDoc(tradeDoc(ownerUid, tradeId), { dislikeCount: increment(1) });
    return true;
  }
}

export function subscribeToDislikeCount(ownerUid: string, tradeId: string, callback: (count: number) => void) {
  return onSnapshot(tradeDoc(ownerUid, tradeId), (snap) => {
    if (snap.exists()) {
      callback((snap.data()?.dislikeCount as number) ?? 0);
    }
  });
}

export function subscribeToIsDisliked(ownerUid: string, tradeId: string, userUid: string, callback: (disliked: boolean) => void) {
  return onSnapshot(dislikeDoc(ownerUid, tradeId, userUid), (snap) => {
    callback(snap.exists());
  });
}

export async function addComment(ownerUid: string, tradeId: string, comment: Omit<TradeComment, "id" | "createdAt">) {
  const docRef = await addDoc(commentsCollection(ownerUid, tradeId), {
    ...comment,
    createdAt: serverTimestamp(),
  });
  return docRef.id;
}

export function subscribeToComments(ownerUid: string, tradeId: string, callback: (comments: TradeComment[]) => void) {
  const q = query(
    commentsCollection(ownerUid, tradeId),
    orderBy("createdAt", "asc")
  );
  return onSnapshot(q, (snap) => {
    const list = snap.docs.map((d) => {
      const data = d.data();
      return {
        id: d.id,
        uid: data.uid as string,
        displayName: data.displayName as string,
        avatarUrl: data.avatarUrl as string | undefined,
        text: data.text as string,
        createdAt: (data.createdAt as Timestamp)?.toDate?.() ?? new Date(),
      } as TradeComment;
    });
    callback(list);
  });
}

export async function setReaction(ownerUid: string, tradeId: string, userUid: string, emoji: string) {
  const ref = reactionDoc(ownerUid, tradeId, userUid);
  const snap = await getDoc(ref);
  if (snap.exists() && snap.data()?.emoji === emoji) {
    // Same emoji - remove it (toggle off)
    await deleteDoc(ref);
    return null;
  }
  await setDoc(ref, { uid: userUid, emoji, createdAt: serverTimestamp() });
  return emoji;
}

export function subscribeToReactions(ownerUid: string, tradeId: string, callback: (reactions: TradeReaction[]) => void) {
  return onSnapshot(reactionsCollection(ownerUid, tradeId), (snap) => {
    const list = snap.docs.map((d) => {
      const data = d.data();
      return {
        uid: data.uid as string,
        emoji: data.emoji as string,
        createdAt: (data.createdAt as Timestamp)?.toDate?.() ?? new Date(),
      } as TradeReaction;
    });
    callback(list);
  });
}

export async function getReactions(ownerUid: string, tradeId: string): Promise<TradeReaction[]> {
  const snap = await getDocs(reactionsCollection(ownerUid, tradeId));
  return snap.docs.map((d) => {
    const data = d.data();
    return {
      uid: data.uid as string,
      emoji: data.emoji as string,
      createdAt: (data.createdAt as Timestamp)?.toDate?.() ?? new Date(),
    } as TradeReaction;
  });
}

export function subscribeToReaction(ownerUid: string, tradeId: string, userUid: string, callback: (emoji: string | null) => void) {
  return onSnapshot(reactionDoc(ownerUid, tradeId, userUid), (snap) => {
    if (snap.exists()) {
      callback(snap.data()?.emoji as string ?? null);
    } else {
      callback(null);
    }
  });
}
