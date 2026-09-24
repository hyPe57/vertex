"use client";

import { useMemo } from "react";
import type { Trade } from "@/types";
import { cn } from "@/lib/utils";

interface DurationBucket {
  label: string;
  sub: string;
  count: number;
  wins: number;
  winRate: number;
  totalPnl: number;
  avgPnl: number;
}

export function DurationBreakdown({ trades }: { trades: Trade[] }) {
  const buckets = useMemo(() => {
    const defs = [
      { label: "Scalp", sub: "< 15 min", min: 0, max: 15 },
      { label: "Quick", sub: "15 – 60 min", min: 15, max: 60 },
      { label: "Intraday", sub: "1 – 4 hours", min: 60, max: 240 },
      { label: "Swing", sub: "> 4 hours", min: 240, max: Infinity },
    ];

    const result: DurationBucket[] = defs.map((def) => {
      const matching = trades.filter((t) => {
        if (!t.closeTime || !t.openTime) return false;
        const dur = (new Date(t.closeTime).getTime() - new Date(t.openTime).getTime()) / 60000;
        return dur >= def.min && dur < def.max;
      });

      const wins = matching.filter((t) => t.pnl > 0).length;
      const totalPnl = matching.reduce((s, t) => s + t.pnl, 0);
      const avgPnl = matching.length > 0 ? totalPnl / matching.length : 0;
      const winRate = matching.length > 0 ? (wins / matching.length) * 100 : 0;

      return {
        label: def.label,
        sub: def.sub,
        count: matching.length,
        wins,
        winRate,
        totalPnl,
        avgPnl,
      };
    });

    return result;
  }, [trades]);

  const maxPnl = Math.max(...buckets.map((b) => Math.abs(b.totalPnl)), 1);

  return (
    <div className="bg-[#0c0d14]/75 backdrop-blur-md rounded-2xl p-5 border border-white/[0.04] h-full">
      <h3 className="text-sm font-semibold text-neutral-100 tracking-tight mb-4">
        Holding Duration
      </h3>
      <div className="space-y-4">
        {buckets.map((b) => {
          const isProfit = b.totalPnl >= 0;
          const barWidth = b.count > 0 ? Math.max((Math.abs(b.totalPnl) / maxPnl) * 100, 3) : 0;
          return (
            <div key={b.label}>
              <div className="flex items-center justify-between mb-1.5">
                <div className="flex items-baseline gap-1.5">
                  <span className="text-xs font-medium text-neutral-300">{b.label}</span>
                  <span className="text-[10px] text-neutral-500">{b.sub}</span>
                </div>
                <span
                  className={cn(
                    "text-xs font-mono font-semibold tabular-nums",
                    b.count === 0
                      ? "text-neutral-500"
                      : isProfit
                      ? "text-emerald-400"
                      : "text-rose-400"
                  )}
                >
                  {b.count === 0
                    ? "—"
                    : `${isProfit ? "+" : "-"}$${Math.abs(b.avgPnl).toFixed(0)} avg`}
                </span>
              </div>
              <div className="h-1.5 w-full bg-white/[0.03] rounded-full overflow-hidden">
                {b.count > 0 && (
                  <div
                    className="h-full rounded-full transition-all duration-500"
                    style={{
                      width: `${barWidth}%`,
                      backgroundColor: isProfit ? "#22c55e" : "#ef4444",
                    }}
                  />
                )}
              </div>
              <div className="flex gap-3 mt-1 text-[10px] text-neutral-500">
                <span>{b.count} trades</span>
                {b.count > 0 && (
                  <>
                    <span>{b.winRate.toFixed(0)}% WR</span>
                    <span>
                      total {b.totalPnl >= 0 ? "+" : "-"}${Math.abs(b.totalPnl).toFixed(0)}
                    </span>
                  </>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
