import { redirect } from "next/navigation";
import Link from "next/link";
import { auth } from "@/server/auth/auth";
import { prisma } from "@/server/db/prisma";
import { requireTenantContext } from "@/server/context/tenant-context";
import { PageContainer } from "@/components/enterprise/page-container";
import { EnterprisePageHeader } from "@/components/enterprise/enterprise-page-header";
import { HealthDashboardGrid } from "@/components/intelligence-platform/health-dashboard-grid";

const SCORE_TYPES = ["integrity", "close-readiness", "treasury-health", "working-capital", "operational", "compliance"] as const;

export default async function IntelligencePage() {
  const session = await auth();
  const ctx = requireTenantContext(session?.user?.id, session?.user?.activeCompanyId, session?.user?.companyRole);
  if (!ctx) redirect("/sign-in");

  const [scores, recommendations, alerts, events, kpis] = await Promise.all([
    Promise.all(
      SCORE_TYPES.map((st) =>
        prisma.financialScore.findFirst({
          where: { companyId: ctx.companyId, scoreType: st },
          orderBy: { calculatedAt: "desc" },
        }),
      ),
    ),
    prisma.intelligenceRecommendation.findMany({
      where: { companyId: ctx.companyId, status: "active" },
      orderBy: [{ priority: "asc" }, { createdAt: "desc" }],
      take: 20,
    }),
    prisma.healthAlert.findMany({
      where: { companyId: ctx.companyId, isResolved: false },
      orderBy: { createdAt: "desc" },
      take: 20,
    }),
    prisma.insightEvent.findMany({
      where: { companyId: ctx.companyId },
      orderBy: { createdAt: "desc" },
      take: 50,
    }),
    prisma.kPIValue.findMany({
      where: { companyId: ctx.companyId },
      orderBy: { recordedAt: "desc" },
      distinct: ["kpiKey"],
    }),
  ]);

  const serializedScores = scores.filter(Boolean).map((s) => ({
    ...s,
    calculatedAt: (s as any).calculatedAt.toISOString(),
    createdAt: (s as any).createdAt.toISOString(),
    components: (s as any).components as any,
    evidence: (s as any).evidence as any,
    metadata: (s as any).metadata as any,
  }));

  const serializedRecommendations = recommendations.map((r) => ({
    ...r,
    createdAt: (r as any).createdAt.toISOString(),
    resolvedAt: (r as any).resolvedAt?.toISOString() ?? null,
    evidence: (r as any).evidence as any,
    affectedModules: (r as any).affectedModules as any,
  }));

  const serializedAlerts = alerts.map((a) => ({
    ...a,
    createdAt: (a as any).createdAt.toISOString(),
    resolvedAt: (a as any).resolvedAt?.toISOString() ?? null,
  }));

  const serializedEvents = events.map((e) => ({
    ...e,
    createdAt: (e as any).createdAt.toISOString(),
    evidence: (e as any).evidence as any,
    metadata: (e as any).metadata as any,
  }));

  const serializedKpis = kpis.map((k) => ({
    ...k,
    recordedAt: (k as any).recordedAt.toISOString(),
    createdAt: (k as any).createdAt.toISOString(),
    metadata: (k as any).metadata as any,
  }));

  return (
    <PageContainer>
      <EnterprisePageHeader
        title="Financial Intelligence"
        description="Enterprise financial health monitoring"
      />
      <HealthDashboardGrid
        dashboard={{
          scores: serializedScores,
          kpis: serializedKpis,
          recommendations: serializedRecommendations,
          alerts: serializedAlerts,
          insights: serializedEvents,
          trendSummaries: [],
          cashPosition: undefined,
        } as any}
        onScoreClick={undefined as any}
        onRecommendationClick={undefined as any}
      />
    </PageContainer>
  );
}
