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
  isSameDay,
} from "date-fns";
import type { DailyStats } from "@/types";

interface CalendarGridProps {
  currentDate: Date;
  onDayClick: (dateString: string) => void;
  selectedDate?: string | null;
}

export function CalendarGrid({
  currentDate,
  onDayClick,
  selectedDate: externalSelectedDate,
}: CalendarGridProps) {
  const { display } = useCurrencyStore();
  const isPercent = display === "percent";

  // Default active day is null so sidebar does not open on page load
  const [internalSelectedDate, setInternalSelectedDate] = useState<string | null>(null);
  const activeDate = externalSelectedDate !== undefined ? externalSelectedDate : internalSelectedDate;

  // Today's benchmark date
  const today = new Date("2026-09-23T12:00:00Z");

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

  const handleCardClick = (dateString: string, hasTrades: boolean) => {
    if (hasTrades) {
      setInternalSelectedDate(dateString);
      onDayClick(dateString);
    }
  };

  return (
    <div className="w-full overflow-x-auto no-scrollbar pb-1">
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
                  const { date, dateString, dayNum, isCurrentMonth, stat } = dayObj;
                  const hasTrades = Boolean(stat && stat.tradeCount > 0);
                  const isProfit = Boolean(stat && stat.netPnl > 0);
                  const isLoss = Boolean(stat && stat.netPnl < 0);
                  const isToday = isSameDay(date, today);
                  const isSelected = activeDate === dateString;

                  // Out of current month
                  if (!isCurrentMonth) {
                    return (
                      <div
                        key={dateString}
                        className="h-[96px] sm:h-[106px] md:h-[116px] rounded-xl p-2 sm:p-2.5 flex flex-col justify-between bg-[#12131a]/60 border border-white/[0.03] select-none opacity-40"
                      >
                        <span className="text-[10px] sm:text-[11px] font-medium text-zinc-600 leading-none">
                          {dayNum}
                        </span>
                        <div className="flex-1 flex items-center justify-center my-auto">
                          <span className="text-zinc-800 font-mono text-[11px] select-none">
                            --
                          </span>
                        </div>
                        <div className="h-2.5" />
                      </div>
                    );
                  }

                  // In current month, but no trades (sidebar does NOT open)
                  if (!hasTrades || !stat) {
                    return (
                      <div
                        key={dateString}
                        className={cn(
                          "h-[96px] sm:h-[106px] md:h-[116px] rounded-xl p-2 sm:p-2.5 flex flex-col justify-between transition-all duration-150 select-none",
                          "bg-[#13141c]/90 border border-white/[0.04] hover:border-white/[0.08] hover:bg-[#161722]",
                          isToday && "ring-1 ring-inset ring-brand-500/50 border-brand-500/40 bg-brand-500/[0.04]"
                        )}
                      >
                        <span
                          className={cn(
                            "text-[10px] sm:text-[11px] leading-none font-medium",
                            isToday ? "text-brand-400 font-bold" : "text-zinc-500"
                          )}
                        >
                          {dayNum}
                        </span>
                        <div className="flex-1 flex items-center justify-center my-auto">
                          <span className="text-zinc-700/50 font-mono text-[11px] select-none">
                            --
                          </span>
                        </div>
                        <div className="h-2.5" />
                      </div>
                    );
                  }

                  // Day WITH Trades (Money in Middle, No Sparkline)
                  return (
                    <div
                      key={dateString}
                      onClick={() => handleCardClick(dateString, true)}
                      className={cn(
                        "h-[96px] sm:h-[106px] md:h-[116px] rounded-xl p-2 sm:p-2.5 flex flex-col justify-between transition-all duration-150 cursor-pointer select-none relative overflow-hidden",
                        isProfit && "bg-[#0b1c16]/80 border border-emerald-500/25 hover:border-emerald-500/50",
                        isLoss && "bg-[#210e14]/80 border border-rose-500/25 hover:border-rose-500/50",
                        isSelected && "ring-2 ring-emerald-400 border-2 border-emerald-400 shadow-[0_0_15px_rgba(16,185,129,0.2)] z-10",
                        isToday && !isSelected && "ring-1 ring-inset ring-brand-500/60 border-brand-500/50"
                      )}
                    >
                      {/* Top Row: Date Number (Left) */}
                      <div className="flex items-center justify-between">
                        {isSelected ? (
                          <span className="px-1.5 py-0.5 rounded bg-zinc-800 text-white font-bold text-[10px] sm:text-[11px] border border-white/20 leading-none shadow-xs">
                            {dayNum}
                          </span>
                        ) : (
                          <span
                            className={cn(
                              "text-[10px] sm:text-[11px] leading-none font-semibold",
                              isToday ? "text-brand-400 font-bold" : "text-zinc-300"
                            )}
                          >
                            {dayNum}
                          </span>
                        )}
                      </div>

                      {/* Middle: Money Amount (P&L) Placed Right in the Center */}
                      <div className="flex-1 flex items-center justify-center my-auto">
                        <span
                          className={cn(
                            "tabular-nums text-xs sm:text-sm md:text-base font-bold tracking-tight text-center",
                            isProfit ? "text-emerald-400" : "text-rose-400"
                          )}
                        >
                          {formatPnl(stat.netPnl, stat.netPnlPercent)}
                        </span>
                      </div>

                      {/* Bottom Row: Trades Count Centered */}
                      <div className="flex items-center justify-center leading-none mt-auto">
                        <span className="text-[9px] sm:text-[10px] text-zinc-400 font-medium">
                          {stat.tradeCount} trades
                        </span>
                      </div>
                    </div>
                  );
                })}

                {/* 8th Column: TOTAL Card */}
                {hasWeeklyTrades ? (
                  <div className="h-[96px] sm:h-[106px] md:h-[116px] rounded-xl p-2 sm:p-2.5 flex flex-col justify-between bg-[#0c1a17]/90 border border-emerald-500/25 select-none relative overflow-hidden">
                    <span className="text-[8px] sm:text-[9px] font-bold uppercase tracking-wider text-zinc-400 leading-none">
                      WEEK {weekNumber}
                    </span>

                    {/* Middle: Weekly P&L Right in the Center */}
                    <div className="flex-1 flex items-center justify-center my-auto">
                      <span className="tabular-nums text-xs sm:text-sm md:text-base font-bold text-emerald-400 tracking-tight text-center">
                        {formatPnl(weeklyPnl, weeklyPercent)}
                      </span>
                    </div>

                    <div className="flex items-center justify-center leading-none mt-auto">
                      <span className="text-[9px] sm:text-[10px] text-zinc-400 font-medium">
                        {weeklyTrades} trades
                      </span>
                    </div>
                  </div>
                ) : (
                  <div className="h-[96px] sm:h-[106px] md:h-[116px] rounded-xl p-2 sm:p-2.5 flex flex-col justify-between bg-[#13141c]/90 border border-white/[0.04] select-none">
                    <span className="text-[8px] sm:text-[9px] font-bold uppercase tracking-wider text-zinc-500 leading-none">
                      WEEK {weekNumber}
                    </span>

                    <div className="flex-1 flex items-center justify-center my-auto">
                      <span className="text-zinc-700/60 font-mono text-[11px] select-none">
                        --
                      </span>
                    </div>

                    <div className="flex items-center justify-center leading-none mt-auto">
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
