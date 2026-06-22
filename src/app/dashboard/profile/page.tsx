"use client";

import { useEffect, useState } from "react";
import { useAuth } from "@/lib/auth-context";
import { getProfile, saveProfile } from "@/lib/profile";
import { subscribeToTrades } from "@/lib/trades";
import { computeStats } from "@/lib/date-utils";
import { Trade, UserProfile } from "@/lib/types";
import AchievementsGrid from "@/components/AchievementsGrid";

const DEFAULT_AVATAR_COLOR = "#2ED9A4";

export default function ProfilePage() {
  const { user } = useAuth();
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [trades, setTrades] = useState<Trade[]>([]);
  const [editing, setEditing] = useState(false);
  const [displayName, setDisplayName] = useState("");
  const [avatarUrl, setAvatarUrl] = useState("");
  const [isPublic, setIsPublic] = useState(false);
  const [showStrategy, setShowStrategy] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (!user) return;
    getProfile(user.uid).then((p) => {
      if (p) {
        setProfile(p);
        setDisplayName(p.displayName || user.displayName || "");
        setAvatarUrl(p.avatarUrl || "");
        setIsPublic(p.isPublic);
        setShowStrategy(p.showStrategy);
      } else {
        setDisplayName(user.displayName || "");
      }
    });
    const unsub = subscribeToTrades(user.uid, setTrades);
    return unsub;
  }, [user]);

  const stats = computeStats(trades);

  async function handleSave() {
    if (!user) return;
    setSaving(true);
    const newProfile: UserProfile = {
      displayName,
      ...(avatarUrl ? { avatarUrl } : {}),
      avatarColor: profile?.avatarColor ?? "#2ED9A4",
      level: profile?.level ?? 1,
      rank: profile?.rank ?? "Çaylak",
      score: profile?.score ?? 0,
      isPublic,
      showStrategy,
      stats: profile?.stats ?? {
        totalTrades: 0,
        winRate: 0,
        avgRR: 0,
        netResult: 0,
        consistency: 0,
      },
      updatedAt: new Date(),
    };
    await saveProfile(user.uid, newProfile);
    setProfile(newProfile);
    setEditing(false);
    setSaving(false);
  }

  return (
    <div className="space-y-6 animate-fade-in-up">
      <div>
        <h1 className="font-display text-2xl font-semibold">Profil</h1>
        <p className="text-sm text-paper-300 mt-1">Hesap bilgilerin ve istatistiklerin.</p>
      </div>

      {/* Profile card */}
      <div className="rounded-xl border border-ink-800 bg-ink-900 p-6 animate-fade-in-up stagger-1">
        <div className="flex items-start gap-5 flex-wrap">
          {/* Avatar */}
          <div
            className="w-16 h-16 rounded-2xl flex items-center justify-center text-2xl font-bold text-ink-950 shrink-0"
            style={{ backgroundColor: DEFAULT_AVATAR_COLOR }}
          >
            {(displayName || user?.email || "?")[0].toUpperCase()}
          </div>

          <div className="flex-1 min-w-0">
            {editing ? (
              <div className="space-y-3">
                <div>
                  <label className="block text-xs font-mono uppercase tracking-wide text-paper-500 mb-1">İsim</label>
                  <input
                    value={displayName}
                    onChange={(e) => setDisplayName(e.target.value)}
                    className="rounded-lg border border-ink-700 bg-ink-950 px-3 py-2 text-sm w-full max-w-xs focus:border-mint-500"
                  />
                </div>
                <div>
                  <label className="block text-xs font-mono uppercase tracking-wide text-paper-500 mb-1">Avatar URL</label>
                  <input
                    value={avatarUrl}
                    onChange={(e) => setAvatarUrl(e.target.value)}
                    placeholder="https://example.com/avatar.png"
                    className="rounded-lg border border-ink-700 bg-ink-950 px-3 py-2 text-sm w-full max-w-xs focus:border-mint-500"
                  />
                </div>
                <div className="flex items-center gap-6 flex-wrap">
                  <label className="flex items-center gap-2 text-sm text-paper-300">
                    <input
                      type="checkbox"
                      checked={isPublic}
                      onChange={(e) => setIsPublic(e.target.checked)}
                      className="rounded border-ink-700 bg-ink-950 text-mint-500 focus:ring-mint-500"
                    />
                    Profili herkese açık yap
                  </label>
                  <label className="flex items-center gap-2 text-sm text-paper-300">
                    <input
                      type="checkbox"
                      checked={showStrategy}
                      onChange={(e) => setShowStrategy(e.target.checked)}
                      className="rounded border-ink-700 bg-ink-950 text-mint-500 focus:ring-mint-500"
                    />
                    Strateji bilgisini göster
                  </label>
                </div>
                <div className="flex gap-2 pt-1">
                  <button
                    onClick={handleSave}
                    disabled={saving}
                    className="rounded-lg bg-mint-500 px-4 py-2 text-sm font-semibold text-ink-950 hover:bg-mint-400 transition disabled:opacity-60"
                  >
                    {saving ? "kaydediliyor…" : "Kaydet"}
                  </button>
                  <button
                    onClick={() => setEditing(false)}
                    className="rounded-lg border border-ink-700 px-4 py-2 text-sm text-paper-300 hover:bg-ink-800 transition"
                  >
                    İptal
                  </button>
                </div>
              </div>
            ) : (
              <div>
                <h2 className="font-display text-xl font-semibold">
                  {profile?.displayName || user?.displayName || "İsimsiz Trader"}
                </h2>
                <p className="text-sm text-paper-500 font-mono mt-0.5">{user?.email}</p>
                <div className="flex items-center gap-3 mt-2 text-sm">
                  <span className="rounded-full bg-mint-500/10 text-mint-400 px-2.5 py-0.5 text-xs font-semibold font-mono">
                    Seviye {profile?.level ?? 1}
                  </span>
                  <span className="text-paper-400 font-mono text-xs">
                    {profile?.rank ?? "Çaylak"}
                  </span>
                  <span className="text-paper-400 font-mono text-xs">
                    {profile?.score ?? 0} Puan
                  </span>
                </div>
                <button
                  onClick={() => setEditing(true)}
                  className="mt-3 text-xs font-mono text-mint-400 hover:text-mint-300 transition"
                >
                  Düzenle →
                </button>
              </div>
            )}
          </div>
        </div>

        {/* Stats from profile */}
        {profile?.stats && (
          <div className="grid grid-cols-2 sm:grid-cols-5 gap-3 mt-6 pt-6 border-t border-ink-800">
            <StatBox label="Toplam İşlem" value={String(profile.stats.totalTrades)} />
            <StatBox label="Win Rate" value={`${profile.stats.winRate.toFixed(1)}%`} />
            <StatBox label="Ort. RR" value={profile.stats.avgRR.toFixed(2)} />
            <StatBox label="Net P&L" value={`${profile.stats.netResult >= 0 ? "+" : ""}$${profile.stats.netResult.toFixed(2)}`} />
            <StatBox label="Tutarlılık" value={`${(profile.stats.consistency * 100).toFixed(0)}%`} />
          </div>
        )}
      </div>

      {/* Stats from trades */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 animate-fade-in-up stagger-3">
        <StatBox label="Toplam İşlem" value={String(stats.total)} />
        <StatBox
          label="Kazanma Oranı"
          value={`${stats.winRate.toFixed(1)}%`}
          sub={`${stats.wins}K / ${stats.losses}Z`}
          tone={stats.winRate >= 50 ? "mint" : "coral"}
        />
        <StatBox
          label="En İyi Win Streak"
          value={String(stats.maxWinStreak)}
          sub={`Aktif: ${stats.currentWinStreak}`}
          tone="mint"
        />
        <StatBox
          label="En Kötü Lose Streak"
          value={String(stats.maxLoseStreak)}
          sub={`Aktif: ${stats.currentLoseStreak}`}
          tone="coral"
        />
      </div>

      {/* Current streak */}
      {(stats.currentWinStreak > 0 || stats.currentLoseStreak > 0) && (
        <div className={`rounded-xl border p-4 animate-fade-in-up stagger-4 flex items-center gap-4 ${
          stats.currentWinStreak > 0
            ? "border-mint-500/30 bg-mint-500/5"
            : "border-coral-500/30 bg-coral-500/5"
        }`}>
          <span className="text-3xl">
            {stats.currentWinStreak > 0 ? "🔥" : "❄️"}
          </span>
          <div>
            <p className={`font-display font-semibold ${stats.currentWinStreak > 0 ? "text-mint-400" : "text-coral-400"}`}>
              {stats.currentWinStreak > 0
                ? `${stats.currentWinStreak} işlemlik kazanma serisi devam ediyor!`
                : `${stats.currentLoseStreak} işlemlik kaybetme serisi devam ediyor.`}
            </p>
            <p className="text-sm text-paper-500 mt-0.5">
              {stats.currentWinStreak > 0
                ? "Disiplini koru, stratejine sadık kal."
                : "Risk yönetimine dikkat et, fazla pozisyon açma."}
            </p>
          </div>
        </div>
      )}

      {/* Achievements */}
      <div className="animate-fade-in-up stagger-5">
        <h2 className="font-display text-lg font-semibold mb-3">Rozetler</h2>
        <AchievementsGrid earned={profile?.achievements ?? []} />
      </div>
    </div>
  );
}

function StatBox({
  label,
  value,
  sub,
  tone,
}: {
  label: string;
  value: string;
  sub?: string;
  tone?: "mint" | "coral" | "amber";
}) {
  const toneClass =
    tone === "mint"
      ? "text-mint-400"
      : tone === "coral"
      ? "text-coral-400"
      : tone === "amber"
      ? "text-amber-400"
      : "text-paper-100";

  return (
    <div className="rounded-xl border border-ink-800 bg-ink-900 p-4">
      <p className="text-xs font-mono uppercase tracking-wide text-paper-500 mb-2">{label}</p>
      <div className="flex items-end gap-1.5">
        <p className={`font-display text-xl font-semibold font-mono ${toneClass}`}>{value}</p>
      </div>
      {sub && <p className="text-xs text-paper-500 font-mono mt-1">{sub}</p>}
    </div>
  );
}
