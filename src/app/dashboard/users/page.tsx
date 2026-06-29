"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { collection, getDocs, limit, orderBy, query, where } from "firebase/firestore";
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
        .map((d) => ({ uid: d.id, ...d.data() } as UserProfile & { uid: string }))
        ;
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

      <div className="max-w-md">
        <div className="relative">
          <svg
            className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-paper-400"
            fill="none" viewBox="0 0 24 24" stroke="currentColor"
          >
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
              d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
            />
          </svg>
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Kullanıcı adı ile ara..."
            className="w-full rounded-lg border border-ink-700 bg-ink-950 pl-10 pr-4 py-2.5 text-sm focus:border-mint-500 focus:outline-none transition text-paper-100 placeholder-paper-500"
          />
        </div>
      </div>

      {loading ? (
        <div className="flex justify-center py-16">
          <div className="w-8 h-8 border-2 border-mint-500 border-t-transparent rounded-full animate-spin" />
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {filtered.map((user) => (
            <Link
              key={user.uid}
              href={`/dashboard/users/${user.uid}`}
              className="rounded-xl border border-ink-800 bg-ink-900/50 p-4 hover:border-mint-500/40 hover:bg-ink-800/50 transition flex items-center gap-3"
            >
              <Avatar
                avatarUrl={user.avatarUrl}
                avatarColor={user.avatarColor}
                displayName={user.displayName}
                size="md"
              />
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-paper-100 truncate">
                  {user.displayName}
                </p>
                <div className="flex items-center gap-2 mt-0.5">
                  <span className="text-xs font-mono text-mint-400">
                    Seviye {user.level}
                  </span>
                  <RankBadge rank={user.rank} />
                </div>
              </div>
              <span className="text-xs font-mono text-paper-500 shrink-0">
                {user.score} Puan
              </span>
            </Link>
          ))}
        </div>
      )}

      {!loading && filtered.length === 0 && (
        <div className="rounded-xl border border-ink-800 bg-ink-900 p-8 text-center">
          <svg className="w-12 h-12 mx-auto text-paper-500 mb-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5}
              d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
            />
          </svg>
          <p className="text-paper-400 text-sm">
            {search ? "Aramanla eşleşen kullanıcı bulunamadı." : "Henüz kayıtlı kullanıcı yok."}
          </p>
        </div>
      )}
    </div>
  );
}
