import { Drawer, Badge } from "@/components/ui";
import { mockDailyStats } from "@/lib/mock-data";
import { useTradeStore, useCurrencyStore } from "@/stores";
import { format, parseISO } from "date-fns";

interface DayDrawerProps {
  dateString: string | null;
  isOpen: boolean;
  onClose: () => void;
}

export function DayDrawer({ dateString, isOpen, onClose }: DayDrawerProps) {
  const { display } = useCurrencyStore();
  const isPercent = display === "percent";
  const trades = useTradeStore((state) => state.trades);
  
  if (!dateString) return <Drawer isOpen={isOpen} onClose={onClose} width="w-[30%] min-w-[400px]"><div/></Drawer>;

  const date = parseISO(dateString);
  const formattedDate = format(date, "MMMM d, yyyy");
  
  const dailyStat = mockDailyStats.find(s => s.date === dateString);
  const dayTrades = trades.filter(t => t.openTime.startsWith(dateString));

  const formatPnl = (pnl: number, percent: number) => {
    if (isPercent) return `${percent > 0 ? "+" : ""}${percent.toFixed(2)}%`;
    return `${pnl > 0 ? "+" : ""}$${Math.abs(pnl).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
  };

  return (
    <Drawer isOpen={isOpen} onClose={onClose} title={formattedDate} width="w-[30%] min-w-[420px]">
      <div className="flex flex-col gap-6">
        <div className="flex items-center justify-between p-4 rounded-xl border border-[var(--border-primary)] bg-[var(--bg-secondary)] shadow-sm">
          <div className="flex flex-col">
            <span className="text-xs font-medium uppercase tracking-wider text-[var(--text-tertiary)] mb-1">Net PnL</span>
            <span className={`text-xl font-mono font-semibold ${dailyStat?.netPnl && dailyStat.netPnl > 0 ? 'text-profit' : dailyStat?.netPnl && dailyStat.netPnl < 0 ? 'text-loss' : 'text-[var(--text-primary)]'}`}>
              {dailyStat 
                ? formatPnl(dailyStat.netPnl, dailyStat.netPnlPercent)
                : "$0.00"}
            </span>
          </div>
          <div className="h-10 w-px bg-[var(--border-primary)]" />
          <div className="flex flex-col text-center">
            <span className="text-xs font-medium uppercase tracking-wider text-[var(--text-tertiary)] mb-1">Trades</span>
            <span className="text-base font-semibold text-[var(--text-primary)]">
              {dailyStat?.wins || 0}W / {dailyStat?.losses || 0}L
            </span>
          </div>
          <div className="h-10 w-px bg-[var(--border-primary)]" />
          <div className="flex flex-col text-right">
            <span className="text-xs font-medium uppercase tracking-wider text-[var(--text-tertiary)] mb-1">Win Rate</span>
            <span className="text-base font-semibold text-[var(--text-primary)]">
              {dailyStat && dailyStat.tradeCount > 0 ? Math.round((dailyStat.wins / dailyStat.tradeCount) * 100) : 0}%
            </span>
          </div>
        </div>

        <div>
          <h3 className="text-sm font-semibold text-[var(--text-primary)] mb-3">Trade History</h3>
          <div className="flex flex-col gap-3">
            {dayTrades.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-10 px-4 text-center rounded-xl border border-dashed border-[var(--border-primary)]">
                <p className="text-sm text-[var(--text-tertiary)]">No trades recorded on this day.</p>
              </div>
            ) : (
              dayTrades.map(trade => (
                <div key={trade.id} className="flex flex-col gap-3 p-4 rounded-xl border border-[var(--border-primary)] bg-[var(--bg-secondary)] hover:border-brand-500/30 transition-colors shadow-sm">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-[var(--text-primary)]">{trade.asset}</span>
                      <Badge variant={trade.direction === 'long' ? 'brand' : 'default'} className="uppercase">
                        {trade.direction}
                      </Badge>
                    </div>
                    <span className={`font-mono text-sm font-semibold ${trade.pnl > 0 ? 'text-profit' : 'text-loss'}`}>
                      {formatPnl(trade.pnl, trade.pnlPercent)}
                    </span>
                  </div>
                  
                  <div className="flex items-center justify-between text-xs text-[var(--text-tertiary)]">
                    <div className="flex items-center gap-3">
                      <span>{format(parseISO(trade.openTime), "HH:mm")}{trade.closeTime ? ` - ${format(parseISO(trade.closeTime), "HH:mm")}` : " - Open"}</span>
                    </div>
                    <span>Emotion: {trade.emotionLevel}/5</span>
                  </div>
                  
                  {trade.images && trade.images.length > 0 && (
                    <div className="flex gap-2 mt-1">
                      {trade.images.map(img => (
                        <div key={img.id} className="h-12 w-20 bg-surface-100 dark:bg-surface-100 rounded-md overflow-hidden relative border border-[var(--border-primary)] flex items-center justify-center">
                          {img.imageUrl ? (
                            <img src={img.imageUrl} alt={img.caption || "Chart"} className="w-full h-full object-cover" />
                          ) : (
                            <span className="text-[9px] font-medium text-[var(--text-tertiary)]">CHART</span>
                          )}
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </Drawer>
  );
}
