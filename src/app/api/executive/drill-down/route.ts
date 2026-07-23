import { NextResponse } from "next/server";
import { auth } from "@/server/auth/auth";
import { requireTenantContext } from "@/server/context/tenant-context";
import { ExecutiveCommandCenter } from "@/modules/executive-command-center";
import { handleRouteError } from "@/server/http/handle-route";

export async function GET(req: Request) {
  try {
    const session = await auth();
    const ctx = requireTenantContext(session?.user?.id, session?.user?.activeCompanyId, session?.user?.companyRole);

    const url = new URL(req.url);
    const domain = url.searchParams.get("domain");
    if (!domain) {
      return NextResponse.json({ error: "domain query parameter is required" }, { status: 400 });
    }
    const entityId = url.searchParams.get("entityId") ?? undefined;

    const result = await ExecutiveCommandCenter.getDrillDown(ctx, domain, entityId);
    return NextResponse.json(result);
  } catch (err) {
    return handleRouteError(err, req);
  }
}
