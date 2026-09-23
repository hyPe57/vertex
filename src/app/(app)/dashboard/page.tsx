"use client";

import { motion } from "framer-motion";
import { DashboardCalendar } from "@/components/dashboard/dashboard-calendar";
import { StatisticsCard } from "@/components/dashboard/statistics-card";
import { EquityCurveCard } from "@/components/dashboard/equity-curve-card";
import { DailyPnlChart } from "@/components/dashboard/daily-pnl-chart";
import { HourlyHeatmap } from "@/components/dashboard/hourly-heatmap";
import { InstrumentsCard } from "@/components/dashboard/instruments-card";
import { QuickLog } from "@/components/dashboard/quick-log";

export default function DashboardPage() {
  return (
    <div className="w-full px-4 lg:px-6 py-4">
      {/* Main Split Layout: Left Content Flow + Right QuickLog */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 items-start">
        {/* Left Section (8 cols): Complete Trading Performance & Calendar Flow */}
        <div className="lg:col-span-8 xl:col-span-8 flex flex-col gap-5">
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

        {/* Right Column (4 cols): QuickLog - Sits flush at top */}
        <div className="lg:col-span-4 xl:col-span-4 w-full sticky top-4">
          <QuickLog />
        </div>
      </div>
    </div>
  );
}
