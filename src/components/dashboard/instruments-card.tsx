"use client";

import { formatCurrency, cn } from "@/lib/utils";

interface InstrumentStat {
  symbol: string;
  name: string;
  trades: number;
  winRate: number;
  pnl: number;
}

const mockInstruments: InstrumentStat[] = [
  { symbol: "XAUUSD", name: "Gold", trades: 14, winRate: 71.4, pnl: 2185.0 },
  { symbol: "EURUSD", name: "Euro / USD", trades: 6, winRate: 66.7, pnl: 485.5 },
  { symbol: "GBPUSD", name: "GBP / USD", trades: 4, winRate: 50.0, pnl: 220.0 },
  { symbol: "BTCUSD", name: "Bitcoin", trades: 2, winRate: 50.0, pnl: -43.0 },
];

export function InstrumentsCard() {
  return (
    <div className="bg-[#0c0d14]/75 backdrop-blur-md rounded-2xl p-5 border border-white/[0.04] shadow-sm flex flex-col justify-between h-full">
      {/* Header */}
      <div className="flex items-center justify-between pb-2">
        <div>
          <h2 className="text-sm font-semibold text-neutral-100 tracking-tight">Instruments</h2>
          <p className="text-[11px] text-neutral-400 mt-0.5">
            Performance breakdown by traded symbol
          </p>
        </div>
        <span className="text-[10px] font-medium text-neutral-400 px-2 py-0.5 rounded-full bg-white/[0.03] border border-white/[0.05]">
          4 Symbols
        </span>
      </div>

      {/* Instruments List - Sleek, Borderless & Minimalist */}
      <div className="mt-2 divide-y divide-white/[0.025] flex-1 flex flex-col justify-around">
        {mockInstruments.map((item) => {
          const isWin = item.pnl >= 0;
          return (
            <div
              key={item.symbol}
              className="group flex items-center justify-between py-2.5 px-2 -mx-2 rounded-xl hover:bg-white/[0.02] transition-colors"
            >
              {/* Asset Symbol & Details */}
              <div className="flex items-center gap-2.5 min-w-[100px]">
                <div className="w-7 h-7 rounded-lg bg-white/[0.03] border border-white/[0.05] flex items-center justify-center text-[10px] font-bold text-neutral-300 group-hover:border-white/[0.1] transition-colors">
                  {item.symbol.slice(0, 3)}
                </div>
                <div className="flex flex-col">
                  <span className="text-xs font-semibold text-neutral-200 group-hover:text-white transition-colors">
                    {item.symbol}
                  </span>
                  <span className="text-[10px] text-neutral-400">
                    {item.trades} trades · {item.name}
                  </span>
                </div>
              </div>

              {/* Win Rate Progress Bar */}
              <div className="flex items-center gap-2.5 flex-1 max-w-[130px] mx-3">
                <div className="flex-1 h-1.5 rounded-full bg-white/[0.04] overflow-hidden">
                  <div
                    className={cn(
                      "h-full rounded-full transition-all duration-500",
                      item.winRate >= 50 ? "bg-emerald-400/80" : "bg-neutral-500"
                    )}
                    style={{ width: `${item.winRate}%` }}
                  />
                </div>
                <span className="text-[11px] font-medium tabular-nums text-neutral-400 w-9 text-right">
                  {item.winRate.toFixed(0)}%
                </span>
              </div>

              {/* PnL with Tabular Numbers */}
              <div className="text-right">
                <span
                  className={cn(
                    "text-xs sm:text-sm font-semibold tabular-nums tracking-tight",
                    isWin ? "text-emerald-400" : "text-rose-400"
                  )}
                >
                  {formatCurrency(item.pnl)}
                </span>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
