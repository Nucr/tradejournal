"use client";

import { useEffect, useState } from "react";
import { collection, collectionGroup, getDocs, query } from "firebase/firestore";
import { db } from "@/lib/firebase";
import { useAuth } from "@/lib/auth-context";
import { isAdmin } from "@/lib/admin";
import Link from "next/link";

export default function AdminPage() {
  const { user } = useAuth();
  const [authorized, setAuthorized] = useState(false);
  const [checking, setChecking] = useState(true);
  const [totalUsers, setTotalUsers] = useState(0);
  const [totalTrades, setTotalTrades] = useState(0);
  const [totalStrategies, setTotalStrategies] = useState(0);

  useEffect(() => {
    if (!user) return;
    isAdmin(user.uid).then((ok) => {
      setAuthorized(ok);
      setChecking(false);
    });
  }, [user]);

  useEffect(() => {
    if (!authorized || !user) return;
    Promise.all([
      getDocs(collection(db, "users")).then((s) => s.size),
      getDocs(query(collection(db, "strategies"))).then((s) => s.size),
      getDocs(collectionGroup(db, "trades")).then((s) => s.size),
    ]).then(([u, s, t]) => {
      setTotalUsers(u);
      setTotalStrategies(s);
      setTotalTrades(t);
    });
  }, [authorized, user]);

  if (checking) {
    return (
      <div className="flex items-center justify-center min-h-[50vh]">
        <div className="h-8 w-8 rounded-full border-2 border-mint-500 border-t-transparent animate-spin" />
      </div>
    );
  }

  if (!authorized) {
    return (
      <div className="text-center py-20">
        <h1 className="font-display text-2xl font-semibold text-coral-400 mb-2">Yetkisiz Erişim</h1>
        <p className="text-paper-500">Bu sayfaya erişim yetkiniz bulunmuyor.</p>
      </div>
    );
  }

  const cards = [
    { label: "Kullanıcılar", value: totalUsers, href: "/dashboard/admin/users", color: "bg-blue-500/10 text-blue-400 border-blue-500/20" },
    { label: "İşlemler", value: totalTrades, href: "/dashboard/admin/trades", color: "bg-mint-500/10 text-mint-400 border-mint-500/20" },
    { label: "Stratejiler", value: totalStrategies, href: "/dashboard/admin/strategies", color: "bg-amber-500/10 text-amber-400 border-amber-500/20" },
    { label: "Liderlik", value: "—", href: "/dashboard/admin/leaderboard", color: "bg-purple-500/10 text-purple-400 border-purple-500/20" },
  ];

  return (
    <div>
      <h1 className="font-display text-2xl font-semibold mb-1">Admin Paneli</h1>
      <p className="text-sm text-paper-500 mb-8">Sistem genel istatistikler ve yönetim.</p>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        {cards.map((c) => (
          <Link key={c.href} href={c.href} className={`rounded-xl border p-5 ${c.color} hover:scale-[1.02] transition`}>
            <p className="text-3xl font-bold font-mono">{c.value}</p>
            <p className="text-sm mt-1 opacity-80">{c.label}</p>
          </Link>
        ))}
      </div>
    </div>
  );
}
