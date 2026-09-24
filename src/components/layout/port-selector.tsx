"use client";

import React, { useState } from "react";
import { usePortStore, useCurrencyStore } from "@/stores";
import { formatCurrency, formatPercent, cn } from "@/lib/utils";
import { motion, AnimatePresence } from "framer-motion";
import { ConnectPortModal } from "./connect-port-modal";
import { EditPortModal } from "./edit-port-modal";
import {
  ChevronDown,
  Plus,
  RefreshCw,
  Settings2,
  Check,
  TrendingUp,
  TrendingDown,
  Wallet,
} from "lucide-react";

const PLATFORM_THEMES: Record<string, { label: string; badge: string; color: string; border: string }> = {
  mt5: {
    label: "MetaTrader 5",
    badge: "MT5",
    color: "text-emerald-400 bg-emerald-500/10",
    border: "border-emerald-500/20",
  },
  mt4: {
    label: "MetaTrader 4",
    badge: "MT4",
    color: "text-sky-400 bg-sky-500/10",
    border: "border-sky-500/20",
  },
  ctrader: {
    label: "cTrader",
    badge: "cT",
    color: "text-amber-400 bg-amber-500/10",
    border: "border-amber-500/20",
  },
  tradelocker: {
    label: "TradeLocker",
    badge: "TL",
    color: "text-purple-400 bg-purple-500/10",
    border: "border-purple-500/20",
  },
  topstepx: {
    label: "TopstepX",
    badge: "TX",
    color: "text-rose-400 bg-rose-500/10",
    border: "border-rose-500/20",
  },
};

export function PortSelector() {
  const {
    ports,
    activePortId,
    setActivePort,
    portSelectorOpen,
    togglePortSelector,
    setPortSelectorOpen,
    syncPort,
    setIsAddModalOpen,
    setEditingPort,
  } = usePortStore();

  const { display, toggleDisplay } = useCurrencyStore();
  const [syncingId, setSyncingId] = useState<string | null>(null);

  const activePort =
    ports.find((p) => p.id === activePortId) || ports[0] || {
      id: "default",
      name: "Default Port",
      platform: "mt5",
      currentBalance: 10000,
      initialBalance: 10000,
      syncStatus: "connected",
    };

  const activeTheme = PLATFORM_THEMES[activePort.platform] || PLATFORM_THEMES.mt5;
  const activePnl = activePort.currentBalance - activePort.initialBalance;
  const activePnlPct =
    activePort.initialBalance > 0 ? (activePnl / activePort.initialBalance) * 100 : 0;
  const isProfit = activePnl >= 0;

  const handleSync = async (e: React.MouseEvent, id: string) => {
    e.stopPropagation();
    setSyncingId(id);
    await syncPort(id);
    setSyncingId(null);
  };

  const handleOpenEdit = (e: React.MouseEvent, port: any) => {
    e.stopPropagation();
    setPortSelectorOpen(false);
    setEditingPort(port);
  };

  return (
    <>
      <div className="relative">
        {/* ─── Header Trigger Pill ─── */}
        <button
          onClick={togglePortSelector}
          className={cn(
            "flex items-center gap-2.5 px-3 py-1.5 rounded-xl text-xs font-medium transition-all cursor-pointer border select-none",
            portSelectorOpen
              ? "bg-white/[0.08] border-white/20 text-white shadow-xs"
              : "bg-white/[0.03] border-white/[0.06] text-neutral-300 hover:bg-white/[0.06] hover:border-white/10 hover:text-white"
          )}
        >
          {/* Pulsing Sync Dot */}
          <span className="relative flex h-2 w-2">
            <span
              className={cn(
                "animate-ping absolute inline-flex h-full w-full rounded-full opacity-75",
                activePort.syncStatus === "connected"
                  ? "bg-emerald-400"
                  : activePort.syncStatus === "syncing"
                  ? "bg-amber-400"
                  : "bg-neutral-500"
              )}
            />
            <span
              className={cn(
                "relative inline-flex rounded-full h-2 w-2",
                activePort.syncStatus === "connected"
                  ? "bg-emerald-400"
                  : activePort.syncStatus === "syncing"
                  ? "bg-amber-400"
                  : "bg-neutral-500"
              )}
            />
          </span>

          {/* Platform Tag */}
          <span className="font-mono text-[11px] font-semibold text-neutral-400">
            {activeTheme.badge}
          </span>

          {/* Port Name */}
          <span className="font-semibold text-white tracking-tight">
            {activePort.name}
          </span>

          {/* Balance */}
          <span className="font-mono text-[11px] font-bold text-neutral-200">
            {display === "usd"
              ? formatCurrency(activePort.currentBalance, false)
              : `${activePnlPct >= 0 ? "+" : ""}${activePnlPct.toFixed(2)}%`}
          </span>

          {/* Chevron */}
          <motion.div
            animate={{ rotate: portSelectorOpen ? 180 : 0 }}
            transition={{ duration: 0.2 }}
            className="text-neutral-400 ml-0.5"
          >
            <ChevronDown size={13} />
          </motion.div>
        </button>

        {/* ─── Dropdown Popover ─── */}
        <AnimatePresence>
          {portSelectorOpen && (
            <>
              {/* Invisible Click-away Backdrop */}
              <div
                className="fixed inset-0 z-40"
                onClick={() => setPortSelectorOpen(false)}
              />

              <motion.div
                initial={{ opacity: 0, y: -6, scale: 0.98 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: -6, scale: 0.98 }}
                transition={{ type: "spring", damping: 25, stiffness: 380 }}
                className="absolute top-full right-0 mt-2.5 w-[390px] z-50 rounded-2xl border border-white/[0.08] bg-[#090a0f]/95 shadow-2xl backdrop-blur-2xl overflow-hidden flex flex-col p-4 space-y-4"
              >
                {/* 1. Active Account Hero Card */}
                <div className="p-3.5 rounded-xl bg-white/[0.025] border border-white/[0.06] space-y-3">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <span
                        className={cn(
                          "px-2 py-0.5 rounded-md text-[10px] font-mono font-bold uppercase tracking-wider border",
                          activeTheme.color,
                          activeTheme.border
                        )}
                      >
                        {activeTheme.badge}
                      </span>
                      <span className="text-xs font-bold text-white tracking-tight">
                        {activePort.name}
                      </span>
                    </div>

                    <div className="flex items-center gap-1">
                      <button
                        title="Sync Account"
                        onClick={(e) => handleSync(e, activePort.id)}
                        className="p-1.5 rounded-lg text-neutral-400 hover:text-white hover:bg-white/[0.06] transition-colors cursor-pointer"
                      >
                        <RefreshCw
                          size={13}
                          className={cn(syncingId === activePort.id && "animate-spin text-emerald-400")}
                        />
                      </button>
                      <button
                        title="Edit Account"
                        onClick={(e) => handleOpenEdit(e, activePort)}
                        className="p-1.5 rounded-lg text-neutral-400 hover:text-white hover:bg-white/[0.06] transition-colors cursor-pointer"
                      >
                        <Settings2 size={13} />
                      </button>
                    </div>
                  </div>

                  {/* Balance & Returns */}
                  <div className="flex items-baseline justify-between pt-1">
                    <div>
                      <span className="text-[10px] text-neutral-400 uppercase tracking-wider font-semibold block mb-0.5">
                        Account Balance
                      </span>
                      <div className="text-2xl font-bold font-mono text-white tracking-tight">
                        {formatCurrency(activePort.currentBalance, false)}
                      </div>
                    </div>

                    <div className="text-right">
                      <span className="text-[10px] text-neutral-400 uppercase tracking-wider font-semibold block mb-0.5">
                        Net Return
                      </span>
                      <div
                        className={cn(
                          "text-xs font-mono font-bold flex items-center gap-0.5 justify-end",
                          isProfit ? "text-emerald-400" : "text-rose-400"
                        )}
                      >
                        {isProfit ? <TrendingUp size={12} /> : <TrendingDown size={12} />}
                        {isProfit ? "+" : ""}
                        {formatCurrency(activePnl)} ({activePnlPct.toFixed(2)}%)
                      </div>
                    </div>
                  </div>

                  {/* Server Info if available */}
                  {(activePort.brokerServer || activePort.accountNumber) && (
                    <div className="pt-2 border-t border-white/[0.04] flex items-center justify-between text-[10px] font-mono text-neutral-400">
                      <span>Server: {activePort.brokerServer || "Auto-detect"}</span>
                      <span>#{activePort.accountNumber || "—"}</span>
                    </div>
                  )}
                </div>

                {/* 2. Account Switcher List */}
                <div className="space-y-2">
                  <div className="flex items-center justify-between px-1">
                    <span className="text-[10px] font-bold uppercase tracking-wider text-neutral-400">
                      Switch Account ({ports.length})
                    </span>

                    {/* Currency Display Switcher */}
                    <button
                      onClick={toggleDisplay}
                      className="flex items-center gap-1 px-1.5 py-0.5 rounded-md text-[10px] font-mono text-neutral-400 hover:text-white hover:bg-white/[0.04] transition-colors cursor-pointer"
                    >
                      <span className={cn(display === "usd" && "text-emerald-400 font-bold")}>$</span>
                      <span className="text-neutral-600">/</span>
                      <span className={cn(display === "percent" && "text-emerald-400 font-bold")}>%</span>
                    </button>
                  </div>

                  <div className="space-y-1.5 max-h-[220px] overflow-y-auto pr-1">
                    {ports.map((port) => {
                      const isActive = port.id === activePortId;
                      const theme = PLATFORM_THEMES[port.platform] || PLATFORM_THEMES.mt5;
                      const pnl = port.currentBalance - port.initialBalance;
                      const pnlPct = port.initialBalance > 0 ? (pnl / port.initialBalance) * 100 : 0;

                      return (
                        <div
                          key={port.id}
                          onClick={() => {
                            setActivePort(port.id);
                            setPortSelectorOpen(false);
                          }}
                          className={cn(
                            "group w-full flex items-center justify-between p-2.5 rounded-xl border transition-all text-left cursor-pointer",
                            isActive
                              ? "bg-white/[0.06] border-white/15 shadow-xs"
                              : "bg-white/[0.015] border-white/[0.03] hover:bg-white/[0.04] hover:border-white/10"
                          )}
                        >
                          <div className="flex items-center gap-2.5 min-w-0">
                            {/* Platform badge */}
                            <span
                              className={cn(
                                "w-7 h-7 rounded-lg flex items-center justify-center font-mono text-[10px] font-bold shrink-0 border",
                                theme.color,
                                theme.border
                              )}
                            >
                              {theme.badge}
                            </span>

                            <div className="min-w-0">
                              <div className="flex items-center gap-1.5">
                                <span className="text-xs font-semibold text-white truncate">
                                  {port.name}
                                </span>
                                {isActive && (
                                  <div className="w-1.5 h-1.5 rounded-full bg-emerald-400 shrink-0" />
                                )}
                              </div>
                              <span className="text-[10px] text-neutral-400 block truncate font-mono">
                                {theme.label} {port.accountNumber ? `· #${port.accountNumber}` : ""}
                              </span>
                            </div>
                          </div>

                          <div className="flex items-center gap-2 shrink-0">
                            <div className="text-right">
                              <div className="text-xs font-bold font-mono text-white">
                                {formatCurrency(port.currentBalance, false)}
                              </div>
                              <div
                                className={cn(
                                  "text-[10px] font-mono font-medium",
                                  pnl >= 0 ? "text-emerald-400" : "text-rose-400"
                                )}
                              >
                                {pnl >= 0 ? "+" : ""}
                                {display === "usd"
                                  ? formatCurrency(pnl, false)
                                  : `${pnlPct.toFixed(2)}%`}
                              </div>
                            </div>

                            {/* Edit Port Icon */}
                            <button
                              title="Edit Port"
                              onClick={(e) => handleOpenEdit(e, port)}
                              className="p-1 rounded-md text-neutral-500 hover:text-white opacity-0 group-hover:opacity-100 transition-opacity"
                            >
                              <Settings2 size={12} />
                            </button>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>

                {/* 3. Bottom Action: Connect New Account */}
                <div className="pt-2 border-t border-white/[0.05]">
                  <button
                    onClick={() => {
                      setPortSelectorOpen(false);
                      setIsAddModalOpen(true);
                    }}
                    className="w-full flex items-center justify-center gap-2 py-2.5 rounded-xl bg-white/[0.04] hover:bg-white/[0.08] border border-white/[0.06] hover:border-white/15 text-xs font-semibold text-white transition-all cursor-pointer shadow-xs"
                  >
                    <Plus size={14} className="text-emerald-400" strokeWidth={2.5} />
                    เชื่อมต่อพอร์ตใหม่ (Connect Account)
                  </button>
                </div>
              </motion.div>
            </>
          )}
        </AnimatePresence>
      </div>

      {/* Connect Port Modal */}
      <ConnectPortModal />

      {/* Edit Port Modal */}
      <EditPortModal />
    </>
  );
}
