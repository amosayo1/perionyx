import { redirect } from "next/navigation";
import Link from "next/link";
import { prisma } from "@/server/db/prisma";
import { PageContainer } from "@/components/enterprise/page-container";
import { EnterprisePageHeader } from "@/components/enterprise/enterprise-page-header";
import { ComplianceDetail } from "@/components/intelligence-platform/compliance-detail";
import { withRuntimeContext } from "@/server/http/init-runtime-context";
import { headers } from "next/headers";

const COMP_KPIS = ["violationsOpen", "auditCompletionRate"] as const;

export default async function CompliancePage() {
  return withRuntimeContext(await headers(), async (ctx) => {
  
    const [score, kpis, recommendations] = await Promise.all([
      prisma.financialScore.findFirst({
        where: { companyId: ctx.tenant.companyId, scoreType: "compliance" },
        orderBy: { calculatedAt: "desc" },
      }),
      prisma.kPIValue.findMany({
        where: { companyId: ctx.tenant.companyId, kpiKey: { in: COMP_KPIS as unknown as string[] } },
        orderBy: { recordedAt: "desc" },
        distinct: ["kpiKey"],
      }),
      prisma.intelligenceRecommendation.findMany({
        where: { companyId: ctx.tenant.companyId, category: "compliance", status: "active" },
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
          title="Compliance Intelligence"
          description={score ? `Score: ${score.score}/100 — ${score.severity}` : "No compliance data"}
        />
        {serializedScore ? (
          <ComplianceDetail score={serializedScore as any} kpis={serializedKpis as any} />
        ) : (
          <p className="text-sm text-zinc-500">No compliance data available.</p>
        )}
      </PageContainer>
    );
  });
}
