import { create } from "zustand";

export interface BacktestCandle {
  time: number; // Unix timestamp in seconds (UTCTimestamp)
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
  entryTime: number;
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
  entryTime: number;
  exitTime: number;
  pnl: number;
  pnlPercent: number;
  riskReward: number;
  exitReason: "TP" | "SL" | "Manual";
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

export function getTimeframeInterval(tf: string): number {
  switch (tf) {
    case "1m":
      return 60;
    case "5m":
      return 300;
    case "15m":
      return 900;
    case "1H":
      return 3600;
    case "4H":
      return 14400;
    case "1D":
      return 86400;
    default:
      return 900;
  }
}

export function getTimeframeVolatility(tf: string): { scale: number; wavePeriod: number } {
  switch (tf) {
    case "1m":
      return { scale: 0.35, wavePeriod: 8 };
    case "5m":
      return { scale: 0.65, wavePeriod: 12 };
    case "15m":
      return { scale: 1.0, wavePeriod: 18 };
    case "1H":
      return { scale: 2.2, wavePeriod: 26 };
    case "4H":
      return { scale: 4.5, wavePeriod: 36 };
    case "1D":
      return { scale: 8.5, wavePeriod: 48 };
    default:
      return { scale: 1.0, wavePeriod: 18 };
  }
}

// Generate realistic candlestick data with strictly ascending timestamps tailored to timeframe
function generateDataset(asset: string, timeframe = "15m", count = 300): BacktestCandle[] {
  let basePrice = 2350.0; // XAUUSD
  let baseVolatility = 2.2;

  if (asset === "EURUSD") {
    basePrice = 1.085;
    baseVolatility = 0.0009;
  } else if (asset === "BTCUSD") {
    basePrice = 64200.0;
    baseVolatility = 220.0;
  } else if (asset === "NAS100") {
    basePrice = 18250.0;
    baseVolatility = 28.0;
  }

  const intervalSeconds = getTimeframeInterval(timeframe);
  const { scale, wavePeriod } = getTimeframeVolatility(timeframe);
  const volatility = baseVolatility * scale;

  const candles: BacktestCandle[] = [];
  let currentClose = basePrice;
  // Start from past time so current candles are up to date
  const startTime = Math.floor(Date.now() / 1000) - count * intervalSeconds;

  for (let i = 0; i < count; i++) {
    const time = startTime + i * intervalSeconds;
    // Market cycle simulation: trend + wave oscillations + noise
    const trend =
      Math.sin(i / wavePeriod) * (volatility * 0.5) +
      Math.cos(i / (wavePeriod * 0.6)) * (volatility * 0.25);
    const noise = (Math.random() - 0.49) * volatility;
    const change = trend + noise;
    const open = currentClose;
    const close = Math.max(open + change, basePrice * 0.3);
    const high = Math.max(open, close) + Math.random() * volatility * 0.55;
    const low = Math.min(open, close) - Math.random() * volatility * 0.55;
    const volume = Math.floor(Math.random() * 800) + 150;

    const decimals = asset === "EURUSD" ? 4 : 2;
    candles.push({
      time,
      open: Number(open.toFixed(decimals)),
      high: Number(high.toFixed(decimals)),
      low: Number(low.toFixed(decimals)),
      close: Number(close.toFixed(decimals)),
      volume,
    });
    currentClose = close;
  }

  return candles;
}

// Multipliers for P&L calculations
function getAssetMultiplier(asset: string): number {
  if (asset === "EURUSD") return 100000;
  if (asset === "XAUUSD") return 100;
  if (asset === "BTCUSD") return 1;
  return 20; // NAS100
}

function getPipUnit(asset: string): number {
  if (asset === "EURUSD") return 0.0001;
  if (asset === "XAUUSD") return 0.1;
  if (asset === "BTCUSD") return 1.0;
  return 1.0; // NAS100
}

interface BacktestState {
  asset: string;
  timeframe: string;
  startingBalance: number;
  balance: number;
  equity: number;
  candles: BacktestCandle[];
  visibleIndex: number;
  isPlaying: boolean;
  playSpeed: number; // 1x, 2x, 5x, 10x
  lotSize: number;
  spreadPips: number;

  // TP / SL Controls (Free Setting)
  tpMode: "pips" | "price" | "rr";
  slEnabled: boolean;
  tpEnabled: boolean;
  slPips: number;
  tpPips: number;
  customSlPrice: string;
  customTpPrice: string;
  selectedRR: number;

  activePosition: BacktestPosition | null;
  closedTrades: BacktestTrade[];
  savedSessions: BacktestSessionRecord[];
  dataSource: string;
  isLoadingData: boolean;

  // Actions
  fetchMarketCandles: (asset?: string, timeframe?: string) => Promise<void>;
  setAsset: (asset: string) => void;
  setTimeframe: (tf: string) => void;
  setLotSize: (lot: number) => void;
  setSpreadPips: (spread: number) => void;
  setTpMode: (mode: "pips" | "price" | "rr") => void;
  setSlEnabled: (enabled: boolean) => void;
  setTpEnabled: (enabled: boolean) => void;
  setSlPips: (pips: number) => void;
  setTpPips: (pips: number) => void;
  setCustomSlPrice: (price: string) => void;
  setCustomTpPrice: (price: string) => void;
  setSelectedRR: (rr: number) => void;
  setPlaySpeed: (speed: number) => void;
  togglePlay: () => void;
  stepForward: () => void;
  resetSimulation: () => void;

  // Active Position Management
  openPosition: (direction: "buy" | "sell") => void;
  closePosition: () => void;
  updateActiveSl: (price: number | undefined) => void;
  updateActiveTp: (price: number | undefined) => void;
  nudgeActiveSl: (deltaPips: number) => void;
  nudgeActiveTp: (deltaPips: number) => void;
  setSlToBreakEven: () => void;
  saveCurrentSession: () => void;
  deleteSession: (id: string) => void;
  clearTrades: () => void;
}

export const useBacktestStore = create<BacktestState>((set, get) => {
  const initialAsset = "XAUUSD";
  const initialCandles = generateDataset(initialAsset, "15m", 300);
  const startReveal = 100;

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
    spreadPips: 1.5,

    // Free TP & SL Defaults
    tpMode: "rr",
    slEnabled: true,
    tpEnabled: true,
    slPips: 30,
    tpPips: 60,
    customSlPrice: "",
    customTpPrice: "",
    selectedRR: 2, // 1:2 default

    activePosition: null,
    closedTrades: [],
    savedSessions: [
      {
        id: "sess-1",
        name: "Gold London Breakout 1:2 RR",
        asset: "XAUUSD",
        timeframe: "15m",
        startingBalance: 10000,
        endingBalance: 11480,
        totalTrades: 6,
        winRate: 66.7,
        netPnl: 1480,
        date: "2026-09-22",
      },
      {
        id: "sess-2",
        name: "Nasdaq Trend Pullback",
        asset: "NAS100",
        timeframe: "5m",
        startingBalance: 25000,
        endingBalance: 27120,
        totalTrades: 5,
        winRate: 80.0,
        netPnl: 2120,
        date: "2026-09-21",
      },
    ],

    dataSource: "Real Market (Yahoo Finance)",
    isLoadingData: false,

    fetchMarketCandles: async (targetAsset, targetTf) => {
      const state = get();
      const asset = targetAsset || state.asset;
      const tf = targetTf || state.timeframe;
      set({ isLoadingData: true });

      try {
        const res = await fetch(`/api/market-data?asset=${asset}&timeframe=${tf}`);
        if (!res.ok) throw new Error("API error");
        const json = await res.json();
        if (json.success && Array.isArray(json.candles) && json.candles.length > 0) {
          const visibleIndex = Math.min(
            json.candles.length - 1,
            Math.max(40, Math.floor(json.candles.length * 0.55))
          );
          set({
            asset,
            timeframe: tf,
            candles: json.candles,
            visibleIndex,
            dataSource: json.source || "Real Historical Data",
            isLoadingData: false,
            activePosition: null,
            isPlaying: false,
          });
          return;
        }
      } catch (err) {
        console.warn("API fetch failed, falling back to simulation:", err);
      }

      // Fallback
      const fallbackCandles = generateDataset(asset, tf, 300);
      set({
        asset,
        timeframe: tf,
        candles: fallbackCandles,
        visibleIndex: 120,
        dataSource: "Simulation (Offline Fallback)",
        isLoadingData: false,
        activePosition: null,
        isPlaying: false,
      });
    },

    setAsset: (newAsset) => {
      const state = get();
      set({
        asset: newAsset,
        activePosition: null,
        isPlaying: false,
        customSlPrice: "",
        customTpPrice: "",
      });
      get().fetchMarketCandles(newAsset, state.timeframe);
    },

    setTimeframe: (tf) => {
      const state = get();
      set({
        timeframe: tf,
        activePosition: null,
        isPlaying: false,
      });
      get().fetchMarketCandles(state.asset, tf);
    },
    setLotSize: (lot) => set({ lotSize: lot }),
    setSpreadPips: (spreadPips) => set({ spreadPips }),
    setTpMode: (tpMode) => set({ tpMode }),
    setSlEnabled: (slEnabled) => set({ slEnabled }),
    setTpEnabled: (tpEnabled) => set({ tpEnabled }),
    setSlPips: (slPips) => set({ slPips }),
    setTpPips: (tpPips) => set({ tpPips }),
    setCustomSlPrice: (customSlPrice) => set({ customSlPrice }),
    setCustomTpPrice: (customTpPrice) => set({ customTpPrice }),
    setSelectedRR: (selectedRR) => set({ selectedRR }),
    setPlaySpeed: (playSpeed) => set({ playSpeed }),

    togglePlay: () => set((state) => ({ isPlaying: !state.isPlaying })),

    stepForward: () => {
      const state = get();
      let nextIndex = state.visibleIndex + 1;
      let candles = [...state.candles];

      // If approaching dataset end, dynamically generate more continuous bars
      if (nextIndex >= candles.length) {
        const last = candles[candles.length - 1];
        const baseVolatility =
          state.asset === "EURUSD" ? 0.0009 : state.asset === "BTCUSD" ? 220 : 2.2;
        const { scale } = getTimeframeVolatility(state.timeframe);
        const volatility = baseVolatility * scale;
        const intervalSeconds = getTimeframeInterval(state.timeframe);

        const change = (Math.random() - 0.49) * volatility;
        const open = last.close;
        const close = open + change;
        const high = Math.max(open, close) + Math.random() * volatility * 0.5;
        const low = Math.min(open, close) - Math.random() * volatility * 0.5;
        const decimals = state.asset === "EURUSD" ? 4 : 2;

        candles.push({
          time: last.time + intervalSeconds,
          open: Number(open.toFixed(decimals)),
          high: Number(high.toFixed(decimals)),
          low: Number(low.toFixed(decimals)),
          close: Number(close.toFixed(decimals)),
          volume: Math.floor(Math.random() * 800) + 150,
        });
      }

      const currentCandle = candles[nextIndex];
      let activePos = state.activePosition;
      let newBalance = state.balance;
      let newClosedTrades = [...state.closedTrades];

      // Process live position
      if (activePos && currentCandle) {
        const multiplier = getAssetMultiplier(state.asset);

        // Check Take Profit trigger
        let hitTP = false;
        let hitSL = false;

        if (activePos.tpPrice) {
          if (activePos.direction === "buy" && currentCandle.high >= activePos.tpPrice) {
            hitTP = true;
          } else if (activePos.direction === "sell" && currentCandle.low <= activePos.tpPrice) {
            hitTP = true;
          }
        }

        if (activePos.slPrice) {
          if (activePos.direction === "buy" && currentCandle.low <= activePos.slPrice) {
            hitSL = true;
          } else if (activePos.direction === "sell" && currentCandle.high >= activePos.slPrice) {
            hitSL = true;
          }
        }

        if (hitTP || hitSL) {
          const exitPrice = hitTP ? activePos.tpPrice! : activePos.slPrice!;
          const priceDiff =
            activePos.direction === "buy"
              ? exitPrice - activePos.entryPrice
              : activePos.entryPrice - exitPrice;

          const realizedPnl = Number((priceDiff * activePos.lotSize * multiplier).toFixed(2));
          newBalance = Number((state.balance + realizedPnl).toFixed(2));

          newClosedTrades.unshift({
            id: `trade-${Date.now()}`,
            asset: activePos.asset,
            direction: activePos.direction,
            lotSize: activePos.lotSize,
            entryPrice: activePos.entryPrice,
            exitPrice,
            entryTime: activePos.entryTime,
            exitTime: currentCandle.time,
            pnl: realizedPnl,
            pnlPercent: Number(((realizedPnl / state.balance) * 100).toFixed(2)),
            riskReward: Math.abs(Number((realizedPnl / 100).toFixed(1))),
            exitReason: hitTP ? "TP" : "SL",
          });

          activePos = null;
        } else {
          // Floating P&L update
          const priceDiff =
            activePos.direction === "buy"
              ? currentCandle.close - activePos.entryPrice
              : activePos.entryPrice - currentCandle.close;

          const floatingPnl = Number((priceDiff * activePos.lotSize * multiplier).toFixed(2));
          const pnlPct = Number(((floatingPnl / state.balance) * 100).toFixed(2));

          activePos = {
            ...activePos,
            currentPrice: currentCandle.close,
            pnl: floatingPnl,
            pnlPercent: pnlPct,
          };
        }
      }

      const currentEquity = activePos
        ? Number((newBalance + activePos.pnl).toFixed(2))
        : newBalance;

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
      const freshCandles = generateDataset(state.asset, state.timeframe, 300);
      set({
        candles: freshCandles,
        visibleIndex: 120,
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
      const pip = getPipUnit(state.asset);
      const decimals = state.asset === "EURUSD" ? 4 : 2;

      let slPrice: number | undefined;
      let tpPrice: number | undefined;

      // 1. Calculate Stop Loss if enabled
      if (state.slEnabled) {
        if (state.tpMode === "price" && state.customSlPrice && !isNaN(parseFloat(state.customSlPrice))) {
          slPrice = Number(parseFloat(state.customSlPrice).toFixed(decimals));
        } else if (state.slPips > 0) {
          slPrice =
            direction === "buy"
              ? Number((entryPrice - state.slPips * pip).toFixed(decimals))
              : Number((entryPrice + state.slPips * pip).toFixed(decimals));
        }
      }

      // 2. Calculate Take Profit if enabled
      if (state.tpEnabled) {
        if (state.tpMode === "price" && state.customTpPrice && !isNaN(parseFloat(state.customTpPrice))) {
          tpPrice = Number(parseFloat(state.customTpPrice).toFixed(decimals));
        } else if (state.tpMode === "rr" && slPrice && state.selectedRR > 0) {
          const slDistance = Math.abs(entryPrice - slPrice);
          const tpDistance = slDistance * state.selectedRR;
          tpPrice =
            direction === "buy"
              ? Number((entryPrice + tpDistance).toFixed(decimals))
              : Number((entryPrice - tpDistance).toFixed(decimals));
        } else if (state.tpPips > 0) {
          tpPrice =
            direction === "buy"
              ? Number((entryPrice + state.tpPips * pip).toFixed(decimals))
              : Number((entryPrice - state.tpPips * pip).toFixed(decimals));
        }
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
        exitTime: currentCandle?.time || Math.floor(Date.now() / 1000),
        pnl: realizedPnl,
        pnlPercent: pos.pnlPercent,
        riskReward: Math.abs(Number((realizedPnl / 100).toFixed(1))),
        exitReason: "Manual",
      };

      set({
        balance: newBalance,
        equity: newBalance,
        activePosition: null,
        closedTrades: [closedTrade, ...state.closedTrades],
      });
    },

    updateActiveSl: (price) => {
      set((state) => {
        if (!state.activePosition) return state;
        return {
          activePosition: {
            ...state.activePosition,
            slPrice: price,
          },
        };
      });
    },

    updateActiveTp: (price) => {
      set((state) => {
        if (!state.activePosition) return state;
        return {
          activePosition: {
            ...state.activePosition,
            tpPrice: price,
          },
        };
      });
    },

    nudgeActiveSl: (deltaPips: number) => {
      const state = get();
      if (!state.activePosition) return;
      const pip = getPipUnit(state.asset);
      const decimals = state.asset === "EURUSD" ? 4 : 2;
      const currentSl = state.activePosition.slPrice ?? state.activePosition.entryPrice;
      const newSl = Number((currentSl + deltaPips * pip).toFixed(decimals));
      state.updateActiveSl(newSl);
    },

    nudgeActiveTp: (deltaPips: number) => {
      const state = get();
      if (!state.activePosition) return;
      const pip = getPipUnit(state.asset);
      const decimals = state.asset === "EURUSD" ? 4 : 2;
      const currentTp = state.activePosition.tpPrice ?? state.activePosition.entryPrice;
      const newTp = Number((currentTp + deltaPips * pip).toFixed(decimals));
      state.updateActiveTp(newTp);
    },

    setSlToBreakEven: () => {
      const state = get();
      if (!state.activePosition) return;
      state.updateActiveSl(state.activePosition.entryPrice);
    },

    saveCurrentSession: () => {
      const state = get();
      const wins = state.closedTrades.filter((t) => t.pnl > 0).length;
      const winRate =
        state.closedTrades.length > 0 ? (wins / state.closedTrades.length) * 100 : 0;
      const netPnl = state.balance - state.startingBalance;

      const newSession: BacktestSessionRecord = {
        id: `sess-${Date.now()}`,
        name: `${state.asset} (${state.timeframe}) - ${state.closedTrades.length} Trades`,
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

    deleteSession: (id: string) => {
      set((state) => ({
        savedSessions: state.savedSessions.filter((s) => s.id !== id),
      }));
    },

    clearTrades: () => {
      set({ closedTrades: [] });
    },
  };
});
