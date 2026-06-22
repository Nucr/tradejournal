"use client";

interface Props {
  label: string;
  value: string;
  tone?: "mint" | "coral" | "amber";
  hint?: string;
}

export default function StatCard({ label, value, tone, hint }: Props) {
  const toneClass =
    tone === "mint"
      ? "text-mint-400"
      : tone === "coral"
      ? "text-coral-400"
      : tone === "amber"
      ? "text-amber-400"
      : "text-paper-100";

  return (
    <div className="rounded-xl border border-ink-800 bg-ink-900 p-4 hover:border-ink-700 transition">
      <p className="text-[11px] font-mono uppercase tracking-wide text-paper-500 mb-2 leading-tight">
        {label}
      </p>
      <p className={`font-display text-xl font-semibold font-mono ${toneClass}`}>
        {value}
      </p>
      {hint && (
        <p className="text-[11px] font-mono text-paper-500 mt-1">{hint}</p>
      )}
    </div>
  );
}
