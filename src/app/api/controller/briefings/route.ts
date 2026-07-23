import { NextResponse } from "next/server";
import { auth } from "@/server/auth/auth";
import { requireTenantContext } from "@/server/context/tenant-context";
import { cacheHeaders, handleRouteError, parseJsonBody } from "@/server/http/handle-route";
import { ControllerSpecialistService } from "@/modules/controller-specialist/controller-specialist";

export async function GET(req: Request) {
  try {
    const session = await auth();
    const ctx = requireTenantContext(session?.user?.id, session?.user?.activeCompanyId, session?.user?.companyRole);

    const { searchParams } = new URL(req.url);
    const briefingType = searchParams.get("briefingType");
    const status = searchParams.get("status");
    const period = searchParams.get("period");
    const limit = searchParams.get("limit") ? parseInt(searchParams.get("limit")!, 10) : undefined;
    const offset = searchParams.get("offset") ? parseInt(searchParams.get("offset")!, 10) : undefined;

    const result = await ControllerSpecialistService.listBriefings(ctx, {
      briefingType: briefingType ?? undefined,
      status: status ?? undefined,
      period: period ?? undefined,
      limit,
      offset,
    });

    return NextResponse.json(result, { headers: cacheHeaders(30) });
  } catch (err) {
    return handleRouteError(err, req);
  }
}

export async function POST(req: Request) {
  try {
    const session = await auth();
    const ctx = requireTenantContext(session?.user?.id, session?.user?.activeCompanyId, session?.user?.companyRole);

    const body = await parseJsonBody<{ date?: string }>(req);
    const date = body.date ? new Date(body.date) : undefined;

    const briefing = await ControllerSpecialistService.generateDailyBriefing(ctx, date);
    return NextResponse.json(briefing, { status: 201 });
  } catch (err) {
    return handleRouteError(err, req);
  }
}
