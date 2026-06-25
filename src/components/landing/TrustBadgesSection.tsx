"use client";

import { useI18n } from "@/lib/i18n/context";
import { useInView } from "@/lib/useInView";

const BADGES = [
  { icon: "🔒", key: "trust.1" },
  { icon: "☁️", key: "trust.2" },
  { icon: "🔐", key: "trust.3" },
  { icon: "🔑", key: "trust.4" },
  { icon: "📋", key: "trust.5" },
];

export default function TrustBadgesSection() {
  const { t } = useI18n();
  const { ref, inView } = useInView({ threshold: 0.15 });

  return (
    <section className="py-16">
      <div className="mx-auto max-w-5xl px-6">
        <div
          ref={ref}
          className={`text-center mb-10 transition-all duration-700 ${
            inView ? "opacity-100 translate-y-0" : "opacity-0 translate-y-6"
          }`}
        >
          <h2 className="font-display text-2xl sm:text-3xl font-bold text-paper-100">
            {t("trust.title")}
          </h2>
          <p className="mt-2 text-sm text-paper-300 max-w-xl mx-auto">{t("trust.desc")}</p>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-4">
          {BADGES.map((b, i) => (
            <div
              key={b.key}
              className={`flex flex-col items-center gap-2 rounded-xl border border-ink-800 bg-ink-900/50 px-4 py-5 transition-all duration-500 hover:border-mint-500/30 ${
                inView
                  ? "opacity-100 translate-y-0"
                  : "opacity-0 translate-y-4"
              }`}
              style={{ transitionDelay: `${i * 100}ms` }}
            >
              <span className="text-2xl">{b.icon}</span>
              <span className="text-xs text-paper-300 font-mono text-center leading-relaxed">
                {t(b.key)}
              </span>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
