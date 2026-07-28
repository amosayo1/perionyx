import { redirect } from "next/navigation";
import Link from "next/link";
import { prisma } from "@/server/db/prisma";
import { PageContainer } from "@/components/enterprise/page-container";
import { EnterprisePageHeader } from "@/components/enterprise/enterprise-page-header";
import { ExplainPanel } from "@/components/intelligence-platform/explain-panel";
import { withRuntimeContext } from "@/server/http/init-runtime-context";
import { headers } from "next/headers";

export default async function ExplainPage({
  searchParams,
}: {
  searchParams: { targetType?: string; targetId?: string };
}) {
  return withRuntimeContext(await headers(), async (ctx) => {
  
    let sources: Array<{
      id: string;
      targetType: string;
      targetId: string;
      sourceType: string;
      sourceId: string;
      sourceLabel: string | null;
      sourceUrl: string | null;
      metadata: unknown;
      createdAt: string;
    }> = [];
  
    if (searchParams.targetType && searchParams.targetId) {
      const rows = await prisma.explainSource.findMany({
        where: {
          companyId: ctx.tenant.companyId,
          targetType: searchParams.targetType,
          targetId: searchParams.targetId,
        },
        orderBy: { createdAt: "desc" },
      });
  
      sources = rows.map((s) => ({
        ...s,
        createdAt: (s as any).createdAt.toISOString(),
        metadata: (s as any).metadata as any,
      }));
    }
  
    return (
      <PageContainer>
        <EnterprisePageHeader
          title="Explain This Number"
          description="Trace any metric to its source"
        />
        {sources.length > 0 && (
          <ExplainPanel
            targetType={searchParams.targetType ?? "unknown"}
            targetLabel={`Target: ${searchParams.targetId}`}
            sources={sources as any}
            onNavigate={undefined as any}
          />
        )}
        {searchParams.targetType && searchParams.targetId && sources.length === 0 && (
          <p className="text-sm text-zinc-500">No source traces found for this target.</p>
        )}
        {!searchParams.targetType && (
          <p className="text-sm text-zinc-500">Search for a metric to trace its source.</p>
        )}
      </PageContainer>
    );
  });
}
