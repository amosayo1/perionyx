import { NextResponse } from "next/server";
import { PolicyEngineService } from "@/modules/compliance-specialist";
import { handleRouteError, zodErrorResponse, parseJsonBody } from "@/server/http/handle-route";
import { updateViolationStatusSchema } from "@/lib/validations/compliance-specialist";
import { withRuntimeContext } from "@/server/http/init-runtime-context";

export async function GET(
  req: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  return withRuntimeContext(req, async (ctx) => {
    try {
      const { id } = await params;
  
      const result = await PolicyEngineService.getViolations(ctx.tenant, {
        search: id,
        limit: 1,
      });
  
      const violation = result.violations.find((v) => v.id === id);
      if (!violation) {
        return NextResponse.json(
          { error: { code: "NOT_FOUND", message: `Violation ${id} not found` } },
          { status: 404 },
        );
      }
  
      return NextResponse.json(violation);
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
      const parsed = updateViolationStatusSchema.safeParse(body);
      if (!parsed.success) return zodErrorResponse(parsed.error, req);
  
      const result = await PolicyEngineService.updateViolationStatus(ctx.tenant, id, parsed.data.status);
      return NextResponse.json(result);
    } catch (err) {
      return handleRouteError(err, req);
    }
  });
}
