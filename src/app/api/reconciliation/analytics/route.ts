import { NextResponse } from "next/server";
import { ReconciliationSpecialist } from "@/modules/reconciliation";
import { cacheHeaders, handleRouteError } from "@/server/http/handle-route";
import { requireTenantContext } from "@/server/context/tenant-context";
import { auth } from "@/server/auth/auth";

export async function GET() {
  try {
    const session = await auth();
    const ctx = requireTenantContext(session?.user?.id, session?.user?.activeCompanyId, session?.user?.companyRole);
    const dashboard = await ReconciliationSpecialist.getDashboard(ctx);

    // Derive analytics from dashboard data
    const analytics = {
      matchRate: dashboard.overallMatchRate,
      exceptionVolume: dashboard.totalExceptions,
      criticalExceptions: dashboard.criticalExceptions,
      casesByType: dashboard.casesByType,
      casesByStatus: dashboard.casesByStatus,
      exceptionsBySeverity: dashboard.exceptionsBySeverity,
      topRisks: dashboard.topRisks,
      trends: dashboard.trends,
    };

    return NextResponse.json(analytics, { headers: cacheHeaders(60) });
  } catch (error) {
    return handleRouteError(error);
  }
}
