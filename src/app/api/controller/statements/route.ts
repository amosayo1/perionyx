import { NextResponse } from "next/server";
import { auth } from "@/server/auth/auth";
import { requireTenantContext } from "@/server/context/tenant-context";
import { cacheHeaders, handleRouteError } from "@/server/http/handle-route";
import { StatementReadinessService } from "@/modules/controller-specialist/statement-readiness";

export async function GET(req: Request) {
  try {
    const session = await auth();
    const ctx = requireTenantContext(session?.user?.id, session?.user?.activeCompanyId, session?.user?.companyRole);

    const { searchParams } = new URL(req.url);
    const period = searchParams.get("period");

    if (!period) {
      return NextResponse.json(
        { error: { code: "VALIDATION", message: "period query parameter is required" } },
        { status: 400 },
      );
    }

    const summary = await StatementReadinessService.getReadinessSummary(ctx, period);
    return NextResponse.json(summary, { headers: cacheHeaders(30) });
  } catch (err) {
    return handleRouteError(err, req);
  }
}
