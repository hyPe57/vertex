"use client";

import React, { useMemo, useRef, useState } from "react";
import { useBacktestStore } from "@/stores/backtest-store";
import { formatCurrency, cn } from "@/lib/utils";

export function CandlestickChart() {
  const { candles, visibleIndex, activePosition, asset } = useBacktestStore();
  const containerRef = useRef<HTMLDivElement>(null);
  const [hoverIndex, setHoverIndex] = useState<number | null>(null);

  // Show up to 45 candles at a time for optimal readable spacing
  const maxDisplay = 45;
  const start = Math.max(0, visibleIndex - maxDisplay);
  const visibleCandles = useMemo(
    () => candles.slice(start, visibleIndex + 1),
    [candles, start, visibleIndex]
  );

  const currentCandle = visibleCandles[visibleCandles.length - 1];

  // Calculate High/Low range of visible candles
  const { minPrice, maxPrice, priceRange } = useMemo(() => {
    if (visibleCandles.length === 0) {
      return { minPrice: 0, maxPrice: 100, priceRange: 100 };
    }
    let min = Infinity;
    let max = -Infinity;
    visibleCandles.forEach((c) => {
      if (c.low < min) min = c.low;
      if (c.high > max) max = c.high;
    });

    // Also include active position entry/sl/tp in bounds if present
    if (activePosition) {
      if (activePosition.entryPrice < min) min = activePosition.entryPrice;
      if (activePosition.entryPrice > max) max = activePosition.entryPrice;
      if (activePosition.slPrice) {
        if (activePosition.slPrice < min) min = activePosition.slPrice;
        if (activePosition.slPrice > max) max = activePosition.slPrice;
      }
      if (activePosition.tpPrice) {
        if (activePosition.tpPrice < min) min = activePosition.tpPrice;
        if (activePosition.tpPrice > max) max = activePosition.tpPrice;
      }
    }

    const pad = (max - min) * 0.1 || 1;
    return {
      minPrice: min - pad,
      maxPrice: max + pad,
      priceRange: max - min + pad * 2,
    };
  }, [visibleCandles, activePosition]);

  const height = 360;
  const chartHeight = height - 30; // space for time labels
  const priceToY = (price: number) => {
    return chartHeight - ((price - minPrice) / priceRange) * chartHeight;
  };

  const candleWidth = 10;
  const gap = 6;
  const totalStep = candleWidth + gap;

  // Grid price ticks (5 intervals)
  const priceTicks = useMemo(() => {
    const ticks = [];
    const count = 5;
    for (let i = 0; i <= count; i++) {
      const p = minPrice + (priceRange / count) * i;
      ticks.push(p);
    }
    return ticks;
  }, [minPrice, priceRange]);

  const activeCandleForTooltip =
    hoverIndex !== null && visibleCandles[hoverIndex]
      ? visibleCandles[hoverIndex]
      : currentCandle;

  return (
    <div
      ref={containerRef}
      className="relative w-full h-full min-h-[360px] bg-[#090a0f] rounded-2xl border border-white/[0.06] overflow-hidden flex flex-col justify-between select-none"
    >
      {/* Top Bar: OHLC Stats */}
      <div className="flex items-center justify-between px-4 py-2 border-b border-white/[0.04] bg-[#0c0d14]/60 backdrop-blur-md z-10 text-[11px] font-mono">
        <div className="flex items-center gap-3">
          <span className="font-bold text-white tracking-wider">{asset}</span>
          {activeCandleForTooltip && (
            <div className="flex items-center gap-2.5 text-neutral-400">
              <span>
                O:{" "}
                <span className="text-white">
                  {activeCandleForTooltip.open.toFixed(asset === "EURUSD" ? 4 : 2)}
                </span>
              </span>
              <span>
                H:{" "}
                <span className="text-emerald-400">
                  {activeCandleForTooltip.high.toFixed(asset === "EURUSD" ? 4 : 2)}
                </span>
              </span>
              <span>
                L:{" "}
                <span className="text-rose-400">
                  {activeCandleForTooltip.low.toFixed(asset === "EURUSD" ? 4 : 2)}
                </span>
              </span>
              <span>
                C:{" "}
                <span
                  className={
                    activeCandleForTooltip.close >= activeCandleForTooltip.open
                      ? "text-emerald-400 font-semibold"
                      : "text-rose-400 font-semibold"
                  }
                >
                  {activeCandleForTooltip.close.toFixed(asset === "EURUSD" ? 4 : 2)}
                </span>
              </span>
            </div>
          )}
        </div>

        {/* Live Current Price Ticker */}
        {currentCandle && (
          <div className="flex items-center gap-2">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
            <span className="font-bold text-emerald-400 font-mono text-xs">
              {currentCandle.close.toFixed(asset === "EURUSD" ? 4 : 2)}
            </span>
          </div>
        )}
      </div>

      {/* SVG Canvas */}
      <div className="relative flex-1 w-full overflow-hidden">
        <svg
          className="w-full h-full"
          viewBox={`0 0 800 ${chartHeight}`}
          preserveAspectRatio="none"
        >
          {/* Horizontal Grid lines & Price Ticks */}
          {priceTicks.map((p, i) => {
            const y = priceToY(p);
            return (
              <g key={i}>
                <line
                  x1={0}
                  y1={y}
                  x2={800}
                  y2={y}
                  stroke="rgba(255,255,255,0.03)"
                  strokeDasharray="3 3"
                />
              </g>
            );
          })}

          {/* Render Candlesticks */}
          {visibleCandles.map((c, i) => {
            // align to right side of svg
            const x = 740 - (visibleCandles.length - 1 - i) * totalStep;
            if (x < -20) return null;

            const isGreen = c.close >= c.open;
            const openY = priceToY(c.open);
            const closeY = priceToY(c.close);
            const highY = priceToY(c.high);
            const lowY = priceToY(c.low);

            const bodyTop = Math.min(openY, closeY);
            const bodyHeight = Math.max(Math.abs(closeY - openY), 1.5);
            const color = isGreen ? "#10b981" : "#f43f5e";

            return (
              <g
                key={i}
                onMouseEnter={() => setHoverIndex(i)}
                onMouseLeave={() => setHoverIndex(null)}
                className="cursor-crosshair"
              >
                {/* Wick */}
                <line
                  x1={x + candleWidth / 2}
                  y1={highY}
                  x2={x + candleWidth / 2}
                  y2={lowY}
                  stroke={color}
                  strokeWidth={1.2}
                />
                {/* Body */}
                <rect
                  x={x}
                  y={bodyTop}
                  width={candleWidth}
                  height={bodyHeight}
                  fill={color}
                  rx={1}
                />
              </g>
            );
          })}

          {/* Current Price Line */}
          {currentCandle && (
            <line
              x1={0}
              y1={priceToY(currentCandle.close)}
              x2={800}
              y2={priceToY(currentCandle.close)}
              stroke="#10b981"
              strokeWidth={1}
              strokeDasharray="2 2"
              opacity={0.6}
            />
          )}

          {/* Active Trade Entry Line Overlay */}
          {activePosition && (
            <g>
              <line
                x1={0}
                y1={priceToY(activePosition.entryPrice)}
                x2={800}
                y2={priceToY(activePosition.entryPrice)}
                stroke={activePosition.direction === "buy" ? "#10b981" : "#f43f5e"}
                strokeWidth={1.5}
                strokeDasharray="4 4"
              />
              {activePosition.slPrice && (
                <line
                  x1={0}
                  y1={priceToY(activePosition.slPrice)}
                  x2={800}
                  y2={priceToY(activePosition.slPrice)}
                  stroke="#ef4444"
                  strokeWidth={1}
                  strokeDasharray="2 2"
                  opacity={0.8}
                />
              )}
              {activePosition.tpPrice && (
                <line
                  x1={0}
                  y1={priceToY(activePosition.tpPrice)}
                  x2={800}
                  y2={priceToY(activePosition.tpPrice)}
                  stroke="#22c55e"
                  strokeWidth={1}
                  strokeDasharray="2 2"
                  opacity={0.8}
                />
              )}
            </g>
          )}
        </svg>

        {/* Right Price Scale Overlay */}
        <div className="absolute right-0 top-0 bottom-0 w-16 bg-[#090a0f]/90 border-l border-white/[0.04] flex flex-col justify-between py-2 text-[9px] font-mono text-neutral-400 select-none pointer-events-none items-end pr-1.5">
          {priceTicks.slice().reverse().map((p, i) => (
            <span key={i}>{p.toFixed(asset === "EURUSD" ? 4 : 1)}</span>
          ))}
        </div>

        {/* Active Trade Floating Badge */}
        {activePosition && (
          <div
            className="absolute right-20 px-2 py-1 rounded-lg backdrop-blur-md border text-[10px] font-mono font-bold flex items-center gap-1.5 shadow-lg z-20 pointer-events-none"
            style={{
              top: `${Math.max(10, Math.min(priceToY(activePosition.entryPrice) - 12, chartHeight - 30))}px`,
              borderColor: activePosition.direction === "buy" ? "rgba(16,185,129,0.3)" : "rgba(244,63,94,0.3)",
              backgroundColor: "rgba(12,13,20,0.85)",
            }}
          >
            <span
              className={activePosition.direction === "buy" ? "text-emerald-400" : "text-rose-400"}
            >
              {activePosition.direction.toUpperCase()} {activePosition.lotSize}L
            </span>
            <span className="text-white">@{activePosition.entryPrice.toFixed(asset === "EURUSD" ? 4 : 2)}</span>
            <span
              className={cn(
                "px-1 rounded",
                activePosition.pnl >= 0 ? "bg-emerald-500/20 text-emerald-400" : "bg-rose-500/20 text-rose-400"
              )}
            >
              {activePosition.pnl >= 0 ? "+" : ""}${activePosition.pnl.toFixed(2)}
            </span>
          </div>
        )}
      </div>

      {/* Bottom Time Axis */}
      <div className="h-6 w-full border-t border-white/[0.04] bg-[#0c0d14]/60 px-4 flex items-center justify-between text-[9px] font-mono text-neutral-400">
        <span>{visibleCandles[0]?.time}</span>
        <span>{visibleCandles[Math.floor(visibleCandles.length / 2)]?.time}</span>
        <span className="text-neutral-300 font-semibold">{currentCandle?.time}</span>
      </div>
    </div>
  );
}
