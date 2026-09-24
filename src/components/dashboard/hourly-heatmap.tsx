"use client";

import { useState, useMemo } from "react";
import { formatCurrency, cn } from "@/lib/utils";

type MetricMode = "pnl" | "winRate" | "trades";

interface SessionCell {
  sessionKey: string;
  sessionName: string;
  timeWindow: string;
  pnl: number;
  trades: number;
  wins: number;
}

interface DayRow {
  day: string;
  dayLabel: string;
  sessions: Record<string, SessionCell>;
}

const SESSIONS = [
  { key: "asian", name: "Asian", time: "00:00 - 08:00" },
  { key: "london", name: "London", time: "08:00 - 13:00" },
  { key: "ny_overlap", name: "NY Overlap", time: "13:00 - 17:00" },
  { key: "ny_close", name: "NY Close", time: "17:00 - 22:00" },
];

const RAW_DATA: DayRow[] = [
  {
    day: "Mon",
    dayLabel: "Monday",
    sessions: {
      asian: { sessionKey: "asian", sessionName: "Asian", timeWindow: "00:00 - 08:00", pnl: 140, trades: 2, wins: 2 },
      london: { sessionKey: "london", sessionName: "London", timeWindow: "08:00 - 13:00", pnl: 520, trades: 3, wins: 2 },
      ny_overlap: { sessionKey: "ny_overlap", sessionName: "NY Overlap", timeWindow: "13:00 - 17:00", pnl: -180, trades: 2, wins: 1 },
      ny_close: { sessionKey: "ny_close", sessionName: "NY Close", timeWindow: "17:00 - 22:00", pnl: 0, trades: 0, wins: 0 },
    },
  },
  {
    day: "Tue",
    dayLabel: "Tuesday",
    sessions: {
      asian: { sessionKey: "asian", sessionName: "Asian", timeWindow: "00:00 - 08:00", pnl: -60, trades: 1, wins: 0 },
      london: { sessionKey: "london", sessionName: "London", timeWindow: "08:00 - 13:00", pnl: 840, trades: 4, wins: 3 },
      ny_overlap: { sessionKey: "ny_overlap", sessionName: "NY Overlap", timeWindow: "13:00 - 17:00", pnl: 620, trades: 3, wins: 2 },
      ny_close: { sessionKey: "ny_close", sessionName: "NY Close", timeWindow: "17:00 - 22:00", pnl: 110, trades: 1, wins: 1 },
    },
  },
  {
    day: "Wed",
    dayLabel: "Wednesday",
    sessions: {
      asian: { sessionKey: "asian", sessionName: "Asian", timeWindow: "00:00 - 08:00", pnl: 210, trades: 2, wins: 2 },
      london: { sessionKey: "london", sessionName: "London", timeWindow: "08:00 - 13:00", pnl: -240, trades: 3, wins: 1 },
      ny_overlap: { sessionKey: "ny_overlap", sessionName: "NY Overlap", timeWindow: "13:00 - 17:00", pnl: 710, trades: 4, wins: 3 },
      ny_close: { sessionKey: "ny_close", sessionName: "NY Close", timeWindow: "17:00 - 22:00", pnl: -90, trades: 1, wins: 0 },
    },
  },
  {
    day: "Thu",
    dayLabel: "Thursday",
    sessions: {
      asian: { sessionKey: "asian", sessionName: "Asian", timeWindow: "00:00 - 08:00", pnl: 0, trades: 0, wins: 0 },
      london: { sessionKey: "london", sessionName: "London", timeWindow: "08:00 - 13:00", pnl: 460, trades: 2, wins: 2 },
      ny_overlap: { sessionKey: "ny_overlap", sessionName: "NY Overlap", timeWindow: "13:00 - 17:00", pnl: 450, trades: 3, wins: 2 },
      ny_close: { sessionKey: "ny_close", sessionName: "NY Close", timeWindow: "17:00 - 22:00", pnl: 180, trades: 2, wins: 1 },
    },
  },
  {
    day: "Fri",
    dayLabel: "Friday",
    sessions: {
      asian: { sessionKey: "asian", sessionName: "Asian", timeWindow: "00:00 - 08:00", pnl: -80, trades: 1, wins: 0 },
      london: { sessionKey: "london", sessionName: "London", timeWindow: "08:00 - 13:00", pnl: 380, trades: 2, wins: 2 },
      ny_overlap: { sessionKey: "ny_overlap", sessionName: "NY Overlap", timeWindow: "13:00 - 17:00", pnl: -210, trades: 3, wins: 1 },
      ny_close: { sessionKey: "ny_close", sessionName: "NY Close", timeWindow: "17:00 - 22:00", pnl: 70, trades: 1, wins: 1 },
    },
  },
];

export function HourlyHeatmap() {
  const [metric, setMetric] = useState<MetricMode>("pnl");

  // Calculate day totals
  const rowsWithTotals = useMemo(() => {
    return RAW_DATA.map((row) => {
      let totalPnl = 0;
      let totalTrades = 0;
      let totalWins = 0;

      Object.values(row.sessions).forEach((s) => {
        totalPnl += s.pnl;
        totalTrades += s.trades;
        totalWins += s.wins;
      });

      const winRate = totalTrades > 0 ? (totalWins / totalTrades) * 100 : 0;

      return {
        ...row,
        totalPnl,
        totalTrades,
        winRate,
      };
    });
  }, []);

  // Calculate session column totals
  const sessionTotals = useMemo(() => {
    const totals: Record<string, { pnl: number; trades: number; wins: number; winRate: number }> = {};

    SESSIONS.forEach((s) => {
      let pnl = 0;
      let trades = 0;
      let wins = 0;

      RAW_DATA.forEach((row) => {
        const cell = row.sessions[s.key];
        if (cell) {
          pnl += cell.pnl;
          trades += cell.trades;
          wins += cell.wins;
        }
      });

      totals[s.key] = {
        pnl,
        trades,
        wins,
        winRate: trades > 0 ? (wins / trades) * 100 : 0,
      };
    });

    return totals;
  }, []);

  // Grand total
  const grandTotal = useMemo(() => {
    let pnl = 0;
    let trades = 0;
    let wins = 0;

    rowsWithTotals.forEach((r) => {
      pnl += r.totalPnl;
      trades += r.totalTrades;
      wins += Math.round((r.winRate / 100) * r.totalTrades);
    });

    return {
      pnl,
      trades,
      winRate: trades > 0 ? (wins / trades) * 100 : 0,
    };
  }, [rowsWithTotals]);

  // Find best window
  const bestWindow = useMemo(() => {
    return { day: "Tue", dayLabel: "Tuesday", session: "London", pnl: 840, winRate: 75 };
  }, []);

  return (
    <div className="bg-[#0c0d14]/75 backdrop-blur-md rounded-2xl p-5 border border-white/[0.04] shadow-sm flex flex-col justify-between">
      {/* Header with Title and Mode Switcher */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-3 gap-3">
        <div>
          <div className="flex items-center gap-2">
            <h2 className="text-sm font-semibold text-neutral-100 tracking-tight">
              Day & Session Performance
            </h2>
            <span className="text-[10px] font-medium text-emerald-400 bg-emerald-500/10 border border-emerald-500/20 px-2 py-0.5 rounded-full hidden sm:inline-flex items-center gap-1">
              <span>Best:</span> {bestWindow.dayLabel || "Tuesday"} {bestWindow.session} (+${bestWindow.pnl})
            </span>
          </div>
          <p className="text-[11px] text-neutral-400 mt-0.5">
            Profitability and win-rate across days of the week and global trading sessions
          </p>
        </div>

        {/* Metric Selector & Legend */}
        <div className="flex items-center gap-3 self-end sm:self-auto">
          {/* Toggle Pills */}
          <div className="flex items-center bg-white/[0.03] border border-white/[0.05] p-0.5 rounded-lg text-xs">
            <button
              onClick={() => setMetric("pnl")}
              className={cn(
                "px-2.5 py-1 rounded-md text-[11px] font-medium transition-all",
                metric === "pnl"
                  ? "bg-white/[0.08] text-white shadow-xs"
                  : "text-neutral-400 hover:text-neutral-200"
              )}
            >
              Net P&L
            </button>
            <button
              onClick={() => setMetric("winRate")}
              className={cn(
                "px-2.5 py-1 rounded-md text-[11px] font-medium transition-all",
                metric === "winRate"
                  ? "bg-white/[0.08] text-white shadow-xs"
                  : "text-neutral-400 hover:text-neutral-200"
              )}
            >
              Win Rate
            </button>
            <button
              onClick={() => setMetric("trades")}
              className={cn(
                "px-2.5 py-1 rounded-md text-[11px] font-medium transition-all",
                metric === "trades"
                  ? "bg-white/[0.08] text-white shadow-xs"
                  : "text-neutral-400 hover:text-neutral-200"
              )}
            >
              Trades
            </button>
          </div>
        </div>
      </div>

      {/* Heatmap Matrix Table */}
      <div className="overflow-x-auto no-scrollbar pt-1">
        <table className="w-full text-left border-collapse min-w-[620px]">
          {/* Table Header: Sessions */}
          <thead>
            <tr className="border-b border-white/[0.035]">
              <th className="pb-2.5 text-[11px] font-semibold text-neutral-400 uppercase tracking-wider w-[75px]">
                Day
              </th>
              {SESSIONS.map((s) => (
                <th key={s.key} className="pb-2.5 px-2 text-center">
                  <div className="text-[11px] font-semibold text-neutral-200">{s.name}</div>
                  <div className="text-[9px] font-medium text-neutral-500 font-mono mt-0.5">
                    {s.time}
                  </div>
                </th>
              ))}
              <th className="pb-2.5 text-center px-2 w-[110px]">
                <div className="text-[11px] font-semibold text-neutral-300">Day Total</div>
                <div className="text-[9px] font-medium text-neutral-500 mt-0.5">Summary</div>
              </th>
            </tr>
          </thead>

          {/* Table Body: 5 Days (Mon - Fri) */}
          <tbody className="divide-y divide-white/[0.02]">
            {rowsWithTotals.map((row) => (
              <tr key={row.day} className="group hover:bg-white/[0.015] transition-colors">
                {/* Day Label */}
                <td className="py-2.5 pr-2">
                  <span className="text-xs font-semibold text-neutral-200 group-hover:text-white transition-colors">
                    {row.day}
                  </span>
                </td>

                {/* Session Cells */}
                {SESSIONS.map((s) => {
                  const cell = row.sessions[s.key];
                  const hasTrades = cell && cell.trades > 0;
                  const isProfit = cell && cell.pnl > 0;
                  const isLoss = cell && cell.pnl < 0;
                  const winRate = hasTrades ? Math.round((cell.wins / cell.trades) * 100) : 0;

                  // Dynamic heat background styling
                  let bgStyle = "bg-white/[0.015] border-white/[0.03] text-neutral-500";
                  if (hasTrades) {
                    if (isProfit) {
                      bgStyle =
                        cell.pnl >= 500
                          ? "bg-emerald-500/[0.16] border-emerald-500/30 text-emerald-400 hover:bg-emerald-500/[0.22]"
                          : "bg-emerald-500/[0.08] border-emerald-500/20 text-emerald-400 hover:bg-emerald-500/[0.14]";
                    } else if (isLoss) {
                      bgStyle =
                        cell.pnl <= -200
                          ? "bg-rose-500/[0.16] border-rose-500/30 text-rose-400 hover:bg-rose-500/[0.22]"
                          : "bg-rose-500/[0.08] border-rose-500/20 text-rose-400 hover:bg-rose-500/[0.14]";
                    } else {
                      bgStyle = "bg-white/[0.03] border-white/[0.06] text-neutral-300";
                    }
                  }

                  return (
                    <td key={s.key} className="py-1.5 px-1.5">
                      <div
                        className={cn(
                          "rounded-xl border p-2 flex flex-col items-center justify-center transition-all duration-150 h-14",
                          bgStyle
                        )}
                      >
                        {hasTrades ? (
                          <>
                            {metric === "pnl" && (
                              <span className="text-xs font-semibold tabular-nums tracking-tight">
                                {formatCurrency(cell.pnl)}
                              </span>
                            )}
                            {metric === "winRate" && (
                              <span className="text-xs font-semibold tabular-nums tracking-tight text-neutral-100">
                                {winRate}%
                              </span>
                            )}
                            {metric === "trades" && (
                              <span className="text-xs font-semibold tabular-nums tracking-tight text-neutral-100">
                                {cell.trades} {cell.trades === 1 ? "trade" : "trades"}
                              </span>
                            )}

                            {/* Subtitle info */}
                            <span className="text-[10px] opacity-75 font-normal tabular-nums mt-0.5">
                              {metric === "pnl"
                                ? `${cell.trades}t · ${winRate}%`
                                : metric === "winRate"
                                ? `${formatCurrency(cell.pnl)} (${cell.trades}t)`
                                : `${formatCurrency(cell.pnl)}`}
                            </span>
                          </>
                        ) : (
                          <span className="text-xs text-neutral-600 font-mono">—</span>
                        )}
                      </div>
                    </td>
                  );
                })}

                {/* Day Total Cell */}
                <td className="py-1.5 pl-2">
                  <div className="rounded-xl border border-white/[0.04] bg-white/[0.02] p-2 flex flex-col items-center justify-center h-14">
                    {metric === "pnl" && (
                      <span
                        className={cn(
                          "text-xs font-semibold tabular-nums tracking-tight",
                          row.totalPnl >= 0 ? "text-emerald-400" : "text-rose-400"
                        )}
                      >
                        {formatCurrency(row.totalPnl)}
                      </span>
                    )}
                    {metric === "winRate" && (
                      <span className="text-xs font-semibold tabular-nums tracking-tight text-neutral-100">
                        {Math.round(row.winRate)}%
                      </span>
                    )}
                    {metric === "trades" && (
                      <span className="text-xs font-semibold tabular-nums tracking-tight text-neutral-100">
                        {row.totalTrades} trades
                      </span>
                    )}
                    <span className="text-[10px] text-neutral-500 tabular-nums mt-0.5">
                      {metric === "pnl"
                        ? `${row.totalTrades}t · ${Math.round(row.winRate)}%`
                        : `${formatCurrency(row.totalPnl)}`}
                    </span>
                  </div>
                </td>
              </tr>
            ))}

            {/* Bottom Row: Session Column Totals */}
            <tr className="border-t border-white/[0.035] bg-white/[0.01]">
              <td className="py-2.5 pr-2">
                <span className="text-[11px] font-semibold uppercase tracking-wider text-neutral-400">
                  Total
                </span>
              </td>

              {SESSIONS.map((s) => {
                const total = sessionTotals[s.key];
                return (
                  <td key={s.key} className="py-1.5 px-1.5">
                    <div className="rounded-xl border border-white/[0.04] bg-white/[0.02] p-2 flex flex-col items-center justify-center h-14">
                      {metric === "pnl" && (
                        <span
                          className={cn(
                            "text-xs font-semibold tabular-nums tracking-tight",
                            total.pnl >= 0 ? "text-emerald-400" : "text-rose-400"
                          )}
                        >
                          {formatCurrency(total.pnl)}
                        </span>
                      )}
                      {metric === "winRate" && (
                        <span className="text-xs font-semibold tabular-nums tracking-tight text-neutral-100">
                          {Math.round(total.winRate)}%
                        </span>
                      )}
                      {metric === "trades" && (
                        <span className="text-xs font-semibold tabular-nums tracking-tight text-neutral-100">
                          {total.trades} trades
                        </span>
                      )}
                      <span className="text-[10px] text-neutral-500 tabular-nums mt-0.5">
                        {metric === "pnl"
                          ? `${total.trades}t · ${Math.round(total.winRate)}%`
                          : `${formatCurrency(total.pnl)}`}
                      </span>
                    </div>
                  </td>
                );
              })}

              {/* Grand Total Bottom-Right */}
              <td className="py-1.5 pl-2">
                <div className="rounded-xl border border-emerald-500/25 bg-emerald-500/[0.08] p-2 flex flex-col items-center justify-center h-14">
                  <span className="text-xs font-bold tabular-nums tracking-tight text-emerald-400">
                    {metric === "pnl"
                      ? formatCurrency(grandTotal.pnl)
                      : metric === "winRate"
                      ? `${Math.round(grandTotal.winRate)}%`
                      : `${grandTotal.trades} trades`}
                  </span>
                  <span className="text-[10px] text-emerald-400/70 tabular-nums mt-0.5 font-medium">
                    {grandTotal.trades} trades · {Math.round(grandTotal.winRate)}% WR
                  </span>
                </div>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  );
}

// Alias for backwards compatibility
export const SessionHeatmap = HourlyHeatmap;
