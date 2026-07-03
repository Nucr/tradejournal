"use client";

import { useEffect, useState } from "react";
import { Trade, TradeReaction, TradeComment } from "@/lib/types";
import { format, parseISO } from "date-fns";
import {
  toggleLike,
  subscribeToLikeCount,
  subscribeToIsLiked,
  toggleDislike,
  subscribeToDislikeCount,
  subscribeToIsDisliked,
  addComment,
  subscribeToComments,
  setReaction,
  subscribeToReactions,
  subscribeToReaction,
} from "@/lib/trades";
import Link from "next/link";

const EMOJIS = ["🔥", "💎", "🚀", "💯", "❤️", "😍", "👏", "✅"];

interface TradeDetailViewProps {
  trade: Pick<Trade, "id" | "pair" | "direction" | "entryDate" | "exitDate" | "result" | "rr" | "netPnl" | "strategy" | "note" | "screenshotUrl" | "likeCount" | "dislikeCount">;
  ownerUid: string;
  ownerUser: {
    displayName: string;
    avatarUrl?: string | null;
    avatarColor: string;
  };
  currentUid: string;
  currentDisplayName: string;
  currentAvatarUrl?: string;
}

export default function TradeDetailView({
  trade,
  ownerUid,
  ownerUser,
  currentUid,
  currentDisplayName,
  currentAvatarUrl,
}: TradeDetailViewProps) {
  const [likeCount, setLikeCount] = useState(trade.likeCount ?? 0);
  const [dislikeCount, setDislikeCount] = useState(trade.dislikeCount ?? 0);
  const [liked, setLiked] = useState(false);
  const [disliked, setDisliked] = useState(false);
  const [comments, setComments] = useState<TradeComment[]>([]);
  const [reactions, setReactions] = useState<TradeReaction[]>([]);
  const [myReaction, setMyReaction] = useState<string | null>(null);
  const [commentText, setCommentText] = useState("");
  const [sendingComment, setSendingComment] = useState(false);

  useEffect(() => {
    const unsubLikeCount = subscribeToLikeCount(ownerUid, trade.id, setLikeCount);
    const unsubDislikeCount = subscribeToDislikeCount(ownerUid, trade.id, setDislikeCount);
    const unsubLiked = subscribeToIsLiked(ownerUid, trade.id, currentUid, setLiked);
    const unsubDisliked = subscribeToIsDisliked(ownerUid, trade.id, currentUid, setDisliked);
    const unsubComments = subscribeToComments(ownerUid, trade.id, setComments);
    const unsubReactions = subscribeToReactions(ownerUid, trade.id, setReactions);
    const unsubMyReaction = subscribeToReaction(ownerUid, trade.id, currentUid, setMyReaction);
    return () => {
      unsubLikeCount();
      unsubDislikeCount();
      unsubLiked();
      unsubDisliked();
      unsubComments();
      unsubReactions();
      unsubMyReaction();
    };
  }, [ownerUid, trade.id, currentUid]);

  async function handleLike() {
    await toggleLike(ownerUid, trade.id, currentUid);
  }

  async function handleDislike() {
    await toggleDislike(ownerUid, trade.id, currentUid);
  }

  async function handleReaction(emoji: string) {
    await setReaction(ownerUid, trade.id, currentUid, emoji);
  }

  async function handleSendComment() {
    if (!commentText.trim()) return;
    setSendingComment(true);
    try {
      await addComment(ownerUid, trade.id, {
        uid: currentUid,
        displayName: currentDisplayName,
        avatarUrl: currentAvatarUrl,
        text: commentText.trim(),
      });
      setCommentText("");
    } catch {
      // ignore
    } finally {
      setSendingComment(false);
    }
  }

  const toneClass =
    trade.direction === "long"
      ? "text-mint-400 bg-mint-500/10"
      : trade.direction === "short"
      ? "text-coral-400 bg-coral-500/10"
      : "text-amber-400 bg-amber-400/10";

  const reactionCounts: Record<string, number> = {};
  reactions.forEach((r) => {
    reactionCounts[r.emoji] = (reactionCounts[r.emoji] ?? 0) + 1;
  });

  return (
    <div className="rounded-xl border border-ink-800 bg-ink-900 overflow-hidden">
      {/* User info header */}
      <div className="flex items-center gap-3 p-4 border-b border-ink-800">
        <div
          className="w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold text-ink-950 shrink-0"
          style={{ backgroundColor: ownerUser.avatarColor }}
        >
          {ownerUser.displayName.charAt(0).toUpperCase()}
        </div>
        <div>
          <Link
            href={`/dashboard/users/${ownerUid}`}
            className="text-sm font-mono font-semibold text-paper-100 hover:text-mint-400 transition"
          >
            {ownerUser.displayName}
          </Link>
          <p className="text-xs text-paper-500 font-mono">
            {format(parseISO(trade.entryDate), "dd MMM yyyy HH:mm")}
          </p>
        </div>
      </div>

      {/* Image */}
      {trade.screenshotUrl ? (
        <div className="bg-ink-950 flex items-center justify-center">
          <img
            src={trade.screenshotUrl}
            alt={`${trade.pair} grafik görseli`}
            className="w-full max-h-[500px] object-contain"
          />
        </div>
      ) : (
        <div className="h-48 bg-ink-950 flex items-center justify-center text-paper-500 font-mono text-sm">
          görsel yok
        </div>
      )}

      {/* Trade info */}
      <div className="p-4 border-b border-ink-800 space-y-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="font-display font-semibold text-lg text-paper-100">
              {trade.pair}
            </span>
            <span className={`text-[11px] font-mono font-semibold px-2 py-0.5 rounded border border-current ${toneClass}`}>
              {trade.direction === "long" ? "UZUN" : trade.direction === "short" ? "KISA" : "BE"}
            </span>
          </div>
          <span
            className={`font-mono text-lg font-semibold ${
              trade.result >= 0 ? "text-mint-400" : "text-coral-400"
            }`}
          >
            {trade.result >= 0 ? "+" : ""}
            {trade.result.toFixed(2)}%
          </span>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          <InfoRow label="R/R" value={`${trade.rr}R`} />
          <InfoRow
            label="Net P&L"
            value={`${trade.netPnl >= 0 ? "+" : ""}$${trade.netPnl.toFixed(2)}`}
            valueClass={trade.netPnl >= 0 ? "text-mint-400" : "text-coral-400"}
          />
          <InfoRow label="Çıkış" value={format(parseISO(trade.exitDate), "dd MMM HH:mm")} />
          {trade.strategy && <InfoRow label="Strateji" value={trade.strategy} />}
        </div>

        {trade.note && (
          <p className="text-sm text-paper-300 border-l-2 border-ink-700 pl-3">
            {trade.note}
          </p>
        )}
      </div>

      {/* Reactions & Like */}
      <div className="p-4 border-b border-ink-800 space-y-3">
        <div className="flex items-center gap-2">
          <button
            onClick={handleLike}
            className={`flex items-center gap-2 px-3 py-1.5 rounded-lg border transition text-sm ${
              liked
                ? "border-coral-500/40 text-coral-400 bg-coral-500/10"
                : "border-ink-700 text-paper-400 hover:border-coral-500/40 hover:text-coral-400"
            }`}
          >
            <svg className="w-4 h-4" fill={liked ? "currentColor" : "none"} viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
            </svg>
            {likeCount > 0 && <span className="font-mono text-xs">{likeCount}</span>}
          </button>
          <button
            onClick={handleDislike}
            className={`flex items-center gap-2 px-3 py-1.5 rounded-lg border transition text-sm ${
              disliked
                ? "border-coral-500/40 text-coral-400 bg-coral-500/10"
                : "border-ink-700 text-paper-400 hover:border-coral-500/40 hover:text-coral-400"
            }`}
          >
            <svg className="w-4 h-4 rotate-180" fill={disliked ? "currentColor" : "none"} viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
            </svg>
            {dislikeCount > 0 && <span className="font-mono text-xs">{dislikeCount}</span>}
          </button>
        </div>

        <div>
          <p className="text-xs font-mono text-paper-500 mb-2 uppercase">Tepkiler</p>
          <div className="flex flex-wrap gap-2">
            {EMOJIS.map((emoji) => {
              const isActive = myReaction === emoji;
              const count = reactionCounts[emoji] ?? 0;
              return (
                <button
                  key={emoji}
                  onClick={() => handleReaction(emoji)}
                  className={`flex items-center gap-1 px-2 py-1 rounded-lg border transition text-sm ${
                    isActive
                      ? "border-mint-500/40 bg-mint-500/10"
                      : "border-ink-700 hover:border-ink-600"
                  }`}
                >
                  <span className="text-base">{emoji}</span>
                  {count > 0 && (
                    <span className="text-xs font-mono text-paper-400">{count}</span>
                  )}
                </button>
              );
            })}
          </div>
        </div>
      </div>

      {/* Comments */}
      <div className="p-4">
        <h4 className="text-sm font-mono font-semibold text-paper-300 mb-3 uppercase">
          Yorumlar ({comments.length})
        </h4>

        <div className="space-y-3 mb-4 max-h-60 overflow-y-auto">
          {comments.length === 0 && (
            <p className="text-xs text-paper-500">Henüz yorum yapılmamış.</p>
          )}
          {comments.map((c) => (
            <div key={c.id} className="flex gap-2">
              <div
                className="w-6 h-6 rounded-full shrink-0 flex items-center justify-center text-[10px] font-semibold text-white"
                style={{ backgroundColor: "#2ED9A4" }}
              >
                {c.displayName.charAt(0).toUpperCase()}
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  <span className="text-xs font-mono font-semibold text-paper-200">
                    {c.displayName}
                  </span>
                  <span className="text-[10px] text-paper-500 font-mono">
                    {format(c.createdAt, "dd MMM HH:mm")}
                  </span>
                </div>
                <p className="text-sm text-paper-300 break-words">{c.text}</p>
              </div>
            </div>
          ))}
        </div>

        <div className="flex gap-2">
          <input
            value={commentText}
            onChange={(e) => setCommentText(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter" && !e.shiftKey) {
                e.preventDefault();
                handleSendComment();
              }
            }}
            placeholder="Yorum yaz..."
            className="flex-1 rounded-lg border border-ink-700 bg-ink-950 px-3 py-2 text-sm text-paper-100 placeholder-paper-500 focus:border-mint-500 focus:outline-none"
          />
          <button
            onClick={handleSendComment}
            disabled={!commentText.trim() || sendingComment}
            className="rounded-lg bg-mint-500 text-ink-950 px-3 py-2 text-sm font-semibold hover:bg-mint-400 transition disabled:opacity-40"
          >
            {sendingComment ? "..." : "Gönder"}
          </button>
        </div>
      </div>
    </div>
  );
}

function InfoRow({
  label,
  value,
  valueClass,
}: {
  label: string;
  value: string;
  valueClass?: string;
}) {
  return (
    <div className="rounded-lg border border-ink-800 bg-ink-950 p-2.5">
      <p className="text-[10px] font-mono uppercase tracking-wide text-paper-500 mb-0.5">{label}</p>
      <p className={`text-sm font-mono font-semibold ${valueClass ?? "text-paper-100"}`}>{value}</p>
    </div>
  );
}
