"use client";

import { useMemo } from "react";
import { formatCurrency, cn } from "@/lib/utils";

interface HourSlot {
  hour: number;
  label: string;
  pnl: number;
  trades: number;
}

export function HourlyHeatmap() {
  const hourlyData: HourSlot[] = useMemo(() => {
    // Generate realistic trading session distribution (Asian, London, New York)
    return Array.from({ length: 24 }, (_, i) => {
      let pnl = 0;
      let trades = 0;

      // London open (08:00 - 11:00 UTC)
      if (i >= 8 && i <= 11) {
        pnl = [380, 840, -120, 460][i - 8];
        trades = [3, 5, 2, 4][i - 8];
      }
      // NY open & overlap (13:00 - 17:00 UTC)
      else if (i >= 13 && i <= 17) {
        pnl = [620, 450, -210, 710, 180][i - 13];
        trades = [4, 4, 3, 5, 2][i - 13];
      }
      // Asian session (01:00 - 05:00 UTC)
      else if (i >= 2 && i <= 5) {
        pnl = [-80, 150, -140, 210][i - 2];
        trades = [1, 2, 2, 2][i - 2];
      }

      return {
        hour: i,
        label: i.toString().padStart(2, "0"),
        pnl,
        trades,
      };
    });
  }, []);

  return (
    <div className="bg-[#0c0d14]/75 backdrop-blur-md rounded-2xl p-5 border border-white/[0.04] shadow-sm flex flex-col justify-between">
      {/* Header */}
      <div className="flex items-center justify-between pb-1">
        <div>
          <h2 className="text-sm font-semibold text-neutral-100 tracking-tight">
            Hourly P&L Heatmap
          </h2>
          <p className="text-[11px] text-neutral-400 mt-0.5">
            Net performance distribution by entry hour (24H UTC)
          </p>
        </div>
        <div className="flex items-center gap-3 text-xs">
          <div className="flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-sm bg-emerald-400/80" />
            <span className="text-[11px] text-neutral-400">Profit</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-sm bg-rose-400/80" />
            <span className="text-[11px] text-neutral-400">Loss</span>
          </div>
        </div>
      </div>

      {/* Heatmap Grid: 24 hours */}
      <div className="mt-3.5 overflow-x-auto pb-1">
        <div className="grid grid-cols-12 sm:grid-cols-24 gap-1.5 min-w-[500px]">
          {hourlyData.map((slot) => {
            const hasTrades = slot.trades > 0;
            const isProfit = slot.pnl > 0;
            const isLoss = slot.pnl < 0;

            let bgClass = "bg-[var(--bg-secondary)]/50 text-[var(--text-tertiary)] opacity-40";
            if (isProfit) {
              bgClass =
                slot.pnl > 500
                  ? "bg-emerald-500/35 text-emerald-400 border border-emerald-500/50 shadow-xs"
                  : "bg-emerald-500/20 text-emerald-400 border border-emerald-500/30";
            } else if (isLoss) {
              bgClass = "bg-red-500/25 text-red-400 border border-red-500/40";
            }

            return (
              <div
                key={slot.hour}
                title={`${slot.label}:00 - ${hasTrades ? `${formatCurrency(slot.pnl)} (${slot.trades} trades)` : "No trades"}`}
                className={cn(
                  "flex flex-col items-center justify-between p-1.5 rounded-lg text-center transition-all duration-150 cursor-default hover:scale-105",
                  bgClass
                )}
              >
                <span className="text-[10px] font-mono font-semibold">{slot.label}</span>
                <span className="text-[9px] font-mono mt-1 font-bold">
                  {hasTrades ? (isProfit ? "+" : "") + Math.round(slot.pnl) : "—"}
                </span>
                <span className="text-[8px] opacity-60 mt-0.5">
                  {hasTrades ? `${slot.trades}t` : ""}
                </span>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
