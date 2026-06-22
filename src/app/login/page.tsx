"use client";

import { FormEvent, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useAuth } from "@/lib/auth-context";
import AuthBrandPanel from "@/components/AuthBrandPanel";

export default function LoginPage() {
  const { login } = useAuth();
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setError("");
    setSubmitting(true);
    try {
      await login(email, password);
      router.replace("/dashboard");
    } catch (err: any) {
      setError(mapAuthError(err?.code));
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <main className="min-h-screen flex bg-ink-950">
      <AuthBrandPanel />
      <div className="flex w-full lg:w-1/2 items-center justify-center px-6 py-12">
        <div className="w-full max-w-sm">
          <h1 className="font-display text-2xl font-semibold mb-1">
            Tekrar hoş geldin
          </h1>
          <p className="text-sm text-paper-300 mb-8">
            Defterine giriş yap, kayıtların seni bekliyor.
          </p>

          <form onSubmit={handleSubmit} className="space-y-4">
            <Field label="E-posta">
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="ornek@mail.com"
                className="w-full rounded-lg border border-ink-700 bg-ink-900 px-3 py-2.5 text-sm placeholder:text-paper-500 focus:border-mint-500"
              />
            </Field>
            <Field label="Şifre">
              <input
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full rounded-lg border border-ink-700 bg-ink-900 px-3 py-2.5 text-sm placeholder:text-paper-500 focus:border-mint-500"
              />
            </Field>

            {error && (
              <p className="text-sm text-coral-400 font-mono">{error}</p>
            )}

            <button
              type="submit"
              disabled={submitting}
              className="w-full rounded-lg bg-mint-500 px-3 py-2.5 text-sm font-semibold text-ink-950 hover:bg-mint-400 transition disabled:opacity-60"
            >
              {submitting ? "giriş yapılıyor…" : "Giriş yap"}
            </button>
          </form>

          <p className="mt-6 text-sm text-paper-300">
            Hesabın yok mu?{" "}
            <Link href="/register" className="text-mint-400 hover:underline">
              Kayıt ol
            </Link>
          </p>
        </div>
      </div>
    </main>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <label className="block">
      <span className="block text-xs font-mono uppercase tracking-wide text-paper-500 mb-1.5">
        {label}
      </span>
      {children}
    </label>
  );
}

function mapAuthError(code?: string) {
  switch (code) {
    case "auth/invalid-credential":
    case "auth/wrong-password":
    case "auth/user-not-found":
      return "E-posta veya şifre hatalı.";
    case "auth/too-many-requests":
      return "Çok fazla deneme yapıldı, biraz sonra tekrar dene.";
    default:
      return "Giriş yapılamadı, bilgilerini kontrol et.";
  }
}
