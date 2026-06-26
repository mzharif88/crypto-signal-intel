"use client";
import { useState, useEffect } from "react";
import type { GlobalData } from "@/lib/data";

interface Props { global: GlobalData | null; loading: boolean; }

export default function TopBar({ global, loading }: Props) {
  const ticks = [
    { label: "MCAP",    value: global?.totalMarketCap ?? "—",  chg: global?.marketCapChange24h ?? null },
    { label: "BTC.D",   value: global?.btcDominance ?? "—",    chg: null },
    { label: "VOL 24H", value: global?.totalVolume24h ?? "—",  chg: null },
    { label: "DeFi TVL",value: "$71.8B",                       chg: -2.1 },
    { label: "STABLE",  value: "$314B",                        chg: 0.4 },
  ];
  return (
    <header className="flex-shrink-0 bg-[#111827] border-b border-[#1E2A3B]">
      <div className="flex items-center justify-between px-4 h-11">
        <div className="flex items-center gap-2.5">
          <span className="text-lg leading-none">🦎</span>
          <span className="font-bold tracking-[0.12em] text-cyan-400 text-[13px]"
            style={{ fontFamily: "'Space Grotesk', sans-serif" }}>SIGNAL INTEL</span>
          <span className="text-[#334155] text-[10px] hidden sm:inline"
            style={{ fontFamily: "'IBM Plex Mono', monospace" }}>/ CoinGecko RevOps</span>
        </div>
        <div className="flex items-center gap-2.5">
          <span className={`w-1.5 h-1.5 rounded-full ${loading ? "bg-amber-400 animate-pulse" : "bg-emerald-400"}`}
            style={{ boxShadow: loading ? "0 0 8px #F59E0B" : "0 0 8px #10B981" }} />
          <LiveClock />
        </div>
      </div>
      <div className="flex overflow-x-auto border-t border-[#1E2A3B] h-7" style={{ scrollbarWidth: "none" }}>
        {ticks.map((t, i) => (
          <div key={i} className="flex items-center gap-1.5 px-3 h-full border-r border-[#1E2A3B] flex-shrink-0">
            <span style={{ fontFamily: "'IBM Plex Mono', monospace", fontSize: "9px", letterSpacing: "0.1em" }}
              className="text-[#334155] uppercase">{t.label}</span>
            <span style={{ fontFamily: "'IBM Plex Mono', monospace", fontSize: "11px" }}
              className="text-[#CBD5E1]">{t.value}</span>
            {t.chg != null && (
              <span style={{ fontFamily: "'IBM Plex Mono', monospace", fontSize: "10px" }}
                className={t.chg >= 0 ? "text-emerald-400" : "text-red-400"}>
                {t.chg >= 0 ? "+" : ""}{t.chg.toFixed(1)}%
              </span>
            )}
          </div>
        ))}
      </div>
    </header>
  );
}

function LiveClock() {
  const [time, setTime] = useState("");
  useEffect(() => {
    const tick = () => setTime(new Date().toUTCString().slice(0, 22) + " UTC");
    tick();
    const id = setInterval(tick, 1000);
    return () => clearInterval(id);
  }, []);
  return (
    <span style={{ fontFamily: "'IBM Plex Mono', monospace", fontSize: "10px" }}
      className="text-[#334155] hidden sm:inline">{time}</span>
  );
}
