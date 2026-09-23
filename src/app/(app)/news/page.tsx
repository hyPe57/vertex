"use client";

import { useState } from "react";
import { EventList } from "@/components/news/event-list";
import { Calendar, Filter, Clock } from "lucide-react";

export default function NewsPage() {
  const [activeImpact, setActiveImpact] = useState<string[]>(['high', 'medium', 'low']);
  
  const timeZone = Intl.DateTimeFormat().resolvedOptions().timeZone;
  const localTime = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

  return (
    <div className="flex flex-col w-full max-w-6xl mx-auto py-8 px-4 gap-8">
      {/* Header */}
      <div className="flex flex-col gap-2">
        <h1 className="text-3xl font-bold tracking-tight">Economic Calendar</h1>
        <p className="text-muted-foreground">
          Track upcoming market events, economic indicators, and news releases that may impact your trades.
        </p>
      </div>

      {/* Toolbar */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 p-4 rounded-2xl border border-white/[0.04] bg-[#0c0d14]/75 shadow-xs">
        <div className="flex items-center gap-4 overflow-x-auto no-scrollbar w-full md:w-auto pb-2 md:pb-0">
          <div className="flex items-center gap-2 text-sm">
            <Filter className="w-4 h-4 text-muted-foreground" />
            <span className="text-muted-foreground font-medium">Impact:</span>
            <div className="flex gap-1">
              {['high', 'medium', 'low'].map(impact => (
                <button
                  key={impact}
                  onClick={() => {
                    if (activeImpact.includes(impact)) {
                      setActiveImpact(activeImpact.filter(i => i !== impact));
                    } else {
                      setActiveImpact([...activeImpact, impact]);
                    }
                  }}
                  className={`px-3 py-1 rounded-full text-xs font-medium capitalize transition-all ${
                    activeImpact.includes(impact) 
                      ? "bg-primary text-primary-foreground" 
                      : "bg-muted text-muted-foreground hover:bg-muted/80"
                  }`}
                >
                  {impact}
                </button>
              ))}
            </div>
          </div>
          
          <div className="w-px h-5 bg-white/[0.06] hidden md:block" />
          
          <div className="flex items-center gap-2 text-sm">
            <Calendar className="w-4 h-4 text-muted-foreground" />
            <select className="bg-transparent text-sm border-none outline-none focus:ring-0 text-foreground cursor-pointer">
              <option>This Week</option>
              <option>Today</option>
              <option>Tomorrow</option>
              <option>Next Week</option>
            </select>
          </div>
        </div>

        <div className="flex items-center gap-2 text-xs text-zinc-400 bg-white/[0.03] px-3 py-1.5 rounded-xl border border-white/[0.04]">
          <Clock className="w-4 h-4" />
          <span>{localTime} ({timeZone})</span>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1">
        <EventList />
      </div>
    </div>
  );
}
