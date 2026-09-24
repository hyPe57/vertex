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

const CustomTooltip = ({ active, payload }: any) => {
  if (active && payload && payload.length) {
    const d = payload[0].payload;
    return (
      <div className="bg-[#0c0d14] border border-white/10 p-3 rounded-xl shadow-2xl text-xs">
        <p className="font-semibold text-white mb-1">{d.label}</p>
        <p className="text-neutral-400">
          {d.count} trade{d.count !== 1 ? "s" : ""}
        </p>
      </div>
    );
  }
  return null;
};

export function RMultipleChart({ trades }: { trades: Trade[] }) {
  const data = useMemo(() => {
    const buckets: Record<string, { label: string; count: number; order: number }> = {
      "neg2": { label: "< -1R", count: 0, order: 0 },
      "neg1": { label: "-1R", count: 0, order: 1 },
      "be":   { label: "0R (BE)", count: 0, order: 2 },
      "pos1": { label: "+1R", count: 0, order: 3 },
      "pos2": { label: "+2R", count: 0, order: 4 },
      "pos3": { label: "+3R+", count: 0, order: 5 },
    };

    trades.forEach((t) => {
      const r = t.pnl >= 0 ? t.riskReward : -(1 / (t.riskReward || 1));
      if (r < -1) buckets.neg2.count++;
      else if (r < -0.2) buckets.neg1.count++;
      else if (r < 0.5) buckets.be.count++;
      else if (r < 1.5) buckets.pos1.count++;
      else if (r < 2.5) buckets.pos2.count++;
      else buckets.pos3.count++;
    });

    return Object.values(buckets).sort((a, b) => a.order - b.order);
  }, [trades]);

  const barColors: Record<string, string> = {
    "< -1R": "#ef4444",
    "-1R": "#f87171",
    "0R (BE)": "#eab308",
    "+1R": "#4ade80",
    "+2R": "#22c55e",
    "+3R+": "#16a34a",
  };

  return (
    <div className="bg-[#0c0d14]/75 backdrop-blur-md rounded-2xl p-5 border border-white/[0.04] h-full">
      <h3 className="text-sm font-semibold text-neutral-100 tracking-tight mb-4">
        R-Multiple Distribution
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
              dataKey="label"
              axisLine={false}
              tickLine={false}
              tick={{ fontSize: 11, fill: "#71717a" }}
              dy={8}
            />
            <YAxis
              axisLine={false}
              tickLine={false}
              tick={{ fontSize: 11, fill: "#71717a" }}
              allowDecimals={false}
            />
            <Tooltip content={<CustomTooltip />} cursor={{ fill: "rgba(255,255,255,0.03)" }} />
            <Bar dataKey="count" radius={[6, 6, 0, 0]} maxBarSize={40}>
              {data.map((entry, i) => (
                <Cell key={i} fill={barColors[entry.label] || "#6366f1"} opacity={0.85} />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
