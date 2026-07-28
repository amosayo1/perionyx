import { NextResponse } from "next/server";
import { AgentGovernance } from "@/modules/agent-framework";
import { AgentService } from "@/modules/agent-framework";
import { handleRouteError } from "@/server/http/handle-route";
import { withRuntimeContext } from "@/server/http/init-runtime-context";

export async function GET(
  req: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  return withRuntimeContext(req, async (ctx) => {
    try {
      const { id } = await params;
  
      const [safetyReport, stats] = await Promise.all([
        AgentGovernance.getSafetyReport(ctx.tenant, id).catch(() => null),
        AgentService.getAgentStats(ctx.tenant, id).catch(() => null),
      ]);
  
      return NextResponse.json({
        agentId: id,
        safetyReport,
        stats,
      });
    } catch (err) {
      return handleRouteError(err, req);
    }
  });
}
