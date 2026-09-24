"use client";

import { useMemo } from "react";
import type { Trade } from "@/types";
import { formatCurrency, cn } from "@/lib/utils";

export function AssetPerformance({ trades }: { trades: Trade[] }) {
  const assetData = useMemo(() => {
    const map: Record<
      string,
      {
        asset: string;
        count: number;
        wins: number;
        pnl: number;
        volume: number;
      }
    > = {};

    trades.forEach((t) => {
      if (!map[t.asset]) {
        map[t.asset] = { asset: t.asset, count: 0, wins: 0, pnl: 0, volume: 0 };
      }
      map[t.asset].count += 1;
      if (t.pnl > 0) map[t.asset].wins += 1;
      map[t.asset].pnl += t.pnl;
      map[t.asset].volume += t.lotSize || 0;
    });

    return Object.values(map)
      .map((item) => ({
        ...item,
        winRate: item.count > 0 ? (item.wins / item.count) * 100 : 0,
      }))
      .sort((a, b) => b.pnl - a.pnl);
  }, [trades]);

  if (assetData.length === 0) {
    return (
      <div className="h-[200px] flex items-center justify-center text-xs text-neutral-500">
        No asset data available
      </div>
    );
  }

  return (
    <div className="w-full">
      <div className="flex items-center justify-between mb-4">
        <span className="text-xs font-medium text-neutral-400">Instrument Edge</span>
        <span className="text-[10px] text-neutral-400 font-mono">
          {assetData.length} active symbols
        </span>
      </div>

      <div className="space-y-3">
        {assetData.map((item) => {
          const isProfitable = item.pnl >= 0;
          return (
            <div
              key={item.asset}
              className="p-3 rounded-xl bg-white/[0.02] border border-white/[0.03] hover:border-white/[0.08] transition-colors"
            >
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-2">
                  <span className="text-xs font-semibold text-neutral-200 font-mono tracking-tight">
                    {item.asset}
                  </span>
                  <span className="text-[10px] text-neutral-400 bg-white/[0.04] px-1.5 py-0.5 rounded">
                    {item.count} trade{item.count > 1 ? "s" : ""}
                  </span>
                </div>
                <span
                  className={cn(
                    "text-xs font-mono font-bold",
                    isProfitable ? "text-emerald-400" : "text-rose-400"
                  )}
                >
                  {isProfitable ? "+" : ""}
                  {formatCurrency(item.pnl)}
                </span>
              </div>

              {/* Minimal Win Rate bar */}
              <div className="space-y-1">
                <div className="h-1.5 w-full bg-white/[0.04] rounded-full overflow-hidden">
                  <div
                    className={cn(
                      "h-full rounded-full transition-all duration-500",
                      item.winRate >= 50 ? "bg-emerald-400/80" : "bg-rose-400/80"
                    )}
                    style={{ width: `${item.winRate}%` }}
                  />
                </div>
                <div className="flex justify-between text-[10px] text-neutral-400">
                  <span>Win Rate: {item.winRate.toFixed(0)}%</span>
                  <span>{item.volume.toFixed(2)} Lots</span>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
