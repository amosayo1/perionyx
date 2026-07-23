"use client";

import { useMemo } from "react";
import { cn } from "@/lib/utils";
import {
  Building2, MapPin, Globe, Users, Calendar, Shield, Award,
  ChevronRight,
} from "lucide-react";
import { MOCK_RELATIONSHIPS, MOCK_ACCOUNTS } from "./data";
import type { BankRelationship, RelationshipScore, RiskRating } from "./types";

const SCORE_STYLES: Record<RelationshipScore, string> = {
  platinum: "bg-purple-500/15 text-purple-400 border-purple-500/25",
  gold: "bg-amber-500/15 text-amber-400 border-amber-500/25",
  silver: "bg-zinc-500/15 text-zinc-400 border-zinc-500/25",
  bronze: "bg-orange-500/15 text-orange-400 border-orange-500/25",
  at_risk: "bg-red-500/15 text-red-400 border-red-500/25",
};

const RISK_STYLES: Record<RiskRating, string> = {
  low: "text-emerald-400",
  medium: "text-amber-400",
  high: "text-red-400",
  critical: "text-red-300 animate-pulse",
};

const SERVICE_STYLES: Record<string, string> = {
  premium: "bg-[#c9a84c]/15 text-[#c9a84c] border-[#c9a84c]/25",
  standard: "bg-blue-500/15 text-blue-400 border-blue-500/25",
  basic: "bg-zinc-500/15 text-zinc-400 border-zinc-500/25",
};

const fmtCurrency = (v: number) =>
  `$${Math.abs(v).toLocaleString("en-US", { minimumFractionDigits: 0 })}`;

export function BankRelationshipCenter() {
  const summary = useMemo(() => {
    const totalBanks = MOCK_RELATIONSHIPS.length;
    const totalBalance = MOCK_RELATIONSHIPS.reduce((s, r) => s + r.totalBalance, 0);
    const avgScore = Math.round(
      MOCK_RELATIONSHIPS.reduce((s, r) => s + r.scoreValue, 0) / totalBanks,
    );
    const highestRisk = MOCK_RELATIONSHIPS.reduce<BankRelationship | null>((worst, r) => {
      const order: RiskRating[] = ["low", "medium", "high", "critical"];
      if (!worst) return r;
      return order.indexOf(r.riskRating) > order.indexOf(worst.riskRating) ? r : worst;
    }, null);
    return { totalBanks, totalBalance, avgScore, highestRisk };
  }, []);

  return (
    <div className="space-y-6" role="region" aria-label="Bank Relationship Center">
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
        <div className="rounded-xl border border-white/[0.06] bg-zinc-900/50 p-4">
          <p className="text-[11px] font-medium uppercase tracking-[0.08em] text-zinc-500">Total Banks</p>
          <p className="mt-1 text-2xl font-semibold text-white">{summary.totalBanks}</p>
        </div>
        <div className="rounded-xl border border-white/[0.06] bg-zinc-900/50 p-4">
          <p className="text-[11px] font-medium uppercase tracking-[0.08em] text-zinc-500">Total Balance</p>
          <p className="mt-1 text-2xl font-semibold text-white">{fmtCurrency(summary.totalBalance)}</p>
        </div>
        <div className="rounded-xl border border-white/[0.06] bg-zinc-900/50 p-4">
          <p className="text-[11px] font-medium uppercase tracking-[0.08em] text-zinc-500">Avg Relationship Score</p>
          <p className="mt-1 text-2xl font-semibold text-[#c9a84c]">{summary.avgScore}/100</p>
        </div>
        <div className="rounded-xl border border-white/[0.06] bg-zinc-900/50 p-4">
          <p className="text-[11px] font-medium uppercase tracking-[0.08em] text-zinc-500">Highest Risk Bank</p>
          <p className={cn("mt-1 text-lg font-semibold", summary.highestRisk ? RISK_STYLES[summary.highestRisk.riskRating] : "text-zinc-500")}>
            {summary.highestRisk?.bankName ?? "N/A"}
          </p>
        </div>
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        {MOCK_RELATIONSHIPS.map((rel) => (
          <div
            key={rel.id}
            className="group rounded-xl border border-white/[0.06] bg-zinc-900/40 p-5 transition-colors hover:bg-zinc-900/60"
            role="article"
            aria-label={`Relationship with ${rel.bankName}`}
          >
            <div className="flex items-start justify-between">
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-[#c9a84c]/10 text-[#c9a84c]">
                  <Building2 className="h-5 w-5" />
                </div>
                <div>
                  <h3 className="text-[14px] font-semibold text-white">{rel.bankName}</h3>
                  <div className="mt-0.5 flex items-center gap-2 text-[11px] text-zinc-500">
                    <MapPin className="h-3 w-3" />
                    {rel.region}, {rel.country}
                  </div>
                </div>
              </div>
              <span
                className={cn(
                  "inline-flex items-center rounded-md border px-2.5 py-1 text-[11px] font-semibold capitalize",
                  SCORE_STYLES[rel.relationshipScore],
                )}
              >
                <Award className="mr-1 h-3 w-3" />
                {rel.relationshipScore}
              </span>
            </div>

            <div className="mt-4 grid grid-cols-3 gap-4 border-b border-t border-white/[0.04] py-3">
              <div>
                <p className="text-[11px] text-zinc-500">Accounts</p>
                <p className="text-[13px] font-semibold text-white">{rel.totalAccounts}</p>
              </div>
              <div>
                <p className="text-[11px] text-zinc-500">Total Balance</p>
                <p className="text-[13px] font-semibold text-white">{fmtCurrency(rel.totalBalance)}</p>
              </div>
              <div>
                <p className="text-[11px] text-zinc-500">Risk</p>
                <p className={cn("text-[13px] font-semibold capitalize", RISK_STYLES[rel.riskRating])}>{rel.riskRating}</p>
              </div>
            </div>

            <div className="mt-3">
              <p className="mb-1.5 text-[11px] font-medium text-zinc-500">Products</p>
              <div className="flex flex-wrap gap-1.5">
                {rel.productsUsed.slice(0, 5).map((p) => (
                  <span
                    key={p}
                    className="rounded-md border border-white/[0.06] bg-zinc-800/50 px-2 py-0.5 text-[10px] text-zinc-400"
                  >
                    {p}
                  </span>
                ))}
                {rel.productsUsed.length > 5 && (
                  <span className="rounded-md border border-white/[0.06] bg-zinc-800/50 px-2 py-0.5 text-[10px] text-zinc-500">
                    +{rel.productsUsed.length - 5}
                  </span>
                )}
              </div>
            </div>

            <div className="mt-3 flex flex-wrap items-center gap-x-4 gap-y-1.5 text-[11px] text-zinc-500">
              <div className="flex items-center gap-1">
                <Users className="h-3 w-3" />
                {rel.primaryContact}
              </div>
              <div className="flex items-center gap-1">
                <Globe className="h-3 w-3" />
                RM: {rel.relationshipManager}
              </div>
              <div className="flex items-center gap-1">
                <Calendar className="h-3 w-3" />
                Last review: {rel.lastReview}
              </div>
            </div>

            <div className="mt-3 flex items-center justify-between">
              <span
                className={cn(
                  "inline-flex items-center rounded-md border px-2 py-0.5 text-[10px] font-medium capitalize",
                  SERVICE_STYLES[rel.serviceLevel],
                )}
              >
                <Shield className="mr-1 h-3 w-3" />
                {rel.serviceLevel}
              </span>
              <ChevronRight className="h-4 w-4 text-zinc-600 opacity-0 transition-opacity group-hover:opacity-100" />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
