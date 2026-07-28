import { NextResponse } from "next/server";
import { PolicyEngineService } from "@/modules/compliance-specialist";
import { handleRouteError, zodErrorResponse, parseJsonBody } from "@/server/http/handle-route";
import { updatePolicySchema } from "@/lib/validations/compliance-specialist";
import { withRuntimeContext } from "@/server/http/init-runtime-context";

export async function GET(
  req: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  return withRuntimeContext(req, async (ctx) => {
    try {
      const { id } = await params;
  
      const result = await PolicyEngineService.getPolicyVersions(ctx.tenant, id);
      return NextResponse.json(result);
    } catch (err) {
      return handleRouteError(err, req);
    }
  });
}

export async function PUT(
  req: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  return withRuntimeContext(req, async (ctx) => {
    try {
      const { id } = await params;
  
      const body = await parseJsonBody<unknown>(req);
      const parsed = updatePolicySchema.safeParse(body);
      if (!parsed.success) return zodErrorResponse(parsed.error, req);
  
      const result = await PolicyEngineService.updatePolicy(ctx.tenant, id, parsed.data);
      return NextResponse.json(result);
    } catch (err) {
      return handleRouteError(err, req);
    }
  });
}
