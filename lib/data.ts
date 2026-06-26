// ── Types ──────────────────────────────────────────────────────
export interface Coin {
  id: string; name: string; symbol: string; icon: string; rank: number;
  price: number; change24h: number; change7d: number;
  marketCap: number; volume24h: number; signals: string[]; category: string;
}
export interface GlobalData {
  totalMarketCap: string; marketCapChange24h: number; btcDominance: string;
  totalVolume24h: string; activeCryptocurrencies: number;
}
export interface TrendingCoin {
  id: string; name: string; symbol: string; thumb: string;
  rank: number; price: number; change24h: number;
}
export interface Protocol {
  name: string; tvl: string; tvlRaw: number; pct: number;
  change1d: string; changeUp: boolean; color: string;
}
export interface ChainData { name: string; tvl: string; tvlRaw: number; }

export type TabId = "revops" | "overview" | "token" | "radar" | "sector" | "defi";

// ── Coin metadata ────────────────────────────────────────────────
export const COIN_META: Record<string, { cat: string; icon: string }> = {
  bitcoin:          { cat: "Layer 1",    icon: "₿"  },
  ethereum:         { cat: "Layer 1",    icon: "Ξ"  },
  tether:           { cat: "Stablecoin", icon: "T"  },
  solana:           { cat: "Layer 1",    icon: "◎"  },
  binancecoin:      { cat: "Exchange",   icon: "B"  },
  ripple:           { cat: "Payments",   icon: "X"  },
  "usd-coin":       { cat: "Stablecoin", icon: "$"  },
  dogecoin:         { cat: "Meme",       icon: "Ð"  },
  cardano:          { cat: "Layer 1",    icon: "A"  },
  avalanche:        { cat: "Layer 1",    icon: "△"  },
  chainlink:        { cat: "Oracle",     icon: "⬡"  },
  "matic-network":  { cat: "Layer 2",    icon: "⬟"  },
  arbitrum:         { cat: "Layer 2",    icon: "Ⓐ"  },
  optimism:         { cat: "Layer 2",    icon: "🔴" },
  render:           { cat: "AI/GPU",     icon: "R"  },
};
export const TOP15_IDS = Object.keys(COIN_META).join(",");

// ── Format helpers ───────────────────────────────────────────────
export const fmtPrice = (p: number): string => {
  if (!p || !isFinite(p)) return "$—";
  if (p >= 1000) return "$" + p.toLocaleString(undefined, { maximumFractionDigits: 0 });
  if (p >= 1)    return "$" + p.toFixed(2);
  if (p >= 0.01) return "$" + p.toFixed(4);
  return "$" + p.toFixed(8);
};
export const fmtB = (v: number): string => {
  if (!v || !isFinite(v)) return "$—";
  if (v >= 1e12) return "$" + (v / 1e12).toFixed(2) + "T";
  if (v >= 1e9)  return "$" + (v / 1e9).toFixed(1) + "B";
  return "$" + (v / 1e6).toFixed(0) + "M";
};
export const fmtPct = (v: number | null | undefined): string => {
  if (v == null || !isFinite(v)) return "—";
  return (v >= 0 ? "+" : "") + v.toFixed(2) + "%";
};

// ── Signal computation ───────────────────────────────────────────
export function computeSignals(c24: number, c7: number, cat: string): string[] {
  const s: string[] = [];
  if (c7 > 12)              s.push("Golden Cross");
  if (c7 < -10)             s.push("Death Cross");
  if (c24 > 4)              s.push("MACD Bull");
  if (c24 > 5)              s.push("Vol Spike");
  if (c24 < -3)             s.push("MACD Bear");
  if (cat === "Layer 2")    s.push("L2 Rising");
  if (cat === "Oracle")     s.push("RWA Play");
  if (cat === "AI/GPU")     s.push("AI Hot");
  return s;
}

// ── Sectors ──────────────────────────────────────────────────────
export const SECTORS = [
  { name:"Layer 1",    p30: 8.4,  coins:12,  tvl:null,     color:"#06B6D4" },
  { name:"Layer 2",    p30:11.2,  coins:24,  tvl:"$22B",   color:"#8B5CF6" },
  { name:"DeFi",       p30:-3.8,  coins:89,  tvl:"$71.8B", color:"#10B981" },
  { name:"AI / GPU",   p30:19.4,  coins:34,  tvl:null,     color:"#F59E0B" },
  { name:"RWA",        p30:22.1,  coins:18,  tvl:"$26B",   color:"#06B6D4" },
  { name:"Stablecoins",p30: 0.2,  coins:22,  tvl:null,     color:"#64748B" },
  { name:"Meme",       p30:-8.2,  coins:156, tvl:null,     color:"#EF4444" },
  { name:"GameFi",     p30: 4.7,  coins:67,  tvl:null,     color:"#8B5CF6" },
  { name:"Oracle",     p30: 6.3,  coins:8,   tvl:null,     color:"#10B981" },
  { name:"Exchange",   p30: 2.1,  coins:15,  tvl:null,     color:"#06B6D4" },
  { name:"Payments",   p30:12.6,  coins:19,  tvl:null,     color:"#F59E0B" },
  { name:"Privacy",    p30:-1.4,  coins:12,  tvl:null,     color:"#64748B" },
];

// ── Safe array guard ─────────────────────────────────────────────
const safeArr = (d: any[]): number[] =>
  Array.isArray(d) ? d.filter(v => typeof v === "number" && isFinite(v)) : [];

// ── Chart math ───────────────────────────────────────────────────
export function calcMA(data: number[], n: number): (number | null)[] {
  const d = safeArr(data);
  if (d.length === 0 || n <= 0) return [];
  return d.map((_, i) => {
    if (i < n - 1) return null;
    const slice = d.slice(i - n + 1, i + 1);
    return +(slice.reduce((a, b) => a + b, 0) / n).toFixed(6);
  });
}

export function calcEMA(data: (number | null)[], n: number): (number | null)[] {
  if (!data.length || n <= 0) return [];
  const k = 2 / (n + 1);
  const e: (number | null)[] = new Array(data.length).fill(null);
  let start = data.findIndex(v => v != null && isFinite(v as number));
  if (start < 0) return e;
  e[start] = data[start];
  for (let i = start + 1; i < data.length; i++) {
    const v = data[i];
    if (v == null || !isFinite(v)) { e[i] = e[i - 1]; continue; }
    e[i] = +(v * k + (e[i - 1] as number) * (1 - k)).toFixed(6);
  }
  return e;
}

export function calcRSI(data: number[], n = 14): (number | null)[] {
  const d = safeArr(data);
  if (d.length < n + 1) return new Array(d.length).fill(null);
  const r: (number | null)[] = new Array(d.length).fill(null);
  for (let i = n; i < d.length; i++) {
    const changes = d.slice(i - n, i).map((v, j, a) => j === 0 ? 0 : v - a[j - 1]);
    const gains = changes.filter(c => c > 0).reduce((a, b) => a + b, 0) / n;
    const losses = Math.abs(changes.filter(c => c < 0).reduce((a, b) => a + b, 0)) / n;
    const rs = losses === 0 ? 100 : gains / losses;
    r[i] = +(100 - 100 / (1 + rs)).toFixed(2);
  }
  return r;
}

export function calcMACD(data: number[]): { line: (number|null)[]; signal: (number|null)[]; hist: (number|null)[] } {
  const d = safeArr(data);
  if (d.length < 27) return { line: new Array(d.length).fill(null), signal: new Array(d.length).fill(null), hist: new Array(d.length).fill(null) };
  const e12 = calcEMA(d, 12);
  const e26 = calcEMA(d, 26);
  const line = d.map((_, i) => e12[i] != null && e26[i] != null ? +((e12[i] as number) - (e26[i] as number)).toFixed(6) : null);
  const signal = calcEMA(line, 9);
  const hist = line.map((v, i) => v != null && signal[i] != null ? +(v - (signal[i] as number)).toFixed(6) : null);
  return { line, signal, hist };
}

export function calcBollinger(data: number[], n = 20, sd = 2): { upper: (number|null)[]; lower: (number|null)[] } {
  const d = safeArr(data);
  if (d.length < n) return { upper: new Array(d.length).fill(null), lower: new Array(d.length).fill(null) };
  const upper: (number|null)[] = [];
  const lower: (number|null)[] = [];
  for (let i = 0; i < d.length; i++) {
    if (i < n - 1) { upper.push(null); lower.push(null); continue; }
    const sl = d.slice(i - n + 1, i + 1);
    const mean = sl.reduce((a, b) => a + b, 0) / n;
    const s = Math.sqrt(sl.reduce((a, b) => a + Math.pow(b - mean, 2), 0) / n);
    upper.push(+(mean + sd * s).toFixed(6));
    lower.push(+(mean - sd * s).toFixed(6));
  }
  return { upper, lower };
}

export function genForecast(data: number[], n = 14): number[] {
  const d = safeArr(data);
  if (d.length < 2 || n <= 0) return Array(Math.max(0, n)).fill(0);
  const last = d[d.length - 1];
  const prev = d[Math.max(0, d.length - 8)];
  const trend = isFinite(last - prev) ? (last - prev) / Math.max(1, Math.min(7, d.length - 1)) : 0;
  return Array.from({ length: n }, (_, i) =>
    +(last + trend * (i + 1) * (1 + (Math.random() - 0.5) * 0.3)).toFixed(last > 100 ? 2 : 6)
  );
}

export function genFallbackPrices(base: number, days: number, up: boolean): number[] {
  const safeBase = (base > 0 && isFinite(base)) ? base : 100;
  const safeDays = (days > 0 && isFinite(days) && days < 10000) ? days : 90;
  let p = safeBase * (1 - safeDays * 0.0003 * (up ? -1 : 1));
  return Array.from({ length: safeDays }, () => {
    p *= 1 + (Math.random() - 0.47) * 0.025 + (up ? 0.0003 : -0.0003);
    return +(p.toFixed(safeBase > 100 ? 2 : 6));
  });
}

export function genDateLabels(days: number): string[] {
  const safeDays = (days > 0 && isFinite(days) && days < 10000) ? Math.floor(days) : 90;
  const now = new Date();
  return Array.from({ length: safeDays }, (_, i) => {
    const d = new Date(now);
    d.setDate(d.getDate() - (safeDays - 1 - i));
    return d.toLocaleDateString("en-GB", { day: "numeric", month: "short" });
  });
}
