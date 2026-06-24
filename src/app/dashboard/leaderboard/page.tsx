"use client";

import { useEffect, useMemo, useState, useCallback } from "react";
import { createPortal } from "react-dom";
import { doc, getDoc } from "firebase/firestore";
import { db } from "@/lib/firebase";
import { useAuth } from "@/lib/auth-context";
import { LeaderboardPeriod } from "@/lib/types";
import {
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  Radar,
  ResponsiveContainer,
} from "recharts";
import AchievementsGrid from "@/components/AchievementsGrid";
import RankBadge from "@/components/RankBadge";

type PeriodTab = {
  key: LeaderboardPeriod;
  label: string;
};

const PERIODS: PeriodTab[] = [
  { key: "weekly", label: "Haftalık" },
  { key: "monthly", label: "Aylık" },
  { key: "alltime", label: "Tüm Zamanlar" },
];

type MaskedNumber = number | "####";

interface ApiEntry {
  uid: string;
  rank: number;
  displayName: string;
  avatarUrl: string | null;
  avatarColor: string;
  score: MaskedNumber;
  winRate: MaskedNumber;
  netResult: MaskedNumber;
  totalTrades: MaskedNumber;
  isPublic: boolean;
  leaderboardOptIn: boolean;
}

function isMasked(v: MaskedNumber): v is "####" {
  return v === "####";
}

function scoreHexColor(score: number): string {
  if (score >= 70) return "#2ED9A4";
  if (score >= 40) return "#F2B84B";
  return "#FF5D5D";
}

function AvatarLetter({
  name,
  avatarUrl,
  avatarColor,
  className = "w-10 h-10 text-sm",
}: {
  name: string;
  avatarUrl?: string | null;
  avatarColor?: string;
  className?: string;
}) {
  const [imgError, setImgError] = useState(false);

  if (avatarUrl && !imgError) {
    return (
      <div className={`rounded-full overflow-hidden shrink-0 ${className}`}>
        <img src={avatarUrl} key={avatarUrl} alt={name} className="w-full h-full object-cover" onError={() => setImgError(true)} />
      </div>
    );
  }
  return (
    <div
      className={`rounded-full flex items-center justify-center font-bold text-ink-950 shrink-0 ${className}`}
      style={{ backgroundColor: avatarColor ?? "#2ED9A4" }}
    >
      <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
      </svg>
    </div>
  );
}

function formatNumber(v: MaskedNumber): string {
  if (isMasked(v)) return v;
  return v.toFixed(1);
}

function formatScore(num: number): string {
  return num >= 0 ? `+${num.toFixed(1)}` : num.toFixed(1);
}

export default function LeaderboardPage() {
  const { user } = useAuth();
  const [period, setPeriod] = useState<LeaderboardPeriod>("alltime");
  const [entries, setEntries] = useState<ApiEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [modalUid, setModalUid] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState("");

  // Current user's real data (unmasked)
  const [myEntry, setMyEntry] = useState<{
    displayName: string;
    avatarUrl: string | null;
    avatarColor: string;
    score: number;
    winRate: number;
    netResult: number;
    totalTrades: number;
    isPublic: boolean;
  } | null>(null);

  useEffect(() => {
    setLoading(true);
    fetch(`/api/leaderboard?period=${period}`)
      .then((r) => r.json())
      .then((data) => {
        setEntries(data.entries ?? []);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, [period]);

  useEffect(() => {
    if (!user) return;
    getDoc(doc(db, "users", user.uid)).then((snap) => {
      if (snap.exists()) {
        const d = snap.data();
        setMyEntry({
          displayName: d.displayName ?? user.displayName ?? "Trader",
          avatarUrl: d.avatarUrl ?? null,
          avatarColor: d.avatarColor ?? "#2ED9A4",
          score: d.score ?? 0,
          winRate: d.stats?.winRate ?? 0,
          netResult: d.stats?.netResult ?? 0,
          totalTrades: d.stats?.totalTrades ?? 0,
          isPublic: d.isPublic ?? false,
        });
      }
    });
  }, [user]);

  const merged = useMemo(() => {
    let list = entries;
    if (user && myEntry) {
      list = entries.map((e) => {
        if (e.uid === user.uid) {
          return {
            ...e,
            displayName: myEntry.displayName,
            avatarUrl: myEntry.avatarUrl,
            avatarColor: myEntry.avatarColor,
            score: myEntry.score,
            winRate: myEntry.winRate,
            netResult: myEntry.netResult,
            totalTrades: myEntry.totalTrades,
            leaderboardOptIn: true,
          };
        }
        return e;
      });
    }
    if (!searchQuery.trim()) return list;
    const q = searchQuery.toLowerCase();
    return list.filter((e) => e.displayName.toLowerCase().includes(q));
  }, [entries, myEntry, user, searchQuery]);

  const top3 = merged.slice(0, 3);
  const rest = merged.slice(3);

  const modalEntry = useMemo(
    () => merged.find((e) => e.uid === modalUid) ?? null,
    [merged, modalUid]
  );

  const closeModal = useCallback(() => setModalUid(null), []);

  const isAnonymous = !user;

  function getMaskColor(val: MaskedNumber): string {
    if (isMasked(val)) return "text-paper-500";
    if (typeof val === "number" && val > 0) return "text-mint-400";
    if (typeof val === "number" && val < 0) return "text-coral-400";
    return "text-paper-100";
  }

  return (
    <div className="space-y-6 animate-fade-in-up">
      <div className="flex items-center justify-between flex-wrap gap-4">
        <div>
          <h1 className="font-display text-2xl font-semibold">Liderlik Tablosu</h1>
          <p className="text-sm text-paper-300 mt-1">En başarılı traderlar sıralamada.</p>
        </div>
      </div>

      {/* Search + Period toggles */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3">
        <div className="relative w-full sm:w-64">
          <svg className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-paper-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
          </svg>
          <input
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Yatırımcı ara…"
            className="w-full rounded-xl border border-ink-800 bg-ink-900 pl-9 pr-3 py-2 text-sm text-paper-100 placeholder:text-paper-500 focus:outline-none focus:border-mint-500/50 focus:ring-1 focus:ring-mint-500/20 transition"
          />
        </div>
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
      </div>

      {/* Loading */}
      {loading && (
        <div className="flex justify-center py-12">
          <div className="w-8 h-8 rounded-full border-2 border-mint-500 border-t-transparent animate-spin" />
        </div>
      )}

      {/* Podium */}
      {!loading && top3.length > 0 && (
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

      {/* List (sıra, yatırımcı, kazanç, toplam kâr, işlem sayısı) */}
      {!loading && rest.length > 0 && (
        <div className="rounded-xl border border-ink-800 bg-ink-900 overflow-hidden animate-fade-in-up stagger-2">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-ink-800 text-paper-500 font-mono text-xs uppercase tracking-wide">
                  <th className="text-left px-4 py-3 w-10">#</th>
                  <th className="text-left px-4 py-3">Yatırımcı</th>
                  <th className="text-right px-4 py-3">Kazanç</th>
                  <th className="text-right px-4 py-3 hidden sm:table-cell">Toplam Kâr</th>
                  <th className="text-right px-4 py-3 hidden sm:table-cell">İşlem</th>
                </tr>
              </thead>
              <tbody>
                {rest.map((entry) => {
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
                      <td className="px-4 py-3 font-mono text-paper-500 w-10">{entry.rank}</td>
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-3">
                          <AvatarLetter
                            name={entry.displayName}
                            avatarUrl={entry.avatarUrl}
                            avatarColor={entry.avatarColor}
                          />
                          <span className="font-medium text-paper-100 truncate max-w-[160px]">
                            {entry.displayName}
                          </span>
                          {isMe && (
                            <span className="text-[10px] font-mono bg-mint-500/15 text-mint-400 px-1.5 py-0.5 rounded">
                              SEN
                            </span>
                          )}
                        </div>
                      </td>
                      <td className={`px-4 py-3 text-right font-mono font-semibold ${getMaskColor(entry.winRate)}`}>
                        {isMasked(entry.winRate) ? entry.winRate : `${entry.winRate.toFixed(1)}%`}
                      </td>
                      <td className={`px-4 py-3 text-right font-mono font-semibold hidden sm:table-cell ${getMaskColor(entry.netResult)}`}>
                        {isMasked(entry.netResult) ? entry.netResult : `${entry.netResult >= 0 ? "+" : ""}${entry.netResult.toFixed(2)}%`}
                      </td>
                      <td className="px-4 py-3 text-right font-mono text-paper-300 hidden sm:table-cell">
                        {isMasked(entry.totalTrades) ? entry.totalTrades : entry.totalTrades}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Empty states */}
      {!loading && merged.length === 0 && (
        <div className="rounded-xl border border-ink-800 bg-ink-900 p-12 text-center text-paper-500">
          <p className="text-lg font-display">
            {searchQuery ? "Aramanla eşleşen yatırımcı bulunamadı." : "Henüz veri yok"}
          </p>
          <p className="text-sm mt-1">
            {searchQuery ? "Farklı bir isim dene." : "İlk liderlik kaydı eklendiğinde burada görünecek."}
          </p>
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
  entry: ApiEntry;
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
          name={entry.displayName}
          avatarUrl={entry.avatarUrl}
          avatarColor={entry.avatarColor}
          className="w-14 h-14 text-lg"
        />
      </div>
      <p className="font-display font-semibold text-paper-100 truncate">
        {entry.displayName}
        {isMe && (
          <span className="ml-1.5 text-[10px] font-mono bg-mint-500/15 text-mint-400 px-1.5 py-0.5 rounded align-middle">
            SEN
          </span>
        )}
      </p>
      <p className="text-2xl font-bold font-mono mt-2" style={{ color: scoreHexColor(isMasked(entry.score) ? 0 : entry.score as number) }}>
        {isMasked(entry.score) ? entry.score : Math.round(entry.score as number)}
      </p>
    </div>
  );
}

function ProfileModal({
  entry,
  onClose,
}: {
  entry: ApiEntry;
  onClose: () => void;
}) {
  const displayName = entry.displayName;
  const [achievements, setAchievements] = useState<string[]>([]);

  useEffect(() => {
    getDoc(doc(db, "users", entry.uid)).then((snap) => {
      if (snap.exists()) {
        setAchievements((snap.data().achievements as string[]) ?? []);
      }
    });
  }, [entry.uid]);

  const radarData = useMemo(() => {
    const wr = isMasked(entry.winRate) ? 0 : entry.winRate;
    const nr = isMasked(entry.netResult) ? 0 : entry.netResult;
    const tt = isMasked(entry.totalTrades) ? 0 : entry.totalTrades;
    const profitability = Math.max(0, Math.min(nr / 50, 1)) * 100;
    return [
      { axis: "Kazanma", value: Math.round(wr) },
      { axis: "Karlılık", value: Math.round(profitability) },
      { axis: "İstikrar", value: tt > 0 ? 100 : 0 },
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
            <AvatarLetter name={displayName} avatarUrl={entry.avatarUrl} avatarColor={entry.avatarColor} className="w-14 h-14 text-lg" />
            <div>
              <h2 className="font-display text-xl font-semibold text-paper-100">
                {displayName}
              </h2>
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

        {/* Stats */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          <MiniStat label="İşlem" value={isMasked(entry.totalTrades) ? entry.totalTrades : String(entry.totalTrades)} />
          <MiniStat label="Kazanç" value={isMasked(entry.winRate) ? entry.winRate : `${entry.winRate.toFixed(1)}%`} />
          <MiniStat
            label="Net P&L"
            value={isMasked(entry.netResult) ? entry.netResult : (entry.netResult >= 0 ? "+" : "") + entry.netResult.toFixed(2) + "%"}
            tone={!isMasked(entry.netResult) ? (entry.netResult >= 0 ? "mint" : "coral") : undefined}
          />
          <MiniStat label="Score" value={isMasked(entry.score) ? entry.score : String(Math.round(entry.score as number))} />
        </div>

        {/* Radar chart */}
        <div className="rounded-xl border border-ink-800 bg-ink-950 p-4">
          <p className="text-xs font-mono uppercase tracking-wide text-paper-500 mb-3">Performans Radar</p>
          <ResponsiveContainer width="100%" height={200}>
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
