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
    createdAt: (data.createdAt as { toDate?: () => Date })?.toDate?.().toISOString?.() ?? new Date().toISOString(),
    deletedAt: data.deletedAt == null ? null : (data.deletedAt as { toDate?: () => Date })?.toDate?.().toISOString?.() ?? null,
  };
}

export function subscribeToTrades(
  uid: string,
  callback: (trades: Trade[]) => void
) {
  const q = query(
    tradesCollection(uid),
    where("deletedAt", "==", null),
    orderBy("entryDate", "desc")
  );
  return onSnapshot(q, (snapshot) => {
    const trades = snapshot.docs.map(mapTrade);
    callback(trades);
  }, (err) => {
    console.error("subscribeToTrades error:", err);
  });
}

export async function addTrade(uid: string, trade: TradeInput) {
  await addDoc(tradesCollection(uid), {
    ...trade,
    createdAt: serverTimestamp(),
  });
  await syncUserScore(uid);
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
