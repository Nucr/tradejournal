import { initializeApp } from "firebase-admin/app";
import { getFirestore } from "firebase-admin/firestore";

const app = initializeApp();
const db = getFirestore(app);

const usersSnap = await db.collection("users").get();
let count = 0;

for (const userDoc of usersSnap.docs) {
  const uid = userDoc.id;
  const publicRef = db.collection("publicProfiles").doc(uid);
  const publicSnap = await publicRef.get();
  if (publicSnap.exists) continue;

  const data = userDoc.data();
  await publicRef.set({
    displayName: data.displayName ?? uid.slice(0, 8),
    avatarUrl: data.avatarUrl ?? null,
    avatarColor: data.avatarColor ?? "#2ED9A4",
    isPublic: data.isPublic ?? true,
    level: data.level ?? 1,
    rank: data.rank ?? "Çaylak",
    score: data.score ?? 0,
    showStrategy: data.showStrategy ?? true,
    showLeaderboard: data.showLeaderboard ?? true,
    showTrades: data.showTrades ?? true,
    showAchievements: data.showAchievements ?? true,
    showStats: data.showStats ?? true,
  }, { merge: true });
  count++;
}

console.log(`Backfill complete: ${count} publicProfiles created`);
process.exit(0);
