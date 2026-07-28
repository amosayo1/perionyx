import { NextRequest, NextResponse } from "next/server";
import { ExceptionEngine, InvestigationEngine } from "@/modules/reconciliation";
import { cacheHeaders, handleRouteError } from "@/server/http/handle-route";
import { updateExceptionSchema } from "@/lib/validations/reconciliation";
import { withRuntimeContext } from "@/server/http/init-runtime-context";

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  return withRuntimeContext(_request, async (ctx) => {
    try {
      const { id } = await params;
  
      const context = await InvestigationEngine.buildContext(ctx.tenant, id);
      return NextResponse.json(context);
    } catch (error) {
      return handleRouteError(error);
    }
  });
}

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  return withRuntimeContext(request, async (ctx) => {
    try {
      const { id } = await params;
      const body = await request.json();
      const input = updateExceptionSchema.parse(body);
  
      const exception = await ExceptionEngine.resolveException(
        ctx.tenant,
        id,
        { status: input.status, severity: input.severity, assignedTo: input.assignedTo },
        ctx.tenant.userId
      );
  
      return NextResponse.json(exception);
    } catch (error) {
      return handleRouteError(error);
    }
  });
}
