import { create } from "zustand";

export interface Candle {
  time: string;
  open: number;
  high: number;
  low: number;
  close: number;
  volume: number;
}

export interface BacktestPosition {
  id: string;
  asset: string;
  direction: "buy" | "sell";
  lotSize: number;
  entryPrice: number;
  currentPrice: number;
  slPrice?: number;
  tpPrice?: number;
  entryTime: string;
  pnl: number;
  pnlPercent: number;
}

export interface BacktestTrade {
  id: string;
  asset: string;
  direction: "buy" | "sell";
  lotSize: number;
  entryPrice: number;
  exitPrice: number;
  entryTime: string;
  exitTime: string;
  pnl: number;
  pnlPercent: number;
  riskReward: number;
}

export interface BacktestSessionRecord {
  id: string;
  name: string;
  asset: string;
  timeframe: string;
  startingBalance: number;
  endingBalance: number;
  totalTrades: number;
  winRate: number;
  netPnl: number;
  date: string;
}

// Generate realistic candle data for different assets
function generateInitialCandles(asset: string, count = 120): Candle[] {
  let basePrice = 2350.0; // XAUUSD
  let volatility = 1.8;

  if (asset === "EURUSD") {
    basePrice = 1.085;
    volatility = 0.0008;
  } else if (asset === "BTCUSD") {
    basePrice = 64200.0;
    volatility = 180.0;
  } else if (asset === "NAS100") {
    basePrice = 18250.0;
    volatility = 22.0;
  }

  const candles: Candle[] = [];
  let currentClose = basePrice;
  const now = new Date();

  for (let i = count; i >= 0; i--) {
    const time = new Date(now.getTime() - i * 15 * 60 * 1000);
    const change = (Math.random() - 0.49) * volatility;
    const open = currentClose;
    const close = Math.max(open + change, basePrice * 0.5);
    const high = Math.max(open, close) + Math.random() * volatility * 0.6;
    const low = Math.min(open, close) - Math.random() * volatility * 0.6;
    const volume = Math.floor(Math.random() * 500) + 100;

    candles.push({
      time: time.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
      open: Number(open.toFixed(asset === "EURUSD" ? 4 : 2)),
      high: Number(high.toFixed(asset === "EURUSD" ? 4 : 2)),
      low: Number(low.toFixed(asset === "EURUSD" ? 4 : 2)),
      close: Number(close.toFixed(asset === "EURUSD" ? 4 : 2)),
      volume,
    });
    currentClose = close;
  }

  return candles;
}

interface BacktestState {
  asset: string;
  timeframe: string;
  startingBalance: number;
  balance: number;
  equity: number;
  candles: Candle[];
  visibleIndex: number; // how many candles are currently revealed
  isPlaying: boolean;
  playSpeed: number; // 1x, 2x, 5x
  lotSize: number;
  spread: number;
  slPips: string;
  tpPips: string;
  activePosition: BacktestPosition | null;
  closedTrades: BacktestTrade[];
  savedSessions: BacktestSessionRecord[];

  // Actions
  setAsset: (asset: string) => void;
  setTimeframe: (tf: string) => void;
  setLotSize: (lot: number) => void;
  setSpread: (spread: number) => void;
  setSlPips: (pips: string) => void;
  setTpPips: (pips: string) => void;
  setPlaySpeed: (speed: number) => void;
  togglePlay: () => void;
  stepForward: () => void;
  resetSimulation: () => void;
  openPosition: (direction: "buy" | "sell") => void;
  closePosition: () => void;
  saveCurrentSession: () => void;
}

export const useBacktestStore = create<BacktestState>((set, get) => {
  const initialAsset = "XAUUSD";
  const initialCandles = generateInitialCandles(initialAsset, 150);
  const startReveal = 60;

  return {
    asset: initialAsset,
    timeframe: "15m",
    startingBalance: 10000,
    balance: 10000,
    equity: 10000,
    candles: initialCandles,
    visibleIndex: startReveal,
    isPlaying: false,
    playSpeed: 1,
    lotSize: 1.0,
    spread: 1.5,
    slPips: "30",
    tpPips: "60",
    activePosition: null,
    closedTrades: [],
    savedSessions: [
      {
        id: "sess-1",
        name: "London Gold Breakout",
        asset: "XAUUSD",
        timeframe: "15m",
        startingBalance: 10000,
        endingBalance: 11420,
        totalTrades: 6,
        winRate: 66.7,
        netPnl: 1420,
        date: "2026-09-22",
      },
      {
        id: "sess-2",
        name: "Nasdaq Opening Range",
        asset: "NAS100",
        timeframe: "5m",
        startingBalance: 25000,
        endingBalance: 26850,
        totalTrades: 4,
        winRate: 75.0,
        netPnl: 1850,
        date: "2026-09-21",
      },
    ],

    setAsset: (newAsset) => {
      const newCandles = generateInitialCandles(newAsset, 150);
      set({
        asset: newAsset,
        candles: newCandles,
        visibleIndex: 60,
        activePosition: null,
        isPlaying: false,
      });
    },

    setTimeframe: (tf) => set({ timeframe: tf }),
    setLotSize: (lot) => set({ lotSize: lot }),
    setSpread: (spread) => set({ spread }),
    setSlPips: (slPips) => set({ slPips }),
    setTpPips: (tpPips) => set({ tpPips }),
    setPlaySpeed: (playSpeed) => set({ playSpeed }),

    togglePlay: () => set((state) => ({ isPlaying: !state.isPlaying })),

    stepForward: () => {
      const state = get();
      let nextIndex = state.visibleIndex + 1;
      let candles = [...state.candles];

      // If we reach the end of generated candles, append a new realistic candle
      if (nextIndex >= candles.length) {
        const last = candles[candles.length - 1];
        const volatility = state.asset === "EURUSD" ? 0.0008 : state.asset === "BTCUSD" ? 180 : 1.8;
        const change = (Math.random() - 0.49) * volatility;
        const open = last.close;
        const close = open + change;
        const high = Math.max(open, close) + Math.random() * volatility * 0.5;
        const low = Math.min(open, close) - Math.random() * volatility * 0.5;
        const now = new Date();

        candles.push({
          time: now.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
          open: Number(open.toFixed(state.asset === "EURUSD" ? 4 : 2)),
          high: Number(high.toFixed(state.asset === "EURUSD" ? 4 : 2)),
          low: Number(low.toFixed(state.asset === "EURUSD" ? 4 : 2)),
          close: Number(close.toFixed(state.asset === "EURUSD" ? 4 : 2)),
          volume: Math.floor(Math.random() * 500) + 100,
        });
      }

      const currentCandle = candles[nextIndex];
      let activePos = state.activePosition;
      let newBalance = state.balance;
      let newClosedTrades = [...state.closedTrades];

      // Update active position floating P&L
      if (activePos && currentCandle) {
        const priceDiff =
          activePos.direction === "buy"
            ? currentCandle.close - activePos.entryPrice
            : activePos.entryPrice - currentCandle.close;

        // Lot calculation multiplier
        const multiplier = state.asset === "EURUSD" ? 100000 : state.asset === "XAUUSD" ? 100 : 1;
        const floatingPnl = Number((priceDiff * activePos.lotSize * multiplier).toFixed(2));
        const pnlPct = Number(((floatingPnl / state.balance) * 100).toFixed(2));

        // Check SL / TP trigger
        let shouldAutoClose = false;
        if (activePos.slPrice) {
          if (activePos.direction === "buy" && currentCandle.low <= activePos.slPrice) shouldAutoClose = true;
          if (activePos.direction === "sell" && currentCandle.high >= activePos.slPrice) shouldAutoClose = true;
        }
        if (activePos.tpPrice) {
          if (activePos.direction === "buy" && currentCandle.high >= activePos.tpPrice) shouldAutoClose = true;
          if (activePos.direction === "sell" && currentCandle.low <= activePos.tpPrice) shouldAutoClose = true;
        }

        if (shouldAutoClose) {
          newBalance = Number((state.balance + floatingPnl).toFixed(2));
          newClosedTrades.unshift({
            id: `trade-${Date.now()}`,
            asset: activePos.asset,
            direction: activePos.direction,
            lotSize: activePos.lotSize,
            entryPrice: activePos.entryPrice,
            exitPrice: currentCandle.close,
            entryTime: activePos.entryTime,
            exitTime: currentCandle.time,
            pnl: floatingPnl,
            pnlPercent: pnlPct,
            riskReward: Math.abs(Number((floatingPnl / 100).toFixed(1))),
          });
          activePos = null;
        } else {
          activePos = {
            ...activePos,
            currentPrice: currentCandle.close,
            pnl: floatingPnl,
            pnlPercent: pnlPct,
          };
        }
      }

      const currentEquity = activePos ? Number((newBalance + activePos.pnl).toFixed(2)) : newBalance;

      set({
        candles,
        visibleIndex: nextIndex,
        activePosition: activePos,
        balance: newBalance,
        equity: currentEquity,
        closedTrades: newClosedTrades,
      });
    },

    resetSimulation: () => {
      const state = get();
      const freshCandles = generateInitialCandles(state.asset, 150);
      set({
        candles: freshCandles,
        visibleIndex: 60,
        activePosition: null,
        isPlaying: false,
        balance: state.startingBalance,
        equity: state.startingBalance,
        closedTrades: [],
      });
    },

    openPosition: (direction) => {
      const state = get();
      const currentCandle = state.candles[state.visibleIndex];
      if (!currentCandle) return;

      // Close existing position if any
      if (state.activePosition) {
        state.closePosition();
      }

      const entryPrice = currentCandle.close;
      const slNum = parseFloat(state.slPips);
      const tpNum = parseFloat(state.tpPips);
      const pipValue = state.asset === "EURUSD" ? 0.0001 : 1.0;

      let slPrice: number | undefined;
      let tpPrice: number | undefined;

      if (!isNaN(slNum) && slNum > 0) {
        slPrice = direction === "buy" ? entryPrice - slNum * pipValue : entryPrice + slNum * pipValue;
      }
      if (!isNaN(tpNum) && tpNum > 0) {
        tpPrice = direction === "buy" ? entryPrice + tpNum * pipValue : entryPrice - tpNum * pipValue;
      }

      const newPos: BacktestPosition = {
        id: `pos-${Date.now()}`,
        asset: state.asset,
        direction,
        lotSize: state.lotSize,
        entryPrice,
        currentPrice: entryPrice,
        slPrice,
        tpPrice,
        entryTime: currentCandle.time,
        pnl: 0,
        pnlPercent: 0,
      };

      set({ activePosition: newPos });
    },

    closePosition: () => {
      const state = get();
      if (!state.activePosition) return;

      const pos = state.activePosition;
      const currentCandle = state.candles[state.visibleIndex];
      const exitPrice = currentCandle ? currentCandle.close : pos.currentPrice;
      const realizedPnl = pos.pnl;
      const newBalance = Number((state.balance + realizedPnl).toFixed(2));

      const closedTrade: BacktestTrade = {
        id: `trade-${Date.now()}`,
        asset: pos.asset,
        direction: pos.direction,
        lotSize: pos.lotSize,
        entryPrice: pos.entryPrice,
        exitPrice,
        entryTime: pos.entryTime,
        exitTime: currentCandle?.time || "Now",
        pnl: realizedPnl,
        pnlPercent: pos.pnlPercent,
        riskReward: Math.abs(Number((realizedPnl / 100).toFixed(1))),
      };

      set({
        balance: newBalance,
        equity: newBalance,
        activePosition: null,
        closedTrades: [closedTrade, ...state.closedTrades],
      });
    },

    saveCurrentSession: () => {
      const state = get();
      const wins = state.closedTrades.filter((t) => t.pnl > 0).length;
      const winRate =
        state.closedTrades.length > 0 ? (wins / state.closedTrades.length) * 100 : 0;
      const netPnl = state.balance - state.startingBalance;

      const newSession: BacktestSessionRecord = {
        id: `sess-${Date.now()}`,
        name: `${state.asset} ${state.timeframe} Session`,
        asset: state.asset,
        timeframe: state.timeframe,
        startingBalance: state.startingBalance,
        endingBalance: state.balance,
        totalTrades: state.closedTrades.length,
        winRate: Number(winRate.toFixed(1)),
        netPnl: Number(netPnl.toFixed(2)),
        date: new Date().toISOString().split("T")[0],
      };

      set({
        savedSessions: [newSession, ...state.savedSessions],
      });
    },
  };
});
