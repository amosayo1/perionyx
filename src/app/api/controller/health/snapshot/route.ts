import { NextResponse } from "next/server";
import { auth } from "@/server/auth/auth";
import { requireTenantContext } from "@/server/context/tenant-context";
import { handleRouteError, parseJsonBody } from "@/server/http/handle-route";
import { AccountingHealthService } from "@/modules/controller-specialist/accounting-health";

export async function POST(req: Request) {
  try {
    const session = await auth();
    const ctx = requireTenantContext(session?.user?.id, session?.user?.activeCompanyId, session?.user?.companyRole);

    const body = await parseJsonBody<{ period: string }>(req);

    if (!body.period) {
      return NextResponse.json(
        { error: { code: "VALIDATION", message: "period is required" } },
        { status: 400 },
      );
    }

    const snapshot = await AccountingHealthService.captureSnapshot(ctx, body.period);
    return NextResponse.json(snapshot, { status: 201 });
  } catch (err) {
    return handleRouteError(err, req);
  }
}
