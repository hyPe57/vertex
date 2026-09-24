"use client";

import React, { useRef } from "react";
import { motion } from "framer-motion";
import { DashboardCalendar } from "@/components/dashboard/dashboard-calendar";
import { StatisticsCard } from "@/components/dashboard/statistics-card";
import { EquityCurveCard } from "@/components/dashboard/equity-curve-card";
import { DailyPnlChart } from "@/components/dashboard/daily-pnl-chart";
import { HourlyHeatmap } from "@/components/dashboard/hourly-heatmap";
import { InstrumentsCard } from "@/components/dashboard/instruments-card";
import { QuickLog } from "@/components/dashboard/quick-log";
import { RecentTradesCard } from "@/components/dashboard/recent-trades";

export default function DashboardPage() {
  const leftScrollRef = useRef<HTMLDivElement>(null);
  const rightScrollRef = useRef<HTMLDivElement>(null);

  // When scrolling mouse over the right fixed panel, seamlessly forward scroll to the left analytics panel
  const handleRightWheel = (e: React.WheelEvent<HTMLDivElement>) => {
    const rightEl = rightScrollRef.current;
    const leftEl = leftScrollRef.current;
    if (!rightEl || !leftEl) return;

    const canScrollDown = rightEl.scrollTop + rightEl.clientHeight < rightEl.scrollHeight - 2;
    const canScrollUp = rightEl.scrollTop > 2;

    // If right pane doesn't need scrolling in this direction, forward scroll to left side
    if ((e.deltaY > 0 && !canScrollDown) || (e.deltaY < 0 && !canScrollUp)) {
      leftEl.scrollTop += e.deltaY;
    }
  };

  return (
    <div className="w-full px-4 lg:px-6 py-4 lg:h-[calc(100vh-3.5rem)] lg:overflow-hidden">
      {/* Main Split Layout: Left Scrollable Analytics + Right Fixed QuickLog */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 items-start lg:h-full">
        {/* Left Section (8 cols): Complete Trading Performance & Calendar Flow */}
        <div
          ref={leftScrollRef}
          className="lg:col-span-8 xl:col-span-8 flex flex-col gap-5 lg:h-full lg:overflow-y-auto lg:pr-2.5 lg:pb-16 [scroll-behavior:smooth]"
        >
          {/* 1. TOP ROW: Full Trading Calendar at the Very Top */}
          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3 }}
            className="w-full"
          >
            <DashboardCalendar />
          </motion.div>

          {/* 2. Row: Statistics (4 Quadrants) | Equity Curve Card */}
          <div className="grid grid-cols-1 md:grid-cols-12 gap-4 items-stretch">
            <motion.div
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3, delay: 0.05 }}
              className="md:col-span-5 h-full"
            >
              <StatisticsCard />
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3, delay: 0.1 }}
              className="md:col-span-7 h-full"
            >
              <EquityCurveCard period="month" />
            </motion.div>
          </div>

          {/* 3. Performance Insights: Instruments Breakdown | Daily P&L Bar Chart */}
          <div className="grid grid-cols-1 md:grid-cols-12 gap-4 items-stretch">
            <motion.div
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3, delay: 0.15 }}
              className="md:col-span-5 h-full"
            >
              <InstrumentsCard />
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3, delay: 0.2 }}
              className="md:col-span-7 h-full"
            >
              <DailyPnlChart height={180} />
            </motion.div>
          </div>

          {/* 4. Bottom Row: 24-Hour P&L Heatmap */}
          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3, delay: 0.25 }}
            className="w-full"
          >
            <HourlyHeatmap />
          </motion.div>
        </div>

        {/* Right Column (4 cols): Fixed QuickLog + Recent Trades Feed */}
        <div
          ref={rightScrollRef}
          onWheel={handleRightWheel}
          className="lg:col-span-4 xl:col-span-4 w-full flex flex-col gap-4 lg:h-full lg:overflow-y-auto lg:pb-16 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
        >
          <QuickLog />
          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3, delay: 0.15 }}
          >
            <RecentTradesCard />
          </motion.div>
        </div>
      </div>
    </div>
  );
}
