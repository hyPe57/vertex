"use client";

import { useCurrencyStore } from "@/stores";
import { mockDailyStats } from "@/lib/mock-data";
import { cn } from "@/lib/utils";
import { useMemo } from "react";
import { format, getDaysInMonth, startOfMonth, getDay, isSameDay } from "date-fns";
import { FileText } from "lucide-react";

interface CalendarGridProps {
  currentDate: Date;
  onDayClick: (dateString: string) => void;
}

export function CalendarGrid({ currentDate, onDayClick }: CalendarGridProps) {
  const { display } = useCurrencyStore();
  const isPercent = display === "percent";
  
  // Today's benchmark date
  const today = new Date("2026-09-23T12:00:00Z");

  const days = useMemo(() => {
    const year = currentDate.getFullYear();
    const month = currentDate.getMonth();
    const daysInMonth = getDaysInMonth(currentDate);
    const firstDayOfMonth = startOfMonth(currentDate);
    
    // Sunday-based: 0 = Sun, 1 = Mon, ..., 6 = Sat
    const startDay = getDay(firstDayOfMonth);
    
    const calendarDays = [];
    
    // Fill leading empty days
    for (let i = 0; i < startDay; i++) {
      calendarDays.push(null);
    }
    
    // Fill days of the month
    for (let i = 1; i <= daysInMonth; i++) {
      const date = new Date(year, month, i, 12, 0, 0);
      const dateString = format(date, "yyyy-MM-dd");
      const stat = mockDailyStats.find((s) => s.date === dateString);
      calendarDays.push({ date, dateString, stat });
    }
    
    // Pad trailing days to complete full 7-day rows
    while (calendarDays.length % 7 !== 0) {
      calendarDays.push(null);
    }
    
    return calendarDays;
  }, [currentDate]);

  // Group into weeks
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
    return `${pnl > 0 ? "+" : ""}$${Math.abs(pnl).toLocaleString(undefined, {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    })}`;
  };

  const dayHeaders = ["SUN", "MON", "TUE", "WED", "THU", "FRI", "SAT"];

  return (
    <div className="w-full rounded-2xl border border-[var(--border-primary)] bg-[var(--bg-primary)] overflow-hidden shadow-xs">
      {/* Header Row: SUN -> SAT + WEEKLY */}
      <div className="grid grid-cols-[repeat(7,minmax(0,1fr))_72px] sm:grid-cols-[repeat(7,minmax(0,1fr))_84px] border-b border-[var(--border-primary)]/60 bg-[var(--bg-secondary)]/50">
        {dayHeaders.map((day) => (
          <div
            key={day}
            className="py-2.5 text-center text-[10px] sm:text-[11px] font-bold text-[var(--text-tertiary)] uppercase tracking-wider border-r border-[var(--border-primary)]/50"
          >
            {day}
          </div>
        ))}
        <div className="py-2.5 text-center text-[10px] sm:text-[11px] font-bold text-[var(--text-tertiary)] uppercase tracking-wider">
          WEEKLY
        </div>
      </div>
      
      {/* Weeks Grid */}
      <div className="flex flex-col">
        {weeks.map((week, wIdx) => {
          let weeklyPnl = 0;
          let weeklyPercent = 0;
          let tradingDaysCount = 0;

          week.forEach((d) => {
            if (d?.stat) {
              weeklyPnl += d.stat.netPnl;
              weeklyPercent += d.stat.netPnlPercent;
              if (d.stat.tradeCount > 0) {
                tradingDaysCount++;
              }
            }
          });
          
          return (
            <div
              key={wIdx}
              className="grid grid-cols-[repeat(7,minmax(0,1fr))_72px] sm:grid-cols-[repeat(7,minmax(0,1fr))_84px] border-b border-[var(--border-primary)]/50 last:border-b-0 h-[74px] sm:h-[82px] xl:h-[88px]"
            >
              {week.map((dayObj, dIdx) => {
                if (!dayObj) {
                  return (
                    <div
                      key={dIdx}
                      className="border-r border-[var(--border-primary)]/40 bg-[var(--bg-secondary)]/15"
                    />
                  );
                }
                
                const { date, dateString, stat } = dayObj;
                const isToday = isSameDay(date, today);
                const hasTrades = stat && stat.tradeCount > 0;
                const isProfit = stat && stat.netPnl > 0;
                const isLoss = stat && stat.netPnl < 0;
                
                return (
                  <div 
                    key={dIdx} 
                    onClick={() => onDayClick(dateString)}
                    className={cn(
                      "relative border-r border-[var(--border-primary)]/50 p-1.5 sm:p-2 transition-all duration-150 cursor-pointer group flex flex-col justify-between select-none",
                      isToday
                        ? "ring-2 ring-inset ring-brand-500 bg-brand-500/[0.08] z-10"
                        : isProfit
                        ? "bg-emerald-500/[0.03] hover:bg-emerald-500/[0.08]"
                        : isLoss
                        ? "bg-rose-500/[0.03] hover:bg-rose-500/[0.08]"
                        : "hover:bg-[var(--bg-secondary)]/60"
                    )}
                  >
                    {/* Top Row: Date Number (Left) + Trade Badge (Right) */}
                    <div className="flex items-center justify-between gap-1">
                      <span
                        className={cn(
                          "text-[11px] sm:text-xs font-semibold leading-none",
                          isToday
                            ? "text-brand-400 font-bold"
                            : "text-[var(--text-primary)]/80"
                        )}
                      >
                        {date.getDate()}
                      </span>

                      {hasTrades && (
                        <div className="flex items-center gap-1 px-1 sm:px-1.5 py-0.5 rounded text-[9px] sm:text-[10px] font-mono text-[var(--text-tertiary)] bg-[var(--bg-secondary)]/90 border border-[var(--border-primary)]/80 group-hover:border-[var(--border-primary)] transition-colors">
                          <FileText size={10} className="text-[var(--text-tertiary)] opacity-80" />
                          <span>{stat.tradeCount}</span>
                        </div>
                      )}
                    </div>
                    
                    {/* Bottom Row: P&L or 'No trades' */}
                    <div className="flex flex-col items-start mt-auto">
                      {hasTrades && stat ? (
                        <>
                          <span
                            className={cn(
                              "font-mono text-[11px] sm:text-xs xl:text-[13px] font-bold leading-tight tracking-tight",
                              isProfit
                                ? "text-emerald-400"
                                : isLoss
                                ? "text-rose-400"
                                : "text-[var(--text-secondary)]"
                            )}
                          >
                            {formatPnl(stat.netPnl, stat.netPnlPercent)}
                          </span>
                          <span className="text-[9px] text-[var(--text-tertiary)]/75 font-medium hidden sm:inline-block leading-none mt-0.5">
                            {stat.wins}W - {stat.losses}L
                          </span>
                        </>
                      ) : (
                        <span className="text-[9px] sm:text-[10px] text-[var(--text-tertiary)]/45 font-normal select-none">
                          No trades
                        </span>
                      )}
                    </div>
                  </div>
                );
              })}
              
              {/* 8th Column: Weekly Total */}
              <div className="flex flex-col items-center justify-center p-1.5 sm:p-2 text-center bg-[var(--bg-secondary)]/30 select-none">
                <span className="text-[8px] sm:text-[9px] font-bold uppercase tracking-wider text-[var(--text-tertiary)]/70 mb-0.5">
                  WEEKLY
                </span>
                <span
                  className={cn(
                    "font-mono text-[11px] sm:text-xs xl:text-[13px] font-bold leading-tight",
                    weeklyPnl > 0
                      ? "text-emerald-400"
                      : weeklyPnl < 0
                      ? "text-rose-400"
                      : "text-[var(--text-tertiary)]"
                  )}
                >
                  {weeklyPnl !== 0 ? formatPnl(weeklyPnl, weeklyPercent) : "$0.00"}
                </span>
                <span className="text-[9px] sm:text-[10px] text-[var(--text-tertiary)]/70 mt-0.5">
                  {tradingDaysCount} {tradingDaysCount === 1 ? "day" : "days"}
                </span>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
