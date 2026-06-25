"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/lib/auth-context";
import Navbar from "@/components/landing/Navbar";
import HeroSection from "@/components/landing/HeroSection";
import FeaturesSection from "@/components/landing/FeaturesSection";
import HowItWorksSection from "@/components/landing/HowItWorksSection";
import StatsSection from "@/components/landing/StatsSection";
import TestimonialsSection from "@/components/landing/TestimonialsSection";
import CTASection from "@/components/landing/CTASection";
import Footer from "@/components/landing/Footer";

export default function Home() {
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
    <main className="bg-ink-950">
      <Navbar />
      <HeroSection />
      <FeaturesSection />
      <HowItWorksSection />
      <StatsSection />
      <TestimonialsSection />
      <CTASection />
      <Footer />
    </main>
  );
}
