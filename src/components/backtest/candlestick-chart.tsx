"use client";

import React, { useEffect, useRef, useState, useCallback } from "react";
import {
  createChart,
  ColorType,
  LineStyle,
  CrosshairMode,
  IChartApi,
  ISeriesApi,
  IPriceLine,
  UTCTimestamp,
} from "lightweight-charts";
import { useBacktestStore, BacktestCandle } from "@/stores/backtest-store";
import {
  Maximize2,
  Minimize2,
  ZoomIn,
  ZoomOut,
  RotateCcw,
  Navigation,
  Activity,
  Layers,
} from "lucide-react";
import { cn } from "@/lib/utils";

function getTimeframeDefaultBarSpacing(tf: string): number {
  switch (tf) {
    case "1m":
      return 4.5; // Denser candles for 1-minute chart
    case "5m":
      return 6.5;
    case "15m":
      return 8.5;
    case "1H":
      return 10.5;
    case "4H":
      return 12;
    case "1D":
      return 14;
    default:
      return 8.5;
  }
}

export function CandlestickChart() {
  const {
    candles,
    visibleIndex,
    activePosition,
    asset,
    timeframe,
    setTimeframe,
  } = useBacktestStore();

  const containerRef = useRef<HTMLDivElement>(null);
  const chartRef = useRef<IChartApi | null>(null);
  const seriesRef = useRef<ISeriesApi<"Candlestick"> | null>(null);

  // Price lines for active position
  const entryLineRef = useRef<IPriceLine | null>(null);
  const tpLineRef = useRef<IPriceLine | null>(null);
  const slLineRef = useRef<IPriceLine | null>(null);

  const [hoverCandle, setHoverCandle] = useState<BacktestCandle | null>(null);
  const [isFullscreen, setIsFullscreen] = useState(false);

  // Keep track of the last rendered visibleIndex to optimize incremental updates
  const lastIndexRef = useRef<number>(-1);
  const lastAssetRef = useRef<string>(asset);
  const lastTimeframeRef = useRef<string>(timeframe);
  const lastCandlesRef = useRef<BacktestCandle[]>(candles);

  // Current active / latest candle
  const latestCandle = candles[visibleIndex] || candles[candles.length - 1];
  const displayCandle = hoverCandle || latestCandle;
  const decimals = asset === "EURUSD" ? 4 : 2;

  // 1. Initialize Lightweight Chart instance
  useEffect(() => {
    if (!containerRef.current) return;

    // Clean up any existing canvas children
    containerRef.current.innerHTML = "";

    const chart = createChart(containerRef.current, {
      width: containerRef.current.clientWidth,
      height: containerRef.current.clientHeight,
      layout: {
        background: { type: ColorType.Solid, color: "#090a0f" },
        textColor: "#71717a",
        fontSize: 11,
        fontFamily: "var(--font-geist-mono), monospace",
      },
      grid: {
        vertLines: { color: "rgba(255, 255, 255, 0.03)" },
        horzLines: { color: "rgba(255, 255, 255, 0.03)" },
      },
      crosshair: {
        mode: CrosshairMode.Normal,
        vertLine: {
          color: "rgba(255, 255, 255, 0.18)",
          width: 1,
          style: LineStyle.Dashed,
          labelBackgroundColor: "#18181b",
        },
        horzLine: {
          color: "rgba(255, 255, 255, 0.18)",
          width: 1,
          style: LineStyle.Dashed,
          labelBackgroundColor: "#18181b",
        },
      },
      rightPriceScale: {
        borderColor: "rgba(255, 255, 255, 0.08)",
        textColor: "#a1a1aa",
        scaleMargins: {
          top: 0.12,
          bottom: 0.12,
        },
        autoScale: true,
      },
      timeScale: {
        borderColor: "rgba(255, 255, 255, 0.08)",
        timeVisible: true,
        secondsVisible: false,
        rightOffset: 12,
        barSpacing: getTimeframeDefaultBarSpacing(timeframe),
        minBarSpacing: 1.5,
        shiftVisibleRangeOnNewBar: false,
      },
      handleScroll: {
        mouseWheel: true,
        pressedMouseMove: true,
        horzTouchDrag: true,
        vertTouchDrag: true,
      },
      handleScale: {
        axisPressedMouseMove: { time: true, price: true },
        mouseWheel: true,
        pinch: true,
      },
    });

    const series = chart.addCandlestickSeries({
      upColor: "#10b981",
      downColor: "#f43f5e",
      borderVisible: false,
      wickUpColor: "#10b981",
      wickDownColor: "#f43f5e",
      priceFormat: {
        type: "price",
        precision: decimals,
        minMove: asset === "EURUSD" ? 0.0001 : 0.01,
      },
    });

    // Populate initial candles slice
    const initialSlice = candles.slice(0, visibleIndex + 1).map((c) => ({
      time: c.time as UTCTimestamp,
      open: c.open,
      high: c.high,
      low: c.low,
      close: c.close,
    }));
    series.setData(initialSlice);
    chart.timeScale().fitContent();

    lastIndexRef.current = visibleIndex;
    lastAssetRef.current = asset;
    chartRef.current = chart;
    seriesRef.current = series;

    // Crosshair hover listener for live OHLC bar inspect
    chart.subscribeCrosshairMove((param) => {
      if (!param.time || !param.seriesData || !seriesRef.current) {
        setHoverCandle(null);
        return;
      }
      const data = param.seriesData.get(seriesRef.current) as
        | { open: number; high: number; low: number; close: number; time: number }
        | undefined;
      if (data) {
        setHoverCandle({
          time: data.time,
          open: data.open,
          high: data.high,
          low: data.low,
          close: data.close,
          volume: 0,
        });
      }
    });

    // ResizeObserver for responsive chart
    const resizeObserver = new ResizeObserver(() => {
      if (containerRef.current && chartRef.current) {
        chartRef.current.applyOptions({
          width: containerRef.current.clientWidth,
          height: containerRef.current.clientHeight,
        });
      }
    });
    resizeObserver.observe(containerRef.current);

    return () => {
      resizeObserver.disconnect();
      chart.remove();
      chartRef.current = null;
      seriesRef.current = null;
      entryLineRef.current = null;
      tpLineRef.current = null;
      slLineRef.current = null;
    };
  }, []); // Run once on mount

  // 2. Synchronize dataset when candles / visibleIndex / asset updates
  useEffect(() => {
    const series = seriesRef.current;
    const chart = chartRef.current;
    if (!series || !chart) return;

    const assetChanged = lastAssetRef.current !== asset;
    const timeframeChanged = lastTimeframeRef.current !== timeframe;
    const candlesChanged = lastCandlesRef.current !== candles;

    // Whenever Asset, Timeframe, or Candles array changed:
    if (assetChanged || timeframeChanged || candlesChanged) {
      series.applyOptions({
        priceFormat: {
          type: "price",
          precision: decimals,
          minMove: asset === "EURUSD" ? 0.0001 : 0.01,
        },
      });

      const slice = candles.slice(0, visibleIndex + 1).map((c) => ({
        time: c.time as UTCTimestamp,
        open: c.open,
        high: c.high,
        low: c.low,
        close: c.close,
      }));
      series.setData(slice);

      // Only auto-center/fit when explicitly switching to a different asset or timeframe
      if (assetChanged || timeframeChanged || lastCandlesRef.current.length === 0) {
        if (timeframeChanged) {
          chart.timeScale().applyOptions({
            barSpacing: getTimeframeDefaultBarSpacing(timeframe),
          });
        }
        if (slice.length > 80) {
          chart.timeScale().scrollToPosition(0, false);
        } else {
          chart.timeScale().fitContent();
        }
        try {
          chart.priceScale("right").applyOptions({ autoScale: true });
        } catch (_) {}
      }

      lastAssetRef.current = asset;
      lastTimeframeRef.current = timeframe;
      lastCandlesRef.current = candles;
      lastIndexRef.current = visibleIndex;
      return;
    }

    // Step forward by 1 candle: smooth incremental update
    if (visibleIndex === lastIndexRef.current + 1 && candles[visibleIndex]) {
      const c = candles[visibleIndex];
      series.update({
        time: c.time as UTCTimestamp,
        open: c.open,
        high: c.high,
        low: c.low,
        close: c.close,
      });
      lastIndexRef.current = visibleIndex;
    } else if (visibleIndex !== lastIndexRef.current) {
      // Non-contiguous jump or simulation reset
      const slice = candles.slice(0, visibleIndex + 1).map((c) => ({
        time: c.time as UTCTimestamp,
        open: c.open,
        high: c.high,
        low: c.low,
        close: c.close,
      }));
      series.setData(slice);
      lastIndexRef.current = visibleIndex;
    }
  }, [candles, visibleIndex, asset, timeframe, decimals]);

  // 3. Manage Entry, TP, and SL Price Lines
  useEffect(() => {
    const series = seriesRef.current;
    if (!series) return;

    // Remove previous lines
    if (entryLineRef.current) {
      try {
        series.removePriceLine(entryLineRef.current);
      } catch (_) {}
      entryLineRef.current = null;
    }
    if (tpLineRef.current) {
      try {
        series.removePriceLine(tpLineRef.current);
      } catch (_) {}
      tpLineRef.current = null;
    }
    if (slLineRef.current) {
      try {
        series.removePriceLine(slLineRef.current);
      } catch (_) {}
      slLineRef.current = null;
    }

    // Recreate if in active position
    if (activePosition) {
      // Entry Line
      entryLineRef.current = series.createPriceLine({
        price: activePosition.entryPrice,
        color: activePosition.direction === "buy" ? "#38bdf8" : "#fb923c",
        lineWidth: 2,
        lineStyle: LineStyle.Dashed,
        axisLabelVisible: true,
        title: `${activePosition.direction.toUpperCase()} ${activePosition.lotSize}L @ ${activePosition.entryPrice.toFixed(decimals)}`,
      });

      // TP Line
      if (activePosition.tpPrice) {
        tpLineRef.current = series.createPriceLine({
          price: activePosition.tpPrice,
          color: "#10b981",
          lineWidth: 2,
          lineStyle: LineStyle.Dotted,
          axisLabelVisible: true,
          title: `TP: ${activePosition.tpPrice.toFixed(decimals)}`,
        });
      }

      // SL Line
      if (activePosition.slPrice) {
        slLineRef.current = series.createPriceLine({
          price: activePosition.slPrice,
          color: "#f43f5e",
          lineWidth: 2,
          lineStyle: LineStyle.Dotted,
          axisLabelVisible: true,
          title: `SL: ${activePosition.slPrice.toFixed(decimals)}`,
        });
      }
    }
  }, [activePosition, decimals]);

  // Chart Actions
  const handleZoomIn = useCallback(() => {
    if (!chartRef.current) return;
    const current = chartRef.current.timeScale().options().barSpacing || 10;
    chartRef.current.timeScale().applyOptions({ barSpacing: Math.min(60, current * 1.3) });
  }, []);

  const handleZoomOut = useCallback(() => {
    if (!chartRef.current) return;
    const current = chartRef.current.timeScale().options().barSpacing || 10;
    chartRef.current.timeScale().applyOptions({ barSpacing: Math.max(2, current * 0.7) });
  }, []);

  const handleFitContent = useCallback(() => {
    chartRef.current?.timeScale().fitContent();
  }, []);

  const handleScrollToRealtime = useCallback(() => {
    chartRef.current?.timeScale().scrollToRealTime();
  }, []);

  const toggleFullscreen = useCallback(() => {
    setIsFullscreen((prev) => !prev);
    setTimeout(() => {
      if (containerRef.current && chartRef.current) {
        chartRef.current.applyOptions({
          width: containerRef.current.clientWidth,
          height: containerRef.current.clientHeight,
        });
        chartRef.current.timeScale().fitContent();
      }
    }, 150);
  }, []);

  // Compute bar delta
  const priceChange = displayCandle ? displayCandle.close - displayCandle.open : 0;
  const priceChangePct =
    displayCandle && displayCandle.open > 0
      ? (priceChange / displayCandle.open) * 100
      : 0;
  const isUp = priceChange >= 0;

  return (
    <div
      className={cn(
        "relative w-full h-full bg-[#090a0f] overflow-hidden flex flex-col justify-between select-none",
        isFullscreen && "fixed inset-0 z-50 rounded-none h-screen w-screen"
      )}
    >
      {/* ─── Top Bar: Symbol, Live OHLC, and TradingView Controls ─── */}
      <div className="flex items-center justify-between px-3.5 py-2.5 border-b border-white/[0.05] bg-[#0c0d14]/80 backdrop-blur-md z-10 flex-wrap gap-2 text-[11px] font-mono">
        {/* Left: Asset info & OHLC */}
        <div className="flex items-center gap-3 flex-wrap">
          <div className="flex items-center gap-1.5">
            <span className="font-bold text-white tracking-wider text-xs">{asset}</span>
            <span className="text-[10px] text-neutral-400 font-semibold px-1.5 py-0.5 rounded bg-white/[0.04]">
              {timeframe}
            </span>
          </div>

          {/* Real-time OHLC */}
          {displayCandle && (
            <div className="flex items-center gap-2.5 text-neutral-400 text-[11px]">
              <span>
                O: <span className="text-white font-medium">{displayCandle.open.toFixed(decimals)}</span>
              </span>
              <span>
                H: <span className="text-emerald-400 font-medium">{displayCandle.high.toFixed(decimals)}</span>
              </span>
              <span>
                L: <span className="text-rose-400 font-medium">{displayCandle.low.toFixed(decimals)}</span>
              </span>
              <span>
                C:{" "}
                <span className={cn("font-bold", isUp ? "text-emerald-400" : "text-rose-400")}>
                  {displayCandle.close.toFixed(decimals)}
                </span>
              </span>
              <span className={cn("text-[10px] font-semibold", isUp ? "text-emerald-400" : "text-rose-400")}>
                {isUp ? "+" : ""}
                {priceChange.toFixed(decimals)} ({isUp ? "+" : ""}
                {priceChangePct.toFixed(2)}%)
              </span>
            </div>
          )}
        </div>

        {/* Right: TradingView Toolbar Buttons */}
        <div className="flex items-center gap-1">
          {/* Zoom In */}
          <button
            type="button"
            onClick={handleZoomIn}
            className="p-1.5 rounded-lg bg-white/[0.03] hover:bg-white/[0.08] text-neutral-400 hover:text-white transition-colors cursor-pointer border border-white/[0.04]"
            title="Zoom In"
          >
            <ZoomIn size={13} />
          </button>

          {/* Zoom Out */}
          <button
            type="button"
            onClick={handleZoomOut}
            className="p-1.5 rounded-lg bg-white/[0.03] hover:bg-white/[0.08] text-neutral-400 hover:text-white transition-colors cursor-pointer border border-white/[0.04]"
            title="Zoom Out"
          >
            <ZoomOut size={13} />
          </button>

          {/* Fit View / Reset */}
          <button
            type="button"
            onClick={handleFitContent}
            className="flex items-center gap-1 px-2 py-1 rounded-lg bg-white/[0.03] hover:bg-white/[0.08] text-neutral-300 hover:text-white text-[10px] font-medium transition-colors cursor-pointer border border-white/[0.04]"
            title="Fit All Data to View"
          >
            <RotateCcw size={11} />
            <span>Fit</span>
          </button>

          {/* Latest Bar */}
          <button
            type="button"
            onClick={handleScrollToRealtime}
            className="flex items-center gap-1 px-2 py-1 rounded-lg bg-white/[0.03] hover:bg-white/[0.08] text-neutral-300 hover:text-white text-[10px] font-medium transition-colors cursor-pointer border border-white/[0.04]"
            title="Jump to Latest Candle"
          >
            <Navigation size={11} />
            <span>Live</span>
          </button>

          {/* Fullscreen Toggle */}
          <button
            type="button"
            onClick={toggleFullscreen}
            className="p-1.5 rounded-lg bg-white/[0.03] hover:bg-white/[0.08] text-neutral-400 hover:text-white transition-colors cursor-pointer border border-white/[0.04]"
            title={isFullscreen ? "Exit Fullscreen" : "Fullscreen"}
          >
            {isFullscreen ? <Minimize2 size={13} /> : <Maximize2 size={13} />}
          </button>
        </div>
      </div>

      {/* ─── Lightweight Charts Interactive Canvas Container ─── */}
      <div className="relative flex-1 w-full h-full min-h-[380px] overflow-hidden">
        {/* Subtle Watermark */}
        <div className="absolute inset-0 flex items-center justify-center pointer-events-none z-0 opacity-[0.03] select-none">
          <span className="text-8xl font-black tracking-widest text-white uppercase">
            {asset}
          </span>
        </div>

        {/* DOM node where Lightweight Charts mounts */}
        <div ref={containerRef} className="w-full h-full relative z-10" />

        {/* Bottom-left gesture & shortcuts tooltip */}
        <div className="absolute bottom-2 left-3 z-20 pointer-events-none flex items-center gap-2 text-[10px] font-mono text-neutral-400/80 bg-[#0c0d14]/70 backdrop-blur-sm px-2.5 py-1 rounded-md border border-white/[0.04]">
          <span>Wheel: Zoom</span>
          <span>•</span>
          <span>Drag: Pan</span>
          <span>•</span>
          <span>Axes: Scale</span>
        </div>
      </div>
    </div>
  );
}
