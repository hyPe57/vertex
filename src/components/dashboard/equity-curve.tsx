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

export type TimeframePeriod = "today" | "week" | "month" | "year" | "all";

export function EquityCurve({
  height = 240,
  period = "month",
}: {
  height?: number;
  period?: TimeframePeriod;
}) {
  const data = useMemo(() => {
    if (period === "today") {
      return [
        { date: "09:00", balance: 11692.5 },
        { date: "11:00", balance: 11840.0 },
        { date: "13:00", balance: 11720.0 },
        { date: "15:00", balance: 12150.0 },
        { date: "17:00", balance: 12480.0 },
        { date: "19:00", balance: 12390.0 },
        { date: "21:00", balance: 12720.0 },
        { date: "23:00", balance: 12847.5 },
      ];
    }

    if (period === "week") {
      return [
        { date: "Mon", balance: 10707.5 },
        { date: "Tue", balance: 11200.0 },
        { date: "Wed", balance: 10980.0 },
        { date: "Thu", balance: 11850.0 },
        { date: "Fri", balance: 12450.0 },
        { date: "Sat", balance: 12450.0 },
        { date: "Sun", balance: 12847.5 },
      ];
    }

    if (period === "month") {
      return mockEquityCurve.slice(-14).map((point) => ({
        ...point,
        date: new Date(point.date).toLocaleDateString(undefined, {
          month: "short",
          day: "numeric",
        }),
      }));
    }

    if (period === "year") {
      return [
        { date: "Jan", balance: 10000.0 },
        { date: "Mar", balance: 10650.0 },
        { date: "May", balance: 10420.0 },
        { date: "Jul", balance: 11300.0 },
        { date: "Aug", balance: 11950.0 },
        { date: "Sep", balance: 12847.5 },
      ];
    }

    // "all"
    return mockEquityCurve.map((point) => ({
      ...point,
      date: new Date(point.date).toLocaleDateString(undefined, {
        month: "short",
        day: "numeric",
      }),
    }));
  }, [period]);

  return (
    <div style={{ height: `${height}px` }} className="w-full mt-1">
      <ResponsiveContainer width="100%" height="100%">
        <AreaChart
          data={data}
          margin={{ top: 12, right: 10, left: -10, bottom: 0 }}
        >
          <defs>
            <linearGradient id="colorBalance" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="#6366f1" stopOpacity={0.35} />
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
            domain={["dataMin - 400", "dataMax + 300"]}
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
