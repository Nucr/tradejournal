"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { useAuth } from "@/lib/auth-context";
import TradeDetailView from "@/components/TradeDetailView";

interface TradeData {
  id: string;
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
}

interface UserData {
  displayName: string;
  avatarUrl: string | null;
  avatarColor: string;
}

export default function TradeDetailPage() {
  const params = useParams();
  const router = useRouter();
  const tradeId = params?.tradeId as string;
  const { user } = useAuth();
  const [trade, setTrade] = useState<TradeData | null>(null);
  const [ownerUser, setOwnerUser] = useState<UserData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    if (!tradeId) return;
    async function load() {
      try {
        const res = await fetch(`/api/social/trade/${tradeId}`);
        if (!res.ok) {
          const err = await res.json();
          setError(err.error || "İşlem yüklenirken hata oluştu.");
          return;
        }
        const data = await res.json();
        setTrade(data.trade);
        setOwnerUser(data.user);
      } catch {
        setError("İşlem yüklenirken bir hata oluştu.");
      } finally {
        setLoading(false);
      }
    }
    load();
  }, [tradeId]);

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <div className="w-8 h-8 border-2 border-mint-500 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="space-y-4 animate-fade-in-up">
        <button
          onClick={() => router.back()}
          className="text-sm text-paper-400 hover:text-paper-200 transition flex items-center gap-1"
        >
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
          Geri
        </button>
        <div className="rounded-xl border border-ink-800 bg-ink-900 p-12 text-center">
          <p className="text-paper-400">{error}</p>
        </div>
      </div>
    );
  }

  if (!trade || !ownerUser || !user) return null;

  return (
    <div className="space-y-4 animate-fade-in-up">
      <button
        onClick={() => router.back()}
        className="text-sm text-paper-400 hover:text-paper-200 transition flex items-center gap-1"
      >
        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
        </svg>
        Geri
      </button>

      <TradeDetailView
        trade={{
          id: trade.id,
          pair: trade.pair,
          direction: trade.direction as "long" | "short" | "be",
          entryDate: trade.entryDate,
          exitDate: trade.exitDate,
          result: trade.result,
          rr: trade.rr,
          netPnl: trade.netPnl,
          strategy: trade.strategy,
          note: trade.note,
          screenshotUrl: trade.screenshotUrl,
          likeCount: trade.likeCount,
        }}
        ownerUid={trade.ownerUid}
        ownerUser={ownerUser}
        currentUid={user.uid}
        currentDisplayName={user.displayName ?? user.email?.split("@")[0] ?? "Trader"}
        currentAvatarUrl={user.photoURL ?? undefined}
      />
    </div>
  );
}
