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
                {/* eslint-disable-next-line @next/next/no-img-element */}
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
                  <svg className="w-3 h-3 opacity-60" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M7.493 18.75c-.425 0-.82-.236-.975-.632A7.523 7.523 0 016 15.375c0-1.294.315-2.517.875-3.587.165-.315.412-.566.708-.73.308-.17.649-.248 1-.245h.564l.486-1.873a3.66 3.66 0 01.802-1.581l1.006-1.115c.56-.62.938-1.39 1.086-2.26l.073-.43a.753.753 0 01.745-.628c.432 0 .837.184 1.115.5.281.32.438.76.438 1.217v1.163c0 .432-.09.857-.265 1.25h4.586c.485 0 .91.22 1.184.574.302.393.417.914.306 1.453l-.975 5.055a2.307 2.307 0 01-2.262 1.842H7.493v-4.5H6.75v3.75h.743z" />
                  </svg>
                  {item.likeCount}
                </div>
                <div className="flex items-center gap-1">
                  <svg className="w-3 h-3 opacity-60" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M16.507 5.25c.425 0 .82.236.975.632.264.629.518 1.293.518 1.993 0 1.294-.315 2.517-.875 3.587a1.65 1.65 0 01-.708.73c-.308.17-.649.248-1 .245h-.564l-.486 1.873a3.66 3.66 0 01-.802 1.581l-1.006 1.115c-.56.62-.938 1.39-1.086 2.26l-.073.43a.753.753 0 01-.745.628c-.432 0-.837-.184-1.115-.5a1.71 1.71 0 01-.438-1.217v-1.163c0-.432.09-.857.265-1.25H7.476c-.485 0-.91-.22-1.184-.574a1.71 1.71 0 01-.306-1.453l.975-5.055A2.307 2.307 0 019.223 5.25h7.284z" />
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
