import { StatBox } from "@/components/ui";
import { mockAggregateStats } from "@/lib/mock-data";
import { useCurrencyStore } from "@/stores";

export function CalendarStatBar() {
  const { netPnl, netPnlPercent, winRate, profitFactor, avgRR, maxDrawdown } = mockAggregateStats;
  const { display } = useCurrencyStore();
  const isPercent = display === "percent";
  
  const pnlDisplay = isPercent ? `${netPnlPercent > 0 ? "+" : ""}${netPnlPercent}%` : `${netPnl > 0 ? "+" : ""}$${Math.abs(netPnl).toLocaleString()}`;
  const ddDisplay = isPercent ? "N/A" : `$${maxDrawdown.toLocaleString()}`;

  return (
    <div className="flex flex-wrap items-center gap-8 rounded-xl border border-[var(--border-primary)] bg-[var(--bg-secondary)] px-6 py-4 shadow-sm w-full">
      <StatBox label="Net PnL" value={pnlDisplay} trend={netPnl >= 0 ? "up" : "down"} />
      <div className="h-8 w-px bg-[var(--border-primary)] opacity-50 hidden sm:block" />
      <StatBox label="Win Rate" value={`${winRate}%`} trend="neutral" />
      <div className="h-8 w-px bg-[var(--border-primary)] opacity-50 hidden sm:block" />
      <StatBox label="Profit Factor" value={profitFactor.toString()} trend="neutral" />
      <div className="h-8 w-px bg-[var(--border-primary)] opacity-50 hidden sm:block" />
      <StatBox label="Avg RR" value={avgRR.toString()} trend="neutral" />
      <div className="h-8 w-px bg-[var(--border-primary)] opacity-50 hidden sm:block" />
      <StatBox label="Max DD" value={ddDisplay} trend="down" />
    </div>
  );
}
