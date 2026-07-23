import { redirect } from "next/navigation";
import Link from "next/link";
import { auth } from "@/server/auth/auth";
import { prisma } from "@/server/db/prisma";
import { requireTenantContext } from "@/server/context/tenant-context";
import { PageContainer } from "@/components/enterprise/page-container";
import { EnterprisePageHeader } from "@/components/enterprise/enterprise-page-header";
import { TreasuryDetail } from "@/components/intelligence-platform/treasury-detail";

const TREASURY_KPIS = ["cashBalance", "daysOfCash", "fxExposure"] as const;

export default async function TreasuryPage() {
  const session = await auth();
  const ctx = requireTenantContext(session?.user?.id, session?.user?.activeCompanyId, session?.user?.companyRole);
  if (!ctx) redirect("/sign-in");

  const [score, kpis, recommendations] = await Promise.all([
    prisma.financialScore.findFirst({
      where: { companyId: ctx.companyId, scoreType: "treasury-health" },
      orderBy: { calculatedAt: "desc" },
    }),
    prisma.kPIValue.findMany({
      where: { companyId: ctx.companyId, kpiKey: { in: TREASURY_KPIS as unknown as string[] } },
      orderBy: { recordedAt: "desc" },
      distinct: ["kpiKey"],
    }),
    prisma.intelligenceRecommendation.findMany({
      where: { companyId: ctx.companyId, category: "treasury", status: "active" },
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

  const serializedKpis = kpis.map((k) => ({
    ...k,
    recordedAt: (k as any).recordedAt.toISOString(),
    createdAt: (k as any).createdAt.toISOString(),
    metadata: (k as any).metadata as any,
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
        title="Treasury Intelligence"
        description={score ? `Score: ${score.score}/100 — ${score.severity}` : "No treasury data"}
      />
      {serializedScore ? (
        <TreasuryDetail score={serializedScore as any} kpis={serializedKpis as any} />
      ) : (
        <p className="text-sm text-zinc-500">No treasury data available.</p>
      )}
    </PageContainer>
  );
}
