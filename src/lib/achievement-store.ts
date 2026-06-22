import { doc, getDoc, setDoc, serverTimestamp } from "firebase/firestore";
import { db } from "./firebase";
import { ACHIEVEMENT_DEFS, checkEarned } from "./achievements";
import type { Achievement } from "./achievements";

const listeners: Array<(achievements: Achievement[]) => void> = [];

export function onNewAchievements(fn: (achievements: Achievement[]) => void) {
  listeners.push(fn);
  return () => {
    const i = listeners.indexOf(fn);
    if (i >= 0) listeners.splice(i, 1);
  };
}

function emit(achievements: Achievement[]) {
  for (const fn of listeners) fn(achievements);
}

export async function checkAndAwardAchievements(
  uid: string,
  stats: { totalTrades: number; winRate: number; avgRR: number; netResult: number; consistency: number },
  level: number,
  trades: { result: number; entryDate: string }[]
): Promise<Achievement[]> {
  const earned = checkEarned(
    ACHIEVEMENT_DEFS,
    { totalTrades: stats.totalTrades, winRate: stats.winRate, avgRR: stats.avgRR, consistency: stats.consistency, level },
    trades
  );

  if (earned.length === 0) return [];

  const userRef = doc(db, "users", uid);
  const userSnap = await getDoc(userRef);

  const existing: string[] = userSnap.exists()
    ? (userSnap.data().achievements as string[]) ?? []
    : [];

  const newIds = earned.filter((id) => !existing.includes(id));
  if (newIds.length === 0) return [];

  const allIds = [...new Set([...existing, ...newIds])];
  await setDoc(userRef, { achievements: allIds, updatedAt: serverTimestamp() }, { merge: true });

  const newAchievements: Achievement[] = newIds.map((id) => {
    const def = ACHIEVEMENT_DEFS.find((d) => d.id === id);
    return {
      id,
      label: def?.label ?? id,
      desc: def?.desc ?? "",
      icon: def?.icon ?? "🏆",
      earnedAt: new Date().toISOString(),
    };
  });

  emit(newAchievements);
  return newAchievements;
}
