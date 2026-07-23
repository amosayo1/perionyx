import { NextRequest, NextResponse } from "next/server";
import { ExceptionEngine, InvestigationEngine } from "@/modules/reconciliation";
import { cacheHeaders, handleRouteError } from "@/server/http/handle-route";
import { requireTenantContext } from "@/server/context/tenant-context";
import { auth } from "@/server/auth/auth";
import { updateExceptionSchema } from "@/lib/validations/reconciliation";

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await auth();
    const ctx = requireTenantContext(session?.user?.id, session?.user?.activeCompanyId, session?.user?.companyRole);
    const { id } = await params;

    const context = await InvestigationEngine.buildContext(ctx, id);
    return NextResponse.json(context);
  } catch (error) {
    return handleRouteError(error);
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await auth();
    const ctx = requireTenantContext(session?.user?.id, session?.user?.activeCompanyId, session?.user?.companyRole);
    const { id } = await params;
    const body = await request.json();
    const input = updateExceptionSchema.parse(body);

    const exception = await ExceptionEngine.resolveException(
      ctx,
      id,
      { status: input.status, severity: input.severity, assignedTo: input.assignedTo },
      ctx.userId
    );

    return NextResponse.json(exception);
  } catch (error) {
    return handleRouteError(error);
  }
}
