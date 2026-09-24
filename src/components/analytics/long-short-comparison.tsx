"use client";

import { useMemo } from "react";
import type { Trade } from "@/types";
import { formatCurrency, cn } from "@/lib/utils";
import { ArrowUpRight, ArrowDownRight } from "lucide-react";

export function LongShortComparison({ trades }: { trades: Trade[] }) {
  const { long, short, totalCount } = useMemo(() => {
    const longTrades = trades.filter((t) => t.direction === "long");
    const shortTrades = trades.filter((t) => t.direction === "short");

    function calc(arr: Trade[]) {
      const wins = arr.filter((t) => t.pnl > 0);
      const totalPnl = arr.reduce((s, t) => s + t.pnl, 0);
      const avgPnl = arr.length > 0 ? totalPnl / arr.length : 0;
      const winRate = arr.length > 0 ? (wins.length / arr.length) * 100 : 0;
      const avgRR = arr.length > 0 ? arr.reduce((s, t) => s + (t.riskReward || 0), 0) / arr.length : 0;
      const avgWin = wins.length > 0 ? wins.reduce((s, t) => s + t.pnl, 0) / wins.length : 0;
      return { count: arr.length, wins: wins.length, winRate, totalPnl, avgPnl, avgRR, avgWin };
    }

    return {
      long: calc(longTrades),
      short: calc(shortTrades),
      totalCount: trades.length,
    };
  }, [trades]);

  const longPercent = totalCount > 0 ? (long.count / totalCount) * 100 : 50;
  const shortPercent = totalCount > 0 ? (short.count / totalCount) * 100 : 50;

  return (
    <div className="bg-[#0c0d14]/75 backdrop-blur-md rounded-2xl p-5 border border-white/[0.04] h-full flex flex-col justify-between">
      <div className="flex items-center justify-between mb-4">
        <span className="text-xs font-medium text-neutral-400">Directional Bias & Edge</span>
        <span className="text-[10px] text-neutral-400 font-mono">
          {long.count} Long / {short.count} Short
        </span>
      </div>

      {/* Visual Split Ratio Bar */}
      <div className="space-y-1.5 mb-6">
        <div className="h-2 w-full bg-white/[0.03] rounded-full overflow-hidden flex gap-1 p-0.5">
          <div
            className="h-full rounded-full bg-emerald-500/80 transition-all duration-500"
            style={{ width: `${longPercent}%` }}
          />
          <div
            className="h-full rounded-full bg-rose-500/80 transition-all duration-500"
            style={{ width: `${shortPercent}%` }}
          />
        </div>
        <div className="flex justify-between text-[10px] font-mono">
          <span className="text-emerald-400 flex items-center gap-0.5">
            <ArrowUpRight size={10} /> Long ({longPercent.toFixed(0)}%)
          </span>
          <span className="text-rose-400 flex items-center gap-0.5">
            <ArrowDownRight size={10} /> Short ({shortPercent.toFixed(0)}%)
          </span>
        </div>
      </div>

      {/* Side-by-side Dual Cards */}
      <div className="grid grid-cols-2 gap-3">
        {/* Long Side */}
        <div className="p-4 rounded-xl bg-emerald-500/[0.03] border border-emerald-500/10 space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-bold tracking-wider text-emerald-400 uppercase">
              Long Trades
            </span>
            <span className="text-[10px] text-neutral-400 font-mono">{long.count} trades</span>
          </div>

          <div>
            <div className="text-lg font-bold font-mono text-emerald-400">
              {long.totalPnl >= 0 ? "+" : ""}
              {formatCurrency(long.totalPnl)}
            </div>
            <div className="text-[10px] text-neutral-400 mt-0.5">Total Return</div>
          </div>

          <div className="pt-2 border-t border-emerald-500/10 space-y-1.5 text-[11px] font-mono">
            <div className="flex justify-between">
              <span className="text-neutral-400">Win Rate</span>
              <span className="text-neutral-200">{long.winRate.toFixed(1)}%</span>
            </div>
            <div className="flex justify-between">
              <span className="text-neutral-400">Avg Trade</span>
              <span className={long.avgPnl >= 0 ? "text-emerald-400" : "text-rose-400"}>
                {long.avgPnl >= 0 ? "+" : ""}
                {formatCurrency(long.avgPnl)}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-neutral-400">Avg R:R</span>
              <span className="text-neutral-200">{long.avgRR.toFixed(2)}</span>
            </div>
          </div>
        </div>

        {/* Short Side */}
        <div className="p-4 rounded-xl bg-rose-500/[0.03] border border-rose-500/10 space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-bold tracking-wider text-rose-400 uppercase">
              Short Trades
            </span>
            <span className="text-[10px] text-neutral-400 font-mono">{short.count} trades</span>
          </div>

          <div>
            <div className="text-lg font-bold font-mono text-rose-400">
              {short.totalPnl >= 0 ? "+" : ""}
              {formatCurrency(short.totalPnl)}
            </div>
            <div className="text-[10px] text-neutral-400 mt-0.5">Total Return</div>
          </div>

          <div className="pt-2 border-t border-rose-500/10 space-y-1.5 text-[11px] font-mono">
            <div className="flex justify-between">
              <span className="text-neutral-400">Win Rate</span>
              <span className="text-neutral-200">{short.winRate.toFixed(1)}%</span>
            </div>
            <div className="flex justify-between">
              <span className="text-neutral-400">Avg Trade</span>
              <span className={short.avgPnl >= 0 ? "text-emerald-400" : "text-rose-400"}>
                {short.avgPnl >= 0 ? "+" : ""}
                {formatCurrency(short.avgPnl)}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-neutral-400">Avg R:R</span>
              <span className="text-neutral-200">{short.avgRR.toFixed(2)}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
