"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { StatisticsCard } from "@/components/dashboard/statistics-card";
import { EquityCurveCard } from "@/components/dashboard/equity-curve-card";
import { DailyPnlChart } from "@/components/dashboard/daily-pnl-chart";
import { HourlyHeatmap } from "@/components/dashboard/hourly-heatmap";
import { InstrumentsCard } from "@/components/dashboard/instruments-card";
import { DashboardCalendar } from "@/components/dashboard/dashboard-calendar";
import { QuickLog } from "@/components/dashboard/quick-log";
import { LayoutDashboard, Calendar as CalendarIcon, Layers } from "lucide-react";
import { cn } from "@/lib/utils";

export default function DashboardPage() {
  const [activeTab, setActiveTab] = useState<"overview" | "calendar" | "both">("overview");

  return (
    <div className="w-full px-4 lg:px-6 py-4 space-y-4">
      {/* View Switcher Bar on Top of Left Column */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 items-start">
        {/* Left Section (8 cols) */}
        <div className="lg:col-span-8 xl:col-span-8 flex flex-col gap-4">
          {/* Main Section Mode Tabs */}
          <div className="flex items-center justify-between pb-1">
            <div className="flex items-center p-1 bg-[var(--bg-secondary)] border border-[var(--border-primary)] rounded-xl text-xs shadow-xs">
              <button
                type="button"
                onClick={() => setActiveTab("overview")}
                className={cn(
                  "flex items-center gap-1.5 px-3 py-1.5 rounded-lg font-semibold transition-all duration-150",
                  activeTab === "overview"
                    ? "bg-brand-500/20 text-brand-400 border border-brand-500/30 shadow-xs"
                    : "text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:bg-surface-100"
                )}
              >
                <LayoutDashboard size={13} />
                <span>Overview & Statistics</span>
              </button>

              <button
                type="button"
                onClick={() => setActiveTab("calendar")}
                className={cn(
                  "flex items-center gap-1.5 px-3 py-1.5 rounded-lg font-semibold transition-all duration-150",
                  activeTab === "calendar"
                    ? "bg-brand-500/20 text-brand-400 border border-brand-500/30 shadow-xs"
                    : "text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:bg-surface-100"
                )}
              >
                <CalendarIcon size={13} />
                <span>Calendar View</span>
              </button>

              <button
                type="button"
                onClick={() => setActiveTab("both")}
                className={cn(
                  "flex items-center gap-1.5 px-3 py-1.5 rounded-lg font-semibold transition-all duration-150 hidden sm:flex",
                  activeTab === "both"
                    ? "bg-brand-500/20 text-brand-400 border border-brand-500/30 shadow-xs"
                    : "text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:bg-surface-100"
                )}
              >
                <Layers size={13} />
                <span>All Sections</span>
              </button>
            </div>
          </div>

          {/* Conditional / Animated Views */}
          <AnimatePresence mode="wait">
            {(activeTab === "overview" || activeTab === "both") && (
              <motion.div
                key="overview-section"
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -8 }}
                transition={{ duration: 0.25 }}
                className="flex flex-col gap-4"
              >
                {/* Row 1: Statistics (4 Quadrants) | Equity Curve Card */}
                <div className="grid grid-cols-1 md:grid-cols-12 gap-4 items-stretch">
                  <div className="md:col-span-5 h-full">
                    <StatisticsCard />
                  </div>
                  <div className="md:col-span-7 h-full">
                    <EquityCurveCard period="month" />
                  </div>
                </div>

                {/* Row 2: Instruments Breakdown | Daily P&L Bar Chart */}
                <div className="grid grid-cols-1 md:grid-cols-12 gap-4 items-stretch">
                  <div className="md:col-span-5 h-full">
                    <InstrumentsCard />
                  </div>
                  <div className="md:col-span-7 h-full">
                    <DailyPnlChart height={175} />
                  </div>
                </div>

                {/* Row 3: 24-Hour P&L Heatmap */}
                <div className="w-full">
                  <HourlyHeatmap />
                </div>
              </motion.div>
            )}

            {(activeTab === "calendar" || activeTab === "both") && (
              <motion.div
                key="calendar-section"
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -8 }}
                transition={{ duration: 0.25 }}
                className="w-full"
              >
                <DashboardCalendar />
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Right Column (4 cols): QuickLog - Sits flush at the top as requested */}
        <div className="lg:col-span-4 xl:col-span-4 w-full sticky top-4">
          <QuickLog />
        </div>
      </div>
    </div>
  );
}
