"use client";

import { useState } from "react";
import { CalendarGrid } from "@/components/calendar/calendar-grid";
import { DayDrawer } from "@/components/calendar/day-drawer";
import { Button } from "@/components/ui";
import { useCurrencyStore } from "@/stores";
import { ChevronLeft, ChevronRight, Calendar as CalendarIcon } from "lucide-react";
import { format, addMonths, subMonths } from "date-fns";
import { mockPorts } from "@/lib/mock-data";
import { formatCurrency } from "@/lib/utils";

export function DashboardCalendar() {
  const [currentDate, setCurrentDate] = useState(new Date("2026-09-01T12:00:00Z"));
  const { display, toggleDisplay } = useCurrencyStore();
  const [selectedDate, setSelectedDate] = useState<string | null>(null);

  const prevMonth = () => setCurrentDate((prev) => subMonths(prev, 1));
  const nextMonth = () => setCurrentDate((prev) => addMonths(prev, 1));
  const resetToday = () => setCurrentDate(new Date("2026-09-23T12:00:00Z"));

  const monthPnl = 2847.5; // September 2026 Net PnL

  return (
    <div className="glass-card rounded-2xl p-5 border border-[var(--border-primary)] shadow-sm flex flex-col gap-4">
      {/* Header matching Image 1 Reference */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 pb-3 border-b border-[var(--border-primary)]/50">
        {/* Month Title & PnL */}
        <div className="flex items-center gap-3">
          <div className="p-2 rounded-xl bg-brand-500/10 text-brand-500">
            <CalendarIcon size={18} />
          </div>
          <div>
            <div className="flex items-center gap-2.5">
              <h2 className="text-lg font-bold text-[var(--text-primary)]">
                {format(currentDate, "MMMM yyyy")}
              </h2>
              <span className="text-xs font-mono font-bold px-2 py-0.5 rounded-md bg-profit/15 text-profit border border-profit/25">
                +{formatCurrency(monthPnl)}
              </span>
            </div>
            <p className="text-[11px] text-[var(--text-tertiary)]">
              Click any trading day to view full executions
            </p>
          </div>
        </div>

        {/* Controls: Prev, Today, Next & Currency Toggle */}
        <div className="flex items-center gap-2">
          <div className="flex items-center gap-1 bg-[var(--bg-secondary)] p-1 rounded-xl border border-[var(--border-primary)] shadow-xs">
            <Button
              variant="ghost"
              size="sm"
              onClick={prevMonth}
              className="h-7 w-7 p-0 rounded-lg text-[var(--text-tertiary)] hover:text-[var(--text-primary)]"
            >
              <ChevronLeft size={15} />
            </Button>
            <button
              onClick={resetToday}
              className="px-2.5 py-1 text-xs font-semibold rounded-md text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:bg-surface-100 transition-colors"
            >
              Today
            </button>
            <Button
              variant="ghost"
              size="sm"
              onClick={nextMonth}
              className="h-7 w-7 p-0 rounded-lg text-[var(--text-tertiary)] hover:text-[var(--text-primary)]"
            >
              <ChevronRight size={15} />
            </Button>
          </div>

          <Button
            variant="secondary"
            size="sm"
            onClick={toggleDisplay}
            className="h-8 px-2.5 font-mono text-xs rounded-xl font-bold"
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
