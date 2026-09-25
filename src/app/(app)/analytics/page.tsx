"use client";

import React, { useState, useMemo } from "react";
import { useTradeStore } from "@/stores";
import { cn, formatCurrency } from "@/lib/utils";
import type { Trade } from "@/types";
import {
  TrendingUp,
  Target,
  Gauge,
  ShieldAlert,
  ArrowUpRight,
  ArrowDownRight,
} from "lucide-react";

// ─── Analytics Components ───
import { CumulativePnlChart } from "@/components/analytics/cumulative-pnl-chart";
import { WinLossDonut } from "@/components/analytics/win-loss-donut";
import { AssetDonutChart } from "@/components/analytics/asset-donut-chart";
import { LongShortComparison } from "@/components/analytics/long-short-comparison";
import { RMultipleChart } from "@/components/analytics/r-multiple-chart";
import { SessionBreakdown } from "@/components/analytics/session-breakdown";
import { DayOfWeekChart } from "@/components/analytics/day-of-week-chart";
import { EmotionCorrelation } from "@/components/analytics/emotion-correlation";
import { DurationBreakdown } from "@/components/analytics/duration-breakdown";

// ─── Period Filter Types ───
type Period = "today" | "week" | "month" | "year" | "all";

const PERIOD_OPTIONS: { id: Period; label: string }[] = [
  { id: "today", label: "Today" },
  { id: "week", label: "This Week" },
  { id: "month", label: "This Month" },
  { id: "year", label: "This Year" },
  { id: "all", label: "All Time" },
];

// ─── Period Filter Logic ───
function filterTradesByPeriod(trades: Trade[], period: Period): Trade[] {
  if (period === "all") return trades;

  const now = new Date();
  const startOfDay = new Date(now.getFullYear(), now.getMonth(), now.getDate());

  let cutoff: Date;
  switch (period) {
    case "today":
      cutoff = startOfDay;
      break;
    case "week": {
      const dayOfWeek = now.getDay();
      const mondayOffset = dayOfWeek === 0 ? 6 : dayOfWeek - 1;
      cutoff = new Date(startOfDay);
      cutoff.setDate(cutoff.getDate() - mondayOffset);
      break;
    }
    case "month":
      cutoff = new Date(now.getFullYear(), now.getMonth(), 1);
      break;
    case "year":
      cutoff = new Date(now.getFullYear(), 0, 1);
      break;
    default:
      return trades;
  }

  return trades.filter((t) => new Date(t.openTime) >= cutoff);
}

// ─── Pro Journal KPI Calculations ───
function computeStats(trades: Trade[]) {
  if (trades.length === 0) {
    return {
      netPnl: 0,
      winRate: 0,
      wins: 0,
      losses: 0,
      be: 0,
      totalTrades: 0,
      profitFactor: 0,
      expectancy: 0,
      maxDrawdown: 0,
      avgRR: 0,
      bestTrade: 0,
      worstTrade: 0,
      avgWin: 0,
      avgLoss: 0,
      payoffRatio: 0,
    };
  }

  const wins = trades.filter((t) => t.pnl > 0);
  const losses = trades.filter((t) => t.pnl < 0);
  const be = trades.filter((t) => t.pnl === 0);
  const totalPnl = trades.reduce((sum, t) => sum + t.pnl, 0);
  const grossProfit = wins.reduce((sum, t) => sum + t.pnl, 0);
  const grossLoss = Math.abs(losses.reduce((sum, t) => sum + t.pnl, 0));
  const winRate = trades.length > 0 ? (wins.length / trades.length) * 100 : 0;
  const avgWin = wins.length > 0 ? grossProfit / wins.length : 0;
  const avgLoss = losses.length > 0 ? grossLoss / losses.length : 0;
  const profitFactor = grossLoss > 0 ? grossProfit / grossLoss : grossProfit > 0 ? 99.99 : 0;
  const payoffRatio = avgLoss > 0 ? avgWin / avgLoss : avgWin > 0 ? 99.99 : 0;
  const expectancy = (winRate / 100) * avgWin - ((100 - winRate) / 100) * avgLoss;
  const avgRR = trades.reduce((sum, t) => sum + (t.riskReward || 0), 0) / trades.length;

  // Max drawdown (peak-to-trough)
  let peak = 0;
  let maxDD = 0;
  let cumPnl = 0;
  for (const t of trades) {
    cumPnl += t.pnl;
    if (cumPnl > peak) peak = cumPnl;
    const dd = peak - cumPnl;
    if (dd > maxDD) maxDD = dd;
  }

  return {
    netPnl: totalPnl,
    winRate,
    wins: wins.length,
    losses: losses.length,
    be: be.length,
    totalTrades: trades.length,
    profitFactor: Math.min(profitFactor, 99.99),
    expectancy,
    maxDrawdown: maxDD,
    avgRR,
    bestTrade: Math.max(...trades.map((t) => t.pnl)),
    worstTrade: Math.min(...trades.map((t) => t.pnl)),
    avgWin,
    avgLoss,
    payoffRatio: Math.min(payoffRatio, 99.99),
  };
}

export default function AnalyticsPage() {
  const [period, setPeriod] = useState<Period>("all");
  const allTrades = useTradeStore((state) => state.trades);

  const filteredTrades = useMemo(
    () => filterTradesByPeriod(allTrades, period),
    [allTrades, period]
  );

  const stats = useMemo(() => computeStats(filteredTrades), [filteredTrades]);
  const isNetPositive = stats.netPnl >= 0;

  return (
    <div className="w-full px-4 lg:px-8 py-6 space-y-6">
      {/* ─── Header: Pro Title & Period Selector ─── */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2 border-b border-white/[0.04]">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-xl font-bold tracking-tight text-white">
              Trading Journal Analytics
            </h1>
            <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-400 font-semibold uppercase tracking-wider">
              Pro View
            </span>
          </div>
          <p className="text-xs text-neutral-400 mt-0.5">
            {filteredTrades.length} trades analyzed · {stats.wins}W / {stats.losses}L · Win Rate{" "}
            <span className="text-white font-medium">{stats.winRate.toFixed(1)}%</span> · Net P&L{" "}
            <span className={cn("font-medium", isNetPositive ? "text-emerald-400" : "text-rose-400")}>
              {formatCurrency(stats.netPnl)}
            </span>
          </p>
        </div>

        {/* Period Filter (Pill segmented control) */}
        <div className="flex h-8 rounded-xl p-0.5 bg-[#090a0f] border border-white/[0.06] shrink-0 self-start sm:self-auto">
          {PERIOD_OPTIONS.map((opt) => (
            <button
              key={opt.id}
              onClick={() => setPeriod(opt.id)}
              className={cn(
                "px-3 rounded-lg text-xs font-medium transition-all cursor-pointer",
                period === opt.id
                  ? "bg-white/[0.08] text-white shadow-xs"
                  : "text-neutral-400 hover:text-neutral-200"
              )}
            >
              {opt.label}
            </button>
          ))}
        </div>
      </div>

      {/* ─── Top Executive KPIs Strip (5 Pro Metrics) ─── */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-3">
        {/* Net PnL Card */}
        <div className="p-4 rounded-2xl bg-[#0c0d14]/75 border border-white/[0.04] backdrop-blur-md space-y-2">
          <div className="flex items-center justify-between text-neutral-400">
            <span className="text-[10px] uppercase font-semibold tracking-wider">
              Net P&L
            </span>
            <div className="p-1 rounded-md bg-white/[0.02]">
              {isNetPositive ? (
                <ArrowUpRight size={13} className="text-emerald-400" />
              ) : (
                <ArrowDownRight size={13} className="text-rose-400" />
              )}
            </div>
          </div>
          <div
            className={cn(
              "text-2xl font-bold font-mono tracking-tight",
              isNetPositive ? "text-emerald-400" : "text-rose-400"
            )}
          >
            {isNetPositive ? "+" : ""}
            {formatCurrency(stats.netPnl)}
          </div>
          <div className="text-[10px] text-neutral-400 font-mono">
            {stats.totalTrades} closed trades
          </div>
        </div>

        {/* Win Rate Card */}
        <div className="p-4 rounded-2xl bg-[#0c0d14]/75 border border-white/[0.04] backdrop-blur-md space-y-2">
          <div className="flex items-center justify-between text-neutral-400">
            <span className="text-[10px] uppercase font-semibold tracking-wider">
              Win Rate
            </span>
            <div className="p-1 rounded-md bg-white/[0.02]">
              <Target size={13} className="text-neutral-400" />
            </div>
          </div>
          <div className="text-2xl font-bold font-mono tracking-tight text-white">
            {stats.winRate.toFixed(1)}%
          </div>
          <div className="text-[10px] text-neutral-400 font-mono">
            {stats.wins}W · {stats.losses}L {stats.be > 0 ? `· ${stats.be}BE` : ""}
          </div>
        </div>

        {/* Profit Factor Card */}
        <div className="p-4 rounded-2xl bg-[#0c0d14]/75 border border-white/[0.04] backdrop-blur-md space-y-2">
          <div className="flex items-center justify-between text-neutral-400">
            <span className="text-[10px] uppercase font-semibold tracking-wider">
              Profit Factor
            </span>
            <div className="p-1 rounded-md bg-white/[0.02]">
              <TrendingUp size={13} className="text-neutral-400" />
            </div>
          </div>
          <div
            className={cn(
              "text-2xl font-bold font-mono tracking-tight",
              stats.profitFactor >= 1.5
                ? "text-emerald-400"
                : stats.profitFactor >= 1.0
                ? "text-amber-400"
                : "text-rose-400"
            )}
          >
            {stats.profitFactor === 99.99 ? "∞" : stats.profitFactor.toFixed(2)}
          </div>
          <div className="text-[10px] text-neutral-400 font-mono">
            Payoff: {stats.payoffRatio === 99.99 ? "∞" : stats.payoffRatio.toFixed(2)}R
          </div>
        </div>

        {/* Trade Expectancy Card */}
        <div className="p-4 rounded-2xl bg-[#0c0d14]/75 border border-white/[0.04] backdrop-blur-md space-y-2">
          <div className="flex items-center justify-between text-neutral-400">
            <span className="text-[10px] uppercase font-semibold tracking-wider">
              Expectancy
            </span>
            <div className="p-1 rounded-md bg-white/[0.02]">
              <Gauge size={13} className="text-neutral-400" />
            </div>
          </div>
          <div
            className={cn(
              "text-2xl font-bold font-mono tracking-tight",
              stats.expectancy >= 0 ? "text-emerald-400" : "text-rose-400"
            )}
          >
            {stats.expectancy >= 0 ? "+" : ""}
            ${Math.abs(stats.expectancy).toFixed(1)}
          </div>
          <div className="text-[10px] text-neutral-400 font-mono">Edge per closed trade</div>
        </div>

        {/* Max Drawdown Card */}
        <div className="p-4 rounded-2xl bg-[#0c0d14]/75 border border-white/[0.04] backdrop-blur-md space-y-2">
          <div className="flex items-center justify-between text-neutral-400">
            <span className="text-[10px] uppercase font-semibold tracking-wider">
              Max Drawdown
            </span>
            <div className="p-1 rounded-md bg-white/[0.02]">
              <ShieldAlert size={13} className="text-rose-400" />
            </div>
          </div>
          <div className="text-2xl font-bold font-mono tracking-tight text-rose-400">
            -${stats.maxDrawdown.toFixed(0)}
          </div>
          <div className="text-[10px] text-neutral-400 font-mono">Peak-to-trough drop</div>
        </div>
      </div>

      {/* ─── ROW 1: Cumulative Growth & Win/Loss Donut (8 cols / 4 cols) ─── */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
        <div className="lg:col-span-8">
          <CumulativePnlChart trades={filteredTrades} />
        </div>
        <div className="lg:col-span-4">
          <WinLossDonut trades={filteredTrades} />
        </div>
      </div>

      {/* ─── ROW 2: Symbol Allocation & Execution Bias & R-Multiple (4 cols / 4 cols / 4 cols) ─── */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-12 gap-5">
        <div className="lg:col-span-4">
          <AssetDonutChart trades={filteredTrades} />
        </div>
        <div className="lg:col-span-4">
          <LongShortComparison trades={filteredTrades} />
        </div>
        <div className="lg:col-span-4">
          <RMultipleChart trades={filteredTrades} />
        </div>
      </div>

      {/* ─── ROW 3: Market Timing & Day Edge (6 cols / 6 cols) ─── */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
        <SessionBreakdown trades={filteredTrades} />
        <DayOfWeekChart trades={filteredTrades} />
      </div>

      {/* ─── ROW 4: Psychology & Trade Duration (50/50) ─── */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
        <EmotionCorrelation />
        <DurationBreakdown trades={filteredTrades} />
      </div>
    </div>
  );
}
