"use client";

type RankTier = 1 | 2 | 3 | 4 | 5;

interface RankConfig {
  bg: string;
  text: string;
  border: string;
  icon: string;
  animation: string;
}

const RANKS: Record<string, { tier: RankTier; icon: string }> = {
  "Çaylak": { tier: 1, icon: "🌱" },
  "Acemi": { tier: 1, icon: "🪴" },
  "Gelişen": { tier: 2, icon: "🌿" },
  "Deneyimli": { tier: 2, icon: "⚔️" },
  "Uzman": { tier: 3, icon: "🎯" },
  "İleri": { tier: 3, icon: "🔥" },
  "Usta": { tier: 4, icon: "👑" },
  "Elit": { tier: 4, icon: "💎" },
  "Efsane": { tier: 5, icon: "🌟" },
  "Efsanevi": { tier: 5, icon: "✨" },
};

const TIERS: Record<RankTier, RankConfig> = {
  1: {
    bg: "bg-gradient-to-r from-[#5c4a2a] to-[#7a623d]",
    text: "text-amber-100",
    border: "border-[#8b7a4a]/50",
    icon: "🌱",
    animation: "",
  },
  2: {
    bg: "bg-gradient-to-r from-[#1a4a2a] to-[#2d6a3a]",
    text: "text-green-200",
    border: "border-emerald-600/50",
    icon: "🌿",
    animation: "animate-rank-float",
  },
  3: {
    bg: "bg-gradient-to-r from-[#1a3a4a] to-[#2a5a6a]",
    text: "text-cyan-200",
    border: "border-cyan-500/50",
    icon: "🎯",
    animation: "animate-rank-float",
  },
  4: {
    bg: "bg-gradient-to-r from-[#3a1a4a] to-[#5a2a7a]",
    text: "text-purple-200",
    border: "border-purple-500/50",
    icon: "👑",
    animation: "animate-rank-float animate-rank-glow",
  },
  5: {
    bg: "bg-gradient-to-r from-[#4a2a1a] via-[#7a4a2a] to-[#5a2a1a]",
    text: "text-amber-200",
    border: "border-amber-500/70",
    icon: "⭐",
    animation: "animate-rank-float animate-rank-glow animate-rank-shimmer",
  },
};

interface RankBadgeProps {
  rank: string;
  size?: "sm" | "md" | "lg";
  showIcon?: boolean;
}

export default function RankBadge({
  rank,
  size = "sm",
  showIcon = true,
}: RankBadgeProps) {
  const config = RANKS[rank] ?? RANKS["Çaylak"];
  const tier = TIERS[config.tier] ?? TIERS[1];
  const icon = showIcon ? config.icon : null;

  const sizeClasses = {
    sm: "text-[10px] px-2 py-0.5 gap-1",
    md: "text-xs px-2.5 py-1 gap-1.5",
    lg: "text-sm px-3 py-1.5 gap-2",
  };

  return (
    <span
      className={`
        inline-flex items-center rounded-full border font-mono font-semibold
        tracking-wide uppercase select-none
        ${tier.bg} ${tier.text} ${tier.border}
        ${sizeClasses[size]}
        ${tier.animation}
      `}
    >
      {icon && <span className="inline-block">{icon}</span>}
      {rank}
    </span>
  );
}
