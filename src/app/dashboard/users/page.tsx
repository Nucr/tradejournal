"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { collection, getDocs, limit, orderBy, query } from "firebase/firestore";
import { db } from "@/lib/firebase";
import type { UserProfile } from "@/lib/types";
import Avatar from "@/components/Avatar";
import RankBadge from "@/components/RankBadge";

export default function UsersPage() {
  const router = useRouter();
  const [users, setUsers] = useState<(UserProfile & { uid: string })[]>([]);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const q = query(
      collection(db, "publicProfiles"),
      orderBy("displayName_lower"),
      limit(100),
    );
    getDocs(q).then((snap) => {
      const list = snap.docs
        .map((d) => ({ uid: d.id, ...d.data() } as UserProfile & { uid: string }));
      setUsers(list);
      setLoading(false);
    }).catch(() => setLoading(false));
  }, []);

  const filtered = search.trim()
    ? users.filter((u) =>
        u.displayName?.toLowerCase().includes(search.toLowerCase())
      )
    : users;

  return (
    <div className="space-y-6 animate-fade-in-up">
      <div>
        <h1 className="font-display text-2xl font-semibold">Kullanıcılar</h1>
        <p className="text-sm text-paper-300 mt-1">
          Diğer traderların profillerini görüntüle ve onlarla bağlantı kur.
        </p>
      </div>

      {/* Search */}
      <div className="relative w-full sm:w-72">
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

      {/* Loading */}
      {loading && (
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
            {search ? "Aramanla eşleşen kullanıcı bulunamadı." : "Henüz kayıtlı kullanıcı yok."}
          </p>
          <p className="text-sm mt-1">
            {search ? "Farklı bir isim dene." : ""}
          </p>
        </div>
      )}
    </div>
  );
}
