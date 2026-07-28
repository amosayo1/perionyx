import { NextResponse } from "next/server";
import { ReconciliationSpecialist } from "@/modules/reconciliation";
import { cacheHeaders, handleRouteError } from "@/server/http/handle-route";
import { withRuntimeContext } from "@/server/http/init-runtime-context";

export async function GET() {
  return withRuntimeContext(new Headers(), async (ctx) => {
    try {
      const dashboard = await ReconciliationSpecialist.getDashboard(ctx.tenant);
      return NextResponse.json(dashboard, { headers: cacheHeaders(30) });
    } catch (error) {
      return handleRouteError(error);
    }
  });
}
