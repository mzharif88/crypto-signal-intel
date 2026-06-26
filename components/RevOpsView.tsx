"use client";
import { useMemo } from "react";
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell } from "recharts";
import type { Coin } from "@/lib/data";
import { fmtPrice, fmtPct } from "@/lib/data";
import { StatCard, Card, CardHeader, Signal, Skel } from "./ui";

interface Sector { name:string; p30:number; coins:number; }
interface Props { coins: Coin[]; sectors: Sector[]; loading: boolean; }

const TIERS = [
  { tier:"Demo",       calls:"10k/mo",  price:"Free",      use:"Exploration & prototyping",     hi:false },
  { tier:"Analyst",    calls:"500k/mo", price:"~$499/mo",  use:"Dashboards, alerts, backtesting",hi:true  },
  { tier:"Enterprise", calls:"Custom",  price:"Custom",     use:"12yr history · 5m data · WS",   hi:false },
];

export default function RevOpsView({ coins, sectors, loading }: Props) {
  const signals = useMemo(() => {
    if (!coins.length) return [];
    const sorted24 = [...coins].sort((a,b)=>b.change24h-a.change24h);
    const sorted7d  = [...coins].sort((a,b)=>a.change7d-b.change7d);
    const topGainer = sorted24[0];
    const aiCoin    = coins.find(c=>c.category==="AI/GPU")||coins[0];
    const hotPay    = coins.find(c=>c.change24h>3&&c.category==="Payments")||sorted24[1];
    const atRisk    = sorted7d[0];
    return [
      aiCoin   && { target:`${aiCoin.name} (${aiCoin.symbol})`,   type:"API Upsell", pri:"HIGH", trigger:`${aiCoin.category} sector · ${fmtPct(aiCoin.change7d)} 7d · Demo API near capacity`,           action:"Upsell",   ac:"cyan"   },
      topGainer&& { target:`${topGainer.name} (${topGainer.symbol})`,type:"API Upsell",pri:"HIGH", trigger:`Top 24h gainer ${fmtPct(topGainer.change24h)} · volume spike · momentum building`,          action:"Upsell",   ac:"cyan"   },
      hotPay   && { target:`${hotPay.name} Ecosystem`,             type:"Ads Target", pri:"MED",  trigger:`${fmtPct(hotPay.change24h)} 24h · ${hotPay.category} sector trending · RSI elevated`,       action:"Pitch Ad", ac:"green"  },
      atRisk   && { target:`${atRisk.name} (${atRisk.symbol})`,    type:"Churn Risk", pri:"LOW",  trigger:`Weakest 7d ${fmtPct(atRisk.change7d)} · ${atRisk.category} · API call decline risk`,       action:"Check In", ac:"red"    },
    ].filter(Boolean) as any[];
  }, [coins]);

  const chartData = useMemo(() => sectors.map(s => {
    const live = coins.filter(c=>c.category===s.name);
    const val = live.length ? +(live.reduce((a,c)=>a+c.change7d,0)/live.length).toFixed(1) : s.p30;
    return { name: s.name.replace(" / "," /\n"), val };
  }), [coins, sectors]);

  const priColor: Record<string,string> = {
    HIGH:"bg-red-500/15 text-red-400 border-red-500/30",
    MED: "bg-amber-500/15 text-amber-400 border-amber-500/30",
    LOW: "bg-purple-500/15 text-purple-400 border-purple-500/30",
  };
  const acColor: Record<string,string> = {
    cyan: "bg-cyan-500/10 text-cyan-400 border-cyan-500/25",
    green:"bg-emerald-500/10 text-emerald-400 border-emerald-500/25",
    red:  "bg-red-500/10 text-red-400 border-red-500/25",
  };

  return (
    <div className="p-4 space-y-4 animate-fade-in">
      {/* KPI row */}
      <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
        <StatCard label="API Upsell" value="2" accent="#06B6D4" sub="Demo → Analyst" />
        <StatCard label="Ads Targets" value="1" accent="#10B981" sub="Trending + momentum" />
        <StatCard label="Churn Risk" value="1" accent="#EF4444" sub="Declining volume" />
        <StatCard label="Sector Alerts" value="3" accent="#F59E0B" sub="RWA · AI · L2" />
        <StatCard label="Open Pipeline" value="$48K" change={12} />
        <StatCard label="At-Risk ARR" value="$6K" accent="#EF4444" sub="1 account" />
      </div>

      {/* Action Queue */}
      <Card>
        <CardHeader title="Action Queue" right={
          <span className="pill bg-cyan-500/10 text-cyan-400 border border-cyan-500/25">
            {loading ? "…" : signals.length} active
          </span>
        } />
        {loading ? (
          <div className="p-4 space-y-3">{[1,2,3].map(i=><Skel key={i} h="h-16"/>)}</div>
        ) : signals.map((s,i) => (
          <div key={i} className="px-4 py-3 border-b border-[#1E2A3B] last:border-0 hover:bg-[#0F1A27] transition-colors">
            <div className="flex items-start gap-2 flex-wrap mb-1.5">
              <span className="font-semibold text-[13px] text-[#E2E8F0]"
                style={{fontFamily:"'Space Grotesk',sans-serif"}}>{s.target}</span>
              <span className={`pill border ${acColor[s.ac]}`}>{s.type}</span>
              <span className={`pill border ${priColor[s.pri]}`}>{s.pri}</span>
            </div>
            <p className="text-[11px] text-[#64748B] mb-2" style={{fontFamily:"'IBM Plex Mono',monospace"}}>{s.trigger}</p>
            <button className="text-[10px] px-3 py-1 rounded-md bg-cyan-500/10 text-cyan-400 border border-cyan-500/25 hover:bg-cyan-500/20 transition-colors"
              style={{fontFamily:"'IBM Plex Mono',monospace"}}>→ {s.action}</button>
          </div>
        ))}
      </Card>

      {/* Sector momentum chart */}
      <Card>
        <CardHeader title="Sector Momentum — 7d %" right={
          <span className="text-[9px] text-[#334155]" style={{fontFamily:"'IBM Plex Mono',monospace"}}>Live where available</span>
        }/>
        <div className="p-4 h-52">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={chartData} margin={{top:4,right:4,bottom:24,left:0}}>
              <XAxis dataKey="name" tick={{fontSize:9,fontFamily:"'IBM Plex Mono',monospace",fill:"#64748B"}} axisLine={false} tickLine={false} interval={0} />
              <YAxis tick={{fontSize:9,fontFamily:"'IBM Plex Mono',monospace",fill:"#334155"}} axisLine={false} tickLine={false} tickFormatter={v=>v+"%"} width={32}/>
              <Tooltip
                contentStyle={{background:"#0F1A27",border:"1px solid #1E2A3B",borderRadius:8,fontFamily:"'IBM Plex Mono',monospace",fontSize:11}}
                labelStyle={{color:"#06B6D4"}} itemStyle={{color:"#CBD5E1"}}
                formatter={(v:any)=>[(v>=0?"+":"")+Number(v).toFixed(1)+"%","7d"]} />
              <Bar dataKey="val" radius={[4,4,0,0]}>
                {chartData.map((d,i)=><Cell key={i} fill={d.val>=0?"rgba(16,185,129,0.7)":"rgba(239,68,68,0.7)"} />)}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>
      </Card>

      {/* API Tiers */}
      <Card>
        <CardHeader title="CoinGecko API Tiers" />
        <div className="p-4 grid grid-cols-1 sm:grid-cols-3 gap-3">
          {TIERS.map((t,i)=>(
            <div key={i} className={`rounded-lg p-3 border ${t.hi?"border-cyan-500/40 bg-cyan-500/5 shadow-[0_0_16px_rgba(6,182,212,0.08)]":"border-[#1E2A3B] bg-[#0A0E17]"}`}>
              <div className="text-[9px] text-cyan-400 uppercase tracking-[0.1em] mb-2" style={{fontFamily:"'IBM Plex Mono',monospace"}}>{t.tier}</div>
              <div className="text-lg font-bold text-[#E2E8F0] mb-1" style={{fontFamily:"'Space Grotesk',sans-serif"}}>{t.calls}</div>
              <div className="text-[11px] text-emerald-400 mb-1.5" style={{fontFamily:"'IBM Plex Mono',monospace"}}>{t.price}</div>
              <div className="text-[10px] text-[#64748B]">{t.use}</div>
            </div>
          ))}
        </div>
        <div className="px-4 pb-4 text-[10px] text-[#334155] leading-relaxed" style={{fontFamily:"'IBM Plex Mono',monospace"}}>
          <span className="text-cyan-400">Upsell trigger:</span> Demo → Analyst at ≥9k calls/mo (90% quota) AND sector momentum positive. Enterprise conversion at sustained &gt;400k/mo calls or 5m granularity need.
        </div>
      </Card>
    </div>
  );
}
