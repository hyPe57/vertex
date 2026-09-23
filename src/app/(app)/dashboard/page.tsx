"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { EquityCurve, TimeframePeriod } from "@/components/dashboard/equity-curve";
import { StatsCards } from "@/components/dashboard/stats-cards";
import { QuickLog } from "@/components/dashboard/quick-log";
import { mockPorts, mockAggregateStats } from "@/lib/mock-data";
import { usePortStore, useCurrencyStore } from "@/stores";
import { formatCurrency, formatPercent, cn } from "@/lib/utils";
import { TrendingUp, TrendingDown, ShieldCheck, Activity } from "lucide-react";

const timeframeOptions: { id: TimeframePeriod; label: string }[] = [
  { id: "today", label: "Today" },
  { id: "week", label: "Weekly" },
  { id: "month", label: "Monthly" },
  { id: "year", label: "Yearly" },
  { id: "all", label: "All Time" },
];

const periodPerformance: Record<
  TimeframePeriod,
  { pnl: number; pct: number; label: string }
> = {
  today: { pnl: 1155.0, pct: 9.88, label: "Today" },
  week: { pnl: 2140.0, pct: 19.98, label: "This Week" },
  month: { pnl: 2847.5, pct: 28.48, label: "This Month" },
  year: { pnl: 2847.5, pct: 28.48, label: "This Year" },
  all: { pnl: 2847.5, pct: 28.48, label: "All Time" },
};

export default function DashboardPage() {
  const { activePortId } = usePortStore();
  const { display } = useCurrencyStore();
  const [selectedPeriod, setSelectedPeriod] = useState<TimeframePeriod>("month");

  const activePort = mockPorts.find((p) => p.id === activePortId) || mockPorts[0];
  const currentPerf = periodPerformance[selectedPeriod];
  const isProfit = currentPerf.pnl >= 0;

  return (
    <div className="w-full px-4 lg:px-6 py-4">
      {/* Main Split-Column Workspace: Left and Right Equalized */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 items-stretch">
        {/* Left Column (8 cols): Master Performance Terminal */}
        <div className="lg:col-span-7 xl:col-span-8 flex flex-col">
          <motion.div
            initial={{ opacity: 0, y: 14 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.35 }}
            className="glass-card rounded-2xl p-6 flex flex-col justify-between h-full border border-[var(--border-primary)] shadow-sm gap-5"
          >
            {/* 1. Header: Live Status + Account Balance + Interactive Timeframe Tabs */}
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 pb-4 border-b border-[var(--border-primary)]/50">
              {/* Account Balance & Dynamic Period Gain */}
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <span className="flex h-2 w-2 relative">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
                    <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500" />
                  </span>
                  <span className="text-[10px] font-semibold uppercase tracking-wider text-[var(--text-tertiary)]">
                    {activePort.name} • LIVE SYNC
                  </span>
                </div>

                <div className="flex flex-wrap items-baseline gap-3 pt-0.5">
                  <h2 className="text-3xl sm:text-4xl font-bold font-mono tracking-tight text-[var(--text-primary)]">
                    {formatCurrency(activePort.currentBalance, false)}
                  </h2>

                  {/* Clean spacious badge without double plus */}
                  <div
                    className={cn(
                      "flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold font-mono border transition-all",
                      isProfit
                        ? "text-profit bg-profit/10 border-profit/25"
                        : "text-loss bg-loss/10 border-loss/25"
                    )}
                  >
                    {isProfit ? <TrendingUp size={13} /> : <TrendingDown size={13} />}
                    <span>
                      {display === "usd"
                        ? formatCurrency(currentPerf.pnl)
                        : formatPercent(currentPerf.pct)}
                    </span>
                    <span className="opacity-75 font-normal ml-0.5">
                      · {currentPerf.label}
                    </span>
                  </div>
                </div>
              </div>

              {/* Interactive Timeframe Tabs */}
              <div className="flex items-center p-1 rounded-xl bg-[var(--bg-secondary)] border border-[var(--border-primary)] text-xs shadow-xs self-stretch md:self-auto justify-between sm:justify-start">
                {timeframeOptions.map((opt) => {
                  const isActive = selectedPeriod === opt.id;
                  return (
                    <button
                      key={opt.id}
                      type="button"
                      onClick={() => setSelectedPeriod(opt.id)}
                      className={cn(
                        "px-3 py-1.5 rounded-lg text-xs font-medium transition-all duration-150 whitespace-nowrap",
                        isActive
                          ? "bg-brand-500/20 text-brand-400 font-semibold shadow-xs border border-brand-500/30"
                          : "text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:bg-surface-100"
                      )}
                    >
                      {opt.label}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* 2. Proportional 6 KPI Tiles Strip (Sparklines & Semicircles) */}
            <div className="w-full">
              <StatsCards />
            </div>

            {/* 3. Equity Curve Area Chart (Enlarged to fill space gracefully) */}
            <div className="w-full flex-1 flex flex-col justify-center min-h-[280px]">
              <div className="flex items-center justify-between text-xs text-[var(--text-tertiary)] px-1 mb-1">
                <span className="font-medium">Equity Trajectory ({currentPerf.label})</span>
                <span className="font-mono">
                  Low: $10,000.00 • High: $13,420.00
                </span>
              </div>
              <EquityCurve height={290} period={selectedPeriod} />
            </div>

            {/* 4. Bottom Metric Anchors (Eliminating empty void, providing institutional depth) */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-3.5 border-t border-[var(--border-primary)]/50">
              <div className="space-y-0.5">
                <p className="text-[10px] font-medium uppercase tracking-wider text-[var(--text-tertiary)]">
                  Starting Balance
                </p>
                <p className="text-sm font-semibold font-mono text-[var(--text-primary)]">
                  {formatCurrency(activePort.initialBalance, false)}
                </p>
              </div>

              <div className="space-y-0.5">
                <p className="text-[10px] font-medium uppercase tracking-wider text-[var(--text-tertiary)]">
                  Peak Capital
                </p>
                <p className="text-sm font-semibold font-mono text-profit">
                  $13,420.00
                </p>
              </div>

              <div className="space-y-0.5">
                <p className="text-[10px] font-medium uppercase tracking-wider text-[var(--text-tertiary)]">
                  Win / Loss
                </p>
                <p className="text-sm font-semibold font-mono text-[var(--text-primary)]">
                  {mockAggregateStats.wins}W / {mockAggregateStats.losses}L
                </p>
              </div>

              <div className="space-y-0.5">
                <p className="text-[10px] font-medium uppercase tracking-wider text-[var(--text-tertiary)]">
                  Profit Factor
                </p>
                <p className="text-sm font-semibold font-mono text-brand-400">
                  {mockAggregateStats.profitFactor.toFixed(2)}
                </p>
              </div>
            </div>
          </motion.div>
        </div>

        {/* Right Column (4 cols): Vertical QuickLog (Flush with the top edge & matches height) */}
        <div className="lg:col-span-5 xl:col-span-4 w-full flex flex-col">
          <QuickLog />
        </div>
      </div>
    </div>
  );
}
