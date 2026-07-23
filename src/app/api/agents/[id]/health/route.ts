import { NextResponse } from "next/server";
import { auth } from "@/server/auth/auth";
import { requireTenantContext } from "@/server/context/tenant-context";
import { AgentGovernance } from "@/modules/agent-framework";
import { AgentService } from "@/modules/agent-framework";
import { handleRouteError } from "@/server/http/handle-route";

export async function GET(
  req: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const { id } = await params;
    const session = await auth();
    const ctx = requireTenantContext(session?.user?.id, session?.user?.activeCompanyId, session?.user?.companyRole);

    const [safetyReport, stats] = await Promise.all([
      AgentGovernance.getSafetyReport(ctx, id).catch(() => null),
      AgentService.getAgentStats(ctx, id).catch(() => null),
    ]);

    return NextResponse.json({
      agentId: id,
      safetyReport,
      stats,
    });
  } catch (err) {
    return handleRouteError(err, req);
  }
}
