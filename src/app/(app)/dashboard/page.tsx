"use client";

import { motion } from "framer-motion";
import { EquityCurve } from "@/components/dashboard/equity-curve";
import { StatsCards } from "@/components/dashboard/stats-cards";
import { QuickLog } from "@/components/dashboard/quick-log";
import { mockPorts } from "@/lib/mock-data";
import { usePortStore, useCurrencyStore } from "@/stores";
import { formatCurrency, formatPercent, cn } from "@/lib/utils";

export default function DashboardPage() {
  const { activePortId } = usePortStore();
  const { display } = useCurrencyStore();
  const activePort = mockPorts.find((p) => p.id === activePortId) || mockPorts[0];
  const pnl = activePort.currentBalance - activePort.initialBalance;
  const pnlPct = (pnl / activePort.initialBalance) * 100;

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
            className="glass-card rounded-xl p-5 flex flex-col gap-4 border border-[var(--border-primary)] shadow-sm"
          >
            {/* 1. Header: Account Balance & Timeframe Controls */}
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 pb-3 border-b border-[var(--border-primary)]/50">
              <div>
                <p className="text-[10px] font-medium uppercase tracking-wider text-[var(--text-tertiary)]">
                  Account Balance
                </p>
                <div className="flex items-baseline gap-3 mt-0.5">
                  <h2 className="text-3xl font-bold font-mono text-[var(--text-primary)]">
                    {formatCurrency(activePort.currentBalance, false)}
                  </h2>
                  <span
                    className={cn(
                      "text-xs font-semibold font-mono px-2 py-0.5 rounded-full flex items-center gap-1",
                      pnl >= 0 ? "text-profit bg-profit/15" : "text-loss bg-loss/15"
                    )}
                  >
                    {pnl >= 0 ? "+" : ""}
                    {display === "usd" ? formatCurrency(pnl) : formatPercent(pnlPct)}
                    <span className="text-[10px] font-normal opacity-75">All Time</span>
                  </span>
                </div>
              </div>

              {/* Timeframe pill selector */}
              <div className="flex items-center gap-0.5 p-1 rounded-lg bg-[var(--bg-secondary)] border border-[var(--border-primary)] text-xs">
                {["1W", "1M", "3M", "ALL"].map((period) => (
                  <button
                    key={period}
                    type="button"
                    className={cn(
                      "px-2.5 py-1 rounded-md text-xs font-medium transition-all",
                      period === "1M"
                        ? "bg-brand-500/20 text-brand-400 font-semibold shadow-xs"
                        : "text-[var(--text-tertiary)] hover:text-[var(--text-primary)]"
                    )}
                  >
                    {period}
                  </button>
                ))}
              </div>
            </div>

            {/* 2. Proportional 6 KPI Tiles Strip (Sparklines & Semicircles) */}
            <StatsCards />

            {/* 3. Equity Curve Area Chart (Dynamic domain, zero wasted gap) */}
            <div className="w-full pt-1">
              <EquityCurve height={240} />
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
