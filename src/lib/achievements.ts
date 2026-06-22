export interface Achievement {
  id: string;
  label: string;
  desc: string;
  icon: string;
  earnedAt?: string;
}

export interface AchievementDef {
  id: string;
  label: string;
  desc: string;
  icon: string;
  condition: (stats: { totalTrades: number; winRate: number; avgRR: number; consistency: number; level: number }, trades: TradeLike[]) => boolean;
}

interface TradeLike {
  result: number;
  entryDate: string;
}

export const ACHIEVEMENT_DEFS: AchievementDef[] = [
  { id: "first_trade",  icon: "🎯", label: "İlk Adım",       desc: "İlk işlemini ekledin",               condition: (s) => s.totalTrades >= 1 },
  { id: "ten_trades",   icon: "🔥", label: "Isınıyor",        desc: "10 işlem tamamladın",                condition: (s) => s.totalTrades >= 10 },
  { id: "fifty_trades", icon: "⚡", label: "Deneyimli",       desc: "50 işlem tamamladın",                condition: (s) => s.totalTrades >= 50 },
  { id: "trades_100",   icon: "💎", label: "Yüzlük",          desc: "100 işlem tamamladın",               condition: (s) => s.totalTrades >= 100 },
  {
    id: "win_streak_5", icon: "🎲", label: "Seri Yapıyor",    desc: "5 ardışık kârlı işlem",
    condition: (_, trades) => maxWinStreak(trades) >= 5,
  },
  { id: "rr_master",    icon: "📐", label: "R:R Ustası",      desc: "Ort. RR 2.0+ (min 10 tr)",           condition: (s) => s.avgRR >= 2 && s.totalTrades >= 10 },
  { id: "win_rate_60",  icon: "🎯", label: "Keskin Nişancı",  desc: "%60+ kazanma (min 20 tr)",           condition: (s) => s.winRate >= 60 && s.totalTrades >= 20 },
  {
    id: "consistent",   icon: "📅", label: "İstikrarlı",      desc: "30 günde 20+ işlem",
    condition: (_, trades) => {
      const cutoff = new Date();
      cutoff.setDate(cutoff.getDate() - 30);
      return trades.filter((t) => new Date(t.entryDate) >= cutoff).length >= 20;
    },
  },
  { id: "level_5",      icon: "⭐", label: "Uzman",           desc: "Seviye 5'e ulaştın",                  condition: (s) => s.level >= 5 },
  { id: "level_10",     icon: "👑", label: "Efsanevi",        desc: "Maksimum seviyeye ulaştın",           condition: (s) => s.level >= 10 },
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

export function checkEarned(defs: AchievementDef[], stats: { totalTrades: number; winRate: number; avgRR: number; consistency: number; level: number }, trades: TradeLike[]): string[] {
  return defs.filter((d) => d.condition(stats, trades)).map((d) => d.id);
}
