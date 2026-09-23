"use client";

import { useState, useEffect } from "react";
import { format, isPast, addHours, differenceInMinutes, parseISO } from "date-fns";
import { motion } from "framer-motion";
import { cn } from "@/lib/utils";
import { mockEconomicEvents } from "@/lib/mock-data";
import { EconomicEvent } from "@/types";
import { ImpactBadge } from "./impact-badge";
import { CurrencyBadge } from "./currency-badge";

export function EventList() {
  const [events, setEvents] = useState<EconomicEvent[]>([]);

  useEffect(() => {
    // In a real app, this would be fetched and filtered
    setEvents(mockEconomicEvents);
  }, []);

  const getActualColor = (actual?: string, forecast?: string) => {
    if (!actual || !forecast) return "";
    
    // Naive parse for demo purposes (assuming numbers like "5.2%", "5.0%")
    const act = parseFloat(actual.replace(/[^0-9.-]/g, ""));
    const forcast = parseFloat(forecast.replace(/[^0-9.-]/g, ""));
    
    if (isNaN(act) || isNaN(forcast)) return "";
    
    if (act > forcast) return "text-profit";
    if (act < forcast) return "text-loss";
    return "";
  };

  const isUpcomingSoon = (dateString: string) => {
    const date = parseISO(dateString);
    const now = new Date();
    const diff = differenceInMinutes(date, now);
    return diff > 0 && diff <= 60;
  };

  // Group events by day
  const groupedEvents = events.reduce((acc, event) => {
    const dateKey = event.eventTime.split("T")[0]; // YYYY-MM-DD
    if (!acc[dateKey]) {
      acc[dateKey] = [];
    }
    acc[dateKey].push(event);
    return acc;
  }, {} as Record<string, EconomicEvent[]>);

  const sortedDates = Object.keys(groupedEvents).sort();

  return (
    <div className="w-full flex flex-col gap-6">
      {sortedDates.map((date) => {
        const dayEvents = groupedEvents[date].sort(
          (a, b) => new Date(a.eventTime).getTime() - new Date(b.eventTime).getTime()
        );
        
        const dateObj = new Date(date);

        return (
          <div key={date} className="flex flex-col gap-2">
            <h3 className="text-sm font-medium text-muted-foreground sticky top-0 bg-background/80 backdrop-blur-md py-2 z-10">
              {format(dateObj, "EEEE, MMMM d, yyyy")}
            </h3>
            
            <div className="glass-card rounded-xl overflow-hidden border border-border/50">
              <div className="grid grid-cols-12 gap-4 px-4 py-3 bg-muted/20 text-xs font-semibold text-muted-foreground border-b border-border/50">
                <div className="col-span-2 md:col-span-1">Time</div>
                <div className="col-span-2 md:col-span-1">Cur</div>
                <div className="col-span-1 md:col-span-1 text-center">Imp</div>
                <div className="col-span-7 md:col-span-5">Event</div>
                <div className="hidden md:block md:col-span-1 text-right">Actual</div>
                <div className="hidden md:block md:col-span-1 text-right">Forecast</div>
                <div className="hidden md:block md:col-span-1 text-right">Previous</div>
                <div className="hidden md:block md:col-span-1 text-right"></div>
              </div>

              <div className="flex flex-col">
                {dayEvents.map((event, i) => {
                  const past = isPast(new Date(event.eventTime));
                  const upcomingSoon = isUpcomingSoon(event.eventTime);

                  return (
                    <motion.div 
                      initial={{ opacity: 0, y: 5 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: i * 0.02 }}
                      key={event.id}
                      className={cn(
                        "grid grid-cols-12 gap-4 px-4 py-3 items-center text-sm border-b border-border/20 last:border-0 hover:bg-muted/10 transition-colors",
                        past ? "opacity-60" : "opacity-100",
                        upcomingSoon ? "bg-brand-500/5 shadow-[inset_2px_0_0_rgba(var(--brand-500),1)]" : ""
                      )}
                    >
                      <div className="col-span-2 md:col-span-1 font-medium whitespace-nowrap">
                        {format(new Date(event.eventTime), "HH:mm")}
                      </div>
                      
                      <div className="col-span-2 md:col-span-1">
                        <CurrencyBadge currency={event.currency} />
                      </div>
                      
                      <div className="col-span-1 md:col-span-1 flex justify-center">
                        <ImpactBadge impact={event.impact} />
                      </div>
                      
                      <div className="col-span-7 md:col-span-5 font-medium flex items-center gap-2">
                        {upcomingSoon && (
                          <span className="w-2 h-2 rounded-full bg-brand-500 animate-ping inline-block flex-shrink-0" />
                        )}
                        <span className="truncate">{event.title}</span>
                      </div>
                      
                      <div className={cn("hidden md:block md:col-span-1 text-right font-bold whitespace-nowrap", getActualColor(event.actual, event.forecast))}>
                        {event.actual || "-"}
                      </div>
                      
                      <div className="hidden md:block md:col-span-1 text-right text-muted-foreground whitespace-nowrap">
                        {event.forecast || "-"}
                      </div>
                      
                      <div className="hidden md:block md:col-span-1 text-right text-muted-foreground whitespace-nowrap">
                        {event.previous || "-"}
                      </div>

                      <div className="hidden md:block md:col-span-1 text-right">
                         {/* Optional actions or status */}
                      </div>
                    </motion.div>
                  );
                })}
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}
