"use client";

import { useState, useRef } from "react";
import { Trade, TradeVisibility } from "@/lib/types";
import { shareTrade } from "@/lib/trades";
import { format, parseISO } from "date-fns";

interface Props {
  trade: Trade;
  uid: string;
  onEdit: () => void;
  onDelete: () => void;
  index?: number;
}

const DIRECTION_LABEL: Record<Trade["direction"], string> = {
  long: "LONG",
  short: "SHORT",
  be: "BE",
};

export default function TradeCard({ trade, uid, onEdit, onDelete, index = 0 }: Props) {
  const [copied, setCopied] = useState(false);
  const [showVis, setShowVis] = useState(false);
  const [visibility, setVisibility] = useState<TradeVisibility>(trade.visibility ?? "public");
  const copyTimer = useRef<ReturnType<typeof setTimeout>>(undefined);

  async function handleShare(vis?: TradeVisibility) {
    const v = vis ?? visibility;
    try {
      await shareTrade(uid, trade.id, v);
      const url = `${window.location.origin}/share/${trade.id}`;
      await navigator.clipboard.writeText(url);
      setVisibility(v);
      setCopied(true);
      if (copyTimer.current) clearTimeout(copyTimer.current);
      copyTimer.current = setTimeout(() => {
        setCopied(false);
        copyTimer.current = undefined;
      }, 2000);
    } catch {
      // clipboard unavailable
    }
  }
  const toneClass =
    trade.direction === "long"
      ? "border-mint-500/40 text-mint-400 bg-mint-500/10"
      : trade.direction === "short"
      ? "border-coral-500/40 text-coral-400 bg-coral-500/10"
      : "border-amber-400/40 text-amber-400 bg-amber-400/10";

  const delay = Math.min(index, 5);

  return (
    <div
      className={`group rounded-xl border border-ink-800 bg-ink-900 overflow-hidden flex flex-col sm:flex-row hover:border-ink-700 hover:bg-ink-850 transition-all duration-200 animate-fade-in-up stagger-${delay + 1}`}
    >
      {trade.screenshotUrl ? (
        <a
          href={trade.screenshotUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="sm:w-48 shrink-0 bg-ink-950 flex items-center justify-center border-b sm:border-b-0 sm:border-r border-ink-800"
        >
          <img
            src={trade.screenshotUrl}
            alt={`${trade.pair} grafik görseli`}
            className="w-full h-32 sm:h-full object-cover"
          />
        </a>
      ) : (
        <div className="sm:w-48 h-32 shrink-0 bg-ink-950 border-b sm:border-b-0 sm:border-r border-ink-800 flex items-center justify-center text-xs text-paper-500 font-mono group-hover:bg-ink-900 transition-colors duration-200">
          görsel yok
        </div>
      )}

      <div className="flex-1 p-4 flex flex-col gap-3">
        <div className="flex items-start justify-between gap-3">
          <div>
            <div className="flex items-center gap-2">
              <span className="font-display font-semibold text-lg group-hover:text-mint-400 transition-colors duration-200">{trade.pair}</span>
              <span
                className={`text-[11px] font-mono font-semibold px-2 py-0.5 rounded border ${toneClass}`}
              >
                {DIRECTION_LABEL[trade.direction]}
              </span>
            </div>
            <p className="text-xs text-paper-500 font-mono mt-1">
              {format(parseISO(trade.entryDate), "dd MMM yyyy HH:mm")} →{" "}
              {format(parseISO(trade.exitDate), "dd MMM yyyy HH:mm")}
            </p>
          </div>

          <div className="text-right">
            <p
              className={`font-mono font-semibold text-lg ${
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
            <p className="text-xs text-paper-500 font-mono">{trade.rr}R</p>
            {trade.netPnl !== 0 && (
              <p className={`text-xs font-mono font-semibold mt-0.5 ${
                trade.netPnl > 0 ? "text-mint-400" : "text-coral-400"
              }`}>
                {trade.netPnl > 0 ? "+" : ""}${trade.netPnl.toFixed(2)}
              </p>
            )}
          </div>
        </div>

        {trade.strategy && (
          <p className="text-sm text-paper-300 group-hover:text-paper-100 transition-colors duration-200">
            <span className="text-paper-500 font-mono text-xs uppercase mr-2">
              strateji
            </span>
            {trade.strategy}
          </p>
        )}

        {trade.note && (
          <p className="text-sm text-paper-300 group-hover:text-paper-100 transition-colors duration-200 border-l-2 border-ink-700 pl-3">
            {trade.note}
          </p>
        )}

        <div className="flex items-center gap-3 mt-auto pt-1 opacity-0 group-hover:opacity-100 transition-opacity duration-200">
          <button
            onClick={onEdit}
            className="text-xs font-mono text-paper-400 hover:text-mint-400 transition flex items-center gap-1"
          >
            <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
            </svg>
            düzenle
          </button>
          <button
            onClick={onDelete}
            className="text-xs font-mono text-paper-400 hover:text-coral-400 transition flex items-center gap-1"
          >
            <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
            </svg>
            sil
          </button>
          <div className="relative ml-auto">
            <button
              onClick={() => setShowVis((v) => !v)}
              className="text-xs font-mono text-paper-400 hover:text-sky-400 transition flex items-center gap-1"
            >
              <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.368 2.684 3 3 0 00-5.368-2.684z" />
              </svg>
              {copied ? "Link kopyalandı!" : visibility === "public" ? "paylaş" : visibility === "friends" ? "arkadaşlar" : "gizli"}
            </button>
            {showVis && (
              <div className="absolute bottom-full right-0 mb-1 rounded-lg border border-ink-700 bg-ink-900 shadow-xl py-1 min-w-[140px] z-10">
                {(["public", "friends", "private"] as const).map((v) => (
                  <button
                    key={v}
                    onClick={() => {
                      setVisibility(v);
                      handleShare(v);
                      setShowVis(false);
                    }}
                    className={`w-full text-left px-3 py-1.5 text-xs font-mono transition flex items-center gap-2 ${
                      visibility === v
                        ? "text-mint-400 bg-mint-500/10"
                        : "text-paper-300 hover:bg-ink-800"
                    }`}
                  >
                    {v === "public" && (
                      <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3.055 11H5a2 2 0 012 2v1a2 2 0 002 2 2 2 0 012 2v2.945M8 3.935V5.5A2.5 2.5 0 0010.5 8h.5a2 2 0 012 2 2 2 0 104 0 2 2 0 012-2h1.064M15 20.488V18a2 2 0 012-2h3.064M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                    )}
                    {v === "friends" && (
                      <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                      </svg>
                    )}
                    {v === "private" && (
                      <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                      </svg>
                    )}
                    {v === "public" ? "Herkese Açık" : v === "friends" ? "Arkadaşlar" : "Sadece Ben"}
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
