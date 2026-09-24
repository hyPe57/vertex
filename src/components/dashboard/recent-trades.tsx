"use client";

import Link from "next/link";
import { formatCurrency, cn } from "@/lib/utils";
import { mockTrades } from "@/lib/mock-data";
import { ArrowRight, Clock } from "lucide-react";

export function RecentTradesCard() {
  const recentTrades = mockTrades.slice(0, 4);

  return (
    <div className="bg-[#0c0d14]/75 backdrop-blur-md rounded-2xl p-5 border border-white/[0.04] shadow-sm flex flex-col gap-3">
      {/* Header */}
      <div className="flex items-center justify-between pb-1 border-b border-white/[0.03]">
        <div className="flex items-center gap-2">
          <div className="w-6 h-6 rounded-lg bg-white/[0.03] border border-white/[0.05] flex items-center justify-center text-neutral-400">
            <Clock size={12} />
          </div>
          <div>
            <h2 className="text-sm font-semibold text-neutral-100 tracking-tight">Recent Trades</h2>
            <p className="text-[11px] text-neutral-400">Latest journal entries</p>
          </div>
        </div>

        <Link
          href="/history"
          className="text-[11px] font-medium text-neutral-400 hover:text-white flex items-center gap-1 transition-colors group"
        >
          <span>View all</span>
          <ArrowRight size={11} className="group-hover:translate-x-0.5 transition-transform" />
        </Link>
      </div>

      {/* Trades List */}
      <div className="divide-y divide-white/[0.025]">
        {recentTrades.map((trade) => {
          const isProfit = trade.pnl >= 0;
          return (
            <Link
              key={trade.id}
              href="/history"
              className="flex items-center justify-between py-2.5 px-2 -mx-2 rounded-xl hover:bg-white/[0.02] transition-colors group cursor-pointer"
            >
              {/* Asset & Direction Badge */}
              <div className="flex items-center gap-2.5">
                <span
                  className={cn(
                    "inline-flex items-center justify-center rounded-full px-2.5 py-0.5 text-[10px] font-bold tracking-wider uppercase shrink-0 min-w-[50px] text-center",
                    trade.direction === "long"
                      ? "bg-profit/10 text-profit"
                      : "bg-loss/10 text-loss"
                  )}
                >
                  {trade.direction.toUpperCase()}
                </span>
                <div className="flex flex-col">
                  <span className="text-xs font-semibold text-neutral-200 group-hover:text-white transition-colors">
                    {trade.asset}
                  </span>
                  <span className="text-[10px] text-neutral-500 tabular-nums">
                    {trade.lotSize} lots · {trade.tags?.[0] ? `#${trade.tags[0]}` : "Manual"}
                  </span>
                </div>
              </div>

              {/* P&L & RR */}
              <div className="text-right flex flex-col items-end">
                <span
                  className={cn(
                    "text-xs font-semibold tabular-nums tracking-tight",
                    isProfit ? "text-emerald-400" : "text-rose-400"
                  )}
                >
                  {formatCurrency(trade.pnl)}
                </span>
                <span className="text-[10px] text-neutral-500 tabular-nums">
                  RR 1:{trade.riskReward.toFixed(2)}
                </span>
              </div>
            </Link>
          );
        })}
      </div>
    </div>
  );
}
