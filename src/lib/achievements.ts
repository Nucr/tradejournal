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
  { id: "first_trade",    icon: "🎯", label: "İlk Adım",       desc: "İlk işlemini ekledin",                                   rarity: "common", condition: (s) => s.totalTrades >= 1 },
  { id: "ten_trades",     icon: "🔥", label: "Isınıyor",        desc: "10 işlem tamamladın",                                    rarity: "common", condition: (s) => s.totalTrades >= 10 },
  { id: "fifty_trades",   icon: "⚡", label: "Deneyimli",       desc: "50 işlem tamamladın",                                    rarity: "common", condition: (s) => s.totalTrades >= 50 },
  { id: "trades_100",     icon: "💎", label: "Yüzlük",          desc: "100 işlem tamamladın",                                   rarity: "rare",   condition: (s) => s.totalTrades >= 100 },
  { id: "trades_500",     icon: "🏅", label: "Efsanevi Sayı",   desc: "500 işlem tamamladın",                                   rarity: "epic",   condition: (s) => s.totalTrades >= 500 },
  {
    id: "win_streak_5",   icon: "🎲", label: "Seri Yapıyor",    desc: "5 ardışık kârlı işlem",
    rarity: "rare", condition: (_, trades) => maxWinStreak(trades) >= 5,
  },
  {
    id: "win_streak_10",  icon: "🔥", label: "Ateş Serisi",     desc: "10 ardışık kârlı işlem",
    rarity: "epic", condition: (_, trades) => maxWinStreak(trades) >= 10,
  },
  { id: "rr_master",      icon: "📐", label: "R:R Ustası",      desc: "Ort. RR 2.0+ (min 10 tr)",                               rarity: "rare",   condition: (s) => s.avgRR >= 2 && s.totalTrades >= 10 },
  { id: "rr_legend",      icon: "🎯", label: "R:R Efsanesi",    desc: "Ort. RR 3.0+ (min 25 tr)",                               rarity: "epic",   condition: (s) => s.avgRR >= 3 && s.totalTrades >= 25 },
  { id: "win_rate_60",    icon: "📊", label: "Keskin Nişancı",  desc: "%60+ kazanma (min 20 tr)",                               rarity: "rare",   condition: (s) => s.winRate >= 60 && s.totalTrades >= 20 },
  { id: "win_rate_75",    icon: "🎯", label: "Suikastçı",       desc: "%75+ kazanma (min 20 tr)",                               rarity: "epic",   condition: (s) => s.winRate >= 75 && s.totalTrades >= 20 },
  {
    id: "consistent",     icon: "📅", label: "İstikrarlı",      desc: "30 günde 20+ işlem",
    rarity: "common", condition: (_, trades) => {
      const cutoff = new Date();
      cutoff.setDate(cutoff.getDate() - 30);
      return trades.filter((t) => new Date(t.entryDate) >= cutoff).length >= 20;
    },
  },
  { id: "profit_500",     icon: "💰", label: "Kârda",           desc: "Toplam $500+ net kâr",                                   rarity: "rare",   condition: (s) => s.netResult >= 500 && s.totalTrades >= 10 },
  { id: "profit_5000",    icon: "💎", label: "Kâr Krallığı",    desc: "Toplam $5.000+ net kâr",                                 rarity: "epic",   condition: (s) => s.netResult >= 5000 && s.totalTrades >= 25 },
  { id: "level_5",        icon: "⭐", label: "Uzman",           desc: "Seviye 5'e ulaştın",                                     rarity: "rare",   condition: (s) => s.level >= 5 },
  { id: "level_10",       icon: "👑", label: "Efsanevi",        desc: "Maksimum seviyeye ulaştın",                              rarity: "epic",   condition: (s) => s.level >= 10 },
  {
    id: "comeback",       icon: "🔄", label: "Diriliş",         desc: "3+ ardışık zarardan dönüş",
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
    id: "marathon",       icon: "🏃", label: "Maraton",         desc: "En az 6 aydır aktif trade",
    rarity: "rare", condition: (_, trades) => {
      if (trades.length < 20) return false;
      const dates = trades.map((t) => new Date(t.entryDate).getTime()).sort((a, b) => a - b);
      const first = dates[0];
      const last = dates[dates.length - 1];
      return last - first >= 180 * 24 * 60 * 60 * 1000;
    },
  },
  {
    id: "all_rounder",    icon: "🧠", label: "Çok Yönlü",       desc: "8+ farklı paritede işlem",
    rarity: "rare", condition: (_, trades) => {
      const pairs = new Set(trades.map((t) => t.pair).filter(Boolean));
      return pairs.size >= 8;
    },
  },
  {
    id: "immortal",       icon: "🏆", label: "Ölümsüz",         desc: "200+ trade, %55+ WR, 2.0+ RR",
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
