"use client";

import React from "react";
import { ChartPlaceholder } from "@/components/backtest/chart-placeholder";
import { ControlPanel } from "@/components/backtest/control-panel";
import { SessionTable } from "@/components/backtest/session-table";
import { PlayCircle } from "lucide-react";

export default function BacktestPage() {
  return (
    <div className="h-full flex flex-col gap-4 p-4 lg:p-6 overflow-y-auto">
      <div className="flex items-center justify-between shrink-0">
        <div>
          <h1 className="text-2xl font-bold text-[var(--text-primary)]">Backtest Engine</h1>
          <p className="text-[var(--text-muted)] text-sm mt-1">
            Simulate and refine your trading strategies with historical data
          </p>
        </div>
        <button className="flex items-center gap-2 px-4 py-2 bg-[var(--brand-primary)] text-white rounded-lg hover:opacity-90 transition-opacity text-sm font-medium">
          <PlayCircle className="w-4 h-4" />
          New Session
        </button>
      </div>

      <div className="flex flex-col lg:flex-row gap-4 h-[500px] shrink-0">
        <div className="flex-1 min-w-0 h-full">
          <ChartPlaceholder />
        </div>
        <div className="w-full lg:w-80 shrink-0 h-full">
          <ControlPanel />
        </div>
      </div>

      <div className="flex-1 min-h-[300px]">
        <SessionTable />
      </div>
    </div>
  );
}
