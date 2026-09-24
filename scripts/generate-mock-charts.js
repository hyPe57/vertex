const fs = require('fs');
const path = require('path');

const outputDir = path.join(__dirname, '../public/mock');
if (!fs.existsSync(outputDir)) {
  fs.mkdirSync(outputDir, { recursive: true });
}

// Chart configurations for 10 realistic setups
const charts = [
  {
    fileName: 'chart-xau-breakout.svg',
    asset: 'XAUUSD',
    timeframe: '15m',
    direction: 'LONG',
    entry: 2650.5,
    exit: 2668.2,
    sl: 2642.0,
    tp: 2670.0,
    rr: '2.29',
    pnl: '+$885.00',
    title: 'H1 Resistance Breakout & Retest',
    annotation: 'Bullish Order Block (OB) Retest',
    trend: 'bullish',
    isWin: true,
  },
  {
    fileName: 'chart-eur-pmi.svg',
    asset: 'EURUSD',
    timeframe: '15m',
    direction: 'SHORT',
    entry: 1.1125,
    exit: 1.1098,
    sl: 1.1145,
    tp: 1.1095,
    rr: '1.50',
    pnl: '+$270.00',
    title: 'Flash PMI News Breakdown',
    annotation: 'Fair Value Gap (FVG) Fill',
    trend: 'bearish',
    isWin: true,
  },
  {
    fileName: 'chart-gbpjpy-fomo.svg',
    asset: 'GBPJPY',
    timeframe: '5m',
    direction: 'LONG',
    entry: 188.45,
    exit: 187.80,
    sl: 187.95,
    tp: 189.45,
    rr: '2.00',
    pnl: '-$195.00',
    title: 'FOMO Top Chase - Stopped Out',
    annotation: 'Liquidity Trap / False Breakout',
    trend: 'loss',
    isWin: false,
  },
  {
    fileName: 'chart-xau-supply.svg',
    asset: 'XAUUSD',
    timeframe: '4H',
    direction: 'SHORT',
    entry: 2672.0,
    exit: 2658.5,
    sl: 2680.0,
    tp: 2655.0,
    rr: '2.13',
    pnl: '+$675.00',
    title: 'H4 Supply Zone Institutional Rejection',
    annotation: 'Change of Character (CHoCH)',
    trend: 'bearish',
    isWin: true,
  },
  {
    fileName: 'chart-usdjpy-trend.svg',
    asset: 'USDJPY',
    timeframe: '1H',
    direction: 'LONG',
    entry: 143.25,
    exit: 143.78,
    sl: 142.95,
    tp: 143.85,
    rr: '2.00',
    pnl: '+$424.00',
    title: '50 EMA Dynamic Support Bounce',
    annotation: 'Higher Low (HL) Structure',
    trend: 'bullish',
    isWin: true,
  },
  {
    fileName: 'chart-eurusd-reversal.svg',
    asset: 'EURUSD',
    timeframe: '15m',
    direction: 'LONG',
    entry: 1.1080,
    exit: 1.1062,
    sl: 1.1060,
    tp: 1.1120,
    rr: '2.00',
    pnl: '-$180.00',
    title: 'Early Reversal Catch - Counter Trend',
    annotation: 'Trend Continuation Breakdown',
    trend: 'loss',
    isWin: false,
  },
  {
    fileName: 'chart-xau-rally.svg',
    asset: 'XAUUSD',
    timeframe: '15m',
    direction: 'LONG',
    entry: 2635.0,
    exit: 2652.8,
    sl: 2627.0,
    tp: 2655.0,
    rr: '2.50',
    pnl: '+$890.00',
    title: 'London Open Expansion Rally',
    annotation: 'Asian High Liquidity Swept',
    trend: 'bullish',
    isWin: true,
  },
  {
    fileName: 'chart-gbpusd-scalp.svg',
    asset: 'GBPUSD',
    timeframe: '5m',
    direction: 'SHORT',
    entry: 1.3285,
    exit: 1.3260,
    sl: 1.3310,
    tp: 1.3250,
    rr: '1.40',
    pnl: '+$125.00',
    title: 'London Morning Momentum Scalp',
    annotation: 'Equal Lows (EQL) Target',
    trend: 'bearish',
    isWin: true,
  },
  {
    fileName: 'chart-nzdusd-support.svg',
    asset: 'NZDUSD',
    timeframe: '4H',
    direction: 'LONG',
    entry: 0.6235,
    exit: 0.6268,
    sl: 0.6220,
    tp: 0.6270,
    rr: '2.33',
    pnl: '+$165.00',
    title: 'H4 Key Level Double Bottom Bounce',
    annotation: 'Demand Zone Re-accumulation',
    trend: 'bullish',
    isWin: true,
  },
  {
    fileName: 'chart-btcusd-sweep.svg',
    asset: 'BTCUSD',
    timeframe: '15m',
    direction: 'LONG',
    entry: 63850.0,
    exit: 65120.0,
    sl: 63400.0,
    tp: 65200.0,
    rr: '3.00',
    pnl: '+$1,270.00',
    title: 'Weekend Range Low Sweep & Expansion',
    annotation: 'Clean SFP (Swing Failure Pattern)',
    trend: 'bullish',
    isWin: true,
  },
];

function generateSvg(cfg) {
  const width = 1200;
  const height = 750;
  const chartHeight = 630;
  const chartWidth = 1100;
  const numCandles = 36;
  const candleSpacing = chartWidth / numCandles;

  // Generate synthetic candles matching the theme
  const candles = [];
  let price = 50; // normalized 0 - 100
  for (let i = 0; i < numCandles; i++) {
    let delta = 0;
    if (cfg.trend === 'bullish') {
      delta = (Math.random() - 0.38) * 4.5;
      if (i > 20) delta += 1.8; // breakout wave
    } else if (cfg.trend === 'bearish') {
      delta = (Math.random() - 0.62) * 4.5;
      if (i > 20) delta -= 1.8; // breakdown wave
    } else {
      // loss / false breakout
      if (i < 24) delta = (Math.random() - 0.35) * 4.0; // pumped
      else delta = (Math.random() - 0.75) * 6.5; // dumped hard
    }

    const open = Math.max(10, Math.min(90, price));
    const close = Math.max(10, Math.min(90, open + delta));
    const high = Math.max(open, close) + Math.random() * 3.5;
    const low = Math.min(open, close) - Math.random() * 3.5;
    candles.push({ open, high, low, close, isUp: close >= open });
    price = close;
  }

  // Convert 0-100 price to Y coordinate
  const priceToY = (p) => chartHeight - (p / 100) * (chartHeight - 120) - 60;

  // Build Candles SVG elements
  let candlesSvg = '';
  let ema21Points = [];
  let ema50Points = [];
  let ema200Points = [];

  candles.forEach((c, idx) => {
    const x = 50 + idx * candleSpacing;
    const yOpen = priceToY(c.open);
    const yClose = priceToY(c.close);
    const yHigh = priceToY(c.high);
    const yLow = priceToY(c.low);
    const candleWidth = 14;

    const color = c.isUp ? '#10b981' : '#f43f5e';
    const top = Math.min(yOpen, yClose);
    const bodyHeight = Math.max(2, Math.abs(yClose - yOpen));

    // Wick
    candlesSvg += `
      <line x1="${x + candleWidth / 2}" y1="${yHigh}" x2="${x + candleWidth / 2}" y2="${yLow}" stroke="${color}" stroke-width="1.5" />
      <rect x="${x}" y="${top}" width="${candleWidth}" height="${bodyHeight}" fill="${color}" rx="1" />
    `;

    // Indicators approximations
    ema21Points.push(`${x + candleWidth / 2},${priceToY((c.open + c.close) / 2 + (c.isUp ? -2 : 2))}`);
    ema50Points.push(`${x + candleWidth / 2},${priceToY((c.open + c.close) / 2 + (cfg.trend === 'bullish' ? -5 : 5))}`);
  });

  // Long/Short TradingView Position Tool coordinates
  const entryIdx = 20;
  const entryX = 50 + entryIdx * candleSpacing;
  const toolWidth = chartWidth - entryX + 20;
  const entryY = priceToY(candles[entryIdx].open);

  const tpHeight = 110;
  const slHeight = 55;

  let posToolSvg = '';
  if (cfg.direction === 'LONG') {
    // Green TP box on top, Red SL box below
    const tpTop = entryY - tpHeight;
    const slTop = entryY;
    posToolSvg = `
      <!-- Long Position Tool -->
      <g>
        <!-- Take Profit Box (Green) -->
        <rect x="${entryX}" y="${tpTop}" width="${toolWidth}" height="${tpHeight}" fill="rgba(16, 185, 129, 0.18)" stroke="#10b981" stroke-width="1.5" stroke-dasharray="4,4" />
        <rect x="${entryX}" y="${entryY - 26}" width="140" height="22" rx="4" fill="#10b981" />
        <text x="${entryX + 6}" y="${entryY - 11}" font-family="monospace" font-size="11" font-weight="bold" fill="#000">TP: ${cfg.tp} (+${cfg.rr}R)</text>

        <!-- Stop Loss Box (Red) -->
        <rect x="${entryX}" y="${slTop}" width="${toolWidth}" height="${slHeight}" fill="rgba(244, 63, 94, 0.18)" stroke="#f43f5e" stroke-width="1.5" stroke-dasharray="4,4" />
        <rect x="${entryX}" y="${entryY + slHeight + 4}" width="110" height="22" rx="4" fill="#f43f5e" />
        <text x="${entryX + 6}" y="${entryY + slHeight + 19}" font-family="monospace" font-size="11" font-weight="bold" fill="#fff">SL: ${cfg.sl}</text>

        <!-- Entry Line -->
        <line x1="${entryX - 20}" y1="${entryY}" x2="${entryX + toolWidth}" y2="${entryY}" stroke="#38bdf8" stroke-width="2" stroke-dasharray="6,4" />
        <circle cx="${entryX}" cy="${entryY}" r="4" fill="#38bdf8" />
        <rect x="${entryX - 85}" y="${entryY - 11}" width="80" height="22" rx="4" fill="#0284c7" />
        <text x="${entryX - 80}" y="${entryY + 4}" font-family="monospace" font-size="10" font-weight="bold" fill="#fff">ENTRY ${cfg.entry}</text>
      </g>
    `;
  } else {
    // Short: Red SL box on top, Green TP box below
    const slTop = entryY - slHeight;
    const tpTop = entryY;
    posToolSvg = `
      <!-- Short Position Tool -->
      <g>
        <!-- Stop Loss Box (Red) -->
        <rect x="${entryX}" y="${slTop}" width="${toolWidth}" height="${slHeight}" fill="rgba(244, 63, 94, 0.18)" stroke="#f43f5e" stroke-width="1.5" stroke-dasharray="4,4" />
        <rect x="${entryX}" y="${slTop - 26}" width="110" height="22" rx="4" fill="#f43f5e" />
        <text x="${entryX + 6}" y="${slTop - 11}" font-family="monospace" font-size="11" font-weight="bold" fill="#fff">SL: ${cfg.sl}</text>

        <!-- Take Profit Box (Green) -->
        <rect x="${entryX}" y="${tpTop}" width="${toolWidth}" height="${tpHeight}" fill="rgba(16, 185, 129, 0.18)" stroke="#10b981" stroke-width="1.5" stroke-dasharray="4,4" />
        <rect x="${entryX}" y="${entryY + tpHeight + 4}" width="140" height="22" rx="4" fill="#10b981" />
        <text x="${entryX + 6}" y="${entryY + tpHeight + 19}" font-family="monospace" font-size="11" font-weight="bold" fill="#000">TP: ${cfg.tp} (+${cfg.rr}R)</text>

        <!-- Entry Line -->
        <line x1="${entryX - 20}" y1="${entryY}" x2="${entryX + toolWidth}" y2="${entryY}" stroke="#fb923c" stroke-width="2" stroke-dasharray="6,4" />
        <circle cx="${entryX}" cy="${entryY}" r="4" fill="#fb923c" />
        <rect x="${entryX - 85}" y="${entryY - 11}" width="80" height="22" rx="4" fill="#ea580c" />
        <text x="${entryX - 80}" y="${entryY + 4}" font-family="monospace" font-size="10" font-weight="bold" fill="#fff">ENTRY ${cfg.entry}</text>
      </g>
    `;
  }

  // Grid Lines
  let gridLines = '';
  for (let y = 80; y <= chartHeight; y += 70) {
    gridLines += `<line x1="50" y1="${y}" x2="${chartWidth + 50}" y2="${y}" stroke="rgba(255,255,255,0.03)" stroke-width="1" />`;
  }
  for (let x = 50; x <= chartWidth + 50; x += 110) {
    gridLines += `<line x1="${x}" y1="60" x2="${x}" y2="${chartHeight}" stroke="rgba(255,255,255,0.03)" stroke-width="1" />`;
  }

  return `
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${width} ${height}" width="${width}" height="${height}">
  <defs>
    <linearGradient id="bgGrad" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#0a0b12" />
      <stop offset="100%" stop-color="#07080d" />
    </linearGradient>
  </defs>

  <!-- Background -->
  <rect width="${width}" height="${height}" fill="url(#bgGrad)" />

  <!-- Grid -->
  ${gridLines}

  <!-- Watermark -->
  <text x="${width / 2}" y="${height / 2 + 30}" font-family="sans-serif" font-size="78" font-weight="900" fill="rgba(255,255,255,0.02)" text-anchor="middle" letter-spacing="10">VERTEX JOURNAL</text>

  <!-- Top Bar -->
  <rect x="0" y="0" width="${width}" height="48" fill="#0d0e17" opacity="0.9" />
  <line x1="0" y1="48" x2="${width}" y2="48" stroke="rgba(255,255,255,0.06)" stroke-width="1" />

  <text x="24" y="30" font-family="monospace" font-size="14" font-weight="bold" fill="#ffffff">${cfg.asset} · ${cfg.timeframe}</text>
  <rect x="145" y="16" width="54" height="20" rx="4" fill="${cfg.direction === 'LONG' ? 'rgba(16,185,129,0.15)' : 'rgba(244,63,94,0.15)'}" stroke="${cfg.direction === 'LONG' ? '#10b981' : '#f43f5e'}" stroke-width="1" />
  <text x="172" y="30" font-family="monospace" font-size="11" font-weight="bold" fill="${cfg.direction === 'LONG' ? '#10b981' : '#f43f5e'}" text-anchor="middle">${cfg.direction}</text>

  <text x="220" y="30" font-family="monospace" font-size="12" fill="#71717a">Setup: <tspan fill="#e4e4e7" font-weight="600">${cfg.title}</tspan></text>

  <rect x="${width - 150}" y="12" width="130" height="26" rx="6" fill="${cfg.isWin ? 'rgba(16,185,129,0.2)' : 'rgba(244,63,94,0.2)'}" stroke="${cfg.isWin ? '#10b981' : '#f43f5e'}" stroke-width="1" />
  <text x="${width - 85}" y="29" font-family="monospace" font-size="13" font-weight="bold" fill="${cfg.isWin ? '#10b981' : '#f43f5e'}" text-anchor="middle">${cfg.pnl}</text>

  <!-- Indicators Legend -->
  <g transform="translate(24, 75)">
    <circle cx="6" cy="6" r="3" fill="#38bdf8" />
    <text x="16" y="9" font-family="monospace" font-size="11" fill="#71717a">EMA 21</text>
    <circle cx="76" cy="6" r="3" fill="#fbbf24" />
    <text x="86" y="9" font-family="monospace" font-size="11" fill="#71717a">EMA 50</text>
  </g>

  <!-- Indicator Paths -->
  <polyline points="${ema21Points.join(' ')}" fill="none" stroke="#38bdf8" stroke-width="1.8" opacity="0.75" />
  <polyline points="${ema50Points.join(' ')}" fill="none" stroke="#fbbf24" stroke-width="1.8" opacity="0.65" />

  <!-- Position Tool -->
  ${posToolSvg}

  <!-- Candlesticks -->
  ${candlesSvg}

  <!-- Setup Annotation Box -->
  <g transform="translate(180, 110)">
    <rect width="240" height="34" rx="6" fill="rgba(15, 23, 42, 0.85)" stroke="rgba(255,255,255,0.15)" stroke-width="1" />
    <text x="12" y="22" font-family="sans-serif" font-size="12" font-weight="600" fill="#38bdf8">📌 ${cfg.annotation}</text>
  </g>

  <!-- Right Price Scale -->
  <rect x="${chartWidth + 50}" y="48" width="50" height="${chartHeight - 48}" fill="#0a0b10" opacity="0.7" />
  <line x1="${chartWidth + 50}" y1="48" x2="${chartWidth + 50}" y2="${chartHeight}" stroke="rgba(255,255,255,0.06)" />

  <text x="${chartWidth + 60}" y="120" font-family="monospace" font-size="10" fill="#71717a">${(cfg.entry * 1.01).toFixed(cfg.asset === 'EURUSD' ? 4 : 1)}</text>
  <text x="${chartWidth + 60}" y="220" font-family="monospace" font-size="10" fill="#71717a">${(cfg.entry * 1.005).toFixed(cfg.asset === 'EURUSD' ? 4 : 1)}</text>
  <text x="${chartWidth + 60}" y="${entryY + 4}" font-family="monospace" font-size="10" font-weight="bold" fill="#38bdf8">${cfg.entry}</text>
  <text x="${chartWidth + 60}" y="420" font-family="monospace" font-size="10" fill="#71717a">${(cfg.entry * 0.995).toFixed(cfg.asset === 'EURUSD' ? 4 : 1)}</text>
  <text x="${chartWidth + 60}" y="520" font-family="monospace" font-size="10" fill="#71717a">${(cfg.entry * 0.99).toFixed(cfg.asset === 'EURUSD' ? 4 : 1)}</text>

  <!-- Bottom Timeline Bar -->
  <rect x="0" y="${chartHeight}" width="${width}" height="40" fill="#0d0e17" />
  <line x1="0" y1="${chartHeight}" x2="${width}" y2="${chartHeight}" stroke="rgba(255,255,255,0.06)" />

  <text x="120" y="${chartHeight + 24}" font-family="monospace" font-size="10" fill="#71717a">08:00</text>
  <text x="320" y="${chartHeight + 24}" font-family="monospace" font-size="10" fill="#71717a">10:00</text>
  <text x="520" y="${chartHeight + 24}" font-family="monospace" font-size="10" fill="#71717a">12:00</text>
  <text x="720" y="${chartHeight + 24}" font-family="monospace" font-size="10" fill="#71717a">14:00</text>
  <text x="920" y="${chartHeight + 24}" font-family="monospace" font-size="10" fill="#71717a">16:00</text>
  <text x="${width - 120}" y="${chartHeight + 24}" font-family="monospace" font-size="10" fill="#71717a">18:00</text>

  <!-- Bottom Details Footer -->
  <rect x="0" y="${chartHeight + 40}" width="${width}" height="${height - chartHeight - 40}" fill="#090a10" />
  <text x="24" y="${height - 35}" font-family="monospace" font-size="11" fill="#a1a1aa">Execution: <tspan fill="#fff">R:R ${cfg.rr}</tspan> · Realized: <tspan fill="${cfg.isWin ? '#10b981' : '#f43f5e'}" font-weight="bold">${cfg.pnl}</tspan></text>
  <text x="${width - 24}" y="${height - 35}" font-family="monospace" font-size="11" fill="#71717a" text-anchor="end">Vertex Journal Visual Screenshot</text>
</svg>
  `;
}

charts.forEach((c) => {
  const filePath = path.join(outputDir, c.fileName);
  const svg = generateSvg(c);
  fs.writeFileSync(filePath, svg.trim());
  console.log('Created:', c.fileName);
});

console.log('All 10 mock chart SVGs generated successfully!');
