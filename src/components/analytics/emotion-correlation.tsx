"use client";

import {
  ComposedChart,
  Bar,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Cell,
  Legend,
} from "recharts";
import { mockEmotionStats } from "@/lib/mock-data";
import { Card } from "@/components/ui";
import { cn } from "@/lib/utils";

const EMOTION_COLORS: Record<number, string> = {
  1: "#ef4444",
  2: "#f97316",
  3: "#eab308",
  4: "#84cc16",
  5: "#22c55e",
};

const CustomTooltip = ({ active, payload }: any) => {
  if (active && payload && payload.length) {
    const data = payload[0].payload;
    return (
      <div className="bg-[var(--bg-secondary)] border border-[var(--border-primary)] p-3 rounded-lg shadow-lg text-sm min-w-[150px]">
        <p className="font-bold text-[var(--text-primary)] mb-2">
          {data.label} ({data.level})
        </p>
        <div className="space-y-1">
          <p className="flex justify-between">
            <span className="text-[var(--text-tertiary)] mr-4">Win Rate:</span>
            <span className="font-medium text-[var(--text-primary)]">
              {data.winRate}%
            </span>
          </p>
          <p className="flex justify-between">
            <span className="text-[var(--text-tertiary)] mr-4">Avg PnL:</span>
            <span
              className={cn(
                "font-medium",
                data.avgPnl >= 0 ? "text-profit" : "text-loss"
              )}
            >
              {data.avgPnl >= 0 ? "+" : "-"}${Math.abs(data.avgPnl).toFixed(2)}
            </span>
          </p>
          <p className="flex justify-between">
            <span className="text-[var(--text-tertiary)] mr-4">Trades:</span>
            <span className="font-medium text-[var(--text-primary)]">
              {data.trades}
            </span>
          </p>
        </div>
      </div>
    );
  }
  return null;
};

export function EmotionCorrelation() {
  return (
    <Card className="p-5 h-full flex flex-col min-h-[340px]">
      <h3 className="text-sm font-semibold text-[var(--text-primary)] mb-4">
        Emotion vs Performance
      </h3>
      <div className="flex-1">
        <ResponsiveContainer width="100%" height="100%">
          <ComposedChart
            data={mockEmotionStats}
            margin={{ top: 10, right: 0, left: -20, bottom: 0 }}
          >
            <CartesianGrid
              strokeDasharray="3 3"
              vertical={false}
              stroke="var(--border-primary)"
              opacity={0.4}
            />
            <XAxis
              dataKey="label"
              axisLine={false}
              tickLine={false}
              tick={{ fontSize: 10, fill: "var(--text-tertiary)" }}
              dy={10}
            />
            <YAxis
              yAxisId="left"
              axisLine={false}
              tickLine={false}
              tick={{ fontSize: 11, fill: "var(--text-tertiary)" }}
              tickFormatter={(val) => `${val}%`}
            />
            <YAxis
              yAxisId="right"
              orientation="right"
              axisLine={false}
              tickLine={false}
              tick={{ fontSize: 11, fill: "var(--text-tertiary)" }}
              tickFormatter={(val) => `$${val}`}
            />
            <Tooltip
              content={<CustomTooltip />}
              cursor={{ fill: "var(--border-primary)", opacity: 0.15 }}
            />
            <Legend
              wrapperStyle={{
                paddingTop: "16px",
                fontSize: "11px",
                color: "var(--text-tertiary)",
              }}
            />
            <Bar
              yAxisId="left"
              dataKey="winRate"
              name="Win Rate (%)"
              radius={[4, 4, 0, 0]}
              maxBarSize={36}
            >
              {mockEmotionStats.map((entry, index) => (
                <Cell
                  key={`cell-${index}`}
                  fill={EMOTION_COLORS[entry.level]}
                  opacity={0.75}
                />
              ))}
            </Bar>
            <Line
              yAxisId="right"
              type="monotone"
              dataKey="avgPnl"
              name="Avg PnL ($)"
              stroke="#6366f1"
              strokeWidth={2.5}
              dot={{ r: 4, strokeWidth: 2, fill: "var(--bg-primary)" }}
              activeDot={{ r: 6, strokeWidth: 0, fill: "#6366f1" }}
            />
          </ComposedChart>
        </ResponsiveContainer>
      </div>
    </Card>
  );
}
