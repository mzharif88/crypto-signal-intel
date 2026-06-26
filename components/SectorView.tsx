"use client";
import { useState } from "react";
import type { Coin } from "@/lib/data";
import { fmtPrice } from "@/lib/data";
import { Card, CardHeader, Skel } from "./ui";

interface Sector { name:string; p30:number; coins:number; tvl:string|null; color:string; }
interface Props { coins:Coin[]; sectors:Sector[]; loading:boolean; onCoinClick:(c:Coin)=>void; }

// Mock coin generator per sector
const SECTOR_MOCK: Record<string,{icons:string[];bases:number[];names:string[]}> = {
  "Layer 1":    {icons:["◆","▲","●","■","★"],bases:[0.8,2.4,18,0.04,120],names:["Aptos","Sui","TON","NEAR","Celestia","Cosmos","Algorand","Flow","SEI"]},
  "Layer 2":    {icons:["Ⓛ","②","Ⓩ","Ⓢ","Ⓑ"],bases:[0.62,1.12,0.18,0.44,2.1],names:["zkSync","Starknet","Linea","Scroll","Mantle","Blast","Taiko","Manta","Mode"]},
  "DeFi":       {icons:["⬢","⬡","◈","⬟","◇"],bases:[12,0.8,2.4,0.04,18],names:["Pendle","Curve","GMX","dYdX","Synthetix","Yearn","Convex","Frax"]},
  "AI / GPU":   {icons:["🤖","⚡","◉","⬤","▣"],bases:[6.8,3.2,0.12,28,0.8],names:["Bittensor","Fetch.ai","Ocean","SingularityNET","Cortex","Gensyn"]},
  "RWA":        {icons:["🏛️","⬦","◈","▷","⊡"],bases:[2.4,18,0.8,6,44],names:["Ondo","Maple","Centrifuge","Goldfinch","TrueFi","Clearpool"]},
  "Stablecoins":{icons:["$","€","£","¥","₮"],bases:[1,1,1,0.999,1.001],names:["DAI","FRAX","LUSD","BUSD","TUSD","USDP"]},
  "Meme":       {icons:["🐕","🐸","🐈","🦊","🦍","🐻","🦅","🐉","🦄","🐺","🦁","🐯","🐮","🐷","🐣","🦔","🐢","🐊","🦘","🐉"],bases:[0.000012,0.0042,0.00089,0.0314,0.00008,0.000056],names:["PEPE","SHIB","FLOKI","BONK","WIF","MEME","TURBO","WOJAK","LADYS","SAITAMA","BABYDOGE","KISHU","ELON","SAMO","CORGI","HOGE","AKITA","MOONCAT","DOGELON","CHEEMS"]},
  "GameFi":     {icons:["🎮","🕹️","⚔️","🏆","💎","🎯"],bases:[0.24,1.8,0.06,12,0.8,3.4],names:["Axie","Gala","Immutable","Ronin","SAND","MANA","ENJ","ILV"]},
  "Oracle":     {icons:["⬡","◎","⊕","◈","▣","⊞"],bases:[17.2,8.4,0.32,2.1,0.8,4.4],names:["Band","API3","Pyth","DIA","Umbrella","Tellor"]},
  "Exchange":   {icons:["⟁","◈","⊛","⬡","⊗","◉"],bases:[688,4.2,0.8,18,2.4,0.06],names:["OKB","CRO","GT","HT","KCS","MX","WOO"]},
  "Payments":   {icons:["X","◎","⊕","▲","●","◈"],bases:[2.41,0.74,0.18,0.04,1.2,8.4],names:["Stellar","Nano","Dash","VeChain","IOTA","Request"]},
  "Privacy":    {icons:["🔒","◎","⊕","▣","◈","⬡"],bases:[168,0.44,0.12,2.4,0.8,0.06],names:["Monero","Zcash","Oasis","Dusk","Haven","Tornado"]},
};

export default function SectorView({ coins, sectors, loading, onCoinClick }: Props) {
  const [selected, setSelected] = useState<string|null>(null);

  const sectorCoins = (name: string): any[] => {
    const real = coins.filter(c=>c.category===name);
    const sector = sectors.find(s=>s.name===name);
    const meta = SECTOR_MOCK[name] || SECTOR_MOCK["Meme"];
    const total = sector?.coins || 20;
    const mock = [];
    for (let i=0; i<total; i++) {
      if (i < real.length) continue;
      const nm = meta.names[i%meta.names.length] + (i>=meta.names.length ? ` ${Math.floor(i/meta.names.length)+2}` : "");
      const bp = meta.bases[i%meta.bases.length];
      const price = +(bp*(0.7+Math.random()*0.6)).toFixed(bp<0.01?8:bp<1?5:2);
      mock.push({ id:`m${i}`, name:nm, symbol:nm.slice(0,5).toUpperCase(), icon:meta.icons[i%meta.icons.length],
        rank:200+i, price, change24h:+((Math.random()-.45)*8).toFixed(1), change7d:+((Math.random()-.42)*18).toFixed(1),
        marketCap:+(Math.random()*2+0.05).toFixed(2), isMock:true });
    }
    return [...real.map(c=>({...c,isMock:false})), ...mock];
  };

  return (
    <div className="p-4 space-y-4 animate-fade-in">
      <Card>
        <CardHeader title="Sector Heatmap — 30d Performance"/>
        <div className="p-4 grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-2">
          {loading ? Array(8).fill(0).map((_,i)=><Skel key={i} h="h-20"/>) :
          sectors.map(s => {
            const live = coins.filter(c=>c.category===s.name);
            const p = live.length ? +(live.reduce((a,c)=>a+c.change7d,0)/live.length).toFixed(1) : s.p30;
            const up = p >= 0;
            const intensity = Math.min(Math.abs(p)/25, 1);
            const isSelected = selected === s.name;
            return (
              <button key={s.name} onClick={()=>setSelected(s.name===selected?null:s.name)}
                className={`text-left p-3 rounded-xl border transition-all duration-200 ${
                  isSelected ? "border-cyan-500/50 shadow-[0_0_16px_rgba(6,182,212,0.15)]" :
                  up ? "border-emerald-500/20 hover:border-emerald-500/40" : "border-red-500/20 hover:border-red-500/40"
                }`}
                style={{
                  background: up
                    ? `rgba(16,185,129,${0.04+intensity*0.12})`
                    : `rgba(239,68,68,${0.04+intensity*0.12})`,
                }}>
                <div className="text-[11px] font-semibold text-[#E2E8F0] mb-1" style={{fontFamily:"'Space Grotesk',sans-serif"}}>{s.name}</div>
                <div className={`text-[15px] font-bold ${up?"text-emerald-400":"text-red-400"}`} style={{fontFamily:"'IBM Plex Mono',monospace"}}>
                  {up?"+":""}{p.toFixed(1)}%
                </div>
                <div className="text-[9px] text-[#334155] mt-1" style={{fontFamily:"'IBM Plex Mono',monospace"}}>
                  {s.coins} coins{s.tvl?` · ${s.tvl}`:""}{live.length?" · Live":""}
                </div>
              </button>
            );
          })}
        </div>
      </Card>

      {selected && (
        <Card>
          <CardHeader title={`${selected} — ${sectors.find(s=>s.name===selected)?.coins||0} Coins`}
            right={<button onClick={()=>setSelected(null)} className="text-[10px] text-[#334155] hover:text-[#64748B]">✕ close</button>}/>
          <div className="overflow-x-auto">
            <table className="w-full min-w-[480px]">
              <thead>
                <tr className="border-b border-[#1E2A3B]">
                  {["#","Coin","Price","24h","7d","MCap"].map(h=>(
                    <th key={h} className={`py-2 px-3 text-[9px] uppercase tracking-[0.1em] text-[#334155] ${h==="Coin"?"text-left":"text-right"}`} style={{fontFamily:"'IBM Plex Mono',monospace"}}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {sectorCoins(selected).map((c,i)=>(
                  <tr key={c.id} style={{opacity:c.isMock?0.75:1}}
                    onClick={()=>!c.isMock&&onCoinClick(c as Coin)}
                    className={`border-b border-[#1E2A3B]/40 transition-colors ${!c.isMock?"hover:bg-[#0F1A27] cursor-pointer":""}`}>
                    <td className="py-2 px-3 text-[10px] text-[#334155]" style={{fontFamily:"'IBM Plex Mono',monospace"}}>{i+1}</td>
                    <td className="py-2 px-3">
                      <div className="flex items-center gap-2">
                        <div className="w-5 h-5 rounded-full bg-[#162032] flex items-center justify-center text-[10px]">{c.icon}</div>
                        <div><div className="text-[11px] font-semibold text-[#E2E8F0]" style={{fontFamily:"'Space Grotesk',sans-serif"}}>{c.name}</div>
                        <div className="text-[9px] text-[#334155]" style={{fontFamily:"'IBM Plex Mono',monospace"}}>{c.symbol}</div></div>
                      </div>
                    </td>
                    <td className="py-2 px-3 text-right text-[10px] text-[#CBD5E1]" style={{fontFamily:"'IBM Plex Mono',monospace"}}>{fmtPrice(c.price)}</td>
                    <td className={`py-2 px-3 text-right text-[10px] ${c.change24h>=0?"text-emerald-400":"text-red-400"}`} style={{fontFamily:"'IBM Plex Mono',monospace"}}>{c.change24h>=0?"▲":"▼"}{Math.abs(c.change24h).toFixed(1)}%</td>
                    <td className={`py-2 px-3 text-right text-[10px] ${c.change7d>=0?"text-emerald-400":"text-red-400"}`} style={{fontFamily:"'IBM Plex Mono',monospace"}}>{c.change7d>=0?"▲":"▼"}{Math.abs(c.change7d).toFixed(1)}%</td>
                    <td className="py-2 px-3 text-right text-[10px] text-[#64748B]" style={{fontFamily:"'IBM Plex Mono',monospace"}}>${c.marketCap}B</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Card>
      )}
    </div>
  );
}
