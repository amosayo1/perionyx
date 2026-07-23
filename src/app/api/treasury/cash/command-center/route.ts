import { NextResponse } from "next/server";
import { auth } from "@/server/auth/auth";
import { requireTenantContext } from "@/server/context/tenant-context";
import { cacheHeaders, handleRouteError } from "@/server/http/handle-route";
import { TreasurySpecialistService } from "@/modules/treasury-specialist/treasury-specialist";

export async function GET(req: Request) {
  try {
    const session = await auth();
    const ctx = requireTenantContext(session?.user?.id, session?.user?.activeCompanyId, session?.user?.companyRole);

    const commandCenter = await TreasurySpecialistService.getCashCommandCenter(ctx);
    return NextResponse.json(commandCenter, { headers: cacheHeaders(30) });
  } catch (err) {
    return handleRouteError(err, req);
  }
}
