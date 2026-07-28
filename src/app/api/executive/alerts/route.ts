import { NextResponse, type NextRequest } from "next/server";
import { ExecutiveCommandCenter } from "@/modules/executive-command-center";
import { handleRouteError, zodErrorResponse, cacheHeaders } from "@/server/http/handle-route";
import { z } from "zod";
import { withRuntimeContext } from "@/server/http/init-runtime-context";

const acknowledgeSchema = z.object({
  alertId: z.string().min(1),
});

export async function GET(req: Request) {
  return withRuntimeContext(req, async (ctx) => {
    try {
  
      const result = await ExecutiveCommandCenter.getExecutiveAlerts(ctx.tenant);
      return NextResponse.json(result, { headers: cacheHeaders(15) });
    } catch (err) {
      return handleRouteError(err, req);
    }
  });
}

export async function POST(req: NextRequest) {
  return withRuntimeContext(req, async (ctx) => {
    try {
  
      const body = await req.json();
      const parseResult = acknowledgeSchema.safeParse(body);
      if (!parseResult.success) return zodErrorResponse(parseResult.error, req);
  
      const alerts = await ExecutiveCommandCenter.getExecutiveAlerts(ctx.tenant);
      const acknowledged = alerts.map((a) =>
        a.id === parseResult.data.alertId
          ? { ...a, acknowledgedAt: new Date() }
          : a,
      );
  
      return NextResponse.json({ success: true, alerts: acknowledged });
    } catch (err) {
      return handleRouteError(err, req);
    }
  });
}
