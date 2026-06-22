"use client";

import { useEffect, useMemo, useState, useCallback } from "react";
import { createPortal } from "react-dom";
import { doc, getDoc } from "firebase/firestore";
import { db } from "@/lib/firebase";
import { useAuth } from "@/lib/auth-context";
import { subscribeToLeaderboard } from "@/lib/leaderboard";
import {
  LeaderboardEntry,
  LeaderboardPeriod,
} from "@/lib/types";
import {
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  Radar,
  ResponsiveContainer,
} from "recharts";
import AchievementsGrid from "@/components/AchievementsGrid";

type PeriodTab = {
  key: LeaderboardPeriod;
  label: string;
};

const PERIODS: PeriodTab[] = [
  { key: "weekly", label: "Haftalık" },
  { key: "monthly", label: "Aylık" },
  { key: "alltime", label: "Tüm Zamanlar" },
];

const AVATAR_COLORS = [
  "#2ED9A4", "#FF5D5D", "#F2B84B", "#6C8EF0",
  "#D16BF0", "#F06C6C", "#4ECDC4", "#FF6B6B",
];

function hashColor(id: string): string {
  let hash = 0;
  for (let i = 0; i < id.length; i++) {
    hash = id.charCodeAt(i) + ((hash << 5) - hash);
  }
  return AVATAR_COLORS[Math.abs(hash) % AVATAR_COLORS.length];
}

function scoreHexColor(score: number): string {
  if (score >= 70) return "#2ED9A4";
  if (score >= 40) return "#F2B84B";
  return "#FF5D5D";
}

function rankBadgeColor(rank: string): string {
  const map: Record<string, string> = {
    "Çaylak": "text-paper-400",
    "Acemi": "text-paper-300",
    "Gelişen": "text-mint-300",
    "Deneyimli": "text-mint-400",
    "Uzman": "text-mint-400",
    "İleri": "text-amber-400",
    "Usta": "text-amber-400",
    "Elit": "text-amber-300",
    "Efsane": "text-coral-300",
    "Efsanevi": "text-coral-200",
  };
  return map[rank] ?? "text-paper-400";
}

function ScoreHexagon({ score, size = 120 }: { score: number; size?: number }) {
  const cx = size / 2;
  const cy = size / 2;
  const r = size * 0.38;
  const color = scoreHexColor(score);

  const points = Array.from({ length: 6 }, (_, i) => {
    const angle = (Math.PI / 3) * i - Math.PI / 2;
    return `${(cx + r * Math.cos(angle)).toFixed(1)},${(cy + r * Math.sin(angle)).toFixed(1)}`;
  }).join(" ");

  return (
    <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`}>
      <polygon points={points} fill="none" stroke={color} strokeWidth={1.5} opacity={0.25} />
      <polygon points={points} fill={color} fillOpacity={0.12} stroke={color} strokeWidth={2} />
      <text x={cx} y={cy - 4} textAnchor="middle" fill={color} fontSize={size * 0.28} fontWeight={800} fontFamily="monospace">
        {Math.round(score)}
      </text>
      <text x={cx} y={cy + size * 0.14} textAnchor="middle" fill={color} fontSize={size * 0.075} fontWeight={700} fontFamily="monospace" opacity={0.7}>
        SCORE
      </text>
    </svg>
  );
}

function AvatarLetter({
  name,
  uid,
  className = "w-10 h-10 text-sm",
}: {
  name: string;
  uid: string;
  className?: string;
}) {
  const letter = name ? name[0].toUpperCase() : "?";
  return (
    <div
      className={`rounded-full flex items-center justify-center font-bold text-ink-950 shrink-0 ${className}`}
      style={{ backgroundColor: hashColor(uid) }}
    >
      {letter}
    </div>
  );
}

function formatScore(num: number): string {
  return num >= 0 ? `+${num.toFixed(1)}` : num.toFixed(1);
}

export default function LeaderboardPage() {
  const { user } = useAuth();
  const [period, setPeriod] = useState<LeaderboardPeriod>("alltime");
  const [entries, setEntries] = useState<(LeaderboardEntry & { uid: string })[]>([]);
  const [modalUid, setModalUid] = useState<string | null>(null);

  useEffect(() => {
    const unsub = subscribeToLeaderboard(period, setEntries);
    return unsub;
  }, [period]);

  const sorted = useMemo(
    () => [...entries].sort((a, b) => b.score - a.score),
    [entries]
  );

  const top3 = sorted.slice(0, 3);
  const rest = sorted.slice(3);

  const modalEntry = useMemo(
    () => sorted.find((e) => e.uid === modalUid) ?? null,
    [sorted, modalUid]
  );

  const closeModal = useCallback(() => setModalUid(null), []);

  const isAnonymous = !user;

  return (
    <div className="space-y-6 animate-fade-in-up">
      <div className="flex items-center justify-between flex-wrap gap-4">
        <div>
          <h1 className="font-display text-2xl font-semibold">Liderlik Tablosu</h1>
          <p className="text-sm text-paper-300 mt-1">
            En başarılı traderlar sıralamada.
          </p>
        </div>
      </div>

      {/* Period toggles */}
      <div className="flex gap-1 rounded-xl border border-ink-800 bg-ink-900 p-1 w-fit flex-wrap">
        {PERIODS.map((p) => (
          <button
            key={p.key}
            onClick={() => {
              if (!isAnonymous) setPeriod(p.key);
            }}
            className={`rounded-lg px-4 py-2 text-sm font-medium transition ${
              period === p.key
                ? "bg-mint-500/15 text-mint-400 border border-mint-500/20"
                : "text-paper-400 hover:text-paper-200"
            } ${isAnonymous ? "cursor-not-allowed opacity-50" : ""}`}
          >
            {p.label}
          </button>
        ))}
      </div>

      {/* Podium */}
      {top3.length > 0 && (
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 items-end animate-fade-in-up">
          {top3[1] && (
            <PodiumCard
              entry={top3[1]}
              rank={2}
              medal="🥈"
              bgClass="border-paper-300/10 bg-paper-300/5"
              className="sm:order-1"
              onSelect={setModalUid}
              currentUid={user?.uid ?? ""}
              disabled={isAnonymous}
            />
          )}
          {top3[0] && (
            <PodiumCard
              entry={top3[0]}
              rank={1}
              medal="🥇"
              bgClass="border-amber-400/20 bg-amber-400/10"
              className="sm:order-2 sm:scale-105 sm:-translate-y-2"
              onSelect={setModalUid}
              currentUid={user?.uid ?? ""}
              disabled={isAnonymous}
            />
          )}
          {top3[2] && (
            <PodiumCard
              entry={top3[2]}
              rank={3}
              medal="🥉"
              bgClass="border-coral-400/10 bg-coral-400/5"
              className="sm:order-3"
              onSelect={setModalUid}
              currentUid={user?.uid ?? ""}
              disabled={isAnonymous}
            />
          )}
        </div>
      )}

      {/* Table */}
      {rest.length > 0 && (
        <div className="rounded-xl border border-ink-800 bg-ink-900 overflow-hidden animate-fade-in-up stagger-2">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-ink-800 text-paper-500 font-mono text-xs uppercase tracking-wide">
                  <th className="text-left px-4 py-3 w-12">#</th>
                  <th className="text-left px-4 py-3">Kullanıcı</th>
                  <th className="text-left px-4 py-3 hidden sm:table-cell">Unvan</th>
                  <th className="text-right px-4 py-3">Score</th>
                  <th className="text-right px-4 py-3 hidden md:table-cell">Kazanma %</th>
                  <th className="text-right px-4 py-3 hidden lg:table-cell">Ort. RR</th>
                  <th className="text-right px-4 py-3 hidden lg:table-cell">Net %</th>
                  <th className="text-right px-4 py-3 hidden md:table-cell">İşlem</th>
                </tr>
              </thead>
              <tbody>
                {rest.map((entry, i) => {
                  const rowIndex = i + 4;
                  const isMe = entry.uid === user?.uid;
                  return (
                    <tr
                      key={entry.uid}
                      onClick={() => {
                        if (!isAnonymous) setModalUid(entry.uid);
                      }}
                      className={`border-b border-ink-800/50 transition ${
                        isMe
                          ? "bg-mint-500/10 cursor-pointer"
                          : "hover:bg-ink-800/50 cursor-pointer"
                      } ${isAnonymous ? "cursor-default" : ""}`}
                    >
                      <td className="px-4 py-3 font-mono text-paper-400">{rowIndex}</td>
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-3">
                          <AvatarLetter
                            name={entry.isPublic ? entry.displayName : "A"}
                            uid={entry.uid}
                          />
                          <span className="font-medium text-paper-100 truncate max-w-[140px]">
                            {entry.isPublic ? entry.displayName : "Anonim Trader"}
                          </span>
                          {isMe && (
                            <span className="text-[10px] font-mono bg-mint-500/15 text-mint-400 px-1.5 py-0.5 rounded">
                              SEN
                            </span>
                          )}
                        </div>
                      </td>
                      <td className={`px-4 py-3 hidden sm:table-cell font-mono text-xs ${rankBadgeColor(entry.rank)}`}>
                        {entry.rank}
                      </td>
                      <td className="px-4 py-3 text-right font-mono font-semibold">
                        <span style={{ color: scoreHexColor(entry.score) }}>
                          {Math.round(entry.score)}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-right font-mono hidden md:table-cell text-paper-200">
                        {entry.winRate.toFixed(1)}%
                      </td>
                      <td className="px-4 py-3 text-right font-mono hidden lg:table-cell text-paper-200">
                        {entry.avgRR.toFixed(2)}
                      </td>
                      <td className="px-4 py-3 text-right font-mono hidden lg:table-cell text-paper-200">
                        {formatScore(entry.netResult)}%
                      </td>
                      <td className="px-4 py-3 text-right font-mono hidden md:table-cell text-paper-200">
                        {entry.totalTrades}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {sorted.length === 0 && (
        <div className="rounded-xl border border-ink-800 bg-ink-900 p-12 text-center text-paper-500">
          <p className="text-lg font-display">Henüz veri yok</p>
          <p className="text-sm mt-1">İlk liderlik kaydı eklendiğinde burada görünecek.</p>
        </div>
      )}

      {/* Modal */}
      {modalEntry && !isAnonymous && createPortal(
        <ProfileModal entry={modalEntry} onClose={closeModal} />,
        document.body
      )}
    </div>
  );
}

function PodiumCard({
  entry,
  rank,
  medal,
  bgClass,
  className,
  onSelect,
  currentUid,
  disabled,
}: {
  entry: LeaderboardEntry & { uid: string };
  rank: number;
  medal: string;
  bgClass: string;
  className?: string;
  onSelect: (uid: string) => void;
  currentUid: string;
  disabled: boolean;
}) {
  const isMe = entry.uid === currentUid;
  return (
    <div
      onClick={() => {
        if (!disabled) onSelect(entry.uid);
      }}
      className={`rounded-xl border p-5 text-center transition ${bgClass} ${className} ${
        disabled ? "cursor-default" : "cursor-pointer hover:opacity-80"
      }`}
    >
      <div className="text-3xl mb-2">{medal}</div>
      <div className="flex justify-center mb-3">
        <AvatarLetter
          name={entry.isPublic ? entry.displayName : "A"}
          uid={entry.uid}
          className="w-14 h-14 text-lg"
        />
      </div>
      <p className="font-display font-semibold text-paper-100 truncate">
        {entry.isPublic ? entry.displayName : "Anonim Trader"}
        {isMe && (
          <span className="ml-1.5 text-[10px] font-mono bg-mint-500/15 text-mint-400 px-1.5 py-0.5 rounded align-middle">
            SEN
          </span>
        )}
      </p>
      <p className={`text-xs font-mono mt-1 ${rankBadgeColor(entry.rank)}`}>
        {entry.rank}
      </p>
      <p className="text-2xl font-bold font-mono mt-2" style={{ color: scoreHexColor(entry.score) }}>
        {Math.round(entry.score)}
      </p>
      <div className="flex justify-center gap-4 mt-2 text-xs text-paper-500 font-mono">
        <span>{entry.winRate.toFixed(0)}% Kazanç</span>
        <span>{entry.avgRR.toFixed(2)} R</span>
      </div>
    </div>
  );
}

function ProfileModal({
  entry,
  onClose,
}: {
  entry: LeaderboardEntry & { uid: string };
  onClose: () => void;
}) {
  const displayName = entry.isPublic ? entry.displayName : "Anonim Trader";
  const [achievements, setAchievements] = useState<string[]>([]);

  useEffect(() => {
    getDoc(doc(db, "users", entry.uid)).then((snap) => {
      if (snap.exists()) {
        setAchievements((snap.data().achievements as string[]) ?? []);
      }
    });
  }, [entry.uid]);

  const radarData = useMemo(() => {
    const consistencyPct = Math.round(entry.totalTrades > 0 ? Math.min(1, 1) * 100 : 0);
    const profitability = Math.max(0, Math.min(entry.netResult / 50, 1)) * 100;
    const rr = Math.min(entry.avgRR / 3, 1) * 100;
    return [
      { axis: "Kazanma", value: Math.round(entry.winRate) },
      { axis: "Karlılık", value: Math.round(profitability) },
      { axis: "R:R", value: Math.round(rr) },
      { axis: "İstikrar", value: consistencyPct },
    ];
  }, [entry]);

  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [onClose]);

  return (
    <div
      className="fixed inset-0 z-[60] bg-black/60 backdrop-blur-sm"
      onClick={onClose}
    >
      <div
        className="fixed left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 rounded-2xl border border-ink-700 bg-ink-900 max-w-lg w-full max-h-[90vh] overflow-y-auto p-6 space-y-6"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-4">
            <AvatarLetter name={displayName} uid={entry.uid} className="w-14 h-14 text-lg" />
            <div>
              <h2 className="font-display text-xl font-semibold text-paper-100">
                {displayName}
              </h2>
              <div className="flex items-center gap-2 mt-1">
                <span className="rounded-full bg-mint-500/10 text-mint-400 px-2 py-0.5 text-xs font-semibold font-mono">
                  Seviye {entry.level}
                </span>
                <span className={`text-xs font-mono ${rankBadgeColor(entry.rank)}`}>
                  {entry.rank}
                </span>
              </div>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-paper-500 hover:text-paper-200 transition p-1"
          >
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Score hexagon + breakdown */}
        <div className="flex flex-col sm:flex-row items-center gap-6">
          <ScoreHexagon score={entry.score} size={130} />
          <div className="flex-1 w-full space-y-2.5">
            <ScoreBar label="İstikrar" value={entry.totalTrades > 0 ? 100 : 0} max={100} color="#2ED9A4" />
            <ScoreBar label="Karlılık" value={Math.max(0, Math.min(entry.netResult / 50, 1)) * 100} max={100} color="#F2B84B" />
            <ScoreBar label="R:R" value={Math.min(entry.avgRR / 3, 1) * 100} max={100} color="#6C8EF0" />
            <ScoreBar label="Kazanma" value={entry.winRate} max={100} color="#D16BF0" />
          </div>
        </div>

        {/* Radar chart */}
        <div className="rounded-xl border border-ink-800 bg-ink-950 p-4">
          <p className="text-xs font-mono uppercase tracking-wide text-paper-500 mb-3">Performans Radar</p>
          <ResponsiveContainer width="100%" height={220}>
            <RadarChart data={radarData} cx="50%" cy="50%" outerRadius="75%">
              <PolarGrid stroke="rgba(255,255,255,0.08)" />
              <PolarAngleAxis
                dataKey="axis"
                tick={{ fill: "rgba(255,255,255,0.5)", fontSize: 11, fontFamily: "monospace" }}
              />
              <Radar
                name="Performans"
                dataKey="value"
                stroke="#2ED9A4"
                fill="#2ED9A4"
                fillOpacity={0.15}
                strokeWidth={2}
              />
            </RadarChart>
          </ResponsiveContainer>
        </div>

        {/* Top strategy */}
        {entry.showStrategy && entry.topStrategy && (
          <div className="rounded-xl border border-ink-800 bg-ink-950 p-4">
            <p className="text-xs font-mono uppercase tracking-wide text-paper-500 mb-1">Kullandığı Strateji</p>
            <p className="font-display text-base font-semibold text-paper-100">{entry.topStrategy}</p>
          </div>
        )}

        {/* Summary stats */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          <MiniStat label="İşlem" value={String(entry.totalTrades)} />
          <MiniStat label="Win Rate" value={`${entry.winRate.toFixed(1)}%`} />
          <MiniStat label="Ort. RR" value={entry.avgRR.toFixed(2)} />
          <MiniStat
            label="Net P&L"
            value={`${formatScore(entry.netResult)}%`}
            tone={entry.netResult >= 0 ? "mint" : "coral"}
          />
        </div>

        {/* Achievements */}
        {achievements.length > 0 && (
          <div>
            <p className="text-xs font-mono uppercase tracking-wide text-paper-500 mb-2">Rozetler</p>
            <AchievementsGrid earned={achievements} />
          </div>
        )}
      </div>
    </div>
  );
}

function ScoreBar({
  label,
  value,
  max,
  color,
}: {
  label: string;
  value: number;
  max: number;
  color: string;
}) {
  const pct = Math.min((value / max) * 100, 100);
  return (
    <div>
      <div className="flex justify-between text-xs font-mono mb-1">
        <span className="text-paper-400">{label}</span>
        <span className="text-paper-200">{Math.round(pct)}%</span>
      </div>
      <div className="h-1.5 rounded-full bg-ink-700 overflow-hidden">
        <div
          className="h-full rounded-full transition-all"
          style={{ width: `${pct}%`, backgroundColor: color }}
        />
      </div>
    </div>
  );
}

function MiniStat({
  label,
  value,
  tone,
}: {
  label: string;
  value: string;
  tone?: "mint" | "coral";
}) {
  return (
    <div className="rounded-lg border border-ink-800 bg-ink-950 p-3">
      <p className="text-xs font-mono uppercase tracking-wide text-paper-500 mb-0.5">{label}</p>
      <p className={`font-mono text-sm font-semibold ${tone === "mint" ? "text-mint-400" : tone === "coral" ? "text-coral-400" : "text-paper-100"}`}>
        {value}
      </p>
    </div>
  );
}
