"use client";

import { useState, useMemo } from "react";
import { cn } from "@/lib/utils";
import { MOCK_KYC_PROFILES, MOCK_ENTITIES } from "./data";
import type { KYCStatus, RiskRating, KYCProfile } from "./types";
import { Search, Users, AlertTriangle, CheckCircle2, Clock, XCircle, FileText, UserCheck, Building2, Receipt } from "lucide-react";

const statusStyles: Record<KYCStatus, string> = {
  complete: "bg-emerald-500/10 text-emerald-400",
  pending: "bg-amber-500/10 text-amber-400",
  expired: "bg-red-500/10 text-red-400",
  in_review: "bg-blue-500/10 text-blue-400",
  missing_documents: "bg-red-500/10 text-red-400",
};

const riskStyles: Record<RiskRating, string> = {
  low: "bg-emerald-500/10 text-emerald-400",
  medium: "bg-amber-500/10 text-amber-400",
  high: "bg-red-500/10 text-red-400",
  critical: "bg-red-500/10 text-red-400",
};

const progressColor = (pct: number) => {
  if (pct >= 100) return "bg-emerald-400";
  if (pct >= 75) return "bg-blue-400";
  if (pct >= 50) return "bg-amber-400";
  return "bg-red-400";
};

const amlStyles: Record<string, string> = {
  cleared: "bg-emerald-500/10 text-emerald-400",
  pending: "bg-amber-500/10 text-amber-400",
  flagged: "bg-red-500/10 text-red-400",
};

export function KYCComplianceCenter() {
  const [search, setSearch] = useState("");
  const [entityFilter, setEntityFilter] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const [riskFilter, setRiskFilter] = useState("");

  const grouped = useMemo(() =>
    Object.entries(
      MOCK_KYC_PROFILES.reduce<Record<string, KYCProfile[]>>((acc, p) => {
        (acc[p.entity] = acc[p.entity] || []).push(p);
        return acc;
      }, {})
    ), []
  );

  const filtered = useMemo(() => {
    return grouped
      .map(([entity, profiles]) => {
        const filteredProfiles = profiles.filter((p: KYCProfile) => {
          if (entityFilter && p.entity !== entityFilter) return false;
          if (statusFilter && p.status !== statusFilter) return false;
          if (riskFilter && p.riskClassification !== riskFilter) return false;
          if (search && !p.entity.toLowerCase().includes(search.toLowerCase())) return false;
          return true;
        });
        return [entity, filteredProfiles] as [string, KYCProfile[]];
      })
      .filter(([, profiles]) => profiles.length > 0);
  }, [search, entityFilter, statusFilter, riskFilter, grouped]);

  const totalProfiles = MOCK_KYC_PROFILES.length;
  const completeCount = MOCK_KYC_PROFILES.filter((p) => p.status === "complete").length;
  const pendingCount = MOCK_KYC_PROFILES.filter((p) => p.status === "pending" || p.status === "in_review" || p.status === "missing_documents").length;
  const expiredCount = MOCK_KYC_PROFILES.filter((p) => p.status === "expired").length;

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-sm font-medium text-white">KYC Compliance Center</h3>
          <p className="text-[12px] text-zinc-500">{totalProfiles} KYC profiles across {MOCK_ENTITIES.length} entities</p>
        </div>
        <div className="relative">
          <Search className="pointer-events-none absolute left-2.5 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-zinc-500" />
          <input
            type="text"
            placeholder="Search by entity..."
            aria-label="Search KYC profiles"
            className="w-56 rounded-md border border-white/[0.06] bg-zinc-800/50 py-1.5 pl-8 pr-3 text-[13px] text-white placeholder-zinc-500 outline-none focus:border-amber-500/30 focus:ring-1 focus:ring-amber-500/20"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
      </div>

      <div className="grid grid-cols-4 gap-3">
        <div className="rounded-lg border border-white/[0.06] bg-zinc-900/50 p-4">
          <div className="flex items-center gap-2">
            <Users className="h-4 w-4 text-blue-400" />
            <span className="text-[12px] text-zinc-500">Total Profiles</span>
          </div>
          <p className="mt-1 text-xl font-semibold text-white">{totalProfiles}</p>
        </div>
        <div className="rounded-lg border border-white/[0.06] bg-zinc-900/50 p-4">
          <div className="flex items-center gap-2">
            <CheckCircle2 className="h-4 w-4 text-emerald-400" />
            <span className="text-[12px] text-zinc-500">Complete</span>
          </div>
          <p className="mt-1 text-xl font-semibold text-emerald-400">{completeCount}</p>
        </div>
        <div className="rounded-lg border border-white/[0.06] bg-zinc-900/50 p-4">
          <div className="flex items-center gap-2">
            <Clock className="h-4 w-4 text-amber-400" />
            <span className="text-[12px] text-zinc-500">Pending / In Review</span>
          </div>
          <p className="mt-1 text-xl font-semibold text-amber-400">{pendingCount}</p>
        </div>
        <div className="rounded-lg border border-white/[0.06] bg-zinc-900/50 p-4">
          <div className="flex items-center gap-2">
            <XCircle className="h-4 w-4 text-red-400" />
            <span className="text-[12px] text-zinc-500">Expired</span>
          </div>
          <p className="mt-1 text-xl font-semibold text-red-400">{expiredCount}</p>
        </div>
      </div>

      <div className="flex flex-wrap gap-2">
        <select
          aria-label="Filter by entity"
          className="rounded-md border border-white/[0.06] bg-zinc-800/50 px-3 py-1.5 text-[12px] text-zinc-300 outline-none focus:border-amber-500/30"
          value={entityFilter}
          onChange={(e) => setEntityFilter(e.target.value)}
        >
          <option value="">All Entities</option>
          {MOCK_ENTITIES.map((e) => (
            <option key={e} value={e}>{e}</option>
          ))}
        </select>
        <select
          aria-label="Filter by status"
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
          className="rounded-md border border-white/[0.06] bg-zinc-800/50 px-3 py-1.5 text-[12px] text-zinc-300 outline-none focus:border-amber-500/30"
        >
          <option value="">All Statuses</option>
          <option value="complete">Complete</option>
          <option value="pending">Pending</option>
          <option value="expired">Expired</option>
          <option value="in_review">In Review</option>
          <option value="missing_documents">Missing Documents</option>
        </select>
        <select
          aria-label="Filter by risk classification"
          value={riskFilter}
          onChange={(e) => setRiskFilter(e.target.value)}
          className="rounded-md border border-white/[0.06] bg-zinc-800/50 px-3 py-1.5 text-[12px] text-zinc-300 outline-none focus:border-amber-500/30"
        >
          <option value="">All Risk Levels</option>
          <option value="low">Low</option>
          <option value="medium">Medium</option>
          <option value="high">High</option>
          <option value="critical">Critical</option>
        </select>
      </div>

      <div className="space-y-3">
        {filtered.map(([entity, profiles]) => (
          <div key={entity} className="rounded-lg border border-white/[0.06] bg-zinc-900/50">
            <div className="flex items-center gap-2 border-b border-white/[0.06] px-5 py-3">
              <Building2 className="h-4 w-4 text-zinc-400" />
              <h4 className="text-sm font-medium text-white">{entity}</h4>
              <span className="ml-auto rounded-full bg-zinc-800 px-2 py-0.5 text-[11px] text-zinc-500">{profiles.length} profile{profiles.length !== 1 ? "s" : ""}</span>
            </div>
            <div className="divide-y divide-white/[0.03]">
              {profiles.map((p) => (
                <div key={p.entityId} className="px-5 py-4 transition-colors hover:bg-zinc-800/30">
                  <div className="flex items-start justify-between">
                    <div className="flex-1 space-y-3">
                      <div className="flex items-center gap-3">
                        <span className={cn("inline-block rounded-full px-2 py-0.5 text-[11px] font-medium capitalize", statusStyles[p.status])}>
                          {p.status.replace(/_/g, " ")}
                        </span>
                        <span className={cn("inline-block rounded-full px-2 py-0.5 text-[11px] font-medium capitalize", riskStyles[p.riskClassification])}>
                          {p.riskClassification}
                        </span>
                        <span className={cn("inline-block rounded-full px-2 py-0.5 text-[11px] font-medium", amlStyles[p.amlReview])}>
                          AML: {p.amlReview}
                        </span>
                      </div>
                      <div className="flex items-center gap-4 text-[12px] text-zinc-500">
                        <span className="flex items-center gap-1">
                          <FileText className="h-3 w-3" />
                          Board Resolution: {p.boardResolution ? <span className="text-emerald-400">Received</span> : <span className="text-red-400">Missing</span>}
                        </span>
                        <span className="text-zinc-600">|</span>
                        <span className="flex items-center gap-1">
                          <Receipt className="h-3 w-3" />
                          Tax Forms: {p.taxForms.length} on file
                        </span>
                      </div>
                      <div className="flex items-center gap-1.5">
                        {p.beneficialOwners.map((bo, i) => (
                          <span
                            key={i}
                            title={`${bo.name} - ${bo.ownershipPercentage}% - ${bo.status}`}
                            className="flex items-center gap-1 rounded-md bg-zinc-800/70 px-2 py-1 text-[11px] text-zinc-400"
                          >
                            <UserCheck className="h-3 w-3" />
                            {bo.name.split(" ").slice(0, 2).join(" ")} {bo.ownershipPercentage}%
                          </span>
                        ))}
                      </div>
                    </div>
                    <div className="ml-6 w-40">
                      <div className="mb-1 flex items-center justify-between text-[11px]">
                        <span className="text-zinc-500">Completion</span>
                        <span className={cn("font-medium", p.completionPercentage >= 100 ? "text-emerald-400" : p.completionPercentage >= 75 ? "text-blue-400" : p.completionPercentage >= 50 ? "text-amber-400" : "text-red-400")}>
                          {p.completionPercentage}%
                        </span>
                      </div>
                      <div className="h-1.5 overflow-hidden rounded-full bg-zinc-800">
                        <div
                          className={cn("h-full rounded-full transition-all duration-500", progressColor(p.completionPercentage))}
                          style={{ width: `${p.completionPercentage}%` }}
                        />
                      </div>
                      <p className="mt-1 text-[11px] text-zinc-600">Renewal: {p.renewalDate}</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}