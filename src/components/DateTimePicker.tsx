"use client";

import { useState, useRef, useEffect } from "react";
import {
  format,
  startOfMonth, endOfMonth, startOfWeek, endOfWeek,
  addMonths, subMonths,
  isSameDay, isSameMonth,
  eachDayOfInterval, parseISO,
} from "date-fns";
import { tr } from "date-fns/locale";

interface Props {
  value: string; // datetime-local format: "2024-01-15T14:30"
  onChange: (val: string) => void;
  placeholder?: string;
}

export default function DateTimePicker({ value, onChange, placeholder = "Tarih & Saat" }: Props) {
  const [open, setOpen] = useState(false);
  const [viewDate, setViewDate] = useState(() => {
    try { return value ? new Date(value) : new Date(); } catch { return new Date(); }
  });
  const [timeH, setTimeH] = useState(() => value ? value.slice(11, 13) : "12");
  const [timeM, setTimeM] = useState(() => value ? value.slice(14, 16) : "00");
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

  const selectedDate = value ? new Date(value) : null;

  function pickDay(day: Date) {
    const h = timeH.padStart(2, "0");
    const m = timeM.padStart(2, "0");
    onChange(`${format(day, "yyyy-MM-dd")}T${h}:${m}`);
  }

  function updateTime(h: string, m: string) {
    if (!selectedDate) return;
    const h2 = h.padStart(2, "0");
    const m2 = m.padStart(2, "0");
    onChange(`${format(selectedDate, "yyyy-MM-dd")}T${h2}:${m2}`);
  }

  return (
    <div ref={ref} className="relative">
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        className="flex items-center gap-2 rounded-lg border border-ink-700 dark-input px-3 py-2.5 text-sm font-mono w-full hover:border-mint-500 transition"
      >
        <svg className="w-4 h-4 text-paper-500 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
        </svg>
        <span className={selectedDate ? "text-paper-100" : "text-paper-500"}>
          {selectedDate
            ? format(selectedDate, "dd MMM yyyy HH:mm", { locale: tr })
            : placeholder}
        </span>
      </button>

      {open && (
        <div className="absolute z-50 top-full mt-2 left-0 right-0 sm:right-auto rounded-xl border border-ink-700 bg-ink-900 p-4 shadow-card animate-scale-in min-w-[280px]">
          {/* Month nav */}
          <div className="flex items-center justify-between mb-3">
            <button
              type="button"
              onClick={() => setViewDate(subMonths(viewDate, 1))}
              className="p-1.5 rounded-lg hover:bg-ink-800 text-paper-300 transition"
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
              className="p-1.5 rounded-lg hover:bg-ink-800 text-paper-300 transition"
            >
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
            </button>
          </div>

          <div className="grid grid-cols-7 mb-1">
            {["Pt", "Sa", "Ça", "Pe", "Cu", "Ct", "Pz"].map((d) => (
              <div key={d} className="text-center text-[11px] font-mono text-paper-500 py-1">{d}</div>
            ))}
          </div>

          <div className="grid grid-cols-7 gap-y-1">
            {days.map((day) => {
              const isSelected = selectedDate && isSameDay(day, selectedDate);
              const isToday = isSameDay(day, new Date());
              const inMonth = isSameMonth(day, viewDate);
              return (
                <button
                  key={day.toISOString()}
                  type="button"
                  onClick={() => pickDay(day)}
                  className={`
                    aspect-square rounded-lg text-[13px] font-mono transition
                    ${isSelected ? "bg-mint-500 text-ink-950 font-semibold" : ""}
                    ${!isSelected && isToday ? "border border-mint-500/50 text-mint-400" : ""}
                    ${!isSelected && !isToday && inMonth ? "text-paper-100 hover:bg-ink-800" : ""}
                    ${!isSelected && !inMonth ? "text-paper-500/40" : ""}
                  `}
                >
                  {format(day, "d")}
                </button>
              );
            })}
          </div>

          {/* Time picker */}
          <div className="mt-3 pt-3 border-t border-ink-800 flex items-center gap-2">
            <svg className="w-4 h-4 text-paper-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <input
              type="number"
              min={0} max={23}
              value={timeH}
              onChange={(e) => {
                setTimeH(e.target.value);
                updateTime(e.target.value, timeM);
              }}
              className="w-12 rounded-lg border border-ink-700 bg-ink-950 px-2 py-1 text-sm font-mono text-center"
            />
            <span className="text-paper-500 font-mono">:</span>
            <input
              type="number"
              min={0} max={59}
              value={timeM}
              onChange={(e) => {
                setTimeM(e.target.value);
                updateTime(timeH, e.target.value);
              }}
              className="w-12 rounded-lg border border-ink-700 bg-ink-950 px-2 py-1 text-sm font-mono text-center"
            />
          </div>
        </div>
      )}
    </div>
  );
}
