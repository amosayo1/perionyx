import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/server/auth/auth";
import { requireTenantContext } from "@/server/context/tenant-context";
import { handleRouteError, parseJsonBody, noCacheHeaders } from "@/server/http/handle-route";
import { rbacService } from "@/modules/rbac/rbac.service";

export async function POST(request: NextRequest) {
  try {
    const session = await auth();
    const ctx = requireTenantContext(session?.user?.id, session?.user?.activeCompanyId, session?.user?.companyRole);
    await rbacService.ensurePermission(ctx.userId, ctx.companyId, "integration.export");
    const body = await parseJsonBody<{ instanceId: string; entityType: string; format: string; filters?: Record<string, string> }>(request);
    if (!body.instanceId || !body.entityType) {
      return NextResponse.json({ error: "instanceId and entityType required" }, { status: 400 });
    }
    if (body.format === "csv") {
      const csv = `instanceId,entityType\n${body.instanceId},${body.entityType}\n`;
      return new NextResponse(csv, {
        status: 200,
        headers: { "Content-Type": "text/csv", "Content-Disposition": `attachment; filename="export-${body.instanceId}.csv"`, ...noCacheHeaders() },
      });
    }
    return NextResponse.json({ data: { instanceId: body.instanceId, entityType: body.entityType, filters: body.filters } }, { headers: { ...noCacheHeaders() } });
  } catch (error) {
    return handleRouteError(error);
  }
}
