import { NextResponse } from "next/server";
import { auth } from "@/server/auth/auth";
import { requireTenantContext } from "@/server/context/tenant-context";
import { cacheHeaders, handleRouteError } from "@/server/http/handle-route";
import { CashPositionService } from "@/modules/treasury-specialist/cash-position";
import type { CashRegion } from "@/modules/treasury-specialist/types";

export async function GET(req: Request) {
  try {
    const session = await auth();
    const ctx = requireTenantContext(session?.user?.id, session?.user?.activeCompanyId, session?.user?.companyRole);

    const { searchParams } = new URL(req.url);
    const region = searchParams.get("region") as CashRegion | null;
    const currency = searchParams.get("currency");
    const classification = searchParams.get("classification") as import("@/modules/treasury-specialist/types").CashClassification | null;

    const result = await CashPositionService.getGlobalCashPosition(ctx);
    return NextResponse.json(result, { headers: cacheHeaders(30) });
  } catch (err) {
    return handleRouteError(err, req);
  }
}
