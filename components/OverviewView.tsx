"use client";
import type { Coin, GlobalData } from "@/lib/data";
import { fmtPrice, fmtPct } from "@/lib/data";
import { StatCard, Card, CardHeader, Signal, Skel } from "./ui";

interface Props { coins: Coin[]; global: GlobalData|null; loading:boolean; onCoinClick:(c:Coin)=>void; }

export default function OverviewView({ coins, global, loading, onCoinClick }: Props) {
  return (
    <div className="p-4 space-y-4 animate-fade-in">
      <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
        <StatCard label="Global Mkt Cap" value={global?.totalMarketCap??"—"} change={global?.marketCapChange24h} />
        <StatCard label="BTC Dominance"  value={global?.btcDominance??"—"} />
        <StatCard label="DeFi TVL"       value="$71.8B" change={-2.1} />
        <StatCard label="Stablecoins"    value="$314B"  change={0.4} />
        <StatCard label="DEX 24h Vol"    value="$7.2B"  change={9.3} />
        <StatCard label="Active Coins"   value={global?.activeCryptocurrencies?.toLocaleString()??"—"} />
      </div>

      <Card>
        <CardHeader title="Top 15 by Market Cap" right={
          <div className="flex gap-1.5">
            {!loading && coins.length > 0 && <>
              <span className="pill bg-emerald-500/10 text-emerald-400 border border-emerald-500/25">{coins.filter(c=>c.change24h>=0).length} up</span>
              <span className="pill bg-red-500/10 text-red-400 border border-red-500/25">{coins.filter(c=>c.change24h<0).length} dn</span>
            </>}
          </div>
        }/>
        <div className="overflow-x-auto">
          <table className="w-full min-w-[560px]">
            <thead>
              <tr className="border-b border-[#1E2A3B]">
                {["#","Coin","Price","24h","7d","MCap","Signals"].map(h=>(
                  <th key={h} className={`py-2 px-3 text-left text-[9px] uppercase tracking-[0.1em] text-[#334155] ${["Price","24h","7d","MCap"].includes(h)?"text-right":""}`}
                    style={{fontFamily:"'IBM Plex Mono',monospace"}}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {loading ? Array(8).fill(0).map((_,i)=>(
                <tr key={i} className="border-b border-[#1E2A3B]/50">
                  {Array(7).fill(0).map((_,j)=><td key={j} className="py-2.5 px-3"><Skel h="h-3.5" w={j===1?"w-28":"w-16"}/></td>)}
                </tr>
              )) : coins.map(c=>(
                <tr key={c.id} onClick={()=>onCoinClick(c)}
                  className="border-b border-[#1E2A3B]/40 hover:bg-[#0F1A27] cursor-pointer transition-colors">
                  <td className="py-2.5 px-3 text-[11px] text-[#334155]" style={{fontFamily:"'IBM Plex Mono',monospace"}}>{c.rank}</td>
                  <td className="py-2.5 px-3">
                    <div className="flex items-center gap-2">
                      <div className="w-6 h-6 rounded-full bg-[#162032] flex items-center justify-center text-[11px] flex-shrink-0">{c.icon}</div>
                      <div>
                        <div className="text-[12px] font-semibold text-[#E2E8F0]" style={{fontFamily:"'Space Grotesk',sans-serif"}}>{c.name}</div>
                        <div className="text-[9px] text-[#334155]" style={{fontFamily:"'IBM Plex Mono',monospace"}}>{c.symbol}</div>
                      </div>
                    </div>
                  </td>
                  <td className="py-2.5 px-3 text-right text-[11px] text-[#CBD5E1]" style={{fontFamily:"'IBM Plex Mono',monospace"}}>{fmtPrice(c.price)}</td>
                  <td className={`py-2.5 px-3 text-right text-[11px] ${c.change24h>=0?"text-emerald-400":"text-red-400"}`} style={{fontFamily:"'IBM Plex Mono',monospace"}}>
                    {c.change24h>=0?"▲":"▼"}{Math.abs(c.change24h).toFixed(2)}%
                  </td>
                  <td className={`py-2.5 px-3 text-right text-[11px] ${c.change7d>=0?"text-emerald-400":"text-red-400"}`} style={{fontFamily:"'IBM Plex Mono',monospace"}}>
                    {c.change7d>=0?"▲":"▼"}{Math.abs(c.change7d).toFixed(1)}%
                  </td>
                  <td className="py-2.5 px-3 text-right text-[11px] text-[#64748B]" style={{fontFamily:"'IBM Plex Mono',monospace"}}>${c.marketCap}B</td>
                  <td className="py-2.5 px-3">
                    <div className="flex gap-1 flex-wrap justify-end">
                      {c.signals.slice(0,2).map(s=><Signal key={s} label={s}/>)}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  );
}
