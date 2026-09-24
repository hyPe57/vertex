"use client";

import React, { useState, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
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
  Flame,
  Award,
  Zap,
} from "lucide-react";

// ─── Analytics Components ───
import { CumulativePnlChart } from "@/components/analytics/cumulative-pnl-chart";
import { EmotionCorrelation } from "@/components/analytics/emotion-correlation";
import { LongShortComparison } from "@/components/analytics/long-short-comparison";
import { RMultipleChart } from "@/components/analytics/r-multiple-chart";
import { AssetPerformance } from "@/components/analytics/asset-performance";
import { SessionBreakdown } from "@/components/analytics/session-breakdown";
import { DurationBreakdown } from "@/components/analytics/duration-breakdown";

// ─── Filter & Tab Definitions ───
type Period = "today" | "week" | "month" | "year" | "all";
type TabId = "overview" | "execution" | "psychology";

const PERIOD_OPTIONS: { id: Period; label: string }[] = [
  { id: "today", label: "Today" },
  { id: "week", label: "This Week" },
  { id: "month", label: "This Month" },
  { id: "year", label: "This Year" },
  { id: "all", label: "All Time" },
];

const TABS: { id: TabId; label: string; count?: string }[] = [
  { id: "overview", label: "Overview & Growth" },
  { id: "execution", label: "Execution Edge" },
  { id: "psychology", label: "Psychology & Timing" },
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

// ─── Performance Calculation ───
function computeStats(trades: Trade[]) {
  if (trades.length === 0) {
    return {
      netPnl: 0,
      winRate: 0,
      wins: 0,
      losses: 0,
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
      maxStreakWin: 0,
      maxStreakLoss: 0,
    };
  }

  const wins = trades.filter((t) => t.pnl > 0);
  const losses = trades.filter((t) => t.pnl <= 0);
  const totalPnl = trades.reduce((sum, t) => sum + t.pnl, 0);
  const grossProfit = wins.reduce((sum, t) => sum + t.pnl, 0);
  const grossLoss = Math.abs(losses.reduce((sum, t) => sum + t.pnl, 0));
  const winRate = trades.length > 0 ? (wins.length / trades.length) * 100 : 0;
  const avgWin = wins.length > 0 ? grossProfit / wins.length : 0;
  const avgLoss = losses.length > 0 ? grossLoss / losses.length : 0;
  const profitFactor = grossLoss > 0 ? grossProfit / grossLoss : grossProfit > 0 ? 99.9 : 0;
  const payoffRatio = avgLoss > 0 ? avgWin / avgLoss : avgWin > 0 ? 99.9 : 0;
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

  // Streaks
  let currentStreak = 0;
  let maxWinStreak = 0;
  let maxLossStreak = 0;
  trades.forEach((t) => {
    if (t.pnl > 0) {
      currentStreak = currentStreak > 0 ? currentStreak + 1 : 1;
      if (currentStreak > maxWinStreak) maxWinStreak = currentStreak;
    } else {
      currentStreak = currentStreak < 0 ? currentStreak - 1 : -1;
      if (Math.abs(currentStreak) > maxLossStreak) maxLossStreak = Math.abs(currentStreak);
    }
  });

  return {
    netPnl: totalPnl,
    winRate,
    wins: wins.length,
    losses: losses.length,
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
    maxStreakWin: maxWinStreak,
    maxStreakLoss: maxLossStreak,
  };
}

export default function AnalyticsPage() {
  const [period, setPeriod] = useState<Period>("all");
  const [activeTab, setActiveTab] = useState<TabId>("overview");
  const allTrades = useTradeStore((state) => state.trades);

  const filteredTrades = useMemo(
    () => filterTradesByPeriod(allTrades, period),
    [allTrades, period]
  );

  const stats = useMemo(() => computeStats(filteredTrades), [filteredTrades]);
  const isNetPositive = stats.netPnl >= 0;

  return (
    <div className="w-full max-w-[1440px] mx-auto px-4 lg:px-8 py-6 space-y-6">
      {/* ─── Header: Clean Title + Period Selector ─── */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2 border-b border-white/[0.04]">
        <div>
          <h1 className="text-xl font-bold tracking-tight text-white flex items-center gap-2">
            Trading Analytics
            <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-white/[0.04] text-neutral-400 font-normal">
              v2.0
            </span>
          </h1>
          <p className="text-xs text-neutral-400 mt-0.5">
            {filteredTrades.length} trades analyzed · {stats.wins}W / {stats.losses}L · Win Rate{" "}
            <span className="text-white font-medium">{stats.winRate.toFixed(1)}%</span>
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

      {/* ─── Linear Style Tab Switcher ─── */}
      <div className="flex items-center gap-1 border-b border-white/[0.04] pb-1">
        {TABS.map((tab) => {
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={cn(
                "relative px-4 py-2 text-xs font-medium transition-colors cursor-pointer rounded-lg",
                isActive ? "text-white" : "text-neutral-400 hover:text-neutral-200"
              )}
            >
              {tab.label}
              {isActive && (
                <motion.div
                  layoutId="activeTabUnderline"
                  className="absolute bottom-[-5px] left-2 right-2 h-[2px] bg-emerald-400 rounded-full"
                  transition={{ type: "spring", stiffness: 400, damping: 30 }}
                />
              )}
            </button>
          );
        })}
      </div>

      {/* ─── Animated Tab Views ─── */}
      <AnimatePresence mode="wait">
        {/* ══════════════════════════════════════════════════════════
            TAB 1: OVERVIEW & GROWTH
        ══════════════════════════════════════════════════════════ */}
        {activeTab === "overview" && (
          <motion.div
            key="overview"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.2 }}
            className="space-y-6"
          >
            {/* Top KPI Ribbon (Linear minimalist glass) */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
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
                  {stats.totalTrades} closed positions
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
                  {stats.wins} Wins · {stats.losses} Losses
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
                <div className="text-[10px] text-neutral-400 font-mono">Expected edge per trade</div>
              </div>
            </div>

            {/* Main Hero: Cumulative Return Curve */}
            <div className="p-5 rounded-2xl bg-[#0c0d14]/75 border border-white/[0.04] backdrop-blur-md">
              <CumulativePnlChart trades={filteredTrades} />
            </div>

            {/* Secondary Deep Edge Row */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              <div className="p-3.5 rounded-xl bg-white/[0.015] border border-white/[0.03] space-y-1">
                <span className="text-[10px] text-neutral-400 uppercase tracking-wider font-semibold">
                  Max Drawdown
                </span>
                <div className="text-sm font-mono font-bold text-rose-400">
                  -${stats.maxDrawdown.toFixed(0)}
                </div>
                <div className="text-[10px] text-neutral-400">Peak-to-trough drop</div>
              </div>

              <div className="p-3.5 rounded-xl bg-white/[0.015] border border-white/[0.03] space-y-1">
                <span className="text-[10px] text-neutral-400 uppercase tracking-wider font-semibold flex items-center gap-1">
                  <Award size={11} className="text-amber-400" /> Best Trade
                </span>
                <div className="text-sm font-mono font-bold text-emerald-400">
                  +{formatCurrency(stats.bestTrade)}
                </div>
                <div className="text-[10px] text-neutral-400">
                  Worst: {formatCurrency(stats.worstTrade)}
                </div>
              </div>

              <div className="p-3.5 rounded-xl bg-white/[0.015] border border-white/[0.03] space-y-1">
                <span className="text-[10px] text-neutral-400 uppercase tracking-wider font-semibold">
                  Avg Win / Loss
                </span>
                <div className="text-sm font-mono font-bold text-neutral-200">
                  +${stats.avgWin.toFixed(0)} / -${stats.avgLoss.toFixed(0)}
                </div>
                <div className="text-[10px] text-neutral-400">
                  Ratio: {stats.payoffRatio.toFixed(1)}:1
                </div>
              </div>

              <div className="p-3.5 rounded-xl bg-white/[0.015] border border-white/[0.03] space-y-1">
                <span className="text-[10px] text-neutral-400 uppercase tracking-wider font-semibold flex items-center gap-1">
                  <Flame size={11} className="text-amber-500" /> Streaks
                </span>
                <div className="text-sm font-mono font-bold text-neutral-200">
                  {stats.maxStreakWin}W · {stats.maxStreakLoss}L
                </div>
                <div className="text-[10px] text-neutral-400">Consecutive runs</div>
              </div>
            </div>
          </motion.div>
        )}

        {/* ══════════════════════════════════════════════════════════
            TAB 2: EXECUTION EDGE
        ══════════════════════════════════════════════════════════ */}
        {activeTab === "execution" && (
          <motion.div
            key="execution"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.2 }}
            className="space-y-6"
          >
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
              {/* Long vs Short Comparison */}
              <div className="lg:col-span-6 p-5 rounded-2xl bg-[#0c0d14]/75 border border-white/[0.04] backdrop-blur-md">
                <LongShortComparison trades={filteredTrades} />
              </div>

              {/* R-Multiple Distribution */}
              <div className="lg:col-span-6 p-5 rounded-2xl bg-[#0c0d14]/75 border border-white/[0.04] backdrop-blur-md">
                <RMultipleChart trades={filteredTrades} />
              </div>
            </div>

            {/* Instrument / Pair Edge Breakdown */}
            <div className="p-5 rounded-2xl bg-[#0c0d14]/75 border border-white/[0.04] backdrop-blur-md">
              <AssetPerformance trades={filteredTrades} />
            </div>
          </motion.div>
        )}

        {/* ══════════════════════════════════════════════════════════
            TAB 3: PSYCHOLOGY & TIMING
        ══════════════════════════════════════════════════════════ */}
        {activeTab === "psychology" && (
          <motion.div
            key="psychology"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.2 }}
            className="space-y-6"
          >
            {/* Emotion vs Performance (Preserved as requested) */}
            <EmotionCorrelation />

            {/* Session Breakdown & Holding Duration side by side */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
              <div className="p-5 rounded-2xl bg-[#0c0d14]/75 border border-white/[0.04] backdrop-blur-md">
                <SessionBreakdown trades={filteredTrades} />
              </div>
              <div className="p-5 rounded-2xl bg-[#0c0d14]/75 border border-white/[0.04] backdrop-blur-md">
                <DurationBreakdown trades={filteredTrades} />
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
