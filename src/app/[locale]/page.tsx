"use client";

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
