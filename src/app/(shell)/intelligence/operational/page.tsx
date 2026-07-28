import { redirect } from "next/navigation";
import Link from "next/link";
import { prisma } from "@/server/db/prisma";
import { PageContainer } from "@/components/enterprise/page-container";
import { EnterprisePageHeader } from "@/components/enterprise/enterprise-page-header";
import { OperationalDetail } from "@/components/intelligence-platform/operational-detail";
import { withRuntimeContext } from "@/server/http/init-runtime-context";
import { headers } from "next/headers";

const OP_KPIS = ["revenue", "expenses", "operatingMargin"] as const;

export default async function OperationalPage() {
  return withRuntimeContext(await headers(), async (ctx) => {
  
    const [score, kpis, recommendations] = await Promise.all([
      prisma.financialScore.findFirst({
        where: { companyId: ctx.tenant.companyId, scoreType: "operational" },
        orderBy: { calculatedAt: "desc" },
      }),
      prisma.kPIValue.findMany({
        where: { companyId: ctx.tenant.companyId, kpiKey: { in: OP_KPIS as unknown as string[] } },
        orderBy: { recordedAt: "desc" },
        distinct: ["kpiKey"],
      }),
      prisma.intelligenceRecommendation.findMany({
        where: { companyId: ctx.tenant.companyId, category: "operational", status: "active" },
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
          title="Operational Intelligence"
          description={score ? `Score: ${score.score}/100 — ${score.severity}` : "No operational data"}
        />
        {serializedScore ? (
          <OperationalDetail score={serializedScore as any} kpis={serializedKpis as any} />
        ) : (
          <p className="text-sm text-zinc-500">No operational data available.</p>
        )}
      </PageContainer>
    );
  });
}
