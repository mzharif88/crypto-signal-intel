"use client";
import type { TabId } from "@/app/page";

const TABS: { id: TabId; label: string; icon: string }[] = [
  { id:"revops",   label:"RevOps",   icon:"📡" },
  { id:"overview", label:"Overview", icon:"🌐" },
  { id:"token",    label:"Token",    icon:"📈" },
  { id:"radar",    label:"Radar",    icon:"🔥" },
  { id:"sector",   label:"Sectors",  icon:"🗺️" },
  { id:"defi",     label:"DeFi",     icon:"🔗" },
];

interface Props { tab: TabId; setTab: (t:TabId)=>void; signalCount: number; }

export default function TabNav({ tab, setTab, signalCount }: Props) {
  return (
    <nav className="flex-shrink-0 bg-[#0A0E17] border-b border-[#1E2A3B] px-3 pt-2 pb-0">
      <div className="flex gap-1 overflow-x-auto" style={{scrollbarWidth:"none"}}>
        {TABS.map(t => (
          <button key={t.id} onClick={()=>setTab(t.id)}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-t-lg text-[12px] font-medium flex-shrink-0 border-b-2 transition-all duration-150 ${
              tab===t.id
                ? "bg-[#111827] text-cyan-400 border-cyan-400"
                : "text-[#64748B] border-transparent hover:text-[#94A3B8] hover:bg-[#111827]/50"
            }`}
            style={{ fontFamily:"'Space Grotesk',sans-serif" }}>
            <span className="text-[11px]">{t.icon}</span>
            {t.label}
            {t.id==="revops" && (
              <span className="ml-0.5 px-1.5 py-0.5 rounded-full text-[9px] font-bold bg-red-500/20 text-red-400 border border-red-500/30"
                style={{fontFamily:"'IBM Plex Mono',monospace"}}>
                {signalCount}
              </span>
            )}
            {t.id==="radar" && (
              <span className="ml-0.5 px-1.5 py-0.5 rounded-full text-[9px] font-bold bg-emerald-500/20 text-emerald-400 border border-emerald-500/30"
                style={{fontFamily:"'IBM Plex Mono',monospace"}}>Live</span>
            )}
          </button>
        ))}
      </div>
    </nav>
  );
}
