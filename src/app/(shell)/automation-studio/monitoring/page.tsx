import { redirect } from "next/navigation";
import { WorkflowEngine } from "@/modules/workflow/engine";
import { MonitoringDashboardClient } from "@/components/automation-studio/monitoring-dashboard";
import { ErrorBoundaryWrapper } from "@/components/ui/error-boundary-wrapper";
import { withRuntimeContext } from "@/server/http/init-runtime-context";
import { headers } from "next/headers";

const engine = WorkflowEngine.getInstance();

export default async function MonitoringPage() {
  return withRuntimeContext(await headers(), async (ctx) => {
  
    const [metrics, running, waiting, failed, completed, definitions] = await Promise.all([
      engine.getMetrics(ctx.tenant).catch(() => null),
      engine.listInstances(ctx.tenant, { status: "RUNNING", limit: 20 }).catch(() => []),
      engine.listInstances(ctx.tenant, { status: "WAITING", limit: 20 }).catch(() => []),
      engine.listInstances(ctx.tenant, { status: "FAILED", limit: 20 }).catch(() => []),
      engine.listInstances(ctx.tenant, { status: "COMPLETED", limit: 20 }).catch(() => []),
      engine.listDefinitions(ctx.tenant).catch(() => []),
    ]);
  
    return (
      <ErrorBoundaryWrapper>
        <MonitoringDashboardClient
          metrics={metrics}
          running={running}
          waiting={waiting}
          failed={failed}
          completed={completed}
          definitions={definitions}
        />
      </ErrorBoundaryWrapper>
    );
  });
}
