"use client";

import React from "react";
import { CandlestickChart } from "@/components/backtest/candlestick-chart";
import { ControlPanel } from "@/components/backtest/control-panel";
import { SessionTable } from "@/components/backtest/session-table";
import { useBacktestStore } from "@/stores/backtest-store";
import { cn } from "@/lib/utils";

const ASSETS = ["XAUUSD", "EURUSD", "BTCUSD", "NAS100"];
const TIMEFRAMES = ["1m", "5m", "15m", "1H", "4H"];

export default function BacktestPage() {
  const { asset, setAsset, timeframe, setTimeframe } = useBacktestStore();

  return (
    <div className="w-full max-w-[1500px] mx-auto px-4 lg:px-8 py-5 space-y-4">
      {/* ─── Compact Top Bar: Title & Asset/TF Switcher ─── */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-2 border-b border-white/[0.04]">
        <div>
          <h1 className="text-xl font-bold tracking-tight text-white flex items-center gap-2">
            Backtest Simulator
            <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-400 font-semibold uppercase tracking-wider">
              Interactive
            </span>
          </h1>
          <p className="text-xs text-neutral-400 mt-0.5">
            Step through historical candles, execute real orders, and test trading edge
          </p>
        </div>

        {/* Asset & Timeframe Selectors */}
        <div className="flex items-center gap-2 flex-wrap">
          {/* Asset Pills */}
          <div className="flex h-8 rounded-xl p-0.5 bg-[#0c0d14] border border-white/[0.06]">
            {ASSETS.map((a) => (
              <button
                key={a}
                onClick={() => setAsset(a)}
                className={cn(
                  "px-3 rounded-lg text-xs font-mono font-semibold transition-all cursor-pointer",
                  asset === a
                    ? "bg-white/[0.1] text-white shadow-xs"
                    : "text-neutral-400 hover:text-neutral-200"
                )}
              >
                {a}
              </button>
            ))}
          </div>

          {/* Timeframe Pills */}
          <div className="flex h-8 rounded-xl p-0.5 bg-[#0c0d14] border border-white/[0.06]">
            {TIMEFRAMES.map((tf) => (
              <button
                key={tf}
                onClick={() => setTimeframe(tf)}
                className={cn(
                  "px-2.5 rounded-lg text-xs font-mono font-medium transition-all cursor-pointer",
                  timeframe === tf
                    ? "bg-white/[0.1] text-white shadow-xs"
                    : "text-neutral-400 hover:text-neutral-200"
                )}
              >
                {tf}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* ─── Main Work Area (Chart & Execution Panel) ─── */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-4">
        {/* Left: Candlestick Chart (8 cols on lg) */}
        <div className="lg:col-span-8 h-[400px]">
          <CandlestickChart />
        </div>

        {/* Right: Execution & Controls (4 cols on lg) */}
        <div className="lg:col-span-4 h-[400px]">
          <ControlPanel />
        </div>
      </div>

      {/* ─── Bottom Area: Trades & Sessions Table ─── */}
      <div className="w-full">
        <SessionTable />
      </div>
    </div>
  );
}
