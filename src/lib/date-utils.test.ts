import { describe, it, expect } from "vitest";
import { getRangeBounds, filterTrades, computeStats } from "./date-utils";
import type { Trade } from "./types";

function makeTrade(overrides: Partial<Trade> = {}): Trade {
  return {
    id: "1",
    pair: "BTCUSD",
    direction: "long",
    entryDate: "2024-06-15",
    exitDate: "2024-06-16",
    rr: 2,
    result: 10,
    netPnl: 100,
    strategy: "",
    note: "",
    screenshotUrl: "",
    createdAt: "2024-06-15T00:00:00.000Z",
    deletedAt: null,
    likeCount: 0,
    ...overrides,
  };
}

describe("getRangeBounds", () => {
  const ref = new Date("2024-06-15T12:00:00Z");

  it("returns day bounds", () => {
    const bounds = getRangeBounds("day", ref);
    expect(bounds).not.toBeNull();
    expect(bounds!.start.getFullYear()).toBe(2024);
    expect(bounds!.start.getMonth()).toBe(5); // June
    expect(bounds!.start.getDate()).toBe(15);
    expect(bounds!.start.getHours()).toBe(0);
    expect(bounds!.start.getMinutes()).toBe(0);
  });

  it("returns null for all", () => {
    expect(getRangeBounds("all", ref)).toBeNull();
  });

  it("returns bounds for custom range", () => {
    const bounds = getRangeBounds("custom", ref, "2024-01-01", "2024-01-31");
    expect(bounds).not.toBeNull();
    expect(bounds!.start.getFullYear()).toBe(2024);
    expect(bounds!.start.getMonth()).toBe(0); // January
    expect(bounds!.start.getDate()).toBe(1);
    expect(bounds!.start.getHours()).toBe(0);
    expect(bounds!.start.getMinutes()).toBe(0);
  });

  it("returns null for custom without dates", () => {
    expect(getRangeBounds("custom", ref)).toBeNull();
  });
});

describe("filterTrades", () => {
  const trades = [
    makeTrade({ entryDate: "2024-06-10", result: 10, direction: "long" }),
    makeTrade({ entryDate: "2024-06-15", result: -5, direction: "short" }),
    makeTrade({ entryDate: "2024-06-20", result: 0, direction: "be" }),
  ];

  const allFilter = { result: "all" as const, direction: "all" as const, range: "all" as const, customStart: "", customEnd: "" };

  it("filters by profit/loss", () => {
    expect(filterTrades(trades, { ...allFilter, result: "profit" })).toHaveLength(1);
    expect(filterTrades(trades, { ...allFilter, result: "loss" })).toHaveLength(1);
    expect(filterTrades(trades, { ...allFilter, result: "be" })).toHaveLength(1);
  });

  it("filters by direction", () => {
    expect(filterTrades(trades, { ...allFilter, direction: "long" })).toHaveLength(1);
    expect(filterTrades(trades, { ...allFilter, direction: "short" })).toHaveLength(1);
    expect(filterTrades(trades, { ...allFilter, direction: "be" })).toHaveLength(1);
  });

  it("returns all when range is all", () => {
    expect(filterTrades(trades, allFilter)).toHaveLength(3);
  });
});

describe("computeStats", () => {
  it("computes basic stats correctly", () => {
    const trades = [
      makeTrade({ result: 100, rr: 3, netPnl: 200, direction: "long", entryDate: "2024-01-01" }),
      makeTrade({ result: -50, rr: 2, netPnl: -100, direction: "short", entryDate: "2024-01-02" }),
      makeTrade({ result: 25, rr: 1.5, netPnl: 50, direction: "long", entryDate: "2024-01-03" }),
    ];

    const stats = computeStats(trades);
    expect(stats.total).toBe(3);
    expect(stats.wins).toBe(2);
    expect(stats.losses).toBe(1);
    expect(stats.winRate).toBeCloseTo(66.67, 1);
    expect(stats.totalNetPnl).toBe(150);
    expect(stats.avgRR).toBeCloseTo(2.17, 1);
  });

  it("finds best and worst trade", () => {
    const best = makeTrade({ result: 100, netPnl: 200 });
    const worst = makeTrade({ result: -50, netPnl: -100 });
    const trades = [worst, best, makeTrade({ result: 25 })];

    const stats = computeStats(trades);
    expect(stats.bestTrade!.result).toBe(100);
    expect(stats.worstTrade!.result).toBe(-50);
  });

  it("calculates streaks correctly", () => {
    const trades = [
      makeTrade({ result: 10, entryDate: "2024-01-01" }),
      makeTrade({ result: 15, entryDate: "2024-01-02" }),
      makeTrade({ result: -5, entryDate: "2024-01-03" }),
      makeTrade({ result: 20, entryDate: "2024-01-04" }),
      makeTrade({ result: 10, entryDate: "2024-01-05" }),
      makeTrade({ result: 5, entryDate: "2024-01-06" }),
    ];

    const stats = computeStats(trades);
    expect(stats.maxWinStreak).toBe(3);
    expect(stats.currentWinStreak).toBe(3);
    expect(stats.maxLoseStreak).toBe(1);
    expect(stats.currentLoseStreak).toBe(0);
  });

  it("returns empty stats for empty trades", () => {
    const stats = computeStats([]);
    expect(stats.total).toBe(0);
    expect(stats.winRate).toBe(0);
    expect(stats.bestTrade).toBeNull();
    expect(stats.worstTrade).toBeNull();
  });
});
