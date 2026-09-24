"use client";

import { useMemo } from "react";
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from "recharts";
import type { Trade } from "@/types";
import { formatCurrency, cn } from "@/lib/utils";

interface WinLossDonutProps {
  trades: Trade[];
}

const CustomTooltip = ({ active, payload }: any) => {
  if (active && payload && payload.length) {
    const data = payload[0].payload;
    return (
      <div className="bg-[#090a0f]/95 border border-white/10 p-3 rounded-xl shadow-2xl backdrop-blur-md text-xs min-w-[130px]">
        <div className="flex items-center gap-2 mb-1.5">
          <span className="w-2 h-2 rounded-full" style={{ backgroundColor: data.color }} />
          <span className="font-semibold text-white">{data.name}</span>
        </div>
        <div className="space-y-1 font-mono text-[11px]">
          <div className="flex justify-between text-neutral-400">
            <span>Count:</span>
            <span className="text-white font-medium">{data.value} ({data.percentage}%)</span>
          </div>
          <div className="flex justify-between text-neutral-400">
            <span>Total:</span>
            <span className={cn("font-medium", data.totalPnl >= 0 ? "text-emerald-400" : "text-rose-400")}>
              {formatCurrency(data.totalPnl)}
            </span>
          </div>
        </div>
      </div>
    );
  }
  return null;
};

export function WinLossDonut({ trades }: WinLossDonutProps) {
  const { data, winRate, totalTrades, grossProfit, grossLoss } = useMemo(() => {
    const total = trades.length;
    if (total === 0) {
      return {
        data: [{ name: "No Trades", value: 1, color: "rgba(255,255,255,0.05)", totalPnl: 0, percentage: 100 }],
        winRate: 0,
        totalTrades: 0,
        grossProfit: 0,
        grossLoss: 0,
      };
    }

    const wins = trades.filter((t) => t.pnl > 0);
    const losses = trades.filter((t) => t.pnl < 0);
    const be = trades.filter((t) => t.pnl === 0);

    const winPnl = wins.reduce((s, t) => s + t.pnl, 0);
    const lossPnl = losses.reduce((s, t) => s + t.pnl, 0);

    const wr = (wins.length / total) * 100;

    const chartData = [
      {
        name: "Wins",
        value: wins.length,
        color: "#10b981",
        totalPnl: winPnl,
        percentage: Math.round((wins.length / total) * 100),
      },
      {
        name: "Losses",
        value: losses.length,
        color: "#f43f5e",
        totalPnl: lossPnl,
        percentage: Math.round((losses.length / total) * 100),
      },
    ];

    if (be.length > 0) {
      chartData.push({
        name: "Break Even",
        value: be.length,
        color: "#64748b",
        totalPnl: 0,
        percentage: Math.round((be.length / total) * 100),
      });
    }

    return {
      data: chartData,
      winRate: wr,
      totalTrades: total,
      grossProfit: winPnl,
      grossLoss: lossPnl,
    };
  }, [trades]);

  return (
    <div className="bg-[#0c0d14]/75 backdrop-blur-md rounded-2xl p-5 border border-white/[0.04] h-full flex flex-col justify-between">
      <div className="flex items-center justify-between mb-2">
        <h3 className="text-sm font-semibold text-neutral-100 tracking-tight">
          Win / Loss Distribution
        </h3>
        <span className="text-[10px] text-neutral-400 font-mono">
          {totalTrades} Trades
        </span>
      </div>

      {/* Donut Chart Container */}
      <div className="relative h-[200px] w-full flex items-center justify-center">
        <ResponsiveContainer width="100%" height="100%">
          <PieChart>
            <Pie
              data={data}
              cx="50%"
              cy="50%"
              innerRadius={58}
              outerRadius={78}
              paddingAngle={data.length > 1 ? 4 : 0}
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

        {/* Center Win Rate Label */}
        <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
          <span className="text-2xl font-bold font-mono tracking-tight text-white">
            {winRate.toFixed(1)}%
          </span>
          <span className="text-[9px] uppercase tracking-wider text-neutral-400 font-semibold">
            Win Rate
          </span>
        </div>
      </div>

      {/* Bottom Breakdown Pills */}
      <div className="grid grid-cols-2 gap-2 pt-3 border-t border-white/[0.04]">
        <div className="p-2.5 rounded-xl bg-emerald-500/[0.04] border border-emerald-500/10 flex flex-col">
          <span className="text-[10px] text-emerald-400 font-semibold uppercase tracking-wider">
            Gross Profit
          </span>
          <span className="text-sm font-bold font-mono text-emerald-400 mt-0.5">
            +{formatCurrency(grossProfit)}
          </span>
        </div>
        <div className="p-2.5 rounded-xl bg-rose-500/[0.04] border border-rose-500/10 flex flex-col">
          <span className="text-[10px] text-rose-400 font-semibold uppercase tracking-wider">
            Gross Loss
          </span>
          <span className="text-sm font-bold font-mono text-rose-400 mt-0.5">
            {formatCurrency(grossLoss)}
          </span>
        </div>
      </div>
    </div>
  );
}
