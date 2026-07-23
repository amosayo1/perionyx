import { NextResponse } from "next/server";
import { auth } from "@/server/auth/auth";
import { requireTenantContext } from "@/server/context/tenant-context";
import { ExecutiveCommandCenter } from "@/modules/executive-command-center";
import { handleRouteError, cacheHeaders } from "@/server/http/handle-route";

export async function GET(req: Request) {
  try {
    const session = await auth();
    const ctx = requireTenantContext(session?.user?.id, session?.user?.activeCompanyId, session?.user?.companyRole);

    const result = await ExecutiveCommandCenter.getExecutiveCalendar(ctx);
    return NextResponse.json(result, { headers: cacheHeaders(60) });
  } catch (err) {
    return handleRouteError(err, req);
  }
}
