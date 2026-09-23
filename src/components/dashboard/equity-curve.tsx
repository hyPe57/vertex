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
} from "recharts";
import { mockEquityCurve } from "@/lib/mock-data";

export function EquityCurve({ height = 240 }: { height?: number }) {
  const data = useMemo(() => {
    return mockEquityCurve.map((point) => ({
      ...point,
      date: new Date(point.date).toLocaleDateString(undefined, {
        month: "short",
        day: "numeric",
      }),
    }));
  }, []);

  return (
    <div style={{ height: `${height}px` }} className="w-full mt-1">
      <ResponsiveContainer width="100%" height="100%">
        <AreaChart
          data={data}
          margin={{ top: 12, right: 10, left: -10, bottom: 0 }}
        >
          <defs>
            <linearGradient id="colorBalance" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="#6366f1" stopOpacity={0.3} />
              <stop offset="95%" stopColor="#6366f1" stopOpacity={0.0} />
            </linearGradient>
          </defs>
          <CartesianGrid
            strokeDasharray="3 3"
            vertical={false}
            stroke="var(--border-primary)"
            opacity={0.35}
          />
          <XAxis
            dataKey="date"
            axisLine={false}
            tickLine={false}
            tick={{ fill: "var(--text-tertiary)", fontSize: 10 }}
            dy={8}
          />
          <YAxis
            axisLine={false}
            tickLine={false}
            domain={["dataMin - 600", "dataMax + 400"]}
            tick={{ fill: "var(--text-tertiary)", fontSize: 10 }}
            tickFormatter={(value) =>
              `$${(value / 1000).toFixed(1)}k`
            }
            dx={-5}
            width={52}
          />
          <Tooltip
            contentStyle={{
              backgroundColor: "var(--bg-secondary)",
              border: "1px solid var(--border-primary)",
              borderRadius: "8px",
              color: "var(--text-primary)",
              fontSize: "12px",
            }}
            formatter={(value: number) => [
              `$${value.toLocaleString("en-US", { minimumFractionDigits: 2 })}`,
              "Balance",
            ]}
          />
          <Area
            type="monotone"
            dataKey="balance"
            stroke="#6366f1"
            strokeWidth={2.4}
            fillOpacity={1}
            fill="url(#colorBalance)"
          />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
}
