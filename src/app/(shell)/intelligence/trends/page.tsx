import { redirect } from "next/navigation";
import Link from "next/link";
import { prisma } from "@/server/db/prisma";
import { PageContainer } from "@/components/enterprise/page-container";
import { EnterprisePageHeader } from "@/components/enterprise/enterprise-page-header";
import { TrendExplorer } from "@/components/intelligence-platform/trend-explorer";
import { withRuntimeContext } from "@/server/http/init-runtime-context";
import { headers } from "next/headers";

export default async function TrendsPage() {
  return withRuntimeContext(await headers(), async (ctx) => {
  
    const trends = await prisma.intelligenceTrend.findMany({
      where: { companyId: ctx.tenant.companyId },
      orderBy: [{ period: "asc" }, { calculatedAt: "desc" }],
    });
  
    const serializedTrends = trends.map((t) => ({
      ...t,
      calculatedAt: (t as any).calculatedAt.toISOString(),
      dataPoints: (t as any).dataPoints as any,
      forecast: (t as any).forecast as any,
    }));
  
    return (
      <PageContainer>
        <EnterprisePageHeader
          title="Trend Explorer"
          description="Historical intelligence trends"
        />
        <TrendExplorer trends={serializedTrends as any} onSelectTrend={undefined as any} />
      </PageContainer>
    );
  });
}
