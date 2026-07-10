import { describe, it, expect } from "vitest";
import { calculateStats, calculateScore, getLevel, getRank } from "./score-engine";
import type { Trade } from "./types";

function makeTrade(overrides: Partial<Trade> = {}): Trade {
  return {
    id: "1",
    pair: "BTCUSD",
    direction: "long",
    entryDate: "2024-01-01",
    exitDate: "2024-01-02",
    rr: 2,
    result: 10,
    netPnl: 100,
    strategy: "test",
    note: "",
    screenshotUrl: "",
    createdAt: "2024-01-01T00:00:00.000Z",
    deletedAt: null,
    likeCount: 0,
    ...overrides,
  };
}

describe("calculateStats", () => {
  it("returns zeros for empty trades", () => {
    const stats = calculateStats([]);
    expect(stats).toEqual({
      totalTrades: 0,
      winRate: 0,
      avgRR: 0,
      netResult: 0,
      consistency: 0,
    });
  });

  it("calculates win rate correctly", () => {
    const trades = [
      makeTrade({ result: 10 }),
      makeTrade({ result: 20 }),
      makeTrade({ result: -5 }),
      makeTrade({ result: -3 }),
    ];
    const stats = calculateStats(trades);
    expect(stats.totalTrades).toBe(4);
    expect(stats.winRate).toBe(50);
    expect(stats.netResult).toBe(22);
  });

  it("calculates average RR correctly", () => {
    const trades = [
      makeTrade({ rr: 2 }),
      makeTrade({ rr: 3 }),
      makeTrade({ rr: 1 }),
    ];
    const stats = calculateStats(trades);
    expect(stats.avgRR).toBe(2);
  });

  it("computes consistency as trades in last 30 days", () => {
    const recent = new Date();
    const old = new Date();
    old.setDate(old.getDate() - 60);

    const trades = [
      makeTrade({ entryDate: recent.toISOString() }),
      makeTrade({ entryDate: recent.toISOString() }),
      makeTrade({ entryDate: old.toISOString() }),
    ];
    const stats = calculateStats(trades);
    expect(stats.consistency).toBe(2);
  });
});

describe("calculateScore", () => {
  it("returns 0 for empty trades", () => {
    expect(calculateScore([])).toBe(0);
  });

  it("returns higher score for profitable trades with good RR", () => {
    const good = [
      makeTrade({ result: 50, rr: 3 }),
      makeTrade({ result: 30, rr: 2.5 }),
      makeTrade({ result: 40, rr: 3.5 }),
    ];
    const bad = [
      makeTrade({ result: -10, rr: 1 }),
      makeTrade({ result: -20, rr: 0.5 }),
      makeTrade({ result: -15, rr: 0.8 }),
    ];
    expect(calculateScore(good)).toBeGreaterThan(calculateScore(bad));
  });

  it("score is between 0 and 100", () => {
    const trades = Array.from({ length: 20 }, (_, i) =>
      makeTrade({ result: i % 2 === 0 ? 10 : -5, rr: 2 })
    );
    const score = calculateScore(trades);
    expect(score).toBeGreaterThanOrEqual(0);
    expect(score).toBeLessThanOrEqual(100);
  });
});

describe("getLevel and getRank", () => {
  it("returns level 1 and Çaylak for score 0", () => {
    expect(getLevel(0)).toBe(1);
    expect(getRank(0)).toBe("Çaylak");
  });

  it("returns level 10 and Efsanevi for score 100", () => {
    expect(getLevel(100)).toBe(10);
    expect(getRank(100)).toBe("Efsanevi");
  });

  it("increases level with score", () => {
    expect(getLevel(5)).toBe(1);
    expect(getLevel(15)).toBe(2);
    expect(getLevel(25)).toBe(3);
    expect(getLevel(45)).toBe(5);
    expect(getLevel(85)).toBe(9);
  });
});
