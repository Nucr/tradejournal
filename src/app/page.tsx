"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/lib/auth-context";

export default function Home() {
  const { user, loading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (loading) return;
    router.replace(user ? "/dashboard" : "/login");
  }, [user, loading, router]);

  return (
    <main className="min-h-screen flex items-center justify-center bg-ink-950">
      <div className="flex flex-col items-center gap-3">
        <div className="h-8 w-8 rounded-full border-2 border-mint-500 border-t-transparent animate-spin" />
        <p className="font-mono text-sm text-paper-300">yükleniyor…</p>
      </div>
    </main>
  );
}
