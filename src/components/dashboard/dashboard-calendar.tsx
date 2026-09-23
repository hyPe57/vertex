"use client";

import { useState } from "react";
import { CalendarGrid } from "@/components/calendar/calendar-grid";
import { DayDrawer } from "@/components/calendar/day-drawer";
import { Button } from "@/components/ui";
import { useCurrencyStore } from "@/stores";
import { ChevronLeft, ChevronRight, Share2 } from "lucide-react";
import { format, addMonths, subMonths } from "date-fns";
import { formatCurrency } from "@/lib/utils";

export function DashboardCalendar() {
  const [currentDate, setCurrentDate] = useState(new Date("2026-09-01T12:00:00Z"));
  const { display, toggleDisplay } = useCurrencyStore();
  const [selectedDate, setSelectedDate] = useState<string | null>(null);

  const prevMonth = () => setCurrentDate((prev) => subMonths(prev, 1));
  const nextMonth = () => setCurrentDate((prev) => addMonths(prev, 1));
  const resetToday = () => setCurrentDate(new Date("2026-09-23T12:00:00Z"));

  const monthPnl = 3327.5; // September 2026 Net PnL

  return (
    <div className="glass-card rounded-2xl p-4 sm:p-5 border border-[var(--border-primary)] shadow-sm flex flex-col gap-3.5">
      {/* Header matching Reference */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 pb-2.5 border-b border-[var(--border-primary)]/50">
        {/* Month Title & PnL Badge */}
        <div className="flex items-center gap-2.5">
          <h2 className="text-base sm:text-lg font-bold text-[var(--text-primary)] tracking-tight">
            {format(currentDate, "MMMM yyyy")}
          </h2>
          <span className="text-xs font-mono font-bold px-2.5 py-0.5 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
            +{formatCurrency(monthPnl)}
          </span>
        </div>

        {/* Controls: Prev, Today, Next, Share & Currency Toggle */}
        <div className="flex items-center gap-2 flex-wrap">
          {/* Navigation group */}
          <div className="flex items-center gap-1 bg-[var(--bg-secondary)]/80 p-0.5 rounded-xl border border-[var(--border-primary)] shadow-xs">
            <Button
              variant="ghost"
              size="sm"
              onClick={prevMonth}
              className="h-7 w-7 p-0 rounded-lg text-[var(--text-tertiary)] hover:text-[var(--text-primary)] hover:bg-[var(--bg-primary)]"
            >
              <ChevronLeft size={14} />
            </Button>
            <button
              onClick={resetToday}
              className="px-2.5 py-1 text-xs font-semibold rounded-lg text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:bg-[var(--bg-primary)] transition-all"
            >
              Today
            </button>
            <Button
              variant="ghost"
              size="sm"
              onClick={nextMonth}
              className="h-7 w-7 p-0 rounded-lg text-[var(--text-tertiary)] hover:text-[var(--text-primary)] hover:bg-[var(--bg-primary)]"
            >
              <ChevronRight size={14} />
            </Button>
          </div>

          {/* Share Button matching screenshot */}
          <Button
            variant="ghost"
            size="sm"
            onClick={() => {
              if (navigator.clipboard) {
                navigator.clipboard.writeText(window.location.href);
              }
            }}
            className="h-8 px-2.5 gap-1.5 text-xs font-medium rounded-xl text-[var(--text-secondary)] hover:text-[var(--text-primary)] border border-[var(--border-primary)]/80 bg-[var(--bg-secondary)]/60"
          >
            <Share2 size={13} className="text-brand-400" />
            <span className="hidden sm:inline">Share</span>
          </Button>

          {/* Currency Toggle */}
          <Button
            variant="secondary"
            size="sm"
            onClick={toggleDisplay}
            className="h-8 px-2.5 font-mono text-xs rounded-xl font-bold border border-[var(--border-primary)]/80"
          >
            {display === "usd" ? "$" : "%"}
          </Button>
        </div>
      </div>

      {/* Full Monthly Calendar Grid with Weekly Summary Column */}
      <div className="w-full overflow-x-auto">
        <CalendarGrid
          currentDate={currentDate}
          onDayClick={setSelectedDate}
        />
      </div>

      {/* Slide-in Day Drawer for inspecting day's trades */}
      <DayDrawer
        dateString={selectedDate}
        isOpen={selectedDate !== null}
        onClose={() => setSelectedDate(null)}
      />
    </div>
  );
}
