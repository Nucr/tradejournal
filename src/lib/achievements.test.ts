import { describe, it, expect } from "vitest";
import { checkEarned, maxWinStreak, ACHIEVEMENT_DEFS } from "./achievements";
import type { TradeLike } from "./achievements";

const baseStats = {
  totalTrades: 0,
  winRate: 0,
  avgRR: 0,
  consistency: 0,
  level: 1,
  netResult: 0,
};

const baseTrades: TradeLike[] = [];

describe("checkEarned", () => {
  it("awards first_trade when totalTrades >= 1", () => {
    const earned = checkEarned(ACHIEVEMENT_DEFS, { ...baseStats, totalTrades: 1 }, baseTrades);
    expect(earned).toContain("first_trade");
  });

  it("awards ten_trades when totalTrades >= 10", () => {
    const earned = checkEarned(ACHIEVEMENT_DEFS, { ...baseStats, totalTrades: 10 }, baseTrades);
    expect(earned).toContain("ten_trades");
  });

  it("does not award ten_trades when totalTrades < 10", () => {
    const earned = checkEarned(ACHIEVEMENT_DEFS, { ...baseStats, totalTrades: 9 }, baseTrades);
    expect(earned).not.toContain("ten_trades");
  });

  it("awards rr_master when avgRR >= 2 and totalTrades >= 10", () => {
    const earned = checkEarned(ACHIEVEMENT_DEFS, { ...baseStats, avgRR: 2, totalTrades: 10 }, baseTrades);
    expect(earned).toContain("rr_master");
  });

  it("does not award rr_master when trades < 10", () => {
    const earned = checkEarned(ACHIEVEMENT_DEFS, { ...baseStats, avgRR: 2, totalTrades: 5 }, baseTrades);
    expect(earned).not.toContain("rr_master");
  });

  it("awards win_rate_60 when winRate >= 60 and totalTrades >= 20", () => {
    const earned = checkEarned(ACHIEVEMENT_DEFS, { ...baseStats, winRate: 65, totalTrades: 20 }, baseTrades);
    expect(earned).toContain("win_rate_60");
  });

  it("awards level_5 when level >= 5", () => {
    const earned = checkEarned(ACHIEVEMENT_DEFS, { ...baseStats, level: 5 }, baseTrades);
    expect(earned).toContain("level_5");
  });

  it("awards level_10 when level >= 10", () => {
    const earned = checkEarned(ACHIEVEMENT_DEFS, { ...baseStats, level: 10 }, baseTrades);
    expect(earned).toContain("level_10");
  });

  it("awards profit_500 when netResult >= 500 and totalTrades >= 10", () => {
    const earned = checkEarned(ACHIEVEMENT_DEFS, { ...baseStats, netResult: 500, totalTrades: 10 }, baseTrades);
    expect(earned).toContain("profit_500");
  });

  it("awards win_streak_5 when max win streak >= 5", () => {
    const trades = [
      { result: 10, netPnl: 0, entryDate: "2024-01-01", pair: "BTC" },
      { result: 10, netPnl: 0, entryDate: "2024-01-02", pair: "BTC" },
      { result: 10, netPnl: 0, entryDate: "2024-01-03", pair: "BTC" },
      { result: 10, netPnl: 0, entryDate: "2024-01-04", pair: "BTC" },
      { result: 10, netPnl: 0, entryDate: "2024-01-05", pair: "BTC" },
    ];
    const earned = checkEarned(ACHIEVEMENT_DEFS, baseStats, trades);
    expect(earned).toContain("win_streak_5");
  });

  it("awards all_rounder when 8+ different pairs", () => {
    const pairs = ["BTC", "ETH", "SOL", "ADA", "DOT", "LINK", "AVAX", "MATIC", "ATOM"];
    const trades = pairs.map((pair, i) => ({
      result: 10, netPnl: 0, entryDate: `2024-01-${String(i + 1).padStart(2, "0")}`, pair,
    }));
    const earned = checkEarned(ACHIEVEMENT_DEFS, baseStats, trades);
    expect(earned).toContain("all_rounder");
  });

  it("awards immortal when totalTrades >= 200, winRate >= 55, avgRR >= 2", () => {
    const earned = checkEarned(ACHIEVEMENT_DEFS, { ...baseStats, totalTrades: 200, winRate: 55, avgRR: 2 }, baseTrades);
    expect(earned).toContain("immortal");
  });

  it("does not award immortal when conditions not met", () => {
    const earned = checkEarned(ACHIEVEMENT_DEFS, { ...baseStats, totalTrades: 199, winRate: 55, avgRR: 2 }, baseTrades);
    expect(earned).not.toContain("immortal");
  });

  it("awards marathon when active for 6+ months with 20+ trades", () => {
    const trades = Array.from({ length: 20 }, (_, i) => ({
      result: 10, netPnl: 0,
      entryDate: new Date(2024, 0, 1 + i * 10).toISOString(),
      pair: "BTC",
    }));
    const earned = checkEarned(ACHIEVEMENT_DEFS, { ...baseStats, totalTrades: 20 }, trades);
    expect(earned).toContain("marathon");
  });
});

describe("maxWinStreak", () => {
  it("returns 0 for empty array", () => {
    expect(maxWinStreak([])).toBe(0);
  });

  it("counts consecutive wins", () => {
    const trades = [
      { result: 10, netPnl: 0, entryDate: "2024-01-01", pair: "BTC" },
      { result: 10, netPnl: 0, entryDate: "2024-01-02", pair: "BTC" },
      { result: -5, netPnl: 0, entryDate: "2024-01-03", pair: "BTC" },
      { result: 10, netPnl: 0, entryDate: "2024-01-04", pair: "BTC" },
      { result: 10, netPnl: 0, entryDate: "2024-01-05", pair: "BTC" },
      { result: 10, netPnl: 0, entryDate: "2024-01-06", pair: "BTC" },
    ];
    expect(maxWinStreak(trades)).toBe(3);
  });

  it("resets on loss", () => {
    const trades = [
      { result: 10, netPnl: 0, entryDate: "2024-01-01", pair: "BTC" },
      { result: -5, netPnl: 0, entryDate: "2024-01-02", pair: "BTC" },
      { result: 10, netPnl: 0, entryDate: "2024-01-03", pair: "BTC" },
    ];
    expect(maxWinStreak(trades)).toBe(1);
  });
});
