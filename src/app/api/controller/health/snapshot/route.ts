import { NextResponse } from "next/server";
import { handleRouteError, parseJsonBody } from "@/server/http/handle-route";
import { AccountingHealthService } from "@/modules/controller-specialist/accounting-health";
import { withRuntimeContext } from "@/server/http/init-runtime-context";

export async function POST(req: Request) {
  return withRuntimeContext(req, async (ctx) => {
    try {
  
      const body = await parseJsonBody<{ period: string }>(req);
  
      if (!body.period) {
        return NextResponse.json(
          { error: { code: "VALIDATION", message: "period is required" } },
          { status: 400 },
        );
      }
  
      const snapshot = await AccountingHealthService.captureSnapshot(ctx.tenant, body.period);
      return NextResponse.json(snapshot, { status: 201 });
    } catch (err) {
      return handleRouteError(err, req);
    }
  });
}
