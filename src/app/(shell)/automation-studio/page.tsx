import { redirect } from "next/navigation";
import { WorkflowEngine } from "@/modules/workflow/engine";
import { WorkflowAnalyticsService } from "@/modules/automation-studio/workflow-analytics.service";
import { AutomationDashboardClient } from "@/components/automation-studio/automation-dashboard";
import { withRuntimeContext } from "@/server/http/init-runtime-context";
import { headers } from "next/headers";

const engine = WorkflowEngine.getInstance();
const analyticsService = new WorkflowAnalyticsService();

export default async function AutomationStudioPage() {
  return withRuntimeContext(await headers(), async (ctx) => {
  
    const [metrics, definitions, recentInstances, workflowAnalytics] = await Promise.all([
      engine.getMetrics(ctx.tenant).catch(() => null),
      engine.listDefinitions(ctx.tenant).catch(() => []),
      engine.listInstances(ctx.tenant, { limit: 10 }).catch(() => []),
      analyticsService.getAnalytics(ctx.tenant).catch(() => null),
    ]);
  
    return (
      <AutomationDashboardClient
        metrics={metrics}
        definitions={definitions}
        recentInstances={recentInstances}
        workflowAnalytics={workflowAnalytics}
      />
    );
  });
}
