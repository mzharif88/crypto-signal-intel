// Shared UI primitives
"use client";
import { ReactNode } from "react";
import { fmtPct } from "@/lib/data";

// Stat card with gradient hover border
export function StatCard({ label, value, change, accent, onClick, sub }: {
  label: string; value: string; change?: number|null; accent?: string;
  onClick?: () => void; sub?: string;
}) {
  return (
    <div onClick={onClick}
      className={`relative rounded-xl border border-[#1E2A3B] bg-[#111827] p-4 transition-all duration-200 ${onClick?"cursor-pointer hover:border-cyan-500/40 hover:shadow-[0_0_20px_rgba(6,182,212,0.08)]":""}`}>
      <div className="text-[9px] uppercase tracking-[0.12em] text-[#334155] mb-2" style={{fontFamily:"'IBM Plex Mono',monospace"}}>{label}</div>
      <div className="text-xl font-bold leading-none" style={{fontFamily:"'Space Grotesk',sans-serif",color:accent||"#E2E8F0"}}>{value}</div>
      {change!=null && (
        <div className={`text-[10px] mt-1.5 ${change>=0?"text-emerald-400":"text-red-400"}`} style={{fontFamily:"'IBM Plex Mono',monospace"}}>
          {change>=0?"▲":"▼"} {Math.abs(change).toFixed(2)}%
        </div>
      )}
      {sub && <div className="text-[10px] text-[#334155] mt-1" style={{fontFamily:"'IBM Plex Mono',monospace"}}>{sub}</div>}
    </div>
  );
}

// Section header
export function SectionHeader({ title, right }: { title: string; right?: ReactNode }) {
  return (
    <div className="flex items-center justify-between mb-3">
      <div className="flex items-center gap-3">
        <span className="text-[11px] font-semibold uppercase tracking-[0.1em] text-[#64748B]"
          style={{fontFamily:"'IBM Plex Mono',monospace"}}>{title}</span>
        <div className="h-px flex-1 bg-gradient-to-r from-[#1E2A3B] to-transparent w-12" />
      </div>
      {right}
    </div>
  );
}

// Signal badge
const BADGE_STYLES: Record<string,string> = {
  "Golden Cross": "bg-amber-500/10 text-amber-400 border-amber-500/25",
  "Death Cross":  "bg-red-500/10 text-red-400 border-red-500/25",
  "MACD Bull":    "bg-emerald-500/10 text-emerald-400 border-emerald-500/25",
  "MACD Bear":    "bg-red-500/10 text-red-400 border-red-500/25",
  "Vol Spike":    "bg-amber-500/10 text-amber-400 border-amber-500/25",
  "L2 Rising":    "bg-purple-500/10 text-purple-400 border-purple-500/25",
  "RWA Play":     "bg-amber-500/10 text-amber-400 border-amber-500/25",
  "AI Hot":       "bg-amber-500/10 text-amber-400 border-amber-500/25",
};
export function Signal({ label }: { label: string }) {
  const style = BADGE_STYLES[label] || "bg-cyan-500/10 text-cyan-400 border-cyan-500/25";
  return (
    <span className={`inline-flex items-center px-2 py-0.5 rounded-full border text-[9px] font-medium ${style}`}
      style={{fontFamily:"'IBM Plex Mono',monospace",letterSpacing:"0.04em"}}>
      {label}
    </span>
  );
}

// Pct display
export function Pct({ v, size="sm" }: { v: number; size?: "sm"|"lg" }) {
  const up = v >= 0;
  return (
    <span className={`${up?"text-emerald-400":"text-red-400"} ${size==="lg"?"text-base":"text-[11px]"}`}
      style={{fontFamily:"'IBM Plex Mono',monospace"}}>
      {up?"▲":"▼"} {Math.abs(v).toFixed(2)}%
    </span>
  );
}

// Skeleton loader
export function Skel({ h="h-4", w="w-full" }: { h?: string; w?: string }) {
  return <div className={`${h} ${w} rounded skeleton`} />;
}

// Card wrapper
export function Card({ children, className="" }: { children: ReactNode; className?: string }) {
  return (
    <div className={`rounded-xl border border-[#1E2A3B] bg-[#111827] overflow-hidden ${className}`}>
      {children}
    </div>
  );
}

export function CardHeader({ title, right }: { title: string; right?: ReactNode }) {
  return (
    <div className="flex items-center justify-between px-4 py-3 border-b border-[#1E2A3B] bg-[#0F1A27]">
      <span className="text-[10px] font-semibold uppercase tracking-[0.1em] text-[#64748B]"
        style={{fontFamily:"'IBM Plex Mono',monospace"}}>{title}</span>
      {right}
    </div>
  );
}
