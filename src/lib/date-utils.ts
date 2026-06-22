import {
  startOfDay,
  endOfDay,
  startOfWeek,
  endOfWeek,
  startOfMonth,
  endOfMonth,
  startOfYear,
  endOfYear,
  isWithinInterval,
  parseISO,
} from "date-fns";
import { DirectionFilter, RangeKey, ResultFilter, Trade } from "./types";

export function getRangeBounds(
  range: RangeKey,
  reference: Date = new Date(),
  customStart?: string,
  customEnd?: string
): { start: Date; end: Date } | null {
  switch (range) {
    case "day":
      return { start: startOfDay(reference), end: endOfDay(reference) };
    case "week":
      return {
        start: startOfWeek(reference, { weekStartsOn: 1 }),
        end: endOfWeek(reference, { weekStartsOn: 1 }),
      };
    case "month":
      return { start: startOfMonth(reference), end: endOfMonth(reference) };
    case "year":
      return { start: startOfYear(reference), end: endOfYear(reference) };
    case "custom":
      if (!customStart || !customEnd) return null;
      return {
        start: startOfDay(parseISO(customStart)),
        end: endOfDay(parseISO(customEnd)),
      };
    case "all":
    default:
      return null;
  }
}

export function filterTradesByRange(
  trades: Trade[],
  range: RangeKey,
  reference: Date = new Date(),
  customStart?: string,
  customEnd?: string
): Trade[] {
  if (range === "all") return trades;
  const bounds = getRangeBounds(range, reference, customStart, customEnd);
  if (!bounds) return trades;
  return trades.filter((t) =>
    isWithinInterval(parseISO(t.entryDate), { start: bounds.start, end: bounds.end })
  );
}

export function filterTrades(
  trades: Trade[],
  filters: {
    result: ResultFilter;
    direction: DirectionFilter;
    range: RangeKey;
    customStart: string;
    customEnd: string;
  }
): Trade[] {
  return trades.filter((t) => {
    if (filters.result === "profit" && t.result <= 0) return false;
    if (filters.result === "loss" && t.result >= 0) return false;
    if (filters.result === "be" && t.result !== 0) return false;
    if (filters.direction !== "all" && t.direction !== filters.direction) return false;
    return true;
  }).filter((t) => {
    if (filters.range === "all") return true;
    const bounds = getRangeBounds(filters.range, new Date(), filters.customStart, filters.customEnd);
    if (!bounds) return true;
    return isWithinInterval(parseISO(t.entryDate), { start: bounds.start, end: bounds.end });
  });
}

export interface TradeStats {
  total: number;
  wins: number;
  losses: number;
  breakeven: number;
  winRate: number;
  totalRR: number;
  avgRR: number;
  totalResult: number;
  totalNetPnl: number;
  bestTrade: Trade | null;
  worstTrade: Trade | null;
  currentWinStreak: number;
  currentLoseStreak: number;
  maxWinStreak: number;
  maxLoseStreak: number;
}

export function computeStats(trades: Trade[]): TradeStats {
  const wins = trades.filter((t) => t.direction !== "be" && t.result > 0);
  const losses = trades.filter((t) => t.direction !== "be" && t.result < 0);
  const breakeven = trades.filter((t) => t.direction === "be" || t.result === 0);

  const decided = wins.length + losses.length;
  const winRate = decided > 0 ? (wins.length / decided) * 100 : 0;

  const totalRR = trades.reduce((sum, t) => sum + (t.result > 0 ? t.rr : t.result < 0 ? -t.rr : 0), 0);
  const totalResult = trades.reduce((sum, t) => sum + t.result, 0);
  const totalNetPnl = trades.reduce((sum, t) => sum + (t.netPnl ?? 0), 0);

  let bestTrade: Trade | null = null;
  let worstTrade: Trade | null = null;
  for (const t of trades) {
    if (!bestTrade || t.result > bestTrade.result) bestTrade = t;
    if (!worstTrade || t.result < worstTrade.result) worstTrade = t;
  }

  // Streak hesapla (tarihe göre sıralı)
  const sorted = [...trades].sort(
    (a, b) => parseISO(a.entryDate).getTime() - parseISO(b.entryDate).getTime()
  );

  let currentWinStreak = 0;
  let currentLoseStreak = 0;
  let maxWinStreak = 0;
  let maxLoseStreak = 0;
  let tempWin = 0;
  let tempLose = 0;

  for (const t of sorted) {
    if (t.result > 0) {
      tempWin++;
      tempLose = 0;
      if (tempWin > maxWinStreak) maxWinStreak = tempWin;
    } else if (t.result < 0) {
      tempLose++;
      tempWin = 0;
      if (tempLose > maxLoseStreak) maxLoseStreak = tempLose;
    }
  }

  // Son seri
  let lastWin = 0;
  let lastLose = 0;
  for (let i = sorted.length - 1; i >= 0; i--) {
    const t = sorted[i];
    if (t.result > 0) {
      if (lastLose > 0) break;
      lastWin++;
    } else if (t.result < 0) {
      if (lastWin > 0) break;
      lastLose++;
    } else break;
  }
  currentWinStreak = lastWin;
  currentLoseStreak = lastLose;

  return {
    total: trades.length,
    wins: wins.length,
    losses: losses.length,
    breakeven: breakeven.length,
    winRate,
    totalRR,
    avgRR: trades.length ? totalRR / trades.length : 0,
    totalResult,
    totalNetPnl,
    bestTrade,
    worstTrade,
    currentWinStreak,
    currentLoseStreak,
    maxWinStreak,
    maxLoseStreak,
  };
}
