"use client";

import { ACHIEVEMENT_DEFS } from "@/lib/achievements";

interface Props {
  earned: string[];
}

export default function AchievementsGrid({ earned }: Props) {
  const earnedSet = new Set(earned);

  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
      {ACHIEVEMENT_DEFS.map((a) => {
        const isEarned = earnedSet.has(a.id);
        return (
          <div
            key={a.id}
            className={`rounded-xl border p-3 transition ${
              isEarned
                ? "border-mint-500/30 bg-mint-500/5"
                : "border-ink-700 bg-ink-900/30 opacity-40"
            }`}
          >
            <div className="flex items-center gap-2.5">
              <span className="text-lg">{ACHIEVEMENT_ICONS[a.id] ?? "🏆"}</span>
              <div className="min-w-0">
                <p
                  className={`text-sm font-semibold truncate ${
                    isEarned ? "text-paper-100" : "text-paper-500"
                  }`}
                >
                  {a.label}
                </p>
                <p className="text-[11px] text-paper-500 truncate">{a.desc}</p>
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}

const ACHIEVEMENT_ICONS: Record<string, string> = {
  first_trade: "🎯",
  ten_trades: "🔥",
  fifty_trades: "💎",
  win_streak_5: "⚡",
  rr_master: "📐",
  win_rate_60: "🎯",
  consistent: "🔄",
  level_5: "⭐",
  level_10: "👑",
};
