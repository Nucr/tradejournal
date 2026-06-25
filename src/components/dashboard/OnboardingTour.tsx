"use client";

import { useState, useEffect } from "react";

const STEPS = [
  {
    title: "Hoş Geldin! 👋",
    body: "Trade Journal dashboard'una hoş geldin. Bu kısa turda sana tüm özellikleri göstereceğiz.",
  },
  {
    title: "Genel Bakış",
    body: "Bu sayfa performansını takip etmek için ana merkezin. Yukarıdaki kartlarda işlem sayın, kazanma oranın ve net kâr/zararını görüntüleyebilirsin.",
  },
  {
    title: "Trade Defteri",
    body: "Sol menüden 'Trade Defteri' sayfasına giderek yeni işlem ekleyebilir, mevcut işlemlerini düzenleyebilir veya silebilirsin.",
  },
  {
    title: "Widget'lar",
    body: "Aşağıdaki widget'lar sayesinde bugünkü özetini, aylık ilerlemeni, son işlemlerini ve trade sıklığını görebilirsin.",
  },
  {
    title: "Hazırsın!",
    body: "Artık keşfetmeye başlayabilirsin. İlk işlemini eklemeyi unutma!",
  },
];

export default function OnboardingTour() {
  const [open, setOpen] = useState(false);
  const [step, setStep] = useState(0);

  useEffect(() => {
    const done = localStorage.getItem("onboarding-done");
    if (!done) {
      setTimeout(() => setOpen(true), 500);
    }
  }, []);

  function handleNext() {
    if (step < STEPS.length - 1) {
      setStep((s) => s + 1);
    } else {
      handleClose();
    }
  }

  function handleClose() {
    localStorage.setItem("onboarding-done", "true");
    setOpen(false);
    setStep(0);
  }

  if (!open) return null;

  const s = STEPS[step];

  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/60 px-4 animate-fade-in">
      <div className="relative w-full max-w-md rounded-2xl border border-ink-700 bg-ink-900 p-6 shadow-2xl animate-scale-in">
        <div className="flex items-center gap-1 mb-6">
          {STEPS.map((_, i) => (
            <div
              key={i}
              className={`h-1 flex-1 rounded-full transition ${
                i <= step ? "bg-mint-500" : "bg-ink-700"
              }`}
            />
          ))}
        </div>

        <h2 className="font-display text-xl font-semibold text-paper-100 mb-2">
          {s.title}
        </h2>
        <p className="text-sm text-paper-300 leading-relaxed">{s.body}</p>

        <div className="flex items-center justify-between mt-8">
          <button
            onClick={handleClose}
            className="text-xs font-mono text-paper-500 hover:text-paper-300 transition"
          >
            Atl a
          </button>
          <div className="flex items-center gap-2">
            {step > 0 && (
              <button
                onClick={() => setStep((s) => s - 1)}
                className="rounded-lg border border-ink-700 px-4 py-2 text-sm text-paper-300 hover:bg-ink-800 transition"
              >
                Geri
              </button>
            )}
            <button
              onClick={handleNext}
              className="rounded-lg bg-mint-500 px-5 py-2 text-sm font-semibold text-ink-950 hover:bg-mint-400 transition"
            >
              {step < STEPS.length - 1 ? "Devam" : "Başlayalım!"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
