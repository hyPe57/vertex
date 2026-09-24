"use client";

import React, { useEffect } from "react";
import { useBacktestStore } from "@/stores/backtest-store";
import { formatCurrency, cn } from "@/lib/utils";
import {
  Play,
  Pause,
  StepForward,
  RotateCcw,
  TrendingUp,
  TrendingDown,
  XCircle,
  BookmarkCheck,
  Zap,
} from "lucide-react";

export function ControlPanel() {
  const {
    balance,
    equity,
    startingBalance,
    lotSize,
    setLotSize,
    slPips,
    setSlPips,
    tpPips,
    setTpPips,
    activePosition,
    openPosition,
    closePosition,
    isPlaying,
    togglePlay,
    playSpeed,
    setPlaySpeed,
    stepForward,
    resetSimulation,
    saveCurrentSession,
    closedTrades,
  } = useBacktestStore();

  // Automatic playback timer when isPlaying is true
  useEffect(() => {
    if (!isPlaying) return;
    const intervalMs = Math.max(200, 1000 / playSpeed);
    const timer = setInterval(() => {
      stepForward();
    }, intervalMs);
    return () => clearInterval(timer);
  }, [isPlaying, playSpeed, stepForward]);

  const wins = closedTrades.filter((t) => t.pnl > 0).length;
  const losses = closedTrades.filter((t) => t.pnl < 0).length;
  const winRate = closedTrades.length > 0 ? (wins / closedTrades.length) * 100 : 0;
  const sessionPnl = equity - startingBalance;
  const isNetProfit = sessionPnl >= 0;

  return (
    <div className="flex flex-col gap-3.5 h-full justify-between">
      {/* ─── 1. Simulation Playback Controls ─── */}
      <div className="p-3.5 rounded-2xl bg-[#0c0d14]/75 border border-white/[0.04] backdrop-blur-md space-y-2.5">
        <div className="flex items-center justify-between">
          <span className="text-[10px] uppercase font-bold tracking-wider text-neutral-400">
            Playback Controls
          </span>
          {/* Speed Pills */}
          <div className="flex items-center gap-1 bg-white/[0.03] p-0.5 rounded-lg border border-white/[0.04]">
            {[1, 2, 5].map((spd) => (
              <button
                key={spd}
                type="button"
                onClick={() => setPlaySpeed(spd)}
                className={cn(
                  "px-2 py-0.5 rounded text-[10px] font-mono font-bold transition-all cursor-pointer",
                  playSpeed === spd
                    ? "bg-white/[0.1] text-white shadow-xs"
                    : "text-neutral-400 hover:text-neutral-200"
                )}
              >
                {spd}x
              </button>
            ))}
          </div>
        </div>

        <div className="flex items-center gap-2">
          {/* Play / Pause */}
          <button
            type="button"
            onClick={togglePlay}
            className={cn(
              "flex-1 flex items-center justify-center gap-1.5 py-2 rounded-xl text-xs font-semibold transition-all cursor-pointer",
              isPlaying
                ? "bg-amber-500/20 text-amber-400 border border-amber-500/30 shadow-xs"
                : "bg-white text-black hover:bg-neutral-200 shadow-sm"
            )}
          >
            {isPlaying ? (
              <>
                <Pause size={13} fill="currentColor" /> Pause
              </>
            ) : (
              <>
                <Play size={13} fill="currentColor" /> Play
              </>
            )}
          </button>

          {/* Step +1 Candle */}
          <button
            type="button"
            onClick={stepForward}
            className="flex items-center gap-1 px-3 py-2 rounded-xl bg-white/[0.04] hover:bg-white/[0.08] border border-white/[0.06] text-xs font-medium text-neutral-200 transition-all cursor-pointer"
            title="Step 1 Candle"
          >
            <StepForward size={13} />
            <span>Step</span>
          </button>

          {/* Reset */}
          <button
            type="button"
            onClick={resetSimulation}
            className="p-2 rounded-xl bg-white/[0.04] hover:bg-white/[0.08] border border-white/[0.06] text-neutral-400 hover:text-white transition-all cursor-pointer"
            title="Reset Simulation"
          >
            <RotateCcw size={13} />
          </button>
        </div>
      </div>

      {/* ─── 2. Order Execution & Active Position ─── */}
      <div className="p-3.5 rounded-2xl bg-[#0c0d14]/75 border border-white/[0.04] backdrop-blur-md space-y-3">
        {activePosition ? (
          /* When in active position */
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-[10px] uppercase font-bold tracking-wider text-neutral-400">
                Active Position
              </span>
              <span
                className={cn(
                  "px-2 py-0.5 rounded-full text-[10px] font-mono font-bold uppercase",
                  activePosition.direction === "buy"
                    ? "bg-emerald-500/10 text-emerald-400 border border-emerald-500/20"
                    : "bg-rose-500/10 text-rose-400 border border-rose-500/20"
                )}
              >
                {activePosition.direction === "buy" ? "LONG" : "SHORT"} {activePosition.lotSize}L
              </span>
            </div>

            {/* Big Floating P&L */}
            <div className="p-3 rounded-xl bg-white/[0.02] border border-white/[0.04] flex items-center justify-between">
              <div>
                <span className="text-[10px] text-neutral-400 font-mono block">Floating P&L</span>
                <div
                  className={cn(
                    "text-xl font-bold font-mono tracking-tight",
                    activePosition.pnl >= 0 ? "text-emerald-400" : "text-rose-400"
                  )}
                >
                  {activePosition.pnl >= 0 ? "+" : ""}
                  {formatCurrency(activePosition.pnl)}
                </div>
              </div>
              <div className="text-right text-[10px] font-mono text-neutral-400">
                <div>Entry: {activePosition.entryPrice}</div>
                <div>Cur: {activePosition.currentPrice}</div>
              </div>
            </div>

            {/* Close Button */}
            <button
              type="button"
              onClick={closePosition}
              className="w-full flex items-center justify-center gap-1.5 py-2.5 rounded-xl bg-white text-black hover:bg-neutral-200 text-xs font-bold transition-all cursor-pointer shadow-sm"
            >
              <XCircle size={14} /> Close Position
            </button>
          </div>
        ) : (
          /* When flat (place new order) */
          <div className="space-y-2.5">
            {/* Lot Size with presets */}
            <div>
              <div className="flex items-center justify-between mb-1">
                <span className="text-[10px] uppercase font-bold tracking-wider text-neutral-400">
                  Lot Size
                </span>
                <div className="flex items-center gap-1">
                  {[0.1, 0.5, 1.0, 2.0].map((l) => (
                    <button
                      key={l}
                      type="button"
                      onClick={() => setLotSize(l)}
                      className={cn(
                        "px-1.5 py-0.2 rounded text-[9px] font-mono transition-colors cursor-pointer",
                        lotSize === l
                          ? "bg-emerald-500/20 text-emerald-400 font-bold"
                          : "text-neutral-500 hover:text-neutral-300"
                      )}
                    >
                      {l}
                    </button>
                  ))}
                </div>
              </div>
              <input
                type="number"
                value={lotSize}
                onChange={(e) => setLotSize(parseFloat(e.target.value) || 0.1)}
                step="0.01"
                min="0.01"
                className="w-full h-8 rounded-lg border border-white/[0.06] bg-white/[0.02] px-2.5 text-xs text-white font-mono focus:outline-none focus:border-white/20 transition-colors"
              />
            </div>

            {/* SL & TP Pips */}
            <div className="grid grid-cols-2 gap-2">
              <div>
                <span className="text-[10px] uppercase font-bold tracking-wider text-neutral-400 block mb-1">
                  SL (Pips)
                </span>
                <input
                  type="number"
                  value={slPips}
                  onChange={(e) => setSlPips(e.target.value)}
                  placeholder="30"
                  className="w-full h-8 rounded-lg border border-white/[0.06] bg-white/[0.02] px-2 text-xs text-white font-mono focus:outline-none focus:border-white/20 transition-colors"
                />
              </div>
              <div>
                <span className="text-[10px] uppercase font-bold tracking-wider text-neutral-400 block mb-1">
                  TP (Pips)
                </span>
                <input
                  type="number"
                  value={tpPips}
                  onChange={(e) => setTpPips(e.target.value)}
                  placeholder="60"
                  className="w-full h-8 rounded-lg border border-white/[0.06] bg-white/[0.02] px-2 text-xs text-white font-mono focus:outline-none focus:border-white/20 transition-colors"
                />
              </div>
            </div>

            {/* Buy / Sell Buttons */}
            <div className="grid grid-cols-2 gap-2 pt-1">
              <button
                type="button"
                onClick={() => openPosition("buy")}
                className="flex items-center justify-center gap-1.5 py-2.5 rounded-xl bg-emerald-500/15 hover:bg-emerald-500/25 border border-emerald-500/30 text-emerald-400 text-xs font-bold transition-all cursor-pointer shadow-xs"
              >
                <TrendingUp size={14} /> BUY
              </button>
              <button
                type="button"
                onClick={() => openPosition("sell")}
                className="flex items-center justify-center gap-1.5 py-2.5 rounded-xl bg-rose-500/15 hover:bg-rose-500/25 border border-rose-500/30 text-rose-400 text-xs font-bold transition-all cursor-pointer shadow-xs"
              >
                <TrendingDown size={14} /> SELL
              </button>
            </div>
          </div>
        )}
      </div>

      {/* ─── 3. Live Session Summary ─── */}
      <div className="p-3.5 rounded-2xl bg-[#0c0d14]/75 border border-white/[0.04] backdrop-blur-md space-y-2">
        <div className="flex items-center justify-between">
          <span className="text-[10px] uppercase font-bold tracking-wider text-neutral-400">
            Session Performance
          </span>
          <button
            type="button"
            onClick={saveCurrentSession}
            disabled={closedTrades.length === 0}
            className="flex items-center gap-1 text-[10px] text-emerald-400 hover:text-emerald-300 disabled:opacity-40 transition-colors cursor-pointer"
          >
            <BookmarkCheck size={11} /> Save Session
          </button>
        </div>

        <div className="grid grid-cols-2 gap-2 pt-1">
          <div className="p-2 rounded-lg bg-white/[0.015] border border-white/[0.03]">
            <span className="text-[9px] text-neutral-400 font-mono block">Equity</span>
            <span className="text-xs font-mono font-bold text-white">
              {formatCurrency(equity, false)}
            </span>
          </div>
          <div className="p-2 rounded-lg bg-white/[0.015] border border-white/[0.03]">
            <span className="text-[9px] text-neutral-400 font-mono block">Session P&L</span>
            <span
              className={cn(
                "text-xs font-mono font-bold",
                isNetProfit ? "text-emerald-400" : "text-rose-400"
              )}
            >
              {isNetProfit ? "+" : ""}
              {formatCurrency(sessionPnl)}
            </span>
          </div>
          <div className="p-2 rounded-lg bg-white/[0.015] border border-white/[0.03]">
            <span className="text-[9px] text-neutral-400 font-mono block">Win Rate</span>
            <span className="text-xs font-mono font-bold text-white">
              {winRate.toFixed(0)}% ({wins}W/{losses}L)
            </span>
          </div>
          <div className="p-2 rounded-lg bg-white/[0.015] border border-white/[0.03]">
            <span className="text-[9px] text-neutral-400 font-mono block">Trades</span>
            <span className="text-xs font-mono font-bold text-white">
              {closedTrades.length} closed
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}
