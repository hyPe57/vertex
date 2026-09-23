"use client";

import { usePortStore, useCurrencyStore } from "@/stores";
import { mockPorts } from "@/lib/mock-data";
import { SyncDot } from "@/components/ui";
import { formatCurrency } from "@/lib/utils";
import { cn } from "@/lib/utils";
import { motion, AnimatePresence } from "framer-motion";
import {
  ChevronDown,
  Plus,
  Monitor,
  Wifi,
  WifiOff,
} from "lucide-react";

const platformLabels: Record<string, string> = {
  mt4: "MetaTrader 4",
  mt5: "MetaTrader 5",
  ctrader: "cTrader",
  tradelocker: "TradeLocker",
  topstepx: "TopstepX",
};

const platformIcons: Record<string, string> = {
  mt4: "MT4",
  mt5: "MT5",
  ctrader: "cT",
  tradelocker: "TL",
  topstepx: "TX",
};

export function PortSelector() {
  const { activePortId, setActivePort, portSelectorOpen, togglePortSelector, setPortSelectorOpen } =
    usePortStore();
  const { display, toggleDisplay } = useCurrencyStore();
  const activePort = mockPorts.find((p) => p.id === activePortId) || mockPorts[0];

  return (
    <div className="relative">
      {/* Trigger */}
      <button
        onClick={togglePortSelector}
        className={cn(
          "flex items-center gap-2 px-3 py-1.5 rounded-lg text-sm font-medium transition-all duration-200",
          "hover:bg-surface-100 dark:hover:bg-surface-100",
          portSelectorOpen
            ? "bg-surface-100 dark:bg-surface-100 text-[var(--text-primary)]"
            : "text-[var(--text-secondary)]"
        )}
      >
        <SyncDot status={activePort.syncStatus} />
        <span className="text-xs font-mono text-[var(--text-tertiary)]">
          {platformIcons[activePort.platform]}
        </span>
        <span>{activePort.name}</span>
        <span className="text-xs font-mono text-[var(--text-tertiary)]">
          {display === "usd"
            ? formatCurrency(activePort.currentBalance, false)
            : `${(((activePort.currentBalance - activePort.initialBalance) / activePort.initialBalance) * 100).toFixed(2)}%`}
        </span>
        <motion.div
          animate={{ rotate: portSelectorOpen ? 180 : 0 }}
          transition={{ duration: 0.2 }}
        >
          <ChevronDown size={14} />
        </motion.div>
      </button>

      {/* Slide-down Panel */}
      <AnimatePresence>
        {portSelectorOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 z-30"
              onClick={() => setPortSelectorOpen(false)}
            />
            <motion.div
              initial={{ opacity: 0, y: -8, scale: 0.98 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: -8, scale: 0.98 }}
              transition={{ type: "spring", damping: 25, stiffness: 350 }}
              className="absolute top-full left-0 mt-2 w-[440px] z-40 rounded-xl border border-[var(--border-primary)] bg-[var(--bg-primary)] shadow-xl dark:shadow-2xl overflow-hidden"
            >
              {/* Header */}
              <div className="flex items-center justify-between px-4 py-3 border-b border-[var(--border-primary)]">
                <span className="text-xs font-semibold uppercase tracking-wider text-[var(--text-tertiary)]">
                  Trading Accounts
                </span>
                <div className="flex items-center gap-2">
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      toggleDisplay();
                    }}
                    className="flex items-center gap-1 px-2 py-1 rounded-md text-xs font-mono text-[var(--text-tertiary)] hover:bg-surface-100 dark:hover:bg-surface-100 transition-colors"
                  >
                    <span className={cn(display === "usd" && "text-brand-500 font-semibold")}>$</span>
                    <span className="text-[var(--text-tertiary)]">/</span>
                    <span className={cn(display === "percent" && "text-brand-500 font-semibold")}>%</span>
                  </button>
                </div>
              </div>

              {/* Port Cards */}
              <div className="p-3 space-y-2">
                {mockPorts.map((port) => {
                  const pnl = port.currentBalance - port.initialBalance;
                  const pnlPct = (pnl / port.initialBalance) * 100;
                  const isActive = port.id === activePortId;

                  return (
                    <motion.button
                      key={port.id}
                      onClick={() => {
                        setActivePort(port.id);
                        setPortSelectorOpen(false);
                      }}
                      whileHover={{ scale: 1.01 }}
                      whileTap={{ scale: 0.99 }}
                      className={cn(
                        "w-full flex items-center gap-3 p-3 rounded-lg border transition-all duration-200 text-left",
                        isActive
                          ? "border-brand-500/30 bg-brand-500/5"
                          : "border-transparent hover:border-[var(--border-primary)] hover:bg-[var(--bg-secondary)]"
                      )}
                    >
                      {/* Platform Badge */}
                      <div className="flex items-center justify-center w-10 h-10 rounded-lg bg-surface-100 dark:bg-surface-100">
                        <span className="text-xs font-bold font-mono text-[var(--text-secondary)]">
                          {platformIcons[port.platform]}
                        </span>
                      </div>

                      {/* Info */}
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2">
                          <span className="text-sm font-medium text-[var(--text-primary)] truncate">
                            {port.name}
                          </span>
                          <SyncDot status={port.syncStatus} />
                        </div>
                        <span className="text-xs text-[var(--text-tertiary)]">
                          {platformLabels[port.platform]}
                        </span>
                      </div>

                      {/* Balance */}
                      <div className="text-right">
                        <div className="text-sm font-semibold font-mono text-[var(--text-primary)]">
                          {formatCurrency(port.currentBalance, false)}
                        </div>
                        <div
                          className={cn(
                            "text-xs font-mono",
                            pnl >= 0 ? "text-profit" : "text-loss"
                          )}
                        >
                          {pnl >= 0 ? "+" : ""}
                          {display === "usd"
                            ? formatCurrency(pnl, false)
                            : `${pnlPct.toFixed(2)}%`}
                        </div>
                      </div>
                    </motion.button>
                  );
                })}
              </div>

              {/* Add New */}
              <div className="px-3 pb-3">
                <button className="w-full flex items-center justify-center gap-2 py-2.5 rounded-lg border border-dashed border-[var(--border-primary)] text-xs font-medium text-[var(--text-tertiary)] hover:text-brand-500 hover:border-brand-500/30 transition-colors">
                  <Plus size={14} />
                  Add Trading Account
                </button>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
}
