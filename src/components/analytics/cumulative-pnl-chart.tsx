"use client";

import { useMemo } from "react";
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  ReferenceLine,
} from "recharts";
import type { Trade } from "@/types";
import { formatCurrency, cn } from "@/lib/utils";

interface CumulativePnlChartProps {
  trades: Trade[];
}

const CustomTooltip = ({ active, payload, label }: any) => {
  if (active && payload && payload.length) {
    const data = payload[0].payload;
    const isProfit = data.cumPnl >= 0;
    return (
      <div className="bg-[#090a0f]/95 border border-white/10 p-3.5 rounded-xl shadow-2xl backdrop-blur-md text-xs min-w-[160px]">
        <div className="flex items-center justify-between mb-2 pb-1.5 border-b border-white/[0.06]">
          <span className="text-neutral-400 font-medium">{data.dateStr}</span>
          <span className="text-[10px] text-neutral-400 font-mono">Trade #{data.index}</span>
        </div>
        <div className="space-y-1.5">
          <div className="flex justify-between items-center">
            <span className="text-neutral-400">Cumulative P&L</span>
            <span className={cn("font-mono font-bold", isProfit ? "text-emerald-400" : "text-rose-400")}>
              {formatCurrency(data.cumPnl)}
            </span>
          </div>
          <div className="flex justify-between items-center">
            <span className="text-neutral-400">Trade Result</span>
            <span className={cn("font-mono font-medium", data.tradePnl >= 0 ? "text-emerald-400/90" : "text-rose-400/90")}>
              {formatCurrency(data.tradePnl)}
            </span>
          </div>
          <div className="flex justify-between items-center text-[10px] text-neutral-400 pt-1">
            <span>Asset</span>
            <span className="text-neutral-300 font-mono">{data.asset} ({data.direction.toUpperCase()})</span>
          </div>
        </div>
      </div>
    );
  }
  return null;
};

export function CumulativePnlChart({ trades }: CumulativePnlChartProps) {
  const chartData = useMemo(() => {
    if (!trades || trades.length === 0) return [];

    // Sort chronologically
    const sorted = [...trades].sort(
      (a, b) => new Date(a.openTime).getTime() - new Date(b.openTime).getTime()
    );

    let runningPnl = 0;
    const points = [
      {
        index: 0,
        dateStr: "Start",
        cumPnl: 0,
        tradePnl: 0,
        asset: "-",
        direction: "",
      },
    ];

    sorted.forEach((t, i) => {
      runningPnl += t.pnl;
      const d = new Date(t.openTime);
      points.push({
        index: i + 1,
        dateStr: d.toLocaleDateString("en-US", { month: "short", day: "numeric" }),
        cumPnl: runningPnl,
        tradePnl: t.pnl,
        asset: t.asset,
        direction: t.direction,
      });
    });

    return points;
  }, [trades]);

  const finalPnl = chartData.length > 0 ? chartData[chartData.length - 1].cumPnl : 0;
  const isNetPositive = finalPnl >= 0;
  const gradientId = isNetPositive ? "pnlGradientPositive" : "pnlGradientNegative";
  const strokeColor = isNetPositive ? "#10b981" : "#f43f5e";

  if (chartData.length <= 1) {
    return (
      <div className="h-[280px] flex items-center justify-center text-xs text-neutral-500 border border-white/[0.04] rounded-2xl bg-[#0c0d14]/60">
        No trade data for this period
      </div>
    );
  }

  return (
    <div className="bg-[#0c0d14]/75 backdrop-blur-md rounded-2xl p-5 border border-white/[0.04] h-full flex flex-col justify-between">
      <div className="flex items-center justify-between mb-4">
        <div>
          <span className="text-xs font-medium text-neutral-400">Cumulative Return Curve</span>
          <p className="text-lg font-bold font-mono tracking-tight mt-0.5" style={{ color: strokeColor }}>
            {formatCurrency(finalPnl)}
          </p>
        </div>
        <div className="flex items-center gap-2">
          <span className="w-2 h-2 rounded-full" style={{ backgroundColor: strokeColor }} />
          <span className="text-[11px] text-neutral-400 font-mono">
            {chartData.length - 1} Closed Trades
          </span>
        </div>
      </div>

      <div className="h-[260px] w-full">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={chartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
            <defs>
              <linearGradient id="pnlGradientPositive" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#10b981" stopOpacity={0.25} />
                <stop offset="95%" stopColor="#10b981" stopOpacity={0.0} />
              </linearGradient>
              <linearGradient id="pnlGradientNegative" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#f43f5e" stopOpacity={0.25} />
                <stop offset="95%" stopColor="#f43f5e" stopOpacity={0.0} />
              </linearGradient>
            </defs>

            <CartesianGrid
              stroke="rgba(255,255,255,0.03)"
              strokeDasharray="3 3"
              vertical={false}
            />

            <XAxis
              dataKey="dateStr"
              axisLine={false}
              tickLine={false}
              tick={{ fontSize: 10, fill: "#71717a" }}
              dy={8}
            />
            <YAxis
              axisLine={false}
              tickLine={false}
              tick={{ fontSize: 10, fill: "#71717a" }}
              tickFormatter={(v) => `$${v}`}
            />

            <ReferenceLine y={0} stroke="rgba(255,255,255,0.08)" strokeDasharray="2 2" />

            <Tooltip content={<CustomTooltip />} cursor={{ stroke: "rgba(255,255,255,0.1)", strokeWidth: 1 }} />

            <Area
              type="monotone"
              dataKey="cumPnl"
              stroke={strokeColor}
              strokeWidth={2}
              fill={`url(#${gradientId})`}
              activeDot={{ r: 4, stroke: strokeColor, strokeWidth: 2, fill: "#0c0d14" }}
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
