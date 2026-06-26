"use client";

"use client";

import { useState } from "react";
import { useAuthGuard } from "@/lib/authGuard";
import { ToastProvider } from "@/lib/toast-context";
import { PlanProvider } from "@/lib/features";
import Sidebar from "@/components/Sidebar";
import ToastContainer from "@/components/ToastContainer";
import NotificationToast from "@/components/NotificationToast";
import AchievementToast from "@/components/AchievementToast";
import OnboardingTour from "@/components/dashboard/OnboardingTour";

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  useAuthGuard();
  const [showOnboarding, setShowOnboarding] = useState(true);

  return (
    <PlanProvider>
    <ToastProvider>
      <div className="min-h-screen flex flex-col lg:flex-row bg-ink-950">
        <Sidebar />
        <main className="flex-1 px-4 sm:px-8 py-8 max-w-6xl mx-auto w-full">
          {children}
        </main>
      </div>
      <NotificationToast />
      <AchievementToast />
      <ToastContainer />
      {showOnboarding && <OnboardingTour />}
    </ToastProvider>
    </PlanProvider>
  );
}
