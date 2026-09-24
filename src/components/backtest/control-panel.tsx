"use client";

import React, { useEffect, useMemo, useState } from "react";
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
  Shield,
  Target,
  SlidersHorizontal,
  Check,
  Trash2,
  Percent,
} from "lucide-react";

export function ControlPanel() {
  const {
    balance,
    equity,
    startingBalance,
    lotSize,
    setLotSize,
    candles,
    visibleIndex,
    asset,
    tpMode,
    setTpMode,
    slEnabled,
    setSlEnabled,
    tpEnabled,
    setTpEnabled,
    slPips,
    setSlPips,
    tpPips,
    setTpPips,
    customSlPrice,
    setCustomSlPrice,
    customTpPrice,
    setCustomTpPrice,
    selectedRR,
    setSelectedRR,
    activePosition,
    openPosition,
    closePosition,
    updateActiveSl,
    updateActiveTp,
    nudgeActiveSl,
    nudgeActiveTp,
    setSlToBreakEven,
    isPlaying,
    togglePlay,
    playSpeed,
    setPlaySpeed,
    stepForward,
    resetSimulation,
    saveCurrentSession,
    closedTrades,
  } = useBacktestStore();

  const currentCandle = candles[visibleIndex] || candles[candles.length - 1];
  const currentPrice = currentCandle ? currentCandle.close : 0;
  const decimals = asset === "EURUSD" ? 4 : 2;

  // Multiplier & Pip Unit
  const { pipUnit, multiplier } = useMemo(() => {
    let p = 0.1;
    let m = 100;
    if (asset === "EURUSD") {
      p = 0.0001;
      m = 100000;
    } else if (asset === "BTCUSD") {
      p = 1.0;
      m = 1;
    } else if (asset === "NAS100") {
      p = 1.0;
      m = 20;
    }
    return { pipUnit: p, multiplier: m };
  }, [asset]);

  // Automatic playback timer
  useEffect(() => {
    if (!isPlaying) return;
    const intervalMs = Math.max(150, 1000 / playSpeed);
    const timer = setInterval(() => {
      stepForward();
    }, intervalMs);
    return () => clearInterval(timer);
  }, [isPlaying, playSpeed, stepForward]);

  // Risk / Reward calculations preview for Buy direction
  const { estimatedRisk, estimatedReward, calculatedRR } = useMemo(() => {
    if (!currentPrice || lotSize <= 0) {
      return { estimatedRisk: 0, estimatedReward: 0, calculatedRR: selectedRR };
    }

    let risk = 0;
    let reward = 0;

    if (slEnabled) {
      if (tpMode === "price" && customSlPrice) {
        const diff = Math.abs(currentPrice - parseFloat(customSlPrice));
        risk = diff * lotSize * multiplier;
      } else {
        risk = slPips * pipUnit * lotSize * multiplier;
      }
    }

    if (tpEnabled) {
      if (tpMode === "price" && customTpPrice) {
        const diff = Math.abs(parseFloat(customTpPrice) - currentPrice);
        reward = diff * lotSize * multiplier;
      } else if (tpMode === "rr") {
        reward = risk * selectedRR;
      } else {
        reward = tpPips * pipUnit * lotSize * multiplier;
      }
    }

    const rr = risk > 0 ? reward / risk : 0;
    return {
      estimatedRisk: Number(risk.toFixed(2)),
      estimatedReward: Number(reward.toFixed(2)),
      calculatedRR: Number(rr.toFixed(1)),
    };
  }, [
    currentPrice,
    lotSize,
    multiplier,
    pipUnit,
    slEnabled,
    tpEnabled,
    tpMode,
    customSlPrice,
    customTpPrice,
    slPips,
    tpPips,
    selectedRR,
  ]);

  const wins = closedTrades.filter((t) => t.pnl > 0).length;
  const losses = closedTrades.filter((t) => t.pnl < 0).length;
  const winRate = closedTrades.length > 0 ? (wins / closedTrades.length) * 100 : 0;
  const sessionPnl = equity - startingBalance;
  const isNetProfit = sessionPnl >= 0;

  // Active position details
  const isAtBreakEven =
    activePosition &&
    activePosition.slPrice !== undefined &&
    Math.abs(activePosition.slPrice - activePosition.entryPrice) < pipUnit * 0.1;

  return (
    <div className="flex flex-col gap-3 h-full justify-between">
      {/* ─── 1. Simulation Controls ─── */}
      <div className="p-3 rounded-2xl bg-[#0c0d14]/80 border border-white/[0.04] backdrop-blur-md space-y-2">
        <div className="flex items-center justify-between">
          <span className="text-[10px] uppercase font-bold tracking-wider text-neutral-400">
            Simulation Speed
          </span>
          <div className="flex items-center gap-1 bg-white/[0.03] p-0.5 rounded-lg border border-white/[0.04]">
            {[1, 2, 5, 10].map((spd) => (
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

      {/* ─── 2. Order Execution & Active Position Management ─── */}
      <div className="p-3.5 rounded-2xl bg-[#0c0d14]/80 border border-white/[0.04] backdrop-blur-md space-y-3 flex-1 flex flex-col justify-between">
        {activePosition ? (
          /* ACTIVE POSITION IN PROGRESS */
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-1.5">
                <span
                  className={cn(
                    "px-2 py-0.5 rounded-md text-[10px] font-mono font-bold uppercase",
                    activePosition.direction === "buy"
                      ? "bg-emerald-500/15 text-emerald-400 border border-emerald-500/20"
                      : "bg-rose-500/15 text-rose-400 border border-rose-500/20"
                  )}
                >
                  {activePosition.direction.toUpperCase()} {activePosition.lotSize}L
                </span>
                <span className="text-[11px] font-mono text-neutral-400">
                  @{activePosition.entryPrice.toFixed(decimals)}
                </span>
              </div>
              <span className="text-[10px] text-neutral-400 font-mono">
                Now: {activePosition.currentPrice.toFixed(decimals)}
              </span>
            </div>

            {/* Glowing Floating P&L */}
            <div className="p-3 rounded-xl bg-white/[0.02] border border-white/[0.04] flex items-center justify-between">
              <div>
                <span className="text-[10px] text-neutral-400 font-mono block">Floating P&L</span>
                <div
                  className={cn(
                    "text-2xl font-bold font-mono tracking-tight",
                    activePosition.pnl >= 0 ? "text-emerald-400" : "text-rose-400"
                  )}
                >
                  {activePosition.pnl >= 0 ? "+" : ""}
                  {formatCurrency(activePosition.pnl)}
                </div>
              </div>
              <div className="text-right">
                <span className="text-[10px] text-neutral-400 font-mono block">Return</span>
                <div
                  className={cn(
                    "text-xs font-mono font-bold",
                    activePosition.pnlPercent >= 0 ? "text-emerald-400" : "text-rose-400"
                  )}
                >
                  {activePosition.pnlPercent >= 0 ? "+" : ""}
                  {activePosition.pnlPercent.toFixed(2)}%
                </div>
              </div>
            </div>

            {/* In-Position Live SL & TP Controls */}
            <div className="space-y-2 pt-1 border-t border-white/[0.04]">
              {/* Stop Loss Row */}
              <div className="flex items-center justify-between gap-2 text-xs">
                <span className="text-[10px] font-bold text-rose-400 flex items-center gap-1 min-w-[50px]">
                  <Shield size={11} /> SL
                </span>
                <div className="flex-1 flex items-center gap-1">
                  <input
                    type="number"
                    step={pipUnit}
                    value={activePosition.slPrice ?? ""}
                    onChange={(e) =>
                      updateActiveSl(e.target.value ? parseFloat(e.target.value) : undefined)
                    }
                    placeholder="None"
                    className="w-full h-7 rounded-lg border border-white/[0.06] bg-white/[0.02] px-2 text-[11px] text-white font-mono focus:outline-none focus:border-rose-500/50"
                  />
                  {/* Nudge Buttons */}
                  <button
                    type="button"
                    onClick={() => nudgeActiveSl(-5)}
                    className="h-7 px-1.5 rounded bg-white/[0.03] hover:bg-white/[0.08] text-[9px] font-mono text-neutral-400 hover:text-white"
                    title="-5 pips"
                  >
                    -5p
                  </button>
                  <button
                    type="button"
                    onClick={() => nudgeActiveSl(5)}
                    className="h-7 px-1.5 rounded bg-white/[0.03] hover:bg-white/[0.08] text-[9px] font-mono text-neutral-400 hover:text-white"
                    title="+5 pips"
                  >
                    +5p
                  </button>
                </div>
              </div>

              {/* Take Profit Row */}
              <div className="flex items-center justify-between gap-2 text-xs">
                <span className="text-[10px] font-bold text-emerald-400 flex items-center gap-1 min-w-[50px]">
                  <Target size={11} /> TP
                </span>
                <div className="flex-1 flex items-center gap-1">
                  <input
                    type="number"
                    step={pipUnit}
                    value={activePosition.tpPrice ?? ""}
                    onChange={(e) =>
                      updateActiveTp(e.target.value ? parseFloat(e.target.value) : undefined)
                    }
                    placeholder="None"
                    className="w-full h-7 rounded-lg border border-white/[0.06] bg-white/[0.02] px-2 text-[11px] text-white font-mono focus:outline-none focus:border-emerald-500/50"
                  />
                  {/* Nudge Buttons */}
                  <button
                    type="button"
                    onClick={() => nudgeActiveTp(-5)}
                    className="h-7 px-1.5 rounded bg-white/[0.03] hover:bg-white/[0.08] text-[9px] font-mono text-neutral-400 hover:text-white"
                    title="-5 pips"
                  >
                    -5p
                  </button>
                  <button
                    type="button"
                    onClick={() => nudgeActiveTp(5)}
                    className="h-7 px-1.5 rounded bg-white/[0.03] hover:bg-white/[0.08] text-[9px] font-mono text-neutral-400 hover:text-white"
                    title="+5 pips"
                  >
                    +5p
                  </button>
                </div>
              </div>

              {/* Move SL to Break-Even Button */}
              <button
                type="button"
                onClick={setSlToBreakEven}
                className={cn(
                  "w-full flex items-center justify-center gap-1.5 py-1.5 rounded-lg text-[11px] font-mono font-medium transition-all cursor-pointer border",
                  isAtBreakEven
                    ? "bg-emerald-500/10 text-emerald-400 border-emerald-500/30"
                    : "bg-white/[0.03] hover:bg-white/[0.06] text-neutral-300 border-white/[0.06]"
                )}
              >
                {isAtBreakEven ? (
                  <>
                    <Check size={12} /> SL at Break-Even ({activePosition.entryPrice})
                  </>
                ) : (
                  <>Move SL to Break-Even (Risk-Free)</>
                )}
              </button>
            </div>

            {/* Close Position Button */}
            <button
              type="button"
              onClick={closePosition}
              className="w-full flex items-center justify-center gap-1.5 py-2.5 rounded-xl bg-white text-black hover:bg-neutral-200 text-xs font-bold transition-all cursor-pointer shadow-sm"
            >
              <XCircle size={14} /> Close Position
            </button>
          </div>
        ) : (
          /* FLAT / ORDER PLACEMENT PANEL */
          <div className="space-y-3">
            {/* Lot Size with presets */}
            <div>
              <div className="flex items-center justify-between mb-1">
                <span className="text-[10px] uppercase font-bold tracking-wider text-neutral-400">
                  Position Size (Lots)
                </span>
                <div className="flex items-center gap-1">
                  {[0.1, 0.5, 1.0, 2.0, 5.0].map((l) => (
                    <button
                      key={l}
                      type="button"
                      onClick={() => setLotSize(l)}
                      className={cn(
                        "px-1.5 py-0.5 rounded text-[9px] font-mono transition-colors cursor-pointer",
                        lotSize === l
                          ? "bg-white/[0.12] text-white font-bold"
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
                onChange={(e) => setLotSize(Math.max(0.01, parseFloat(e.target.value) || 0.1))}
                step="0.01"
                min="0.01"
                className="w-full h-8 rounded-lg border border-white/[0.06] bg-white/[0.02] px-2.5 text-xs text-white font-mono focus:outline-none focus:border-white/20 transition-colors"
              />
            </div>

            {/* ─── TP / SL Free Mode Selector ─── */}
            <div className="space-y-2 border-t border-white/[0.04] pt-2">
              <div className="flex items-center justify-between">
                <span className="text-[10px] uppercase font-bold tracking-wider text-neutral-400 flex items-center gap-1">
                  <SlidersHorizontal size={11} /> Target & Risk
                </span>
                {/* Mode Selector Tabs */}
                <div className="flex items-center bg-white/[0.03] p-0.5 rounded-lg border border-white/[0.04]">
                  {(
                    [
                      { key: "rr", label: "R:R Target" },
                      { key: "pips", label: "Pips" },
                      { key: "price", label: "Price" },
                    ] as const
                  ).map((m) => (
                    <button
                      key={m.key}
                      type="button"
                      onClick={() => setTpMode(m.key)}
                      className={cn(
                        "px-2 py-0.5 rounded text-[9px] font-mono font-bold transition-all cursor-pointer",
                        tpMode === m.key
                          ? "bg-white/[0.12] text-white"
                          : "text-neutral-400 hover:text-neutral-200"
                      )}
                    >
                      {m.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Mode 1: R:R Target */}
              {tpMode === "rr" && (
                <div className="space-y-2 bg-white/[0.015] p-2.5 rounded-xl border border-white/[0.03]">
                  <div className="flex items-center justify-between text-xs">
                    <span className="text-[10px] text-neutral-400 font-mono">SL Distance</span>
                    <div className="flex items-center gap-1">
                      <input
                        type="number"
                        value={slPips}
                        onChange={(e) => setSlPips(parseInt(e.target.value) || 10)}
                        className="w-16 h-7 rounded border border-white/[0.06] bg-white/[0.03] px-1.5 text-center text-xs font-mono text-white"
                      />
                      <span className="text-[10px] text-neutral-500 font-mono">pips</span>
                    </div>
                  </div>

                  {/* R:R Presets */}
                  <div className="flex items-center justify-between gap-1 pt-1">
                    {[1, 1.5, 2, 2.5, 3, 5].map((rr) => (
                      <button
                        key={rr}
                        type="button"
                        onClick={() => setSelectedRR(rr)}
                        className={cn(
                          "flex-1 py-1 rounded text-[10px] font-mono font-bold transition-colors cursor-pointer",
                          selectedRR === rr
                            ? "bg-emerald-500/20 text-emerald-400 border border-emerald-500/30"
                            : "bg-white/[0.02] text-neutral-400 hover:text-neutral-200 border border-transparent"
                        )}
                      >
                        1:{rr}
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* Mode 2: By Pips */}
              {tpMode === "pips" && (
                <div className="grid grid-cols-2 gap-2 bg-white/[0.015] p-2.5 rounded-xl border border-white/[0.03]">
                  <div>
                    <span className="text-[9px] text-neutral-400 font-mono block mb-1">
                      SL (Pips)
                    </span>
                    <input
                      type="number"
                      value={slPips}
                      onChange={(e) => setSlPips(parseInt(e.target.value) || 0)}
                      placeholder="30"
                      className="w-full h-7 rounded border border-white/[0.06] bg-white/[0.03] px-2 text-xs font-mono text-white"
                    />
                  </div>
                  <div>
                    <span className="text-[9px] text-neutral-400 font-mono block mb-1">
                      TP (Pips)
                    </span>
                    <input
                      type="number"
                      value={tpPips}
                      onChange={(e) => setTpPips(parseInt(e.target.value) || 0)}
                      placeholder="60"
                      className="w-full h-7 rounded border border-white/[0.06] bg-white/[0.03] px-2 text-xs font-mono text-white"
                    />
                  </div>
                </div>
              )}

              {/* Mode 3: By Exact Price */}
              {tpMode === "price" && (
                <div className="grid grid-cols-2 gap-2 bg-white/[0.015] p-2.5 rounded-xl border border-white/[0.03]">
                  <div>
                    <span className="text-[9px] text-neutral-400 font-mono block mb-1">
                      Exact SL Price
                    </span>
                    <input
                      type="number"
                      step={pipUnit}
                      value={customSlPrice}
                      onChange={(e) => setCustomSlPrice(e.target.value)}
                      placeholder={currentPrice ? (currentPrice * 0.995).toFixed(decimals) : "SL"}
                      className="w-full h-7 rounded border border-white/[0.06] bg-white/[0.03] px-2 text-xs font-mono text-white"
                    />
                  </div>
                  <div>
                    <span className="text-[9px] text-neutral-400 font-mono block mb-1">
                      Exact TP Price
                    </span>
                    <input
                      type="number"
                      step={pipUnit}
                      value={customTpPrice}
                      onChange={(e) => setCustomTpPrice(e.target.value)}
                      placeholder={currentPrice ? (currentPrice * 1.01).toFixed(decimals) : "TP"}
                      className="w-full h-7 rounded border border-white/[0.06] bg-white/[0.03] px-2 text-xs font-mono text-white"
                    />
                  </div>
                </div>
              )}

              {/* Estimated Risk / Reward Badge */}
              <div className="flex items-center justify-between p-2 rounded-lg bg-white/[0.01] border border-white/[0.03] text-[10px] font-mono">
                <span className="text-rose-400 font-medium">
                  Risk: -{formatCurrency(estimatedRisk)}
                </span>
                <span className="text-neutral-500 font-bold">1:{calculatedRR}</span>
                <span className="text-emerald-400 font-medium">
                  Reward: +{formatCurrency(estimatedReward)}
                </span>
              </div>
            </div>

            {/* Buy / Sell Buttons */}
            <div className="grid grid-cols-2 gap-2 pt-1">
              <button
                type="button"
                onClick={() => openPosition("buy")}
                className="flex flex-col items-center justify-center py-2.5 px-3 rounded-xl bg-emerald-500/15 hover:bg-emerald-500/25 border border-emerald-500/30 text-emerald-400 font-bold transition-all cursor-pointer shadow-xs active:scale-[0.98]"
              >
                <div className="flex items-center gap-1 text-xs">
                  <TrendingUp size={14} /> BUY (Long)
                </div>
                <span className="text-[10px] font-mono font-normal opacity-80 mt-0.5">
                  @{currentPrice.toFixed(decimals)}
                </span>
              </button>

              <button
                type="button"
                onClick={() => openPosition("sell")}
                className="flex flex-col items-center justify-center py-2.5 px-3 rounded-xl bg-rose-500/15 hover:bg-rose-500/25 border border-rose-500/30 text-rose-400 font-bold transition-all cursor-pointer shadow-xs active:scale-[0.98]"
              >
                <div className="flex items-center gap-1 text-xs">
                  <TrendingDown size={14} /> SELL (Short)
                </div>
                <span className="text-[10px] font-mono font-normal opacity-80 mt-0.5">
                  @{currentPrice.toFixed(decimals)}
                </span>
              </button>
            </div>
          </div>
        )}
      </div>

      {/* ─── 3. Session Performance Summary ─── */}
      <div className="p-3 rounded-2xl bg-[#0c0d14]/80 border border-white/[0.04] backdrop-blur-md space-y-2">
        <div className="flex items-center justify-between">
          <span className="text-[10px] uppercase font-bold tracking-wider text-neutral-400">
            Session Performance
          </span>
          <button
            type="button"
            onClick={saveCurrentSession}
            disabled={closedTrades.length === 0}
            className="flex items-center gap-1 text-[10px] text-emerald-400 hover:text-emerald-300 disabled:opacity-30 transition-colors cursor-pointer"
          >
            <BookmarkCheck size={11} /> Save Run
          </button>
        </div>

        <div className="grid grid-cols-2 gap-2 pt-0.5">
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
