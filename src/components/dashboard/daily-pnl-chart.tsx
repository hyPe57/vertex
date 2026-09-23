"use client";

import { useMemo } from "react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  Cell,
  ReferenceLine,
} from "recharts";
import { mockDailyStats } from "@/lib/mock-data";
import { formatCurrency } from "@/lib/utils";

export function DailyPnlChart({ height = 180 }: { height?: number }) {
  const data = useMemo(() => {
    return mockDailyStats.slice(-20).map((d) => ({
      date: new Date(d.date).toLocaleDateString(undefined, {
        month: "numeric",
        day: "numeric",
      }),
      pnl: d.netPnl,
      trades: d.tradesCount,
    }));
  }, []);

  return (
    <div className="glass-card rounded-2xl p-5 border border-[var(--border-primary)] shadow-sm flex flex-col justify-between h-full">
      {/* Header */}
      <div className="flex items-center justify-between pb-2 border-b border-[var(--border-primary)]/50">
        <div>
          <h2 className="text-base font-bold text-[var(--text-primary)]">Daily P&L</h2>
          <p className="text-[11px] text-[var(--text-tertiary)]">
            Last 20 trading days performance
          </p>
        </div>

        {/* Legend */}
        <div className="flex items-center gap-3 text-xs">
          <div className="flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-emerald-500" />
            <span className="text-[var(--text-secondary)]">Profit</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-red-500" />
            <span className="text-[var(--text-secondary)]">Loss</span>
          </div>
        </div>
      </div>

      {/* Chart */}
      <div style={{ height: `${height}px` }} className="w-full mt-2">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={data} margin={{ top: 10, right: 10, left: -15, bottom: 0 }}>
            <ReferenceLine y={0} stroke="var(--border-primary)" strokeWidth={1} />
            <XAxis
              dataKey="date"
              axisLine={false}
              tickLine={false}
              tick={{ fill: "var(--text-tertiary)", fontSize: 10 }}
              dy={6}
            />
            <YAxis
              axisLine={false}
              tickLine={false}
              tick={{ fill: "var(--text-tertiary)", fontSize: 10 }}
              tickFormatter={(v) => `$${v}`}
              width={45}
            />
            <Tooltip
              contentStyle={{
                backgroundColor: "var(--bg-secondary)",
                border: "1px solid var(--border-primary)",
                borderRadius: "8px",
                color: "var(--text-primary)",
                fontSize: "12px",
              }}
              formatter={(value: number) => [formatCurrency(value), "Net PnL"]}
            />
            <Bar dataKey="pnl" radius={[3, 3, 3, 3]} maxBarSize={28}>
              {data.map((entry, index) => (
                <Cell
                  key={`cell-${index}`}
                  fill={entry.pnl >= 0 ? "#22c55e" : "#ef4444"}
                  fillOpacity={0.85}
                />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
