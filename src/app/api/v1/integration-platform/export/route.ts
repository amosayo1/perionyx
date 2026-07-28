import { NextRequest, NextResponse } from "next/server";
import { handleRouteError, parseJsonBody, noCacheHeaders } from "@/server/http/handle-route";
import { rbacService } from "@/modules/rbac/rbac.service";
import { withRuntimeContext } from "@/server/http/init-runtime-context";

export async function POST(request: NextRequest) {
  return withRuntimeContext(request, async (ctx) => {
    try {
      await rbacService.ensurePermission(ctx.tenant.userId, ctx.tenant.companyId, "integration.export");
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
  });
}
