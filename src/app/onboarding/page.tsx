"use client";

import { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/lib/auth-context";
import { setUser } from "@/lib/users";
import { collection, query, where, getDocs } from "firebase/firestore";
import { db } from "@/lib/firebase";
import type { Rank } from "@/lib/types";

const AVATAR_COLORS = [
  "#2ED9A4",
  "#F59E0B",
  "#EF4444",
  "#3B82F6",
  "#8B5CF6",
  "#EC4899",
  "#14B8A6",
  "#F97316",
];

function AvatarCircle({
  color,
  selected,
  onClick,
}: {
  color: string;
  selected: boolean;
  onClick: () => void;
}) {
  return (
    <button
      onClick={onClick}
      className={`w-10 h-10 rounded-full transition-all border-2 shrink-0 ${
        selected ? "border-white scale-110" : "border-transparent hover:scale-105"
      }`}
      style={{ backgroundColor: color }}
      aria-label={color}
    />
  );
}

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
  const [animScore, setAnimScore] = useState(0);
  const animFrame = useRef<number>(undefined);

  async function checkName(val: string): Promise<boolean> {
    if (val.length < 3) return false;
    setNameChecking(true);
    try {
      const q = query(collection(db, "users"), where("displayName", "==", val));
      const snap = await getDocs(q);
      return snap.empty;
    } finally {
      setNameChecking(false);
    }
  }

  async function handleNameBlur() {
    const v = displayName.trim();
    if (!v) { setNameError(""); return; }
    if (v.length < 3) { setNameError("En az 3 karakter"); return; }
    const available = await checkName(v);
    setNameError(available ? "" : "Bu kullanıcı adı alınmış");
  }

  function handleStep1Next() {
    const v = displayName.trim();
    if (v.length < 3) { setNameError("En az 3 karakter"); return; }
    checkName(v).then((ok) => {
      if (ok) { setNameError(""); setStep(1); }
      else { setNameError("Bu kullanıcı adı alınmış"); }
    });
  }

  async function handleSubmit() {
    if (!user || submitting) return;
    setSubmitting(true);
    await setUser(user.uid, {
      displayName: displayName.trim(),
      avatarColor,
      level: 1,
      rank: "Çaylak" as Rank,
      score: 0,
      isPublic,
      showStrategy,
      stats: {
        totalTrades: 0,
        winRate: 0,
        avgRR: 0,
        netResult: 0,
        consistency: 0,
      },
      updatedAt: new Date(),
    });
    await refreshOnboarding();
    setStep(3);
    setSubmitting(false);
  }

  useEffect(() => {
    if (step !== 3) return;
    let start: number | null = null;
    const duration = 1500;
    function tick(now: number) {
      if (!start) start = now;
      const t = Math.min((now - start) / duration, 1);
      setAnimScore(Math.round(t * 100));
      if (t < 1) { animFrame.current = requestAnimationFrame(tick); }
    }
    animFrame.current = requestAnimationFrame(tick);
    return () => {
      if (animFrame.current) cancelAnimationFrame(animFrame.current);
    };
  }, [step]);

  const hexPoints = "120,12 228,66 228,174 120,228 12,174 12,66";
  const fillHeight = (animScore / 100) * 216;

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
        {step < 3 && (
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
              onChange={(e) => { setDisplayName(e.target.value); setNameError(""); }}
              onBlur={handleNameBlur}
              placeholder="Örn: KriptoKral"
              className={`w-full rounded-lg border px-4 py-3 bg-ink-900 text-paper-100 text-sm focus:outline-none focus:ring-1 transition ${
                nameError
                  ? "border-coral-500/50 focus:border-coral-500 focus:ring-coral-500/20"
                  : "border-ink-700 focus:border-mint-500 focus:ring-mint-500/20"
              }`}
              maxLength={24}
            />
            {nameChecking && (
              <p className="text-xs text-paper-500 mt-1.5">Kontrol ediliyor...</p>
            )}
            {nameError && !nameChecking && (
              <p className="text-xs text-coral-400 mt-1.5">{nameError}</p>
            )}

            <label className="text-sm font-medium text-paper-300 mb-3 mt-6 block">
              Avatar rengi
            </label>
            <div className="flex gap-3 flex-wrap">
              {AVATAR_COLORS.map((c) => (
                <AvatarCircle key={c} color={c} selected={avatarColor === c} onClick={() => setAvatarColor(c)} />
              ))}
            </div>

            <button
              onClick={handleStep1Next}
              disabled={nameChecking || !displayName.trim()}
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
                    Liderlik tablosunda ve topluluk sayfalarında görünmeni sağlar.
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
                    Kullandığım stratejileri diğerleri görebilsin
                  </p>
                  <p className="text-xs text-paper-500 mt-0.5">
                    Diğer traderlar profilin üzerinden hangi stratejileri kullandığını görebilir.
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
                onClick={() => setStep(2)}
                className="flex-1 rounded-lg bg-mint-500 text-ink-950 font-semibold py-3 text-sm hover:bg-mint-400 transition"
              >
                Devam Et
              </button>
            </div>
          </div>
        )}

        {step === 2 && (
          <div className="animate-fade-in-up">
            <h1 className="font-display text-2xl font-semibold text-paper-100 mb-1">
              Hesabın hazırlanıyor
            </h1>
            <p className="text-sm text-paper-500 mb-8">
              Bilgilerin kaydediliyor...
            </p>
            <div className="flex justify-center">
              <div className="h-10 w-10 rounded-full border-2 border-mint-500 border-t-transparent animate-spin" />
            </div>
            <button
              onClick={handleSubmit}
              disabled={submitting}
              className="mt-8 w-full rounded-lg bg-mint-500 text-ink-950 font-semibold py-3 text-sm hover:bg-mint-400 transition disabled:opacity-40"
            >
              {submitting ? "Kaydediliyor..." : "Hesabı Oluştur"}
            </button>
          </div>
        )}

        {step === 3 && (
          <div className="animate-fade-in-up text-center">
            <div className="relative w-60 h-60 mx-auto mb-8">
              <svg viewBox="0 0 240 240" className="w-full h-full">
                <polygon points={hexPoints} fill="none" stroke="rgba(255,255,255,0.08)" strokeWidth="4" />
                <clipPath id="hexClip">
                  <rect x="0" y={240 - fillHeight} width="240" height={fillHeight} />
                </clipPath>
                <polygon points={hexPoints} fill="#2ED9A4" fillOpacity="0.2" clipPath="url(#hexClip)" />
                <polygon points={hexPoints} fill="none" stroke="#2ED9A4" strokeWidth="4" clipPath="url(#hexClip)" />
                <text
                  x="120" y="130"
                  textAnchor="middle"
                  fill="#F0F3F8"
                  fontSize="42"
                  fontWeight="bold"
                  fontFamily="var(--font-display)"
                >
                  {animScore}
                </text>
                <text
                  x="120" y="155"
                  textAnchor="middle"
                  fill="rgba(255,255,255,0.4)"
                  fontSize="14"
                  fontFamily="var(--font-mono)"
                >
                  PUAN
                </text>
              </svg>
            </div>

            <h2 className="font-display text-2xl font-semibold text-paper-100 mb-1">
              Hesabın hazır!
            </h2>
            <p className="text-sm text-paper-500 mb-8">
              Artık işlemlerini kaydetmeye ve performansını takip etmeye başlayabilirsin.
            </p>

            <button
              onClick={() => router.replace("/dashboard")}
              className="w-full rounded-lg bg-mint-500 text-ink-950 font-semibold py-3 text-sm hover:bg-mint-400 transition"
            >
              Hadi Başlayalım
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
