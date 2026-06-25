"use client";

import { createContext, useContext, useEffect, useState, ReactNode, useCallback } from "react";
import { doc, onSnapshot } from "firebase/firestore";
import { db } from "./firebase";
import { useAuth } from "./auth-context";

export type Plan = "free" | "pro" | "premium";

export type Feature =
  | "unlimited_trades"
  | "advanced_charts"
  | "calendar"
  | "csv_import"
  | "csv_export"
  | "pdf_export"
  | "strategy_images"
  | "messaging"
  | "theme_customization"
  | "full_leaderboard"
  | "api_access"
  | "unlimited_goals"
  | "unlimited_strategies";

export const FEATURE_PLAN: Record<Feature, Plan> = {
  unlimited_trades: "pro",
  advanced_charts: "pro",
  calendar: "pro",
  csv_import: "pro",
  csv_export: "premium",
  pdf_export: "premium",
  strategy_images: "premium",
  messaging: "pro",
  theme_customization: "pro",
  full_leaderboard: "pro",
  api_access: "premium",
  unlimited_goals: "pro",
  unlimited_strategies: "pro",
};

export const PLAN_LIMITS: Record<Plan, Record<string, number>> = {
  free: { trades: 100, strategies: 1, goals: 3 },
  pro: { trades: 1000, strategies: 5, goals: Infinity },
  premium: { trades: Infinity, strategies: Infinity, goals: Infinity },
};

export const PLAN_ORDER: Record<Plan, number> = { free: 0, pro: 1, premium: 2 };

interface PlanContextValue {
  plan: Plan;
  hasFeature: (feature: Feature) => boolean;
  getLimit: (key: string) => number;
  exceedsLimit: (key: string, current: number) => boolean;
}

const PlanContext = createContext<PlanContextValue>({
  plan: "free",
  hasFeature: () => false,
  getLimit: () => 0,
  exceedsLimit: () => true,
});

export function PlanProvider({ children }: { children: ReactNode }) {
  const { user } = useAuth();
  const [plan, setPlan] = useState<Plan>("free");

  useEffect(() => {
    if (!user) {
      setPlan("free");
      return;
    }
    const unsub = onSnapshot(doc(db, "users", user.uid), (snap) => {
      if (!snap.exists()) return;
      const subscription = snap.data()?.subscription as { plan?: Plan } | undefined;
      setPlan(subscription?.plan ?? "free");
    });
    return unsub;
  }, [user]);

  const hasFeature = useCallback((feature: Feature): boolean => {
    const required = FEATURE_PLAN[feature];
    return PLAN_ORDER[plan] >= PLAN_ORDER[required];
  }, [plan]);

  const getLimit = useCallback((key: string): number => {
    return PLAN_LIMITS[plan]?.[key] ?? Infinity;
  }, [plan]);

  const exceedsLimit = useCallback((key: string, current: number): boolean => {
    const limit = getLimit(key);
    return current >= limit;
  }, [getLimit]);

  return (
    <PlanContext.Provider value={{ plan, hasFeature, getLimit, exceedsLimit }}>
      {children}
    </PlanContext.Provider>
  );
}

export function usePlan() {
  return useContext(PlanContext);
}
