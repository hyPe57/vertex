import { NextRequest, NextResponse } from "next/server";

export interface ApiCandle {
  time: number; // Unix timestamp in seconds
  open: number;
  high: number;
  low: number;
  close: number;
  volume: number;
}

// In-memory cache to prevent spamming external APIs (TTL: 60 seconds)
const cache = new Map<string, { timestamp: number; data: ApiCandle[]; source: string }>();
const CACHE_TTL_MS = 60 * 1000;

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const asset = (searchParams.get("asset") || "XAUUSD").toUpperCase();
  const timeframe = searchParams.get("timeframe") || "15m";
  const cacheKey = `${asset}-${timeframe}`;

  const cached = cache.get(cacheKey);
  if (cached && Date.now() - cached.timestamp < CACHE_TTL_MS) {
    return NextResponse.json({
      success: true,
      asset,
      timeframe,
      source: cached.source,
      candles: cached.data,
      cached: true,
    });
  }

  try {
    let candles: ApiCandle[] = [];
    let source = "";

    if (asset === "BTCUSD") {
      // ─── Binance Public API for Crypto ───
      const binanceInterval = mapToBinanceInterval(timeframe);
      const url = `https://api.binance.com/api/v3/klines?symbol=BTCUSDT&interval=${binanceInterval}&limit=1000`;
      const res = await fetch(url, { next: { revalidate: 60 } });
      if (!res.ok) throw new Error(`Binance error: ${res.statusText}`);
      const raw = await res.json();

      candles = raw.map((item: (string | number)[]) => ({
        time: Math.floor(Number(item[0]) / 1000),
        open: Number(parseFloat(String(item[1])).toFixed(2)),
        high: Number(parseFloat(String(item[2])).toFixed(2)),
        low: Number(parseFloat(String(item[3])).toFixed(2)),
        close: Number(parseFloat(String(item[4])).toFixed(2)),
        volume: Math.floor(parseFloat(String(item[5]))),
      }));
      source = "Binance (BTCUSDT)";
    } else {
      // ─── Yahoo Finance API for Gold, Forex, and Indices ───
      const yahooSymbol =
        asset === "XAUUSD" ? "GC=F" : asset === "EURUSD" ? "EURUSD=X" : "NQ=F";
      const { interval, range, aggregate4h } = mapToYahooConfig(timeframe);

      const url = `https://query1.finance.yahoo.com/v8/finance/chart/${yahooSymbol}?interval=${interval}&range=${range}`;
      const res = await fetch(url, {
        headers: {
          "User-Agent":
            "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
        },
        next: { revalidate: 60 },
      });

      if (!res.ok) throw new Error(`Yahoo error: ${res.statusText}`);
      const json = await res.json();
      const chartResult = json?.chart?.result?.[0];
      if (!chartResult || !chartResult.timestamp) {
        throw new Error("Invalid Yahoo Finance chart response structure");
      }

      const timestamps: number[] = chartResult.timestamp;
      const quote = chartResult.indicators?.quote?.[0];
      const decimals = asset === "EURUSD" ? 4 : 2;

      const rawCandles: ApiCandle[] = [];
      for (let i = 0; i < timestamps.length; i++) {
        const time = timestamps[i];
        const open = quote.open?.[i];
        const high = quote.high?.[i];
        const low = quote.low?.[i];
        const close = quote.close?.[i];
        const volume = quote.volume?.[i] || 100;

        if (
          time &&
          open != null &&
          high != null &&
          low != null &&
          close != null &&
          !isNaN(close)
        ) {
          rawCandles.push({
            time,
            open: Number(open.toFixed(decimals)),
            high: Number(high.toFixed(decimals)),
            low: Number(low.toFixed(decimals)),
            close: Number(close.toFixed(decimals)),
            volume: Math.floor(volume),
          });
        }
      }

      if (aggregate4h) {
        // Aggregate 1h bars into 4h bars (4:1)
        candles = aggregateHourlyCandles(rawCandles, 4, decimals);
      } else {
        candles = rawCandles;
      }

      source = `Yahoo Finance (${yahooSymbol})`;
    }

    // Ensure strictly ascending timestamps (required by lightweight-charts)
    candles = sanitizeTimestamps(candles);

    if (candles.length === 0) {
      throw new Error("No valid historical candles parsed from API");
    }

    cache.set(cacheKey, { timestamp: Date.now(), data: candles, source });

    return NextResponse.json({
      success: true,
      asset,
      timeframe,
      source,
      candles,
      cached: false,
    });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "Unknown error";
    console.error("Market data fetch failed, fallback:", message);

    return NextResponse.json(
      {
        success: false,
        error: message,
        fallback: true,
      },
      { status: 500 }
    );
  }
}

// Map timeframe to Binance interval string
function mapToBinanceInterval(tf: string): string {
  switch (tf) {
    case "1m":
      return "1m";
    case "5m":
      return "5m";
    case "15m":
      return "15m";
    case "1H":
      return "1h";
    case "4H":
      return "4h";
    case "1D":
      return "1d";
    default:
      return "15m";
  }
}

// Map timeframe to Yahoo Finance query configuration
function mapToYahooConfig(tf: string): {
  interval: string;
  range: string;
  aggregate4h?: boolean;
} {
  switch (tf) {
    case "1m":
      return { interval: "1m", range: "7d" };
    case "5m":
      return { interval: "5m", range: "7d" };
    case "15m":
      return { interval: "15m", range: "7d" };
    case "1H":
      return { interval: "1h", range: "1mo" };
    case "4H":
      // Fetch 1h candles over 3 months, then combine each 4 bars
      return { interval: "1h", range: "3mo", aggregate4h: true };
    case "1D":
      return { interval: "1d", range: "1y" };
    default:
      return { interval: "15m", range: "7d" };
  }
}

// Aggregate 1h bars into N-hour bars
function aggregateHourlyCandles(
  candles: ApiCandle[],
  factor = 4,
  decimals = 2
): ApiCandle[] {
  const result: ApiCandle[] = [];
  for (let i = 0; i < candles.length; i += factor) {
    const chunk = candles.slice(i, i + factor);
    if (chunk.length === 0) continue;

    const first = chunk[0];
    const last = chunk[chunk.length - 1];
    let high = -Infinity;
    let low = Infinity;
    let volume = 0;

    for (const c of chunk) {
      if (c.high > high) high = c.high;
      if (c.low < low) low = c.low;
      volume += c.volume;
    }

    result.push({
      time: first.time,
      open: first.open,
      high: Number(high.toFixed(decimals)),
      low: Number(low.toFixed(decimals)),
      close: last.close,
      volume,
    });
  }
  return result;
}

// Ensure strictly ascending unique timestamps
function sanitizeTimestamps(candles: ApiCandle[]): ApiCandle[] {
  const sorted = [...candles].sort((a, b) => a.time - b.time);
  const unique: ApiCandle[] = [];
  let lastTime = -1;

  for (const c of sorted) {
    if (c.time > lastTime) {
      unique.push(c);
      lastTime = c.time;
    }
  }
  return unique;
}
