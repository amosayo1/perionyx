import { redirect } from "next/navigation";
import Link from "next/link";
import { auth } from "@/server/auth/auth";
import { requireTenantContext } from "@/server/context/tenant-context";
import { CFOAdvisorService } from "@/modules/cfo-advisor/cfo-advisor.service";
import { PageContainer } from "@/components/enterprise/page-container";
import { EnterprisePageHeader } from "@/components/enterprise/enterprise-page-header";
import { MetricCard } from "@/components/enterprise/metric-card";
import {
  GitBranch,
  Clock,
  CheckCircle,
  XCircle,
  PlayCircle,
  AlertTriangle,
  ArrowLeft,
  Lightbulb,
} from "lucide-react";

const STATUS_CONFIG: Record<string, { label: string; color: string; bg: string }> = {
  PENDING: { label: "Pending", color: "text-amber-400", bg: "bg-amber-400/10" },
  APPROVED: { label: "Approved", color: "text-emerald-400", bg: "bg-emerald-400/10" },
  REJECTED: { label: "Rejected", color: "text-red-400", bg: "bg-red-400/10" },
  DEFERRED: { label: "Deferred", color: "text-zinc-400", bg: "bg-zinc-400/10" },
  EXECUTED: { label: "Executed", color: "text-blue-400", bg: "bg-blue-400/10" },
};

const RISK_CONFIG: Record<string, { color: string; bg: string }> = {
  LOW: { color: "text-emerald-400", bg: "bg-emerald-400/10" },
  MEDIUM: { color: "text-amber-400", bg: "bg-amber-400/10" },
  HIGH: { color: "text-orange-400", bg: "bg-orange-400/10" },
  CRITICAL: { color: "text-red-400", bg: "bg-red-400/10" },
};

interface PageProps {
  searchParams: Promise<{
    type?: string;
    status?: string;
    risk?: string;
  }>;
}

export default async function DecisionsPage({ searchParams }: PageProps) {
  const session = await auth();
  const ctx = requireTenantContext(
    session?.user?.id,
    session?.user?.activeCompanyId,
    session?.user?.companyRole,
  );
  if (!ctx) redirect("/sign-in");

  const params = await searchParams;

  const result = await CFOAdvisorService.getDecisions(ctx, {
    decisionType: params.type as "strategic" | "operational" | "financial" | "risk" | "investment" | undefined,
    status: params.status as "PENDING" | "APPROVED" | "REJECTED" | "DEFERRED" | "EXECUTED" | undefined,
    riskLevel: params.risk as "LOW" | "MEDIUM" | "HIGH" | "CRITICAL" | undefined,
    limit: 50,
  }).catch(() => ({ items: [], total: 0, page: 1, limit: 50, totalPages: 0 }));

  const items = result.items;
  const total = result.total;
  const pending = items.filter((d) => d.status === "PENDING").length;
  const approved = items.filter((d) => d.status === "APPROVED" || d.status === "EXECUTED").length;
  const rejected = items.filter((d) => d.status === "REJECTED").length;

  const activeType = params.type ?? null;
  const activeStatus = params.status ?? null;
  const activeRisk = params.risk ?? null;

  return (
    <PageContainer>
      <EnterprisePageHeader
        title="Decision History"
        description="Track and manage executive decisions — review rationale, approve, or defer"
        actions={
          <Link
            href="/cfo/dashboard"
            className="inline-flex items-center gap-2 rounded-xl border border-white/[0.09] bg-white/[0.04] px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-white/[0.08]"
          >
            <ArrowLeft className="h-4 w-4" />
            Back to Dashboard
          </Link>
        }
      />

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <MetricCard label="Total Decisions" value={total} icon={<GitBranch className="h-5 w-5" />} color="purple" />
        <MetricCard label="Pending" value={pending} icon={<Clock className="h-5 w-5" />} color="amber" />
        <MetricCard label="Approved / Executed" value={approved} icon={<CheckCircle className="h-5 w-5" />} color="emerald" />
        <MetricCard label="Rejected" value={rejected} icon={<XCircle className="h-5 w-5" />} color="red" />
      </div>

      <div className="flex flex-wrap items-center gap-2">
        <span className="flex items-center gap-1.5 text-xs text-zinc-500">
          <AlertTriangle className="h-3.5 w-3.5" />
          Filter:
        </span>
        {[
          { label: "All", href: "/cfo/decisions", active: !activeType && !activeStatus && !activeRisk },
          { label: "Pending", href: "/cfo/decisions?status=PENDING", active: activeStatus === "PENDING" },
          { label: "Approved", href: "/cfo/decisions?status=APPROVED", active: activeStatus === "APPROVED" },
          { label: "Executed", href: "/cfo/decisions?status=EXECUTED", active: activeStatus === "EXECUTED" },
          { label: "Strategic", href: "/cfo/decisions?type=strategic", active: activeType === "strategic" },
          { label: "Financial", href: "/cfo/decisions?type=financial", active: activeType === "financial" },
          { label: "Risk", href: "/cfo/decisions?type=risk", active: activeType === "risk" },
          { label: "High Risk", href: "/cfo/decisions?risk=HIGH", active: activeRisk === "HIGH" },
        ].map((f) => (
          <Link
            key={f.label}
            href={f.href}
            className={`rounded-lg px-3 py-1.5 text-xs font-medium transition-colors ${
              f.active
                ? "bg-[#d4af37]/20 text-[#d4af37]"
                : "bg-white/5 text-zinc-400 hover:bg-white/10 hover:text-white"
            }`}
          >
            {f.label}
          </Link>
        ))}
      </div>

      <div className="space-y-3">
        {items.map((decision) => {
          const sc = STATUS_CONFIG[decision.status] ?? STATUS_CONFIG.PENDING;
          const rc = RISK_CONFIG[decision.riskLevel] ?? RISK_CONFIG.LOW;
          return (
            <div
              key={decision.id}
              className="rounded-2xl border border-white/[0.09] bg-[#101010] p-5 transition-colors hover:border-white/[0.14]"
            >
              <div className="mb-3 flex items-start justify-between gap-3">
                <div className="flex-1">
                  <div className="flex items-center gap-2">
                    <h3 className="text-sm font-semibold text-white">{decision.title}</h3>
                    <span className={`rounded px-1.5 py-0.5 text-[10px] font-medium ${sc.bg} ${sc.color}`}>
                      {sc.label}
                    </span>
                    <span className={`rounded px-1.5 py-0.5 text-[10px] font-medium ${rc.bg} ${rc.color}`}>
                      {decision.riskLevel}
                    </span>
                  </div>
                  <p className="mt-1 text-xs text-zinc-500 capitalize">
                    {decision.decisionType.toLowerCase()}
                  </p>
                </div>
                <span className="shrink-0 text-[10px] text-zinc-600">
                  {new Date(decision.createdAt).toLocaleDateString("en-US", {
                    month: "short",
                    day: "numeric",
                    year: "numeric",
                  })}
                </span>
              </div>

              {decision.description && (
                <p className="mb-3 text-xs leading-relaxed text-zinc-400">{decision.description}</p>
              )}

              {decision.reasoning && (
                <div className="mb-3 rounded-lg border border-white/[0.06] bg-white/[0.02] p-3">
                  <p className="text-[11px] leading-relaxed text-zinc-500 italic">
                    &quot;{decision.reasoning}&quot;
                  </p>
                </div>
              )}

              {decision.recommendation && (
                <div className="mb-3 flex gap-2 rounded-lg bg-[#d4af37]/5 px-3 py-2">
                  <Lightbulb className="mt-0.5 h-3 w-3 shrink-0 text-[#d4af37]" />
                  <p className="text-[11px] leading-relaxed text-zinc-400">{decision.recommendation}</p>
                </div>
              )}

              {decision.approvedBy && (
                <div className="flex items-center gap-3 text-[10px] text-zinc-500">
                  <span>Approved by: {decision.approvedBy}</span>
                  {decision.approvedAt && (
                    <span>
                      {new Date(decision.approvedAt).toLocaleDateString("en-US", {
                        month: "short",
                        day: "numeric",
                        hour: "2-digit",
                        minute: "2-digit",
                      })}
                    </span>
                  )}
                </div>
              )}

              {decision.status === "PENDING" && (
                <div className="mt-3 flex gap-2 border-t border-white/[0.06] pt-3">
                  <Link
                    href={`/cfo/decisions`}
                    className="rounded-lg border border-emerald-400/20 bg-emerald-400/10 px-3 py-1.5 text-xs font-medium text-emerald-400 hover:bg-emerald-400/20 transition-colors"
                  >
                    <CheckCircle className="mr-1 inline h-3 w-3" />
                    Approve
                  </Link>
                  <Link
                    href={`/cfo/decisions`}
                    className="rounded-lg border border-red-400/20 bg-red-400/10 px-3 py-1.5 text-xs font-medium text-red-400 hover:bg-red-400/20 transition-colors"
                  >
                    <XCircle className="mr-1 inline h-3 w-3" />
                    Reject
                  </Link>
                  <Link
                    href={`/cfo/decisions`}
                    className="rounded-lg border border-white/10 bg-white/5 px-3 py-1.5 text-xs font-medium text-zinc-400 hover:bg-white/10 transition-colors"
                  >
                    <Clock className="mr-1 inline h-3 w-3" />
                    Defer
                  </Link>
                </div>
              )}
            </div>
          );
        })}
        {items.length === 0 && (
          <div className="flex flex-col items-center justify-center rounded-2xl border border-white/[0.09] bg-[#101010] py-16 text-center">
            <GitBranch className="mb-3 h-8 w-8 text-zinc-500" />
            <p className="text-sm text-zinc-400">No decisions found</p>
            <p className="mt-1 text-xs text-zinc-500">
              {activeType || activeStatus || activeRisk
                ? "Try adjusting your filters"
                : "Decisions will appear here once created"}
            </p>
          </div>
        )}
      </div>
    </PageContainer>
  );
}


