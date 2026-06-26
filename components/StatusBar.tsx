"use client";
import { RefreshCw } from "lucide-react";

interface Props {
  loading: boolean;
  lastUpdated: Date | null;
  coinCount: number;
  onRefresh: () => void;
}

export default function StatusBar({ loading, lastUpdated, coinCount, onRefresh }: Props) {
  return (
    <div className="fixed bottom-0 left-0 right-0 flex items-center gap-3 px-4 h-10 bg-[#0A0E17]/95 backdrop-blur border-t border-[#1E2A3B] z-50">
      <span className="text-[10px] text-[#334155]" style={{fontFamily:"'IBM Plex Mono',monospace"}}>
        {loading ? "⟳ Fetching…" : coinCount > 0 ? `${coinCount} coins · CoinGecko + DefiLlama` : "Ready"}
      </span>
      {lastUpdated && !loading && (
        <span className="text-[10px] text-[#1E3A5F]" style={{fontFamily:"'IBM Plex Mono',monospace"}}>
          Updated {lastUpdated.toLocaleTimeString()}
        </span>
      )}
      <button onClick={onRefresh} disabled={loading}
        className="ml-auto flex items-center gap-1.5 px-3 py-1 rounded-md text-[10px] font-medium bg-cyan-500/10 text-cyan-400 border border-cyan-500/25 hover:bg-cyan-500/20 transition-colors disabled:opacity-40"
        style={{fontFamily:"'IBM Plex Mono',monospace"}}>
        <RefreshCw size={11} className={loading?"animate-spin":""} />
        Refresh
      </button>
    </div>
  );
}
