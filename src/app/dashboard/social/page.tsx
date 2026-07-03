"use client";

import { useEffect, useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import { format, parseISO } from "date-fns";

interface FeedItem {
  tradeId: string;
  ownerUid: string;
  pair: string;
  direction: string;
  entryDate: string;
  exitDate: string;
  result: number;
  rr: number;
  netPnl: number;
  strategy: string;
  note: string;
  screenshotUrl: string;
  likeCount: number;
  user: {
    displayName: string;
    avatarUrl: string | null;
    avatarColor: string;
  };
}

export default function SocialFeedPage() {
  const router = useRouter();
  const [items, setItems] = useState<FeedItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [hasMore, setHasMore] = useState(true);
  const [nextCursor, setNextCursor] = useState<string | null>(null);

  const fetchFeed = useCallback(async (cursor?: string | null) => {
    const params = new URLSearchParams({ limit: "20" });
    if (cursor) params.set("lastEntryDate", cursor);

    const res = await fetch(`/api/social/feed?${params}`);
    if (!res.ok) return;

    const data = await res.json();
    return data as {
      items: FeedItem[];
      hasMore: boolean;
      nextCursor: string | null;
    };
  }, []);

  useEffect(() => {
    fetchFeed().then((data) => {
      if (data) {
        setItems(data.items);
        setHasMore(data.hasMore);
        setNextCursor(data.nextCursor);
      }
      setLoading(false);
    });
  }, [fetchFeed]);

  async function loadMore() {
    if (loadingMore || !hasMore || !nextCursor) return;
    setLoadingMore(true);
    const data = await fetchFeed(nextCursor);
    if (data) {
      setItems((prev) => [...prev, ...data.items]);
      setHasMore(data.hasMore);
      setNextCursor(data.nextCursor);
    }
    setLoadingMore(false);
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <div className="w-8 h-8 border-2 border-mint-500 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="space-y-6 animate-fade-in-up">
      <div>
        <h1 className="font-display text-2xl font-semibold">Keşfet</h1>
        <p className="text-sm text-paper-300 mt-1">
          Diğer traderların paylaştığı işlemleri keşfet.
        </p>
      </div>

      {items.length === 0 && (
        <div className="rounded-xl border border-ink-800 bg-ink-900 p-12 text-center">
          <p className="text-paper-400">Henüz paylaşılmış işlem bulunmuyor.</p>
        </div>
      )}

      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4">
        {items.map((item) => (
          <button
            key={`${item.ownerUid}_${item.tradeId}`}
            onClick={() => router.push(`/dashboard/social/trade/${item.tradeId}`)}
            className="text-left rounded-xl border border-ink-800 bg-ink-900 overflow-hidden hover:border-ink-700 hover:bg-ink-850 transition-all duration-200 group"
          >
            {/* Image */}
            {item.screenshotUrl ? (
              <div className="aspect-video bg-ink-950 overflow-hidden">
                <img
                  src={item.screenshotUrl}
                  alt={`${item.pair} grafik`}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                />
              </div>
            ) : (
              <div className="aspect-video bg-ink-950 flex items-center justify-center text-paper-500 font-mono text-xs">
                görsel yok
              </div>
            )}

            <div className="p-3 space-y-2">
              {/* User info */}
              <div className="flex items-center gap-2">
                <div
                  className="w-6 h-6 rounded-full flex items-center justify-center text-[10px] font-bold text-ink-950 shrink-0"
                  style={{ backgroundColor: item.user.avatarColor }}
                >
                  {item.user.displayName.charAt(0).toUpperCase()}
                </div>
                <span className="text-xs font-mono text-paper-400 truncate">
                  {item.user.displayName}
                </span>
              </div>

              {/* Trade info */}
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className="font-mono font-semibold text-paper-100 text-sm">
                    {item.pair}
                  </span>
                  <span
                    className={`text-[10px] font-mono px-1.5 py-0.5 rounded ${
                      item.direction === "long"
                        ? "bg-mint-500/15 text-mint-400"
                        : item.direction === "short"
                        ? "bg-coral-500/15 text-coral-400"
                        : "bg-paper-500/15 text-paper-400"
                    }`}
                  >
                    {item.direction === "long"
                      ? "UZUN"
                      : item.direction === "short"
                      ? "KISA"
                      : "BE"}
                  </span>
                </div>
                <span
                  className={`font-mono text-sm font-semibold ${
                    item.result >= 0 ? "text-mint-400" : "text-coral-400"
                  }`}
                >
                  {item.result >= 0 ? "+" : ""}
                  {item.result.toFixed(2)}%
                </span>
              </div>

              {/* Like count */}
              <div className="flex items-center gap-1 text-xs text-paper-500">
                <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
                </svg>
                {item.likeCount}
              </div>
            </div>
          </button>
        ))}
      </div>

      {/* Load more */}
      {hasMore && (
        <div className="flex justify-center pt-4">
          <button
            onClick={loadMore}
            disabled={loadingMore}
            className="rounded-lg border border-ink-700 text-paper-300 px-6 py-2.5 text-sm hover:bg-ink-800 transition disabled:opacity-40"
          >
            {loadingMore ? "Yükleniyor..." : "Daha Fazla"}
          </button>
        </div>
      )}
    </div>
  );
}
