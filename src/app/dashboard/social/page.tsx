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
  dislikeCount: number;
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
  const [error, setError] = useState("");

  const fetchFeed = useCallback(async (cursor?: string | null) => {
    const params = new URLSearchParams({ limit: "20" });
    if (cursor) params.set("lastEntryDate", cursor);

    const res = await fetch(`/api/social/feed?${params}`);
    if (!res.ok) {
      const err = await res.json().catch(() => ({ error: "API hatası" }));
      throw new Error(err.error || "İşlemler yüklenemedi");
    }

    const data = await res.json();
    return data as {
      items: FeedItem[];
      hasMore: boolean;
      nextCursor: string | null;
    };
  }, []);

  useEffect(() => {
    fetchFeed()
      .then((data) => {
        if (data) {
          setItems(data.items);
          setHasMore(data.hasMore);
          setNextCursor(data.nextCursor);
        }
        setLoading(false);
      })
      .catch((err) => {
        setError(err.message);
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

  if (error) {
    return (
      <div className="space-y-6 animate-fade-in-up">
        <div>
          <h1 className="font-display text-2xl font-semibold">Keşfet</h1>
          <p className="text-sm text-paper-300 mt-1">
            Diğer traderların paylaştığı işlemleri keşfet.
          </p>
        </div>
        <div className="rounded-xl border border-coral-500/30 bg-coral-500/5 p-12 text-center">
          <p className="text-coral-400">{error}</p>
        </div>
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

      {items.length === 0 && !error && (
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

              {/* Like & Dislike counts */}
              <div className="flex items-center gap-3 text-xs text-paper-500">
                <div className="flex items-center gap-1">
                  <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M6.633 10.25c.806 0 1.533-.446 2.031-1.08a9.041 9.041 0 012.861-2.4c.723-.384 1.35-.956 1.653-1.715a4.498 4.498 0 00.322-1.672V2.75a.75.75 0 01.75-.75 2.25 2.25 0 012.25 2.25c0 1.152-.26 2.243-.723 3.218-.266.558.107 1.282.725 1.282h3.126c1.026 0 1.945.694 2.054 1.715.045.422.068.85.068 1.285a11.95 11.95 0 01-2.649 7.521c-.388.482-.987.729-1.605.729H13.48c-.483 0-.964-.078-1.423-.23l-3.114-1.04a4.501 4.501 0 00-1.423-.23H5.904" />
                  </svg>
                  {item.likeCount}
                </div>
                <div className="flex items-center gap-1">
                  <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M7.5 15h2.25m8.024-9.75c.011.05.028.1.052.148.591 1.2.924 2.55.924 3.977a8.96 8.96 0 01-.999 4.125m.023-8.25c-.076-.365.183-.75.575-.75h.908c.889 0 1.713.518 1.972 1.368.339 1.11.521 2.287.521 3.507 0 1.553-.295 3.036-.831 4.398C20.613 14.547 19.833 15 19 15h-1.053c-.472 0-.745-.556-.5-.96a8.95 8.95 0 001.302-4.665c0-1.194-.232-2.333-.654-3.375z" />
                  </svg>
                  {item.dislikeCount}
                </div>
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
