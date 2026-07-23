import { NextResponse } from "next/server";
import { auth } from "@/server/auth/auth";
import { requireTenantContext } from "@/server/context/tenant-context";
import { cacheHeaders, handleRouteError } from "@/server/http/handle-route";
import { DecisionRegistry } from "@/modules/finance-collaboration";
import { registryDecisionStatusSchema } from "@/lib/validations/finance-collaboration";
import { zodErrorResponse, parseJsonBody } from "@/server/http/handle-route";
import { z } from "zod";

type RouteParams = { params: Promise<{ id: string }> };

const updateDecisionStatusSchema = z.object({
  status: registryDecisionStatusSchema,
});

export async function GET(req: Request, { params }: RouteParams) {
  try {
    const session = await auth();
    const ctx = requireTenantContext(session?.user?.id, session?.user?.activeCompanyId, session?.user?.companyRole);
    const { id } = await params;

    const data = await DecisionRegistry.getDecisionById(ctx, id);
    return NextResponse.json(data, { headers: cacheHeaders(15) });
  } catch (err) {
    return handleRouteError(err, req);
  }
}

export async function PUT(req: Request, { params }: RouteParams) {
  try {
    const session = await auth();
    const ctx = requireTenantContext(session?.user?.id, session?.user?.activeCompanyId, session?.user?.companyRole);
    const { id } = await params;

    const body = await parseJsonBody<unknown>(req);
    const parsed = updateDecisionStatusSchema.safeParse(body);
    if (!parsed.success) {
      return zodErrorResponse(parsed.error, req);
    }

    const data = await DecisionRegistry.updateDecisionStatus(ctx, id, parsed.data.status);
    return NextResponse.json(data);
  } catch (err) {
    return handleRouteError(err, req);
  }
}
