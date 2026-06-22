"use client";

import { DirectionFilter, RangeKey, ResultFilter } from "@/lib/types";

interface TradeFiltersProps {
  resultFilter: ResultFilter;
  onResultChange: (value: ResultFilter) => void;
  directionFilter: DirectionFilter;
  onDirectionChange: (value: DirectionFilter) => void;
  timeFilter: RangeKey;
  onTimeChange: (value: RangeKey) => void;
  customStart: string;
  customEnd: string;
  onCustomChange: (start: string, end: string) => void;
}

const RESULT_OPTIONS: { value: ResultFilter; label: string }[] = [
  { value: "all", label: "Tüm Sonuçlar" },
  { value: "profit", label: "Kâr" },
  { value: "loss", label: "Zarar" },
  { value: "be", label: "BE (Başabaş)" },
];

const DIRECTION_OPTIONS: { value: DirectionFilter; label: string }[] = [
  { value: "all", label: "Tüm Yönler" },
  { value: "long", label: "Long" },
  { value: "short", label: "Short" },
  { value: "be", label: "BE" },
];

const TIME_OPTIONS: { value: RangeKey; label: string }[] = [
  { value: "all", label: "Tüm Zamanlar" },
  { value: "day", label: "Bugün" },
  { value: "week", label: "Bu Hafta" },
  { value: "month", label: "Bu Ay" },
  { value: "year", label: "Bu Yıl" },
  { value: "custom", label: "Özel Aralık" },
];

export default function TradeFilters({
  resultFilter,
  onResultChange,
  directionFilter,
  onDirectionChange,
  timeFilter,
  onTimeChange,
  customStart,
  customEnd,
  onCustomChange,
}: TradeFiltersProps) {
  return (
    <div className="flex flex-wrap items-end gap-3">
      <div className="flex flex-col gap-1.5">
        <label className="text-xs font-mono uppercase tracking-wide text-paper-500">Sonuç</label>
        <select
          value={resultFilter}
          onChange={(e) => onResultChange(e.target.value as ResultFilter)}
          className="rounded-lg border border-ink-800 bg-ink-900 px-3 py-2 text-sm text-paper-100 focus:outline-none focus:border-mint-500/50 focus:ring-1 focus:ring-mint-500/20 transition cursor-pointer"
        >
          {RESULT_OPTIONS.map((opt) => (
            <option key={opt.value} value={opt.value}>
              {opt.label}
            </option>
          ))}
        </select>
      </div>

      <div className="flex flex-col gap-1.5">
        <label className="text-xs font-mono uppercase tracking-wide text-paper-500">Yön</label>
        <select
          value={directionFilter}
          onChange={(e) => onDirectionChange(e.target.value as DirectionFilter)}
          className="rounded-lg border border-ink-800 bg-ink-900 px-3 py-2 text-sm text-paper-100 focus:outline-none focus:border-mint-500/50 focus:ring-1 focus:ring-mint-500/20 transition cursor-pointer"
        >
          {DIRECTION_OPTIONS.map((opt) => (
            <option key={opt.value} value={opt.value}>
              {opt.label}
            </option>
          ))}
        </select>
      </div>

      <div className="flex flex-col gap-1.5">
        <label className="text-xs font-mono uppercase tracking-wide text-paper-500">Zaman</label>
        <div className="flex items-center gap-2">
          <select
            value={timeFilter}
            onChange={(e) => onTimeChange(e.target.value as RangeKey)}
            className="rounded-lg border border-ink-800 bg-ink-900 px-3 py-2 text-sm text-paper-100 focus:outline-none focus:border-mint-500/50 focus:ring-1 focus:ring-mint-500/20 transition cursor-pointer"
          >
            {TIME_OPTIONS.map((opt) => (
              <option key={opt.value} value={opt.value}>
                {opt.label}
              </option>
            ))}
          </select>
          {timeFilter === "custom" && (
            <div className="flex items-center gap-2 flex-wrap">
              <input
                type="date"
                value={customStart}
                onChange={(e) => onCustomChange(e.target.value, customEnd)}
                className="rounded-lg border border-ink-800 bg-ink-900 px-3 py-2 text-sm text-paper-100 focus:outline-none focus:border-mint-500/50 focus:ring-1 focus:ring-mint-500/20 transition"
              />
              <span className="text-paper-500 text-sm">–</span>
              <input
                type="date"
                value={customEnd}
                onChange={(e) => onCustomChange(customStart, e.target.value)}
                className="rounded-lg border border-ink-800 bg-ink-900 px-3 py-2 text-sm text-paper-100 focus:outline-none focus:border-mint-500/50 focus:ring-1 focus:ring-mint-500/20 transition"
              />
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
