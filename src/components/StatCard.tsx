"use client";

interface Props {
  label: string;
  value: string;
  sub?: string;
  tone?: "mint" | "coral" | "amber";
  hint?: string;
}

export default function StatCard({ label, value, sub, tone, hint }: Props) {
  const toneClass =
    tone === "mint"
      ? "text-accent"
      : tone === "coral"
      ? "text-coral-400"
      : tone === "amber"
      ? "text-amber-400"
      : "text-paper-100";

  const subTone = sub?.startsWith("+") ? "text-accent/70" : sub?.startsWith("-") ? "text-coral-400/70" : "text-paper-500";

  return (
    <div className="rounded-xl border border-ink-800 bg-ink-900 p-4 hover:border-ink-700 transition">
      <p className="text-[11px] font-mono uppercase tracking-wide text-paper-500 mb-2 leading-tight">
        {label}
      </p>
      <p className={`font-display text-xl font-semibold font-mono ${toneClass}`}>
        {value}
      </p>
      {sub && (
        <p className={`text-xs font-mono mt-0.5 ${subTone}`}>{sub}</p>
      )}
      {hint && (
        <p className="text-[11px] font-mono text-paper-500 mt-1">{hint}</p>
      )}
    </div>
  );
}
