"use client";

import { motion } from "framer-motion";
import { EquityCurve } from "@/components/dashboard/equity-curve";
import { StatsCards } from "@/components/dashboard/stats-cards";
import { QuickLog } from "@/components/dashboard/quick-log";
import { mockPorts } from "@/lib/mock-data";
import { usePortStore, useCurrencyStore } from "@/stores";
import { formatCurrency, formatPercent } from "@/lib/utils";

export default function DashboardPage() {
  const { activePortId } = usePortStore();
  const { display } = useCurrencyStore();
  const activePort = mockPorts.find((p) => p.id === activePortId) || mockPorts[0];
  const pnl = activePort.currentBalance - activePort.initialBalance;
  const pnlPct = (pnl / activePort.initialBalance) * 100;

  return (
    <div className="p-6 lg:p-8 max-w-[1400px] mx-auto space-y-6">
      <header>
        <h1 className="text-2xl font-bold text-[var(--text-primary)]">Dashboard</h1>
        <p className="text-sm text-[var(--text-secondary)] mt-1">
          Welcome back. Here&apos;s your trading overview.
        </p>
      </header>

      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
        className="glass-card rounded-xl p-6"
      >
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-2">
          <div>
            <p className="text-xs font-medium uppercase tracking-wider text-[var(--text-tertiary)]">
              Account Balance
            </p>
            <h2 className="text-3xl font-bold font-mono text-[var(--text-primary)] mt-1">
              {formatCurrency(activePort.currentBalance, false)}
            </h2>
          </div>
          <div className="mt-2 sm:mt-0 text-right">
            <span
              className={`text-sm font-semibold font-mono ${
                pnl >= 0 ? "text-profit" : "text-loss"
              }`}
            >
              {display === "usd" ? formatCurrency(pnl) : formatPercent(pnlPct)}
            </span>
            <p className="text-[10px] text-[var(--text-tertiary)]">All Time</p>
          </div>
        </div>
        <EquityCurve />
      </motion.div>

      <StatsCards />

      <QuickLog />
    </div>
  );
}
