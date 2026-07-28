import { redirect } from "next/navigation";
import { WorkflowAnalyticsService } from "@/modules/automation-studio/workflow-analytics.service";
import { AnalyticsDashboardClient } from "@/components/automation-studio/analytics-dashboard";
import { IntelligencePanel } from "@/components/enterprise/intelligence-panel";
import { ErrorBoundaryWrapper } from "@/components/ui/error-boundary-wrapper";
import { withRuntimeContext } from "@/server/http/init-runtime-context";
import { headers } from "next/headers";

const analyticsService = new WorkflowAnalyticsService();

export default async function AnalyticsPage() {
  return withRuntimeContext(await headers(), async (ctx) => {
  
    const analytics = await analyticsService.getAnalytics(ctx.tenant, {
      limit: 5000,
      dateFrom: new Date(Date.now() - 90 * 24 * 60 * 60 * 1000).toISOString(),
    }).catch(() => null);
  
    return (
      <ErrorBoundaryWrapper>
        <AnalyticsDashboardClient analytics={analytics} />
        <div className="mx-auto max-w-7xl mt-8">
          <IntelligencePanel />
        </div>
      </ErrorBoundaryWrapper>
    );
  });
}
