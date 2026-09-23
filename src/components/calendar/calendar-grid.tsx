import { useCurrencyStore } from "@/stores";
import { mockDailyStats } from "@/lib/mock-data";
import { cn } from "@/lib/utils";
import { useMemo } from "react";
import { format, getDaysInMonth, startOfMonth, getDay, isSameDay } from "date-fns";

interface CalendarGridProps {
  currentDate: Date;
  onDayClick: (dateString: string) => void;
}

export function CalendarGrid({ currentDate, onDayClick }: CalendarGridProps) {
  const { display } = useCurrencyStore();
  const isPercent = display === "percent";
  
  const today = new Date("2026-09-23T12:00:00Z");

  const days = useMemo(() => {
    const year = currentDate.getFullYear();
    const month = currentDate.getMonth();
    const daysInMonth = getDaysInMonth(currentDate);
    const firstDayOfMonth = startOfMonth(currentDate);
    
    let startDay = getDay(firstDayOfMonth);
    if (startDay === 0) startDay = 7;
    startDay -= 1;
    
    const calendarDays = [];
    
    for (let i = 0; i < startDay; i++) {
      calendarDays.push(null);
    }
    
    for (let i = 1; i <= daysInMonth; i++) {
      const date = new Date(year, month, i, 12, 0, 0); // avoid timezone issues
      const dateString = format(date, "yyyy-MM-dd");
      const stat = mockDailyStats.find(s => s.date === dateString);
      calendarDays.push({ date, dateString, stat });
    }
    
    while (calendarDays.length % 7 !== 0) {
      calendarDays.push(null);
    }
    
    return calendarDays;
  }, [currentDate]);

  const weeks = [];
  for (let i = 0; i < days.length; i += 7) {
    weeks.push(days.slice(i, i + 7));
  }

  const formatPnl = (pnl: number, percent: number) => {
    if (pnl === 0) return "$0.00";
    if (isPercent) {
      return `${percent > 0 ? "+" : ""}${percent.toFixed(2)}%`;
    }
    return `${pnl > 0 ? "+" : ""}$${Math.abs(pnl).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
  };

  return (
    <div className="w-full rounded-xl border border-[var(--border-primary)] bg-[var(--bg-primary)] overflow-hidden shadow-sm">
      <div className="grid grid-cols-[repeat(7,1fr)_80px] border-b border-[var(--border-primary)] bg-[var(--bg-secondary)]">
        {["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"].map((day) => (
          <div key={day} className="px-2 py-3 text-center text-xs font-semibold text-[var(--text-secondary)] border-r border-[var(--border-primary)]">
            {day}
          </div>
        ))}
        <div className="px-2 py-3 text-center text-xs font-semibold text-[var(--text-secondary)]">
          Total
        </div>
      </div>
      
      <div className="flex flex-col">
        {weeks.map((week, wIdx) => {
          let weeklyPnl = 0;
          let weeklyPercent = 0;
          week.forEach(d => {
            if (d?.stat) {
              weeklyPnl += d.stat.netPnl;
              weeklyPercent += d.stat.netPnlPercent;
            }
          });
          
          return (
            <div key={wIdx} className="grid grid-cols-[repeat(7,1fr)_80px] border-b border-[var(--border-primary)] last:border-0 min-h-[120px]">
              {week.map((dayObj, dIdx) => {
                if (!dayObj) return <div key={dIdx} className="border-r border-[var(--border-primary)] bg-surface-50/50 dark:bg-surface-50/20" />;
                
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
                      "relative border-r border-[var(--border-primary)] p-2 transition-all duration-200 cursor-pointer hover:bg-[var(--bg-secondary)] group flex flex-col",
                      isProfit && "bg-profit/5",
                      isLoss && "bg-loss/5",
                      isToday && "ring-1 ring-inset ring-brand-500 z-10"
                    )}
                  >
                    <span className={cn(
                      "text-xs font-medium",
                      isToday ? "text-brand-500" : "text-[var(--text-tertiary)]"
                    )}>
                      {date.getDate()}
                    </span>
                    
                    {hasTrades && stat && (
                      <div className="flex flex-col flex-1 items-center justify-center mt-1">
                        <span className={cn(
                          "font-mono text-sm font-medium",
                          isProfit ? "text-profit" : isLoss ? "text-loss" : "text-[var(--text-secondary)]"
                        )}>
                          {formatPnl(stat.netPnl, stat.netPnlPercent)}
                        </span>
                      </div>
                    )}
                    {hasTrades && stat && (
                      <div className="mt-auto text-center">
                        <span className="text-[10px] text-[var(--text-tertiary)] opacity-80 group-hover:opacity-100 transition-opacity">
                          {stat.tradeCount} trade{stat.tradeCount !== 1 && 's'}
                        </span>
                      </div>
                    )}
                  </div>
                );
              })}
              
              <div className="flex items-center justify-center p-2 bg-[var(--bg-secondary)]/30">
                <span className={cn(
                  "font-mono text-sm font-semibold",
                  weeklyPnl > 0 ? "text-profit" : weeklyPnl < 0 ? "text-loss" : "text-[var(--text-secondary)]"
                )}>
                  {weeklyPnl !== 0 ? formatPnl(weeklyPnl, weeklyPercent) : "-"}
                </span>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
