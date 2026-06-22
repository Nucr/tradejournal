"use client";

import {
  ResponsiveContainer,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
} from "recharts";
import { Trade } from "@/lib/types";
import { format, parseISO } from "date-fns";

interface Props {
  trades: Trade[];
}

export default function EquityCurveChart({ trades }: Props) {
  const sorted = [...trades].sort(
    (a, b) => parseISO(a.entryDate).getTime() - parseISO(b.entryDate).getTime()
  );

  let cumulative = 0;
  const data = sorted.map((t) => {
    cumulative += t.result;
    return {
      date: format(parseISO(t.entryDate), "dd MMM"),
      value: Number(cumulative.toFixed(2)),
    };
  });

  if (data.length === 0) {
    return (
      <div className="flex h-64 items-center justify-center rounded-xl border border-ink-800 bg-ink-900 text-sm text-paper-500">
        Bu aralıkta gösterilecek işlem yok.
      </div>
    );
  }

  return (
    <div className="rounded-xl border border-ink-800 bg-ink-900 p-4 h-64">
      <ResponsiveContainer width="100%" height="100%">
        <AreaChart data={data} margin={{ top: 10, right: 10, left: -10, bottom: 0 }}>
          <defs>
            <linearGradient id="equityFill" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#2ED9A4" stopOpacity={0.35} />
              <stop offset="100%" stopColor="#2ED9A4" stopOpacity={0} />
            </linearGradient>
          </defs>
          <CartesianGrid stroke="#1B212B" vertical={false} />
          <XAxis
            dataKey="date"
            stroke="#6B7480"
            fontSize={11}
            tickLine={false}
            axisLine={false}
          />
          <YAxis stroke="#6B7480" fontSize={11} tickLine={false} axisLine={false} />
          <Tooltip
            contentStyle={{
              background: "#11151B",
              border: "1px solid #272F3B",
              borderRadius: 8,
              fontSize: 12,
              fontFamily: "var(--font-mono)",
            }}
            labelStyle={{ color: "#A8B0BC" }}
          />
          <Area
            type="monotone"
            dataKey="value"
            stroke="#2ED9A4"
            strokeWidth={2}
            fill="url(#equityFill)"
          />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
}
