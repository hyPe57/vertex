"use client";

import React, { useState } from "react";
import { useBacktestStore } from "@/stores/backtest-store";
import { formatCurrency, cn } from "@/lib/utils";
import {
  ArrowUpRight,
  ArrowDownRight,
  History,
  Layers,
  Trash2,
  CheckCircle2,
  AlertCircle,
} from "lucide-react";

export function SessionTable() {
  const { closedTrades, savedSessions, deleteSession, clearTrades } = useBacktestStore();
  const [tab, setTab] = useState<"trades" | "sessions">("trades");

  return (
    <div className="rounded-2xl border border-white/[0.04] bg-[#0c0d14]/80 backdrop-blur-md overflow-hidden flex flex-col h-full shadow-xs">
      {/* Header Tabs & Actions */}
      <div className="px-4 py-3 flex items-center justify-between border-b border-white/[0.04]">
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => setTab("trades")}
            className={cn(
              "flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer",
              tab === "trades"
                ? "bg-white/[0.08] text-white shadow-xs"
                : "text-neutral-400 hover:text-neutral-200"
            )}
          >
            <History size={13} />
            Current Session Trades ({closedTrades.length})
          </button>
          <button
            type="button"
            onClick={() => setTab("sessions")}
            className={cn(
              "flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer",
              tab === "sessions"
                ? "bg-white/[0.08] text-white shadow-xs"
                : "text-neutral-400 hover:text-neutral-200"
            )}
          >
            <Layers size={13} />
            Saved Sessions ({savedSessions.length})
          </button>
        </div>

        {tab === "trades" && closedTrades.length > 0 && (
          <button
            type="button"
            onClick={clearTrades}
            className="flex items-center gap-1 text-[11px] text-neutral-400 hover:text-rose-400 transition-colors cursor-pointer"
          >
            <Trash2 size={12} /> Clear Trades
          </button>
        )}
      </div>

      {/* Table Content */}
      <div className="overflow-x-auto no-scrollbar flex-1 max-h-[260px]">
        {tab === "trades" ? (
          <table className="w-full text-xs text-left">
            <thead className="text-[10px] text-neutral-400 bg-white/[0.015] uppercase tracking-wider border-b border-white/[0.03] sticky top-0 backdrop-blur-sm z-10">
              <tr>
                <th className="px-4 py-2.5 font-medium">Type</th>
                <th className="px-4 py-2.5 font-medium">Asset</th>
                <th className="px-4 py-2.5 font-medium">Lots</th>
                <th className="px-4 py-2.5 font-medium">Entry</th>
                <th className="px-4 py-2.5 font-medium">Exit</th>
                <th className="px-4 py-2.5 font-medium">Exit Reason</th>
                <th className="px-4 py-2.5 font-medium">Realized P&L</th>
                <th className="px-4 py-2.5 font-medium text-right">Return %</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/[0.02]">
              {closedTrades.length > 0 ? (
                closedTrades.map((t) => {
                  const isProfit = t.pnl >= 0;
                  return (
                    <tr key={t.id} className="hover:bg-white/[0.015] transition-colors">
                      <td className="px-4 py-2.5">
                        <span
                          className={cn(
                            "inline-flex items-center gap-0.5 px-2 py-0.5 rounded-full text-[10px] font-mono font-bold uppercase",
                            t.direction === "buy"
                              ? "bg-emerald-500/10 text-emerald-400 border border-emerald-500/20"
                              : "bg-rose-500/10 text-rose-400 border border-rose-500/20"
                          )}
                        >
                          {t.direction === "buy" ? (
                            <ArrowUpRight size={10} />
                          ) : (
                            <ArrowDownRight size={10} />
                          )}
                          {t.direction.toUpperCase()}
                        </span>
                      </td>
                      <td className="px-4 py-2.5 font-bold font-mono text-white">{t.asset}</td>
                      <td className="px-4 py-2.5 font-mono text-neutral-300">{t.lotSize}</td>
                      <td className="px-4 py-2.5 font-mono text-neutral-400">{t.entryPrice}</td>
                      <td className="px-4 py-2.5 font-mono text-neutral-400">{t.exitPrice}</td>
                      <td className="px-4 py-2.5">
                        <span
                          className={cn(
                            "px-2 py-0.5 rounded text-[10px] font-mono font-bold",
                            t.exitReason === "TP"
                              ? "bg-emerald-500/15 text-emerald-400 border border-emerald-500/20"
                              : t.exitReason === "SL"
                              ? "bg-rose-500/15 text-rose-400 border border-rose-500/20"
                              : "bg-neutral-500/15 text-neutral-300 border border-neutral-500/20"
                          )}
                        >
                          {t.exitReason}
                        </span>
                      </td>
                      <td className="px-4 py-2.5 font-mono font-bold">
                        <span className={isProfit ? "text-emerald-400" : "text-rose-400"}>
                          {isProfit ? "+" : ""}
                          {formatCurrency(t.pnl)}
                        </span>
                      </td>
                      <td className="px-4 py-2.5 font-mono text-right font-medium">
                        <span className={isProfit ? "text-emerald-400" : "text-rose-400"}>
                          {isProfit ? "+" : ""}
                          {t.pnlPercent.toFixed(2)}%
                        </span>
                      </td>
                    </tr>
                  );
                })
              ) : (
                <tr>
                  <td colSpan={8} className="px-4 py-10 text-center text-neutral-500 text-xs">
                    No closed trades yet in this session. Configure TP/SL, place an order, and step through candles!
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        ) : (
          <table className="w-full text-xs text-left">
            <thead className="text-[10px] text-neutral-400 bg-white/[0.015] uppercase tracking-wider border-b border-white/[0.03] sticky top-0 backdrop-blur-sm z-10">
              <tr>
                <th className="px-4 py-2.5 font-medium">Session Name</th>
                <th className="px-4 py-2.5 font-medium">Asset / TF</th>
                <th className="px-4 py-2.5 font-medium">Trades</th>
                <th className="px-4 py-2.5 font-medium">Win Rate</th>
                <th className="px-4 py-2.5 font-medium">Net P&L</th>
                <th className="px-4 py-2.5 font-medium">Date</th>
                <th className="px-4 py-2.5 font-medium text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/[0.02]">
              {savedSessions.length > 0 ? (
                savedSessions.map((sess) => {
                  const isProfitable = sess.netPnl >= 0;
                  return (
                    <tr key={sess.id} className="hover:bg-white/[0.015] transition-colors">
                      <td className="px-4 py-2.5 font-medium text-white">{sess.name}</td>
                      <td className="px-4 py-2.5 font-mono text-neutral-300">
                        {sess.asset} · {sess.timeframe}
                      </td>
                      <td className="px-4 py-2.5 font-mono text-neutral-400">{sess.totalTrades}</td>
                      <td className="px-4 py-2.5 font-mono text-neutral-200">{sess.winRate}%</td>
                      <td className="px-4 py-2.5 font-mono font-bold">
                        <span className={isProfitable ? "text-emerald-400" : "text-rose-400"}>
                          {isProfitable ? "+" : ""}
                          {formatCurrency(sess.netPnl)}
                        </span>
                      </td>
                      <td className="px-4 py-2.5 font-mono text-neutral-400">{sess.date}</td>
                      <td className="px-4 py-2.5 text-right">
                        <button
                          type="button"
                          onClick={() => deleteSession(sess.id)}
                          className="p-1 rounded text-neutral-500 hover:text-rose-400 transition-colors cursor-pointer"
                          title="Delete Session"
                        >
                          <Trash2 size={13} />
                        </button>
                      </td>
                    </tr>
                  );
                })
              ) : (
                <tr>
                  <td colSpan={7} className="px-4 py-10 text-center text-neutral-500 text-xs">
                    No saved sessions yet. Run trades and click "Save Run" in the control panel.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}
