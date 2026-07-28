import { NextRequest, NextResponse } from "next/server";
import { handleRouteError } from "@/server/http/handle-route";
import { generateAndPersistBriefing, getLatestBriefings } from "@/modules/briefings/briefings.service";
import { captureAllSnapshots, getLatestSnapshot } from "@/modules/intelligence/snapshot.service";
import { rbacService } from "@/modules/rbac/rbac.service";
import { withRuntimeContext } from "@/server/http/init-runtime-context";

export async function GET() {
  return withRuntimeContext(new Headers(), async (ctx) => {
    try {
      await rbacService.ensurePermission(ctx.tenant.userId, ctx.tenant.companyId, 'analytics.read');
  
      const briefings = await getLatestBriefings(ctx.tenant.companyId, { limit: 1 });
      const briefing = briefings[0] ?? null;
  
      const metricKeys = [
        "cash_position", "treasury_balance", "risk_score", "critical_alerts",
        "pending_approvals", "failed_transactions", "reconciliation_match_rate",
        "approval_sla", "transaction_volume", "active_users",
      ];
  
      const metrics = await Promise.all(
        metricKeys.map(async (key) => {
          const snapshot = await getLatestSnapshot(ctx.tenant.companyId, key);
          return snapshot ? { metric: key, value: Number(snapshot.value), label: snapshot.label ?? key } : null;
        }),
      );
  
      return NextResponse.json({
        briefing: briefing ? {
          id: briefing.id,
          title: briefing.title,
          summary: briefing.summary,
          sections: briefing.sections,
          recommendations: briefing.recommendations,
          createdAt: briefing.createdAt,
        } : null,
        metrics: metrics.filter(Boolean),
      });
    } catch (error) {
      return handleRouteError(error);
    }
  });
}

export async function POST() {
  return withRuntimeContext(new Headers(), async (ctx) => {
    try {
  
      await captureAllSnapshots(ctx.tenant.companyId);
      const briefing = await generateAndPersistBriefing(ctx.tenant, "daily");
  
      return NextResponse.json({
        briefing: {
          id: briefing.id,
          title: briefing.title,
          summary: briefing.summary,
          sections: briefing.sections,
          recommendations: briefing.recommendations,
          createdAt: briefing.createdAt,
        },
      }, { status: 201 });
    } catch (error) {
      return handleRouteError(error);
    }
  });
}
