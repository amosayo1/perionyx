import { redirect } from "next/navigation";
import { auth } from "@/server/auth/auth";
import { requireTenantContext } from "@/server/context/tenant-context";
import { WorkflowEngine } from "@/modules/workflow/engine";
import { WorkflowAnalyticsService } from "@/modules/automation-studio/workflow-analytics.service";
import { AutomationDashboardClient } from "@/components/automation-studio/automation-dashboard";

const engine = WorkflowEngine.getInstance();
const analyticsService = new WorkflowAnalyticsService();

export default async function AutomationStudioPage() {
  const session = await auth();
  const ctx = requireTenantContext(session?.user?.id, session?.user?.activeCompanyId, session?.user?.companyRole);
  if (!ctx) redirect("/sign-in");

  const [metrics, definitions, recentInstances, workflowAnalytics] = await Promise.all([
    engine.getMetrics(ctx).catch(() => null),
    engine.listDefinitions(ctx).catch(() => []),
    engine.listInstances(ctx, { limit: 10 }).catch(() => []),
    analyticsService.getAnalytics(ctx).catch(() => null),
  ]);

  return (
    <AutomationDashboardClient
      metrics={metrics}
      definitions={definitions}
      recentInstances={recentInstances}
      workflowAnalytics={workflowAnalytics}
    />
  );
}
