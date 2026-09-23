"use client";

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
import { mockDailyStats } from "@/lib/mock-data";
import { Card } from "@/components/ui";
import { cn } from "@/lib/utils";

const CustomTooltip = ({ active, payload, label }: any) => {
  if (active && payload && payload.length) {
    const data = payload[0].payload;
    const isProfit = data.netPnl >= 0;
    const dateObj = new Date(label);
    const dateLabel = !isNaN(dateObj.getTime())
      ? dateObj.toLocaleDateString("en-US", {
          month: "short",
          day: "numeric",
        })
      : label;

    return (
      <div className="bg-[var(--bg-secondary)] border border-[var(--border-primary)] p-3 rounded-lg shadow-lg text-sm">
        <p className="font-medium text-[var(--text-primary)] mb-1">
          {dateLabel}
        </p>
        <p className={cn("font-bold", isProfit ? "text-profit" : "text-loss")}>
          PnL: ${data.netPnl.toFixed(2)}
        </p>
        <p className="text-[var(--text-tertiary)] text-xs mt-1">
          Trades: {data.tradeCount}
        </p>
      </div>
    );
  }
  return null;
};

export function PerformanceBars() {
  const data = mockDailyStats.slice(-14);

  return (
    <Card className="p-5 h-full flex flex-col min-h-[340px]">
      <h3 className="text-sm font-semibold text-[var(--text-primary)] mb-4">
        Daily Performance
      </h3>
      <div className="flex-1">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart
            data={data}
            margin={{ top: 10, right: 10, left: -20, bottom: 0 }}
          >
            <CartesianGrid
              strokeDasharray="3 3"
              vertical={false}
              stroke="var(--border-primary)"
              opacity={0.4}
            />
            <XAxis
              dataKey="date"
              tickFormatter={(val) => {
                const d = new Date(val);
                return !isNaN(d.getTime())
                  ? d.toLocaleDateString("en-US", {
                      month: "short",
                      day: "numeric",
                    })
                  : val;
              }}
              axisLine={false}
              tickLine={false}
              tick={{ fontSize: 11, fill: "var(--text-tertiary)" }}
              dy={10}
            />
            <YAxis
              axisLine={false}
              tickLine={false}
              tick={{ fontSize: 11, fill: "var(--text-tertiary)" }}
              tickFormatter={(val) => `$${val}`}
            />
            <Tooltip
              content={<CustomTooltip />}
              cursor={{ fill: "var(--border-primary)", opacity: 0.15 }}
            />
            <Bar dataKey="netPnl" radius={[4, 4, 0, 0]}>
              {data.map((entry, index) => (
                <Cell
                  key={`cell-${index}`}
                  fill={entry.netPnl >= 0 ? "#22c55e" : "#ef4444"}
                />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </div>
    </Card>
  );
}
