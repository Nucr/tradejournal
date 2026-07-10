import { emitAchievements } from "./achievement-store";

export async function syncUserScore(uid: string): Promise<void> {
  try {
    const res = await fetch("/api/sync-score", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ uid }),
    });
    if (!res.ok) {
      const data = await res.json().catch(() => ({}));
      console.error("sync-score API error:", data.error || res.status);
      return;
    }
    const data = await res.json();
    if (data.newAchievements?.length > 0) {
      emitAchievements(data.newAchievements);
    }
  } catch (err) {
    console.error("syncUserScore error:", err);
  }
}
