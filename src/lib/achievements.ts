export interface Achievement {
  id: string;
  label: string;
  desc: string;
  icon: string;
  earnedAt?: string;
  rarity?: "common" | "rare" | "epic";
}

export interface AchievementDef {
  id: string;
  label: string;
  desc: string;
  icon: string;
  rarity?: "common" | "rare" | "epic";
  condition: (
    stats: {
      totalTrades: number;
      winRate: number;
      avgRR: number;
      consistency: number;
      level: number;
      netResult: number;
    },
    trades: TradeLike[]
  ) => boolean;
}

export interface TradeLike {
  result: number;
  entryDate: string;
  netPnl: number;
  pair: string;
}

export const ACHIEVEMENT_DEFS: AchievementDef[] = [
  { id: "first_trade",    icon: "🎯", label: "achievements.first_trade.label",       desc: "achievements.first_trade.desc",                                   rarity: "common", condition: (s) => s.totalTrades >= 1 },
  { id: "ten_trades",     icon: "🔥", label: "achievements.ten_trades.label",        desc: "achievements.ten_trades.desc",                                    rarity: "common", condition: (s) => s.totalTrades >= 10 },
  { id: "fifty_trades",   icon: "⚡", label: "achievements.fifty_trades.label",       desc: "achievements.fifty_trades.desc",                                    rarity: "common", condition: (s) => s.totalTrades >= 50 },
  { id: "trades_100",     icon: "💎", label: "achievements.trades_100.label",         desc: "achievements.trades_100.desc",                                   rarity: "rare",   condition: (s) => s.totalTrades >= 100 },
  { id: "trades_500",     icon: "🏅", label: "achievements.trades_500.label",         desc: "achievements.trades_500.desc",                                   rarity: "epic",   condition: (s) => s.totalTrades >= 500 },
  {
    id: "win_streak_5",   icon: "🎲", label: "achievements.win_streak_5.label",       desc: "achievements.win_streak_5.desc",
    rarity: "rare", condition: (_, trades) => maxWinStreak(trades) >= 5,
  },
  {
    id: "win_streak_10",  icon: "🔥", label: "achievements.win_streak_10.label",      desc: "achievements.win_streak_10.desc",
    rarity: "epic", condition: (_, trades) => maxWinStreak(trades) >= 10,
  },
  { id: "rr_master",      icon: "📐", label: "achievements.rr_master.label",          desc: "achievements.rr_master.desc",                               rarity: "rare",   condition: (s) => s.avgRR >= 2 && s.totalTrades >= 10 },
  { id: "rr_legend",      icon: "🎯", label: "achievements.rr_legend.label",          desc: "achievements.rr_legend.desc",                               rarity: "epic",   condition: (s) => s.avgRR >= 3 && s.totalTrades >= 25 },
  { id: "win_rate_60",    icon: "📊", label: "achievements.win_rate_60.label",        desc: "achievements.win_rate_60.desc",                               rarity: "rare",   condition: (s) => s.winRate >= 60 && s.totalTrades >= 20 },
  { id: "win_rate_75",    icon: "🎯", label: "achievements.win_rate_75.label",        desc: "achievements.win_rate_75.desc",                               rarity: "epic",   condition: (s) => s.winRate >= 75 && s.totalTrades >= 20 },
  {
    id: "consistent",     icon: "📅", label: "achievements.consistent.label",         desc: "achievements.consistent.desc",
    rarity: "common", condition: (_, trades) => {
      const cutoff = new Date();
      cutoff.setDate(cutoff.getDate() - 30);
      return trades.filter((t) => new Date(t.entryDate) >= cutoff).length >= 20;
    },
  },
  { id: "profit_500",     icon: "💰", label: "achievements.profit_500.label",          desc: "achievements.profit_500.desc",                                   rarity: "rare",   condition: (s) => s.netResult >= 500 && s.totalTrades >= 10 },
  { id: "profit_5000",    icon: "💎", label: "achievements.profit_5000.label",         desc: "achievements.profit_5000.desc",                                 rarity: "epic",   condition: (s) => s.netResult >= 5000 && s.totalTrades >= 25 },
  { id: "level_5",        icon: "⭐", label: "achievements.level_5.label",             desc: "achievements.level_5.desc",                                     rarity: "rare",   condition: (s) => s.level >= 5 },
  { id: "level_10",       icon: "👑", label: "achievements.level_10.label",            desc: "achievements.level_10.desc",                              rarity: "epic",   condition: (s) => s.level >= 10 },
  {
    id: "comeback",       icon: "🔄", label: "achievements.comeback.label",            desc: "achievements.comeback.desc",
    rarity: "epic", condition: (_, trades) => {
      let maxLossStreak = 0;
      let currentLoss = 0;
      let recovered = false;
      for (const t of trades) {
        if (t.result < 0) {
          currentLoss++;
          if (currentLoss > maxLossStreak) maxLossStreak = currentLoss;
        } else if (t.result > 0 && maxLossStreak >= 3) {
          recovered = true;
          currentLoss = 0;
        } else {
          currentLoss = 0;
        }
      }
      return recovered;
    },
  },
  {
    id: "marathon",       icon: "🏃", label: "achievements.marathon.label",            desc: "achievements.marathon.desc",
    rarity: "rare", condition: (_, trades) => {
      if (trades.length < 20) return false;
      const dates = trades.map((t) => new Date(t.entryDate).getTime()).sort((a, b) => a - b);
      const first = dates[0];
      const last = dates[dates.length - 1];
      return last - first >= 180 * 24 * 60 * 60 * 1000;
    },
  },
  {
    id: "all_rounder",    icon: "🧠", label: "achievements.all_rounder.label",          desc: "achievements.all_rounder.desc",
    rarity: "rare", condition: (_, trades) => {
      const pairs = new Set(trades.map((t) => t.pair).filter(Boolean));
      return pairs.size >= 8;
    },
  },
  {
    id: "immortal",       icon: "🏆", label: "achievements.immortal.label",             desc: "achievements.immortal.desc",
    rarity: "epic", condition: (s) => s.totalTrades >= 200 && s.winRate >= 55 && s.avgRR >= 2,
  },
];

export function maxWinStreak(trades: TradeLike[]): number {
  let max = 0;
  let current = 0;
  for (const t of trades) {
    if (t.result > 0) {
      current++;
      if (current > max) max = current;
    } else {
      current = 0;
    }
  }
  return max;
}

export function checkEarned(
  defs: AchievementDef[],
  stats: { totalTrades: number; winRate: number; avgRR: number; consistency: number; level: number; netResult: number },
  trades: TradeLike[]
): string[] {
  return defs.filter((d) => d.condition(stats, trades)).map((d) => d.id);
}
