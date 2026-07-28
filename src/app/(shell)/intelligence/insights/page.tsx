import { redirect } from "next/navigation";
import Link from "next/link";
import { prisma } from "@/server/db/prisma";
import { PageContainer } from "@/components/enterprise/page-container";
import { EnterprisePageHeader } from "@/components/enterprise/enterprise-page-header";
import { InsightTimeline } from "@/components/intelligence-platform/insight-timeline";
import { withRuntimeContext } from "@/server/http/init-runtime-context";
import { headers } from "next/headers";

export default async function InsightsPage() {
  return withRuntimeContext(await headers(), async (ctx) => {
  
    const events = await prisma.insightEvent.findMany({
      where: { companyId: ctx.tenant.companyId },
      orderBy: { createdAt: "desc" },
      take: 200,
    });
  
    const serializedEvents = events.map((e) => ({
      ...e,
      createdAt: (e as any).createdAt.toISOString(),
      evidence: (e as any).evidence as any,
      metadata: (e as any).metadata as any,
    }));
  
    return (
      <PageContainer>
        <EnterprisePageHeader
          title="Insight Timeline"
          description="Chronological intelligence history"
        />
        <InsightTimeline events={serializedEvents as any} onMarkRead={undefined as any} onLoadMore={undefined as any} hasMore={false} />
      </PageContainer>
    );
  });
}
