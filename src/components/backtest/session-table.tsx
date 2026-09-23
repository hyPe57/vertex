"use client";

import React from "react";
import { mockBacktestSessions } from "@/lib/mock-data";
import { cn } from "@/lib/utils";
import { Calendar, Play, FileText, ArrowRight } from "lucide-react";

export function SessionTable() {
  // If mock data isn't available, provide fallback
  const sessions = mockBacktestSessions || [];

  return (
    <div className="rounded-2xl border border-white/[0.04] bg-[#0c0d14]/75 overflow-hidden flex flex-col h-full shadow-xs">
      <div className="p-4 flex items-center justify-between">
        <h3 className="font-medium text-[var(--text-primary)] flex items-center gap-2">
          <FileText className="w-4 h-4 text-[var(--text-muted)]" />
          Recent Sessions
        </h3>
        <button className="text-xs text-[var(--brand-primary)] font-medium hover:underline flex items-center gap-1">
          View All <ArrowRight className="w-3 h-3" />
        </button>
      </div>

      <div className="overflow-x-auto no-scrollbar flex-1">
        <table className="w-full text-sm text-left">
          <thead className="text-xs text-zinc-400 bg-white/[0.02] uppercase tracking-wider border-b border-white/[0.035] sticky top-0">
            <tr>
              <th className="px-4 py-3 font-medium">Name</th>
              <th className="px-4 py-3 font-medium">Asset / TF</th>
              <th className="px-4 py-3 font-medium">Trades</th>
              <th className="px-4 py-3 font-medium">Start Bal</th>
              <th className="px-4 py-3 font-medium">End Bal</th>
              <th className="px-4 py-3 font-medium">PnL</th>
              <th className="px-4 py-3 font-medium">Date</th>
              <th className="px-4 py-3 font-medium text-right">Action</th>
            </tr>
          </thead>
          <tbody>
            {sessions.length > 0 ? sessions.map((session, i) => (
              <tr key={i} className="border-b border-white/[0.025] last:border-b-0 hover:bg-white/[0.02] transition-colors">
                <td className="px-4 py-3 font-medium text-[var(--text-primary)]">{session.name || `Session ${i+1}`}</td>
                <td className="px-4 py-3">
                  <div className="flex items-center gap-2">
                    <span className="font-medium text-[var(--text-primary)]">{session.asset}</span>
                    <span className="text-xs px-1.5 py-0.5 rounded bg-[var(--surface-tertiary)] text-[var(--text-secondary)]">{session.timeframe}</span>
                  </div>
                </td>
                <td className="px-4 py-3 text-[var(--text-secondary)]">{session.totalTrades}</td>
                <td className="px-4 py-3 text-[var(--text-secondary)] font-mono">${(session.startingBalance || 10000).toLocaleString()}</td>
                <td className="px-4 py-3 text-[var(--text-primary)] font-mono">${(session.endingBalance || 10000).toLocaleString()}</td>
                <td className="px-4 py-3 font-mono">
                  {(() => {
                    const pnl = session.endingBalance - session.startingBalance;
                    return (
                      <span className={cn(
                        "px-2 py-1 rounded text-xs font-medium",
                        pnl > 0
                          ? "bg-profit/10 text-profit"
                          : pnl < 0
                            ? "bg-loss/10 text-loss"
                            : "text-[var(--text-secondary)]"
                      )}>
                        {pnl > 0 ? "+" : ""}${pnl.toLocaleString()}
                      </span>
                    );
                  })()}
                </td>
                <td className="px-4 py-3 text-[var(--text-secondary)] flex items-center gap-1.5">
                  <Calendar className="w-3 h-3" />
                  {new Date(session.createdAt).toLocaleDateString("en-US", { month: "short", day: "numeric" })}
                </td>
                <td className="px-4 py-3 text-right">
                  <button className="p-1.5 rounded-md hover:bg-[var(--brand-primary)]/10 text-[var(--brand-primary)] transition-colors">
                    <Play className="w-3.5 h-3.5" />
                  </button>
                </td>
              </tr>
            )) : (
              <tr>
                <td colSpan={8} className="px-4 py-8 text-center text-[var(--text-muted)]">
                  No backtest sessions found. Start a new session to see history.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
