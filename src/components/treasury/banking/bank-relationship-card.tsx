"use client";

import { cn } from "@/lib/utils";
import { Building2, User, Activity, Calendar } from "lucide-react";
import type { BankRelationship } from "@/server/banking/workspace";

const riskColor = {
  LOW: "text-emerald-400",
  MEDIUM: "text-amber-400",
  HIGH: "text-red-400",
};

const riskBg = {
  LOW: "bg-emerald-500/10",
  MEDIUM: "bg-amber-500/10",
  HIGH: "bg-red-500/10",
};

interface BankRelationshipCardProps {
  relationships: BankRelationship[];
  className?: string;
}

export function BankRelationshipCard({ relationships, className }: BankRelationshipCardProps) {
  return (
    <div className={cn("space-y-2", className)}>
      {relationships.map((r) => (
        <div
          key={r.id}
          className="flex items-center justify-between rounded-lg border border-white/[0.06] bg-zinc-900/40 p-4"
        >
          <div className="flex items-center gap-3">
            <div className={cn("flex h-10 w-10 items-center justify-center rounded-lg", riskBg[r.riskRating])}>
              <Building2 className={cn("h-5 w-5", riskColor[r.riskRating])} />
            </div>
            <div>
              <p className="text-[13px] font-medium text-white">{r.institution}</p>
              <div className="flex items-center gap-2 text-[11px] text-zinc-500">
                <User className="h-3 w-3" />
                <span>{r.relationshipManager}</span>
              </div>
            </div>
          </div>

          <div className="hidden items-center gap-5 md:flex">
            <div className="text-center">
              <p className="text-[13px] font-semibold text-white">{r.accountCount}</p>
              <p className="text-[10px] text-zinc-500">Accounts</p>
            </div>
            <div className="text-center">
              <p className="text-[13px] font-semibold text-white">{r.monthlyVolume}</p>
              <p className="text-[10px] text-zinc-500">Monthly</p>
            </div>
            <div className="text-center">
              <p className={cn("text-[13px] font-semibold", riskColor[r.riskRating])}>{r.riskRating}</p>
              <p className="text-[10px] text-zinc-500">Risk</p>
            </div>
            <div className="text-center">
              <p className="text-[13px] font-semibold text-white">{r.healthScore}</p>
              <p className="text-[10px] text-zinc-500">Health</p>
            </div>
          </div>

          <div className="flex items-center gap-2 text-[11px] text-zinc-500">
            <Calendar className="h-3 w-3" />
            <span>Reviewed {r.lastReview}</span>
          </div>
        </div>
      ))}
    </div>
  );
}