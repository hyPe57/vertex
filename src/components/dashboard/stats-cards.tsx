"use client";

import { mockAggregateStats, mockDailyStats } from "@/lib/mock-data";
import { useCurrencyStore } from "@/stores";
import { formatCurrency, formatPercent, cn } from "@/lib/utils";
import { motion } from "framer-motion";
import { TrendingUp, TrendingDown } from "lucide-react";

// ─── Pro Mini Sparkline ───
function Sparkline({
  points,
  color = "#22c55e",
  id,
}: {
  points: number[];
  color?: string;
  id: string;
}) {
  const min = Math.min(...points);
  const max = Math.max(...points);
  const range = max - min || 1;
  const width = 56;
  const height = 28;
  const paddingX = 2;
  const paddingTop = 3;
  const paddingBottom = 3;

  const coords = points.map((p, i) => {
    const x = paddingX + (i / (points.length - 1)) * (width - paddingX * 2);
    const y =
      height -
      paddingBottom -
      ((p - min) / range) * (height - paddingTop - paddingBottom);
    return { x: Number(x.toFixed(1)), y: Number(y.toFixed(1)) };
  });

  const pathD = `M ${coords.map((c) => `${c.x},${c.y}`).join(" L ")}`;
  const lastPoint = coords[coords.length - 1];
  const areaD = `${pathD} L ${(width - paddingX).toFixed(1)},${height} L ${paddingX},${height} Z`;

  return (
    <svg width={width} height={height} className="overflow-visible shrink-0">
      <defs>
        <linearGradient id={`grad-${id}`} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor={color} stopOpacity={0.4} />
          <stop offset="100%" stopColor={color} stopOpacity={0.0} />
        </linearGradient>
      </defs>
      <path d={areaD} fill={`url(#grad-${id})`} />
      <path
        d={pathD}
        fill="none"
        stroke={color}
        strokeWidth="2.0"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <circle
        cx={lastPoint.x}
        cy={lastPoint.y}
        r="2.5"
        fill={color}
        className="filter drop-shadow-[0_0_4px_rgba(255,255,255,0.4)]"
      />
    </svg>
  );
}

// ─── Pro Semicircle Gauge (ครึ่งวงกลม) ───
function SemicircleGauge({
  percent = 65,
  color = "#22c55e",
}: {
  percent: number;
  color?: string;
}) {
  const radius = 18;
  const circumference = Math.PI * radius; // length ~56.55
  const clamped = Math.min(Math.max(percent, 0), 100);
  const strokeDashoffset = circumference - (clamped / 100) * circumference;

  return (
    <svg
      width="46"
      height="26"
      viewBox="0 0 46 26"
      className="shrink-0 overflow-visible"
    >
      {/* Background Track Arc */}
      <path
        d="M 5,23 A 18,18 0 0,1 41,23"
        fill="none"
        stroke="currentColor"
        className="text-[var(--border-primary)]"
        strokeWidth="3.5"
        strokeLinecap="round"
        opacity="0.5"
      />
      {/* Foreground Progress Arc */}
      <path
        d="M 5,23 A 18,18 0 0,1 41,23"
        fill="none"
        stroke={color}
        strokeWidth="3.5"
        strokeDasharray={circumference}
        strokeDashoffset={strokeDashoffset}
        strokeLinecap="round"
        className="transition-all duration-500 ease-out"
        style={{
          filter: `drop-shadow(0 0 4px ${color}60)`,
        }}
      />
    </svg>
  );
}

export function StatsCards() {
  const { display } = useCurrencyStore();
  const stats = mockAggregateStats;

  const todayPnl =
    mockDailyStats.length > 0
      ? mockDailyStats[mockDailyStats.length - 1].netPnl
      : 0;

  const items = [
    {
      id: "net-pnl",
      label: "Net PnL",
      value:
        display === "usd"
          ? formatCurrency(stats.netPnl)
          : formatPercent(stats.netPnlPercent),
      trend: stats.netPnl >= 0 ? ("up" as const) : ("down" as const),
      visualType: "sparkline" as const,
      sparklinePoints: [10000, 10250, 10180, 10600, 10550, 10900, 11400, 11800, 12847.5],
      visualColor: "#22c55e",
    },
    {
      id: "today-pnl",
      label: "Today's PnL",
      value: formatCurrency(todayPnl),
      trend:
        todayPnl > 0
          ? ("up" as const)
          : todayPnl < 0
          ? ("down" as const)
          : ("neutral" as const),
      visualType: "sparkline" as const,
      sparklinePoints: [0, 220, 180, 490, 680, 840, 1155],
      visualColor: "#22c55e",
    },
    {
      id: "win-rate",
      label: "Win Rate",
      value: `${stats.winRate}%`,
      trend: stats.winRate >= 50 ? ("up" as const) : ("down" as const),
      visualType: "semicircle" as const,
      percent: stats.winRate,
      visualColor: "#22c55e",
    },
    {
      id: "profit-factor",
      label: "Profit Factor",
      value: stats.profitFactor.toFixed(2),
      trend: stats.profitFactor >= 1 ? ("up" as const) : ("down" as const),
      visualType: "sparkline" as const,
      sparklinePoints: [1.2, 1.4, 1.35, 1.65, 1.8, 2.05, 2.35],
      visualColor: "#818cf8",
    },
    {
      id: "avg-rr",
      label: "Avg RR",
      value: `1:${stats.avgRR.toFixed(2)}`,
      trend: stats.avgRR >= 1.5 ? ("up" as const) : ("neutral" as const),
      visualType: "semicircle" as const,
      percent: Math.min((stats.avgRR / 3.0) * 100, 100),
      visualColor: "#818cf8",
    },
    {
      id: "max-dd",
      label: "Max DD",
      value: formatCurrency(stats.maxDrawdown, false),
      trend: "down" as const,
      visualType: "semicircle" as const,
      percent: 35,
      visualColor: "#ef4444",
    },
  ];

  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 xl:grid-cols-6 gap-2.5">
      {items.map((item, i) => (
        <motion.div
          key={item.id}
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.25, delay: i * 0.02 }}
        >
          <div className="p-3.5 rounded-xl bg-[var(--bg-secondary)]/90 border border-[var(--border-primary)] flex flex-col justify-between min-h-[82px] hover:border-brand-500/40 transition-all duration-200 shadow-xs">
            {/* Header: Label + Trend Icon */}
            <div className="flex items-center justify-between">
              <span className="text-[10px] font-semibold uppercase tracking-wider text-[var(--text-tertiary)] truncate">
                {item.label}
              </span>
              {item.trend === "up" && (
                <span className="flex items-center text-profit bg-profit/10 p-0.5 rounded">
                  <TrendingUp size={12} />
                </span>
              )}
              {item.trend === "down" && (
                <span className="flex items-center text-loss bg-loss/10 p-0.5 rounded">
                  <TrendingDown size={12} />
                </span>
              )}
            </div>

            {/* Bottom Row: Value + Visual Indicator */}
            <div className="mt-1.5 flex items-end justify-between gap-1.5">
              <span
                className={cn(
                  "text-base sm:text-lg font-bold font-mono tracking-tight",
                  item.trend === "up" && "text-profit",
                  item.trend === "down" && "text-loss",
                  item.trend === "neutral" && "text-[var(--text-primary)]"
                )}
              >
                {item.value}
              </span>

              {/* Visual Indicator */}
              <div className="shrink-0 mb-0.5">
                {item.visualType === "sparkline" ? (
                  <Sparkline
                    id={item.id}
                    points={item.sparklinePoints}
                    color={item.visualColor}
                  />
                ) : (
                  <SemicircleGauge
                    percent={item.percent}
                    color={item.visualColor}
                  />
                )}
              </div>
            </div>
          </div>
        </motion.div>
      ))}
    </div>
  );
}
