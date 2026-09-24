"use client";

import { useState } from "react";
import { EquityCurve, TimeframePeriod } from "./equity-curve";
import { formatCurrency, formatPercent, cn } from "@/lib/utils";
import { mockPorts } from "@/lib/mock-data";
import { usePortStore, useCurrencyStore } from "@/stores";

export function EquityCurveCard({
  period = "month",
}: {
  period?: TimeframePeriod;
}) {
  const { activePortId } = usePortStore();
  const { display } = useCurrencyStore();
  const [chartMode, setChartMode] = useState<"cumulative" | "breakeven">("cumulative");

  const activePort = mockPorts.find((p) => p.id === activePortId) || mockPorts[0];
  const pnl = activePort.currentBalance - activePort.initialBalance;
  const pnlPct = (pnl / activePort.initialBalance) * 100;

  return (
    <div className="bg-[#0c0d14]/75 backdrop-blur-md rounded-2xl p-5 border border-white/[0.04] shadow-sm flex flex-col justify-between h-full">
      {/* Header */}
      <div className="flex items-start justify-between pb-1">
        <div>
          <h2 className="text-sm font-semibold text-neutral-100 tracking-tight">Equity Curve</h2>
          <p className="text-[11px] text-neutral-400 mt-0.5">
            Cumulative P&L growth over time
          </p>
        </div>

        {/* Current Total Balance on Top-Right */}
        <div className="text-right">
          <span className="text-xl sm:text-2xl font-bold tabular-nums tracking-tight text-neutral-100">
            {formatCurrency(activePort.currentBalance, false)}
          </span>
          <p className="text-[11px] font-medium tabular-nums text-emerald-400">
            +{display === "usd" ? formatCurrency(pnl) : formatPercent(pnlPct)}
          </p>
        </div>
      </div>

      {/* Chart Canvas */}
      <div className="w-full flex-1 min-h-[190px] pt-1">
        <EquityCurve height={190} period={period} />
      </div>

      {/* Footer Mode Toggles: Cumulative vs Break-even */}
      <div className="flex items-center gap-4 pt-2.5 border-t border-white/[0.035] text-xs">
        <label className="flex items-center gap-2 cursor-pointer text-[var(--text-secondary)] hover:text-[var(--text-primary)]">
          <input
            type="radio"
            name="chartMode"
            checked={chartMode === "cumulative"}
            onChange={() => setChartMode("cumulative")}
            className="accent-brand-500 w-3.5 h-3.5"
          />
          <span className="text-xs font-medium">Cumulative P&L</span>
        </label>
        <label className="flex items-center gap-2 cursor-pointer text-[var(--text-secondary)] hover:text-[var(--text-primary)]">
          <input
            type="radio"
            name="chartMode"
            checked={chartMode === "breakeven"}
            onChange={() => setChartMode("breakeven")}
            className="accent-brand-500 w-3.5 h-3.5"
          />
          <span className="text-xs font-medium">Break-even Baseline</span>
        </label>
      </div>
    </div>
  );
}
