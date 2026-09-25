"use client";

import { useMemo } from "react";
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from "recharts";
import type { Trade } from "@/types";
import { formatCurrency, cn } from "@/lib/utils";

interface AssetDonutChartProps {
  trades: Trade[];
}

const PALETTE = [
  "#38bdf8", // Sky blue
  "#818cf8", // Indigo
  "#c084fc", // Purple
  "#fb7185", // Rose
  "#34d399", // Emerald
  "#fbbf24", // Amber
];

const CustomTooltip = ({ active, payload }: any) => {
  if (active && payload && payload.length) {
    const data = payload[0].payload;
    return (
      <div className="bg-[#090a0f]/95 border border-white/10 p-3 rounded-xl shadow-2xl backdrop-blur-md text-xs min-w-[140px]">
        <div className="flex items-center gap-2 mb-1.5">
          <span className="w-2 h-2 rounded-full" style={{ backgroundColor: data.color }} />
          <span className="font-semibold text-white font-mono">{data.asset}</span>
        </div>
        <div className="space-y-1 font-mono text-[11px]">
          <div className="flex justify-between text-neutral-400">
            <span>Share:</span>
            <span className="text-white font-medium">{data.value} trades ({data.percent}%)</span>
          </div>
          <div className="flex justify-between text-neutral-400">
            <span>P&L:</span>
            <span className={cn("font-medium", data.pnl >= 0 ? "text-emerald-400" : "text-rose-400")}>
              {formatCurrency(data.pnl)}
            </span>
          </div>
          <div className="flex justify-between text-neutral-400">
            <span>Win Rate:</span>
            <span className="text-white font-medium">{data.winRate.toFixed(0)}%</span>
          </div>
        </div>
      </div>
    );
  }
  return null;
};

export function AssetDonutChart({ trades }: AssetDonutChartProps) {
  const { data, topAsset } = useMemo(() => {
    const map: Record<string, { count: number; pnl: number; wins: number }> = {};
    const total = trades.length;

    trades.forEach((t) => {
      if (!map[t.asset]) map[t.asset] = { count: 0, pnl: 0, wins: 0 };
      map[t.asset].count += 1;
      map[t.asset].pnl += t.pnl;
      if (t.pnl > 0) map[t.asset].wins += 1;
    });

    const entries = Object.entries(map).sort((a, b) => b[1].count - a[1].count);

    const chartData = entries.map(([asset, val], i) => ({
      asset,
      value: val.count,
      pnl: val.pnl,
      winRate: val.count > 0 ? (val.wins / val.count) * 100 : 0,
      percent: total > 0 ? Math.round((val.count / total) * 100) : 0,
      color: PALETTE[i % PALETTE.length],
    }));

    return {
      data: chartData,
      topAsset: chartData[0] || null,
    };
  }, [trades]);

  if (data.length === 0) {
    return (
      <div className="bg-[#0c0d14]/75 backdrop-blur-md rounded-2xl p-5 border border-white/[0.04] h-full flex items-center justify-center text-xs text-neutral-500">
        No symbol data available
      </div>
    );
  }

  return (
    <div className="bg-[#0c0d14]/75 backdrop-blur-md rounded-2xl p-5 border border-white/[0.04] h-full flex flex-col justify-between">
      <div className="flex items-center justify-between mb-2">
        <h3 className="text-sm font-semibold text-neutral-100 tracking-tight">
          Symbol Allocation
        </h3>
        <span className="text-[10px] text-neutral-400 font-mono">
          {data.length} Symbols
        </span>
      </div>

      {/* Donut Chart */}
      <div className="relative h-[180px] w-full flex items-center justify-center">
        <ResponsiveContainer width="100%" height="100%">
          <PieChart>
            <Pie
              data={data}
              cx="50%"
              cy="50%"
              innerRadius={50}
              outerRadius={70}
              paddingAngle={3}
              dataKey="value"
              stroke="none"
            >
              {data.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={entry.color} />
              ))}
            </Pie>
            <Tooltip content={<CustomTooltip />} />
          </PieChart>
        </ResponsiveContainer>

        {/* Center label */}
        <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
          <span className="text-base font-bold font-mono text-white">
            {topAsset?.asset}
          </span>
          <span className="text-[9px] uppercase tracking-wider text-neutral-400 font-semibold">
            {topAsset?.percent}% of trades
          </span>
        </div>
      </div>

      {/* Legend Rows */}
      <div className="space-y-1.5 pt-3 border-t border-white/[0.04] max-h-[110px] overflow-y-auto pr-1">
        {data.map((item) => (
          <div key={item.asset} className="flex items-center justify-between text-xs">
            <div className="flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full shrink-0" style={{ backgroundColor: item.color }} />
              <span className="font-mono text-neutral-300 text-[11px]">{item.asset}</span>
              <span className="text-[10px] text-neutral-400">({item.percent}%)</span>
            </div>
            <span
              className={cn(
                "font-mono font-medium text-[11px]",
                item.pnl >= 0 ? "text-emerald-400" : "text-rose-400"
              )}
            >
              {formatCurrency(item.pnl)}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}
