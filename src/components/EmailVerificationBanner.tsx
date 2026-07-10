"use client";

import { useState } from "react";
import { useAuth } from "@/lib/auth-context";

export default function EmailVerificationBanner() {
  const { user, sendVerificationEmail } = useAuth();
  const [sending, setSending] = useState(false);
  const [sent, setSent] = useState(false);

  if (!user || user.emailVerified) return null;

  async function handleSend() {
    setSending(true);
    try {
      await sendVerificationEmail();
      setSent(true);
    } catch {
      // silent
    } finally {
      setSending(false);
    }
  }

  return (
    <div className="rounded-xl border border-amber-500/30 bg-amber-500/10 px-4 py-3 flex items-center gap-3">
      <span className="text-amber-400 text-lg">⚠</span>
      <p className="text-sm text-amber-300 flex-1">
        E-posta adresin doğrulanmamış. Hesabını korumak için lütfen doğrula.
      </p>
      <button
        onClick={handleSend}
        disabled={sending || sent}
        className="text-sm font-semibold text-amber-200 hover:text-amber-100 transition disabled:opacity-50 whitespace-nowrap"
      >
        {sent ? "Gönderildi" : sending ? "gönderiliyor…" : "Doğrulama E-postası Gönder"}
      </button>
    </div>
  );
}
