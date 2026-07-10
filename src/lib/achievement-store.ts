import type { Achievement } from "./achievements";

const listeners: Array<(achievements: Achievement[]) => void> = [];

export function onNewAchievements(fn: (achievements: Achievement[]) => void) {
  listeners.push(fn);
  return () => {
    const i = listeners.indexOf(fn);
    if (i >= 0) listeners.splice(i, 1);
  };
}

export function emitAchievements(achievements: Achievement[]) {
  for (const fn of listeners) fn(achievements);
}

