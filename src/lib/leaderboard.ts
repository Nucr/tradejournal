import {
  collection,
  doc,
  getDoc,
  getDocs,
  orderBy,
  query,
  setDoc,
  serverTimestamp,
  where,
} from "firebase/firestore";
import { db } from "./firebase";
import { LeaderboardEntry, LeaderboardPeriod } from "./types";

function leaderboardRef(period: LeaderboardPeriod) {
  return collection(db, "leaderboard", period, "entries");
}

export async function getLeaderboard(
  period: LeaderboardPeriod
): Promise<(LeaderboardEntry & { uid: string })[]> {
  const q = query(leaderboardRef(period), orderBy("score", "desc"));
  const snap = await getDocs(q);
  return snap.docs.map((d) => ({
    uid: d.id,
    ...d.data(),
    updatedAt: d.data().updatedAt?.toDate?.() ?? new Date(),
  })) as (LeaderboardEntry & { uid: string })[];
}

export async function getLeaderboardRank(
  period: LeaderboardPeriod,
  uid: string
): Promise<{ rank: number; entry: (LeaderboardEntry & { uid: string }) | null }> {
  const entries = await getLeaderboard(period);
  const sorted = entries.sort((a, b) => b.score - a.score);
  const idx = sorted.findIndex((e) => e.uid === uid);
  if (idx === -1) return { rank: 0, entry: null };
  return { rank: idx + 1, entry: sorted[idx] };
}
