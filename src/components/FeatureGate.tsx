"use client";

import { usePlan, Feature } from "@/lib/features";
import Link from "next/link";

interface FeatureGateProps {
  feature: Feature;
  children: React.ReactNode;
  fallback?: React.ReactNode;
  showUpgrade?: boolean;
}

export default function FeatureGate({ feature, children, fallback, showUpgrade = true }: FeatureGateProps) {
  const { hasFeature } = usePlan();

  if (hasFeature(feature)) return <>{children}</>;

  if (fallback) return <>{fallback}</>;

  if (!showUpgrade) return null;

  return (
    <div className="relative">
      <div className="pointer-events-none select-none blur-[2px] opacity-40">
        {children}
      </div>
      <div className="absolute inset-0 flex items-center justify-center">
        <Link
          href="/pricing"
          className="rounded-lg bg-mint-500 px-4 py-2 text-sm font-semibold text-ink-950 hover:bg-mint-400 transition shadow-lg z-10"
        >
          Yükselt
        </Link>
      </div>
    </div>
  );
}

interface LimitBadgeProps {
  current: number;
  limitKey: string;
  label?: string;
}

export function LimitBadge({ current, limitKey, label }: LimitBadgeProps) {
  const { exceedsLimit, getLimit, plan } = usePlan();
  const limit = getLimit(limitKey);
  const exceeded = exceedsLimit(limitKey, current);

  if (plan === "premium" || (!isFinite(limit) && !exceeded)) return null;

  return (
    <div className="flex items-center gap-2">
      {label && <span className="text-xs text-paper-500">{label}</span>}
      <span className={`text-xs font-mono ${exceeded ? "text-coral-400" : "text-paper-500"}`}>
        {current}/{limit === Infinity ? "∞" : limit}
      </span>
      {exceeded && (
        <Link
          href="/pricing"
          className="text-xs font-medium text-mint-400 hover:underline"
        >
          Yükselt
        </Link>
      )}
    </div>
  );
}
