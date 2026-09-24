"use client";

import React, { useState } from "react";
import { usePortStore, useCurrencyStore } from "@/stores";
import { formatCurrency, cn } from "@/lib/utils";
import { motion, AnimatePresence } from "framer-motion";
import type { Platform, Port } from "@/types";
import {
  ChevronDown,
  Plus,
  RefreshCw,
  Settings2,
  Check,
  TrendingUp,
  TrendingDown,
  ArrowLeft,
  Trash2,
  Loader2,
  Sparkles,
} from "lucide-react";

const PLATFORM_THEMES: Record<
  string,
  { label: string; badge: string; color: string; border: string }
> = {
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

const PLATFORMS: { id: Platform; tag: string; name: string }[] = [
  { id: "mt5", tag: "MT5", name: "MetaTrader 5" },
  { id: "mt4", tag: "MT4", name: "MetaTrader 4" },
  { id: "ctrader", tag: "cT", name: "cTrader" },
  { id: "tradelocker", tag: "TL", name: "TradeLocker" },
  { id: "topstepx", tag: "TX", name: "TopstepX" },
];

export function PortSelector() {
  const {
    ports,
    activePortId,
    setActivePort,
    portSelectorOpen,
    togglePortSelector,
    setPortSelectorOpen,
    syncPort,
    addPort,
    updatePort,
    deletePort,
  } = usePortStore();

  const { display, toggleDisplay } = useCurrencyStore();

  // Internal Navigation within the Dropdown: "list" | "connect" | "edit"
  const [view, setView] = useState<"list" | "connect" | "edit">("list");
  const [syncingId, setSyncingId] = useState<string | null>(null);
  const [editingTargetPort, setEditingTargetPort] = useState<Port | null>(null);

  // Form states for Connect
  const [connectPlatform, setConnectPlatform] = useState<Platform>("mt5");
  const [connectName, setConnectName] = useState("");
  const [connectInitialBalance, setConnectInitialBalance] = useState("10000");
  const [connectCurrentBalance, setConnectCurrentBalance] = useState("10000");
  const [connectAccountNumber, setConnectAccountNumber] = useState("");
  const [connectBrokerServer, setConnectBrokerServer] = useState("");
  const [isConnecting, setIsConnecting] = useState(false);

  // Form states for Edit
  const [editName, setEditName] = useState("");
  const [editCurrentBalance, setEditCurrentBalance] = useState("");
  const [confirmDelete, setConfirmDelete] = useState(false);

  const activePort =
    ports.find((p) => p.id === activePortId) ||
    ports[0] || {
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

  const handleOpenEdit = (e: React.MouseEvent, port: Port) => {
    e.stopPropagation();
    setEditingTargetPort(port);
    setEditName(port.name);
    setEditCurrentBalance(port.currentBalance.toString());
    setConfirmDelete(false);
    setView("edit");
  };

  const handleConnectSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!connectName.trim()) return;

    setIsConnecting(true);
    // Realistic short handshake
    await new Promise((res) => setTimeout(res, 800));

    addPort({
      name: connectName.trim(),
      platform: connectPlatform,
      initialBalance: parseFloat(connectInitialBalance) || 10000,
      currentBalance: parseFloat(connectCurrentBalance) || parseFloat(connectInitialBalance) || 10000,
      accountNumber: connectAccountNumber.trim() || undefined,
      brokerServer: connectBrokerServer.trim() || undefined,
    });

    setIsConnecting(false);
    setView("list");
    setConnectName("");
    setConnectAccountNumber("");
    setConnectBrokerServer("");
  };

  const handleEditSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingTargetPort || !editName.trim()) return;

    updatePort(editingTargetPort.id, {
      name: editName.trim(),
      currentBalance: parseFloat(editCurrentBalance) || editingTargetPort.currentBalance,
    });

    setView("list");
    setEditingTargetPort(null);
  };

  const handleDeletePort = () => {
    if (!editingTargetPort || ports.length <= 1) return;
    deletePort(editingTargetPort.id);
    setView("list");
    setEditingTargetPort(null);
  };

  return (
    <div className="relative">
      {/* ─── Header Trigger Pill ─── */}
      <button
        onClick={() => {
          if (!portSelectorOpen) setView("list");
          togglePortSelector();
        }}
        className={cn(
          "flex items-center gap-2.5 px-3 py-1.5 rounded-xl text-xs font-medium transition-all cursor-pointer border select-none",
          portSelectorOpen
            ? "bg-white/[0.08] border-white/20 text-white shadow-xs"
            : "bg-white/[0.03] border-white/[0.06] text-neutral-300 hover:bg-white/[0.06] hover:border-white/10 hover:text-white"
        )}
      >
        {/* Pulsing Status Dot */}
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

      {/* ─── Compact Inline Dropdown (NEVER pops up in center of screen!) ─── */}
      <AnimatePresence>
        {portSelectorOpen && (
          <>
            {/* Click-away backdrop */}
            <div
              className="fixed inset-0 z-40"
              onClick={() => {
                setPortSelectorOpen(false);
                setView("list");
              }}
            />

            <motion.div
              initial={{ opacity: 0, y: -6, scale: 0.98 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: -6, scale: 0.98 }}
              transition={{ type: "spring", damping: 25, stiffness: 380 }}
              className="absolute top-full right-0 mt-2.5 w-[380px] z-50 rounded-2xl border border-white/[0.08] bg-[#0c0d14]/98 shadow-2xl backdrop-blur-2xl overflow-hidden flex flex-col"
            >
              {/* ══════════════════════════════════════════════════════
                  VIEW 1: ACCOUNTS LIST & ACTIVE HERO
              ══════════════════════════════════════════════════════ */}
              {view === "list" && (
                <div className="p-4 space-y-3.5">
                  {/* Hero Active Account Card */}
                  <div className="p-3.5 rounded-xl bg-white/[0.025] border border-white/[0.06] space-y-2.5">
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
                            size={12}
                            className={cn(
                              syncingId === activePort.id && "animate-spin text-emerald-400"
                            )}
                          />
                        </button>
                        <button
                          title="Edit Port"
                          onClick={(e) => handleOpenEdit(e, activePort)}
                          className="p-1.5 rounded-lg text-neutral-400 hover:text-white hover:bg-white/[0.06] transition-colors cursor-pointer"
                        >
                          <Settings2 size={12} />
                        </button>
                      </div>
                    </div>

                    {/* Balance & Returns */}
                    <div className="flex items-baseline justify-between pt-0.5">
                      <div>
                        <span className="text-[10px] text-neutral-400 uppercase tracking-wider font-semibold block mb-0.5">
                          Balance
                        </span>
                        <div className="text-xl font-bold font-mono text-white tracking-tight">
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
                          {isProfit ? <TrendingUp size={11} /> : <TrendingDown size={11} />}
                          {isProfit ? "+" : ""}
                          {formatCurrency(activePnl)} ({activePnlPct.toFixed(2)}%)
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Account Switcher Header */}
                  <div className="flex items-center justify-between px-1">
                    <span className="text-[10px] font-bold uppercase tracking-wider text-neutral-400">
                      Trading Accounts ({ports.length})
                    </span>

                    {/* Currency Mode */}
                    <button
                      onClick={toggleDisplay}
                      className="flex items-center gap-1 px-1.5 py-0.5 rounded-md text-[10px] font-mono text-neutral-400 hover:text-white hover:bg-white/[0.04] transition-colors cursor-pointer"
                    >
                      <span className={cn(display === "usd" && "text-emerald-400 font-bold")}>$</span>
                      <span className="text-neutral-600">/</span>
                      <span className={cn(display === "percent" && "text-emerald-400 font-bold")}>%</span>
                    </button>
                  </div>

                  {/* Ports List */}
                  <div className="space-y-1.5 max-h-[190px] overflow-y-auto pr-1">
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
                                {theme.label}
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

                  {/* Connect Button (Inline Switch to View 2) */}
                  <div className="pt-2 border-t border-white/[0.05]">
                    <button
                      onClick={() => setView("connect")}
                      className="w-full flex items-center justify-center gap-2 py-2 rounded-xl bg-white/[0.04] hover:bg-white/[0.08] border border-white/[0.06] hover:border-white/15 text-xs font-semibold text-white transition-all cursor-pointer shadow-xs"
                    >
                      <Plus size={13} className="text-emerald-400" strokeWidth={2.5} />
                      เชื่อมต่อพอร์ตใหม่ (Connect Account)
                    </button>
                  </div>
                </div>
              )}

              {/* ══════════════════════════════════════════════════════
                  VIEW 2: INLINE CONNECT ACCOUNT FORM
              ══════════════════════════════════════════════════════ */}
              {view === "connect" && (
                <form onSubmit={handleConnectSubmit} className="p-4 space-y-3">
                  <div className="flex items-center justify-between pb-2 border-b border-white/[0.06]">
                    <button
                      type="button"
                      onClick={() => setView("list")}
                      className="flex items-center gap-1.5 text-xs text-neutral-400 hover:text-white transition-colors cursor-pointer"
                    >
                      <ArrowLeft size={13} />
                      กลับ (Back)
                    </button>
                    <span className="text-xs font-bold text-white">เชื่อมต่อพอร์ตใหม่</span>
                  </div>

                  {/* Platform Pills */}
                  <div>
                    <label className="text-[10px] font-semibold uppercase tracking-wider text-neutral-400 mb-1.5 block">
                      Platform
                    </label>
                    <div className="grid grid-cols-5 gap-1">
                      {PLATFORMS.map((p) => {
                        const isSelected = connectPlatform === p.id;
                        return (
                          <button
                            key={p.id}
                            type="button"
                            onClick={() => setConnectPlatform(p.id)}
                            className={cn(
                              "py-1.5 rounded-lg text-center font-mono text-[10px] font-bold border transition-all cursor-pointer",
                              isSelected
                                ? "bg-white/[0.1] border-white/25 text-white shadow-xs"
                                : "bg-white/[0.02] border-white/[0.04] text-neutral-400 hover:text-neutral-200"
                            )}
                          >
                            {p.tag}
                          </button>
                        );
                      })}
                    </div>
                  </div>

                  {/* Name */}
                  <div>
                    <label className="text-[10px] font-semibold uppercase tracking-wider text-neutral-400 mb-1 block">
                      ชื่อพอร์ต (Account Name)
                    </label>
                    <input
                      type="text"
                      value={connectName}
                      onChange={(e) => setConnectName(e.target.value)}
                      placeholder="เช่น FTMO 100K, Exness Live"
                      required
                      autoFocus
                      className="w-full h-8 rounded-lg border border-white/[0.06] bg-white/[0.02] px-2.5 text-xs text-white placeholder:text-neutral-500 focus:outline-none focus:border-white/20 transition-colors"
                    />
                  </div>

                  {/* Initial Balance with Quick Presets */}
                  <div>
                    <div className="flex items-center justify-between mb-1">
                      <label className="text-[10px] font-semibold uppercase tracking-wider text-neutral-400">
                        เงินทุนเริ่มต้น ($)
                      </label>
                      <div className="flex items-center gap-1">
                        {[10000, 25000, 50000, 100000].map((amt) => (
                          <button
                            key={amt}
                            type="button"
                            onClick={() => {
                              setConnectInitialBalance(amt.toString());
                              setConnectCurrentBalance(amt.toString());
                            }}
                            className={cn(
                              "px-1 py-0.2 rounded text-[9px] font-mono transition-colors cursor-pointer",
                              connectInitialBalance === amt.toString()
                                ? "bg-emerald-500/20 text-emerald-400 font-bold"
                                : "text-neutral-500 hover:text-neutral-300"
                            )}
                          >
                            ${amt / 1000}k
                          </button>
                        ))}
                      </div>
                    </div>
                    <input
                      type="number"
                      value={connectInitialBalance}
                      onChange={(e) => {
                        setConnectInitialBalance(e.target.value);
                        setConnectCurrentBalance(e.target.value);
                      }}
                      className="w-full h-8 rounded-lg border border-white/[0.06] bg-white/[0.02] px-2.5 text-xs text-white focus:outline-none focus:border-white/20 transition-colors font-mono"
                    />
                  </div>

                  {/* Server & Login in one row */}
                  <div className="grid grid-cols-2 gap-2">
                    <div>
                      <label className="text-[10px] font-semibold uppercase tracking-wider text-neutral-400 mb-1 block">
                        Server Name
                      </label>
                      <input
                        type="text"
                        value={connectBrokerServer}
                        onChange={(e) => setConnectBrokerServer(e.target.value)}
                        placeholder="FTMO-Server"
                        className="w-full h-8 rounded-lg border border-white/[0.06] bg-white/[0.02] px-2.5 text-xs text-white placeholder:text-neutral-500 focus:outline-none focus:border-white/20 transition-colors"
                      />
                    </div>
                    <div>
                      <label className="text-[10px] font-semibold uppercase tracking-wider text-neutral-400 mb-1 block">
                        Login ID
                      </label>
                      <input
                        type="text"
                        value={connectAccountNumber}
                        onChange={(e) => setConnectAccountNumber(e.target.value)}
                        placeholder="2094812"
                        className="w-full h-8 rounded-lg border border-white/[0.06] bg-white/[0.02] px-2.5 text-xs text-white placeholder:text-neutral-500 focus:outline-none focus:border-white/20 transition-colors font-mono"
                      />
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="pt-2 flex items-center justify-end gap-2 border-t border-white/[0.05]">
                    <button
                      type="button"
                      onClick={() => setView("list")}
                      className="px-3 py-1.5 rounded-lg text-xs text-neutral-400 hover:text-white cursor-pointer"
                    >
                      ยกเลิก
                    </button>
                    <button
                      type="submit"
                      disabled={isConnecting}
                      className="px-4 py-1.5 rounded-lg bg-white text-black hover:bg-neutral-200 text-xs font-semibold transition-all flex items-center gap-1.5 cursor-pointer"
                    >
                      {isConnecting ? (
                        <>
                          <Loader2 size={12} className="animate-spin" />
                          กำลังเชื่อมต่อ...
                        </>
                      ) : (
                        <>
                          <Check size={13} strokeWidth={2.5} />
                          เชื่อมต่อพอร์ต
                        </>
                      )}
                    </button>
                  </div>
                </form>
              )}

              {/* ══════════════════════════════════════════════════════
                  VIEW 3: INLINE EDIT PORT FORM
              ══════════════════════════════════════════════════════ */}
              {view === "edit" && editingTargetPort && (
                <form onSubmit={handleEditSubmit} className="p-4 space-y-3">
                  <div className="flex items-center justify-between pb-2 border-b border-white/[0.06]">
                    <button
                      type="button"
                      onClick={() => setView("list")}
                      className="flex items-center gap-1.5 text-xs text-neutral-400 hover:text-white transition-colors cursor-pointer"
                    >
                      <ArrowLeft size={13} />
                      กลับ (Back)
                    </button>
                    <span className="text-xs font-bold text-white">แก้ไขข้อมูลพอร์ต</span>
                  </div>

                  <div>
                    <label className="text-[10px] font-semibold uppercase tracking-wider text-neutral-400 mb-1 block">
                      ชื่อพอร์ต
                    </label>
                    <input
                      type="text"
                      value={editName}
                      onChange={(e) => setEditName(e.target.value)}
                      required
                      className="w-full h-8 rounded-lg border border-white/[0.06] bg-white/[0.02] px-2.5 text-xs text-white focus:outline-none focus:border-white/20 transition-colors"
                    />
                  </div>

                  <div>
                    <label className="text-[10px] font-semibold uppercase tracking-wider text-neutral-400 mb-1 block">
                      ยอดเงินคงเหลือ ($ Current Balance)
                    </label>
                    <input
                      type="number"
                      value={editCurrentBalance}
                      onChange={(e) => setEditCurrentBalance(e.target.value)}
                      step="any"
                      required
                      className="w-full h-8 rounded-lg border border-white/[0.06] bg-white/[0.02] px-2.5 text-xs text-white focus:outline-none focus:border-white/20 transition-colors font-mono"
                    />
                  </div>

                  {/* Delete option */}
                  {ports.length > 1 && (
                    <div className="pt-2 border-t border-white/[0.05]">
                      {confirmDelete ? (
                        <div className="p-2 rounded-lg bg-rose-500/10 border border-rose-500/20 flex items-center justify-between">
                          <span className="text-[11px] text-rose-400">ยืนยันลบพอร์ตนี้?</span>
                          <div className="flex items-center gap-1">
                            <button
                              type="button"
                              onClick={() => setConfirmDelete(false)}
                              className="px-2 py-0.5 rounded text-[10px] text-neutral-400 hover:text-white"
                            >
                              ไม่ลบ
                            </button>
                            <button
                              type="button"
                              onClick={handleDeletePort}
                              className="px-2 py-0.5 rounded bg-rose-500 text-white text-[10px] font-semibold"
                            >
                              ลบเลย
                            </button>
                          </div>
                        </div>
                      ) : (
                        <button
                          type="button"
                          onClick={() => setConfirmDelete(true)}
                          className="flex items-center gap-1 text-[11px] text-rose-400/80 hover:text-rose-400 transition-colors cursor-pointer"
                        >
                          <Trash2 size={11} />
                          ลบพอร์ตนี้ออกจากระบบ
                        </button>
                      )}
                    </div>
                  )}

                  {/* Actions */}
                  <div className="pt-2 flex items-center justify-end gap-2 border-t border-white/[0.05]">
                    <button
                      type="button"
                      onClick={() => setView("list")}
                      className="px-3 py-1.5 rounded-lg text-xs text-neutral-400 hover:text-white cursor-pointer"
                    >
                      ยกเลิก
                    </button>
                    <button
                      type="submit"
                      className="px-4 py-1.5 rounded-lg bg-white text-black hover:bg-neutral-200 text-xs font-semibold transition-all cursor-pointer"
                    >
                      บันทึก
                    </button>
                  </div>
                </form>
              )}
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
}
