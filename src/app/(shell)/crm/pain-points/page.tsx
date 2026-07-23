import { redirect } from "next/navigation";
import { auth } from "@/server/auth/auth";
import { requireTenantContext } from "@/server/context/tenant-context";
import { PainPointService } from "@/modules/crm";
import { PageContainer } from "@/components/enterprise/page-container";
import { EnterprisePageHeader } from "@/components/enterprise/enterprise-page-header";
import { AlertTriangle, TrendingUp, TrendingDown, Minus } from "lucide-react";

const painPointService = new PainPointService();

const CATEGORY_COLORS: Record<string, string> = {
  "month-end-close": "text-rose-400 bg-rose-500/10",
  "reconciliation": "text-amber-400 bg-amber-500/10",
  "treasury": "text-emerald-400 bg-emerald-500/10",
  "approvals": "text-purple-400 bg-purple-500/10",
  "reporting": "text-cyan-400 bg-cyan-500/10",
  "fp&a": "text-blue-400 bg-blue-500/10",
  "tax": "text-orange-400 bg-orange-500/10",
  "audit": "text-red-400 bg-red-500/10",
  "compliance": "text-yellow-400 bg-yellow-500/10",
  "cash-management": "text-emerald-400 bg-emerald-500/10",
  "erp": "text-indigo-400 bg-indigo-500/10",
  "integration": "text-violet-400 bg-violet-500/10",
  "workflow": "text-pink-400 bg-pink-500/10",
  "collaboration": "text-sky-400 bg-sky-500/10",
  "data-collection": "text-teal-400 bg-teal-500/10",
  "internal-controls": "text-lime-400 bg-lime-500/10",
  "analytics": "text-[#c9a84c] bg-[#c9a84c]/10",
  "ai": "text-fuchsia-400 bg-fuchsia-500/10",
  "automation": "text-cyan-400 bg-cyan-500/10",
  "other": "text-zinc-400 bg-zinc-500/10",
};

function TrendIcon({ trend }: { trend?: string }) {
  if (trend === "growing") return <TrendingUp className="h-3 w-3 text-rose-400" />;
  if (trend === "declining") return <TrendingDown className="h-3 w-3 text-emerald-400" />;
  return <Minus className="h-3 w-3 text-zinc-500" />;
}

export default async function PainPointsPage() {
  const session = await auth();
  const ctx = requireTenantContext(session?.user?.id, session?.user?.activeCompanyId, session?.user?.companyRole);
  if (!ctx) redirect("/sign-in");

  const [painPoints, topPainPoints, growing] = await Promise.all([
    painPointService.list({}).catch(() => []),
    painPointService.getTopPainPoints(10).catch(() => []),
    painPointService.getFastestGrowingPainPoints(5).catch(() => []),
  ]);

  return (
    <PageContainer>
      <EnterprisePageHeader
        title="Pain Points"
        description="Tracked challenges across industries, roles, and finance domains"
      />

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <div className="rounded-2xl border border-white/[0.09] bg-[#101010] p-5">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg border border-white/[0.06] bg-white/[0.03] text-rose-400">
              <AlertTriangle className="h-5 w-5" />
            </div>
            <div>
              <p className="text-xs text-zinc-500">Total Tracked</p>
              <p className="text-2xl font-bold text-white">{painPoints.length}</p>
            </div>
          </div>
        </div>
        <div className="rounded-2xl border border-white/[0.09] bg-[#101010] p-5">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg border border-white/[0.06] bg-white/[0.03] text-amber-400">
              <TrendingUp className="h-5 w-5" />
            </div>
            <div>
              <p className="text-xs text-zinc-500">Categories</p>
              <p className="text-2xl font-bold text-white">{new Set(painPoints.map((p) => p.category)).size}</p>
            </div>
          </div>
        </div>
        <div className="rounded-2xl border border-white/[0.09] bg-[#101010] p-5">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg border border-white/[0.06] bg-white/[0.03] text-rose-400">
              <TrendingUp className="h-5 w-5" />
            </div>
            <div>
              <p className="text-xs text-zinc-500">Growing</p>
              <p className="text-2xl font-bold text-white">{growing.reduce((s, g) => s + g.count, 0)}</p>
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        <div className="rounded-2xl border border-white/[0.09] bg-[#101010] p-5">
          <h3 className="mb-4 text-sm font-semibold text-white">Top Pain Point Categories</h3>
          {topPainPoints.length > 0 ? (
            <div className="space-y-3">
              {topPainPoints.map((pp, i) => (
                <div key={i} className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-[10px] font-medium capitalize leading-4 ${
                      CATEGORY_COLORS[pp.category] ?? "text-zinc-400 bg-zinc-500/10"
                    }`}>
                      {pp.category.replace(/-/g, " ")}
                    </span>
                    <span className={`rounded px-1.5 py-0.5 text-[10px] ${
                      pp.severity === "high" ? "bg-rose-500/10 text-rose-400" :
                      pp.severity === "medium" ? "bg-amber-500/10 text-amber-400" :
                      "bg-zinc-500/10 text-zinc-400"
                    }`}>
                      {pp.severity}
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    <TrendIcon trend={pp.trend} />
                    <span className="text-sm font-medium text-white">{pp.count}</span>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-sm text-zinc-500">No pain points tracked yet</p>
          )}
        </div>

        <div className="rounded-2xl border border-white/[0.09] bg-[#101010] p-5">
          <h3 className="mb-4 text-sm font-semibold text-white">Fastest Growing Pain Points</h3>
          {growing.length > 0 ? (
            <div className="space-y-3">
              {growing.map((gp, i) => (
                <div key={i} className="flex items-center justify-between">
                  <span className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-[10px] font-medium capitalize leading-4 ${
                    CATEGORY_COLORS[gp.category] ?? "text-zinc-400 bg-zinc-500/10"
                  }`}>
                    {gp.category.replace(/-/g, " ")}
                  </span>
                  <span className="rounded bg-rose-500/10 px-2 py-0.5 text-xs text-rose-400">
                    +{gp.count}
                  </span>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-sm text-zinc-500">No growing pain points identified</p>
          )}
        </div>
      </div>
    </PageContainer>
  );
}
