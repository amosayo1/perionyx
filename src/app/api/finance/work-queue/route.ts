import { NextResponse } from "next/server";
import { cacheHeaders, handleRouteError } from "@/server/http/handle-route";
import { FinanceCollaborationService } from "@/modules/finance-collaboration";
import { getWorkQueueSchema } from "@/lib/validations/finance-collaboration";
import { zodErrorResponse } from "@/server/http/handle-route";
import { withRuntimeContext } from "@/server/http/init-runtime-context";

export async function GET(req: Request) {
  return withRuntimeContext(req, async (ctx) => {
    try {
  
      const { searchParams } = new URL(req.url);
      const params = Object.fromEntries(searchParams.entries());
  
      const parsed = getWorkQueueSchema.safeParse(params);
      if (!parsed.success) {
        return zodErrorResponse(parsed.error, req);
      }
  
      const data = await FinanceCollaborationService.getWorkQueue(ctx.tenant, parsed.data);
      return NextResponse.json(data, { headers: cacheHeaders(15) });
    } catch (err) {
      return handleRouteError(err, req);
    }
  });
}
