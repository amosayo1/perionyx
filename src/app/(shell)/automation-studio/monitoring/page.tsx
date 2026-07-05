import { redirect } from "next/navigation";
import { auth } from "@/server/auth/auth";
import { requireTenantContext } from "@/server/context/tenant-context";
import { WorkflowEngine } from "@/modules/workflow/engine";
import { MonitoringDashboardClient } from "@/components/automation-studio/monitoring-dashboard";
import { ErrorBoundaryWrapper } from "@/components/ui/error-boundary-wrapper";

const engine = WorkflowEngine.getInstance();

export default async function MonitoringPage() {
  const session = await auth();
  const ctx = requireTenantContext(session?.user?.id, session?.user?.activeCompanyId, session?.user?.companyRole);
  if (!ctx) redirect("/sign-in");

  const [metrics, running, waiting, failed, completed, definitions] = await Promise.all([
    engine.getMetrics(ctx).catch(() => null),
    engine.listInstances(ctx, { status: "RUNNING", limit: 20 }).catch(() => []),
    engine.listInstances(ctx, { status: "WAITING", limit: 20 }).catch(() => []),
    engine.listInstances(ctx, { status: "FAILED", limit: 20 }).catch(() => []),
    engine.listInstances(ctx, { status: "COMPLETED", limit: 20 }).catch(() => []),
    engine.listDefinitions(ctx).catch(() => []),
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
}
