"use client";
import { useState, useEffect, useCallback } from "react";
import { RefreshCw, TrendingUp, Globe, Activity, Zap, BarChart3, Layers } from "lucide-react";
import { fmtB, fmtPct, COIN_META, TOP15_IDS, computeSignals, SECTORS } from "@/lib/data";
import type { Coin, GlobalData, TrendingCoin, Protocol, ChainData } from "@/lib/data";

import TopBar from "@/components/TopBar";
import TabNav from "@/components/TabNav";
import RevOpsView from "@/components/RevOpsView";
import OverviewView from "@/components/OverviewView";
import TokenView from "@/components/TokenView";
import RadarView from "@/components/RadarView";
import SectorView from "@/components/SectorView";
import DeFiView from "@/components/DeFiView";
import StatusBar from "@/components/StatusBar";

export type TabId = "revops" | "overview" | "token" | "radar" | "sector" | "defi";

export interface AppState {
  coins: Coin[];
  global: GlobalData | null;
  trending: TrendingCoin[];
  protocols: Protocol[];
  chains: ChainData[];
  tvlHistory: { date: string; value: number }[];
  selectedCoin: Coin | null;
  loading: boolean;
  lastUpdated: Date | null;
  error: string | null;
}

export default function Page() {
  const [tab, setTab] = useState<TabId>("revops");
  const [state, setState] = useState<AppState>({
    coins: [], global: null, trending: [],
    protocols: [], chains: [], tvlHistory: [],
    selectedCoin: null, loading: true, lastUpdated: null, error: null,
  });

  const fetchAll = useCallback(async () => {
    setState(s => ({ ...s, loading: true, error: null }));
    try {
      const [marketsRes, globalRes, trendingRes, protosRes, chainsRes] = await Promise.allSettled([
        fetch(`/api/cg?path=%2Fcoins%2Fmarkets&vs_currency=usd&ids=${TOP15_IDS}&order=market_cap_desc&per_page=15&price_change_percentage=7d`),
        fetch(`/api/cg?path=%2Fglobal`),
        fetch(`/api/cg?path=%2Fsearch%2Ftrending`),
        fetch(`/api/dl?path=%2Fprotocols`),
        fetch(`/api/dl?path=%2Fv2%2Fchains`),
      ]);

      // Parse coins
      let coins: Coin[] = [];
      if (marketsRes.status === "fulfilled" && marketsRes.value.ok) {
        const raw = await marketsRes.value.json();
        if (Array.isArray(raw)) {
          coins = raw.map((c: any) => {
            const meta = COIN_META[c.id] || { cat: "Other", icon: "●" };
            const c24 = c.price_change_percentage_24h || 0;
            const c7 = c.price_change_percentage_7d_in_currency || 0;
            return {
              id: c.id, name: c.name, symbol: c.symbol?.toUpperCase(),
              icon: meta.icon, rank: c.market_cap_rank || 0,
              price: c.current_price || 0, change24h: c24, change7d: c7,
              marketCap: +((c.market_cap || 0) / 1e9).toFixed(1),
              volume24h: +((c.total_volume || 0) / 1e9).toFixed(1),
              signals: computeSignals(c24, c7, meta.cat),
              category: meta.cat,
            };
          });
        }
      }

      // Parse global
      let global: GlobalData | null = null;
      if (globalRes.status === "fulfilled" && globalRes.value.ok) {
        const raw = await globalRes.value.json();
        const d = raw?.data;
        if (d) {
          global = {
            totalMarketCap: fmtB(d.total_market_cap?.usd || 0),
            marketCapChange24h: d.market_cap_change_percentage_24h_usd || 0,
            btcDominance: (d.market_cap_percentage?.btc || 0).toFixed(1) + "%",
            totalVolume24h: fmtB(d.total_volume?.usd || 0),
            activeCryptocurrencies: d.active_cryptocurrencies || 0,
          };
        }
      }

      // Parse trending
      let trending: TrendingCoin[] = [];
      if (trendingRes.status === "fulfilled" && trendingRes.value.ok) {
        const raw = await trendingRes.value.json();
        trending = (raw?.coins || []).slice(0, 7).map((c: any) => ({
          id: c.item.id, name: c.item.name, symbol: c.item.symbol,
          thumb: c.item.thumb || "", rank: c.item.market_cap_rank || 0,
          price: c.item.data?.price || 0,
          change24h: c.item.data?.price_change_percentage_24h?.usd || 0,
        }));
      }

      // Parse protocols
      let protocols: Protocol[] = [];
      if (protosRes.status === "fulfilled" && protosRes.value.ok) {
        const raw = await protosRes.value.json();
        if (Array.isArray(raw)) {
          const sorted = raw.filter((p: any) => p.tvl > 0).sort((a: any, b: any) => b.tvl - a.tvl).slice(0, 10);
          const maxTvl = sorted[0]?.tvl || 1;
          const colors = ["#06B6D4","#8B5CF6","#EF4444","#F59E0B","#10B981","#06B6D4","#8B5CF6","#64748B","#10B981","#F59E0B"];
          protocols = sorted.map((p: any, i: number) => ({
            name: p.name, tvlRaw: p.tvl, tvl: fmtB(p.tvl),
            pct: Math.round((p.tvl / maxTvl) * 100),
            change1d: fmtPct(p.change_1d), changeUp: (p.change_1d || 0) >= 0,
            color: colors[i % colors.length],
          }));
        }
      }

      // Parse chains
      let chains: ChainData[] = [];
      if (chainsRes.status === "fulfilled" && chainsRes.value.ok) {
        const raw = await chainsRes.value.json();
        if (Array.isArray(raw)) {
          chains = raw.filter((c: any) => c.tvl > 0 && c.name)
            .sort((a: any, b: any) => b.tvl - a.tvl).slice(0, 8)
            .map((c: any) => ({ name: c.name, tvl: fmtB(c.tvl), tvlRaw: c.tvl }));
        }
      }

      setState(s => ({
        ...s, coins, global, trending, protocols, chains,
        selectedCoin: s.selectedCoin || coins[0] || null,
        loading: false, lastUpdated: new Date(), error: null,
      }));
    } catch (e) {
      setState(s => ({ ...s, loading: false, error: String(e) }));
    }
  }, []);

  useEffect(() => { fetchAll(); }, [fetchAll]);

  const openToken = useCallback((coin: Coin) => {
    setState(s => ({ ...s, selectedCoin: coin }));
    setTab("token");
  }, []);

  return (
    <div className="flex flex-col h-dvh bg-[#0A0E17] overflow-hidden">
      <TopBar global={state.global} loading={state.loading} />

      <TabNav tab={tab} setTab={setTab} signalCount={4} />

      <main className="flex-1 overflow-y-auto overflow-x-hidden pb-16">
        {tab === "revops"   && <RevOpsView coins={state.coins} sectors={SECTORS} loading={state.loading} />}
        {tab === "overview" && <OverviewView coins={state.coins} global={state.global} loading={state.loading} onCoinClick={openToken} />}
        {tab === "token"    && <TokenView coin={state.selectedCoin} loading={state.loading} />}
        {tab === "radar"    && <RadarView coins={state.coins} trending={state.trending} loading={state.loading} onCoinClick={openToken} />}
        {tab === "sector"   && <SectorView coins={state.coins} sectors={SECTORS} loading={state.loading} onCoinClick={openToken} />}
        {tab === "defi"     && <DeFiView protocols={state.protocols} chains={state.chains} loading={state.loading} />}
      </main>

      <StatusBar
        loading={state.loading}
        lastUpdated={state.lastUpdated}
        coinCount={state.coins.length}
        onRefresh={fetchAll}
      />
    </div>
  );
}
