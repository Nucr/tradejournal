"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { doc, getDoc } from "firebase/firestore";
import { db } from "@/lib/firebase";
import { UserSearchResult } from "@/lib/types";
import PublicProfileView from "@/components/PublicProfileView";

export default function UserProfilePage() {
  const params = useParams();
  const router = useRouter();
  const uid = params?.uid as string;
  const [userData, setUserData] = useState<UserSearchResult | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    if (!uid) return;
    async function load() {
      try {
        const snap = await getDoc(doc(db, "users", uid));
        if (!snap.exists()) {
          setError("Kullanıcı bulunamadı.");
          return;
        }
        const data = snap.data();
        if (data.isPublic === false) {
          setError("Bu kullanıcının profili gizli.");
          return;
        }
        setUserData({
          uid,
          displayName: data.displayName as string,
          avatarUrl: data.avatarUrl as string | undefined,
          avatarColor: (data.avatarColor as string) ?? "#2ED9A4",
          level: (data.level as number) ?? 1,
          rank: (data.rank as UserSearchResult["rank"]) ?? "Çaylak",
          score: (data.score as number) ?? 0,
        });
      } catch {
        setError("Profil yüklenirken bir hata oluştu.");
      } finally {
        setLoading(false);
      }
    }
    load();
  }, [uid]);

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <div className="w-8 h-8 border-2 border-mint-500 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="space-y-4">
        <button
          onClick={() => router.back()}
          className="text-sm text-paper-400 hover:text-paper-200 transition flex items-center gap-1"
        >
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
          Geri
        </button>
        <div className="rounded-xl border border-ink-800 bg-ink-900 p-12 text-center">
          <p className="text-paper-400">{error}</p>
        </div>
      </div>
    );
  }

  if (!userData) return null;

  return (
    <div className="space-y-4">
      <button
        onClick={() => router.back()}
        className="text-sm text-paper-400 hover:text-paper-200 transition flex items-center gap-1"
      >
        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
        </svg>
        Geri
      </button>
      <PublicProfileView userData={userData} />
    </div>
  );
}
