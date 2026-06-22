"use client";

import { useEffect, useState } from "react";
import {
  collection,
  getDocs,
  query,
  orderBy,
  doc,
  updateDoc,
  deleteDoc,
  serverTimestamp,
} from "firebase/firestore";
import { db } from "@/lib/firebase";
import { useAuth } from "@/lib/auth-context";
import { isAdmin } from "@/lib/admin";
import type { Strategy } from "@/lib/types";

export default function AdminStrategiesPage() {
  const { user } = useAuth();
  const [authorized, setAuthorized] = useState<boolean | null>(null);
  const [strategies, setStrategies] = useState<Strategy[]>([]);

  useEffect(() => {
    if (!user) return;
    isAdmin(user.uid).then(setAuthorized);
  }, [user]);

  useEffect(() => {
    if (!authorized) return;
    const q = query(collection(db, "strategies"), orderBy("createdAt", "desc"));
    getDocs(q).then((snap) => {
      const list = snap.docs.map((d) => ({
        id: d.id,
        ...d.data(),
        createdAt: d.data().createdAt?.toDate?.() ?? new Date(),
      })) as Strategy[];
      setStrategies(list);
    });
  }, [authorized]);

  async function toggleVisibility(id: string, current: boolean) {
    await updateDoc(doc(db, "strategies", id), { isPublic: !current });
    setStrategies((prev) => prev.map((s) => (s.id === id ? { ...s, isPublic: !current } : s)));
  }

  async function handleDelete(id: string) {
    await deleteDoc(doc(db, "strategies", id));
    setStrategies((prev) => prev.filter((s) => s.id !== id));
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
      <h1 className="font-display text-2xl font-semibold mb-1">Stratejiler</h1>
      <p className="text-sm text-paper-500 mb-6">Tüm stratejileri yönet.</p>

      <div className="overflow-x-auto rounded-xl border border-ink-800">
        <table className="w-full text-sm">
          <thead>
            <tr className="bg-ink-900 text-paper-500 text-left">
              <th className="px-4 py-3 font-medium">İsim</th>
              <th className="px-4 py-3 font-medium">Oluşturan</th>
              <th className="px-4 py-3 font-medium">Tarih</th>
              <th className="px-4 py-3 font-medium">Görünürlük</th>
              <th className="px-4 py-3 font-medium">İşlem</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-ink-800">
            {strategies.map((s) => (
              <tr key={s.id} className="hover:bg-ink-900/50">
                <td className="px-4 py-3 text-paper-100">{s.name}</td>
                <td className="px-4 py-3 font-mono text-xs text-paper-500">{s.createdBy?.slice(0, 8)}…</td>
                <td className="px-4 py-3 text-xs text-paper-500">{s.createdAt?.toLocaleDateString()}</td>
                <td className="px-4 py-3">
                  <button
                    onClick={() => toggleVisibility(s.id, s.isPublic)}
                    className={`rounded-full px-2.5 py-0.5 text-xs font-semibold ${
                      s.isPublic
                        ? "bg-mint-500/10 text-mint-400"
                        : "bg-ink-700 text-paper-400"
                    }`}
                  >
                    {s.isPublic ? "Açık" : "Gizli"}
                  </button>
                </td>
                <td className="px-4 py-3">
                  <button
                    onClick={() => handleDelete(s.id)}
                    className="rounded border border-coral-500/30 px-2.5 py-1 text-xs text-coral-400 hover:bg-coral-500/10 transition"
                  >
                    Sil
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
