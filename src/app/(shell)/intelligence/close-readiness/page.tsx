import { redirect } from "next/navigation";
import Link from "next/link";
import { auth } from "@/server/auth/auth";
import { prisma } from "@/server/db/prisma";
import { requireTenantContext } from "@/server/context/tenant-context";
import { PageContainer } from "@/components/enterprise/page-container";
import { EnterprisePageHeader } from "@/components/enterprise/enterprise-page-header";
import { CloseReadinessTimeline } from "@/components/intelligence-platform/close-readiness-timeline";

export default async function CloseReadinessPage() {
  const session = await auth();
  const ctx = requireTenantContext(session?.user?.id, session?.user?.activeCompanyId, session?.user?.companyRole);
  if (!ctx) redirect("/sign-in");

  const [score, history, recommendations] = await Promise.all([
    prisma.financialScore.findFirst({
      where: { companyId: ctx.companyId, scoreType: "close-readiness" },
      orderBy: { calculatedAt: "desc" },
    }),
    prisma.financialScore.findMany({
      where: { companyId: ctx.companyId, scoreType: "close-readiness" },
      orderBy: { calculatedAt: "desc" },
      take: 30,
    }),
    prisma.intelligenceRecommendation.findMany({
      where: { companyId: ctx.companyId, category: "close", status: "active" },
      orderBy: { priority: "asc" },
    }),
  ]);

  const serializedScore = score
    ? {
        ...score,
        calculatedAt: (score as any).calculatedAt.toISOString(),
        createdAt: (score as any).createdAt.toISOString(),
        components: (score as any).components as any,
        evidence: (score as any).evidence as any,
        metadata: (score as any).metadata as any,
      }
    : null;

  const serializedHistory = history.map((h) => ({
    ...h,
    calculatedAt: (h as any).calculatedAt.toISOString(),
    createdAt: (h as any).createdAt.toISOString(),
    components: (h as any).components as any,
    evidence: (h as any).evidence as any,
    metadata: (h as any).metadata as any,
  }));

  const serializedRecommendations = recommendations.map((r) => ({
    ...r,
    createdAt: (r as any).createdAt.toISOString(),
    resolvedAt: (r as any).resolvedAt?.toISOString() ?? null,
    evidence: (r as any).evidence as any,
    affectedModules: (r as any).affectedModules as any,
  }));

  return (
    <PageContainer>
      <EnterprisePageHeader
        title="Close Readiness"
        description={score ? `Score: ${score.score}/100 — ${score.severity}` : "No close readiness data"}
      />
      {serializedScore ? (
        <CloseReadinessTimeline score={serializedScore as any} />
      ) : (
        <p className="text-sm text-zinc-500">No close readiness data available.</p>
      )}
    </PageContainer>
  );
}
