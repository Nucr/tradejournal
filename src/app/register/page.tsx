"use client";

import { FormEvent, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useAuth } from "@/lib/auth-context";
import AuthBrandPanel from "@/components/AuthBrandPanel";

export default function RegisterPage() {
  const { register } = useAuth();
  const router = useRouter();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setError("");
    if (password.length < 6) {
      setError("Şifre en az 6 karakter olmalı.");
      return;
    }
    setSubmitting(true);
    try {
      await register(name, email, password);
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
            Defterini aç
          </h1>
          <p className="text-sm text-paper-300 mb-8">
            30 saniyede hesabını oluştur, ilk işlemini kaydet.
          </p>

          <form onSubmit={handleSubmit} className="space-y-4">
            <Field label="Ad">
              <input
                type="text"
                required
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Adın"
                className="w-full rounded-lg border border-ink-700 bg-ink-900 px-3 py-2.5 text-sm placeholder:text-paper-500 focus:border-mint-500"
              />
            </Field>
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
                placeholder="en az 6 karakter"
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
              {submitting ? "hesap oluşturuluyor…" : "Kayıt ol"}
            </button>
          </form>

          <p className="mt-6 text-sm text-paper-300">
            Zaten hesabın var mı?{" "}
            <Link href="/login" className="text-mint-400 hover:underline">
              Giriş yap
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
    case "auth/email-already-in-use":
      return "Bu e-posta zaten kayıtlı.";
    case "auth/invalid-email":
      return "Geçersiz e-posta adresi.";
    case "auth/weak-password":
      return "Şifre çok zayıf.";
    default:
      return "Kayıt oluşturulamadı, tekrar dene.";
  }
}
