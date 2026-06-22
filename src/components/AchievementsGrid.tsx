"use client";

import { ACHIEVEMENT_DEFS } from "@/lib/achievements";

interface Props {
  earned: string[];
}

export default function AchievementsGrid({ earned }: Props) {
  const earnedSet = new Set(earned);

  return (
    <div className="grid grid-cols-5 gap-2">
      {ACHIEVEMENT_DEFS.map((a) => {
        const isEarned = earnedSet.has(a.id);
        return (
          <div
            key={a.id}
            className={`relative aspect-square rounded-xl border flex flex-col items-center justify-center text-center p-1.5 transition ${
              isEarned
                ? "border-mint-500/30 bg-mint-500/5"
                : "border-ink-700 bg-ink-900/30 opacity-30"
            }`}
          >
            {!isEarned && (
              <div className="absolute inset-0 flex items-center justify-center z-10">
                <span className="text-lg text-paper-500">🔒</span>
              </div>
            )}
            <span className={`text-xl ${!isEarned ? "invisible" : ""}`}>
              {a.icon ?? "🏆"}
            </span>
            <p
              className={`text-[10px] font-semibold leading-tight mt-1 ${
                isEarned ? "text-paper-100" : "text-paper-500"
              }`}
            >
              {a.label}
            </p>
          </div>
        );
      })}
    </div>
  );
}

