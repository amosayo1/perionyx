"use client";

import { useState } from "react";
import { cn } from "@/lib/utils";
import {
  Shield,
  AlertTriangle,
  AlertCircle,
  CheckCircle2,
  Clock,
  User,
  Calendar,
  FileText,
  Filter,
  ChevronDown,
  ChevronRight,
  Ban,
  Info,
  Flag,
  TrendingUp,
} from "lucide-react";
import { MOCK_POLICIES, MOCK_BREACHES } from "./data";
import type { RiskPolicy, PolicyStatus, RiskBreach } from "./types";

const GOLD = "#c9a84c";

const CATEGORIES = ["FX", "Interest Rate", "Credit", "Liquidity", "Concentration", "Operational"];

const operatorSymbols: Record<string, string> = {
  lt: "<",
  gt: ">",
  lte: "≤",
  gte: "≥",
  eq: "=",
};

const statusConfig: Record<PolicyStatus, { label: string; color: string; icon: React.ElementType }> = {
  compliant: { label: "Compliant", color: "bg-emerald-500/20 text-emerald-300", icon: CheckCircle2 },
  breached: { label: "Breached", color: "bg-red-500/20 text-red-300", icon: AlertTriangle },
  pending_review: { label: "Pending Review", color: "bg-amber-500/20 text-amber-300", icon: Clock },
};

const breachSeverityConfig: Record<string, { label: string; color: string; icon: React.ElementType }> = {
  info: { label: "Info", color: "bg-blue-500/20 text-blue-300", icon: Info },
  warning: { label: "Warning", color: "bg-amber-500/20 text-amber-300", icon: Flag },
  critical: { label: "Critical", color: "bg-red-500/20 text-red-300", icon: AlertCircle },
  emergency: { label: "Emergency", color: "bg-red-500/30 text-red-200", icon: AlertTriangle },
};

function fmt(v: number): string {
  if (Math.abs(v) >= 1_000_000_000) return `${(v / 1_000_000_000).toFixed(2)}B`;
  if (Math.abs(v) >= 1_000_000) return `${(v / 1_000_000).toFixed(1)}M`;
  if (Math.abs(v) >= 1_000) return `${(v / 1_000).toFixed(0)}K`;
  return v.toFixed(0);
}

export function RiskPolicyCenter({ className }: { className?: string }) {
  const [expandedCategories, setExpandedCategories] = useState<string[]>(CATEGORIES);
  const [categoryFilter, setCategoryFilter] = useState<string>("all");

  const toggleCategory = (cat: string) => {
    setExpandedCategories((prev) =>
      prev.includes(cat) ? prev.filter((c) => c !== cat) : [...prev, cat]
    );
  };

  const filteredPolicies = MOCK_POLICIES.filter(
    (p) => categoryFilter === "all" || p.category === categoryFilter
  );

  const grouped = CATEGORIES.reduce<Record<string, RiskPolicy[]>>((acc, cat) => {
    const policies = filteredPolicies.filter((p) => p.category === cat);
    if (policies.length) acc[cat] = policies;
    return acc;
  }, {});

  const summary = {
    total: MOCK_POLICIES.length,
    breached: MOCK_POLICIES.filter((p) => p.status === "breached").length,
    pendingReview: MOCK_POLICIES.filter((p) => p.status === "pending_review").length,
  };

  const recentBreaches = MOCK_BREACHES.filter((b) => !b.resolved).slice(0, 5);

  return (
    <div className={cn("space-y-4", className)}>
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Shield className="h-5 w-5" style={{ color: GOLD }} aria-hidden="true" />
          <h2 className="text-lg font-semibold text-white">Risk Policy Center</h2>
        </div>
        <div className="flex items-center gap-2">
          <Filter className="h-4 w-4 text-zinc-400" aria-hidden="true" />
          <select
            aria-label="Filter by category"
            className="rounded-md border border-white/[0.06] bg-zinc-900 px-2 py-1 text-xs text-zinc-300"
            value={categoryFilter}
            onChange={(e) => setCategoryFilter(e.target.value)}
          >
            <option value="all">All Categories</option>
            {CATEGORIES.map((c) => (
              <option key={c} value={c}>{c}</option>
            ))}
          </select>
        </div>
      </div>

      <div className="grid grid-cols-4 gap-3">
        <div className="rounded-lg border border-white/[0.06] bg-zinc-900/50 p-3">
          <FileText className="h-3.5 w-3.5 text-zinc-500" aria-hidden="true" />
          <p className="mt-1 text-[11px] uppercase tracking-wider text-zinc-500">Total Policies</p>
          <p className="text-lg font-semibold text-white">{summary.total}</p>
        </div>
        <div className="rounded-lg border border-white/[0.06] bg-zinc-900/50 p-3">
          <AlertTriangle className="h-3.5 w-3.5 text-red-400" aria-hidden="true" />
          <p className="mt-1 text-[11px] uppercase tracking-wider text-zinc-500">Breached</p>
          <p className="text-lg font-semibold text-red-300">{summary.breached}</p>
        </div>
        <div className="rounded-lg border border-white/[0.06] bg-zinc-900/50 p-3">
          <Clock className="h-3.5 w-3.5 text-amber-400" aria-hidden="true" />
          <p className="mt-1 text-[11px] uppercase tracking-wider text-zinc-500">Pending Review</p>
          <p className="text-lg font-semibold text-amber-300">{summary.pendingReview}</p>
        </div>
        <div className="rounded-lg border border-white/[0.06] bg-zinc-900/50 p-3">
          <CheckCircle2 className="h-3.5 w-3.5 text-emerald-400" aria-hidden="true" />
          <p className="mt-1 text-[11px] uppercase tracking-wider text-zinc-500">Compliant</p>
          <p className="text-lg font-semibold text-emerald-300">{summary.total - summary.breached - summary.pendingReview}</p>
        </div>
      </div>

      <div className="space-y-2">
        {Object.entries(grouped).map(([category, policies]) => {
          const isExpanded = expandedCategories.includes(category);
          const categoryBreaches = policies.filter((p) => p.status === "breached").length;
          return (
            <div key={category} className="rounded-lg border border-white/[0.06] bg-zinc-900/50">
              <button
                onClick={() => toggleCategory(category)}
                className="flex w-full items-center justify-between px-4 py-3 text-left hover:bg-white/[0.02] transition-colors"
                aria-expanded={isExpanded}
                aria-label={`${category} policies section`}
              >
                <div className="flex items-center gap-2">
                  {isExpanded ? <ChevronDown className="h-4 w-4 text-zinc-500" aria-hidden="true" /> : <ChevronRight className="h-4 w-4 text-zinc-500" aria-hidden="true" />}
                  <span className="text-sm font-medium text-white">{category}</span>
                  <span className="rounded-full bg-zinc-800 px-2 py-0.5 text-[10px] text-zinc-400">{policies.length}</span>
                  {categoryBreaches > 0 && (
                    <span className="inline-flex items-center gap-1 rounded-full bg-red-500/20 px-2 py-0.5 text-[10px] font-medium text-red-300">
                      <AlertTriangle className="h-3 w-3" aria-hidden="true" />
                      {categoryBreaches} breached
                    </span>
                  )}
                </div>
              </button>
              {isExpanded && (
                <div className="border-t border-white/[0.06]">
                  {policies.map((p) => {
                    const StatusIcon = statusConfig[p.status].icon;
                    const isBreached = p.status === "breached";
                    return (
                      <div
                        key={p.id}
                        className={cn(
                          "border-b border-white/[0.03] px-4 py-3 last:border-0 transition-colors hover:bg-white/[0.02]",
                          isBreached && "border-l-2 border-l-red-500"
                        )}
                        role="region"
                        aria-label={`Policy: ${p.name}`}
                      >
                        <div className="flex items-start justify-between">
                          <div className="flex items-center gap-2">
                            {isBreached && <AlertTriangle className="h-4 w-4 text-red-400" aria-hidden="true" />}
                            <p className="text-sm font-medium text-white">{p.name}</p>
                          </div>
                          <span className={cn("inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[10px] font-medium", statusConfig[p.status].color)}>
                            <StatusIcon className="h-3 w-3" aria-hidden="true" />
                            {statusConfig[p.status].label}
                          </span>
                        </div>
                        <div className="mt-2 flex flex-wrap gap-x-6 gap-y-1.5">
                          <div className="flex items-center gap-1">
                            <span className="text-[11px] text-zinc-500">Threshold:</span>
                            <span className="text-[11px] font-medium text-zinc-200">
                              {operatorSymbols[p.operator] ?? p.operator} ${fmt(p.threshold)}
                            </span>
                          </div>
                          <div className="flex items-center gap-1">
                            <span className="text-[11px] text-zinc-500">Current:</span>
                            <span className={cn(
                              "text-[11px] font-medium",
                              isBreached ? "text-red-300" : "text-emerald-300"
                            )}>
                              ${fmt(p.currentValue)}
                            </span>
                          </div>
                          <div className="flex items-center gap-1">
                            <User className="h-3 w-3 text-zinc-500" aria-hidden="true" />
                            <span className="text-[11px] text-zinc-500">{p.owner}</span>
                          </div>
                          <div className="flex items-center gap-1">
                            <FileText className="h-3 w-3 text-zinc-500" aria-hidden="true" />
                            <span className="text-[11px] text-zinc-500">{p.approvalRequired}</span>
                          </div>
                          <div className="flex items-center gap-1">
                            <Calendar className="h-3 w-3 text-zinc-500" aria-hidden="true" />
                            <span className="text-[11px] text-zinc-500">Last: {p.lastReview}</span>
                          </div>
                          <div className="flex items-center gap-1">
                            <Calendar className="h-3 w-3 text-zinc-500" aria-hidden="true" />
                            <span className="text-[11px] text-zinc-500">Next: {p.nextReview}</span>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          );
        })}
      </div>

      <div className="rounded-lg border border-white/[0.06] bg-zinc-900/50 p-4">
        <div className="mb-3 flex items-center gap-2">
          <AlertTriangle className="h-4 w-4 text-red-400" aria-hidden="true" />
          <h3 className="text-sm font-medium text-white">Recent Unresolved Breaches</h3>
        </div>
        <div className="space-y-2">
          {recentBreaches.length === 0 && (
            <p className="text-xs text-zinc-500">No unresolved breaches.</p>
          )}
          {recentBreaches.map((breach) => {
            const BreachIcon = breachSeverityConfig[breach.severity]?.icon || AlertCircle;
            return (
              <div key={breach.id} className="rounded-md border border-white/[0.06] bg-zinc-800/30 p-3">
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-2">
                    <BreachIcon className={cn("h-3.5 w-3.5", breach.severity === "emergency" ? "text-red-400" : breach.severity === "critical" ? "text-red-300" : breach.severity === "warning" ? "text-amber-300" : "text-blue-300")} aria-hidden="true" />
                    <span className="text-xs font-medium text-white">{breach.policy}</span>
                    <span className={cn(
                      "inline-flex items-center rounded-full px-1.5 py-0.5 text-[9px] font-medium",
                      breachSeverityConfig[breach.severity]?.color || "text-zinc-300"
                    )}>
                      {breach.severity}
                    </span>
                  </div>
                  <span className="text-[10px] text-zinc-600">{breach.breachedAt}</span>
                </div>
                <p className="mt-1 text-[11px] text-zinc-400">{breach.description}</p>
                <div className="mt-1.5 flex items-center gap-4 text-[10px] text-zinc-500">
                  <span>{breach.entity}</span>
                  <span>{breach.owner}</span>
                  <span className="text-zinc-600">{breach.remediation}</span>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}