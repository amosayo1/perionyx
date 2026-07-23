import { NextResponse } from "next/server";
import { auth } from "@/server/auth/auth";
import { requireTenantContext } from "@/server/context/tenant-context";
import { cacheHeaders, handleRouteError } from "@/server/http/handle-route";
import { CloseManagementService } from "@/modules/controller-specialist/close-management";

export async function GET(
  req: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const session = await auth();
    const ctx = requireTenantContext(session?.user?.id, session?.user?.activeCompanyId, session?.user?.companyRole);
    const { id } = await params;

    const period = await CloseManagementService.getClosePeriod(ctx, id);
    return NextResponse.json(period, { headers: cacheHeaders(15) });
  } catch (err) {
    return handleRouteError(err, req);
  }
}
