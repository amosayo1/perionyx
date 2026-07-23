import { NextResponse } from "next/server";
import { auth } from "@/server/auth/auth";
import { requireTenantContext } from "@/server/context/tenant-context";
import { PolicyEngineService } from "@/modules/compliance-specialist";
import { handleRouteError, zodErrorResponse, parseJsonBody } from "@/server/http/handle-route";
import { updateViolationStatusSchema } from "@/lib/validations/compliance-specialist";

export async function GET(
  req: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const { id } = await params;
    const session = await auth();
    const ctx = requireTenantContext(session?.user?.id, session?.user?.activeCompanyId, session?.user?.companyRole);

    const result = await PolicyEngineService.getViolations(ctx, {
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
}

export async function PUT(
  req: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const { id } = await params;
    const session = await auth();
    const ctx = requireTenantContext(session?.user?.id, session?.user?.activeCompanyId, session?.user?.companyRole);

    const body = await parseJsonBody<unknown>(req);
    const parsed = updateViolationStatusSchema.safeParse(body);
    if (!parsed.success) return zodErrorResponse(parsed.error, req);

    const result = await PolicyEngineService.updateViolationStatus(ctx, id, parsed.data.status);
    return NextResponse.json(result);
  } catch (err) {
    return handleRouteError(err, req);
  }
}
