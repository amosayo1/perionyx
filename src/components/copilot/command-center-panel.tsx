"use client";

import { Crown, Landmark, ShieldCheck, AlertTriangle, FileSearch, Terminal, Briefcase } from "lucide-react";
import type { PersonaRole } from "@/modules/copilot/command-center";
import { cn } from "@/lib/utils";

const PERSONA_CONFIG: Record<PersonaRole, { icon: React.ReactNode; description: string }> = {
  CEO: { icon: <Crown className="h-4 w-4" />, description: "Strategic KPIs, treasury health, board reports" },
  CFO: { icon: <Landmark className="h-4 w-4" />, description: "Cash position, liquidity, approvals, reports" },
  Treasurer: { icon: <Briefcase className="h-4 w-4" />, description: "Payments, bank balances, FX, forecasts" },
  "Risk Officer": { icon: <AlertTriangle className="h-4 w-4" />, description: "Incidents, alerts, policy violations" },
  "Compliance Officer": { icon: <ShieldCheck className="h-4 w-4" />, description: "Regulatory events, exceptions, audit" },
  Auditor: { icon: <FileSearch className="h-4 w-4" />, description: "Audit trail, ledger, transaction history" },
  Developer: { icon: <Terminal className="h-4 w-4" />, description: "API usage, webhooks, platform health" },
  "Finance Manager": { icon: <Briefcase className="h-4 w-4" />, description: "Vendor payments, reports, operations" },
};

const ALL_PERSONAS: PersonaRole[] = [
  "CEO", "CFO", "Treasurer", "Risk Officer", "Compliance Officer", "Auditor", "Developer", "Finance Manager",
];

export function CommandCenterPanel({
  selected,
  onSelect,
}: {
  selected: PersonaRole;
  onSelect: (p: PersonaRole) => void;
}) {
  return (
    <div className="space-y-1">
      <p className="text-[10px] uppercase tracking-[0.15em] text-zinc-500 font-semibold px-2 mb-2">Command Center</p>
      <p className="text-[10px] text-zinc-600 px-2 mb-3">Select a persona to tailor Copilot intelligence to your role.</p>
      {ALL_PERSONAS.map((p) => {
        const cfg = PERSONA_CONFIG[p];
        const active = p === selected;
        return (
          <button
            key={p}
            onClick={() => onSelect(p)}
            className={cn(
              "flex w-full items-center gap-2 rounded-lg px-2.5 py-2 text-left transition-all",
              active
                ? "bg-gold/10 text-gold"
                : "text-zinc-400 hover:bg-white/[0.03] hover:text-zinc-200",
            )}
          >
            <span className={cn(
              "shrink-0 flex items-center justify-center",
              active ? "text-gold" : "text-zinc-500",
            )}>
              {cfg.icon}
            </span>
            <div className="min-w-0 flex-1">
              <p className="text-[11px] font-medium truncate">{p}</p>
              <p className="text-[9px] text-zinc-600 truncate">{cfg.description}</p>
            </div>
          </button>
        );
      })}
    </div>
  );
}
