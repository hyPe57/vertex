"use client";

import React, { useState, useEffect } from "react";
import { CandlestickChart } from "@/components/backtest/candlestick-chart";
import { ControlPanel } from "@/components/backtest/control-panel";
import { SessionTable } from "@/components/backtest/session-table";
import { useBacktestStore } from "@/stores/backtest-store";
import { formatCurrency, cn } from "@/lib/utils";
import {
  Play,
  Pause,
  StepForward,
  RotateCcw,
  SlidersHorizontal,
  BookmarkCheck,
  Maximize2,
  Minimize2,
  ChevronUp,
  ChevronDown,
  Layers,
  History,
  PanelRightClose,
  PanelRightOpen,
} from "lucide-react";

const ASSETS = ["XAUUSD", "EURUSD", "BTCUSD", "NAS100"];
const TIMEFRAMES = ["1m", "5m", "15m", "1H", "4H", "1D"];

export default function BacktestPage() {
  const {
    asset,
    setAsset,
    timeframe,
    setTimeframe,
    isPlaying,
    togglePlay,
    playSpeed,
    setPlaySpeed,
    stepForward,
    resetSimulation,
    saveCurrentSession,
    equity,
    startingBalance,
    closedTrades,
  } = useBacktestStore();

  const [isOrderPanelOpen, setIsOrderPanelOpen] = useState(true);
  const [isBottomDrawerOpen, setIsBottomDrawerOpen] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);

  // Global playback timer ensuring replay runs smoothly even when order panel is hidden
  useEffect(() => {
    if (!isPlaying) return;
    const intervalMs = Math.max(150, 1000 / playSpeed);
    const timer = setInterval(() => {
      stepForward();
    }, intervalMs);
    return () => clearInterval(timer);
  }, [isPlaying, playSpeed, stepForward]);

  // Fullscreen toggle handler
  const toggleBrowserFullscreen = () => {
    if (!document.fullscreenElement) {
      document.documentElement.requestFullscreen().catch(() => {});
      setIsFullscreen(true);
    } else {
      document.exitFullscreen().catch(() => {});
      setIsFullscreen(false);
    }
  };

  useEffect(() => {
    const handleFsChange = () => {
      setIsFullscreen(!!document.fullscreenElement);
    };
    document.addEventListener("fullscreenchange", handleFsChange);
    return () => document.removeEventListener("fullscreenchange", handleFsChange);
  }, []);

  const sessionPnl = equity - startingBalance;
  const isNetProfit = sessionPnl >= 0;

  return (
    <div className="w-full h-[calc(100vh-3.5rem)] flex flex-col bg-[#090a0f] text-neutral-200 overflow-hidden select-none">
      {/* ─── 1. TradingView Top Navigation Toolbar ─── */}
      <div className="h-11 px-3 border-b border-white/[0.06] bg-[#0c0d14] flex items-center justify-between gap-3 shrink-0 z-20">
        {/* Left: Asset & Timeframe Selectors */}
        <div className="flex items-center gap-2">
          {/* Asset Pills */}
          <div className="flex items-center bg-white/[0.03] p-0.5 rounded-lg border border-white/[0.06]">
            {ASSETS.map((a) => (
              <button
                key={a}
                type="button"
                onClick={() => setAsset(a)}
                className={cn(
                  "px-2.5 py-1 rounded-md text-xs font-mono font-bold transition-all cursor-pointer",
                  asset === a
                    ? "bg-white/[0.12] text-white shadow-xs"
                    : "text-neutral-400 hover:text-neutral-200"
                )}
              >
                {a}
              </button>
            ))}
          </div>

          <div className="h-4 w-[1px] bg-white/[0.08]" />

          {/* Timeframe Pills */}
          <div className="flex items-center bg-white/[0.03] p-0.5 rounded-lg border border-white/[0.06]">
            {TIMEFRAMES.map((tf) => (
              <button
                key={tf}
                type="button"
                onClick={() => setTimeframe(tf)}
                className={cn(
                  "px-2 py-1 rounded-md text-xs font-mono font-semibold transition-all cursor-pointer",
                  timeframe === tf
                    ? "bg-emerald-500/20 text-emerald-400 font-bold border border-emerald-500/30"
                    : "text-neutral-400 hover:text-neutral-200"
                )}
              >
                {tf}
              </button>
            ))}
          </div>
        </div>

        {/* Center: TradingView Bar Replay Bar */}
        <div className="flex items-center gap-1.5 bg-white/[0.02] px-2 py-0.5 rounded-xl border border-white/[0.06]">
          {/* Reset Replay */}
          <button
            type="button"
            onClick={resetSimulation}
            className="p-1.5 rounded-lg text-neutral-400 hover:text-white hover:bg-white/[0.06] transition-colors cursor-pointer"
            title="Reset Simulation to Start"
          >
            <RotateCcw size={13} />
          </button>

          {/* Step 1 Bar */}
          <button
            type="button"
            onClick={stepForward}
            className="flex items-center gap-1 px-2 py-1 rounded-lg bg-white/[0.04] hover:bg-white/[0.08] text-neutral-300 hover:text-white text-xs font-medium transition-colors cursor-pointer"
            title="Step 1 Candle"
          >
            <StepForward size={13} />
            <span className="hidden sm:inline text-[11px]">Step</span>
          </button>

          {/* Play / Pause */}
          <button
            type="button"
            onClick={togglePlay}
            className={cn(
              "flex items-center gap-1.5 px-3 py-1 rounded-lg text-xs font-bold transition-all cursor-pointer",
              isPlaying
                ? "bg-amber-500/20 text-amber-400 border border-amber-500/40 shadow-xs"
                : "bg-white text-black hover:bg-neutral-200"
            )}
            title={isPlaying ? "Pause Replay" : "Play Replay"}
          >
            {isPlaying ? (
              <>
                <Pause size={12} fill="currentColor" /> Pause
              </>
            ) : (
              <>
                <Play size={12} fill="currentColor" /> Play
              </>
            )}
          </button>

          {/* Speed Pills */}
          <div className="flex items-center gap-0.5 pl-1 border-l border-white/[0.06]">
            {[1, 2, 5, 10].map((spd) => (
              <button
                key={spd}
                type="button"
                onClick={() => setPlaySpeed(spd)}
                className={cn(
                  "px-1.5 py-0.5 rounded text-[10px] font-mono font-bold transition-colors cursor-pointer",
                  playSpeed === spd
                    ? "bg-white/[0.12] text-white"
                    : "text-neutral-500 hover:text-neutral-300"
                )}
              >
                {spd}x
              </button>
            ))}
          </div>
        </div>

        {/* Right: Session Summary & Panel Toggles */}
        <div className="flex items-center gap-2">
          {/* Equity & P&L Badge */}
          <div className="hidden md:flex items-center gap-2 px-2.5 py-1 rounded-lg bg-white/[0.02] border border-white/[0.04] text-[11px] font-mono">
            <span className="text-neutral-400">
              Eq: <span className="text-white font-bold">{formatCurrency(equity, false)}</span>
            </span>
            <span className="text-white/[0.2]">•</span>
            <span className={cn("font-bold", isNetProfit ? "text-emerald-400" : "text-rose-400")}>
              {isNetProfit ? "+" : ""}
              {formatCurrency(sessionPnl)}
            </span>
          </div>

          {/* Save Run */}
          <button
            type="button"
            onClick={saveCurrentSession}
            disabled={closedTrades.length === 0}
            className="flex items-center gap-1 px-2 py-1 rounded-lg bg-white/[0.03] hover:bg-white/[0.08] text-neutral-300 hover:text-white text-xs transition-colors cursor-pointer border border-white/[0.04] disabled:opacity-30"
            title="Save Session Record"
          >
            <BookmarkCheck size={13} className="text-emerald-400" />
            <span className="hidden sm:inline text-[11px]">Save</span>
          </button>

          {/* Toggle Order Panel */}
          <button
            type="button"
            onClick={() => setIsOrderPanelOpen((prev) => !prev)}
            className={cn(
              "flex items-center gap-1 px-2 py-1 rounded-lg text-xs transition-colors cursor-pointer border",
              isOrderPanelOpen
                ? "bg-white/[0.1] text-white border-white/[0.1]"
                : "bg-white/[0.03] text-neutral-400 hover:text-neutral-200 border-white/[0.04]"
            )}
            title={isOrderPanelOpen ? "Hide Order Panel" : "Show Order Panel"}
          >
            {isOrderPanelOpen ? <PanelRightClose size={13} /> : <PanelRightOpen size={13} />}
            <span className="hidden sm:inline text-[11px]">Trade</span>
          </button>

          {/* Fullscreen Button */}
          <button
            type="button"
            onClick={toggleBrowserFullscreen}
            className="p-1.5 rounded-lg bg-white/[0.03] hover:bg-white/[0.08] text-neutral-400 hover:text-white transition-colors cursor-pointer border border-white/[0.04]"
            title={isFullscreen ? "Exit Fullscreen" : "Full Screen"}
          >
            {isFullscreen ? <Minimize2 size={13} /> : <Maximize2 size={13} />}
          </button>
        </div>
      </div>

      {/* ─── 2. Main Workspace: Full Chart & Docked Order Ticket ─── */}
      <div className="flex-1 flex flex-row w-full overflow-hidden relative">
        {/* Full-width TradingView Candlestick Chart */}
        <div className="flex-1 h-full min-w-0 relative bg-[#090a0f]">
          <CandlestickChart />
        </div>

        {/* Docked Order Placement & Position Panel */}
        {isOrderPanelOpen && (
          <div className="w-[330px] xl:w-[360px] shrink-0 border-l border-white/[0.06] bg-[#0c0d14] flex flex-col h-full overflow-y-auto no-scrollbar z-10 transition-all shadow-xl">
            <ControlPanel />
          </div>
        )}
      </div>

      {/* ─── 3. Collapsible Bottom Strategy & Trade History Drawer ─── */}
      {isBottomDrawerOpen && (
        <div className="h-[220px] shrink-0 border-t border-white/[0.06] bg-[#0c0d14] z-20 transition-all">
          <SessionTable />
        </div>
      )}

      {/* ─── 4. Sleek Bottom Status Bar ─── */}
      <div className="h-7 px-3 border-t border-white/[0.06] bg-[#0a0b10] flex items-center justify-between text-[11px] font-mono text-neutral-400 shrink-0 z-20">
        {/* Left: Drawer Toggle Button */}
        <button
          type="button"
          onClick={() => setIsBottomDrawerOpen((prev) => !prev)}
          className="flex items-center gap-1.5 text-neutral-300 hover:text-white transition-colors cursor-pointer"
        >
          {isBottomDrawerOpen ? <ChevronDown size={13} /> : <ChevronUp size={13} />}
          <span className="font-semibold">Trade History & Saved Sessions</span>
          <span className="text-[10px] px-1.5 py-0.2 rounded bg-white/[0.06] text-neutral-400">
            {closedTrades.length} trades
          </span>
        </button>

        {/* Right: TradingView Interaction Guide */}
        <div className="hidden sm:flex items-center gap-2 text-[10px] text-neutral-400">
          <span>Wheel: Zoom</span>
          <span>•</span>
          <span>Drag: Pan</span>
          <span>•</span>
          <span>Axes: Scale</span>
        </div>
      </div>
    </div>
  );
}
