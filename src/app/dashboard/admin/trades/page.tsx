"use client";

import { useEffect, useState, useCallback } from "react";
import {
  collectionGroup,
  getDocs,
  query,
  orderBy,
  limit,
  doc,
  updateDoc,
  deleteDoc,
  serverTimestamp,
} from "firebase/firestore";
import { db } from "@/lib/firebase";
import { useAuth } from "@/lib/auth-context";
import { isAdmin } from "@/lib/admin";
import type { Trade } from "@/lib/types";

export default function AdminTradesPage() {
  const { user } = useAuth();
  const [authorized, setAuthorized] = useState<boolean | null>(null);
  const [trades, setTrades] = useState<(Trade & { userId: string })[]>([]);

  const fetchTrades = useCallback(async () => {
    if (!authorized) return;
    const q = query(collectionGroup(db, "trades"), orderBy("entryDate", "desc"), limit(100));
    const snap = await getDocs(q);
    const list = snap.docs.map((d) => {
      const data = d.data();
      const path = d.ref.path;
      const userId = path.split("/")[1];
      return {
        id: d.id,
        userId,
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
        createdAt: data.createdAt?.toDate?.().toISOString?.() ?? "",
        deletedAt: data.deletedAt?.toDate?.().toISOString?.() ?? null,
      } as Trade & { userId: string };
    });
    setTrades(list);
  }, [authorized]);

  useEffect(() => {
    if (!user) return;
    isAdmin(user.uid).then(setAuthorized);
  }, [user]);

  useEffect(() => {
    fetchTrades();
  }, [fetchTrades]);

  async function handleDelete(userId: string, tradeId: string) {
    await updateDoc(doc(db, "users", userId, "trades", tradeId), {
      deletedAt: serverTimestamp(),
    });
    fetchTrades();
  }

  if (authorized === null) {
    return (
      <div className="flex items-center justify-center min-h-[50vh]">
        <div className="h-8 w-8 rounded-full border-2 border-mint-500 border-t-transparent animate-spin" />
      </div>
    );
  }

  if (!authorized) {
    return <p className="text-center text-coral-400 py-20">Yetkisiz erişim.</p>;
  }

  return (
    <div>
      <h1 className="font-display text-2xl font-semibold mb-1">Tüm İşlemler</h1>
      <p className="text-sm text-paper-500 mb-6">Son 100 işlem (tüm kullanıcılar).</p>

      <div className="overflow-x-auto rounded-xl border border-ink-800">
        <table className="w-full text-sm">
          <thead>
            <tr className="bg-ink-900 text-paper-500 text-left">
              <th className="px-4 py-3 font-medium">Kullanıcı</th>
              <th className="px-4 py-3 font-medium">Pair</th>
              <th className="px-4 py-3 font-medium">Yön</th>
              <th className="px-4 py-3 font-medium">RR</th>
              <th className="px-4 py-3 font-medium">Sonuç</th>
              <th className="px-4 py-3 font-medium">Tarih</th>
              <th className="px-4 py-3 font-medium">Strateji</th>
              <th className="px-4 py-3 font-medium">İşlem</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-ink-800">
            {trades.map((t) => (
              <tr key={t.id} className="hover:bg-ink-900/50">
                <td className="px-4 py-3 text-paper-100 font-mono text-xs">{t.userId.slice(0, 8)}…</td>
                <td className="px-4 py-3 text-paper-100">{t.pair}</td>
                <td className="px-4 py-3">
                  <span className={`text-xs font-mono ${
                    t.direction === "long" ? "text-mint-400" : t.direction === "short" ? "text-coral-400" : "text-paper-500"
                  }`}>
                    {t.direction === "long" ? "▲ Uzun" : t.direction === "short" ? "▼ Kısa" : "BE"}
                  </span>
                </td>
                <td className="px-4 py-3 font-mono text-xs text-paper-300">{t.rr?.toFixed(2)}</td>
                <td className={`px-4 py-3 font-mono text-xs ${t.result > 0 ? "text-mint-400" : t.result < 0 ? "text-coral-400" : "text-paper-500"}`}>
                  {t.result > 0 ? "+" : ""}${t.result?.toFixed(2) ?? "0.00"}
                </td>
                <td className="px-4 py-3 text-xs text-paper-500">{t.entryDate?.slice(0, 10)}</td>
                <td className="px-4 py-3 text-xs text-paper-500">{t.strategy || "—"}</td>
                <td className="px-4 py-3">
                  <button
                    onClick={() => handleDelete(t.userId, t.id)}
                    className="rounded border border-coral-500/30 px-2.5 py-1 text-xs text-coral-400 hover:bg-coral-500/10 transition"
                  >
                    Sil
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
