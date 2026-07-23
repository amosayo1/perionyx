import { redirect } from "next/navigation";
import Link from "next/link";
import { auth } from "@/server/auth/auth";
import { requireTenantContext } from "@/server/context/tenant-context";
import { CFOAdvisorService } from "@/modules/cfo-advisor/cfo-advisor.service";
import { PageContainer } from "@/components/enterprise/page-container";
import { EnterprisePageHeader } from "@/components/enterprise/enterprise-page-header";
import { MetricCard } from "@/components/enterprise/metric-card";
import { RecommendationCard } from "@/components/cfo-advisor/recommendation-card";
import {
  Lightbulb,
  Clock,
  CheckCircle,
  XCircle,
  Filter,
  ArrowLeft,
} from "lucide-react";

interface PageProps {
  searchParams: Promise<{
    category?: string;
    status?: string;
  }>;
}

export default async function RecommendationsPage({ searchParams }: PageProps) {
  const session = await auth();
  const ctx = requireTenantContext(
    session?.user?.id,
    session?.user?.activeCompanyId,
    session?.user?.companyRole,
  );
  if (!ctx) redirect("/sign-in");

  const params = await searchParams;

  const result = await CFOAdvisorService.getRecommendations(ctx, {
    category: params.category as "cash" | "liquidity" | "working_capital" | "revenue" | "expense" | "treasury" | "compliance" | "risk" | "close" | "strategic" | undefined,
    status: params.status as "PENDING" | "ACKNOWLEDGED" | "ACCEPTED" | "REJECTED" | "EXECUTED" | undefined,
    limit: 50,
  }).catch(() => ({ items: [], total: 0, page: 1, limit: 50, totalPages: 0 }));

  const items = result.items;
  const total = result.total;
  const pending = items.filter((r) => r.status === "PENDING").length;
  const accepted = items.filter((r) => r.status === "ACCEPTED").length;
  const rejected = items.filter((r) => r.status === "REJECTED").length;

  const activeCategory = params.category ?? null;
  const activeStatus = params.status ?? null;

  return (
    <PageContainer>
      <EnterprisePageHeader
        title="Recommendation Center"
        description="AI-generated financial recommendations — review, accept, or reject"
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
        <MetricCard label="Total Recommendations" value={total} icon={<Lightbulb className="h-5 w-5" />} color="blue" />
        <MetricCard label="Pending Review" value={pending} icon={<Clock className="h-5 w-5" />} color="amber" />
        <MetricCard label="Accepted" value={accepted} icon={<CheckCircle className="h-5 w-5" />} color="emerald" />
        <MetricCard label="Rejected" value={rejected} icon={<XCircle className="h-5 w-5" />} color="red" />
      </div>

      <div className="flex flex-wrap items-center gap-2">
        <span className="flex items-center gap-1.5 text-xs text-zinc-500">
          <Filter className="h-3.5 w-3.5" />
          Filter:
        </span>
        {[
          { label: "All", href: "/cfo/recommendations", active: !activeCategory && !activeStatus },
          { label: "Pending", href: "/cfo/recommendations?status=PENDING", active: activeStatus === "PENDING" },
          { label: "Accepted", href: "/cfo/recommendations?status=ACCEPTED", active: activeStatus === "ACCEPTED" },
          { label: "Rejected", href: "/cfo/recommendations?status=REJECTED", active: activeStatus === "REJECTED" },
          { label: "Cash", href: "/cfo/recommendations?category=cash", active: activeCategory === "cash" },
          { label: "Treasury", href: "/cfo/recommendations?category=treasury", active: activeCategory === "treasury" },
          { label: "Risk", href: "/cfo/recommendations?category=risk", active: activeCategory === "risk" },
          { label: "Compliance", href: "/cfo/recommendations?category=compliance", active: activeCategory === "compliance" },
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

      <div className="space-y-4">
        {items.map((rec) => (
          <RecommendationCard
            key={rec.id}
            recommendation={{
              id: rec.id,
              title: rec.title,
              category: rec.category,
              summary: rec.executiveSummary,
              businessReason: rec.businessReason,
              confidence: Math.round(rec.confidence * 100),
              riskLevel: rec.riskLevel.toLowerCase() as "low" | "medium" | "high" | "critical",
              requiredApprovals: rec.requiredApprovals,
            }}
          />
        ))}
        {items.length === 0 && (
          <div className="flex flex-col items-center justify-center rounded-2xl border border-white/[0.09] bg-[#101010] py-16 text-center">
            <Lightbulb className="mb-3 h-8 w-8 text-zinc-500" />
            <p className="text-sm text-zinc-400">No recommendations found</p>
            <p className="mt-1 text-xs text-zinc-500">
              {activeCategory || activeStatus
                ? "Try adjusting your filters"
                : "Recommendations will appear here once generated"}
            </p>
          </div>
        )}
      </div>
    </PageContainer>
  );
}
