import { NextResponse } from "next/server";
import { auth } from "@/server/auth/auth";
import { requireTenantContext } from "@/server/context/tenant-context";
import { ExecutiveCommandCenter } from "@/modules/executive-command-center";
import { handleRouteError, cacheHeaders } from "@/server/http/handle-route";

export async function GET(req: Request) {
  try {
    const session = await auth();
    const ctx = requireTenantContext(session?.user?.id, session?.user?.activeCompanyId, session?.user?.companyRole);

    const url = new URL(req.url);
    const type = url.searchParams.get("type") as "morning" | "evening" | "weekly" | "adhoc" | null;

    const result = await ExecutiveCommandCenter.getExecutiveBriefing(ctx, type ?? "morning");
    return NextResponse.json(result, { headers: cacheHeaders(120) });
  } catch (err) {
    return handleRouteError(err, req);
  }
}
