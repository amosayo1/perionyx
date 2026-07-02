import { NextResponse } from 'next/server';
import { auth } from '@/server/auth/auth';
import { requireTenantContext } from '@/server/context/tenant-context';
import { ApprovalAnalyticsService } from '@/modules/rbac/approval-analytics.service';
import { handleRouteError } from '@/server/http/handle-route';

/**
 * GET /api/v1/admin/approval-analytics
 * 
 * Returns comprehensive approval metrics and analytics for a company.
 */
export async function GET(request: Request) {
  try {
    const session = await auth();
    const ctx = requireTenantContext(
      session?.user?.id,
      session?.user?.activeCompanyId,
      session?.user?.companyRole
    );

    // Fetch all analytics in parallel
    const [metrics, ruleUsage, bottlenecks, transactionTypes, recentActivity] =
      await Promise.all([
        ApprovalAnalyticsService.getMetrics(ctx.companyId),
        ApprovalAnalyticsService.getRuleUsageMetrics(ctx.companyId, 10),
        ApprovalAnalyticsService.getApprovalBottlenecks(ctx.companyId),
        ApprovalAnalyticsService.getTransactionTypeMetrics(ctx.companyId),
        ApprovalAnalyticsService.getRecentApprovalActivity(ctx.companyId, 20),
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
}
