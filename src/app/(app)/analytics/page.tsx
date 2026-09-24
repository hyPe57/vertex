"use client";

import React, { useState, useMemo } from "react";
import { motion } from "framer-motion";
import { useTradeStore } from "@/stores";
import { cn, formatCurrency } from "@/lib/utils";
import type { Trade } from "@/types";
import {
  TrendingUp,
  TrendingDown,
  Target,
  Gauge,
  BarChart3,
  ShieldAlert,
  ArrowUpRight,
  ArrowDownRight,
} from "lucide-react";

// ─── Analytics Sub-Components ───
import { EmotionCorrelation } from "@/components/analytics/emotion-correlation";
import { RMultipleChart } from "@/components/analytics/r-multiple-chart";
import { LongShortComparison } from "@/components/analytics/long-short-comparison";
import { SessionBreakdown } from "@/components/analytics/session-breakdown";
import { DayOfWeekChart } from "@/components/analytics/day-of-week-chart";
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

// ─── Compute Aggregate Stats ───
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
  const profitFactor = grossLoss > 0 ? grossProfit / grossLoss : grossProfit > 0 ? Infinity : 0;
  const payoffRatio = avgLoss > 0 ? avgWin / avgLoss : avgWin > 0 ? Infinity : 0;
  const expectancy = (winRate / 100) * avgWin - ((100 - winRate) / 100) * avgLoss;
  const avgRR = trades.reduce((sum, t) => sum + (t.riskReward || 0), 0) / trades.length;

  // Max drawdown (simplified peak-to-trough)
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

// ─── KPI Card Component ───
function KpiCard({
  label,
  value,
  sub,
  isPositive,
  icon: Icon,
  delay = 0,
}: {
  label: string;
  value: string;
  sub?: string;
  isPositive?: boolean;
  icon: React.ComponentType<{ size?: number; className?: string }>;
  delay?: number;
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3, delay }}
      className="bg-[#0c0d14]/75 backdrop-blur-md rounded-2xl p-4 border border-white/[0.04] flex flex-col gap-2"
    >
      <div className="flex items-center justify-between">
        <span className="text-[10px] font-semibold uppercase tracking-wider text-neutral-400">
          {label}
        </span>
        <div className="w-6 h-6 rounded-lg bg-white/[0.03] border border-white/[0.05] flex items-center justify-center text-neutral-400">
          <Icon size={12} />
        </div>
      </div>
      <div
        className={cn(
          "text-xl font-bold tabular-nums tracking-tight",
          isPositive === true
            ? "text-emerald-400"
            : isPositive === false
            ? "text-rose-400"
            : "text-neutral-100"
        )}
      >
        {value}
      </div>
      {sub && (
        <div className="flex items-center gap-1">
          {isPositive !== undefined &&
            (isPositive ? (
              <ArrowUpRight size={10} className="text-emerald-400" />
            ) : (
              <ArrowDownRight size={10} className="text-rose-400" />
            ))}
          <span
            className={cn(
              "text-[10px] font-medium",
              isPositive === true
                ? "text-emerald-400/70"
                : isPositive === false
                ? "text-rose-400/70"
                : "text-neutral-500"
            )}
          >
            {sub}
          </span>
        </div>
      )}
    </motion.div>
  );
}

// ─── Main Analytics Page ───
export default function AnalyticsPage() {
  const [period, setPeriod] = useState<Period>("all");
  const allTrades = useTradeStore((state) => state.trades);

  const filteredTrades = useMemo(
    () => filterTradesByPeriod(allTrades, period),
    [allTrades, period]
  );

  const stats = useMemo(() => computeStats(filteredTrades), [filteredTrades]);

  return (
    <div className="w-full px-4 lg:px-6 py-4 space-y-5">
      {/* ─── Header & Period Filter ─── */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h1 className="text-xl font-bold text-neutral-100 tracking-tight">
            Performance Analytics
          </h1>
          <p className="text-[11px] text-neutral-400 mt-0.5">
            {filteredTrades.length} trades analyzed ·{" "}
            {stats.wins}W / {stats.losses}L
          </p>
        </div>

        {/* Period Segmented Control */}
        <div className="flex h-8 rounded-xl p-0.5 bg-white/[0.025] border border-white/[0.05] shrink-0">
          {PERIOD_OPTIONS.map((opt) => (
            <button
              key={opt.id}
              onClick={() => setPeriod(opt.id)}
              className={cn(
                "px-3 rounded-lg text-xs font-semibold transition-all cursor-pointer",
                period === opt.id
                  ? "bg-white/[0.08] text-white border border-white/[0.07] shadow-xs"
                  : "text-neutral-400 hover:text-neutral-200"
              )}
            >
              {opt.label}
            </button>
          ))}
        </div>
      </div>

      {/* ─── ROW 1: Pro Edge KPIs ─── */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3">
        <KpiCard
          label="Expectancy"
          value={`${stats.expectancy >= 0 ? "+" : ""}$${Math.abs(stats.expectancy).toFixed(0)}`}
          sub="per trade"
          isPositive={stats.expectancy >= 0}
          icon={Gauge}
          delay={0}
        />
        <KpiCard
          label="Profit Factor"
          value={stats.profitFactor === Infinity ? "∞" : stats.profitFactor.toFixed(2)}
          sub={`Payoff ${stats.payoffRatio === Infinity ? "∞" : stats.payoffRatio.toFixed(2)}R`}
          isPositive={stats.profitFactor > 1}
          icon={TrendingUp}
          delay={0.03}
        />
        <KpiCard
          label="Win Rate"
          value={`${stats.winRate.toFixed(1)}%`}
          sub={`${stats.wins}W / ${stats.losses}L`}
          isPositive={stats.winRate >= 50}
          icon={Target}
          delay={0.06}
        />
        <KpiCard
          label="Max Drawdown"
          value={`-$${stats.maxDrawdown.toFixed(0)}`}
          sub="peak to trough"
          isPositive={false}
          icon={ShieldAlert}
          delay={0.09}
        />
        <KpiCard
          label="Best Trade"
          value={formatCurrency(stats.bestTrade)}
          sub={`Worst: ${formatCurrency(stats.worstTrade)}`}
          isPositive={stats.bestTrade > 0}
          icon={ArrowUpRight}
          delay={0.12}
        />
        <KpiCard
          label="Net P&L"
          value={formatCurrency(stats.netPnl)}
          sub={`Avg RR ${stats.avgRR.toFixed(2)}`}
          isPositive={stats.netPnl >= 0}
          icon={BarChart3}
          delay={0.15}
        />
      </div>

      {/* ─── ROW 2: R-Multiple & Long vs Short ─── */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-4">
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3, delay: 0.1 }}
          className="lg:col-span-7"
        >
          <RMultipleChart trades={filteredTrades} />
        </motion.div>
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3, delay: 0.15 }}
          className="lg:col-span-5"
        >
          <LongShortComparison trades={filteredTrades} />
        </motion.div>
      </div>

      {/* ─── ROW 3: Session & Day of Week ─── */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3, delay: 0.15 }}
        >
          <SessionBreakdown trades={filteredTrades} />
        </motion.div>
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3, delay: 0.2 }}
        >
          <DayOfWeekChart trades={filteredTrades} />
        </motion.div>
      </div>

      {/* ─── ROW 4: Emotion vs Performance & Holding Duration ─── */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3, delay: 0.2 }}
        >
          <EmotionCorrelation />
        </motion.div>
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3, delay: 0.25 }}
        >
          <DurationBreakdown trades={filteredTrades} />
        </motion.div>
      </div>
    </div>
  );
}
