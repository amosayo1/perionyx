import { redirect } from "next/navigation";
import { auth } from "@/server/auth/auth";
import { requireTenantContext } from "@/server/context/tenant-context";
import { WorkflowAnalyticsService } from "@/modules/automation-studio/workflow-analytics.service";
import { AnalyticsDashboardClient } from "@/components/automation-studio/analytics-dashboard";
import { IntelligencePanel } from "@/components/enterprise/intelligence-panel";
import { ErrorBoundaryWrapper } from "@/components/ui/error-boundary-wrapper";

const analyticsService = new WorkflowAnalyticsService();

export default async function AnalyticsPage() {
  const session = await auth();
  const ctx = requireTenantContext(session?.user?.id, session?.user?.activeCompanyId, session?.user?.companyRole);
  if (!ctx) redirect("/sign-in");

  const analytics = await analyticsService.getAnalytics(ctx, {
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
}
