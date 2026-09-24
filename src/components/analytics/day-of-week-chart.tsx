"use client";

import { useMemo } from "react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Cell,
} from "recharts";
import type { Trade } from "@/types";
import { cn } from "@/lib/utils";

const DAY_NAMES = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

const CustomTooltip = ({ active, payload }: any) => {
  if (active && payload && payload.length) {
    const d = payload[0].payload;
    const isProfit = d.totalPnl >= 0;
    return (
      <div className="bg-[#0c0d14] border border-white/10 p-3 rounded-xl shadow-2xl text-xs min-w-[120px]">
        <p className="font-semibold text-white mb-1.5">{d.day}</p>
        <div className="space-y-1">
          <p className="flex justify-between gap-4">
            <span className="text-neutral-400">PnL</span>
            <span className={cn("font-mono font-medium", isProfit ? "text-emerald-400" : "text-rose-400")}>
              {isProfit ? "+" : "-"}${Math.abs(d.totalPnl).toFixed(0)}
            </span>
          </p>
          <p className="flex justify-between gap-4">
            <span className="text-neutral-400">Trades</span>
            <span className="text-white font-medium">{d.count}</span>
          </p>
          <p className="flex justify-between gap-4">
            <span className="text-neutral-400">Win Rate</span>
            <span className="text-white font-medium">{d.winRate.toFixed(0)}%</span>
          </p>
        </div>
      </div>
    );
  }
  return null;
};

export function DayOfWeekChart({ trades }: { trades: Trade[] }) {
  const data = useMemo(() => {
    // Only weekdays Mon-Fri (index 1-5)
    const days = [1, 2, 3, 4, 5].map((dayIdx) => {
      const dayTrades = trades.filter((t) => {
        const d = new Date(t.openTime);
        return d.getDay() === dayIdx;
      });
      const wins = dayTrades.filter((t) => t.pnl > 0).length;
      const totalPnl = dayTrades.reduce((s, t) => s + t.pnl, 0);
      const winRate = dayTrades.length > 0 ? (wins / dayTrades.length) * 100 : 0;
      return {
        day: DAY_NAMES[dayIdx],
        count: dayTrades.length,
        totalPnl,
        winRate,
      };
    });
    return days;
  }, [trades]);

  return (
    <div className="bg-[#0c0d14]/75 backdrop-blur-md rounded-2xl p-5 border border-white/[0.04] h-full">
      <h3 className="text-sm font-semibold text-neutral-100 tracking-tight mb-4">
        Day of Week Edge
      </h3>
      <div className="h-[220px]">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={data} margin={{ top: 5, right: 5, left: -25, bottom: 0 }}>
            <CartesianGrid
              vertical={false}
              stroke="rgba(255,255,255,0.04)"
              strokeDasharray="3 3"
            />
            <XAxis
              dataKey="day"
              axisLine={false}
              tickLine={false}
              tick={{ fontSize: 11, fill: "#71717a" }}
              dy={8}
            />
            <YAxis
              axisLine={false}
              tickLine={false}
              tick={{ fontSize: 11, fill: "#71717a" }}
              tickFormatter={(v) => `$${v}`}
            />
            <Tooltip content={<CustomTooltip />} cursor={{ fill: "rgba(255,255,255,0.03)" }} />
            <Bar dataKey="totalPnl" radius={[6, 6, 0, 0]} maxBarSize={44}>
              {data.map((entry, i) => (
                <Cell
                  key={i}
                  fill={entry.totalPnl >= 0 ? "#22c55e" : "#ef4444"}
                  opacity={0.8}
                />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
