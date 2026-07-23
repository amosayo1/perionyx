import { NextResponse } from "next/server";
import { ReconciliationSpecialist } from "@/modules/reconciliation";
import { cacheHeaders, handleRouteError } from "@/server/http/handle-route";
import { requireTenantContext } from "@/server/context/tenant-context";
import { auth } from "@/server/auth/auth";

export async function GET() {
  try {
    const session = await auth();
    const ctx = requireTenantContext(session?.user?.id, session?.user?.activeCompanyId, session?.user?.companyRole);
    const dashboard = await ReconciliationSpecialist.getDashboard(ctx);
    return NextResponse.json(dashboard, { headers: cacheHeaders(30) });
  } catch (error) {
    return handleRouteError(error);
  }
}
