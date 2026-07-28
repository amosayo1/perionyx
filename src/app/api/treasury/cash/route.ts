import { NextResponse } from "next/server";
import { cacheHeaders, handleRouteError } from "@/server/http/handle-route";
import { CashPositionService } from "@/modules/treasury-specialist/cash-position";
import type { CashRegion } from "@/modules/treasury-specialist/types";
import { withRuntimeContext } from "@/server/http/init-runtime-context";

export async function GET(req: Request) {
  return withRuntimeContext(req, async (ctx) => {
    try {
  
      const { searchParams } = new URL(req.url);
      const region = searchParams.get("region") as CashRegion | null;
      const currency = searchParams.get("currency");
      const classification = searchParams.get("classification") as import("@/modules/treasury-specialist/types").CashClassification | null;
  
      const result = await CashPositionService.getGlobalCashPosition(ctx.tenant);
      return NextResponse.json(result, { headers: cacheHeaders(30) });
    } catch (err) {
      return handleRouteError(err, req);
    }
  });
}
