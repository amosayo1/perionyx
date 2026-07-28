import { NextResponse } from "next/server";
import { ReconciliationSpecialist } from "@/modules/reconciliation";
import { cacheHeaders, handleRouteError } from "@/server/http/handle-route";
import { withRuntimeContext } from "@/server/http/init-runtime-context";

export async function GET() {
  return withRuntimeContext(new Headers(), async (ctx) => {
    try {
      const dashboard = await ReconciliationSpecialist.getDashboard(ctx.tenant);
  
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
  });
}
