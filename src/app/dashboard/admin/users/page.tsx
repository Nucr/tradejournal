"use client";

import { useEffect, useState } from "react";
import { collection, getDocs, doc, updateDoc, serverTimestamp } from "firebase/firestore";
import { db } from "@/lib/firebase";
import AdminRoute from "@/components/AdminRoute";
import type { UserProfile, Rank } from "@/lib/types";

const RANKS: Rank[] = [
  "Çaylak", "Acemi", "Gelişen", "Deneyimli", "Uzman",
  "İleri", "Usta", "Elit", "Efsane", "Efsanevi",
];

export default function AdminUsersPage() {
  const [users, setUsers] = useState<(UserProfile & { uid: string })[]>([]);
  const [search, setSearch] = useState("");
  const [editing, setEditing] = useState<string | null>(null);
  const [draft, setDraft] = useState<Partial<UserProfile>>({});

  useEffect(() => {
    getDocs(collection(db, "users")).then((snap) => {
      const list = snap.docs.map((d) => ({ uid: d.id, ...d.data() } as UserProfile & { uid: string }));
      setUsers(list);
    });
  }, []);

  function startEdit(u: UserProfile & { uid: string }) {
    setEditing(u.uid);
    setDraft({ displayName: u.displayName, level: u.level, rank: u.rank, score: u.score });
  }

  function cancelEdit() {
    setEditing(null);
    setDraft({});
  }

  async function saveEdit(uid: string) {
    await updateDoc(doc(db, "users", uid), { ...draft, updatedAt: serverTimestamp() });
    setUsers((prev) => prev.map((u) => (u.uid === uid ? { ...u, ...draft } : u)));
    setEditing(null);
    setDraft({});
  }

  async function toggleAdmin(uid: string, current: string | undefined) {
    const role = current === "admin" ? "user" : "admin";
    await updateDoc(doc(db, "users", uid), { role, updatedAt: serverTimestamp() });
    setUsers((prev) => prev.map((u) => (u.uid === uid ? { ...u, role } : u)));
  }

  const filtered = users.filter((u) =>
    u.displayName?.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <AdminRoute>
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
              <th className="px-4 py-3 font-medium">UID</th>
              <th className="px-4 py-3 font-medium">Seviye</th>
              <th className="px-4 py-3 font-medium">Rütbe</th>
              <th className="px-4 py-3 font-medium">Puan</th>
              <th className="px-4 py-3 font-medium">Rol</th>
              <th className="px-4 py-3 font-medium">İşlem</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-ink-800">
            {filtered.map((u) => {
              const isEditing = editing === u.uid;
              return (
                <tr key={u.uid} className="hover:bg-ink-900/50">
                  {isEditing ? (
                    <>
                      <td className="px-4 py-3">
                        <input
                          value={draft.displayName ?? ""}
                          onChange={(e) => setDraft((p) => ({ ...p, displayName: e.target.value }))}
                          className="w-28 rounded border border-ink-700 bg-ink-950 px-2 py-1 text-xs text-paper-100"
                        />
                      </td>
                      <td className="px-4 py-3 text-paper-500 font-mono text-xs">{u.uid.slice(0, 12)}…</td>
                      <td className="px-4 py-3">
                        <input
                          type="number"
                          min={1}
                          max={10}
                          value={draft.level ?? 1}
                          onChange={(e) => setDraft((p) => ({ ...p, level: Number(e.target.value) }))}
                          className="w-14 rounded border border-ink-700 bg-ink-950 px-2 py-1 text-xs text-paper-100"
                        />
                      </td>
                      <td className="px-4 py-3">
                        <select
                          value={draft.rank ?? "Çaylak"}
                          onChange={(e) => setDraft((p) => ({ ...p, rank: e.target.value as Rank }))}
                          className="rounded border border-ink-700 bg-ink-950 px-2 py-1 text-xs text-paper-100"
                        >
                          {RANKS.map((r) => (
                            <option key={r} value={r}>{r}</option>
                          ))}
                        </select>
                      </td>
                      <td className="px-4 py-3">
                        <input
                          type="number"
                          min={0}
                          max={100}
                          value={draft.score ?? 0}
                          onChange={(e) => setDraft((p) => ({ ...p, score: Number(e.target.value) }))}
                          className="w-16 rounded border border-ink-700 bg-ink-950 px-2 py-1 text-xs text-paper-100"
                        />
                      </td>
                      <td className="px-4 py-3">
                        <span className={`rounded-full px-2 py-0.5 text-xs font-semibold ${
                          u.role === "admin" ? "bg-amber-500/10 text-amber-400" : "bg-ink-700 text-paper-400"
                        }`}>
                          {u.role === "admin" ? "Admin" : "Kullanıcı"}
                        </span>
                      </td>
                      <td className="px-4 py-3 flex gap-1">
                        <button
                          onClick={() => saveEdit(u.uid)}
                          className="rounded bg-mint-500 px-2.5 py-1 text-xs font-semibold text-ink-950 hover:bg-mint-400 transition"
                        >
                          Kaydet
                        </button>
                        <button
                          onClick={cancelEdit}
                          className="rounded border border-ink-700 px-2.5 py-1 text-xs text-paper-300 hover:bg-ink-800 transition"
                        >
                          İptal
                        </button>
                      </td>
                    </>
                  ) : (
                    <>
                      <td className="px-4 py-3 text-paper-100">{u.displayName}</td>
                      <td className="px-4 py-3 text-paper-500 font-mono text-xs">{u.uid.slice(0, 12)}…</td>
                      <td className="px-4 py-3 font-mono text-xs text-paper-300">{u.level ?? "—"}</td>
                      <td className="px-4 py-3 text-paper-300">{u.rank ?? "—"}</td>
                      <td className="px-4 py-3 font-mono text-xs text-paper-400">{u.score ?? 0}</td>
                      <td className="px-4 py-3">
                        <span className={`rounded-full px-2 py-0.5 text-xs font-semibold ${
                          u.role === "admin" ? "bg-amber-500/10 text-amber-400" : "bg-ink-700 text-paper-400"
                        }`}>
                          {u.role === "admin" ? "Admin" : "Kullanıcı"}
                        </span>
                      </td>
                      <td className="px-4 py-3 flex gap-1">
                        <button
                          onClick={() => startEdit(u)}
                          className="rounded border border-ink-700 px-2.5 py-1 text-xs text-paper-300 hover:bg-ink-800 transition"
                        >
                          Düzenle
                        </button>
                        <button
                          onClick={() => toggleAdmin(u.uid, u.role)}
                          className="rounded border border-ink-700 px-2.5 py-1 text-xs text-paper-300 hover:bg-ink-800 transition"
                        >
                          {u.role === "admin" ? "Yetkiyi Kaldır" : "Admin Yap"}
                        </button>
                      </td>
                    </>
                  )}
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </AdminRoute>
  );
}
