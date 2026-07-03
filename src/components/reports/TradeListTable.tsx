"use client";

import { useState, useMemo } from "react";
import { Trade } from "@/lib/types";
import { format, parseISO } from "date-fns";

interface Props {
  trades: Trade[];
  accountNames: Record<string, string>;
}

type SortKey = "entryDate" | "pair" | "result" | "rr" | "netPnl" | "strategy";

export default function TradeListTable({ trades, accountNames }: Props) {
  const [sortKey, setSortKey] = useState<SortKey>("entryDate");
  const [sortAsc, setSortAsc] = useState(false);
  const [showAll, setShowAll] = useState(false);

  const sorted = useMemo(() => {
    const list = [...trades];
    list.sort((a, b) => {
      let cmp = 0;
      switch (sortKey) {
        case "entryDate":
          cmp = a.entryDate.localeCompare(b.entryDate);
          break;
        case "pair":
          cmp = a.pair.localeCompare(b.pair);
          break;
        case "result":
          cmp = a.result - b.result;
          break;
        case "rr":
          cmp = a.rr - b.rr;
          break;
        case "netPnl":
          cmp = (a.netPnl ?? 0) - (b.netPnl ?? 0);
          break;
        case "strategy":
          cmp = (a.strategy || "").localeCompare(b.strategy || "");
          break;
      }
      return sortAsc ? cmp : -cmp;
    });
    return list;
  }, [trades, sortKey, sortAsc]);

  const displayTrades = showAll ? sorted : sorted.slice(0, 50);

  function toggleSort(key: SortKey) {
    if (sortKey === key) {
      setSortAsc(!sortAsc);
    } else {
      setSortKey(key);
      setSortAsc(false);
    }
  }

  function SortIcon({ col }: { col: SortKey }) {
    if (sortKey !== col) return null;
    return <span className="ml-1">{sortAsc ? "↑" : "↓"}</span>;
  }

  if (trades.length === 0) return null;

  return (
    <div>
      <h2 className="text-sm font-mono uppercase tracking-wide text-paper-500 mb-3">
        İşlem Listesi ({trades.length})
      </h2>
      <div className="rounded-xl border border-ink-800 bg-ink-900 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-ink-800 bg-ink-950/50">
                <Th onClick={() => toggleSort("entryDate")} active={sortKey === "entryDate"}>
                  Tarih <SortIcon col="entryDate" />
                </Th>
                <Th onClick={() => toggleSort("pair")} active={sortKey === "pair"}>
                  Pair <SortIcon col="pair" />
                </Th>
                <Th>Yön</Th>
                <Th onClick={() => toggleSort("result")} active={sortKey === "result"}>
                  Sonuç <SortIcon col="result" />
                </Th>
                <Th onClick={() => toggleSort("rr")} active={sortKey === "rr"}>
                  RR <SortIcon col="rr" />
                </Th>
                <Th onClick={() => toggleSort("netPnl")} active={sortKey === "netPnl"}>
                  Net PnL <SortIcon col="netPnl" />
                </Th>
                <Th onClick={() => toggleSort("strategy")} active={sortKey === "strategy"}>
                  Strateji <SortIcon col="strategy" />
                </Th>
                <Th>Hesap</Th>
              </tr>
            </thead>
            <tbody>
              {displayTrades.map((t) => (
                <tr
                  key={t.id}
                  className="border-b border-ink-800/30 hover:bg-ink-800/20 transition"
                >
                  <td className="px-3 py-2 text-xs font-mono text-paper-400">
                    {format(parseISO(t.entryDate), "dd MMM")}
                  </td>
                  <td className="px-3 py-2 text-xs font-mono font-semibold text-paper-100">
                    {t.pair}
                  </td>
                  <td className="px-3 py-2">
                    <span
                      className={`text-[10px] font-mono font-semibold px-1.5 py-0.5 rounded ${
                        t.direction === "long"
                          ? "bg-accent/15 text-accent"
                          : t.direction === "short"
                          ? "bg-coral-500/15 text-coral-400"
                          : "bg-paper-500/15 text-paper-400"
                      }`}
                    >
                      {t.direction === "long" ? "U" : t.direction === "short" ? "S" : "BE"}
                    </span>
                  </td>
                  <td
                    className={`px-3 py-2 text-xs font-mono font-semibold ${
                      t.result >= 0 ? "text-accent" : "text-coral-400"
                    }`}
                  >
                    {t.result >= 0 ? "+" : ""}
                    {t.result.toFixed(2)}%
                  </td>
                  <td className="px-3 py-2 text-xs font-mono text-paper-300">
                    {t.rr.toFixed(1)}R
                  </td>
                  <td
                    className={`px-3 py-2 text-xs font-mono font-semibold ${
                      t.netPnl >= 0 ? "text-accent" : "text-coral-400"
                    }`}
                  >
                    {t.netPnl >= 0 ? "+" : ""}${(t.netPnl ?? 0).toFixed(2)}
                  </td>
                  <td className="px-3 py-2 text-xs font-mono text-paper-400 max-w-[100px] truncate">
                    {t.strategy || "—"}
                  </td>
                  <td className="px-3 py-2 text-xs font-mono text-paper-400">
                    {t.accountId ? accountNames[t.accountId] || "—" : "—"}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
      {trades.length > 50 && !showAll && (
        <button
          onClick={() => setShowAll(true)}
          className="mt-2 w-full rounded-lg border border-dashed border-ink-700 py-2 text-xs text-paper-500 hover:text-paper-300 hover:border-ink-600 transition font-mono"
        >
          Tümünü Göster ({trades.length} işlem)
        </button>
      )}
    </div>
  );
}

function Th({
  children,
  onClick,
  active,
}: {
  children: React.ReactNode;
  onClick?: () => void;
  active?: boolean;
}) {
  return (
    <th
      onClick={onClick}
      className={`px-3 py-2.5 text-[11px] font-mono uppercase tracking-wide whitespace-nowrap ${
        onClick ? "cursor-pointer hover:text-paper-200 select-none" : ""
      } ${active ? "text-paper-200" : "text-paper-500"}`}
    >
      {children}
    </th>
  );
}
