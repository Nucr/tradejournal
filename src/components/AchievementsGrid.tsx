"use client";

import { ACHIEVEMENT_DEFS } from "@/lib/achievements";
import type { AchievementDef } from "@/lib/achievements";

interface Props {
  earned: string[];
}

const RARITY_COLORS: Record<string, string> = {
  common: "border-accent/15",
  rare: "border-accent/35",
  epic: "border-amber-400/40",
};

const RARITY_GLOW: Record<string, string> = {
  common: "shadow-none",
  rare: "shadow-[0_0_8px] shadow-accent/10",
  epic: "shadow-[0_0_12px] shadow-amber-400/20",
};

const RARITY_BG: Record<string, string> = {
  common: "bg-accent/[0.03]",
  rare: "bg-accent/[0.07]",
  epic: "bg-amber-400/[0.06]",
};

export default function AchievementsGrid({ earned }: Props) {
  const earnedSet = new Set(earned);

  return (
    <div className="grid grid-cols-6 gap-1.5">
      {ACHIEVEMENT_DEFS.map((a) => {
        const isEarned = earnedSet.has(a.id);
        const rarity = a.rarity ?? "common";
        return (
          <div
            key={a.id}
            title={`${a.label} — ${a.desc}`}
            className={`relative flex flex-col items-center justify-center text-center rounded-lg border p-1.5 transition-all duration-300 ${
              isEarned
                ? `${RARITY_BG[rarity]} ${RARITY_COLORS[rarity]} ${RARITY_GLOW[rarity]} cursor-default`
                : "border-ink-800/40 bg-transparent opacity-25 grayscale cursor-default"
            }`}
          >
            {!isEarned && (
              <span className="absolute top-0.5 right-1 text-[7px] text-paper-500 leading-none">
                🔒
              </span>
            )}
            <span className={`${isEarned ? "" : "invisible"} leading-none`}>
              <span className="text-xs">{a.icon ?? "🏆"}</span>
            </span>
            <p className="text-[7px] font-medium leading-tight mt-0.5 text-paper-300">
              {a.label}
            </p>
          </div>
        );
      })}
    </div>
  );
}
