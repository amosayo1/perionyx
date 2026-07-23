import { NextResponse, type NextRequest } from "next/server";
import { auth } from "@/server/auth/auth";
import { requireTenantContext } from "@/server/context/tenant-context";
import { ExecutiveCommandCenter } from "@/modules/executive-command-center";
import { handleRouteError, zodErrorResponse, cacheHeaders } from "@/server/http/handle-route";
import { z } from "zod";

const acknowledgeSchema = z.object({
  alertId: z.string().min(1),
});

export async function GET(req: Request) {
  try {
    const session = await auth();
    const ctx = requireTenantContext(session?.user?.id, session?.user?.activeCompanyId, session?.user?.companyRole);

    const result = await ExecutiveCommandCenter.getExecutiveAlerts(ctx);
    return NextResponse.json(result, { headers: cacheHeaders(15) });
  } catch (err) {
    return handleRouteError(err, req);
  }
}

export async function POST(req: NextRequest) {
  try {
    const session = await auth();
    const ctx = requireTenantContext(session?.user?.id, session?.user?.activeCompanyId, session?.user?.companyRole);

    const body = await req.json();
    const parseResult = acknowledgeSchema.safeParse(body);
    if (!parseResult.success) return zodErrorResponse(parseResult.error, req);

    const alerts = await ExecutiveCommandCenter.getExecutiveAlerts(ctx);
    const acknowledged = alerts.map((a) =>
      a.id === parseResult.data.alertId
        ? { ...a, acknowledgedAt: new Date() }
        : a,
    );

    return NextResponse.json({ success: true, alerts: acknowledged });
  } catch (err) {
    return handleRouteError(err, req);
  }
}
