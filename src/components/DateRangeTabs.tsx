"use client";

import { RangeKey } from "@/lib/types";
import DatePicker from "./DatePicker";

const TABS: { key: RangeKey; label: string }[] = [
  { key: "day", label: "Bugün" },
  { key: "week", label: "Hafta" },
  { key: "month", label: "Ay" },
  { key: "year", label: "Yıl" },
  { key: "all", label: "Tümü" },
  { key: "custom", label: "Özel" },
];

interface Props {
  value: RangeKey;
  onChange: (range: RangeKey) => void;
  customStart: string;
  customEnd: string;
  onCustomChange: (start: string, end: string) => void;
}

export default function DateRangeTabs({
  value,
  onChange,
  customStart,
  customEnd,
  onCustomChange,
}: Props) {
  return (
    <div className="flex flex-col gap-3 animate-fade-in">
      <div className="flex gap-1 overflow-x-auto rounded-lg bg-ink-900 border border-ink-800 p-1 w-full sm:w-fit">
        {TABS.map((tab) => (
          <button
            key={tab.key}
            onClick={() => onChange(tab.key)}
            className={`whitespace-nowrap rounded-md px-3.5 py-1.5 text-sm font-medium transition ${
              value === tab.key
                ? "bg-mint-500 text-ink-950 shadow-sm"
                : "text-paper-300 hover:text-paper-100 hover:bg-ink-800"
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {value === "custom" && (
        <div className="flex flex-wrap items-center gap-3 animate-fade-in-up">
          <DatePicker
            value={customStart}
            onChange={(v) => onCustomChange(v, customEnd)}
            placeholder="Başlangıç"
          />
          <span className="text-paper-500">→</span>
          <DatePicker
            value={customEnd}
            onChange={(v) => onCustomChange(customStart, v)}
            placeholder="Bitiş"
            minDate={customStart}
          />
        </div>
      )}
    </div>
  );
}
