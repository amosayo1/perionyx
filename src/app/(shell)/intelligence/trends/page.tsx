import { redirect } from "next/navigation";
import Link from "next/link";
import { auth } from "@/server/auth/auth";
import { prisma } from "@/server/db/prisma";
import { requireTenantContext } from "@/server/context/tenant-context";
import { PageContainer } from "@/components/enterprise/page-container";
import { EnterprisePageHeader } from "@/components/enterprise/enterprise-page-header";
import { TrendExplorer } from "@/components/intelligence-platform/trend-explorer";

export default async function TrendsPage() {
  const session = await auth();
  const ctx = requireTenantContext(session?.user?.id, session?.user?.activeCompanyId, session?.user?.companyRole);
  if (!ctx) redirect("/sign-in");

  const trends = await prisma.intelligenceTrend.findMany({
    where: { companyId: ctx.companyId },
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
}
