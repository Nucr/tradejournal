"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useAuth } from "@/lib/auth-context";
import { useI18n } from "@/lib/i18n/context";
import LanguageToggle from "./LanguageToggle";

export default function Navbar() {
  const { user, loading } = useAuth();
  const { t } = useI18n();
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    function onScroll() {
      setScrolled(window.scrollY > 40);
    }
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  function scrollTo(id: string) {
    const el = document.getElementById(id);
    if (el) el.scrollIntoView({ behavior: "smooth" });
  }

  return (
    <nav
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
        scrolled
          ? "bg-ink-950/80 backdrop-blur-lg border-b border-ink-800/50"
          : "bg-transparent"
      }`}
    >
      <div className="mx-auto max-w-7xl flex items-center justify-between px-6 h-16">
        <button
          onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}
          className="font-display text-xl font-bold tracking-tight text-paper-100 hover:text-mint-400 transition"
        >
          Verifter
        </button>

        <div className="hidden md:flex items-center gap-8">
          <button
            onClick={() => scrollTo("features")}
            className="text-sm text-paper-300 hover:text-paper-100 transition"
          >
            {t("nav.features")}
          </button>
          <button
            onClick={() => scrollTo("how-it-works")}
            className="text-sm text-paper-300 hover:text-paper-100 transition"
          >
            {t("nav.howItWorks")}
          </button>
          <button
            onClick={() => scrollTo("testimonials")}
            className="text-sm text-paper-300 hover:text-paper-100 transition"
          >
            {t("nav.testimonials")}
          </button>
        </div>

        <div className="flex items-center gap-3">
          {loading ? (
            <div className="h-5 w-5 rounded-full border-2 border-mint-500 border-t-transparent animate-spin" />
          ) : user ? (
            <Link
              href="/dashboard"
              className="rounded-lg bg-mint-500 px-4 py-2 text-sm font-semibold text-ink-950 hover:bg-mint-400 transition"
            >
              {t("nav.dashboard")}
            </Link>
          ) : (
            <>
              <LanguageToggle />
              <Link
                href="/login"
                className="text-sm text-paper-300 hover:text-paper-100 transition"
              >
                {t("nav.login")}
              </Link>
              <Link
                href="/register"
                className="rounded-lg bg-mint-500 px-4 py-2 text-sm font-semibold text-ink-950 hover:bg-mint-400 transition"
              >
                {t("nav.register")}
              </Link>
            </>
          )}
        </div>
      </div>
    </nav>
  );
}
