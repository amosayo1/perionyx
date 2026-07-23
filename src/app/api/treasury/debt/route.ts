import { NextResponse } from "next/server";
import { auth } from "@/server/auth/auth";
import { requireTenantContext } from "@/server/context/tenant-context";
import { cacheHeaders, handleRouteError } from "@/server/http/handle-route";
import { TreasurySpecialistService } from "@/modules/treasury-specialist/treasury-specialist";

export async function GET(req: Request) {
  try {
    const session = await auth();
    const ctx = requireTenantContext(session?.user?.id, session?.user?.activeCompanyId, session?.user?.companyRole);

    const { searchParams } = new URL(req.url);
    const instrumentType = searchParams.get("instrumentType");
    const includeCovenants = searchParams.get("includeCovenants") === "true";
    const includeAlerts = searchParams.get("includeAlerts") === "true";

    const result = await TreasurySpecialistService.getDebtManagement(ctx);
    return NextResponse.json(result, { headers: cacheHeaders(30) });
  } catch (err) {
    return handleRouteError(err, req);
  }
}
