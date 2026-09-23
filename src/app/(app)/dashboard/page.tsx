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
    <div className="w-full px-4 lg:px-6 py-5 space-y-5">
      {/* Page Header */}
      <header className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-[var(--text-primary)]">
            Dashboard
          </h1>
          <p className="text-xs text-[var(--text-secondary)] mt-0.5">
            Welcome back. Here&apos;s your live trading overview and quick logger.
          </p>
        </div>
      </header>

      {/* Top 6 Stats Cards */}
      <StatsCards />

      {/* Main Workspace: Left = Shortened Equity Curve | Right = Vertical Quick Log */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 items-start">
        {/* Left Column: Equity Curve */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.35 }}
          className="lg:col-span-7 xl:col-span-8 glass-card rounded-xl p-5 flex flex-col justify-between"
        >
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2 pb-3 border-b border-[var(--border-primary)]/50">
            <div>
              <p className="text-[10px] font-medium uppercase tracking-wider text-[var(--text-tertiary)]">
                Account Balance
              </p>
              <h2 className="text-3xl font-bold font-mono text-[var(--text-primary)] mt-0.5">
                {formatCurrency(activePort.currentBalance, false)}
              </h2>
            </div>
            <div className="text-left sm:text-right">
              <span
                className={cn(
                  "text-base font-semibold font-mono",
                  pnl >= 0 ? "text-profit" : "text-loss"
                )}
              >
                {display === "usd" ? formatCurrency(pnl) : formatPercent(pnlPct)}
              </span>
              <p className="text-[10px] text-[var(--text-tertiary)]">All Time Performance</p>
            </div>
          </div>

          <div className="w-full pt-2">
            <EquityCurve />
          </div>
        </motion.div>

        {/* Right Column: Vertical Quick Log */}
        <div className="lg:col-span-5 xl:col-span-4 w-full">
          <QuickLog />
        </div>
      </div>
    </div>
  );
}
