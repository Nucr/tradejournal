"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/lib/auth-context";
import { I18nProvider } from "@/lib/i18n/context";
import Navbar from "@/components/landing/Navbar";
import HeroSection from "@/components/landing/HeroSection";
import FeaturesSection from "@/components/landing/FeaturesSection";
import HowItWorksSection from "@/components/landing/HowItWorksSection";
import StatsSection from "@/components/landing/StatsSection";
import TestimonialsSection from "@/components/landing/TestimonialsSection";
import CTASection from "@/components/landing/CTASection";
import PricingSection from "@/components/landing/PricingSection";
import FAQSection from "@/components/landing/FAQSection";
import TrustBadgesSection from "@/components/landing/TrustBadgesSection";
import NewsletterSection from "@/components/landing/NewsletterSection";
import ScrollToTop from "@/components/landing/ScrollToTop";
import Footer from "@/components/landing/Footer";

export default function LocaleHome() {
  const { user, loading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (loading) return;
    if (user) router.replace("/dashboard");
  }, [user, loading, router]);

  if (loading) {
    return (
      <main className="min-h-screen flex items-center justify-center bg-ink-950">
        <div className="flex flex-col items-center gap-3">
          <div className="h-8 w-8 rounded-full border-2 border-mint-500 border-t-transparent animate-spin" />
          <p className="font-mono text-sm text-paper-300">yükleniyor…</p>
        </div>
      </main>
    );
  }

  if (user) return null;

  return (
    <I18nProvider>
    <main className="bg-ink-950">
      <Navbar />
      <HeroSection />
      <FeaturesSection />
      <HowItWorksSection />
      <StatsSection />
      <TestimonialsSection />
      <PricingSection />
      <FAQSection />
      <TrustBadgesSection />
      <NewsletterSection />
      <CTASection />
      <Footer />
      <ScrollToTop />
    </main>
    </I18nProvider>
  );
}
