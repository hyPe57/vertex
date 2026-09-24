// ─── Core Types ───

export type Theme = "dark" | "light";
export type CurrencyDisplay = "usd" | "percent";
export type Direction = "long" | "short";
export type TradeStatus = "open" | "closed" | "cancelled";
export type Platform = "mt4" | "mt5" | "ctrader" | "tradelocker" | "topstepx";
export type SyncStatus = "connected" | "disconnected" | "syncing" | "error";
export type Impact = "high" | "medium" | "low";
export type Session = "asian" | "london" | "new_york" | "overlap";
export type Timeframe = "1m" | "5m" | "15m" | "30m" | "1h" | "4h" | "1d";
export type CalendarView = "week" | "month" | "year";

// ─── User ───

export interface User {
  id: string;
  email: string;
  displayName: string;
  avatarUrl?: string;
  theme: Theme;
  currencyDisplay: CurrencyDisplay;
  lastTradedAsset?: string;
}

// ─── Port (Trading Account) ───

export interface Port {
  id: string;
  name: string;
  platform: Platform;
  initialBalance: number;
  currentBalance: number;
  syncStatus: SyncStatus;
  isActive: boolean;
  lastSyncedAt?: string;
  accountNumber?: string;
  brokerServer?: string;
}

// ─── Trade ───

export interface Trade {
  id: string;
  portId: string;
  asset: string;
  direction: Direction;
  lotSize: number;
  entryPrice: number;
  exitPrice?: number;
  stopLoss: number;
  takeProfit: number;
  riskReward: number;
  pnl: number;
  pnlPercent: number;
  commission: number;
  swap: number;
  emotionLevel: number;
  notes?: string;
  session: Session;
  status: TradeStatus;
  isBacktest: boolean;
  tags: string[];
  images: TradeImage[];
  openTime: string;
  closeTime?: string;
}

// ─── Trade Image ───

export interface TradeImage {
  id: string;
  imageUrl: string;
  thumbnailUrl: string;
  caption?: string;
}

// ─── Tag ───

export interface Tag {
  id: string;
  name: string;
  color: string;
}

// ─── Daily Stats ───

export interface DailyStats {
  date: string;
  netPnl: number;
  netPnlPercent: number;
  tradeCount: number;
  wins: number;
  losses: number;
  profitFactor: number;
  avgRR: number;
  maxDrawdown: number;
}

// ─── Aggregate Stats ───

export interface AggregateStats {
  netPnl: number;
  netPnlPercent: number;
  winRate: number;
  profitFactor: number;
  avgRR: number;
  maxDrawdown: number;
  totalTrades: number;
  wins: number;
  losses: number;
  bestDay: number;
  worstDay: number;
  avgDailyPnl: number;
  consecutiveWins: number;
  consecutiveLosses: number;
}

// ─── Backtest Session ───

export interface BacktestSession {
  id: string;
  name: string;
  asset: string;
  timeframe: Timeframe;
  spread: number;
  lotSize: number;
  startingBalance: number;
  endingBalance: number;
  totalTrades: number;
  notes?: string;
  createdAt: string;
}

// ─── Economic Event ───

export interface EconomicEvent {
  id: string;
  title: string;
  currency: string;
  impact: Impact;
  forecast?: string;
  previous?: string;
  actual?: string;
  eventTime: string;
}

// ─── AI ───

export interface AIMessage {
  id: string;
  role: "user" | "assistant" | "system";
  content: string;
  createdAt: string;
}

export interface AIConversation {
  id: string;
  title: string;
  messages: AIMessage[];
  createdAt: string;
}

// ─── Equity Point ───

export interface EquityPoint {
  date: string;
  balance: number;
  equity: number;
}

// ─── Session Performance ───

export interface SessionPerformance {
  session: string;
  trades: number;
  winRate: number;
  pnl: number;
  avgRR: number;
}

// ─── Emotion Stats ───

export interface EmotionStat {
  level: number;
  label: string;
  trades: number;
  winRate: number;
  avgPnl: number;
}
