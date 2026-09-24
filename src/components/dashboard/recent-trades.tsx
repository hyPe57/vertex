"use client";

import React, { useState } from "react";
import Link from "next/link";
import { formatCurrency, cn } from "@/lib/utils";
import { useTradeStore } from "@/stores";
import { ArrowRight, Clock, Image as ImageIcon, X, Maximize2 } from "lucide-react";

interface LightboxState {
  url: string;
  asset: string;
  pnl: number;
  direction: "long" | "short";
}

export function RecentTradesCard() {
  const trades = useTradeStore((state) => state.trades);
  const recentTrades = trades.slice(0, 4);
  const [previewImage, setPreviewImage] = useState<LightboxState | null>(null);

  return (
    <>
      <div className="bg-[#0c0d14]/75 backdrop-blur-md rounded-2xl p-5 border border-white/[0.04] shadow-sm flex flex-col gap-3">
        {/* Header */}
        <div className="flex items-center justify-between pb-1 border-b border-white/[0.03]">
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 rounded-lg bg-white/[0.03] border border-white/[0.05] flex items-center justify-center text-neutral-400">
              <Clock size={12} />
            </div>
            <div>
              <h2 className="text-sm font-semibold text-neutral-100 tracking-tight">Recent Trades</h2>
              <p className="text-[11px] text-neutral-400">Latest journal entries</p>
            </div>
          </div>

          <Link
            href="/history"
            className="text-[11px] font-medium text-neutral-400 hover:text-white flex items-center gap-1 transition-colors group"
          >
            <span>View all</span>
            <ArrowRight size={11} className="group-hover:translate-x-0.5 transition-transform" />
          </Link>
        </div>

        {/* Trades List */}
        <div className="divide-y divide-white/[0.025]">
          {recentTrades.map((trade) => {
            const isProfit = trade.pnl >= 0;
            const hasImages = trade.images && trade.images.length > 0;

            return (
              <Link
                key={trade.id}
                href="/history"
                className="flex items-center justify-between py-2.5 px-2 -mx-2 rounded-xl hover:bg-white/[0.02] transition-colors group cursor-pointer"
              >
                {/* Asset & Direction Badge */}
                <div className="flex items-center gap-2.5">
                  <span
                    className={cn(
                      "inline-flex items-center justify-center rounded-full px-2.5 py-0.5 text-[10px] font-bold tracking-wider uppercase shrink-0 min-w-[50px] text-center",
                      trade.direction === "long"
                        ? "bg-profit/10 text-profit"
                        : "bg-loss/10 text-loss"
                    )}
                  >
                    {trade.direction.toUpperCase()}
                  </span>
                  <div className="flex flex-col">
                    <div className="flex items-center gap-1.5">
                      <span className="text-xs font-semibold text-neutral-200 group-hover:text-white transition-colors">
                        {trade.asset}
                      </span>
                      {hasImages && (
                        <button
                          type="button"
                          onClick={(e) => {
                            e.preventDefault();
                            e.stopPropagation();
                            setPreviewImage({
                              url: trade.images[0].imageUrl,
                              asset: trade.asset,
                              pnl: trade.pnl,
                              direction: trade.direction,
                            });
                          }}
                          className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded-md bg-white/[0.04] hover:bg-white/[0.09] text-[9px] text-neutral-300 hover:text-white border border-white/[0.06] transition-colors"
                          title="Click to view chart screenshot"
                        >
                          <ImageIcon size={9} className="text-emerald-400" />
                          <span className="tabular-nums font-mono">{trade.images.length}</span>
                        </button>
                      )}
                    </div>
                    <span className="text-[10px] text-neutral-500 tabular-nums">
                      {trade.lotSize} lots · {trade.tags?.[0] ? `#${trade.tags[0]}` : "Manual"}
                    </span>
                  </div>
                </div>

                {/* P&L & RR */}
                <div className="text-right flex flex-col items-end">
                  <span
                    className={cn(
                      "text-xs font-semibold tabular-nums tracking-tight",
                      isProfit ? "text-emerald-400" : "text-rose-400"
                    )}
                  >
                    {formatCurrency(trade.pnl)}
                  </span>
                  <span className="text-[10px] text-neutral-500 tabular-nums">
                    RR 1:{trade.riskReward ? trade.riskReward.toFixed(2) : "2.00"}
                  </span>
                </div>
              </Link>
            );
          })}
        </div>
      </div>

      {/* Lightbox Modal for Chart Screenshot */}
      {previewImage && (
        <div
          onClick={() => setPreviewImage(null)}
          className="fixed inset-0 z-50 bg-black/85 backdrop-blur-md flex items-center justify-center p-4 cursor-zoom-out"
        >
          <div
            onClick={(e) => e.stopPropagation()}
            className="relative max-w-4xl max-h-[85vh] bg-[#0c0d14] rounded-2xl border border-white/10 overflow-hidden shadow-2xl flex flex-col cursor-default"
          >
            {/* Header info */}
            <div className="flex items-center justify-between px-4 py-3 border-b border-white/[0.08] bg-black/40">
              <div className="flex items-center gap-2.5">
                <span
                  className={cn(
                    "rounded-full px-2.5 py-0.5 text-[10px] font-bold tracking-wider uppercase",
                    previewImage.direction === "long" ? "bg-profit/10 text-profit" : "bg-loss/10 text-loss"
                  )}
                >
                  {previewImage.direction.toUpperCase()}
                </span>
                <span className="text-sm font-semibold text-white">{previewImage.asset}</span>
                <span
                  className={cn(
                    "text-xs font-semibold tabular-nums",
                    previewImage.pnl >= 0 ? "text-emerald-400" : "text-rose-400"
                  )}
                >
                  {formatCurrency(previewImage.pnl)}
                </span>
              </div>
              <button
                type="button"
                onClick={() => setPreviewImage(null)}
                className="w-7 h-7 rounded-lg bg-white/[0.06] hover:bg-white/[0.12] text-neutral-300 hover:text-white flex items-center justify-center transition-colors cursor-pointer"
              >
                <X size={14} />
              </button>
            </div>

            {/* Screenshot Body */}
            <div className="overflow-auto max-h-[75vh] flex items-center justify-center p-2 bg-black/60">
              <img
                src={previewImage.url}
                alt={`${previewImage.asset} screenshot`}
                className="max-w-full max-h-[70vh] object-contain rounded-lg"
              />
            </div>
          </div>
        </div>
      )}
    </>
  );
}
