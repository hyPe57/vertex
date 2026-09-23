"use client";

import { PieChart, Pie, Cell, ResponsiveContainer, Legend, Tooltip } from "recharts";
import { mockAggregateStats } from "@/lib/mock-data";
import { Card } from "@/components/ui";

export function WinLossDonut() {
  const data = [
    { name: "Wins", value: mockAggregateStats.wins, color: "#22c55e" },
    { name: "Losses", value: mockAggregateStats.losses, color: "#ef4444" },
  ];

  return (
    <Card className="p-5 h-full flex flex-col">
      <h3 className="text-sm font-semibold text-[var(--text-primary)] mb-2">
        Win/Loss Ratio
      </h3>
      <div className="flex-1 relative min-h-[280px]">
        <ResponsiveContainer width="100%" height="100%">
          <PieChart>
            <Pie
              data={data}
              cx="50%"
              cy="50%"
              innerRadius={65}
              outerRadius={85}
              paddingAngle={3}
              dataKey="value"
              stroke="none"
            >
              {data.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={entry.color} />
              ))}
            </Pie>
            <Tooltip
              contentStyle={{
                backgroundColor: "var(--bg-secondary)",
                border: "1px solid var(--border-primary)",
                borderRadius: "8px",
                color: "var(--text-primary)",
                fontSize: "12px",
              }}
            />
            <Legend
              verticalAlign="bottom"
              height={36}
              iconType="circle"
              wrapperStyle={{ fontSize: "12px", color: "var(--text-secondary)" }}
            />
          </PieChart>
        </ResponsiveContainer>
        <div className="absolute inset-0 flex items-center justify-center pointer-events-none pb-8">
          <div className="text-center">
            <div className="text-3xl font-bold text-[var(--text-primary)]">
              {mockAggregateStats.winRate}%
            </div>
            <div className="text-[10px] text-[var(--text-tertiary)] uppercase tracking-wider">
              Win Rate
            </div>
          </div>
        </div>
      </div>
    </Card>
  );
}
