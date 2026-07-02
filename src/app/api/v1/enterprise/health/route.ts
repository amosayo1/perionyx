import { NextResponse } from "next/server";
import { auth } from "@/server/auth/auth";
import { requireTenantContext } from "@/server/context/tenant-context";
import { handleRouteError } from "@/server/http/handle-route";
import { getSystemHealth } from "@/modules/health/system-health";

export async function GET() {
  try {
    const session = await auth();
    const ctx = requireTenantContext(session?.user?.id, session?.user?.activeCompanyId, session?.user?.companyRole);
    const health = await getSystemHealth(ctx);
    return NextResponse.json(health);
  } catch (error) {
    return handleRouteError(error);
  }
}
