"use client";

import { useMemo } from "react";
import type { Trade } from "@/types";
import { cn } from "@/lib/utils";

export function LongShortComparison({ trades }: { trades: Trade[] }) {
  const { long, short } = useMemo(() => {
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

    return { long: calc(longTrades), short: calc(shortTrades) };
  }, [trades]);

  const maxPnl = Math.max(Math.abs(long.totalPnl), Math.abs(short.totalPnl), 1);

  function StatRow({ label, longVal, shortVal, isCurrency }: { label: string; longVal: number; shortVal: number; isCurrency?: boolean }) {
    const fmt = (v: number) =>
      isCurrency
        ? `${v >= 0 ? "+" : "-"}$${Math.abs(v).toFixed(0)}`
        : typeof v === "number" && label.includes("%")
        ? `${v.toFixed(1)}%`
        : v.toFixed(label.includes("RR") ? 2 : 0);

    return (
      <div className="flex items-center justify-between text-[11px] py-1.5">
        <span className="font-mono font-medium text-emerald-400">{fmt(longVal)}</span>
        <span className="text-neutral-500 text-[10px] font-medium uppercase tracking-wider">{label}</span>
        <span className="font-mono font-medium text-rose-400">{fmt(shortVal)}</span>
      </div>
    );
  }

  return (
    <div className="bg-[#0c0d14]/75 backdrop-blur-md rounded-2xl p-5 border border-white/[0.04] h-full">
      <h3 className="text-sm font-semibold text-neutral-100 tracking-tight mb-4">
        Long vs Short Edge
      </h3>

      {/* Direction Headers */}
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-1.5">
          <div className="w-2 h-2 rounded-full bg-emerald-400" />
          <span className="text-xs font-semibold text-emerald-400">LONG</span>
          <span className="text-[10px] text-neutral-500 ml-1">{long.count} trades</span>
        </div>
        <div className="flex items-center gap-1.5">
          <span className="text-[10px] text-neutral-500 mr-1">{short.count} trades</span>
          <span className="text-xs font-semibold text-rose-400">SHORT</span>
          <div className="w-2 h-2 rounded-full bg-rose-400" />
        </div>
      </div>

      {/* PnL Visual Bar */}
      <div className="flex gap-1 mb-4 h-3">
        <div
          className="rounded-l-full transition-all"
          style={{
            width: `${Math.max((Math.abs(long.totalPnl) / maxPnl) * 50, 4)}%`,
            backgroundColor: long.totalPnl >= 0 ? "#22c55e" : "#ef4444",
            opacity: 0.7,
          }}
        />
        <div
          className="rounded-r-full transition-all"
          style={{
            width: `${Math.max((Math.abs(short.totalPnl) / maxPnl) * 50, 4)}%`,
            backgroundColor: short.totalPnl >= 0 ? "#22c55e" : "#ef4444",
            opacity: 0.7,
          }}
        />
      </div>

      {/* Stats Rows */}
      <div className="divide-y divide-white/[0.03]">
        <StatRow label="Win Rate %" longVal={long.winRate} shortVal={short.winRate} />
        <StatRow label="Total PnL" longVal={long.totalPnl} shortVal={short.totalPnl} isCurrency />
        <StatRow label="Avg PnL" longVal={long.avgPnl} shortVal={short.avgPnl} isCurrency />
        <StatRow label="Avg Win" longVal={long.avgWin} shortVal={short.avgWin} isCurrency />
        <StatRow label="Avg RR" longVal={long.avgRR} shortVal={short.avgRR} />
      </div>
    </div>
  );
}
