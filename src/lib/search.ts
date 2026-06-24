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

  const q = query(
    collection(db, "publicProfiles"),
    where("displayName", ">=", queryText),
    where("displayName", "<", queryText + "\uf8ff"),
    orderBy("displayName"),
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
}
