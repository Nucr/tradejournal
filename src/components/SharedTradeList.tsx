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
import { useRouter } from "next/navigation";

interface SharedTradeListProps {
  uid: string;
  currentUid?: string;
}

export default function SharedTradeList({ uid, currentUid }: SharedTradeListProps) {
  const router = useRouter();
  const [trades, setTrades] = useState<Trade[]>([]);
  const [loading, setLoading] = useState(true);
  const [isFriend, setIsFriend] = useState(false);
  const isOwner = currentUid === uid;

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
  }, [uid, isOwner, isFriend]);

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
        <button
          key={trade.id}
          onClick={() => router.push(`/dashboard/social/trade/${trade.id}`)}
          className="w-full text-left rounded-lg border border-ink-800 bg-ink-950 p-4 hover:border-ink-700 hover:bg-ink-900 transition-all duration-200"
        >
          <div className="flex items-center justify-between flex-wrap gap-2">
            <div className="flex items-center gap-3">
              {trade.screenshotUrl && (
                <div className="w-12 h-12 rounded-md overflow-hidden shrink-0 bg-ink-800">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
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
                  <svg className="w-3 h-3 opacity-60" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M7.493 18.75c-.425 0-.82-.236-.975-.632A7.523 7.523 0 016 15.375c0-1.294.315-2.517.875-3.587.165-.315.412-.566.708-.73.308-.17.649-.248 1-.245h.564l.486-1.873a3.66 3.66 0 01.802-1.581l1.006-1.115c.56-.62.938-1.39 1.086-2.26l.073-.43a.753.753 0 01.745-.628c.432 0 .837.184 1.115.5.281.32.438.76.438 1.217v1.163c0 .432-.09.857-.265 1.25h4.586c.485 0 .91.22 1.184.574.302.393.417.914.306 1.453l-.975 5.055a2.307 2.307 0 01-2.262 1.842H7.493v-4.5H6.75v3.75h.743z" />
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
  );
}
