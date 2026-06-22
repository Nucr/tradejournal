"use client";

import { useEffect, useState } from "react";
import { ACHIEVEMENT_DEFS } from "@/lib/achievements";
import type { Achievement } from "@/lib/achievements";
import { onNewAchievements } from "@/lib/achievement-store";

const CONFETTI_COLORS = ["#2ED9A4", "#F59E0B", "#3B82F6", "#EC4899", "#8B5CF6", "#EF4444"];

function Confetti() {
  return (
    <div className="absolute inset-0 pointer-events-none overflow-hidden">
      {Array.from({ length: 20 }).map((_, i) => {
        const color = CONFETTI_COLORS[i % CONFETTI_COLORS.length];
        const left = Math.random() * 100;
        const delay = Math.random() * 0.3;
        const duration = 0.6 + Math.random() * 0.6;
        const size = 4 + Math.random() * 6;
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

  return (
    <div className="fixed top-4 right-4 z-[100] animate-fade-in-up" key={achievement.id}>
      <div className="relative rounded-xl border border-ink-700 bg-ink-900 px-5 py-4 pr-12 shadow-xl overflow-hidden">
        <Confetti />
        <div className="relative z-10 flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-amber-400/15 flex items-center justify-center text-lg shrink-0">
            {def?.icon ?? "🏆"}
          </div>
          <div>
            <p className="text-xs text-paper-500">Yeni Rozet!</p>
            <p className="text-sm font-semibold text-paper-100">
              {achievement.label}
            </p>
            <p className="text-xs text-paper-500 mt-0.5">{achievement.desc}</p>
          </div>
        </div>
      </div>
    </div>
  );
}
