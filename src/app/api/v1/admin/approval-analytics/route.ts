import { NextResponse } from 'next/server';
import { ApprovalAnalyticsService } from '@/modules/rbac/approval-analytics.service';
import { handleRouteError } from '@/server/http/handle-route';
import { rbacService } from "@/modules/rbac/rbac.service";
import { withRuntimeContext } from "@/server/http/init-runtime-context";

/**
 * GET /api/v1/admin/approval-analytics
 * 
 * Returns comprehensive approval metrics and analytics for a company.
 */
export async function GET(request: Request) {
  return withRuntimeContext(request, async (ctx) => {
    try {
  
      // Fetch all analytics in parallel
      const [metrics, ruleUsage, bottlenecks, transactionTypes, recentActivity] =
        await Promise.all([
          ApprovalAnalyticsService.getMetrics(ctx.tenant.companyId),
          ApprovalAnalyticsService.getRuleUsageMetrics(ctx.tenant.companyId, 10),
          ApprovalAnalyticsService.getApprovalBottlenecks(ctx.tenant.companyId),
          ApprovalAnalyticsService.getTransactionTypeMetrics(ctx.tenant.companyId),
          ApprovalAnalyticsService.getRecentApprovalActivity(ctx.tenant.companyId, 20),
        ]);
  
      return NextResponse.json({
        metrics,
        ruleUsage,
        bottlenecks,
        transactionTypes,
        recentActivity,
      });
    } catch (err) {
      return handleRouteError(err);
    }
  });
}
