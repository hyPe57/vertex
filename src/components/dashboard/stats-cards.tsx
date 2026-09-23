"use client";

import { mockAggregateStats, mockDailyStats } from "@/lib/mock-data";
import { useCurrencyStore } from "@/stores";
import { formatCurrency, formatPercent, cn } from "@/lib/utils";
import { Card } from "@/components/ui";
import { motion } from "framer-motion";
import { TrendingUp, TrendingDown } from "lucide-react";

export function StatsCards() {
  const { display } = useCurrencyStore();
  const stats = mockAggregateStats;

  const todayPnl =
    mockDailyStats.length > 0
      ? mockDailyStats[mockDailyStats.length - 1].netPnl
      : 0;

  const items = [
    {
      label: "Net PnL",
      value:
        display === "usd"
          ? formatCurrency(stats.netPnl)
          : formatPercent(stats.netPnlPercent),
      trend: stats.netPnl >= 0 ? ("up" as const) : ("down" as const),
    },
    {
      label: "Today's PnL",
      value: formatCurrency(todayPnl),
      trend:
        todayPnl > 0
          ? ("up" as const)
          : todayPnl < 0
          ? ("down" as const)
          : ("neutral" as const),
    },
    {
      label: "Win Rate",
      value: `${stats.winRate}%`,
      trend: stats.winRate >= 50 ? ("up" as const) : ("down" as const),
    },
    {
      label: "Profit Factor",
      value: stats.profitFactor.toFixed(2),
      trend: stats.profitFactor >= 1 ? ("up" as const) : ("down" as const),
    },
    {
      label: "Avg RR",
      value: `1:${stats.avgRR.toFixed(2)}`,
      trend: stats.avgRR >= 1.5 ? ("up" as const) : ("neutral" as const),
    },
    {
      label: "Max DD",
      value: formatCurrency(stats.maxDrawdown, false),
      trend: "down" as const,
    },
  ];

  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 xl:grid-cols-6 gap-2.5">
      {items.map((item, i) => (
        <motion.div
          key={item.label}
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.25, delay: i * 0.03 }}
        >
          <Card className="p-3 glass-card">
            <p className="text-[10px] font-medium uppercase tracking-wider text-[var(--text-tertiary)] truncate">
              {item.label}
            </p>
            <div className="mt-1 flex items-center justify-between">
              <span
                className={cn(
                  "text-sm sm:text-base font-semibold font-mono truncate",
                  item.trend === "up" && "text-profit",
                  item.trend === "down" && "text-loss",
                  item.trend === "neutral" && "text-[var(--text-primary)]"
                )}
              >
                {item.value}
              </span>
              {item.trend === "up" && (
                <TrendingUp size={13} className="text-profit shrink-0 ml-1" />
              )}
              {item.trend === "down" && (
                <TrendingDown size={13} className="text-loss shrink-0 ml-1" />
              )}
            </div>
          </Card>
        </motion.div>
      ))}
    </div>
  );
}
