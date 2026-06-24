"use client";

import { useEffect, useState } from "react";
import {
  collection,
  query,
  where,
  orderBy,
  onSnapshot,
} from "firebase/firestore";
import { db } from "@/lib/firebase";
import { Trade } from "@/lib/types";

interface SharedTradeListProps {
  uid: string;
}

export default function SharedTradeList({ uid }: SharedTradeListProps) {
  const [trades, setTrades] = useState<Trade[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const q = query(
      collection(db, "users", uid, "trades"),
      where("isShared", "==", true),
      orderBy("entryDate", "desc")
    );
    const unsub = onSnapshot(q, (snap) => {
      const list = snap.docs.map((d) => {
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
          createdAt:
            (data.createdAt as { toDate?: () => Date })?.toDate?.().toISOString?.() ??
            data.entryDate,
          isShared: true,
        } as Trade;
      });
      setTrades(list);
      setLoading(false);
    });
    return unsub;
  }, [uid]);

  if (loading) {
    return (
      <div className="text-center py-8 text-paper-500 text-sm">
        Yükleniyor...
      </div>
    );
  }

  if (trades.length === 0) {
    return (
      <div className="text-center py-8 text-paper-500 text-sm">
        Henüz paylaşılmış işlem bulunmuyor.
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {trades.map((trade) => (
        <div
          key={trade.id}
          className="rounded-lg border border-ink-800 bg-ink-950 p-4"
        >
          <div className="flex items-center justify-between flex-wrap gap-2">
            <div className="flex items-center gap-3">
              <span className="font-mono font-semibold text-paper-100">
                {trade.pair}
              </span>
              <span
                className={`text-xs font-mono px-1.5 py-0.5 rounded ${
                  trade.direction === "long"
                    ? "bg-mint-500/15 text-mint-400"
                    : trade.direction === "short"
                    ? "bg-coral-500/15 text-coral-400"
                    : "bg-paper-500/15 text-paper-400"
                }`}
              >
                {trade.direction === "long"
                  ? "UZUN"
                  : trade.direction === "short"
                  ? "KISA"
                  : "BE"}
              </span>
            </div>
            <span
              className={`font-mono text-sm font-semibold ${
                trade.result >= 0 ? "text-mint-400" : "text-coral-400"
              }`}
            >
              {trade.result >= 0 ? "+" : ""}
              {trade.result.toFixed(2)}%
            </span>
          </div>
          {trade.strategy && (
            <p className="text-xs text-paper-500 mt-1 font-mono">
              Strateji: {trade.strategy}
            </p>
          )}
          {trade.note && (
            <p className="text-xs text-paper-400 mt-1 line-clamp-2">
              {trade.note}
            </p>
          )}
        </div>
      ))}
    </div>
  );
}
