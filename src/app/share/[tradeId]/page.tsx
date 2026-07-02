"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { format } from "date-fns";

interface TradeData {
  pair: string;
  direction: "long" | "short" | "be";
  entryDate: string;
  exitDate: string;
  rr: number;
  result: number;
  netPnl: number;
  strategy: string;
  note: string;
  screenshotUrl: string;
}

interface UserData {
  displayName: string;
  avatarColor: string;
}

interface ShareData {
  trade: TradeData;
  user: UserData;
}

const DIRECTION_LABEL: Record<string, string> = {
  long: "LONG",
  short: "SHORT",
  be: "BE",
};

export default function SharePage({ params }: { params: { tradeId: string } }) {
  const [data, setData] = useState<ShareData | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetch(`/api/share/${params.tradeId}`)
      .then(async (res) => {
        if (!res.ok) {
          const body = await res.json().catch(() => ({}));
          throw new Error(body.error ?? "Bir şeyler ters gitti");
        }
        return res.json();
      })
      .then((json) => setData(json))
      .catch((err) => setError(err.message));
  }, [params.tradeId]);

  useEffect(() => {
    if (data) {
      const t = data.trade;
      const sign = t.result >= 0 ? "+" : "";
      const title = `${t.pair} ${t.direction === "long" ? "Long" : t.direction === "short" ? "Short" : "BE"} ${sign}${t.result}% | RR: ${t.rr} | ${data.user.displayName}`;
      document.title = title;
    }
  }, [data]);

  if (error) {
    return (
      <div className="min-h-screen bg-ink-950 text-paper-100 flex items-center justify-center p-4">
        <div className="text-center">
          <div className="w-20 h-20 rounded-2xl bg-coral-500/10 flex items-center justify-center mx-auto mb-6">
            <svg className="w-10 h-10 text-coral-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L4.082 16.5c-.77.833.192 2.5 1.732 2.5z" />
            </svg>
          </div>
          <h1 className="font-display text-2xl font-bold mb-2">Trade bulunamadı</h1>
          <p className="text-sm text-paper-500 mb-8">{error}</p>
          <Link
            href="/dashboard/journal"
            className="inline-flex items-center gap-2 rounded-lg bg-mint-500 text-ink-950 font-semibold px-5 py-2.5 text-sm hover:bg-mint-400 transition"
          >
            Verifter&apos;a Git
          </Link>
        </div>
      </div>
    );
  }

  if (!data) {
    return (
      <div className="min-h-screen bg-ink-950 text-paper-100 flex items-center justify-center p-4">
        <div className="w-8 h-8 border-2 border-mint-500 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  const { trade, user } = data;

  const toneClass =
    trade.direction === "long"
      ? "border-mint-500/40 text-mint-400 bg-mint-500/10"
      : trade.direction === "short"
        ? "border-coral-500/40 text-coral-400 bg-coral-500/10"
        : "border-amber-400/40 text-amber-400 bg-amber-400/10";

  return (
    <div className="min-h-screen bg-ink-950 text-paper-100 flex items-center justify-center p-4">
      <div className="w-full max-w-xl">
        <div className="rounded-xl border border-ink-800 bg-ink-900 overflow-hidden">
          {trade.screenshotUrl ? (
            <div className="bg-ink-950 border-b border-ink-800">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={trade.screenshotUrl}
                alt={`${trade.pair} grafik görseli`}
                className="w-full h-48 sm:h-64 object-cover"
              />
            </div>
          ) : (
            <div className="h-32 sm:h-40 bg-ink-950 border-b border-ink-800 flex items-center justify-center text-xs text-paper-500 font-mono">
              grafik görseli yok
            </div>
          )}

          <div className="p-5 sm:p-6 space-y-5">
            <div className="flex items-center gap-3">
              <div
                className="w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold"
                style={{ backgroundColor: user.avatarColor }}
              >
                {user.displayName.charAt(0).toUpperCase()}
              </div>
              <span className="text-sm text-paper-300 font-medium">{user.displayName}</span>
            </div>

            <div className="flex items-start justify-between gap-4">
              <div>
                <div className="flex items-center gap-2">
                  <h1 className="font-display font-semibold text-2xl">{trade.pair}</h1>
                  <span
                    className={`text-xs font-mono font-semibold px-2 py-0.5 rounded border ${toneClass}`}
                  >
                    {DIRECTION_LABEL[trade.direction]}
                  </span>
                </div>
                <p className="text-sm text-paper-500 font-mono mt-2">
                  {format(new Date(trade.entryDate), "dd MMM yyyy HH:mm")} →{" "}
                  {format(new Date(trade.exitDate), "dd MMM yyyy HH:mm")}
                </p>
              </div>

              <div className="text-right">
                <p
                  className={`font-mono font-bold text-2xl ${
                    trade.result > 0
                      ? "text-mint-400"
                      : trade.result < 0
                        ? "text-coral-400"
                        : "text-amber-400"
                  }`}
                >
                  {trade.result >= 0 ? "+" : ""}
                  {trade.result}%
                </p>
                <p className="text-sm text-paper-500 font-mono mt-1">{trade.rr}R</p>
                {trade.netPnl !== 0 && (
                  <p
                    className={`text-sm font-mono font-semibold mt-0.5 ${
                      trade.netPnl > 0 ? "text-mint-400" : "text-coral-400"
                    }`}
                  >
                    {trade.netPnl > 0 ? "+" : ""}${trade.netPnl.toFixed(2)}
                  </p>
                )}
              </div>
            </div>

            {trade.strategy && (
              <p className="text-sm text-paper-300">
                <span className="text-paper-500 font-mono text-xs uppercase mr-2">
                  strateji
                </span>
                {trade.strategy}
              </p>
            )}

            {trade.note && (
              <p className="text-sm text-paper-300 border-l-2 border-ink-700 pl-3">
                {trade.note}
              </p>
            )}

            <div className="pt-2 border-t border-ink-800">
              <Link
                href="/dashboard/journal"
                className="inline-flex items-center gap-2 rounded-lg bg-mint-500 text-ink-950 font-semibold px-5 py-2.5 text-sm hover:bg-mint-400 transition"
              >
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M12 4v16m8-8H4"
                  />
                </svg>
                Verifter&apos;da Görüntüle
              </Link>
            </div>
          </div>
        </div>

        <p className="text-center text-xs text-paper-600 mt-4">
          Powered by Verifter Trade Journal
        </p>
      </div>
    </div>
  );
}
