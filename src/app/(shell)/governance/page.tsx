import { redirect } from "next/navigation";
import { auth } from "@/server/auth/auth";
import { requireTenantContext } from "@/server/context/tenant-context";
import { GovernanceService } from "@/modules/governance/governance.service";
import { PolicyRegistry } from "@/modules/governance/policy-registry";
import { GovernanceDashboardClient } from "./governance-client";

export default async function GovernanceDashboardPage() {
  const session = await auth();
  const ctx = requireTenantContext(session?.user?.id, session?.user?.activeCompanyId, session?.user?.companyRole);
  if (!ctx) redirect("/sign-in");

  const [metrics, openViolations, activeExceptions, frameworks] = await Promise.all([
    GovernanceService.getMetrics(ctx).catch(() => null),
    GovernanceService.listViolations(ctx, { status: "OPEN", limit: 50 }).catch(() => []),
    GovernanceService.listExceptions(ctx, { status: "ACTIVE" }).catch(() => []),
    PolicyRegistry.getFrameworks(ctx).catch(() => []),
  ]);

  return (
    <GovernanceDashboardClient
      metrics={metrics}
      violations={openViolations as any[]}
      exceptions={activeExceptions as any[]}
      frameworks={frameworks as any[]}
    />
  );
}
