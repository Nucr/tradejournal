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
import { DayOfWeekStat } from "./utils";

interface Props {
  data: DayOfWeekStat[];
}

export default function DayOfWeekChart({ data }: Props) {
  if (data.every((d) => d.trades === 0)) {
    return (
      <div className="flex h-64 items-center justify-center rounded-xl border border-ink-800 bg-ink-900 text-sm text-paper-500">
        Gün bazında veri bulunmuyor.
      </div>
    );
  }

  return (
    <div>
      <h2 className="text-sm font-mono uppercase tracking-wide text-paper-500 mb-3">
        Günlük Analiz
      </h2>
      <div className="rounded-xl border border-ink-800 bg-ink-900 p-4 h-64">
        <ResponsiveContainer width="100%" height="85%">
          <BarChart
            data={data}
            margin={{ top: 8, right: 8, left: 0, bottom: 0 }}
          >
            <CartesianGrid stroke="#1B212B" vertical={false} />
            <XAxis
              dataKey="shortName"
              stroke="#6B7480"
              fontSize={11}
              tickLine={false}
              axisLine={false}
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
              formatter={(value: number, name: string) => {
                if (name === "pnl") return [`$${value.toFixed(2)}`, "PnL"];
                return [value, "İşlem"];
              }}
            />
            <Bar dataKey="pnl" radius={[3, 3, 0, 0]} maxBarSize={32}>
              {data.map((d, i) => (
                <Cell
                  key={i}
                  fill={d.pnl >= 0 ? "#2ED9A4" : "#FF5D5D"}
                />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
        <div className="flex flex-wrap justify-center gap-x-4 gap-y-1 text-[10px] font-mono text-paper-500">
          {data.map((d) => (
            <span key={d.name} className="flex items-center gap-1">
              {d.name}: {d.trades} işlem
              {d.winRate > 0 && (
                <span className={d.winRate >= 50 ? "text-accent" : "text-coral-400"}>
                  (%{d.winRate.toFixed(0)})
                </span>
              )}
            </span>
          ))}
        </div>
      </div>
    </div>
  );
}
