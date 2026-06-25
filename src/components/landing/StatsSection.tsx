"use client";

import { useEffect, useState } from "react";
import { useInView } from "@/lib/useInView";

const STATS = [
  { target: 10000, suffix: "+", label: "İşlem Kaydedildi", prefix: "" },
  { target: 500, suffix: "+", label: "Aktif Trader", prefix: "" },
  { target: 92, suffix: "%", label: "Memnuniyet Oranı", prefix: "" },
];

function AnimatedStat({
  target,
  suffix,
  label,
  prefix,
}: {
  target: number;
  suffix: string;
  label: string;
  prefix: string;
}) {
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
        {prefix}
        {count.toLocaleString()}
        {suffix}
      </span>
      <span className="mt-2 text-sm text-paper-300 font-mono uppercase tracking-wider">
        {label}
      </span>
    </div>
  );
}

export default function StatsSection() {
  const { ref, inView } = useInView({ threshold: 0.2 });

  return (
    <section className="py-20">
      <div className="mx-auto max-w-5xl px-6">
        <div
          ref={ref}
          className="grid grid-cols-1 sm:grid-cols-3 gap-8"
        >
          {STATS.map((s) => (
            <AnimatedStat key={s.label} {...s} />
          ))}
        </div>
      </div>
    </section>
  );
}
