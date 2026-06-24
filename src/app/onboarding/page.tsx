"use client";

import { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/lib/auth-context";
import {
  collection,
  doc,
  getDocs,
  query,
  setDoc,
  serverTimestamp,
  where,
} from "firebase/firestore";
import { db } from "@/lib/firebase";
import RankBadge from "@/components/RankBadge";
import { savePublicProfile } from "@/lib/profile";

const AVATAR_COLORS = [
  "#2ED9A4",
  "#FF5D5D",
  "#F2B84B",
  "#60A5FA",
  "#A78BFA",
  "#F472B6",
  "#34D399",
  "#FB923C",
];

const NAME_REGEX = /^[a-zA-Z0-9_]+$/;

function StepDot({
  idx,
  step,
  label,
}: {
  idx: number;
  step: number;
  label: string;
}) {
  return (
    <div className="flex items-center gap-2">
      <div
        className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold transition-all ${
          idx === step
            ? "bg-mint-500 text-ink-950"
            : idx < step
              ? "bg-mint-500/20 text-mint-400"
              : "bg-ink-800 text-paper-500"
        }`}
      >
        {idx < step ? "✓" : idx + 1}
      </div>
      <span
        className={`text-sm hidden sm:inline ${
          idx === step ? "text-paper-100 font-medium" : "text-paper-500"
        }`}
      >
        {label}
      </span>
    </div>
  );
}

export default function OnboardingPage() {
  const { user, refreshOnboarding } = useAuth();
  const router = useRouter();
  const [step, setStep] = useState(0);
  const [displayName, setDisplayName] = useState("");
  const [nameError, setNameError] = useState("");
  const [nameChecking, setNameChecking] = useState(false);
  const [avatarColor, setAvatarColor] = useState(AVATAR_COLORS[0]);
  const [isPublic, setIsPublic] = useState(true);
  const [showStrategy, setShowStrategy] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const debounceRef = useRef<ReturnType<typeof setTimeout>>(undefined);

  async function checkNameUnique(val: string): Promise<boolean> {
    if (val.length < 3) return true;
    setNameChecking(true);
    try {
      const q = query(collection(db, "publicProfiles"), where("displayName", "==", val));
      const snap = await getDocs(q);
      return snap.empty;
    } finally {
      setNameChecking(false);
    }
  }

  function validateName(val: string): string {
    const trimmed = val.trim();
    if (!trimmed) return "";
    if (trimmed.length < 3) return "En az 3 karakter";
    if (trimmed.length > 20) return "En fazla 20 karakter";
    if (!NAME_REGEX.test(trimmed)) return "Sadece harf, rakam ve alt çizgi";
    return "";
  }

  useEffect(() => {
    if (debounceRef.current) clearTimeout(debounceRef.current);
    const error = validateName(displayName);
    if (error) {
      setNameError(error);
      return;
    }
    if (displayName.trim().length < 3) {
      setNameError("");
      return;
    }
    debounceRef.current = setTimeout(async () => {
      const available = await checkNameUnique(displayName.trim());
      setNameError(available ? "" : "Bu kullanıcı adı alınmış");
    }, 500);
    return () => {
      if (debounceRef.current) clearTimeout(debounceRef.current);
    };
  }, [displayName]);

  function canAdvanceStep1(): boolean {
    const trimmed = displayName.trim();
    if (trimmed.length < 3 || trimmed.length > 20) return false;
    if (!NAME_REGEX.test(trimmed)) return false;
    if (nameChecking) return false;
    if (nameError) return false;
    return true;
  }

  async function handleStep1Next() {
    if (!canAdvanceStep1()) return;
    const available = await checkNameUnique(displayName.trim());
    if (!available) {
      setNameError("Bu kullanıcı adı alınmış");
      return;
    }
    setNameError("");
    setStep(1);
  }

  async function handleSubmit() {
    if (!user || submitting) return;
    setSubmitting(true);
    try {
      await setDoc(doc(db, "users", user.uid), {
        displayName: displayName.trim(),
        avatarColor,
        isPublic,
        showStrategy,
        showLeaderboard: true,
        showLevel: true,
        showTrades: true,
        showAchievements: true,
        showStats: true,
        level: 1,
        rank: "Çaylak",
        score: 0,
        role: "user",
        stats: {
          totalTrades: 0,
          winRate: 0,
          avgRR: 0,
          netResult: 0,
          consistency: 0,
        },
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
      });
      await savePublicProfile(user.uid, {
        displayName: displayName.trim(),
        avatarColor,
        isPublic,
        showStrategy,
        showLeaderboard: true,
        showLevel: true,
        showTrades: true,
        showAchievements: true,
        showStats: true,
        level: 1,
        rank: "Çaylak",
        score: 0,
        stats: { totalTrades: 0, winRate: 0, avgRR: 0, netResult: 0, consistency: 0 },
      });
      await refreshOnboarding();
      setStep(2);
    } catch (err) {
      console.error("onboarding save error:", err);
    } finally {
      setSubmitting(false);
    }
  }

  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-ink-950">
        <div className="h-8 w-8 rounded-full border-2 border-mint-500 border-t-transparent animate-spin" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-ink-950 flex items-center justify-center p-4">
      <div className="w-full max-w-lg">
        {step < 2 && (
          <div className="flex items-center justify-center gap-4 sm:gap-8 mb-12">
            <StepDot idx={0} step={step} label="Profil" />
            <div className="h-px w-12 sm:w-20 bg-ink-700" />
            <StepDot idx={1} step={step} label="Gizlilik" />
            <div className="h-px w-12 sm:w-20 bg-ink-700" />
            <StepDot idx={2} step={step} label="Hazır" />
          </div>
        )}

        {step === 0 && (
          <div className="animate-fade-in-up">
            <h1 className="font-display text-2xl font-semibold text-paper-100 mb-1">
              Profilini oluştur
            </h1>
            <p className="text-sm text-paper-500 mb-8">
              Kullanıcı adın ve avatar renginle diğer traderlar seni tanıyacak.
            </p>

            <label className="text-sm font-medium text-paper-300 mb-1.5 block">
              Kullanıcı adı
            </label>
            <input
              value={displayName}
              onChange={(e) => setDisplayName(e.target.value)}
              placeholder="Örn: KriptoKral"
              maxLength={20}
              className={`w-full rounded-lg border px-4 py-3 bg-ink-900 text-paper-100 text-sm focus:outline-none focus:ring-1 transition ${
                nameError
                  ? "border-coral-500/50 focus:border-coral-500 focus:ring-coral-500/20"
                  : displayName.trim().length >= 3 && !nameChecking && !nameError
                    ? "border-mint-500/50 focus:border-mint-500 focus:ring-mint-500/20"
                    : "border-ink-700 focus:border-mint-500 focus:ring-mint-500/20"
              }`}
            />
            {nameChecking && (
              <p className="text-xs text-paper-500 mt-1.5">Kontrol ediliyor...</p>
            )}
            {nameError && !nameChecking && (
              <p className="text-xs text-coral-400 mt-1.5">{nameError}</p>
            )}
            {!nameError && !nameChecking && displayName.trim().length >= 3 && (
              <p className="text-xs text-mint-400 mt-1.5">Kullanılabilir ✓</p>
            )}

            <label className="text-sm font-medium text-paper-300 mb-3 mt-6 block">
              Avatar rengi
            </label>
            <div className="flex gap-3 flex-wrap">
              {AVATAR_COLORS.map((c) => (
                <button
                  key={c}
                  onClick={() => setAvatarColor(c)}
                  className={`w-10 h-10 rounded-full transition-all shrink-0 flex items-center justify-center ${
                    avatarColor === c ? "ring-2 ring-white scale-110" : "hover:scale-105"
                  }`}
                  style={{ backgroundColor: c }}
                  aria-label={c}
                >
                  {avatarColor === c && (
                    <svg className="w-5 h-5 text-white" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={3}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                    </svg>
                  )}
                </button>
              ))}
            </div>

            <button
              onClick={handleStep1Next}
              disabled={!canAdvanceStep1()}
              className="mt-8 w-full rounded-lg bg-mint-500 text-ink-950 font-semibold py-3 text-sm hover:bg-mint-400 transition disabled:opacity-40"
            >
              Devam Et
            </button>
          </div>
        )}

        {step === 1 && (
          <div className="animate-fade-in-up">
            <h1 className="font-display text-2xl font-semibold text-paper-100 mb-1">
              Gizlilik ayarları
            </h1>
            <p className="text-sm text-paper-500 mb-8">
              Profilinin ve stratejilerinin görünürlüğünü sen belirle.
            </p>

            <div className="rounded-xl border border-ink-800 bg-ink-900/50 p-5 mb-4">
              <label className="flex items-center justify-between cursor-pointer">
                <div>
                  <p className="text-sm font-medium text-paper-100">
                    Profilim herkese açık olsun
                  </p>
                  <p className="text-xs text-paper-500 mt-0.5">
                    Liderlik tablosunda görünürsün
                  </p>
                </div>
                <div
                  role="checkbox"
                  aria-checked={isPublic}
                  tabIndex={0}
                  onClick={() => setIsPublic((v) => !v)}
                  onKeyDown={(e) => { if (e.key === "Enter" || e.key === " ") setIsPublic((v) => !v); }}
                  className={`relative w-11 h-6 rounded-full transition cursor-pointer shrink-0 ml-4 ${
                    isPublic ? "bg-mint-500" : "bg-ink-700"
                  }`}
                >
                  <div
                    className={`absolute top-0.5 left-0.5 w-5 h-5 rounded-full bg-white transition ${
                      isPublic ? "translate-x-5" : ""
                    }`}
                  />
                </div>
              </label>
            </div>

            <div className="rounded-xl border border-ink-800 bg-ink-900/50 p-5 mb-8">
              <label className="flex items-center justify-between cursor-pointer">
                <div>
                  <p className="text-sm font-medium text-paper-100">
                    Kullandığım stratejileri göster
                  </p>
                  <p className="text-xs text-paper-500 mt-0.5">
                    Profil sayfanda strateji bilgin paylaşılır
                  </p>
                </div>
                <div
                  role="checkbox"
                  aria-checked={showStrategy}
                  tabIndex={0}
                  onClick={() => setShowStrategy((v) => !v)}
                  onKeyDown={(e) => { if (e.key === "Enter" || e.key === " ") setShowStrategy((v) => !v); }}
                  className={`relative w-11 h-6 rounded-full transition cursor-pointer shrink-0 ml-4 ${
                    showStrategy ? "bg-mint-500" : "bg-ink-700"
                  }`}
                >
                  <div
                    className={`absolute top-0.5 left-0.5 w-5 h-5 rounded-full bg-white transition ${
                      showStrategy ? "translate-x-5" : ""
                    }`}
                  />
                </div>
              </label>
            </div>

            <div className="flex gap-3">
              <button
                onClick={() => setStep(0)}
                className="flex-1 rounded-lg border border-ink-700 text-paper-300 font-medium py-3 text-sm hover:bg-ink-800 transition"
              >
                Geri
              </button>
              <button
                onClick={handleSubmit}
                disabled={submitting}
                className="flex-1 rounded-lg bg-mint-500 text-ink-950 font-semibold py-3 text-sm hover:bg-mint-400 transition disabled:opacity-40"
              >
                {submitting ? "Kaydediliyor..." : "Kaydet ve Devam Et"}
              </button>
            </div>
          </div>
        )}

        {step === 2 && (
          <div className="animate-fade-in-up text-center">
            <div className="relative w-60 h-60 mx-auto mb-8">
              <svg viewBox="0 0 240 240" className="w-full h-full">
                <polygon
                  points="120,12 228,66 228,174 120,228 12,174 12,66"
                  fill="#FF5D5D"
                  fillOpacity="0.15"
                  stroke="#FF5D5D"
                  strokeWidth="4"
                />
                <text
                  x="120" y="130"
                  textAnchor="middle"
                  fill="#FF5D5D"
                  fontSize="42"
                  fontWeight="bold"
                  fontFamily="var(--font-display)"
                >
                  0
                </text>
                <text
                  x="120" y="155"
                  textAnchor="middle"
                  fill="rgba(255,93,93,0.5)"
                  fontSize="14"
                  fontFamily="var(--font-mono)"
                >
                  PUAN
                </text>
              </svg>
            </div>

            <h2 className="font-display text-2xl font-semibold text-paper-100 mb-1">
              Hesabın hazır, kral! 🎯
            </h2>
            <p className="text-sm text-paper-500 mb-6">
              Artık işlemlerini kaydetmeye ve performansını takip etmeye başlayabilirsin.
            </p>

            <div className="flex justify-center mb-8">
              <RankBadge rank="Çaylak" size="md" />
            </div>

            <button
              onClick={() => router.replace("/dashboard")}
              className="w-full rounded-lg bg-mint-500 text-ink-950 font-semibold py-3 text-sm hover:bg-mint-400 transition inline-flex items-center justify-center gap-2"
            >
              Hadi Başlayalım
              <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M5 12h14M12 5l7 7-7 7" />
              </svg>
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
