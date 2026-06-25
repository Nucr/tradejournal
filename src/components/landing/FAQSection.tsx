"use client";

import { useState } from "react";
import { useI18n } from "@/lib/i18n/context";
import { useInView } from "@/lib/useInView";

const FAQ_IDS = [1, 2, 3, 4, 5, 6];

function FAQItem({ id, open, onToggle }: { id: number; open: boolean; onToggle: () => void }) {
  const { t } = useI18n();

  return (
    <div className="border-b border-ink-800 last:border-0">
      <button
        onClick={onToggle}
        className="flex w-full items-center justify-between py-4 text-left text-sm font-medium text-paper-100 hover:text-mint-400 transition"
      >
        <span>{t(`faq.${id}.q`)}</span>
        <svg
          className={`w-4 h-4 shrink-0 ml-4 transition-transform duration-300 ${
            open ? "rotate-45" : ""
          }`}
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth={2}
        >
          <path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" />
        </svg>
      </button>
      <div
        className={`overflow-hidden transition-all duration-300 ${
          open ? "max-h-96 opacity-100 pb-4" : "max-h-0 opacity-0"
        }`}
      >
        <p className="text-sm text-paper-300 leading-relaxed">{t(`faq.${id}.a`)}</p>
      </div>
    </div>
  );
}

export default function FAQSection() {
  const { t } = useI18n();
  const { ref, inView } = useInView({ threshold: 0.1 });
  const [openId, setOpenId] = useState<number | null>(null);

  return (
    <section id="faq" className="py-24 bg-ink-900/50">
      <div className="mx-auto max-w-3xl px-6">
        <div
          ref={ref}
          className={`text-center mb-12 transition-all duration-700 ${
            inView ? "opacity-100 translate-y-0" : "opacity-0 translate-y-6"
          }`}
        >
          <h2 className="font-display text-3xl sm:text-4xl font-bold text-paper-100">
            {t("faq.title")}
          </h2>
          <p className="mt-3 text-paper-300">{t("faq.desc")}</p>
        </div>

        <div className="rounded-xl border border-ink-800 bg-ink-900/50 px-6">
          {FAQ_IDS.map((id) => (
            <FAQItem
              key={id}
              id={id}
              open={openId === id}
              onToggle={() => setOpenId(openId === id ? null : id)}
            />
          ))}
        </div>
      </div>
    </section>
  );
}
