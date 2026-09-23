"use client";

import { mockSessionPerformance } from "@/lib/mock-data";
import { Card } from "@/components/ui";
import { cn } from "@/lib/utils";

export function SessionHeatmap() {
  const maxPnl = Math.max(
    ...mockSessionPerformance.map((s) => Math.abs(s.pnl))
  );

  return (
    <Card className="p-5 h-full flex flex-col">
      <h3 className="text-sm font-semibold text-[var(--text-primary)] mb-4">
        Session Performance
      </h3>
      <div className="flex-1 flex flex-col justify-center space-y-5">
        {mockSessionPerformance.map((session) => {
          const isProfit = session.pnl >= 0;
          const pnlPercentage =
            maxPnl > 0 ? (Math.abs(session.pnl) / maxPnl) * 100 : 0;

          return (
            <div key={session.session} className="space-y-1.5">
              <div className="flex justify-between items-end text-sm">
                <span className="font-medium text-[var(--text-primary)]">
                  {session.session}
                </span>
                <span
                  className={cn(
                    "font-bold font-mono text-sm",
                    isProfit ? "text-profit" : "text-loss"
                  )}
                >
                  {isProfit ? "+" : "-"}${Math.abs(session.pnl).toFixed(2)}
                </span>
              </div>
              <div className="h-2 w-full bg-surface-100 dark:bg-surface-100 rounded-full overflow-hidden">
                <div
                  className="h-full rounded-full transition-all duration-500"
                  style={{
                    width: `${pnlPercentage}%`,
                    backgroundColor: isProfit ? "#22c55e" : "#ef4444",
                  }}
                />
              </div>
              <div className="flex justify-between text-[10px] text-[var(--text-tertiary)]">
                <span>{session.trades} Trades</span>
                <span>{session.winRate}% WR</span>
                <span>{session.avgRR} RR</span>
              </div>
            </div>
          );
        })}
      </div>
    </Card>
  );
}
