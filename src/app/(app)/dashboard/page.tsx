"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { EquityCurve, TimeframePeriod } from "@/components/dashboard/equity-curve";
import { StatsCards } from "@/components/dashboard/stats-cards";
import { QuickLog } from "@/components/dashboard/quick-log";
import { mockPorts } from "@/lib/mock-data";
import { usePortStore, useCurrencyStore } from "@/stores";
import { formatCurrency, formatPercent, cn } from "@/lib/utils";
import { TrendingUp, TrendingDown } from "lucide-react";

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
      {/* Main Split-Column Workspace */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 items-start">
        {/* Left Column (8 cols): Unified Master Trading Performance Console */}
        <div className="lg:col-span-7 xl:col-span-8">
          <motion.div
            initial={{ opacity: 0, y: 14 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.35 }}
            className="glass-card rounded-xl p-5 sm:p-6 flex flex-col gap-5 border border-[var(--border-primary)] shadow-sm"
          >
            {/* 1. Spacious Premium Header: Balance on Left | Interactive Timeframe Tabs on Right */}
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 pb-4 border-b border-[var(--border-primary)]/40">
              {/* Account Balance & Dynamic Period Gain */}
              <div className="space-y-1.5">
                <span className="text-[11px] font-semibold uppercase tracking-wider text-[var(--text-tertiary)]">
                  Account Balance
                </span>

                <div className="flex flex-wrap items-center gap-3">
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

              {/* Interactive Timeframe Segmented Control (Today, Weekly, Monthly, Yearly, All Time) */}
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
            <StatsCards />

            {/* 3. Equity Curve Area Chart (Filterable by Selected Timeframe) */}
            <div className="w-full pt-1">
              <EquityCurve height={240} period={selectedPeriod} />
            </div>
          </motion.div>
        </div>

        {/* Right Column (4 cols): Vertical QuickLog (Flush with the top edge) */}
        <div className="lg:col-span-5 xl:col-span-4 w-full">
          <QuickLog />
        </div>
      </div>
    </div>
  );
}
