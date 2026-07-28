import { NextResponse } from "next/server";
import { handleRouteError, parseJsonBody } from "@/server/http/handle-route";
import { RecommendationsService } from "@/modules/controller-specialist/recommendations";
import { withRuntimeContext } from "@/server/http/init-runtime-context";

export async function PUT(
  req: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  return withRuntimeContext(req, async (ctx) => {
    try {
      const { id } = await params;
  
      const body = await parseJsonBody<{
        status?: string;
        assignedTo?: string;
        metadata?: Record<string, unknown>;
      }>(req);
  
      const rec = await RecommendationsService.updateRecommendation(ctx.tenant, id, body);
      return NextResponse.json(rec);
    } catch (err) {
      return handleRouteError(err, req);
    }
  });
}
