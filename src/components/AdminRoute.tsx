"use client";

import { useEffect, useState, ReactNode } from "react";
import { useAuth } from "@/lib/auth-context";
import { isAdmin } from "@/lib/admin";

export default function AdminRoute({ children }: { children: ReactNode }) {
  const { user } = useAuth();
  const [state, setState] = useState<"loading" | "authorized" | "denied">("loading");

  useEffect(() => {
    if (!user) return;
    isAdmin(user.uid).then((ok) => setState(ok ? "authorized" : "denied"));
  }, [user]);

  if (state === "loading") {
    return (
      <div className="flex items-center justify-center min-h-[50vh]">
        <div className="h-8 w-8 rounded-full border-2 border-mint-500 border-t-transparent animate-spin" />
      </div>
    );
  }

  if (state === "denied") {
    return (
      <div className="flex flex-col items-center justify-center min-h-[50vh] text-center px-4">
        <div className="w-16 h-16 rounded-2xl bg-coral-500/10 border border-coral-500/20 flex items-center justify-center mb-6">
          <svg className="w-8 h-8 text-coral-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 15v2m0 0v2m0-2h2m-2 0H10m9.364-7.364A9 9 0 1112 3a9 9 0 017.364 4.636z" />
          </svg>
        </div>
        <h1 className="font-display text-2xl font-semibold text-paper-100 mb-2">Admin Değilsiniz</h1>
        <p className="text-paper-500 max-w-sm">
          Bu sayfaya erişmek için admin yetkisine sahip olmanız gerekiyor. Admin değilseniz bu uyarıyı görüyorsunuzdur.
        </p>
      </div>
    );
  }

  return <>{children}</>;
}
