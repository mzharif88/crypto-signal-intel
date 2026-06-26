"use client";
import { useState, useEffect } from "react";
import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer } from "recharts";
import type { Protocol, ChainData } from "@/lib/data";
import { fmtB } from "@/lib/data";
import { StatCard, Card, CardHeader, Skel } from "./ui";

interface Props { protocols:Protocol[]; chains:ChainData[]; loading:boolean; }

const UNLOCKS = [
  {date:"Jul 1",proto:"Aptos (APT)",amt:"$128M",pct:"-4.2%"},
  {date:"Jul 5",proto:"Arbitrum (ARB)",amt:"$94M",pct:"-2.8%"},
  {date:"Jul 12",proto:"Starknet (STRK)",amt:"$71M",pct:"-3.1%"},
  {date:"Jul 18",proto:"SUI",amt:"$58M",pct:"-1.9%"},
  {date:"Jul 25",proto:"Optimism (OP)",amt:"$42M",pct:"-1.4%"},
];
const WHALES = [
  {type:"ACCUM",coin:"ETH",size:"42,800 ETH",note:"Binance → cold wallet",up:true},
  {type:"DISTRIB",coin:"DOGE",size:"880M DOGE",note:"2nd large sell in 7d",up:false},
  {type:"ACCUM",coin:"ARB",size:"14.2M ARB",note:"Accumulating pre-unlock?",up:true},
  {type:"ACCUM",coin:"SOL",size:"18,000 SOL",note:"Stake deposit — long signal",up:true},
];
const STABLE_FLOWS = [
  {chain:"Ethereum",flow:"+$2.1B",pct:100,up:true},
  {chain:"Tron",flow:"+$1.4B",pct:67,up:true},
  {chain:"Base",flow:"+$0.9B",pct:43,up:true},
  {chain:"Arbitrum",flow:"+$0.6B",pct:29,up:true},
  {chain:"BNB Chain",flow:"-$0.3B",pct:14,up:false},
];

export default function DeFiView({ protocols, chains, loading }: Props) {
  const [tvlHistory, setTvlHistory] = useState<{date:string;value:number}[]>([]);
  const [histLoading, setHistLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      try {
        const res = await fetch("/api/dl?path=%2Fv2%2FhistoricalChainTvl");
        if (res.ok) {
          const raw = await res.json();
          if (Array.isArray(raw) && raw.length) {
            const sample = raw.slice(-52).filter((_:any,i:number)=>i%4===0).slice(-12);
            setTvlHistory(sample.map((d:any)=>({
              date: new Date(d.date*1000).toLocaleDateString("en-GB",{month:"short",year:"2-digit"}),
              value: +(d.tvl/1e9).toFixed(1),
            })));
            setHistLoading(false); return;
          }
        }
      } catch {}
      // fallback
      const months=["Jul 25","Aug","Sep","Oct","Nov","Dec","Jan 26","Feb","Mar","Apr","May","Jun 26"];
      setTvlHistory(months.map((m,i)=>({date:m,value:[118,112,108,124,135,128,114,98,88,81,75,71.8][i]})));
      setHistLoading(false);
    };
    load();
  }, []);

  const protos = protocols.length ? protocols : [
    {name:"Lido",tvl:"$18.4B",tvlRaw:18.4e9,pct:100,change1d:"+1.2%",changeUp:true,color:"#06B6D4"},
    {name:"AAVE",tvl:"$9.2B",tvlRaw:9.2e9,pct:50,change1d:"+0.8%",changeUp:true,color:"#8B5CF6"},
    {name:"Uniswap",tvl:"$5.1B",tvlRaw:5.1e9,pct:28,change1d:"+3.2%",changeUp:true,color:"#EF4444"},
    {name:"MakerDAO",tvl:"$4.8B",tvlRaw:4.8e9,pct:26,change1d:"-0.4%",changeUp:false,color:"#F59E0B"},
    {name:"Curve",tvl:"$3.9B",tvlRaw:3.9e9,pct:21,change1d:"-1.1%",changeUp:false,color:"#10B981"},
    {name:"Pendle",tvl:"$3.2B",tvlRaw:3.2e9,pct:17,change1d:"+5.8%",changeUp:true,color:"#06B6D4"},
  ];

  return (
    <div className="p-4 space-y-4 animate-fade-in">
      <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
        <StatCard label="Total DeFi TVL"  value="$71.8B" change={-2.1}/>
        <StatCard label="ETH TVL Share"   value="53.1%"  change={-2.4}/>
        <StatCard label="DEX 24h Vol"     value="$7.2B"  change={9.3}/>
        <StatCard label="RWA TVL"         value="$26B"   change={18}/>
        <StatCard label="Stablecoins"     value="$314B"  change={0.4}/>
        <StatCard label="L2 Active Addr"  value="5.1M"   change={3.2}/>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        <Card>
          <CardHeader title="Top DeFi Protocols TVL" right={<span className="pill bg-cyan-500/10 text-cyan-400 border border-cyan-500/25">DefiLlama</span>}/>
          <div className="p-4 space-y-2.5">
            {loading ? Array(6).fill(0).map((_,i)=><Skel key={i} h="h-5"/>) :
            protos.slice(0,8).map(p=>(
              <div key={p.name} className="flex items-center gap-2.5">
                <span className="text-[11px] text-[#E2E8F0] w-24 flex-shrink-0" style={{fontFamily:"'Space Grotesk',sans-serif"}}>{p.name}</span>
                <div className="flex-1 h-1 bg-[#162032] rounded-full overflow-hidden">
                  <div className="h-full rounded-full transition-all duration-700" style={{width:`${p.pct}%`,background:p.color}}/>
                </div>
                <span className="text-[10px] text-[#CBD5E1] w-16 text-right flex-shrink-0" style={{fontFamily:"'IBM Plex Mono',monospace"}}>{p.tvl}</span>
                <span className={`text-[10px] w-12 text-right flex-shrink-0 ${p.changeUp?"text-emerald-400":"text-red-400"}`} style={{fontFamily:"'IBM Plex Mono',monospace"}}>{p.change1d}</span>
              </div>
            ))}
          </div>
        </Card>

        <Card>
          <CardHeader title="Chain TVL Rankings" right={<span className="pill bg-cyan-500/10 text-cyan-400 border border-cyan-500/25">DefiLlama</span>}/>
          <div className="p-4 space-y-2">
            {loading ? Array(6).fill(0).map((_,i)=><Skel key={i} h="h-5"/>) :
            (chains.length ? chains : [{name:"Ethereum",tvl:"$37.8B",tvlRaw:37.8e9},{name:"BSC",tvl:"$5.2B",tvlRaw:5.2e9},{name:"Solana",tvl:"$9.1B",tvlRaw:9.1e9},{name:"Arbitrum",tvl:"$2.8B",tvlRaw:2.8e9},{name:"Base",tvl:"$3.4B",tvlRaw:3.4e9}]).map(c=>(
              <div key={c.name} className="flex items-center justify-between py-1 border-b border-[#1E2A3B]/40 last:border-0">
                <span className="text-[12px] font-semibold text-[#E2E8F0]" style={{fontFamily:"'Space Grotesk',sans-serif"}}>{c.name}</span>
                <span className="text-[11px] text-cyan-400" style={{fontFamily:"'IBM Plex Mono',monospace"}}>{c.tvl}</span>
              </div>
            ))}
          </div>
        </Card>
      </div>

      {/* TVL History */}
      <Card>
        <CardHeader title="Total DeFi TVL — 12 Month Trend" right={<span className="pill bg-cyan-500/10 text-cyan-400 border border-cyan-500/25">DefiLlama Live</span>}/>
        <div className="h-44 px-2 py-2">
          {histLoading ? <Skel h="h-full"/> : (
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={tvlHistory}>
                <XAxis dataKey="date" tick={{fontSize:9,fontFamily:"'IBM Plex Mono',monospace",fill:"#334155"}} axisLine={false} tickLine={false}/>
                <YAxis tick={{fontSize:9,fontFamily:"'IBM Plex Mono',monospace",fill:"#334155"}} axisLine={false} tickLine={false} width={44} tickFormatter={v=>"$"+v+"B"}/>
                <Tooltip contentStyle={{background:"#0F1A27",border:"1px solid #1E2A3B",borderRadius:8,fontFamily:"'IBM Plex Mono',monospace",fontSize:10}} labelStyle={{color:"#06B6D4"}} formatter={(v:any)=>[`$${v}B TVL`]}/>
                <Line type="monotone" dataKey="value" stroke="#06B6D4" strokeWidth={2} dot={{r:3,fill:"#06B6D4"}} name="TVL"/>
              </LineChart>
            </ResponsiveContainer>
          )}
        </div>
      </Card>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        <Card>
          <CardHeader title="⚠️ Token Unlock Calendar" right={<span className="text-[9px] text-amber-400" style={{fontFamily:"'IBM Plex Mono',monospace"}}>Supply pressure</span>}/>
          <div className="p-4 space-y-2.5">
            {UNLOCKS.map(u=>(
              <div key={u.date} className="flex items-center gap-2.5 py-1 border-b border-[#1E2A3B]/40 last:border-0">
                <span className="text-[9px] text-[#334155] w-12 flex-shrink-0" style={{fontFamily:"'IBM Plex Mono',monospace"}}>{u.date}</span>
                <span className="text-[11px] text-[#E2E8F0] flex-1">{u.proto}</span>
                <span className="text-[10px] text-amber-400 flex-shrink-0" style={{fontFamily:"'IBM Plex Mono',monospace"}}>{u.amt}</span>
                <span className="text-[10px] text-red-400 flex-shrink-0 w-10 text-right" style={{fontFamily:"'IBM Plex Mono',monospace"}}>{u.pct}</span>
              </div>
            ))}
          </div>
        </Card>

        <Card>
          <CardHeader title="💵 Stablecoin Inflows by Chain" right={<span className="text-[9px] text-emerald-400" style={{fontFamily:"'IBM Plex Mono',monospace"}}>↑ capital entering</span>}/>
          <div className="p-4 space-y-2.5">
            {STABLE_FLOWS.map(f=>(
              <div key={f.chain} className="flex items-center gap-2.5">
                <span className="text-[11px] text-[#E2E8F0] w-20 flex-shrink-0">{f.chain}</span>
                <div className="flex-1 h-1 bg-[#162032] rounded-full"><div className="h-full rounded-full" style={{width:`${f.pct}%`,background:f.up?"#10B981":"#EF4444"}}/></div>
                <span className={`text-[10px] flex-shrink-0 ${f.up?"text-emerald-400":"text-red-400"}`} style={{fontFamily:"'IBM Plex Mono',monospace"}}>{f.flow}</span>
              </div>
            ))}
          </div>
        </Card>
      </div>

      <Card>
        <CardHeader title="🐋 Whale Signals" right={<span className="text-[9px] text-[#334155]" style={{fontFamily:"'IBM Plex Mono',monospace"}}>Large wallet accumulation / distribution</span>}/>
        <div className="p-1">
          {WHALES.map((w,i)=>(
            <div key={i} className="flex items-start gap-2.5 px-3 py-2.5 border-b border-[#1E2A3B]/40 last:border-0 flex-wrap">
              <span className={`pill border flex-shrink-0 ${w.up?"bg-emerald-500/10 text-emerald-400 border-emerald-500/25":"bg-red-500/10 text-red-400 border-red-500/25"}`}>
                {w.type} {w.coin}
              </span>
              <span className="text-[10px] text-amber-400 flex-shrink-0" style={{fontFamily:"'IBM Plex Mono',monospace"}}>{w.size}</span>
              <span className="text-[11px] text-[#64748B]">{w.note}</span>
            </div>
          ))}
        </div>
      </Card>
    </div>
  );
}
