"use client";

import { FormEvent, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useAuth } from "@/lib/auth-context";
import AuthBrandPanel from "@/components/AuthBrandPanel";

export default function LoginPage() {
  const { login, signInWithGoogle } = useAuth();
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [googleSubmitting, setGoogleSubmitting] = useState(false);

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

          <div className="relative my-6">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-ink-700" />
            </div>
            <div className="relative flex justify-center text-xs uppercase">
              <span className="bg-ink-950 px-2 text-paper-500">veya</span>
            </div>
          </div>

          <button
            type="button"
            onClick={async () => {
              setError("");
              setGoogleSubmitting(true);
              try {
                await signInWithGoogle();
              } catch (err: any) {
                if (err?.code === "auth/popup-closed-by-user") return;
                setError("Google ile giriş yapılamadı.");
              } finally {
                setGoogleSubmitting(false);
              }
            }}
            disabled={googleSubmitting}
            className="w-full flex items-center justify-center gap-3 rounded-lg border border-ink-700 bg-ink-900 px-3 py-2.5 text-sm font-medium text-paper-100 hover:bg-ink-800 transition disabled:opacity-60"
          >
            <GoogleIcon />
            Google ile devam et
          </button>

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

function GoogleIcon() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24">
      <path
        fill="#4285F4"
        d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 0 1-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z"
      />
      <path
        fill="#34A853"
        d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
      />
      <path
        fill="#FBBC05"
        d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
      />
      <path
        fill="#EA4335"
        d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
      />
    </svg>
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
