import {
  collection,
  addDoc,
  deleteDoc,
  doc,
  onSnapshot,
  orderBy,
  query,
  serverTimestamp,
  updateDoc,
} from "firebase/firestore";
import { db } from "./firebase";
import { Trade, TradeInput } from "./types";

function tradesCollection(uid: string) {
  return collection(db, "users", uid, "trades");
}

export function subscribeToTrades(
  uid: string,
  callback: (trades: Trade[]) => void
) {
  const q = query(tradesCollection(uid), orderBy("entryDate", "desc"));
  return onSnapshot(q, (snapshot) => {
    const trades: Trade[] = snapshot.docs.map((d) => {
      const data = d.data();
      return {
        id: d.id,
        pair: data.pair,
        direction: data.direction,
        entryDate: data.entryDate,
        exitDate: data.exitDate,
        rr: data.rr,
        result: data.result,
        netPnl: data.netPnl ?? 0,
        strategy: data.strategy,
        note: data.note,
        screenshotUrl: data.screenshotUrl,
        createdAt: data.createdAt?.toDate?.().toISOString?.() ?? new Date().toISOString(),
      };
    });
    callback(trades);
  });
}

export async function addTrade(uid: string, trade: TradeInput) {
  await addDoc(tradesCollection(uid), {
    ...trade,
    createdAt: serverTimestamp(),
  });
}

export async function updateTrade(uid: string, id: string, trade: Partial<TradeInput>) {
  await updateDoc(doc(db, "users", uid, "trades", id), trade);
}

export async function deleteTrade(uid: string, id: string) {
  await deleteDoc(doc(db, "users", uid, "trades", id));
}
