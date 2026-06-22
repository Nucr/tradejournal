"use client";

import { useState, useRef, useEffect } from "react";
import {
  format,
  startOfMonth,
  endOfMonth,
  startOfWeek,
  endOfWeek,
  addMonths,
  subMonths,
  isSameDay,
  isSameMonth,
  isWithinInterval,
  eachDayOfInterval,
} from "date-fns";
import { tr } from "date-fns/locale";

interface Props {
  value: string; // YYYY-MM-DD
  onChange: (val: string) => void;
  placeholder?: string;
  minDate?: string;
  maxDate?: string;
}

export default function DatePicker({ value, onChange, placeholder = "Tarih seç", minDate, maxDate }: Props) {
  const [open, setOpen] = useState(false);
  const [viewDate, setViewDate] = useState(() => value ? new Date(value) : new Date());
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    }
    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, []);

  const monthStart = startOfMonth(viewDate);
  const monthEnd = endOfMonth(viewDate);
  const calStart = startOfWeek(monthStart, { weekStartsOn: 1 });
  const calEnd = endOfWeek(monthEnd, { weekStartsOn: 1 });
  const days = eachDayOfInterval({ start: calStart, end: calEnd });

  const selected = value ? new Date(value) : null;

  function pickDay(day: Date) {
    onChange(format(day, "yyyy-MM-dd"));
    setOpen(false);
  }

  const isDisabled = (day: Date) => {
    if (minDate && day < new Date(minDate)) return true;
    if (maxDate && day > new Date(maxDate)) return true;
    return false;
  };

  return (
    <div ref={ref} className="relative">
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        className="flex items-center gap-2 rounded-lg border border-ink-700 dark-input px-3 py-2 text-sm font-mono min-w-[140px] hover:border-mint-500 transition"
      >
        <svg className="w-4 h-4 text-paper-500 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
        </svg>
        <span className={selected ? "text-paper-100" : "text-paper-500"}>
          {selected ? format(selected, "dd MMM yyyy", { locale: tr }) : placeholder}
        </span>
      </button>

      {open && (
        <div className="absolute z-50 top-full mt-2 left-0 right-0 sm:right-auto rounded-xl border border-ink-700 bg-ink-900 p-4 shadow-card animate-scale-in min-w-[280px]">
          {/* Header */}
          <div className="flex items-center justify-between mb-3">
            <button
              type="button"
              onClick={() => setViewDate(subMonths(viewDate, 1))}
              className="p-1.5 rounded-lg hover:bg-ink-800 text-paper-300 hover:text-paper-100 transition"
            >
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
              </svg>
            </button>
            <span className="text-sm font-semibold">
              {format(viewDate, "MMMM yyyy", { locale: tr })}
            </span>
            <button
              type="button"
              onClick={() => setViewDate(addMonths(viewDate, 1))}
              className="p-1.5 rounded-lg hover:bg-ink-800 text-paper-300 hover:text-paper-100 transition"
            >
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
            </button>
          </div>

          {/* Day headers */}
          <div className="grid grid-cols-7 mb-1">
            {["Pt", "Sa", "Ça", "Pe", "Cu", "Ct", "Pz"].map((d) => (
              <div key={d} className="text-center text-[11px] font-mono text-paper-500 py-1">{d}</div>
            ))}
          </div>

          {/* Days */}
          <div className="grid grid-cols-7 gap-y-1">
            {days.map((day) => {
              const isSelected = selected && isSameDay(day, selected);
              const isToday = isSameDay(day, new Date());
              const inMonth = isSameMonth(day, viewDate);
              const disabled = isDisabled(day);

              return (
                <button
                  key={day.toISOString()}
                  type="button"
                  disabled={disabled}
                  onClick={() => !disabled && pickDay(day)}
                  className={`
                    aspect-square rounded-lg text-[13px] font-mono transition
                    ${isSelected ? "bg-mint-500 text-ink-950 font-semibold" : ""}
                    ${!isSelected && isToday ? "border border-mint-500/50 text-mint-400" : ""}
                    ${!isSelected && !isToday && inMonth ? "text-paper-100 hover:bg-ink-800" : ""}
                    ${!isSelected && !inMonth ? "text-paper-500/40" : ""}
                    ${disabled ? "opacity-30 cursor-not-allowed" : "cursor-pointer"}
                  `}
                >
                  {format(day, "d")}
                </button>
              );
            })}
          </div>

          {/* Today shortcut */}
          <button
            type="button"
            onClick={() => { pickDay(new Date()); setViewDate(new Date()); }}
            className="mt-3 w-full text-xs font-mono text-paper-500 hover:text-mint-400 transition"
          >
            Bugün
          </button>
        </div>
      )}
    </div>
  );
}
