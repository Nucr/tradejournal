"use client";

import { useEffect, useState } from "react";
import {
  collection,
  getDocs,
  query,
  orderBy,
  doc,
  deleteDoc,
} from "firebase/firestore";
import { db } from "@/lib/firebase";
import { useAuth } from "@/lib/auth-context";
import { isAdmin } from "@/lib/admin";
import type { LeaderboardPeriod, LeaderboardEntry } from "@/lib/types";

const PERIODS: LeaderboardPeriod[] = ["weekly", "monthly", "alltime"];

export default function AdminLeaderboardPage() {
  const { user } = useAuth();
  const [authorized, setAuthorized] = useState<boolean | null>(null);
  const [period, setPeriod] = useState<LeaderboardPeriod>("alltime");
  const [entries, setEntries] = useState<(LeaderboardEntry & { uid: string })[]>([]);

  useEffect(() => {
    if (!user) return;
    isAdmin(user.uid).then(setAuthorized);
  }, [user]);

  useEffect(() => {
    if (!authorized) return;
    const q = query(collection(db, "leaderboard", period, "entries"), orderBy("score", "desc"));
    getDocs(q).then((snap) => {
      const list = snap.docs.map((d) => ({
        uid: d.id,
        ...d.data(),
        updatedAt: d.data().updatedAt?.toDate?.() ?? new Date(),
      })) as (LeaderboardEntry & { uid: string })[];
      setEntries(list);
    });
  }, [authorized, period]);

  async function handleRemove(uid: string) {
    await deleteDoc(doc(db, "leaderboard", period, "entries", uid));
    setEntries((prev) => prev.filter((e) => e.uid !== uid));
  }

  if (authorized === null) {
    return (
      <div className="flex items-center justify-center min-h-[50vh]">
        <div className="h-8 w-8 rounded-full border-2 border-mint-500 border-t-transparent animate-spin" />
      </div>
    );
  }

  if (!authorized) {
    return <p className="text-center text-coral-400 py-20">Yetkisiz erişim.</p>;
  }

  return (
    <div>
      <h1 className="font-display text-2xl font-semibold mb-1">Liderlik Tablosu</h1>
      <p className="text-sm text-paper-500 mb-6">Liderlik tablosu girişlerini yönet.</p>

      <div className="flex gap-2 mb-6">
        {PERIODS.map((p) => (
          <button
            key={p}
            onClick={() => setPeriod(p)}
            className={`rounded-lg px-4 py-2 text-sm font-medium transition ${
              period === p
                ? "bg-mint-500/10 text-mint-400 border border-mint-500/20"
                : "text-paper-400 border border-ink-700 hover:bg-ink-800"
            }`}
          >
            {p === "weekly" ? "Haftalık" : p === "monthly" ? "Aylık" : "Tüm Zamanlar"}
          </button>
        ))}
      </div>

      <div className="overflow-x-auto rounded-xl border border-ink-800">
        <table className="w-full text-sm">
          <thead>
            <tr className="bg-ink-900 text-paper-500 text-left">
              <th className="px-4 py-3 font-medium">#</th>
              <th className="px-4 py-3 font-medium">İsim</th>
              <th className="px-4 py-3 font-medium">Puan</th>
              <th className="px-4 py-3 font-medium">Seviye</th>
              <th className="px-4 py-3 font-medium">Rütbe</th>
              <th className="px-4 py-3 font-medium">İşlem</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-ink-800">
            {entries.map((e, i) => (
              <tr key={e.uid} className="hover:bg-ink-900/50">
                <td className="px-4 py-3 text-paper-500 font-mono text-xs">{i + 1}</td>
                <td className="px-4 py-3 text-paper-100">{e.displayName}</td>
                <td className="px-4 py-3 font-mono text-sm text-paper-100">{Math.round(e.score)}</td>
                <td className="px-4 py-3 font-mono text-xs text-paper-400">{e.level}</td>
                <td className="px-4 py-3 text-xs text-paper-400">{e.rank}</td>
                <td className="px-4 py-3">
                  <button
                    onClick={() => handleRemove(e.uid)}
                    className="rounded border border-coral-500/30 px-2.5 py-1 text-xs text-coral-400 hover:bg-coral-500/10 transition"
                  >
                    Kaldır
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
