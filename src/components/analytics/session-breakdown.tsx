"use client";

import { useMemo } from "react";
import type { Trade } from "@/types";
import { cn } from "@/lib/utils";

const SESSION_LABELS: Record<string, string> = {
  asian: "Asian",
  london: "London",
  new_york: "New York",
  overlap: "Overlap",
};

export function SessionBreakdown({ trades }: { trades: Trade[] }) {
  const sessions = useMemo(() => {
    const groups: Record<string, Trade[]> = {
      asian: [],
      london: [],
      new_york: [],
      overlap: [],
    };

    trades.forEach((t) => {
      const s = t.session || "london";
      if (groups[s]) groups[s].push(t);
    });

    const result = Object.entries(groups).map(([key, arr]) => {
      const wins = arr.filter((t) => t.pnl > 0).length;
      const totalPnl = arr.reduce((s, t) => s + t.pnl, 0);
      const winRate = arr.length > 0 ? (wins / arr.length) * 100 : 0;
      const avgRR = arr.length > 0 ? arr.reduce((s, t) => s + (t.riskReward || 0), 0) / arr.length : 0;
      return {
        key,
        label: SESSION_LABELS[key] || key,
        count: arr.length,
        wins,
        winRate,
        totalPnl,
        avgRR,
      };
    });

    return result;
  }, [trades]);

  const maxPnl = Math.max(...sessions.map((s) => Math.abs(s.totalPnl)), 1);

  return (
    <div className="bg-[#0c0d14]/75 backdrop-blur-md rounded-2xl p-5 border border-white/[0.04] h-full">
      <h3 className="text-sm font-semibold text-neutral-100 tracking-tight mb-4">
        Session Performance
      </h3>
      <div className="space-y-4">
        {sessions.map((s) => {
          const isProfit = s.totalPnl >= 0;
          const barWidth = Math.max((Math.abs(s.totalPnl) / maxPnl) * 100, 2);
          return (
            <div key={s.key}>
              <div className="flex items-center justify-between mb-1.5">
                <span className="text-xs font-medium text-neutral-300">{s.label}</span>
                <span
                  className={cn(
                    "text-xs font-mono font-semibold tabular-nums",
                    isProfit ? "text-emerald-400" : "text-rose-400"
                  )}
                >
                  {isProfit ? "+" : "-"}${Math.abs(s.totalPnl).toFixed(0)}
                </span>
              </div>
              <div className="h-1.5 w-full bg-white/[0.03] rounded-full overflow-hidden">
                <div
                  className="h-full rounded-full transition-all duration-500"
                  style={{
                    width: `${barWidth}%`,
                    backgroundColor: isProfit ? "#22c55e" : "#ef4444",
                  }}
                />
              </div>
              <div className="flex gap-3 mt-1 text-[10px] text-neutral-500">
                <span>{s.count} trades</span>
                <span>{s.winRate.toFixed(0)}% WR</span>
                <span>{s.avgRR.toFixed(1)}R avg</span>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
