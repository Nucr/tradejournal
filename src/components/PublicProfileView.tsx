"use client";

import { useEffect, useState } from "react";
import { useAuth } from "@/lib/auth-context";
import { getPublicProfile, PublicProfileData } from "@/lib/profile";
import { getLeaderboardRank } from "@/lib/leaderboard";
import {
  LeaderboardPeriod,
  UserSearchResult,
} from "@/lib/types";
import Avatar from "./Avatar";
import RankBadge from "./RankBadge";
import AchievementsGrid from "./AchievementsGrid";
import SharedTradeList from "./SharedTradeList";
import {
  collection,
  query,
  where,
  getDocs,
} from "firebase/firestore";
import { db } from "@/lib/firebase";
import { createDirectConversation } from "@/lib/messages";
import { getFriendStatus, sendFriendRequest } from "@/lib/friends";
import { useRouter } from "next/navigation";

interface PublicProfileViewProps {
  userData: UserSearchResult;
}

const PERIODS: { key: LeaderboardPeriod; label: string }[] = [
  { key: "weekly", label: "Haftalık" },
  { key: "monthly", label: "Aylık" },
  { key: "alltime", label: "Tüm Zamanlar" },
];

export default function PublicProfileView({ userData }: PublicProfileViewProps) {
  const { user } = useAuth();
  const router = useRouter();
  const [profile, setProfile] = useState<PublicProfileData | null>(null);
  const [leaderboardPositions, setLeaderboardPositions] = useState<
    { period: LeaderboardPeriod; rank: number }[]
  >([]);
  const [strategies, setStrategies] = useState<string[]>([]);
  const [messaging, setMessaging] = useState(false);
  const [friendStatus, setFriendStatus] = useState<"none" | "friends" | "requested" | "received">("none");
  const [friendLoading, setFriendLoading] = useState(false);

  useEffect(() => {
    getPublicProfile(userData.uid).then((p) => setProfile(p));
  }, [userData.uid]);

  useEffect(() => {
    async function fetchLeaderboardRanks() {
      const positions: { period: LeaderboardPeriod; rank: number }[] = [];
      for (const period of PERIODS) {
        const { rank } = await getLeaderboardRank(period.key, userData.uid);
        if (rank > 0) {
          positions.push({ period: period.key, rank });
        }
      }
      setLeaderboardPositions(positions);
    }
    fetchLeaderboardRanks();
  }, [userData.uid]);

  useEffect(() => {
    async function fetchStrategies() {
      const q = query(
        collection(db, "strategies"),
        where("createdBy", "==", userData.uid),
        where("isPublic", "==", true)
      );
      const snap = await getDocs(q);
      setStrategies(snap.docs.map((d) => d.data().name as string));
    }
    fetchStrategies();
  }, [userData.uid]);

  useEffect(() => {
    if (!user || user.uid === userData.uid) return;
    getFriendStatus(user.uid, userData.uid).then(setFriendStatus);
  }, [user, userData.uid]);

  async function handleMessage() {
    if (!user) return;
    setMessaging(true);
    try {
      const convId = await createDirectConversation(user.uid, userData.uid);
      if (convId) {
        router.push(`/dashboard/messages/${convId}`);
      }
    } catch (err: any) {
      alert(err.message || "Mesaj gönderilemedi");
    } finally {
      setMessaging(false);
    }
  }

  async function handleAddFriend() {
    if (!user) return;
    setFriendLoading(true);
    try {
      const p = profile ?? await getPublicProfile(userData.uid);
      await sendFriendRequest(
        user.uid,
        userData.uid,
        user.displayName ?? user.email?.split("@")[0] ?? "Trader",
        "#2ED9A4",
        undefined
      );
      setFriendStatus("requested");
    } catch (err: any) {
      alert(err.message || "İstek gönderilemedi");
    } finally {
      setFriendLoading(false);
    }
  }

  const showStats = profile?.showStats ?? true;
  const showTrades = profile?.showTrades ?? true;
  const showAchievements = profile?.showAchievements ?? true;
  const showLeaderboard = profile?.showLeaderboard ?? true;
  const displayName = profile?.displayName ?? userData.displayName;

  return (
    <div className="space-y-6 animate-fade-in-up">
      {/* Profile card */}
      <div className="rounded-xl border border-ink-800 bg-ink-900 p-6">
        <div className="flex items-start gap-5 flex-wrap">
          <Avatar
            avatarUrl={profile?.avatarUrl ?? userData.avatarUrl}
            avatarColor={profile?.avatarColor ?? userData.avatarColor}
            displayName={displayName}
            size="lg"
          />
          <div className="flex-1 min-w-0">
            <div className="flex items-center justify-between flex-wrap gap-3">
              <div>
                <h2 className="font-display text-xl font-semibold text-paper-100">
                  {displayName}
                </h2>
                <div className="flex items-center gap-3 mt-1 text-sm">
                  <span className="rounded-full bg-mint-500/10 text-mint-400 px-2.5 py-0.5 text-xs font-semibold font-mono">
                    Seviye {profile?.level ?? userData.level}
                  </span>
                  <RankBadge rank={profile?.rank ?? userData.rank} />
                  <span className="text-paper-400 font-mono text-xs">
                    {profile?.score ?? userData.score} Puan
                  </span>
                </div>
              </div>
              {user && user.uid !== userData.uid && (
                <div className="flex gap-2">
                  <button
                    onClick={handleMessage}
                    disabled={messaging}
                    className="rounded-lg bg-mint-500 text-ink-950 font-semibold px-4 py-2 text-sm hover:bg-mint-400 transition disabled:opacity-40 flex items-center gap-2"
                  >
                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                    </svg>
                    {messaging ? "..." : "Mesaj Gönder"}
                  </button>
                  {friendStatus === "none" && (
                    <button
                      onClick={handleAddFriend}
                      disabled={friendLoading}
                      className="rounded-lg border border-ink-700 text-paper-300 px-4 py-2 text-sm hover:bg-ink-800 transition disabled:opacity-40 flex items-center gap-2"
                    >
                      <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M18 9v3m0 0v3m0-3h3m-3 0h-3m-2-5a4 4 0 11-8 0 4 4 0 018 0zM3 20a6 6 0 0112 0v1H3v-1z" />
                      </svg>
                      {friendLoading ? "..." : "Arkadaş Ekle"}
                    </button>
                  )}
                  {friendStatus === "requested" && (
                    <span className="rounded-lg border border-amber-500/30 text-amber-400 px-4 py-2 text-sm flex items-center gap-2">
                      <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                      İstek Gönderildi
                    </span>
                  )}
                  {friendStatus === "friends" && (
                    <span className="rounded-lg border border-mint-500/30 text-mint-400 px-4 py-2 text-sm flex items-center gap-2">
                      <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                      Arkadaş
                    </span>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Stats */}
        {showStats && profile?.stats && (
          <div className="grid grid-cols-2 sm:grid-cols-5 gap-3 mt-6 pt-6 border-t border-ink-800">
            <StatBox label="Toplam İşlem" value={String(profile.stats.totalTrades)} />
            <StatBox label="Win Rate" value={`${profile.stats.winRate.toFixed(1)}%`} />
            <StatBox label="Ort. RR" value={profile.stats.avgRR.toFixed(2)} />
            <StatBox label="Net P&L" value={`${profile.stats.netResult >= 0 ? "+" : ""}$${profile.stats.netResult.toFixed(2)}`} />
            <StatBox label="Tutarlılık" value={`${(profile.stats.consistency * 100).toFixed(0)}%`} />
          </div>
        )}
      </div>

      {/* Leaderboard positions */}
      {showLeaderboard && leaderboardPositions.length > 0 && (
        <div className="rounded-xl border border-ink-800 bg-ink-900 p-5">
          <h3 className="font-display text-base font-semibold mb-3">Liderlik Sıralaması</h3>
          <div className="flex flex-wrap gap-3">
            {leaderboardPositions.map((pos) => {
              const periodLabel = PERIODS.find((p) => p.key === pos.period)?.label ?? pos.period;
              return (
                <div
                  key={pos.period}
                  className="flex items-center gap-2 rounded-lg border border-ink-700 bg-ink-950 px-3 py-2"
                >
                  <span className="text-xs font-mono text-paper-500">{periodLabel}</span>
                  <span className="text-lg font-bold font-mono text-mint-400">
                    #{pos.rank}
                  </span>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Strategies */}
      {strategies.length > 0 && (
        <div className="rounded-xl border border-ink-800 bg-ink-900 p-5">
          <h3 className="font-display text-base font-semibold mb-3">Stratejiler</h3>
          <div className="flex flex-wrap gap-2">
            {strategies.map((name) => (
              <span
                key={name}
                className="rounded-full bg-mint-500/10 text-mint-400 px-3 py-1 text-xs font-mono border border-mint-500/20"
              >
                {name}
              </span>
            ))}
          </div>
        </div>
      )}

      {/* Shared trades */}
      {showTrades && (
        <div className="rounded-xl border border-ink-800 bg-ink-900 p-5">
          <h3 className="font-display text-base font-semibold mb-3">Paylaşılan İşlemler</h3>
          <SharedTradeList uid={userData.uid} currentUid={user?.uid} />
        </div>
      )}

      {/* Achievements */}
      {showAchievements && profile?.achievements && profile.achievements.length > 0 && (
        <div className="rounded-xl border border-ink-800 bg-ink-900 p-5">
          <h3 className="font-display text-base font-semibold mb-3">Rozetler</h3>
          <AchievementsGrid earned={profile.achievements} />
        </div>
      )}
    </div>
  );
}

function StatBox({
  label,
  value,
}: {
  label: string;
  value: string;
}) {
  return (
    <div className="rounded-xl border border-ink-800 bg-ink-950 p-3">
      <p className="text-xs font-mono uppercase tracking-wide text-paper-500 mb-1">{label}</p>
      <p className="font-display text-base font-semibold font-mono text-paper-100">{value}</p>
    </div>
  );
}
