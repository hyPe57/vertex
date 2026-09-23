"use client";

import { useState, useMemo } from "react";
import { CalendarGrid } from "@/components/calendar/calendar-grid";
import { DayDrawer } from "@/components/calendar/day-drawer";
import { Button } from "@/components/ui";
import { useCurrencyStore } from "@/stores";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { format, addMonths, subMonths } from "date-fns";
import { mockDailyStats } from "@/lib/mock-data";
import { formatCurrency } from "@/lib/utils";

export function DashboardCalendar() {
  const [currentDate, setCurrentDate] = useState(new Date("2026-09-01T12:00:00Z"));
  const { display, toggleDisplay } = useCurrencyStore();
  const [selectedDate, setSelectedDate] = useState<string | null>(null);

  const prevMonth = () => setCurrentDate((prev) => subMonths(prev, 1));
  const nextMonth = () => setCurrentDate((prev) => addMonths(prev, 1));
  const resetToday = () => {
    setCurrentDate(new Date("2026-09-01T12:00:00Z"));
    setSelectedDate(null);
  };

  // Dynamically compute monthly stats
  const { monthPnl, totalTrades, winRate, activeDays } = useMemo(() => {
    const currentMonthStr = format(currentDate, "yyyy-MM");
    const monthStats = mockDailyStats.filter((s) => s.date.startsWith(currentMonthStr));

    let pnl = 0;
    let trades = 0;
    let wins = 0;
    let active = 0;

    monthStats.forEach((s) => {
      pnl += s.netPnl;
      trades += s.tradeCount;
      wins += s.wins;
      if (s.tradeCount > 0) active++;
    });

    const wr = trades > 0 ? Math.round((wins / trades) * 100) : 0;

    return {
      monthPnl: pnl,
      totalTrades: trades,
      winRate: wr,
      activeDays: active,
    };
  }, [currentDate]);

  return (
    <div className="rounded-2xl p-4 sm:p-5 border border-white/[0.035] bg-[#0c0d14]/75 shadow-xs flex flex-col gap-4">
      {/* Top Header matching Reference: [< September 2026 >]  Monthly P/L: +$124.52  32 trades · 44% WR · 3 active days [Today] */}
      <div className="flex flex-col lg:flex-row items-center justify-between gap-3 pb-2 border-b border-white/[0.04]">
        {/* Left: Month Navigator Pill */}
        <div className="flex items-center gap-1 bg-[#13141f] px-1.5 py-1 rounded-xl border border-white/[0.06] shadow-xs">
          <Button
            variant="ghost"
            size="sm"
            onClick={prevMonth}
            className="h-7 w-7 p-0 rounded-lg text-zinc-400 hover:text-white hover:bg-white/[0.06]"
          >
            <ChevronLeft size={14} />
          </Button>
          <span className="px-2 text-xs sm:text-[13px] font-semibold text-zinc-200 select-none">
            {format(currentDate, "MMMM yyyy")}
          </span>
          <Button
            variant="ghost"
            size="sm"
            onClick={nextMonth}
            className="h-7 w-7 p-0 rounded-lg text-zinc-400 hover:text-white hover:bg-white/[0.06]"
          >
            <ChevronRight size={14} />
          </Button>
        </div>

        {/* Center: Monthly P/L Banner */}
        <div className="flex items-center gap-2">
          <span className="text-xs sm:text-sm font-semibold text-zinc-300">
            Monthly P/L:
          </span>
          <span
            className={`font-mono text-sm sm:text-base font-bold ${
              monthPnl >= 0 ? "text-emerald-400" : "text-rose-400"
            }`}
          >
            {monthPnl >= 0 ? "+" : ""}
            {formatCurrency(monthPnl)}
          </span>
        </div>

        {/* Right: Quick Stats & Controls */}
        <div className="flex items-center gap-2.5 flex-wrap justify-center">
          <div className="text-[11px] sm:text-xs text-zinc-400 font-medium flex items-center gap-1.5">
            <span>{totalTrades} trades</span>
            <span className="text-zinc-600">·</span>
            <span>{winRate}% WR</span>
            <span className="text-zinc-600">·</span>
            <span>{activeDays} active days</span>
          </div>

          <button
            onClick={resetToday}
            className="px-2.5 py-1 text-xs font-semibold rounded-lg bg-[#181a26] text-zinc-200 hover:text-white hover:bg-[#202234] border border-white/[0.08] transition-all shadow-xs"
          >
            Today
          </button>

          <Button
            variant="secondary"
            size="sm"
            onClick={toggleDisplay}
            className="h-7 px-2 font-mono text-xs rounded-lg font-bold border border-white/[0.08] bg-[#181a26] text-zinc-300 hover:text-white"
          >
            {display === "usd" ? "$" : "%"}
          </Button>
        </div>
      </div>

      {/* Modern Card-based Calendar Grid */}
      <CalendarGrid
        currentDate={currentDate}
        selectedDate={selectedDate}
        onDayClick={setSelectedDate}
      />

      {/* Slide-in Day Drawer for Inspecting Day Executions */}
      <DayDrawer
        dateString={selectedDate}
        isOpen={selectedDate !== null}
        onClose={() => setSelectedDate(null)}
      />
    </div>
  );
}
