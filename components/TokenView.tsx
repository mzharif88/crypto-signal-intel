"use client";
import { useState, useEffect, useCallback } from "react";
import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer, ReferenceLine, BarChart, Bar, Cell } from "recharts";
import type { Coin } from "@/lib/data";
import { fmtPrice, calcMA, calcRSI, calcMACD, calcBollinger, genForecast, genFallbackPrices, genDateLabels } from "@/lib/data";
import { StatCard, Card, CardHeader, Signal, Skel } from "./ui";

interface Props { coin: Coin | null; loading: boolean; }
const RANGES = ["7d","30d","90d","180d","1y"] as const;
type Range = typeof RANGES[number];
const RANGE_DAYS: Record<Range, number> = { "7d":7,"30d":30,"90d":90,"180d":180,"1y":365 };

const CHART_OPTS = {
  tooltip: { backgroundColor:"#0F1A27", border:"1px solid #1E2A3B", borderRadius:8, fontFamily:"'IBM Plex Mono',monospace", fontSize:11 },
  axis: { fill:"#334155", fontFamily:"'IBM Plex Mono',monospace", fontSize:9 },
};

export default function TokenView({ coin, loading }: Props) {
  const [range, setRange] = useState<Range>("90d");
  const [inds, setInds] = useState({ ma20:true, ma50:true, ma200:false, bb:true, fc:true });
  const [prices, setPrices] = useState<number[]>([]);
  const [labels, setLabels] = useState<string[]>([]);
  const [chartLoading, setChartLoading] = useState(false);

  const loadChart = useCallback(async (c: Coin, r: Range) => {
    setChartLoading(true);
    const days = RANGE_DAYS[r];
    try {
      const res = await fetch(`/api/cg?path=%2Fcoins%2F${c.id}%2Fmarket_chart&vs_currency=usd&days=${days}&interval=${days <= 30 ? "hourly" : "daily"}`);
      if (res.ok) {
        const data = await res.json();
        if (Array.isArray(data.prices) && data.prices.length > 1) {
          const raw: number[][] = data.prices;
          const step = Math.max(1, Math.floor(raw.length / 120));
          const sampled = raw.filter((_, i) => i % step === 0).map(p => p[1] || 0).filter(v => isFinite(v) && v > 0);
          if (sampled.length > 1) {
            setPrices(sampled);
            setLabels(genDateLabels(sampled.length));
            setChartLoading(false);
            return;
          }
        }
      }
    } catch {}
    // Fallback to generated prices
    const fb = genFallbackPrices(c.price || 100, days, c.change7d >= 0);
    setPrices(fb);
    setLabels(genDateLabels(fb.length));
    setChartLoading(false);
  }, []);

  useEffect(() => {
    if (coin) loadChart(coin, range);
  }, [coin, range, loadChart]);

  if (!coin) return (
    <div className="flex items-center justify-center h-48 text-[#334155] text-sm font-mono">
      Select a coin from Overview or Radar
    </div>
  );

  // Guard: don't compute charts until we have prices
  const hasPrices = prices.length > 1;

  const ma20   = hasPrices ? calcMA(prices, 20)  : [];
  const ma50   = hasPrices ? calcMA(prices, 50)  : [];
  const ma200  = hasPrices ? calcMA(prices, 200) : [];
  const { upper: bbU, lower: bbL } = hasPrices ? calcBollinger(prices) : { upper: [], lower: [] };
  const rsi    = hasPrices ? calcRSI(prices)    : [];
  const { line: macdLine, signal: macdSig, hist: macdHist } = hasPrices ? calcMACD(prices) : { line: [], signal: [], hist: [] };
  const forecast = hasPrices ? genForecast(prices, 14) : [];

  const fcLabels = Array.from({ length: 14 }, (_, i) => {
    const d = new Date(); d.setDate(d.getDate() + i + 1);
    return d.toLocaleDateString("en-GB", { day: "numeric", month: "short" });
  });

  const allLabels = [...labels, ...fcLabels];
  const pricesPad = [...prices, ...Array(14).fill(null)];
  const fcPad = hasPrices
    ? [...Array(Math.max(0, prices.length - 1)).fill(null), prices[prices.length - 1], ...forecast]
    : [];

  const chartData = allLabels.map((date, i) => ({
    date,
    price:    pricesPad[i] ?? null,
    ma20:     i < prices.length ? (ma20[i]  ?? null) : null,
    ma50:     i < prices.length ? (ma50[i]  ?? null) : null,
    ma200:    i < prices.length ? (ma200[i] ?? null) : null,
    bbU:      i < prices.length ? (bbU[i]   ?? null) : null,
    bbL:      i < prices.length ? (bbL[i]   ?? null) : null,
    forecast: fcPad[i] ?? null,
  }));

  const rsiData  = labels.map((date, i) => ({ date, rsi:  rsi[i]      ?? null }));
  const macdData = labels.map((date, i) => ({ date, line: macdLine[i] ?? null, sig: macdSig[i] ?? null, hist: macdHist[i] ?? null }));

  return (
    <div className="p-4 space-y-4 animate-fade-in">
      {/* Header */}
      <div className="flex items-center gap-3 flex-wrap">
        <div className="w-10 h-10 rounded-full bg-[#162032] border border-[#1E2A3B] flex items-center justify-center text-lg flex-shrink-0">
          {coin.icon}
        </div>
        <div className="flex-1 min-w-0">
          <h1 className="text-xl font-bold text-[#E2E8F0] truncate" style={{ fontFamily:"'Space Grotesk',sans-serif" }}>{coin.name}</h1>
          <p className="text-[10px] text-[#334155]" style={{ fontFamily:"'IBM Plex Mono',monospace" }}>{coin.symbol} · #{coin.rank} · {coin.category}</p>
        </div>
        <div className="text-right flex-shrink-0">
          <div className="text-2xl font-bold" style={{ fontFamily:"'Space Grotesk',sans-serif" }}>{fmtPrice(coin.price)}</div>
          <div className={`text-[12px] ${coin.change24h >= 0 ? "text-emerald-400" : "text-red-400"}`} style={{ fontFamily:"'IBM Plex Mono',monospace" }}>
            {coin.change24h >= 0 ? "▲" : "▼"} {Math.abs(coin.change24h).toFixed(2)}% (24h)
          </div>
        </div>
      </div>

      {/* Signals */}
      {coin.signals.length > 0 && (
        <div className="flex gap-1.5 flex-wrap">
          {coin.signals.map(s => <Signal key={s} label={s} />)}
        </div>
      )}

      {/* Range + indicator toggles */}
      <div className="flex flex-wrap gap-1.5">
        {RANGES.map(r => (
          <button key={r} onClick={() => setRange(r)}
            className={`px-2.5 py-1 rounded-md text-[10px] font-medium transition-colors ${range === r ? "bg-cyan-500/15 text-cyan-400 border border-cyan-500/30" : "text-[#64748B] border border-[#1E2A3B] hover:border-[#253549]"}`}
            style={{ fontFamily:"'IBM Plex Mono',monospace" }}>{r.toUpperCase()}</button>
        ))}
        <div className="w-px bg-[#1E2A3B] mx-1" />
        {(["ma20","ma50","ma200","bb","fc"] as const).map(k => (
          <button key={k} onClick={() => setInds(p => ({ ...p, [k]: !p[k] }))}
            className={`px-2.5 py-1 rounded-md text-[10px] font-medium transition-colors ${inds[k] ? "bg-[#162032] text-[#E2E8F0] border border-[#253549]" : "text-[#334155] border border-[#1E2A3B]"}`}
            style={{ fontFamily:"'IBM Plex Mono',monospace" }}>
            {k === "fc" ? "Forecast" : k === "bb" ? "Bollinger" : k.toUpperCase()}
          </button>
        ))}
      </div>

      {/* Price chart */}
      <Card>
        <CardHeader title={`${coin.symbol} · Price & Indicators`}
          right={<span className="text-[9px] text-purple-400" style={{ fontFamily:"'IBM Plex Mono',monospace" }}>◈ Projected (EMA)</span>} />
        <div className="overflow-x-auto" style={{ WebkitOverflowScrolling: "touch" }}>
          <div style={{ minWidth: 680, height: 220 }} className="px-2 pt-2 pb-1">
            {chartLoading || !hasPrices
              ? <div className="h-full flex items-center justify-center"><Skel h="h-full" /></div>
              : (
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={chartData} margin={{ top:4, right:8, bottom:4, left:0 }}>
                    <XAxis dataKey="date" tick={{ ...CHART_OPTS.axis }} axisLine={false} tickLine={false} interval={Math.floor(chartData.length / 8)} />
                    <YAxis tick={{ ...CHART_OPTS.axis }} axisLine={false} tickLine={false} width={62} tickFormatter={v => v ? fmtPrice(Number(v)) : ""} domain={["auto","auto"]} />
                    <Tooltip contentStyle={CHART_OPTS.tooltip} labelStyle={{ color:"#06B6D4" }} itemStyle={{ color:"#CBD5E1" }}
                      formatter={(v: any) => v != null ? [fmtPrice(Number(v))] : [null]} />
                    <Line type="monotone" dataKey="price"    stroke="#06B6D4" strokeWidth={1.5} dot={false} connectNulls={false} name="Price" />
                    {inds.ma20  && <Line type="monotone" dataKey="ma20"     stroke="rgba(16,185,129,.7)"  strokeWidth={1} dot={false} name="MA20" />}
                    {inds.ma50  && <Line type="monotone" dataKey="ma50"     stroke="rgba(245,158,11,.7)"  strokeWidth={1} dot={false} name="MA50" />}
                    {inds.ma200 && <Line type="monotone" dataKey="ma200"    stroke="rgba(239,68,68,.5)"   strokeWidth={1} dot={false} name="MA200" />}
                    {inds.bb    && <Line type="monotone" dataKey="bbU"      stroke="rgba(139,92,246,.4)"  strokeWidth={1} dot={false} strokeDasharray="3 3" name="BB↑" />}
                    {inds.bb    && <Line type="monotone" dataKey="bbL"      stroke="rgba(139,92,246,.4)"  strokeWidth={1} dot={false} strokeDasharray="3 3" name="BB↓" />}
                    {inds.fc    && <Line type="monotone" dataKey="forecast" stroke="rgba(139,92,246,.8)"  strokeWidth={1.5} dot={false} strokeDasharray="5 4" name="Projected" />}
                  </LineChart>
                </ResponsiveContainer>
              )}
          </div>
        </div>
      </Card>

      {/* RSI + MACD */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        <Card>
          <CardHeader title="RSI (14)" />
          <div style={{ height: 96 }} className="px-2 py-1">
            {!hasPrices ? <Skel h="h-full" /> : (
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={rsiData}>
                  <XAxis dataKey="date" hide />
                  <YAxis domain={[0,100]} tick={{ ...CHART_OPTS.axis }} axisLine={false} tickLine={false} width={24} />
                  <Tooltip contentStyle={CHART_OPTS.tooltip} labelStyle={{ color:"#8B5CF6" }} />
                  <ReferenceLine y={70} stroke="rgba(245,158,11,.3)" strokeDasharray="3 3" />
                  <ReferenceLine y={30} stroke="rgba(245,158,11,.3)" strokeDasharray="3 3" />
                  <Line type="monotone" dataKey="rsi" stroke="#8B5CF6" strokeWidth={1.5} dot={false} connectNulls={false} />
                </LineChart>
              </ResponsiveContainer>
            )}
          </div>
        </Card>
        <Card>
          <CardHeader title="MACD (12/26/9)" />
          <div style={{ height: 96 }} className="px-2 py-1">
            {!hasPrices ? <Skel h="h-full" /> : (
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={macdData} margin={{ top:2, right:2, bottom:2, left:0 }}>
                  <XAxis dataKey="date" hide />
                  <YAxis tick={{ ...CHART_OPTS.axis }} axisLine={false} tickLine={false} width={32} />
                  <Tooltip contentStyle={CHART_OPTS.tooltip} labelStyle={{ color:"#06B6D4" }} />
                  <Bar dataKey="hist" name="Hist" radius={[2,2,0,0]}>
                    {macdData.map((d, i) => <Cell key={i} fill={d.hist != null && d.hist >= 0 ? "rgba(16,185,129,.6)" : "rgba(239,68,68,.6)"} />)}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            )}
          </div>
        </Card>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <StatCard label="Market Cap"  value={`$${coin.marketCap}B`} />
        <StatCard label="24h Volume"  value={`$${coin.volume24h}B`} />
        <StatCard label="7d Change"   value={`${Math.abs(coin.change7d).toFixed(1)}%`} change={coin.change7d} />
        <StatCard label="Sector"      value={coin.category} accent="#06B6D4" />
      </div>
    </div>
  );
}
