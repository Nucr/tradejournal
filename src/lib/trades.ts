import {
  collection,
  addDoc,
  doc,
  getDocs,
  onSnapshot,
  orderBy,
  query,
  serverTimestamp,
  updateDoc,
  writeBatch,
  where,
} from "firebase/firestore";
import { db } from "./firebase";
import { Trade, TradeInput } from "./types";
import { syncUserScore } from "./scoreEngine";

function tradesCollection(uid: string) {
  return collection(db, "users", uid, "trades");
}

function tradeDoc(uid: string, id: string) {
  return doc(db, "users", uid, "trades", id);
}

function mapTrade(d: { id: string; data: () => Record<string, unknown> }): Trade {
  const data = d.data();
  return {
    id: d.id,
    pair: data.pair as string,
    direction: data.direction as Trade["direction"],
    entryDate: data.entryDate as string,
    exitDate: data.exitDate as string,
    rr: (data.rr as number) ?? 0,
    result: (data.result as number) ?? 0,
    netPnl: (data.netPnl as number) ?? 0,
    strategy: (data.strategy as string) ?? "",
    note: (data.note as string) ?? "",
    screenshotUrl: (data.screenshotUrl as string) ?? "",
    createdAt: (data.createdAt as { toDate?: () => Date })?.toDate?.().toISOString?.() ?? (data.entryDate as string) ?? new Date().toISOString(),
    deletedAt: data.deletedAt == null ? null : (data.deletedAt as { toDate?: () => Date })?.toDate?.().toISOString?.() ?? null,
  };
}

export function subscribeToTrades(
  uid: string,
  callback: (trades: Trade[]) => void
) {
  const q = query(
    tradesCollection(uid),
    orderBy("entryDate", "desc")
  );
  console.log("subscribeToTrades: starting listener for", uid);
  return onSnapshot(q, (snapshot) => {
    console.log("subscribeToTrades: snapshot received", snapshot.docs.length, "docs");
    const ids = snapshot.docs.map(d => d.id);
    let allTrades: Trade[] = [];
    try {
      allTrades = snapshot.docs.map(mapTrade);
    } catch (mapErr) {
      console.error("subscribeToTrades: mapTrade error", mapErr);
      return;
    }
    const deletedIds = allTrades.filter(t => t.deletedAt != null).map(t => t.id);
    const trades = allTrades.filter((t) => t.deletedAt == null);
    console.log("subscribeToTrades: doc IDs", ids, "deleted IDs", deletedIds, "after filter", trades.length);
    callback(trades);
  }, (err) => {
    console.error("subscribeToTrades error:", err?.message, err);
  });
}

export async function addTrade(uid: string, trade: TradeInput) {
  console.log("addTrade called", { uid, trade });
  let docRefId: string | null = null;
  try {
    const docRef = await addDoc(tradesCollection(uid), {
      ...trade,
      createdAt: serverTimestamp(),
    });
    docRefId = docRef.id;
    console.log("addDoc succeeded", docRef.id);
  } catch (err) {
    console.error("addDoc failed:", err);
    throw err;
  }
  // Verify the doc is readable
  try {
    const verifySnap = await getDocs(tradesCollection(uid));
    const verifyIds = verifySnap.docs.map(d => d.id);
    console.log("addTrade: verify getDocs count", verifySnap.docs.length, "ids", verifyIds, "newDocIncluded?", verifyIds.includes(docRefId));
  } catch (err) {
    console.error("addTrade: verify getDocs failed", err);
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
  await updateDoc(tradeDoc(uid, id), { isShared: true, visibility: visibility ?? "public" });
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
