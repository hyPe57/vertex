"use client";

import { mockAggregateStats } from "@/lib/mock-data";
import { WinLossDonut } from "@/components/analytics/win-loss-donut";
import { PerformanceBars } from "@/components/analytics/performance-bars";
import { SessionHeatmap } from "@/components/analytics/session-heatmap";
import { EmotionCorrelation } from "@/components/analytics/emotion-correlation";
import { Card } from "@/components/ui";
import { cn, formatCurrency } from "@/lib/utils";
import { ArrowUpRight, ArrowDownRight, Activity, Target, TrendingUp, DollarSign } from "lucide-react";
import { motion } from "framer-motion";

function StatCard({
  title,
  value,
  subtitle,
  icon: Icon,
  isPositive,
  delay = 0,
}: {
  title: string;
  value: string | number;
  subtitle?: string;
  icon: React.ComponentType<{ className?: string }>;
  isPositive?: boolean;
  delay?: number;
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay, duration: 0.35 }}
    >
      <Card className="p-5 h-full">
        <div className="flex items-center justify-between mb-3">
          <p className="text-xs font-medium uppercase tracking-wider text-[var(--text-tertiary)]">
            {title}
          </p>
          <div className="p-1.5 rounded-md bg-surface-100 dark:bg-surface-100">
            <Icon className="w-3.5 h-3.5 text-[var(--text-tertiary)]" />
          </div>
        </div>
        <h3 className="text-2xl font-bold text-[var(--text-primary)]">{value}</h3>
        {subtitle && (
          <div className="flex items-center mt-1">
            {isPositive !== undefined &&
              (isPositive ? (
                <ArrowUpRight className="w-3 h-3 text-profit mr-1" />
              ) : (
                <ArrowDownRight className="w-3 h-3 text-loss mr-1" />
              ))}
            <p
              className={cn(
                "text-xs font-medium",
                isPositive === true
                  ? "text-profit"
                  : isPositive === false
                  ? "text-loss"
                  : "text-[var(--text-tertiary)]"
              )}
            >
              {subtitle}
            </p>
          </div>
        )}
      </Card>
    </motion.div>
  );
}

export default function AnalyticsPage() {
  const isNetPositive = mockAggregateStats.netPnl >= 0;

  return (
    <div className="p-6 lg:p-8 max-w-[1400px] mx-auto space-y-6">
      <h1 className="text-2xl font-bold text-[var(--text-primary)]">Analytics</h1>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        <StatCard
          title="Net PnL"
          value={formatCurrency(mockAggregateStats.netPnl)}
          subtitle={`${isNetPositive ? "+" : ""}${mockAggregateStats.netPnlPercent}%`}
          icon={DollarSign}
          isPositive={isNetPositive}
          delay={0.05}
        />
        <StatCard
          title="Win Rate"
          value={`${mockAggregateStats.winRate}%`}
          subtitle={`${mockAggregateStats.wins}W / ${mockAggregateStats.losses}L`}
          icon={Target}
          delay={0.1}
        />
        <StatCard
          title="Profit Factor"
          value={mockAggregateStats.profitFactor}
          subtitle="Gross Profit / Gross Loss"
          icon={TrendingUp}
          delay={0.15}
        />
        <StatCard
          title="Total Trades"
          value={mockAggregateStats.totalTrades}
          subtitle={`Avg ${formatCurrency(mockAggregateStats.avgDailyPnl)}/day`}
          icon={Activity}
          delay={0.2}
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        <div className="lg:col-span-2">
          <PerformanceBars />
        </div>
        <div>
          <WinLossDonut />
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <EmotionCorrelation />
        <SessionHeatmap />
      </div>
    </div>
  );
}
