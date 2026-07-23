import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/server/auth/auth";
import { requireTenantContext } from "@/server/context/tenant-context";
import { handleRouteError } from "@/server/http/handle-route";
import { generateAndPersistBriefing, getLatestBriefings } from "@/modules/briefings/briefings.service";
import { captureAllSnapshots, getLatestSnapshot } from "@/modules/intelligence/snapshot.service";
import { rbacService } from "@/modules/rbac/rbac.service";

export async function GET() {
  try {
    const session = await auth();
    const ctx = requireTenantContext(session?.user?.id, session?.user?.activeCompanyId, session?.user?.companyRole);
    await rbacService.ensurePermission(ctx.userId, ctx.companyId, 'analytics.read');

    const briefings = await getLatestBriefings(ctx.companyId, { limit: 1 });
    const briefing = briefings[0] ?? null;

    const metricKeys = [
      "cash_position", "treasury_balance", "risk_score", "critical_alerts",
      "pending_approvals", "failed_transactions", "reconciliation_match_rate",
      "approval_sla", "transaction_volume", "active_users",
    ];

    const metrics = await Promise.all(
      metricKeys.map(async (key) => {
        const snapshot = await getLatestSnapshot(ctx.companyId, key);
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
}

export async function POST() {
  try {
    const session = await auth();
    const ctx = requireTenantContext(session?.user?.id, session?.user?.activeCompanyId, session?.user?.companyRole);

    await captureAllSnapshots(ctx.companyId);
    const briefing = await generateAndPersistBriefing(ctx, "daily");

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
}
