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
  { symbol: "XAUUSD", name: "Gold / US Dollar", trades: 14, winRate: 71.4, pnl: 2185.0 },
  { symbol: "EURUSD", name: "Euro / US Dollar", trades: 6, winRate: 66.7, pnl: 485.5 },
  { symbol: "GBPUSD", name: "British Pound / USD", trades: 4, winRate: 50.0, pnl: 220.0 },
  { symbol: "BTCUSD", name: "Bitcoin / US Dollar", trades: 2, winRate: 50.0, pnl: -43.0 },
];

export function InstrumentsCard() {
  return (
    <div className="glass-card rounded-2xl p-5 border border-[var(--border-primary)] shadow-sm flex flex-col justify-between h-full">
      {/* Header */}
      <div className="flex items-center justify-between pb-1">
        <div>
          <h2 className="text-base font-bold text-[var(--text-primary)]">Instruments</h2>
          <p className="text-[11px] text-[var(--text-tertiary)]">
            Performance breakdown by traded symbol
          </p>
        </div>
      </div>

      {/* Instruments List */}
      <div className="space-y-2.5 mt-3 flex-1 flex flex-col justify-around">
        {mockInstruments.map((item) => {
          const isWin = item.pnl >= 0;
          return (
            <div
              key={item.symbol}
              className="flex items-center justify-between p-2.5 rounded-xl bg-[var(--bg-secondary)]/70 border border-[var(--border-primary)]/60 hover:border-brand-500/30 transition-all text-xs"
            >
              <div className="flex items-center gap-2.5">
                <span className="font-mono font-bold text-sm text-[var(--text-primary)]">
                  {item.symbol}
                </span>
                <span className="text-[10px] text-[var(--text-tertiary)] hidden sm:inline">
                  {item.trades} trades
                </span>
              </div>

              {/* Win Rate Progress Mini-Bar */}
              <div className="hidden md:flex items-center gap-2 w-28">
                <div className="flex-1 h-1.5 rounded-full bg-[var(--border-primary)] overflow-hidden">
                  <div
                    className="h-full rounded-full bg-brand-500"
                    style={{ width: `${item.winRate}%` }}
                  />
                </div>
                <span className="text-[10px] font-mono text-[var(--text-secondary)]">
                  {item.winRate}%
                </span>
              </div>

              {/* PnL */}
              <span
                className={cn(
                  "font-mono font-bold text-sm",
                  isWin ? "text-profit" : "text-loss"
                )}
              >
                {formatCurrency(item.pnl)}
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
}
