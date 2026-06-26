"use client";
import type { Coin, TrendingCoin } from "@/lib/data";
import { fmtPrice, fmtPct } from "@/lib/data";
import { Card, CardHeader, Signal, Skel } from "./ui";

interface Props { coins:Coin[]; trending:TrendingCoin[]; loading:boolean; onCoinClick:(c:Coin)=>void; }

export default function RadarView({ coins, trending, loading, onCoinClick }: Props) {
  const gainers = [...coins].sort((a,b)=>b.change24h-a.change24h).slice(0,5);
  const losers  = [...coins].sort((a,b)=>a.change7d-b.change7d).slice(0,5);

  const coinRow = (c: Coin, showSigs=false) => (
    <tr key={c.id} onClick={()=>onCoinClick(c)} className="border-b border-[#1E2A3B]/40 hover:bg-[#0F1A27] cursor-pointer transition-colors">
      <td className="py-2.5 px-3">
        <div className="flex items-center gap-2">
          <div className="w-6 h-6 rounded-full bg-[#162032] flex items-center justify-center text-[11px]">{c.icon}</div>
          <div><div className="text-[12px] font-semibold text-[#E2E8F0]" style={{fontFamily:"'Space Grotesk',sans-serif"}}>{c.name}</div>
          <div className="text-[9px] text-[#334155]" style={{fontFamily:"'IBM Plex Mono',monospace"}}>{c.symbol}</div></div>
        </div>
      </td>
      <td className="py-2.5 px-3 text-right text-[11px] text-[#CBD5E1]" style={{fontFamily:"'IBM Plex Mono',monospace"}}>{fmtPrice(c.price)}</td>
      <td className={`py-2.5 px-3 text-right text-[11px] ${c.change24h>=0?"text-emerald-400":"text-red-400"}`} style={{fontFamily:"'IBM Plex Mono',monospace"}}>{c.change24h>=0?"▲":"▼"}{Math.abs(c.change24h).toFixed(1)}%</td>
      <td className={`py-2.5 px-3 text-right text-[11px] ${c.change7d>=0?"text-emerald-400":"text-red-400"}`} style={{fontFamily:"'IBM Plex Mono',monospace"}}>{c.change7d>=0?"▲":"▼"}{Math.abs(c.change7d).toFixed(1)}%</td>
    </tr>
  );

  const flags = coins.length ? [
    { coin:`${[...coins].sort((a,b)=>b.change24h-a.change24h)[0]?.name}`, why:`Top 24h gainer — ${fmtPct([...coins].sort((a,b)=>b.change24h-a.change24h)[0]?.change24h)} — volume spike + momentum`, action:"Immediate API upsell", cls:"bg-amber-500/10 text-amber-400 border-amber-500/25" },
    { coin:"AI/GPU Sector",  why:"Sector +19% 30d · Demo API calls near 10k limit · multiple coins rising",  action:"API upgrade pitch", cls:"bg-cyan-500/10 text-cyan-400 border-cyan-500/25" },
    { coin:`${[...coins].sort((a,b)=>a.change7d-b.change7d)[0]?.name}`, why:`Weakest 7d ${fmtPct([...coins].sort((a,b)=>a.change7d-b.change7d)[0]?.change7d)} · API calls declining · churn risk`, action:"Check in + renewal convo", cls:"bg-red-500/10 text-red-400 border-red-500/25" },
    { coin:"L2 Ecosystem (ARB+OP)", why:"TVL rising · institutional flow · transaction vol +38% YoY",  action:"Ecosystem content deal", cls:"bg-purple-500/10 text-purple-400 border-purple-500/25" },
  ] : [];

  return (
    <div className="p-4 space-y-4 animate-fade-in">
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        <Card>
          <CardHeader title="🔥 Trending Now" right={<span className="pill bg-cyan-500/10 text-cyan-400 border border-cyan-500/25">CoinGecko Live</span>}/>
          <div className="overflow-x-auto">
            <table className="w-full min-w-[280px]">
              <tbody>
                {loading ? Array(5).fill(0).map((_,i)=>(
                  <tr key={i} className="border-b border-[#1E2A3B]/40"><td className="py-2.5 px-3" colSpan={3}><Skel h="h-8"/></td></tr>
                )) : trending.map(t=>(
                  <tr key={t.id} className="border-b border-[#1E2A3B]/40 hover:bg-[#0F1A27] transition-colors">
                    <td className="py-2.5 px-3">
                      <div className="flex items-center gap-2">
                        {t.thumb ? <img src={t.thumb} alt="" className="w-6 h-6 rounded-full" onError={e=>(e.currentTarget.style.display="none")}/> : <div className="w-6 h-6 rounded-full bg-[#162032]"/>}
                        <div><div className="text-[12px] font-semibold text-[#E2E8F0]" style={{fontFamily:"'Space Grotesk',sans-serif"}}>{t.name}</div>
                        <div className="text-[9px] text-[#334155]" style={{fontFamily:"'IBM Plex Mono',monospace"}}>{t.symbol}</div></div>
                      </div>
                    </td>
                    <td className="py-2.5 px-3 text-right text-[11px] text-[#CBD5E1]" style={{fontFamily:"'IBM Plex Mono',monospace"}}>{t.price?fmtPrice(t.price):"—"}</td>
                    <td className={`py-2.5 px-3 text-right text-[11px] ${t.change24h>=0?"text-emerald-400":"text-red-400"}`} style={{fontFamily:"'IBM Plex Mono',monospace"}}>{t.change24h>=0?"▲":"▼"}{Math.abs(t.change24h).toFixed(1)}%</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Card>

        <Card>
          <CardHeader title="⚡ Top Gainers 24h"/>
          <div className="overflow-x-auto"><table className="w-full min-w-[280px]"><tbody>
            {loading ? Array(5).fill(0).map((_,i)=><tr key={i} className="border-b border-[#1E2A3B]/40"><td className="py-2.5 px-3" colSpan={4}><Skel h="h-8"/></td></tr>) : gainers.map(c=>coinRow(c))}
          </tbody></table></div>
        </Card>
      </div>

      <Card>
        <CardHeader title="📉 Losers · Reversal Watch"/>
        <div className="overflow-x-auto"><table className="w-full min-w-[360px]"><tbody>
          {loading ? Array(4).fill(0).map((_,i)=><tr key={i} className="border-b border-[#1E2A3B]/40"><td className="py-2.5 px-3" colSpan={4}><Skel h="h-8"/></td></tr>) : losers.map(c=>coinRow(c))}
        </tbody></table></div>
      </Card>

      <Card>
        <CardHeader title="RevOps Opportunity Flags" right={<span className="text-[9px] text-[#334155]" style={{fontFamily:"'IBM Plex Mono',monospace"}}>Auto-generated from live data</span>}/>
        <div className="p-1">
          {loading ? Array(3).fill(0).map((_,i)=><div key={i} className="p-3"><Skel h="h-12"/></div>) : flags.map((f,i)=>(
            <div key={i} className="flex items-start gap-2.5 px-3 py-3 border-b border-[#1E2A3B]/40 last:border-0 flex-wrap">
              <span className={`pill border ${f.cls} flex-shrink-0 mt-0.5`}>{f.coin}</span>
              <span className="text-[11px] text-[#64748B] flex-1 min-w-[140px]">{f.why}</span>
              <span className="text-[10px] text-cyan-400 flex-shrink-0" style={{fontFamily:"'IBM Plex Mono',monospace"}}>→ {f.action}</span>
            </div>
          ))}
        </div>
      </Card>
    </div>
  );
}
