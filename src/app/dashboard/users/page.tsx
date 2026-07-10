"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { collection, getDocs, limit, orderBy, query } from "firebase/firestore";
import { db } from "@/lib/firebase";
import type { Rank, UserProfile } from "@/lib/types";
import Avatar from "@/components/Avatar";
import RankBadge from "@/components/RankBadge";

const RANKS: Rank[] = [
  "Çaylak", "Acemi", "Gelişen", "Deneyimli", "Uzman",
  "İleri", "Usta", "Elit", "Efsane", "Efsanevi",
];

export default function UsersPage() {
  const router = useRouter();
  const [users, setUsers] = useState<(UserProfile & { uid: string })[]>([]);
  const [search, setSearch] = useState("");
  const [rankFilter, setRankFilter] = useState<Rank | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const q = query(
      collection(db, "publicProfiles"),
      orderBy("displayName_lower"),
      limit(100),
    );
    getDocs(q)
      .then((snap) => {
        const list = snap.docs
          .map((d) => ({ uid: d.id, ...d.data() } as UserProfile & { uid: string }));
        setUsers(list);
        setLoading(false);
      })
      .catch((err) => {
        const message = err instanceof Error ? err.message : "Kullanıcılar yüklenemedi";
        setError(message);
        setLoading(false);
      });
  }, []);

  const filtered = useMemo(() => {
    let list = users;
    if (rankFilter) {
      list = list.filter((u) => u.rank === rankFilter);
    }
    if (search.trim()) {
      const q = search.toLowerCase();
      list = list.filter((u) => u.displayName?.toLowerCase().includes(q));
    }
    return list;
  }, [users, search, rankFilter]);

  return (
    <div className="space-y-6 animate-fade-in-up">
      <div>
        <h1 className="font-display text-2xl font-semibold">Kullanıcılar</h1>
        <p className="text-sm text-paper-300 mt-1">
          Diğer traderların profillerini görüntüle ve onlarla bağlantı kur.
        </p>
      </div>

      {/* Search + Rank filter */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3">
        <div className="relative w-full sm:w-64">
          <svg className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-paper-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
          </svg>
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Kullanıcı ara…"
            className="w-full rounded-xl border border-ink-800 bg-ink-900 pl-9 pr-3 py-2 text-sm text-paper-100 placeholder:text-paper-500 focus:outline-none focus:border-mint-500/50 focus:ring-1 focus:ring-mint-500/20 transition"
          />
        </div>
        <div className="flex gap-1 rounded-xl border border-ink-800 bg-ink-900 p-1 w-fit flex-wrap">
          <button
            onClick={() => setRankFilter(null)}
            className={`rounded-lg px-3 py-1.5 text-xs font-medium transition ${
              !rankFilter
                ? "bg-mint-500/15 text-mint-400 border border-mint-500/20"
                : "text-paper-400 hover:text-paper-200"
            }`}
          >
            Tümü
          </button>
          {RANKS.map((r) => (
            <button
              key={r}
              onClick={() => setRankFilter(rankFilter === r ? null : r)}
              className={`rounded-lg px-3 py-1.5 text-xs font-medium transition ${
                rankFilter === r
                  ? "bg-mint-500/15 text-mint-400 border border-mint-500/20"
                  : "text-paper-400 hover:text-paper-200"
              }`}
            >
              {r}
            </button>
          ))}
        </div>
      </div>

      {/* Error */}
      {error && (
        <div className="flex items-center justify-center min-h-[60vh] text-coral-400">{error}</div>
      )}

      {/* Loading */}
      {!error && loading && (
        <div className="flex justify-center py-12">
          <div className="w-8 h-8 rounded-full border-2 border-mint-500 border-t-transparent animate-spin" />
        </div>
      )}

      {/* Table */}
      {!loading && filtered.length > 0 && (
        <div className="rounded-xl border border-ink-800 bg-ink-900 overflow-hidden animate-fade-in-up stagger-2">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-ink-800 text-paper-500 font-mono text-xs uppercase tracking-wide">
                  <th className="text-left px-4 py-3">Kullanıcı</th>
                  <th className="text-left px-4 py-3 hidden sm:table-cell">Seviye</th>
                  <th className="text-left px-4 py-3 hidden md:table-cell">Rütbe</th>
                  <th className="text-right px-4 py-3">Puan</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map((u) => (
                  <tr
                    key={u.uid}
                    onClick={() => router.push(`/dashboard/users/${u.uid}`)}
                    className="border-b border-ink-800/50 transition hover:bg-ink-800/50 cursor-pointer"
                  >
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-3">
                        <Avatar
                          avatarUrl={u.avatarUrl}
                          avatarColor={u.avatarColor}
                          displayName={u.displayName}
                          size="sm"
                        />
                        <span className="font-medium text-paper-100 truncate max-w-[200px]">
                          {u.displayName}
                        </span>
                      </div>
                    </td>
                    <td className="px-4 py-3 hidden sm:table-cell">
                      <span className="font-mono text-xs text-mint-400">
                        Seviye {u.level ?? 1}
                      </span>
                    </td>
                    <td className="px-4 py-3 hidden md:table-cell">
                      <RankBadge rank={u.rank} size="sm" />
                    </td>
                    <td className="px-4 py-3 text-right font-mono font-semibold text-paper-100">
                      {u.score ?? 0}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Empty state */}
      {!loading && filtered.length === 0 && (
        <div className="rounded-xl border border-ink-800 bg-ink-900 p-12 text-center text-paper-500">
          <p className="text-lg font-display">
            {search || rankFilter ? "Aramanla eşleşen kullanıcı bulunamadı." : "Henüz kayıtlı kullanıcı yok."}
          </p>
          <p className="text-sm mt-1">
            {search || rankFilter ? "Farklı bir isim dene veya filtreyi temizle." : ""}
          </p>
        </div>
      )}
    </div>
  );
}
