"use client";

import { FormEvent, useState } from "react";
import { useI18n } from "@/lib/i18n/context";
import { useInView } from "@/lib/useInView";

export default function NewsletterSection() {
  const { t } = useI18n();
  const { ref, inView } = useInView({ threshold: 0.2 });
  const [email, setEmail] = useState("");
  const [status, setStatus] = useState<"idle" | "success" | "error">("idle");

  function handleSubmit(e: FormEvent) {
    e.preventDefault();
    const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!re.test(email)) {
      setStatus("error");
      return;
    }
    setStatus("success");
    setEmail("");
  }

  return (
    <section className="py-20">
      <div className="mx-auto max-w-lg px-6">
        <div
          ref={ref}
          className={`text-center transition-all duration-700 ${
            inView ? "opacity-100 translate-y-0" : "opacity-0 translate-y-6"
          }`}
        >
          <h2 className="font-display text-2xl sm:text-3xl font-bold text-paper-100 mb-2">
            {t("newsletter.title")}
          </h2>
          <p className="text-sm text-paper-300 mb-8">{t("newsletter.desc")}</p>

          {status === "success" ? (
            <p className="text-base text-mint-400 font-medium">{t("newsletter.success")}</p>
          ) : (
            <form onSubmit={handleSubmit} className="flex flex-col sm:flex-row gap-3 max-w-md mx-auto">
              <input
                type="email"
                required
                value={email}
                onChange={(e) => {
                  setEmail(e.target.value);
                  if (status === "error") setStatus("idle");
                }}
                placeholder={t("newsletter.placeholder")}
                className="flex-1 rounded-lg border border-ink-700 bg-ink-900 px-4 py-2.5 text-sm text-paper-100 placeholder:text-paper-500 focus:border-mint-500 focus:outline-none"
              />
              <button
                type="submit"
                className="rounded-lg bg-mint-500 px-5 py-2.5 text-sm font-semibold text-ink-950 hover:bg-mint-400 transition whitespace-nowrap"
              >
                {t("newsletter.button")}
              </button>
            </form>
          )}

          {status === "error" && (
            <p className="mt-3 text-xs text-coral-400">{t("newsletter.error")}</p>
          )}
        </div>
      </div>
    </section>
  );
}
