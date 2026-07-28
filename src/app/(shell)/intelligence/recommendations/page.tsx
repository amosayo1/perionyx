import { redirect } from "next/navigation";
import Link from "next/link";
import { prisma } from "@/server/db/prisma";
import { PageContainer } from "@/components/enterprise/page-container";
import { EnterprisePageHeader } from "@/components/enterprise/enterprise-page-header";
import { RecommendationList } from "@/components/intelligence-platform/recommendation-list";
import { withRuntimeContext } from "@/server/http/init-runtime-context";
import { headers } from "next/headers";

export default async function RecommendationsPage() {
  return withRuntimeContext(await headers(), async (ctx) => {
  
    const recommendations = await prisma.intelligenceRecommendation.findMany({
      where: { companyId: ctx.tenant.companyId },
      orderBy: [
        { status: "asc" },
        { priority: "asc" },
        { createdAt: "desc" },
      ],
    });
  
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
          title="Recommendation Centre"
          description="AI-powered financial intelligence recommendations"
        />
        <RecommendationList recommendations={serializedRecommendations as any} onAcknowledge={undefined as any} onDismiss={undefined as any} />
      </PageContainer>
    );
  });
}
