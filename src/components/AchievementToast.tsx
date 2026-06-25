"use client";

import { useEffect, useState } from "react";
import { ACHIEVEMENT_DEFS } from "@/lib/achievements";
import type { Achievement } from "@/lib/achievements";
import { onNewAchievements } from "@/lib/achievement-store";

const CONFETTI_COLORS = ["#2ED9A4", "#F59E0B", "#3B82F6", "#EC4899", "#8B5CF6", "#EF4444"];

function Confetti() {
  return (
    <div className="absolute inset-0 pointer-events-none overflow-hidden rounded-lg">
      {Array.from({ length: 12 }).map((_, i) => {
        const color = CONFETTI_COLORS[i % CONFETTI_COLORS.length];
        const left = Math.random() * 100;
        const delay = Math.random() * 0.3;
        const duration = 0.6 + Math.random() * 0.6;
        const size = 3 + Math.random() * 4;
        return (
          <div
            key={i}
            className="absolute top-0 rounded-sm animate-confetti-fall"
            style={{
              left: `${left}%`,
              width: size,
              height: size * 1.4,
              backgroundColor: color,
              animationDelay: `${delay}s`,
              animationDuration: `${duration}s`,
            }}
          />
        );
      })}
    </div>
  );
}

export default function AchievementToast() {
  const [achievement, setAchievement] = useState<Achievement | null>(null);

  useEffect(() => {
    const unsub = onNewAchievements((achievements) => {
      for (let i = 0; i < achievements.length; i++) {
        const a = achievements[i];
        setTimeout(() => {
          setAchievement(a);
          setTimeout(() => setAchievement(null), 3000);
        }, i * 3500);
      }
    });
    return unsub;
  }, []);

  if (!achievement) return null;

  const def = ACHIEVEMENT_DEFS.find((d) => d.id === achievement.id);
  const rarity = def?.rarity ?? "common";

  return (
    <div className="fixed top-4 right-4 z-[100] animate-fade-in-up" key={achievement.id}>
      <div className="relative rounded-xl border border-ink-700/60 bg-ink-900/95 backdrop-blur-sm px-4 py-3 pr-10 shadow-xl overflow-hidden">
        <Confetti />
        <div className="relative z-10 flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-lg bg-accent/[0.08] flex items-center justify-center text-sm shrink-0">
            {def?.icon ?? "🏆"}
          </div>
          <div>
            <p className="text-[10px] text-paper-500 font-medium uppercase tracking-wider">Yeni Rozet!</p>
            <p className="text-sm font-semibold text-paper-100">
              {achievement.label}
            </p>
            <p className="text-[11px] text-paper-500 mt-0.5">{achievement.desc}</p>
          </div>
        </div>
        {rarity === "epic" && (
          <div className="absolute bottom-0 left-0 right-0 h-[2px] bg-gradient-to-r from-transparent via-amber-400 to-transparent" />
        )}
      </div>
    </div>
  );
}
