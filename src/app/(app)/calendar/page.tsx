"use client";

import { useState } from "react";
import { Tabs, Button } from "@/components/ui";
import { useCurrencyStore } from "@/stores";
import { CalendarStatBar } from "@/components/calendar/stat-bar";
import { CalendarGrid } from "@/components/calendar/calendar-grid";
import { DayDrawer } from "@/components/calendar/day-drawer";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { format, addMonths, subMonths } from "date-fns";

export default function CalendarPage() {
  const [currentDate, setCurrentDate] = useState(new Date("2026-09-01T12:00:00Z"));
  const [view, setView] = useState("month");
  const { display, toggleDisplay } = useCurrencyStore();
  const [selectedDate, setSelectedDate] = useState<string | null>(null);

  const prevMonth = () => setCurrentDate(prev => subMonths(prev, 1));
  const nextMonth = () => setCurrentDate(prev => addMonths(prev, 1));

  return (
    <div className="flex flex-col h-full w-full max-w-7xl mx-auto p-6 gap-6 animate-in fade-in duration-300">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-[var(--text-primary)]">Calendar</h1>
          <p className="text-sm text-[var(--text-tertiary)] mt-1">Track your daily performance and consistency</p>
        </div>
        <div className="flex items-center gap-3">
          <Tabs 
            tabs={[{ id: "month", label: "Month" }, { id: "week", label: "Week" }]} 
            activeTab={view} 
            onChange={setView} 
          />
          <Button variant="secondary" size="sm" onClick={toggleDisplay} className="w-12">
            {display === "usd" ? "$" : "%"}
          </Button>
        </div>
      </div>

      <CalendarStatBar />

      <div className="flex flex-col flex-1 bg-[var(--bg-secondary)] rounded-xl border border-[var(--border-primary)] p-5 gap-5 shadow-sm">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3 bg-[var(--bg-primary)] p-1 rounded-lg border border-[var(--border-primary)] shadow-sm">
            <Button variant="ghost" size="sm" onClick={prevMonth} className="px-2 h-8">
              <ChevronLeft className="w-4 h-4" />
            </Button>
            <h2 className="text-sm font-semibold w-32 text-center text-[var(--text-primary)]">
              {format(currentDate, "MMMM yyyy")}
            </h2>
            <Button variant="ghost" size="sm" onClick={nextMonth} className="px-2 h-8">
              <ChevronRight className="w-4 h-4" />
            </Button>
          </div>
        </div>

        <CalendarGrid 
          currentDate={currentDate} 
          onDayClick={setSelectedDate} 
        />
      </div>

      <DayDrawer 
        dateString={selectedDate} 
        isOpen={selectedDate !== null} 
        onClose={() => setSelectedDate(null)} 
      />
    </div>
  );
}
