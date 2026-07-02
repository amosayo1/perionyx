import { NextResponse } from "next/server";
import { auth } from "@/server/auth/auth";
import { requireTenantContext } from "@/server/context/tenant-context";
import { handleRouteError, parseJsonBody } from "@/server/http/handle-route";
import { ReconciliationService } from "@/modules/reconciliation";

export async function GET(request: Request) {
  try {
    const session = await auth();
    const ctx = requireTenantContext(session?.user?.id, session?.user?.activeCompanyId, session?.user?.companyRole);
    const { searchParams } = new URL(request.url);
    const limit = searchParams.get("limit") ? parseInt(searchParams.get("limit")!) : undefined;
    const cursor = searchParams.get("cursor") ?? undefined;
    const result = await ReconciliationService.listRuns(ctx, limit, cursor);
    return NextResponse.json(result);
  } catch (error) {
    return handleRouteError(error);
  }
}

export async function POST(request: Request) {
  try {
    const session = await auth();
    const ctx = requireTenantContext(session?.user?.id, session?.user?.activeCompanyId, session?.user?.companyRole);
    const body = await parseJsonBody<{ type?: string }>(request);
    const runId = await ReconciliationService.initiateRun(ctx, body.type);
    return NextResponse.json({ runId }, { status: 201 });
  } catch (error) {
    return handleRouteError(error);
  }
}
