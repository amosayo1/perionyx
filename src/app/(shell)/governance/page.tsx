import { redirect } from "next/navigation";
import { GovernanceService } from "@/modules/governance/governance.service";
import { PolicyRegistry } from "@/modules/governance/policy-registry";
import { GovernanceDashboardClient } from "./governance-client";
import { withRuntimeContext } from "@/server/http/init-runtime-context";
import { headers } from "next/headers";

export default async function GovernanceDashboardPage() {
  return withRuntimeContext(await headers(), async (ctx) => {
  
    const [metrics, openViolations, activeExceptions, frameworks] = await Promise.all([
      GovernanceService.getMetrics(ctx.tenant).catch(() => null),
      GovernanceService.listViolations(ctx.tenant, { status: "OPEN", limit: 50 }).catch(() => []),
      GovernanceService.listExceptions(ctx.tenant, { status: "ACTIVE" }).catch(() => []),
      PolicyRegistry.getFrameworks(ctx.tenant).catch(() => []),
    ]);
  
    return (
      <GovernanceDashboardClient
        metrics={metrics}
        violations={openViolations as any[]}
        exceptions={activeExceptions as any[]}
        frameworks={frameworks as any[]}
      />
    );
  });
}
