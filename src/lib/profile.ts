import {
  DocumentSnapshot,
  doc,
  getDoc,
  onSnapshot,
  setDoc,
  updateDoc,
  serverTimestamp,
  Unsubscribe,
} from "firebase/firestore";
import { db } from "./firebase";
import { UserProfile } from "./types";

function userDoc(uid: string) {
  return doc(db, "users", uid);
}

function mapProfile(snap: DocumentSnapshot): UserProfile | null {
  if (!snap.exists()) return null;
  const data = snap.data()!;
  return {
    ...data,
    updatedAt: (data.updatedAt as { toDate?: () => Date })?.toDate?.() ?? new Date(),
  } as UserProfile;
}

export async function getProfile(uid: string): Promise<UserProfile | null> {
  const snap = await getDoc(userDoc(uid));
  return mapProfile(snap);
}

export function subscribeToProfile(
  uid: string,
  callback: (profile: UserProfile | null) => void
): Unsubscribe {
  return onSnapshot(userDoc(uid), (snap) => {
    callback(mapProfile(snap));
  });
}

export async function saveProfile(uid: string, profile: Partial<UserProfile>) {
  const ref = userDoc(uid);
  const snap = await getDoc(ref);
  const payload = { ...profile, updatedAt: serverTimestamp() };
  if (snap.exists()) {
    await updateDoc(ref, payload);
  } else {
    await setDoc(ref, payload);
  }
  // Sync public fields to publicProfiles collection
  await savePublicProfile(uid, profile);
}

export interface UserDisplayInfo {
  displayName: string;
  avatarUrl?: string;
  avatarColor: string;
}

// ─── Public Profiles (arama / listeleme için) ───

function publicProfileDoc(uid: string) {
  return doc(db, "publicProfiles", uid);
}

export interface PublicProfileData {
  displayName: string;
  avatarUrl?: string;
  avatarColor: string;
  isPublic: boolean;
  level: number;
  rank: string;
  score: number;
  showStrategy?: boolean;
  showLeaderboard?: boolean;
  showTrades?: boolean;
  showAchievements?: boolean;
  showStats?: boolean;
  stats?: {
    totalTrades: number;
    winRate: number;
    avgRR: number;
    netResult: number;
    consistency: number;
  };
  achievements?: string[];
}

export async function getPublicProfile(uid: string): Promise<PublicProfileData | null> {
  const snap = await getDoc(publicProfileDoc(uid));
  if (!snap.exists()) return null;
  return snap.data() as PublicProfileData;
}

export async function savePublicProfile(uid: string, data: Partial<UserProfile>) {
  const publicData: Record<string, unknown> = {
    displayName: data.displayName,
    avatarUrl: data.avatarUrl,
    avatarColor: data.avatarColor,
    isPublic: data.isPublic,
    level: data.level,
    rank: data.rank,
    score: data.score,
  showStrategy: data.showStrategy,
  showLeaderboard: data.showLeaderboard,
  showLevel: data.showLevel,
  showTrades: data.showTrades,
  showAchievements: data.showAchievements,
  showStats: data.showStats,
  leaderboardOptIn: data.leaderboardOptIn,
  };
  if (data.stats) publicData.stats = data.stats;
  if (data.achievements) publicData.achievements = data.achievements;
  // Remove undefined values
  Object.keys(publicData).forEach((k) => {
    if (publicData[k] === undefined) delete publicData[k];
  });
  if (Object.keys(publicData).length > 0) {
    await setDoc(publicProfileDoc(uid), publicData, { merge: true });
  }
}

export async function syncPublicProfile(uid: string) {
  const [userSnap, publicSnap] = await Promise.all([
    getDoc(userDoc(uid)),
    getDoc(publicProfileDoc(uid)),
  ]);
  if (userSnap.exists() && !publicSnap.exists()) {
    const data = userSnap.data() as Record<string, unknown>;
    await setDoc(publicProfileDoc(uid), {
      displayName: data.displayName,
      avatarUrl: data.avatarUrl,
      avatarColor: data.avatarColor,
      isPublic: data.isPublic ?? true,
      level: data.level ?? 1,
      rank: data.rank ?? "Çaylak",
      score: data.score ?? 0,
      showStrategy: data.showStrategy ?? true,
      showLeaderboard: data.showLeaderboard ?? true,
      showLevel: data.showLevel ?? true,
      showTrades: data.showTrades ?? true,
      showAchievements: data.showAchievements ?? true,
      showStats: data.showStats ?? true,
      leaderboardOptIn: data.leaderboardOptIn ?? false,
    }, { merge: true });
  }
}

export async function getPublicDisplayMap(uids: string[]): Promise<Record<string, UserDisplayInfo>> {
  const map: Record<string, UserDisplayInfo> = {};
  const results = await Promise.allSettled(uids.map((uid) => getPublicProfile(uid)));
  uids.forEach((uid, i) => {
    const res = results[i];
    if (res.status === "fulfilled" && res.value) {
      map[uid] = {
        displayName: res.value.displayName,
        avatarUrl: res.value.avatarUrl,
        avatarColor: res.value.avatarColor,
      };
    } else {
      map[uid] = {
        displayName: uid.slice(0, 8),
        avatarColor: "#2ED9A4",
      };
    }
  });
  return map;
}
