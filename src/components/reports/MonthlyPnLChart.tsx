"use client";

import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Cell,
} from "recharts";
import { MonthlyPnL } from "./report-utils";

interface Props {
  data: MonthlyPnL[];
}

export default function MonthlyPnLChart({ data }: Props) {
  if (data.length === 0) {
    return (
      <div className="flex h-64 items-center justify-center rounded-xl border border-ink-800 bg-ink-900 text-sm text-paper-500">
        Aylık veri bulunmuyor.
      </div>
    );
  }

  return (
    <div>
      <h2 className="text-sm font-mono uppercase tracking-wide text-paper-500 mb-3">
        Aylık Kâr/Zarar
      </h2>
      <div className="rounded-xl border border-ink-800 bg-ink-900 p-4 h-64">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart
            data={data}
            margin={{ top: 8, right: 8, left: 0, bottom: 0 }}
          >
            <CartesianGrid stroke="#1B212B" vertical={false} />
            <XAxis
              dataKey="monthLabel"
              stroke="#6B7480"
              fontSize={10}
              tickLine={false}
              axisLine={false}
              interval="preserveStartEnd"
            />
            <YAxis
              stroke="#6B7480"
              fontSize={10}
              tickLine={false}
              axisLine={false}
              tickFormatter={(v: number) => `$${v}`}
            />
            <Tooltip
              contentStyle={{
                background: "#11151B",
                border: "1px solid #272F3B",
                borderRadius: 8,
                fontSize: 12,
                fontFamily: "var(--font-mono)",
              }}
              labelStyle={{ color: "#A8B0BC" }}
              itemStyle={{ color: "#E8ECF0" }}
              formatter={(value: number) => [`$${value.toFixed(2)}`, "PnL"]}
            />
            <Bar dataKey="pnl" radius={[3, 3, 0, 0]} maxBarSize={32}>
              {data.map((entry, i) => (
                <Cell
                  key={i}
                  fill={entry.pnl >= 0 ? "#2ED9A4" : "#FF5D5D"}
                />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
        <div className="flex flex-wrap justify-center gap-4 mt-2 text-[10px] font-mono text-paper-500">
          <span className="flex items-center gap-1">
            <span className="w-2 h-2 rounded-sm bg-accent" /> Kârlı
          </span>
          <span className="flex items-center gap-1">
            <span className="w-2 h-2 rounded-sm bg-coral-400" /> Zararlı
          </span>
        </div>
      </div>
    </div>
  );
}
