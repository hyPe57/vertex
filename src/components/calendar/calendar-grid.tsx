"use client";

import { useCurrencyStore } from "@/stores";
import { mockDailyStats } from "@/lib/mock-data";
import { cn, formatCurrency } from "@/lib/utils";
import { useMemo, useState, useId } from "react";
import {
  format,
  getDaysInMonth,
  startOfMonth,
  getDay,
  subMonths,
  addMonths,
} from "date-fns";
import type { DailyStats } from "@/types";

interface CalendarGridProps {
  currentDate: Date;
  onDayClick: (dateString: string) => void;
  selectedDate?: string | null;
}

// Sparkline SVG renderer with glow effect and smooth Bezier curve
function DaySparkline({
  dayNum,
  stat,
  isWeekly,
  pnl,
}: {
  dayNum?: number;
  stat?: DailyStats;
  isWeekly?: boolean;
  pnl?: number;
}) {
  const gradientId = useId();
  const netPnl = stat ? stat.netPnl : pnl ?? 0;
  const isProfit = netPnl > 0;
  const isLoss = netPnl < 0;

  let path = "M 0,12 L 100,12";
  if (isWeekly) {
    // Week cumulative curve (oscillating with rally at end)
    path = "M 0,14 C 15,14 25,17 38,12 C 48,15 58,11 68,15 C 78,16 88,13 94,8 L 100,6";
  } else if (dayNum === 3) {
    // Day 3: Smooth S-curve climb
    path = "M 0,18 C 15,18 22,18 32,10 C 42,4 55,5 100,5";
  } else if (dayNum === 4) {
    // Day 4: Volatile loss dip
    path = "M 0,8 C 10,8 14,15 22,12 C 30,9 38,18 48,11 C 58,7 68,14 78,10 C 88,14 94,20 100,20";
  } else if (dayNum === 5) {
    // Day 5: Surge to crest
    path = "M 0,19 C 25,19 45,17 65,11 C 75,7 88,5 95,8 L 100,10";
  } else if (isProfit) {
    // Generic profit curve
    path = "M 0,18 C 20,18 35,16 50,11 C 65,6 80,5 100,4";
  } else if (isLoss) {
    // Generic loss curve
    path = "M 0,6 C 20,6 35,11 50,15 C 65,19 80,21 100,21";
  }

  const areaPath = `${path} L 100 24 L 0 24 Z`;
  const strokeColor = isProfit ? "#10b981" : isLoss ? "#f43f5e" : "#52525b";

  return (
    <div className="w-full h-5 sm:h-6 my-auto flex items-center">
      <svg
        viewBox="0 0 100 24"
        className="w-full h-full overflow-visible"
        preserveAspectRatio="none"
      >
        <defs>
          <linearGradient id={gradientId} x1="0" y1="0" x2="0" y2="1">
            <stop
              offset="0%"
              stopColor={strokeColor}
              stopOpacity={isProfit ? 0.35 : 0.25}
            />
            <stop offset="100%" stopColor={strokeColor} stopOpacity={0.0} />
          </linearGradient>
        </defs>
        <path d={areaPath} fill={`url(#${gradientId})`} />
        <path
          d={path}
          fill="none"
          stroke={strokeColor}
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
          className="filter drop-shadow-[0_2px_4px_rgba(0,0,0,0.5)]"
        />
      </svg>
    </div>
  );
}

export function CalendarGrid({
  currentDate,
  onDayClick,
  selectedDate: externalSelectedDate,
}: CalendarGridProps) {
  const { display } = useCurrencyStore();
  const isPercent = display === "percent";

  // Default active day is Day 5 (Sep 5, 2026) as shown in the reference image
  const [internalSelectedDate, setInternalSelectedDate] = useState<string>("2026-09-05");
  const activeDate = externalSelectedDate ?? internalSelectedDate;

  // Calendar dates layout
  const days = useMemo(() => {
    const year = currentDate.getFullYear();
    const month = currentDate.getMonth();
    const daysInMonth = getDaysInMonth(currentDate);
    const firstDayOfMonth = startOfMonth(currentDate);

    // 0 = Sunday, 1 = Monday, ..., 6 = Saturday
    const startDay = getDay(firstDayOfMonth);

    const calendarDays = [];

    // Previous month trailing days
    const prevMonthDate = subMonths(currentDate, 1);
    const prevDaysInMonth = getDaysInMonth(prevMonthDate);
    for (let i = startDay - 1; i >= 0; i--) {
      const dayNum = prevDaysInMonth - i;
      const date = new Date(prevMonthDate.getFullYear(), prevMonthDate.getMonth(), dayNum, 12, 0, 0);
      const dateString = format(date, "yyyy-MM-dd");
      calendarDays.push({
        date,
        dateString,
        dayNum,
        isCurrentMonth: false,
        stat: undefined,
      });
    }

    // Current month days
    for (let i = 1; i <= daysInMonth; i++) {
      const date = new Date(year, month, i, 12, 0, 0);
      const dateString = format(date, "yyyy-MM-dd");
      const stat = mockDailyStats.find((s) => s.date === dateString);
      calendarDays.push({
        date,
        dateString,
        dayNum: i,
        isCurrentMonth: true,
        stat,
      });
    }

    // Next month leading days to complete full 7-day rows
    const nextMonthDate = addMonths(currentDate, 1);
    let nextDayNum = 1;
    while (calendarDays.length % 7 !== 0) {
      const date = new Date(nextMonthDate.getFullYear(), nextMonthDate.getMonth(), nextDayNum, 12, 0, 0);
      const dateString = format(date, "yyyy-MM-dd");
      calendarDays.push({
        date,
        dateString,
        dayNum: nextDayNum,
        isCurrentMonth: false,
        stat: undefined,
      });
      nextDayNum++;
    }

    return calendarDays;
  }, [currentDate]);

  // Group into 5 weeks
  const weeks = useMemo(() => {
    const rows = [];
    for (let i = 0; i < days.length; i += 7) {
      rows.push(days.slice(i, i + 7));
    }
    return rows;
  }, [days]);

  const formatPnl = (pnl: number, percent: number) => {
    if (pnl === 0) return "$0.00";
    if (isPercent) {
      return `${percent > 0 ? "+" : ""}${percent.toFixed(2)}%`;
    }
    return `${pnl > 0 ? "+" : "-"}$${Math.abs(pnl).toLocaleString(undefined, {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    })}`;
  };

  const dayHeaders = ["SU", "MO", "TU", "WE", "TH", "FR", "SA", "TOTAL"];

  const handleCardClick = (dateString: string) => {
    setInternalSelectedDate(dateString);
    onDayClick(dateString);
  };

  return (
    <div className="w-full overflow-x-auto pb-1">
      <div className="min-w-[640px] flex flex-col">
        {/* 1. Column Headers (SU, MO, TU, WE, TH, FR, SA, TOTAL) */}
        <div className="grid grid-cols-8 gap-1.5 sm:gap-2 mb-2">
          {dayHeaders.map((header) => (
            <div
              key={header}
              className="text-center text-[10px] sm:text-[11px] font-bold text-zinc-500 uppercase tracking-wider py-1"
            >
              {header}
            </div>
          ))}
        </div>

        {/* 2. Grid of 5 Weeks (Each Day is a Standalone Rounded Card) */}
        <div className="flex flex-col gap-1.5 sm:gap-2">
          {weeks.map((week, wIdx) => {
            let weeklyPnl = 0;
            let weeklyPercent = 0;
            let weeklyTrades = 0;

            week.forEach((d) => {
              if (d?.stat) {
                weeklyPnl += d.stat.netPnl;
                weeklyPercent += d.stat.netPnlPercent;
                weeklyTrades += d.stat.tradeCount;
              }
            });

            const hasWeeklyTrades = weeklyTrades > 0;
            const weekNumber = wIdx + 1;

            return (
              <div key={wIdx} className="grid grid-cols-8 gap-1.5 sm:gap-2">
                {/* 7 Days in Week */}
                {week.map((dayObj) => {
                  const { dateString, dayNum, isCurrentMonth, stat } = dayObj;
                  const hasTrades = Boolean(stat && stat.tradeCount > 0);
                  const isProfit = Boolean(stat && stat.netPnl > 0);
                  const isLoss = Boolean(stat && stat.netPnl < 0);
                  const isSelected = activeDate === dateString;

                  // Out of current month
                  if (!isCurrentMonth) {
                    return (
                      <div
                        key={dateString}
                        className="h-[78px] sm:h-[84px] md:h-[90px] rounded-xl p-2 sm:p-2.5 flex flex-col justify-between bg-[#12131a]/60 border border-white/[0.03] select-none opacity-40"
                      >
                        <span className="text-[10px] sm:text-[11px] font-medium text-zinc-600 leading-none">
                          {dayNum}
                        </span>
                        <div className="flex items-center justify-center my-auto">
                          <span className="text-zinc-800 font-mono text-[11px] select-none">
                            --
                          </span>
                        </div>
                        <div className="h-3" />
                      </div>
                    );
                  }

                  // In current month, but no trades
                  if (!hasTrades || !stat) {
                    return (
                      <div
                        key={dateString}
                        onClick={() => handleCardClick(dateString)}
                        className={cn(
                          "h-[78px] sm:h-[84px] md:h-[90px] rounded-xl p-2 sm:p-2.5 flex flex-col justify-between transition-all duration-150 cursor-pointer select-none",
                          "bg-[#13141c]/90 border border-white/[0.05] hover:border-white/15 hover:bg-[#181924]",
                          isSelected && "ring-2 ring-emerald-400 border border-emerald-400"
                        )}
                      >
                        <span className="text-[10px] sm:text-[11px] font-medium text-zinc-500 leading-none">
                          {dayNum}
                        </span>
                        <div className="flex items-center justify-center my-auto">
                          <span className="text-zinc-700/60 font-mono text-[11px] select-none">
                            --
                          </span>
                        </div>
                        <div className="h-3" />
                      </div>
                    );
                  }

                  // Day WITH Trades (Profit or Loss with Sparkline)
                  return (
                    <div
                      key={dateString}
                      onClick={() => handleCardClick(dateString)}
                      className={cn(
                        "h-[78px] sm:h-[84px] md:h-[90px] rounded-xl p-2 sm:p-2.5 flex flex-col justify-between transition-all duration-150 cursor-pointer select-none relative overflow-hidden",
                        isProfit && "bg-[#0b1c16]/80 border border-emerald-500/30 hover:border-emerald-500/60",
                        isLoss && "bg-[#210e14]/80 border border-rose-500/30 hover:border-rose-500/60",
                        isSelected && "ring-2 ring-emerald-400 border-2 border-emerald-400 shadow-[0_0_15px_rgba(16,185,129,0.2)] z-10"
                      )}
                    >
                      {/* Top Row: Date Number (Left) */}
                      <div className="flex items-center justify-between">
                        {isSelected ? (
                          <span className="px-1.5 py-0.5 rounded bg-zinc-800 text-white font-bold text-[10px] sm:text-[11px] border border-white/20 leading-none shadow-xs">
                            {dayNum}
                          </span>
                        ) : (
                          <span className="text-[10px] sm:text-[11px] font-semibold text-zinc-300 leading-none">
                            {dayNum}
                          </span>
                        )}
                      </div>

                      {/* Middle Row: Inline SVG Sparkline */}
                      <DaySparkline dayNum={dayNum} stat={stat} />

                      {/* Bottom Row: Trades Count (Left) & PnL (Right) */}
                      <div className="flex items-center justify-between gap-1 leading-none mt-auto">
                        <span className="text-[9px] sm:text-[10px] text-zinc-400 font-medium">
                          {stat.tradeCount} trades
                        </span>
                        <span
                          className={cn(
                            "font-mono text-[10px] sm:text-xs xl:text-[12px] font-bold tracking-tight",
                            isProfit ? "text-emerald-400" : "text-rose-400"
                          )}
                        >
                          {formatPnl(stat.netPnl, stat.netPnlPercent)}
                        </span>
                      </div>
                    </div>
                  );
                })}

                {/* 8th Column: TOTAL Card */}
                {hasWeeklyTrades ? (
                  <div className="h-[78px] sm:h-[84px] md:h-[90px] rounded-xl p-2 sm:p-2.5 flex flex-col justify-between bg-[#0c1a17]/90 border border-emerald-500/25 select-none relative overflow-hidden">
                    <span className="text-[8px] sm:text-[9px] font-bold uppercase tracking-wider text-zinc-400 leading-none">
                      WEEK {weekNumber}
                    </span>

                    <DaySparkline isWeekly pnl={weeklyPnl} />

                    <div className="flex items-center justify-between gap-1 leading-none mt-auto">
                      <span className="text-[9px] sm:text-[10px] text-zinc-400 font-medium">
                        {weeklyTrades} trades
                      </span>
                      <span className="font-mono text-[10px] sm:text-xs xl:text-[12px] font-bold text-emerald-400 tracking-tight">
                        {formatPnl(weeklyPnl, weeklyPercent)}
                      </span>
                    </div>
                  </div>
                ) : (
                  <div className="h-[78px] sm:h-[84px] md:h-[90px] rounded-xl p-2 sm:p-2.5 flex flex-col justify-between bg-[#13141c]/90 border border-white/[0.04] select-none">
                    <span className="text-[8px] sm:text-[9px] font-bold uppercase tracking-wider text-zinc-500 leading-none">
                      WEEK {weekNumber}
                    </span>

                    <div className="flex items-center justify-center my-auto">
                      <span className="text-zinc-700/60 font-mono text-[11px] select-none">
                        --
                      </span>
                    </div>

                    <div className="flex items-center justify-between gap-1 leading-none mt-auto">
                      <span className="text-[9px] sm:text-[10px] text-zinc-600 font-medium">
                        -
                      </span>
                      <span className="font-mono text-[10px] sm:text-xs text-zinc-600">
                        $0.00
                      </span>
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
