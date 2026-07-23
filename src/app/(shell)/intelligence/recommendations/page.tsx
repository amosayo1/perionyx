import { redirect } from "next/navigation";
import Link from "next/link";
import { auth } from "@/server/auth/auth";
import { prisma } from "@/server/db/prisma";
import { requireTenantContext } from "@/server/context/tenant-context";
import { PageContainer } from "@/components/enterprise/page-container";
import { EnterprisePageHeader } from "@/components/enterprise/enterprise-page-header";
import { RecommendationList } from "@/components/intelligence-platform/recommendation-list";

export default async function RecommendationsPage() {
  const session = await auth();
  const ctx = requireTenantContext(session?.user?.id, session?.user?.activeCompanyId, session?.user?.companyRole);
  if (!ctx) redirect("/sign-in");

  const recommendations = await prisma.intelligenceRecommendation.findMany({
    where: { companyId: ctx.companyId },
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
}
