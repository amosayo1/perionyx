"use client";

import { useState, useMemo } from "react";
import { cn } from "@/lib/utils";
import { Lightbulb, AlertTriangle } from "lucide-react";
import { MOCK_RECOMMENDATIONS, MOCK_ENTITIES } from "./data";

const PRIORITY_ORDER: Record<string, number> = { critical: 0, high: 1, medium: 2, low: 3 };

const CATEGORIES = [
  "All",
  "close_dormant",
  "merge_duplicate",
  "renew_mandates",
  "complete_kyc",
  "reduce_relationships",
  "increase_controls",
  "consolidate_currencies",
  "transfer_balances",
  "improve_coverage",
  "reduce_compliance",
];

const CATEGORY_MAP: Record<string, string> = {
  close_dormant: "Close Dormant",
  merge_duplicate: "Merge Duplicate",
  renew_mandates: "Renew Mandates",
  complete_kyc: "Complete KYC",
  reduce_relationships: "Reduce Relationships",
  increase_controls: "Increase Controls",
  consolidate_currencies: "Consolidate Currencies",
  transfer_balances: "Transfer Balances",
  improve_coverage: "Improve Coverage",
  reduce_compliance: "Reduce Compliance",
};

const DATA_CATEGORY_MAP: Record<string, string[]> = {
  close_dormant: ["Cost Reduction", "Dormant Risk"],
  merge_duplicate: ["Consolidation", "Optimization"],
  renew_mandates: ["Mandate Renewal"],
  complete_kyc: ["KYC Remediation", "KYC"],
  reduce_relationships: ["Optimization", "Consolidation"],
  increase_controls: ["Risk Mitigation"],
  consolidate_currencies: ["Liquidity Management", "Optimization"],
  transfer_balances: ["Liquidity Management"],
  improve_coverage: ["Mandate Renewal", "Compliance"],
  reduce_compliance: ["Compliance"],
};

function matchesCategory(recCategory: string, filterSlug: string): boolean {
  const mapped = DATA_CATEGORY_MAP[filterSlug] ?? [];
  return mapped.some((c) => recCategory.toLowerCase().includes(c.toLowerCase()));
}

export function BankAccountRecommendationsPanel({ className }: { className?: string }) {
  const [categoryFilter, setCategoryFilter] = useState("All");
  const [entityFilter, setEntityFilter] = useState("All");

  const filtered = useMemo(() => {
    let list = [...MOCK_RECOMMENDATIONS];
    if (categoryFilter !== "All") {
      list = list.filter((r) => matchesCategory(r.category, categoryFilter));
    }
    if (entityFilter !== "All") {
      list = list.filter((r) => r.entity === entityFilter);
    }
    return list.sort((a, b) => PRIORITY_ORDER[a.priority] - PRIORITY_ORDER[b.priority]);
  }, [categoryFilter, entityFilter]);

  return (
    <div className={cn("rounded-lg border border-white/[0.06] bg-zinc-900/50", className)}>
      <div className="border-b border-white/[0.06] px-5 py-4">
        <h3 className="text-sm font-medium text-white">Bank Account Recommendations</h3>
        <p className="text-[12px] text-zinc-500">AI-powered recommendations for account optimization</p>
        <div className="mt-3 flex flex-wrap gap-2">
          <select
            className="rounded-md border border-white/[0.06] bg-zinc-800 px-2.5 py-1.5 text-[12px] text-zinc-300 outline-none focus:ring-1 focus:ring-[#c9a84c]/50"
            value={categoryFilter}
            onChange={(e) => setCategoryFilter(e.target.value)}
            aria-label="Filter by recommendation category"
          >
            {CATEGORIES.map((c) => (
              <option key={c} value={c}>
                {c === "All" ? "All Categories" : CATEGORY_MAP[c] ?? c}
              </option>
            ))}
          </select>
          <select
            className="rounded-md border border-white/[0.06] bg-zinc-800 px-2.5 py-1.5 text-[12px] text-zinc-300 outline-none focus:ring-1 focus:ring-[#c9a84c]/50"
            value={entityFilter}
            onChange={(e) => setEntityFilter(e.target.value)}
            aria-label="Filter by entity"
          >
            <option value="All">All Entities</option>
            {MOCK_ENTITIES.map((e) => (
              <option key={e} value={e}>
                {e}
              </option>
            ))}
          </select>
        </div>
      </div>
      <div className="divide-y divide-white/[0.06]" role="list" aria-label="Recommendations list">
        {filtered.map((rec) => (
          <div
            key={rec.id}
            role="listitem"
            className="flex items-start gap-4 px-5 py-4 transition-colors hover:bg-zinc-800/20"
          >
            <div
              className={cn(
                "mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-lg",
                rec.priority === "critical" ? "bg-red-500/10" : "bg-blue-500/10",
              )}
            >
              {rec.priority === "critical" ? (
                <AlertTriangle className="h-4 w-4 text-red-400" aria-hidden />
              ) : (
                <Lightbulb className="h-4 w-4 text-blue-400" aria-hidden />
              )}
            </div>
            <div className="min-w-0 flex-1">
              <div className="flex items-start justify-between gap-4">
                <div className="min-w-0">
                  <div className="flex items-center gap-2">
                    <p className="truncate text-[13px] font-medium text-white">{rec.title}</p>
                    <span
                      className={cn(
                        "shrink-0 rounded-full px-2 py-0.5 text-[10px] font-medium",
                        rec.priority === "critical" && "bg-red-500/10 text-red-400",
                        rec.priority === "high" && "bg-amber-500/10 text-amber-400",
                        rec.priority === "medium" && "bg-blue-500/10 text-blue-400",
                        rec.priority === "low" && "bg-zinc-500/10 text-zinc-400",
                      )}
                    >
                      {rec.priority}
                    </span>
                    <span className="shrink-0 rounded bg-white/[0.06] px-1.5 py-0.5 text-[10px] text-zinc-400">
                      {rec.category}
                    </span>
                  </div>
                  <p className="mt-1 text-[12px] text-zinc-400">{rec.description}</p>
                </div>
                <div className="shrink-0 text-right">
                  <p className="text-sm font-semibold text-[#c9a84c]">{rec.impact}</p>
                  <p className="text-[11px] text-zinc-500">{rec.roi}</p>
                </div>
              </div>
              <p className="mt-1.5 text-[11px] text-zinc-500">{rec.entity}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
