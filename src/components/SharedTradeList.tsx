"use client";

import { useEffect, useState } from "react";
import {
  collection,
  doc,
  query,
  where,
  orderBy,
  onSnapshot,
  getDoc,
} from "firebase/firestore";
import { db } from "@/lib/firebase";
import { Trade } from "@/lib/types";
import TradeDetailModal from "./TradeDetailModal";
import { useAuth } from "@/lib/auth-context";

interface SharedTradeListProps {
  uid: string;
  currentUid?: string;
}

export default function SharedTradeList({ uid, currentUid }: SharedTradeListProps) {
  const [trades, setTrades] = useState<Trade[]>([]);
  const [loading, setLoading] = useState(true);
  const [isFriend, setIsFriend] = useState(false);
  const [selectedTrade, setSelectedTrade] = useState<Trade | null>(null);
  const isOwner = currentUid === uid;
  const { user } = useAuth();

  useEffect(() => {
    if (!currentUid || currentUid === uid) {
      setIsFriend(false);
      return;
    }
    getDoc(doc(db, "users", currentUid)).then((snap) => {
      if (snap.exists()) {
        const friends: string[] = snap.data()?.friends ?? [];
        setIsFriend(friends.includes(uid));
      }
    });
  }, [currentUid, uid]);

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
          visibility: (data.visibility as Trade["visibility"]) ?? "public",
          likeCount: (data.likeCount as number) ?? 0,
        } as Trade;
      });
      // Filter by visibility
      const filtered = list.filter((t) => {
        if (isOwner) return true;
        if (t.visibility === "private") return false;
        if (t.visibility === "friends" && !isFriend) return false;
        return true;
      });
      setTrades(filtered);
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

  const me = user;
  const currentDisplayName = me?.displayName ?? me?.email?.split("@")[0] ?? "Trader";

  return (
    <>
      <div className="space-y-3">
        {trades.map((trade) => (
          <button
            key={trade.id}
            onClick={() => setSelectedTrade(trade)}
            className="w-full text-left rounded-lg border border-ink-800 bg-ink-950 p-4 hover:border-ink-700 hover:bg-ink-900 transition-all duration-200"
          >
            <div className="flex items-center justify-between flex-wrap gap-2">
              <div className="flex items-center gap-3">
                {trade.screenshotUrl && (
                  <div className="w-12 h-12 rounded-md overflow-hidden shrink-0 bg-ink-800">
                    <img
                      src={trade.screenshotUrl}
                      alt=""
                      className="w-full h-full object-cover"
                    />
                  </div>
                )}
                <div>
                  <div className="flex items-center gap-2">
                    <span className="font-mono font-semibold text-paper-100">
                      {trade.pair}
                    </span>
                    <span
                      className={`text-[10px] font-mono px-1.5 py-0.5 rounded ${
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
                  {trade.strategy && (
                    <p className="text-xs text-paper-500 font-mono">
                      {trade.strategy}
                    </p>
                  )}
                </div>
              </div>
              <div className="flex items-center gap-3">
                {trade.likeCount !== undefined && trade.likeCount > 0 && (
                  <span className="text-xs text-paper-500 font-mono flex items-center gap-1">
                    <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
                    </svg>
                    {trade.likeCount}
                  </span>
                )}
                <span
                  className={`font-mono text-sm font-semibold ${
                    trade.result >= 0 ? "text-mint-400" : "text-coral-400"
                  }`}
                >
                  {trade.result >= 0 ? "+" : ""}
                  {trade.result.toFixed(2)}%
                </span>
              </div>
            </div>
            {trade.note && (
              <p className="text-xs text-paper-400 mt-2 line-clamp-1 text-left">
                {trade.note}
              </p>
            )}
          </button>
        ))}
      </div>

      {selectedTrade && me && (
        <TradeDetailModal
          trade={selectedTrade}
          ownerUid={uid}
          currentUid={me.uid}
          currentDisplayName={currentDisplayName}
          currentAvatarUrl={me.photoURL ?? undefined}
          onClose={() => setSelectedTrade(null)}
        />
      )}
    </>
  );
}
