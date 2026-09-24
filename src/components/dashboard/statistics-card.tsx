"use client";

import { useState } from "react";
import { formatCurrency, formatPercent, cn } from "@/lib/utils";
import { mockAggregateStats } from "@/lib/mock-data";
import { useCurrencyStore } from "@/stores";
import { ChevronDown } from "lucide-react";

export function StatisticsCard() {
  const { display } = useCurrencyStore();
  const [period, setPeriod] = useState<"all" | "month" | "week" | "today">("all");
  const stats = mockAggregateStats;

  // Multiplier adjustments based on timeframe for realistic demonstration
  const mult = period === "today" ? 0.35 : period === "week" ? 0.65 : period === "month" ? 0.9 : 1.0;
  const grossProfit = 6840 * mult;
  const grossLoss = 1976 * mult;
  const netPnl = grossProfit - grossLoss;
  const totalTrades = Math.max(1, Math.round(stats.totalTrades * mult));
  const wins = Math.max(1, Math.round(stats.wins * mult));
  const losses = Math.max(0, totalTrades - wins);
  const winRate = Number(((wins / totalTrades) * 100).toFixed(1));
  const avgWin = 402.35;
  const avgLoss = 219.55;

  return (
    <div className="bg-[#0c0d14]/75 backdrop-blur-md rounded-2xl p-5 border border-white/[0.04] shadow-sm flex flex-col justify-between h-full">
      {/* Header with Title and Timeframe Dropdown */}
      <div className="flex items-center justify-between pb-3">
        <div>
          <h2 className="text-sm font-semibold text-neutral-100 tracking-tight">Statistics</h2>
          <p className="text-[11px] text-neutral-400 mt-0.5">Overview & performance metrics</p>
        </div>
        <div className="relative">
          <select
            value={period}
            onChange={(e) => setPeriod(e.target.value as any)}
            className="appearance-none bg-white/[0.03] border border-white/[0.06] rounded-lg px-2.5 py-1 pr-6 text-xs font-medium text-neutral-300 hover:text-white focus:outline-none focus:border-white/20 cursor-pointer transition-colors"
          >
            <option value="all" className="bg-[#12131a] text-white">All time</option>
            <option value="month" className="bg-[#12131a] text-white">This Month</option>
            <option value="week" className="bg-[#12131a] text-white">This Week</option>
            <option value="today" className="bg-[#12131a] text-white">Today</option>
          </select>
          <ChevronDown
            size={12}
            className="absolute right-2 top-1/2 -translate-y-1/2 text-neutral-400 pointer-events-none"
          />
        </div>
      </div>

      {/* Top Hero KPI Highlights */}
      <div className="grid grid-cols-3 gap-2 py-3 px-3 rounded-xl bg-white/[0.02] border border-white/[0.035] mb-4">
        <div>
          <span className="text-[10px] font-medium text-neutral-400 uppercase tracking-wider block">
            Net P&L
          </span>
          <span
            className={cn(
              "text-base sm:text-lg font-semibold tabular-nums tracking-tight block mt-0.5",
              netPnl >= 0 ? "text-emerald-400" : "text-rose-400"
            )}
          >
            {display === "usd" ? formatCurrency(netPnl) : formatPercent((netPnl / 10000) * 100)}
          </span>
        </div>
        <div>
          <span className="text-[10px] font-medium text-neutral-400 uppercase tracking-wider block">
            Win Rate
          </span>
          <div className="flex items-baseline gap-1 mt-0.5">
            <span className="text-base sm:text-lg font-semibold tabular-nums tracking-tight text-neutral-100">
              {winRate}%
            </span>
            <span className="text-[10px] text-neutral-500 font-medium tabular-nums">
              ({wins}W-{losses}L)
            </span>
          </div>
        </div>
        <div>
          <span className="text-[10px] font-medium text-neutral-400 uppercase tracking-wider block">
            Profit Factor
          </span>
          <span className="text-base sm:text-lg font-semibold tabular-nums tracking-tight text-neutral-100 block mt-0.5">
            {stats.profitFactor.toFixed(2)}
          </span>
        </div>
      </div>

      {/* 4 Quadrants Grid - Clean & Perfectly Balanced */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-6 gap-y-4 flex-1">
        {/* 1. PROFIT & LOSS */}
        <div className="space-y-2">
          <div className="text-[10px] font-semibold uppercase tracking-wider text-neutral-400 pb-0.5">
            Profit & Loss
          </div>
          <div className="space-y-1.5 text-xs">
            <div className="flex justify-between items-center">
              <span className="text-neutral-400">Gross profit</span>
              <span className="font-medium tabular-nums text-emerald-400">
                {formatCurrency(grossProfit)}
              </span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-neutral-400">Gross loss</span>
              <span className="font-medium tabular-nums text-rose-400">
                {formatCurrency(-grossLoss)}
              </span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-neutral-400">Max Drawdown</span>
              <span className="font-medium tabular-nums text-rose-400">
                {formatCurrency(-stats.maxDrawdown)}
              </span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-neutral-400">Best day</span>
              <span className="font-medium tabular-nums text-emerald-400">
                {formatCurrency(680)}
              </span>
            </div>
          </div>
        </div>

        {/* 2. PERFORMANCE */}
        <div className="space-y-2">
          <div className="text-[10px] font-semibold uppercase tracking-wider text-neutral-400 pb-0.5">
            Performance
          </div>
          <div className="space-y-1.5 text-xs">
            <div className="flex justify-between items-center">
              <span className="text-neutral-400">Avg win</span>
              <span className="font-medium tabular-nums text-emerald-400">
                {formatCurrency(avgWin)}
              </span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-neutral-400">Avg loss</span>
              <span className="font-medium tabular-nums text-rose-400">
                {formatCurrency(-avgLoss)}
              </span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-neutral-400">Risk : Reward</span>
              <span className="font-medium tabular-nums text-neutral-200">
                1:{stats.avgRR.toFixed(2)}
              </span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-neutral-400">Expectancy</span>
              <span className="font-medium tabular-nums text-emerald-400">
                +${((avgWin * (winRate / 100)) - (avgLoss * ((100 - winRate) / 100))).toFixed(2)}
              </span>
            </div>
          </div>
        </div>

        {/* 3. ACTIVITY */}
        <div className="space-y-2">
          <div className="text-[10px] font-semibold uppercase tracking-wider text-neutral-400 pb-0.5">
            Activity
          </div>
          <div className="space-y-1.5 text-xs">
            <div className="flex justify-between items-center">
              <span className="text-neutral-400">Total trades</span>
              <span className="font-medium tabular-nums text-neutral-200">
                {totalTrades}
              </span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-neutral-400">Winning trades</span>
              <span className="font-medium tabular-nums text-emerald-400">
                {wins}
              </span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-neutral-400">Losing trades</span>
              <span className="font-medium tabular-nums text-rose-400">
                {losses}
              </span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-neutral-400">Trading days</span>
              <span className="font-medium tabular-nums text-neutral-200">
                {Math.max(1, Math.round(14 * mult))}
              </span>
            </div>
          </div>
        </div>

        {/* 4. DISTRIBUTION */}
        <div className="space-y-2">
          <div className="text-[10px] font-semibold uppercase tracking-wider text-neutral-400 pb-0.5">
            Distribution
          </div>
          <div className="space-y-1.5 text-xs">
            <div className="flex justify-between items-center">
              <span className="text-neutral-400">Long positions</span>
              <span className="font-medium tabular-nums text-neutral-200">62%</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-neutral-400">Short positions</span>
              <span className="font-medium tabular-nums text-neutral-200">38%</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-neutral-400">Win streak</span>
              <span className="font-medium tabular-nums text-neutral-200">5 trades</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-neutral-400">Loss streak</span>
              <span className="font-medium tabular-nums text-neutral-200">2 trades</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
