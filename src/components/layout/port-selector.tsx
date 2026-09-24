"use client";

import React, { useState } from "react";
import { usePortStore, useCurrencyStore } from "@/stores";
import { SyncDot } from "@/components/ui";
import { formatCurrency, cn } from "@/lib/utils";
import { motion, AnimatePresence } from "framer-motion";
import { ConnectPortModal } from "./connect-port-modal";
import {
  ChevronDown,
  Plus,
  RefreshCw,
  Trash2,
  Check,
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
  const {
    ports,
    activePortId,
    setActivePort,
    portSelectorOpen,
    togglePortSelector,
    setPortSelectorOpen,
    deletePort,
    syncPort,
    setIsAddModalOpen,
  } = usePortStore();

  const { display, toggleDisplay } = useCurrencyStore();
  const [syncingId, setSyncingId] = useState<string | null>(null);

  const activePort =
    ports.find((p) => p.id === activePortId) || ports[0] || {
      id: "default",
      name: "No Account",
      platform: "mt5",
      currentBalance: 0,
      initialBalance: 0,
      syncStatus: "disconnected",
    };

  const handleSync = async (e: React.MouseEvent, id: string) => {
    e.stopPropagation();
    setSyncingId(id);
    await syncPort(id);
    setSyncingId(null);
  };

  const handleDelete = (e: React.MouseEvent, id: string) => {
    e.stopPropagation();
    if (ports.length <= 1) return;
    deletePort(id);
  };

  return (
    <>
      <div className="relative">
        {/* Trigger */}
        <button
          onClick={togglePortSelector}
          className={cn(
            "flex items-center gap-2 px-3 py-1.5 rounded-lg text-sm font-medium transition-all duration-200 cursor-pointer",
            "hover:bg-white/[0.04]",
            portSelectorOpen
              ? "bg-white/[0.06] text-white"
              : "text-neutral-300"
          )}
        >
          <SyncDot status={activePort.syncStatus} />
          <span className="text-xs font-mono text-neutral-400">
            {platformIcons[activePort.platform] || "ACC"}
          </span>
          <span className="font-medium text-white">{activePort.name}</span>
          <span className="text-xs font-mono text-neutral-400">
            {display === "usd"
              ? formatCurrency(activePort.currentBalance, false)
              : `${activePort.initialBalance > 0 ? (((activePort.currentBalance - activePort.initialBalance) / activePort.initialBalance) * 100).toFixed(2) : "0.00"}%`}
          </span>
          <motion.div
            animate={{ rotate: portSelectorOpen ? 180 : 0 }}
            transition={{ duration: 0.2 }}
          >
            <ChevronDown size={14} className="text-neutral-400" />
          </motion.div>
        </button>

        {/* Dropdown Panel */}
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
                className="absolute top-full left-0 mt-2 w-[440px] z-40 rounded-2xl border border-white/[0.08] bg-[#0c0d14] shadow-2xl backdrop-blur-xl overflow-hidden"
              >
                {/* Header */}
                <div className="flex items-center justify-between px-4 py-3 border-b border-white/[0.05]">
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-semibold uppercase tracking-wider text-neutral-400">
                      Trading Accounts ({ports.length})
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        toggleDisplay();
                      }}
                      className="flex items-center gap-1 px-2 py-0.5 rounded-md text-xs font-mono text-neutral-400 hover:bg-white/[0.05] transition-colors cursor-pointer"
                    >
                      <span className={cn(display === "usd" && "text-emerald-400 font-semibold")}>$</span>
                      <span className="text-neutral-600">/</span>
                      <span className={cn(display === "percent" && "text-emerald-400 font-semibold")}>%</span>
                    </button>
                  </div>
                </div>

                {/* Ports List */}
                <div className="p-3 space-y-2 max-h-[360px] overflow-y-auto">
                  {ports.map((port) => {
                    const pnl = port.currentBalance - port.initialBalance;
                    const pnlPct = port.initialBalance > 0 ? (pnl / port.initialBalance) * 100 : 0;
                    const isActive = port.id === activePortId;
                    const isSyncing = syncingId === port.id || port.syncStatus === "syncing";

                    return (
                      <div
                        key={port.id}
                        onClick={() => {
                          setActivePort(port.id);
                          setPortSelectorOpen(false);
                        }}
                        className={cn(
                          "group w-full flex items-center gap-3 p-3 rounded-xl border transition-all duration-200 text-left cursor-pointer",
                          isActive
                            ? "border-emerald-500/30 bg-emerald-500/[0.04]"
                            : "border-white/[0.03] hover:border-white/[0.08] hover:bg-white/[0.02]"
                        )}
                      >
                        {/* Platform Badge */}
                        <div className="flex items-center justify-center w-10 h-10 rounded-xl bg-white/[0.03] border border-white/[0.06] shrink-0">
                          <span className="text-xs font-bold font-mono text-neutral-200">
                            {platformIcons[port.platform] || "ACC"}
                          </span>
                        </div>

                        {/* Info */}
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2">
                            <span className="text-xs font-semibold text-white truncate">
                              {port.name}
                            </span>
                            <SyncDot status={isSyncing ? "syncing" : port.syncStatus} />
                            {isActive && (
                              <span className="text-[9px] font-mono px-1.5 py-0.2 rounded bg-emerald-500/10 text-emerald-400 font-medium">
                                ACTIVE
                              </span>
                            )}
                          </div>
                          <div className="flex items-center gap-2 text-[10px] text-neutral-400 mt-0.5">
                            <span>{platformLabels[port.platform] || port.platform}</span>
                            {port.accountNumber && (
                              <>
                                <span>·</span>
                                <span className="font-mono">#{port.accountNumber}</span>
                              </>
                            )}
                          </div>
                        </div>

                        {/* Balance & Actions */}
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

                          {/* Quick action buttons */}
                          <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                            <button
                              title="Sync Account"
                              onClick={(e) => handleSync(e, port.id)}
                              className="p-1 rounded-md text-neutral-400 hover:text-white hover:bg-white/[0.06] transition-colors"
                            >
                              <RefreshCw size={12} className={cn(isSyncing && "animate-spin text-emerald-400")} />
                            </button>
                            {ports.length > 1 && (
                              <button
                                title="Delete Account"
                                onClick={(e) => handleDelete(e, port.id)}
                                className="p-1 rounded-md text-neutral-400 hover:text-rose-400 hover:bg-rose-500/10 transition-colors"
                              >
                                <Trash2 size={12} />
                              </button>
                            )}
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>

                {/* Add New Button */}
                <div className="p-3 pt-1 border-t border-white/[0.04]">
                  <button
                    onClick={() => {
                      setPortSelectorOpen(false);
                      setIsAddModalOpen(true);
                    }}
                    className="w-full flex items-center justify-center gap-2 py-2.5 rounded-xl border border-dashed border-white/[0.08] text-xs font-medium text-neutral-300 hover:text-white hover:border-white/20 hover:bg-white/[0.02] transition-colors cursor-pointer"
                  >
                    <Plus size={14} className="text-emerald-400" />
                    เชื่อมต่อพอร์ตใหม่ (Connect Account)
                  </button>
                </div>
              </motion.div>
            </>
          )}
        </AnimatePresence>
      </div>

      {/* Real Connect Port Modal */}
      <ConnectPortModal />
    </>
  );
}
