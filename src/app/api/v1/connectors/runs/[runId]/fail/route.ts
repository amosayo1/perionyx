import { NextResponse } from "next/server";
import { auth } from "@/server/auth/auth";
import { requireTenantContext } from "@/server/context/tenant-context";
import { handleRouteError, parseJsonBody } from "@/server/http/handle-route";
import { ConnectorRunService } from "@/modules/connectors";

type RouteContext = { params: Promise<{ runId: string }> };

export async function POST(request: Request, context: RouteContext) {
  try {
    const session = await auth();
    const ctx = requireTenantContext(session?.user?.id, session?.user?.activeCompanyId, session?.user?.companyRole);
    const { runId } = await context.params;
    const body = await parseJsonBody<{ error?: unknown }>(request);
    const result = await ConnectorRunService.failRun(ctx, runId, body.error as string);
    return NextResponse.json(result);
  } catch (error) {
    return handleRouteError(error);
  }
}
