import { NextResponse } from "next/server";
import { auth } from "@/server/auth/auth";
import { requireTenantContext } from "@/server/context/tenant-context";
import { cacheHeaders, handleRouteError } from "@/server/http/handle-route";
import { CloseManagementService } from "@/modules/controller-specialist/close-management";

export async function GET(req: Request) {
  try {
    const session = await auth();
    const ctx = requireTenantContext(session?.user?.id, session?.user?.activeCompanyId, session?.user?.companyRole);

    const { searchParams } = new URL(req.url);
    const year = searchParams.get("year") ? parseInt(searchParams.get("year")!, 10) : undefined;

    const calendar = await CloseManagementService.getCloseCalendar(ctx, year);
    return NextResponse.json(calendar, { headers: cacheHeaders(60) });
  } catch (err) {
    return handleRouteError(err, req);
  }
}
