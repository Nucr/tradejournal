import {
  collection,
  getDocs,
  limit,
  orderBy,
  query,
  where,
} from "firebase/firestore";
import { db } from "./firebase";
import { UserSearchResult } from "./types";

export async function searchUsers(
  queryText: string,
  maxResults = 20
): Promise<UserSearchResult[]> {
  if (!queryText.trim()) return [];

  const lower = queryText.toLowerCase();

  try {
    const q = query(
      collection(db, "publicProfiles"),
      where("displayName_lower", ">=", lower),
      where("displayName_lower", "<", lower + "\uf8ff"),
      orderBy("displayName_lower"),
      limit(maxResults)
    );

    const snap = await getDocs(q);
    const results = snap.docs
      .filter((d) => d.data().isPublic !== false)
      .map((d) => {
        const data = d.data();
        return {
          uid: d.id,
          displayName: data.displayName as string,
          avatarUrl: data.avatarUrl as string | undefined,
          avatarColor: (data.avatarColor as string) ?? "#2ED9A4",
          level: (data.level as number) ?? 1,
          rank: (data.rank as UserSearchResult["rank"]) ?? "Çaylak",
          score: (data.score as number) ?? 0,
        };
      });
    if (results.length > 0) return results;
  } catch (err) {
    console.warn("searchUsers (publicProfiles) failed, trying users collection:", err);
  }

  // Fallback: search users collection directly
  try {
    const q = query(
      collection(db, "users"),
      where("displayName_lower", ">=", lower),
      where("displayName_lower", "<", lower + "\uf8ff"),
      orderBy("displayName_lower"),
      limit(maxResults)
    );
    const snap = await getDocs(q);
    return snap.docs
      .filter((d) => d.data().isPublic !== false)
      .map((d) => {
        const data = d.data();
        return {
          uid: d.id,
          displayName: data.displayName as string,
          avatarUrl: data.avatarUrl as string | undefined,
          avatarColor: (data.avatarColor as string) ?? "#2ED9A4",
          level: (data.level as number) ?? 1,
          rank: (data.rank as UserSearchResult["rank"]) ?? "Çaylak",
          score: (data.score as number) ?? 0,
        };
      });
  } catch (err) {
    console.error("searchUsers fallback also failed:", err);
    return [];
  }
}
