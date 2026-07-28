import { redirect } from "next/navigation";
import Link from "next/link";
import { prisma } from "@/server/db/prisma";
import { PageContainer } from "@/components/enterprise/page-container";
import { EnterprisePageHeader } from "@/components/enterprise/enterprise-page-header";
import { ExecutiveScorecardView } from "@/components/intelligence-platform/executive-scorecard-view";
import { withRuntimeContext } from "@/server/http/init-runtime-context";
import { headers } from "next/headers";

const ROLES = ["ceo", "cfo", "controller", "treasurer", "finance-manager", "board", "auditor"] as const;

export default async function ScorecardsPage() {
  return withRuntimeContext(await headers(), async (ctx) => {
  
    const scorecards = await Promise.all(
      ROLES.map((role) =>
        prisma.executiveScorecard.findFirst({
          where: { companyId: ctx.tenant.companyId, role },
          orderBy: { generatedAt: "desc" },
        }),
      ),
    );
  
    const serializedScorecards = scorecards.filter(Boolean).map((s) => ({
      ...s,
      periodStart: (s as any).periodStart.toISOString(),
      periodEnd: (s as any).periodEnd.toISOString(),
      generatedAt: (s as any).generatedAt.toISOString(),
      scores: (s as any).scores as any,
      kpis: (s as any).kpis as any,
      recommendations: (s as any).recommendations as any,
    }));
  
    return (
      <PageContainer>
        <EnterprisePageHeader
          title="Executive Scorecards"
          description="Role-specific financial intelligence"
        />
        {serializedScorecards[0] ? (
          <ExecutiveScorecardView
            scorecard={serializedScorecards[0] as any}
            role={(serializedScorecards[0] as any).role ?? "cfo"}
          />
        ) : (
          <p className="text-sm text-zinc-500">No scorecards available yet.</p>
        )}
      </PageContainer>
    );
  });
}
