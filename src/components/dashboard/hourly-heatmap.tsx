"use client";

import { useState, useMemo } from "react";
import { formatCurrency, cn } from "@/lib/utils";

interface WeekdayStat {
  day: string;
  dayFull: string;
  pnl: number;
  trades: number;
  wins: number;
  losses: number;
  isBest?: boolean;
}

const WEEKDAY_DATA: WeekdayStat[] = [
  { day: "Mon", dayFull: "Monday", pnl: 480, trades: 7, wins: 5, losses: 2 },
  { day: "Tue", dayFull: "Tuesday", pnl: 1510, trades: 12, wins: 9, losses: 3, isBest: true },
  { day: "Wed", dayFull: "Wednesday", pnl: 590, trades: 10, wins: 6, losses: 4 },
  { day: "Thu", dayFull: "Thursday", pnl: 1090, trades: 9, wins: 7, losses: 2 },
  { day: "Fri", dayFull: "Friday", pnl: 160, trades: 7, wins: 4, losses: 3 },
];

export function HourlyHeatmap() {
  const [view, setView] = useState<"weekday" | "consistency">("weekday");

  // Mock 14 weeks of activity for consistency grid
  const activityWeeks = useMemo(() => {
    const weeks: { date: string; pnl: number; trades: number }[][] = [];
    const today = new Date(2026, 8, 23); // Sep 23, 2026

    for (let w = 13; w >= 0; w--) {
      const days = [];
      for (let d = 0; d < 5; d++) {
        // Mon-Fri
        const seed = (w * 5 + d * 7) % 17;
        const hasTrade = seed % 3 !== 0;
        let pnl = 0;
        let trades = 0;
        if (hasTrade) {
          trades = (seed % 4) + 1;
          pnl = seed % 4 === 0 ? -(seed * 35) : seed * 65 + 40;
        }
        days.push({
          date: `W${14 - w} D${d + 1}`,
          pnl,
          trades,
        });
      }
      weeks.push(days);
    }
    return weeks;
  }, []);

  return (
    <div className="bg-[#0c0d14]/75 backdrop-blur-md rounded-2xl p-4 sm:p-5 border border-white/[0.04] shadow-sm flex flex-col justify-between">
      {/* Header */}
      <div className="flex items-center justify-between pb-3">
        <div>
          <h2 className="text-sm font-semibold text-neutral-100 tracking-tight">
            Performance Heatmap
          </h2>
          <p className="text-[11px] text-neutral-400 mt-0.5">
            Profitability distribution & trading consistency
          </p>
        </div>

        {/* View Switcher Pill */}
        <div className="flex items-center bg-white/[0.03] border border-white/[0.05] p-0.5 rounded-lg text-xs">
          <button
            onClick={() => setView("weekday")}
            className={cn(
              "px-2.5 py-1 rounded-md text-[11px] font-medium transition-all",
              view === "weekday"
                ? "bg-white/[0.08] text-white shadow-xs"
                : "text-neutral-400 hover:text-neutral-200"
            )}
          >
            By Weekday
          </button>
          <button
            onClick={() => setView("consistency")}
            className={cn(
              "px-2.5 py-1 rounded-md text-[11px] font-medium transition-all",
              view === "consistency"
                ? "bg-white/[0.08] text-white shadow-xs"
                : "text-neutral-400 hover:text-neutral-200"
            )}
          >
            Consistency
          </button>
        </div>
      </div>

      {/* View 1: Minimal 5-Day Weekday Strip */}
      {view === "weekday" && (
        <div className="grid grid-cols-2 sm:grid-cols-5 gap-2.5 pt-1">
          {WEEKDAY_DATA.map((item) => {
            const winRate = Math.round((item.wins / item.trades) * 100);
            return (
              <div
                key={item.day}
                className={cn(
                  "relative rounded-xl p-3 border transition-all duration-200 group flex flex-col justify-between",
                  item.isBest
                    ? "bg-emerald-500/[0.06] border-emerald-500/20 hover:border-emerald-500/35"
                    : "bg-white/[0.015] border-white/[0.035] hover:border-white/[0.08]"
                )}
              >
                {/* Day Header */}
                <div className="flex items-center justify-between">
                  <span className="text-xs font-semibold text-neutral-300 group-hover:text-white transition-colors">
                    {item.day}
                  </span>
                  {item.isBest && (
                    <span className="text-[9px] font-medium text-emerald-400 bg-emerald-500/10 border border-emerald-500/20 px-1.5 py-0.2 rounded-full">
                      Best
                    </span>
                  )}
                  {!item.isBest && (
                    <span className="text-[10px] text-neutral-500 tabular-nums">
                      {item.trades} trades
                    </span>
                  )}
                </div>

                {/* Net P&L */}
                <div className="my-2">
                  <span className="text-sm sm:text-base font-semibold tabular-nums tracking-tight text-emerald-400 block">
                    {formatCurrency(item.pnl)}
                  </span>
                </div>

                {/* Win Rate Bar & Info */}
                <div className="space-y-1">
                  <div className="flex items-center justify-between text-[10px] text-neutral-400 tabular-nums">
                    <span>{winRate}% WR</span>
                    <span className="text-neutral-500">
                      {item.wins}W-{item.losses}L
                    </span>
                  </div>
                  <div className="h-1 rounded-full bg-white/[0.04] overflow-hidden">
                    <div
                      className={cn(
                        "h-full rounded-full transition-all duration-500",
                        item.isBest ? "bg-emerald-400" : "bg-emerald-500/60"
                      )}
                      style={{ width: `${winRate}%` }}
                    />
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* View 2: GitHub-Style Consistency Grid (Micro Squares) */}
      {view === "consistency" && (
        <div className="pt-2 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          {/* Micro Square Grid */}
          <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar py-1">
            {/* Weekday labels */}
            <div className="flex flex-col gap-1 text-[9px] text-neutral-500 font-mono pr-1.5 select-none">
              <span>M</span>
              <span>W</span>
              <span>F</span>
            </div>

            {/* Columns of 5 days */}
            {activityWeeks.map((week, wIdx) => (
              <div key={wIdx} className="flex flex-col gap-1">
                {week.map((day, dIdx) => {
                  const hasTrades = day.trades > 0;
                  const isProfit = day.pnl > 0;
                  const isLoss = day.pnl < 0;

                  let color = "bg-white/[0.03] border-white/[0.02]";
                  if (hasTrades) {
                    if (isProfit) {
                      color =
                        day.pnl > 300
                          ? "bg-emerald-400 border-emerald-400/40"
                          : "bg-emerald-500/50 border-emerald-500/30";
                    } else if (isLoss) {
                      color = "bg-rose-500/60 border-rose-500/40";
                    }
                  }

                  return (
                    <div
                      key={dIdx}
                      title={`${day.date}: ${hasTrades ? formatCurrency(day.pnl) : "No trades"}`}
                      className={cn(
                        "w-3 h-3 rounded-[3px] border transition-transform hover:scale-125 cursor-default",
                        color
                      )}
                    />
                  );
                })}
              </div>
            ))}
          </div>

          {/* Quick Consistency Stats */}
          <div className="flex items-center gap-4 text-xs shrink-0 self-end sm:self-auto border-t sm:border-t-0 sm:border-l border-white/[0.04] pt-2 sm:pt-0 sm:pl-4">
            <div>
              <span className="text-[10px] text-neutral-500 uppercase block">Active Days</span>
              <span className="font-semibold tabular-nums text-neutral-200">14 / 20</span>
            </div>
            <div>
              <span className="text-[10px] text-neutral-500 uppercase block">Win Streak</span>
              <span className="font-semibold tabular-nums text-emerald-400">5 Days</span>
            </div>
            <div>
              <span className="text-[10px] text-neutral-500 uppercase block">Avg Daily</span>
              <span className="font-semibold tabular-nums text-neutral-200">+$285</span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export const SessionHeatmap = HourlyHeatmap;
