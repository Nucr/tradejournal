"use client";

import { useEffect, useState } from "react";
import { useI18n } from "@/lib/i18n/context";
import { useInView } from "@/lib/useInView";

const STATS = [
  { target: 10000, suffix: "+", labelKey: "stats.trades" },
  { target: 500, suffix: "+", labelKey: "stats.traders" },
  { target: 92, suffix: "%", labelKey: "stats.satisfaction" },
];

function AnimatedStat({
  target,
  suffix,
  labelKey,
}: {
  target: number;
  suffix: string;
  labelKey: string;
}) {
  const { t } = useI18n();
  const [count, setCount] = useState(0);
  const { ref, inView } = useInView({ threshold: 0.5 });

  useEffect(() => {
    if (!inView) return;
    setCount(0);
    const duration = 2000;
    const steps = 60;
    const increment = target / steps;
    let current = 0;
    const timer = setInterval(() => {
      current += increment;
      if (current >= target) {
        setCount(target);
        clearInterval(timer);
      } else {
        setCount(Math.floor(current));
      }
    }, duration / steps);
    return () => clearInterval(timer);
  }, [inView, target]);

  return (
    <div ref={ref} className="flex flex-col items-center text-center">
      <span className="font-display text-4xl sm:text-5xl font-bold text-mint-400 tabular-nums">
        {count.toLocaleString()}
        {suffix}
      </span>
      <span className="mt-2 text-sm text-paper-300 font-mono uppercase tracking-wider">
        {t(labelKey)}
      </span>
    </div>
  );
}

export default function StatsSection() {
  return (
    <section className="py-20">
      <div className="mx-auto max-w-5xl px-6">
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-8">
          {STATS.map((s) => (
            <AnimatedStat key={s.labelKey} {...s} />
          ))}
        </div>
      </div>
    </section>
  );
}
