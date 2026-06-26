// ── Types ──────────────────────────────────────────────────────
export interface Coin {
  id: string;
  name: string;
  symbol: string;
  icon: string;
  rank: number;
  price: number;
  change24h: number;
  change7d: number;
  marketCap: number;  // $B
  volume24h: number;  // $B
  signals: string[];
  category: string;
}

export interface GlobalData {
  totalMarketCap: string;
  marketCapChange24h: number;
  btcDominance: string;
  totalVolume24h: string;
  activeCryptocurrencies: number;
}

export interface TrendingCoin {
  id: string;
  name: string;
  symbol: string;
  thumb: string;
  rank: number;
  price: number;
  change24h: number;
}

export interface Protocol {
  name: string;
  tvl: string;
  tvlRaw: number;
  pct: number;
  change1d: string;
  changeUp: boolean;
  color: string;
}

export interface ChainData {
  name: string;
  tvl: string;
  tvlRaw: number;
}

export interface HistoricalPoint {
  date: string;
  value: number;
}

// ── Coin metadata (id → category + icon) ────────────────────────
export const COIN_META: Record<string, { cat: string; icon: string }> = {
  bitcoin:         { cat: "Layer 1",    icon: "₿"  },
  ethereum:        { cat: "Layer 1",    icon: "Ξ"  },
  tether:          { cat: "Stablecoin", icon: "T"  },
  solana:          { cat: "Layer 1",    icon: "◎"  },
  binancecoin:     { cat: "Exchange",   icon: "B"  },
  ripple:          { cat: "Payments",   icon: "X"  },
  "usd-coin":      { cat: "Stablecoin", icon: "$"  },
  dogecoin:        { cat: "Meme",       icon: "Ð"  },
  cardano:         { cat: "Layer 1",    icon: "A"  },
  avalanche:       { cat: "Layer 1",    icon: "△"  },
  chainlink:       { cat: "Oracle",     icon: "⬡"  },
  "matic-network": { cat: "Layer 2",    icon: "⬟"  },
  arbitrum:        { cat: "Layer 2",    icon: "Ⓐ"  },
  optimism:        { cat: "Layer 2",    icon: "🔴" },
  render:          { cat: "AI/GPU",     icon: "R"  },
};

export const TOP15_IDS = Object.keys(COIN_META).join(",");

// ── Format helpers ───────────────────────────────────────────────
export const fmtPrice = (p: number): string => {
  if (p >= 1000)  return "$" + p.toLocaleString(undefined, { maximumFractionDigits: 0 });
  if (p >= 1)     return "$" + p.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 });
  if (p >= 0.01)  return "$" + p.toFixed(4);
  return "$" + p.toFixed(8);
};

export const fmtB = (v: number): string => {
  if (v >= 1e12) return "$" + (v / 1e12).toFixed(2) + "T";
  if (v >= 1e9)  return "$" + (v / 1e9).toFixed(1) + "B";
  return "$" + (v / 1e6).toFixed(0) + "M";
};

export const fmtPct = (v: number | null | undefined): string => {
  if (v == null) return "—";
  return (v >= 0 ? "+" : "") + v.toFixed(2) + "%";
};

// ── Signal computation from live price data ──────────────────────
export function computeSignals(change24h: number, change7d: number, cat: string): string[] {
  const sigs: string[] = [];
  if (change7d > 12)                      sigs.push("Golden Cross");
  if (change7d < -10)                     sigs.push("Death Cross");
  if (change24h > 4)                      sigs.push("MACD Bull");
  if (change24h > 5)                      sigs.push("Vol Spike");
  if (change24h < -3)                     sigs.push("MACD Bear");
  if (cat === "Layer 2")                  sigs.push("L2 Rising");
  if (cat === "Oracle")                   sigs.push("RWA Play");
  if (cat === "AI/GPU")                   sigs.push("AI Hot");
  if (Math.abs(change24h) < 0.5)         sigs.push("Consolidating");
  return sigs;
}

// ── Sectors (static — 7d % overlaid with live data where available) ──
export const SECTORS = [
  { name: "Layer 1",    p30: 8.4,  coins: 12,  tvl: null,      color: "#06B6D4" },
  { name: "Layer 2",    p30: 11.2, coins: 24,  tvl: "$22B",    color: "#8B5CF6" },
  { name: "DeFi",       p30: -3.8, coins: 89,  tvl: "$71.8B",  color: "#10B981" },
  { name: "AI / GPU",   p30: 19.4, coins: 34,  tvl: null,      color: "#F59E0B" },
  { name: "RWA",        p30: 22.1, coins: 18,  tvl: "$26B",    color: "#06B6D4" },
  { name: "Stablecoins",p30: 0.2,  coins: 22,  tvl: null,      color: "#64748B" },
  { name: "Meme",       p30: -8.2, coins: 156, tvl: null,      color: "#EF4444" },
  { name: "GameFi",     p30: 4.7,  coins: 67,  tvl: null,      color: "#8B5CF6" },
  { name: "Oracle",     p30: 6.3,  coins: 8,   tvl: null,      color: "#10B981" },
  { name: "Exchange",   p30: 2.1,  coins: 15,  tvl: null,      color: "#06B6D4" },
  { name: "Payments",   p30: 12.6, coins: 19,  tvl: null,      color: "#F59E0B" },
  { name: "Privacy",    p30: -1.4, coins: 12,  tvl: null,      color: "#64748B" },
];

// ── Math utils for charting ───────────────────────────────────────
export function calcMA(data: number[], n: number): (number | null)[] {
  return data.map((_, i) => {
    if (i < n - 1) return null;
    const slice = data.slice(i - n + 1, i + 1);
    return +(slice.reduce((a, b) => a + b, 0) / n).toFixed(6);
  });
}

export function calcEMA(data: (number | null)[], n: number): (number | null)[] {
  const k = 2 / (n + 1);
  const e: (number | null)[] = new Array(data.length).fill(null);
  let start = data.findIndex(v => v !== null);
  if (start < 0) return e;
  e[start] = data[start];
  for (let i = start + 1; i < data.length; i++) {
    if (data[i] === null) { e[i] = e[i - 1]; continue; }
    e[i] = +((data[i] as number) * k + (e[i - 1] as number) * (1 - k)).toFixed(6);
  }
  return e;
}

export function calcRSI(data: number[], n = 14): (number | null)[] {
  const r: (number | null)[] = new Array(data.length).fill(null);
  for (let i = n; i < data.length; i++) {
    const changes = data.slice(i - n, i).map((v, j, a) => j === 0 ? 0 : v - a[j - 1]);
    const gains = changes.filter(c => c > 0).reduce((a, b) => a + b, 0) / n;
    const losses = Math.abs(changes.filter(c => c < 0).reduce((a, b) => a + b, 0)) / n;
    const rs = losses === 0 ? 100 : gains / losses;
    r[i] = +(100 - 100 / (1 + rs)).toFixed(2);
  }
  return r;
}

export function calcMACD(data: number[]): { line: (number|null)[]; signal: (number|null)[]; hist: (number|null)[] } {
  const e12 = calcEMA(data, 12);
  const e26 = calcEMA(data, 26);
  const line = data.map((_, i) => e12[i] != null && e26[i] != null ? +((e12[i] as number) - (e26[i] as number)).toFixed(6) : null);
  const signal = calcEMA(line, 9);
  const hist = line.map((v, i) => v != null && signal[i] != null ? +(v - (signal[i] as number)).toFixed(6) : null);
  return { line, signal, hist };
}

export function calcBollinger(data: number[], n = 20, sd = 2): { upper: (number|null)[]; lower: (number|null)[] } {
  const upper: (number|null)[] = [], lower: (number|null)[] = [];
  for (let i = 0; i < data.length; i++) {
    if (i < n - 1) { upper.push(null); lower.push(null); continue; }
    const sl = data.slice(i - n + 1, i + 1);
    const mean = sl.reduce((a, b) => a + b, 0) / n;
    const s = Math.sqrt(sl.reduce((a, b) => a + Math.pow(b - mean, 2), 0) / n);
    upper.push(+(mean + sd * s).toFixed(6));
    lower.push(+(mean - sd * s).toFixed(6));
  }
  return { upper, lower };
}

export function genForecast(data: number[], n = 14): number[] {
  const last = data[data.length - 1];
  const trend = (last - data[Math.max(0, data.length - 8)]) / 7;
  return Array.from({ length: n }, (_, i) =>
    +(last + trend * (i + 1) * (1 + (Math.random() - 0.5) * 0.3)).toFixed(last > 100 ? 2 : 6)
  );
}

export function genFallbackPrices(base: number, days: number, up: boolean): number[] {
  let p = base * (1 - days * 0.0003 * (up ? -1 : 1));
  return Array.from({ length: days }, () => {
    p *= 1 + (Math.random() - 0.47) * 0.025 + (up ? 0.0003 : -0.0003);
    return +(p.toFixed(base > 100 ? 2 : 6));
  });
}

export function genDateLabels(days: number): string[] {
  const now = new Date();
  return Array.from({ length: days }, (_, i) => {
    const d = new Date(now);
    d.setDate(d.getDate() - (days - 1 - i));
    return d.toLocaleDateString("en-GB", { day: "numeric", month: "short" });
  });
}
