export type TradeDirection = "long" | "short" | "be";

export interface Trade {
  id: string;
  pair: string;
  direction: TradeDirection;
  entryDate: string;
  exitDate: string;
  rr: number;
  result: number;
  netPnl: number;
  strategy: string;
  note: string;
  screenshotUrl: string;
  createdAt: string;
  deletedAt?: string | null;
  isShared?: boolean;
}

export type TradeInput = Omit<Trade, "id" | "createdAt">;

export type RangeKey = "day" | "week" | "month" | "year" | "custom" | "all";

export type ResultFilter = "all" | "profit" | "loss" | "be";

export type DirectionFilter = "all" | "long" | "short" | "be";

// --- Users / Profile ---

export type Rank =
  | "Çaylak"
  | "Acemi"
  | "Gelişen"
  | "Deneyimli"
  | "Uzman"
  | "İleri"
  | "Usta"
  | "Elit"
  | "Efsane"
  | "Efsanevi";

export interface UserStats {
  totalTrades: number;
  winRate: number;
  avgRR: number;
  netResult: number;
  consistency: number;
}

export interface UserProfile {
  displayName: string;
  avatarUrl?: string;
  avatarColor: string;
  level: number;
  rank: Rank;
  score: number;
  isPublic: boolean;
  showStrategy: boolean;
  showLeaderboard: boolean;
  showTrades: boolean;
  showAchievements: boolean;
  showStats: boolean;
  stats: UserStats;
  achievements?: string[];
  role?: "user" | "admin";
  updatedAt: Date;
}

// --- Strategies ---

export interface Strategy {
  id: string;
  name: string;
  createdBy: string;
  createdAt: Date;
  isPublic: boolean;
  images: string[];
  note: string;
}

export type StrategyInput = Omit<Strategy, "id" | "createdAt">;

// --- Leaderboard ---

export type LeaderboardPeriod = "weekly" | "monthly" | "alltime";

export interface LeaderboardEntry {
  displayName: string;
  avatarUrl: string;
  avatarColor: string;
  score: number;
  level: number;
  rank: string;
  winRate: number;
  avgRR: number;
  netResult: number;
  totalTrades: number;
  topStrategy?: string;
  period: LeaderboardPeriod;
  isPublic: boolean;
  showStrategy: boolean;
  updatedAt: Date;
}

// --- Conversations / Messaging ---

export type ConversationType = "direct" | "group" | "community";
export type GroupType = "open" | "closed";

export interface LastMessage {
  text: string;
  senderId: string;
  senderName: string;
  createdAt: Date;
}

export interface Conversation {
  id: string;
  type: ConversationType;
  name?: string;
  description?: string;
  groupType?: GroupType;
  ownerId?: string;
  participants: string[];
  invitedUsers?: string[];
  createdBy: string;
  lastMessage?: LastMessage;
  createdAt: Date;
  updatedAt: Date;
}

export interface Message {
  id: string;
  senderId: string;
  senderName: string;
  text: string;
  createdAt: Date;
}

export interface UnreadCount {
  conversationId: string;
  count: number;
}

// --- User search result ---

export interface UserSearchResult {
  uid: string;
  displayName: string;
  avatarUrl?: string;
  avatarColor: string;
  level: number;
  rank: Rank;
  score: number;
}
