import { NextResponse } from "next/server";
import { ScenarioModelingService } from "@/modules/fpa-specialist";
import { handleRouteError, zodErrorResponse, parseJsonBody, cacheHeaders } from "@/server/http/handle-route";
import { executeScenarioSchema } from "@/lib/validations/fpa-specialist";
import { withRuntimeContext } from "@/server/http/init-runtime-context";

export async function GET(
  req: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  return withRuntimeContext(req, async (ctx) => {
    try {
      const { id } = await params;
  
      const [results, impact] = await Promise.all([
        ScenarioModelingService.getScenarioResults(ctx.tenant, id),
        ScenarioModelingService.getScenarioImpact(ctx.tenant, id),
      ]);
  
      return NextResponse.json({ scenarioId: id, results, impact }, { headers: cacheHeaders(30) });
    } catch (err) {
      return handleRouteError(err, req);
    }
  });
}

export async function POST(
  req: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  return withRuntimeContext(req, async (ctx) => {
    try {
      const { id } = await params;
  
      const body = await parseJsonBody<unknown>(req);
      const parsed = executeScenarioSchema.safeParse(body);
      if (!parsed.success) return zodErrorResponse(parsed.error, req);
  
      const result = await ScenarioModelingService.executeScenario(ctx.tenant, id, parsed.data);
      return NextResponse.json(result, { status: 201 });
    } catch (err) {
      return handleRouteError(err, req);
    }
  });
}
