"use client";

import { useEffect, useState } from "react";
import { collection, getDocs, doc, updateDoc, serverTimestamp } from "firebase/firestore";
import { db } from "@/lib/firebase";
import { useAuth } from "@/lib/auth-context";
import { isAdmin } from "@/lib/admin";
import type { UserProfile } from "@/lib/types";

export default function AdminUsersPage() {
  const { user } = useAuth();
  const [authorized, setAuthorized] = useState<boolean | null>(null);
  const [users, setUsers] = useState<(UserProfile & { uid: string })[]>([]);
  const [search, setSearch] = useState("");

  useEffect(() => {
    if (!user) return;
    isAdmin(user.uid).then(setAuthorized);
  }, [user]);

  useEffect(() => {
    if (!authorized) return;
    getDocs(collection(db, "users")).then((snap) => {
      const list = snap.docs.map((d) => ({ uid: d.id, ...d.data() } as UserProfile & { uid: string }));
      setUsers(list);
    });
  }, [authorized]);

  async function toggleAdmin(uid: string, current: string | undefined) {
    const role = current === "admin" ? "user" : "admin";
    await updateDoc(doc(db, "users", uid), { role, updatedAt: serverTimestamp() });
    setUsers((prev) => prev.map((u) => (u.uid === uid ? { ...u, role } : u)));
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

  const filtered = users.filter((u) =>
    u.displayName?.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div>
      <h1 className="font-display text-2xl font-semibold mb-1">Kullanıcılar</h1>
      <p className="text-sm text-paper-500 mb-6">Sistemdeki tüm kullanıcıları görüntüle ve yönet.</p>

      <input
        value={search}
        onChange={(e) => setSearch(e.target.value)}
        placeholder="Kullanıcı adı ile ara…"
        className="w-full max-w-xs rounded-lg border border-ink-700 bg-ink-900 px-4 py-2 text-sm text-paper-100 placeholder-paper-500 mb-6 focus:border-mint-500 focus:outline-none"
      />

      <div className="overflow-x-auto rounded-xl border border-ink-800">
        <table className="w-full text-sm">
          <thead>
            <tr className="bg-ink-900 text-paper-500 text-left">
              <th className="px-4 py-3 font-medium">İsim</th>
              <th className="px-4 py-3 font-medium">Email</th>
              <th className="px-4 py-3 font-medium">Seviye</th>
              <th className="px-4 py-3 font-medium">Rütbe</th>
              <th className="px-4 py-3 font-medium">Rol</th>
              <th className="px-4 py-3 font-medium">İşlem</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-ink-800">
            {filtered.map((u) => (
              <tr key={u.uid} className="hover:bg-ink-900/50">
                <td className="px-4 py-3 text-paper-100">{u.displayName}</td>
                <td className="px-4 py-3 text-paper-500 font-mono text-xs">{u.uid}</td>
                <td className="px-4 py-3 font-mono text-xs text-paper-300">{u.level ?? "—"}</td>
                <td className="px-4 py-3 text-paper-300">{u.rank ?? "—"}</td>
                <td className="px-4 py-3">
                  <span className={`rounded-full px-2 py-0.5 text-xs font-semibold ${
                    u.role === "admin" ? "bg-amber-500/10 text-amber-400" : "bg-ink-700 text-paper-400"
                  }`}>
                    {u.role === "admin" ? "Admin" : "Kullanıcı"}
                  </span>
                </td>
                <td className="px-4 py-3">
                  <button
                    onClick={() => toggleAdmin(u.uid, u.role)}
                    className="rounded border border-ink-700 px-3 py-1 text-xs text-paper-300 hover:bg-ink-800 transition"
                  >
                    {u.role === "admin" ? "Yetkiyi Kaldır" : "Admin Yap"}
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
