import {
  collection,
  doc,
  getDoc,
  getDocs,
  onSnapshot,
  orderBy,
  query,
  setDoc,
  updateDoc,
  serverTimestamp,
  where,
} from "firebase/firestore";
import { db } from "./firebase";
import { LeaderboardEntry, LeaderboardPeriod } from "./types";

function leaderboardRef(period: LeaderboardPeriod) {
  return collection(db, "leaderboard", period, "entries");
}

function leaderboardEntryDoc(period: LeaderboardPeriod, uid: string) {
  return doc(db, "leaderboard", period, "entries", uid);
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

export function subscribeToLeaderboard(
  period: LeaderboardPeriod,
  callback: (entries: (LeaderboardEntry & { uid: string })[]) => void
) {
  const q = query(leaderboardRef(period), orderBy("score", "desc"));
  return onSnapshot(q, (snapshot) => {
    const entries = snapshot.docs.map((d) => ({
      uid: d.id,
      ...d.data(),
      updatedAt: d.data().updatedAt?.toDate?.() ?? new Date(),
    })) as (LeaderboardEntry & { uid: string })[];
    callback(entries);
  });
}

export async function getLeaderboardEntry(
  period: LeaderboardPeriod,
  uid: string
): Promise<(LeaderboardEntry & { uid: string }) | null> {
  const snap = await getDoc(leaderboardEntryDoc(period, uid));
  if (!snap.exists()) return null;
  const data = snap.data();
  return {
    uid: snap.id,
    ...data,
    updatedAt: data.updatedAt?.toDate?.() ?? new Date(),
  } as LeaderboardEntry & { uid: string };
}

export async function setLeaderboardEntry(
  period: LeaderboardPeriod,
  uid: string,
  data: LeaderboardEntry
) {
  await setDoc(leaderboardEntryDoc(period, uid), {
    ...data,
    updatedAt: serverTimestamp(),
  });
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

export async function updateLeaderboardEntry(
  period: LeaderboardPeriod,
  uid: string,
  data: Partial<LeaderboardEntry>
) {
  await updateDoc(leaderboardEntryDoc(period, uid), {
    ...data,
    updatedAt: serverTimestamp(),
  });
}
