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
    <div className="glass-card rounded-2xl p-5 border border-[var(--border-primary)] shadow-sm flex flex-col justify-between h-full">
      {/* Header with Title and Timeframe Dropdown */}
      <div className="flex items-center justify-between pb-3 border-b border-[var(--border-primary)]/50">
        <h2 className="text-base font-bold text-[var(--text-primary)]">Statistics</h2>
        <div className="relative">
          <select
            value={period}
            onChange={(e) => setPeriod(e.target.value as any)}
            className="appearance-none bg-[var(--bg-secondary)] border border-[var(--border-primary)] rounded-lg px-2.5 py-1 pr-7 text-xs font-medium text-[var(--text-secondary)] hover:text-[var(--text-primary)] focus:outline-none focus:border-brand-500 cursor-pointer transition-colors"
          >
            <option value="all">All time</option>
            <option value="month">This Month</option>
            <option value="week">This Week</option>
            <option value="today">Today</option>
          </select>
          <ChevronDown
            size={13}
            className="absolute right-2 top-1/2 -translate-y-1/2 text-[var(--text-tertiary)] pointer-events-none"
          />
        </div>
      </div>

      {/* 4 Quadrants Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-6 gap-y-5 pt-3.5 flex-1">
        {/* 1. PROFIT / LOSS */}
        <div className="space-y-2.5">
          <div className="flex items-center gap-1.5 pb-1">
            <span className="w-1 h-3 rounded-full bg-emerald-500" />
            <span className="text-[10px] font-bold uppercase tracking-wider text-[var(--text-tertiary)]">
              Profit / Loss
            </span>
          </div>
          <div className="space-y-1.5 text-xs">
            <div className="flex justify-between items-center">
              <span className="text-[var(--text-secondary)]">Gross profit</span>
              <span className="font-mono font-semibold text-profit">
                {formatCurrency(grossProfit)}
              </span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-[var(--text-secondary)]">Gross loss</span>
              <span className="font-mono font-semibold text-loss">
                {formatCurrency(-grossLoss)}
              </span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-[var(--text-secondary)]">Max Drawdown</span>
              <span className="font-mono font-semibold text-loss">
                {formatCurrency(stats.maxDrawdown, false)}
              </span>
            </div>
            <div className="flex justify-between items-center pt-1 border-t border-[var(--border-primary)]/40 font-semibold">
              <span className="text-[var(--text-primary)]">Net P&L</span>
              <span className={cn("font-mono", netPnl >= 0 ? "text-profit" : "text-loss")}>
                {display === "usd" ? formatCurrency(netPnl) : formatPercent((netPnl / 10000) * 100)}
              </span>
            </div>
          </div>
        </div>

        {/* 2. PERFORMANCE */}
        <div className="space-y-2.5">
          <div className="flex items-center gap-1.5 pb-1">
            <span className="w-1 h-3 rounded-full bg-indigo-500" />
            <span className="text-[10px] font-bold uppercase tracking-wider text-[var(--text-tertiary)]">
              Performance
            </span>
          </div>
          <div className="space-y-1.5 text-xs">
            <div className="flex justify-between items-center">
              <span className="text-[var(--text-secondary)]">Win rate</span>
              <span className="font-mono font-semibold text-[var(--text-primary)]">
                {winRate}%
              </span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-[var(--text-secondary)]">Avg win</span>
              <span className="font-mono font-semibold text-profit">
                {formatCurrency(avgWin)}
              </span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-[var(--text-secondary)]">Avg loss</span>
              <span className="font-mono font-semibold text-loss">
                {formatCurrency(-avgLoss)}
              </span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-[var(--text-secondary)]">Risk : Reward</span>
              <span className="font-mono font-semibold text-[var(--text-primary)]">
                1:{stats.avgRR.toFixed(2)}
              </span>
            </div>
            <div className="flex justify-between items-center pt-1 border-t border-[var(--border-primary)]/40 font-semibold">
              <span className="text-[var(--text-primary)]">Profit factor</span>
              <span className="font-mono text-brand-400">
                {stats.profitFactor.toFixed(2)}
              </span>
            </div>
          </div>
        </div>

        {/* 3. ACTIVITY */}
        <div className="space-y-2.5">
          <div className="flex items-center gap-1.5 pb-1">
            <span className="w-1 h-3 rounded-full bg-amber-500" />
            <span className="text-[10px] font-bold uppercase tracking-wider text-[var(--text-tertiary)]">
              Activity
            </span>
          </div>
          <div className="space-y-1.5 text-xs">
            <div className="flex justify-between items-center">
              <span className="text-[var(--text-secondary)]">Total trades</span>
              <span className="font-mono font-semibold text-[var(--text-primary)]">
                {totalTrades}
              </span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-[var(--text-secondary)]">Winning</span>
              <span className="font-mono font-semibold text-profit">{wins}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-[var(--text-secondary)]">Losing</span>
              <span className="font-mono font-semibold text-loss">{losses}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-[var(--text-secondary)]">Trading days</span>
              <span className="font-mono font-semibold text-[var(--text-primary)]">
                {Math.max(1, Math.round(14 * mult))}
              </span>
            </div>
          </div>
        </div>

        {/* 4. DISTRIBUTION */}
        <div className="space-y-2.5">
          <div className="flex items-center gap-1.5 pb-1">
            <span className="w-1 h-3 rounded-full bg-sky-500" />
            <span className="text-[10px] font-bold uppercase tracking-wider text-[var(--text-tertiary)]">
              Distribution
            </span>
          </div>
          <div className="space-y-1.5 text-xs">
            <div className="flex justify-between items-center">
              <span className="text-[var(--text-secondary)]">↑ Long</span>
              <span className="font-mono font-semibold text-profit">62%</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-[var(--text-secondary)]">↓ Short</span>
              <span className="font-mono font-semibold text-loss">38%</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-[var(--text-secondary)]">Best day</span>
              <span className="font-mono font-semibold text-profit">+$680.00</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-[var(--text-secondary)]">Win streak</span>
              <span className="font-mono font-semibold text-brand-400">5 trades</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
