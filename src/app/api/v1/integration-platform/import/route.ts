import { NextRequest, NextResponse } from "next/server";
import { handleRouteError, parseJsonBody, noCacheHeaders } from "@/server/http/handle-route";
import { rbacService } from "@/modules/rbac/rbac.service";
import { ExcelImportService } from "@/modules/integration-platform";
import { withRuntimeContext } from "@/server/http/init-runtime-context";

export async function POST(request: NextRequest) {
  return withRuntimeContext(request, async (ctx) => {
    try {
      await rbacService.ensurePermission(ctx.tenant.userId, ctx.tenant.companyId, "integration.import");
      const body = await parseJsonBody<{ action: "analyze" | "confirm"; rows: Record<string, string>[]; knownMapping?: Record<string, string>; instanceId?: string; templateId?: string }>(request);
      if (body.action === "analyze") {
        const result = await ExcelImportService.analyzeImport(ctx.tenant, { rows: body.rows, knownMapping: body.knownMapping });
        return NextResponse.json(result, { headers: { ...noCacheHeaders() } });
      } else if (body.action === "confirm") {
        const mapping = body.knownMapping ?? {};
        const result = await ExcelImportService.confirmImport(ctx.tenant, { instanceId: body.instanceId, templateId: body.templateId, mapping, rows: body.rows });
        return NextResponse.json(result, { headers: { ...noCacheHeaders() } });
      }
      return NextResponse.json({ error: "action must be analyze or confirm" }, { status: 400 });
    } catch (error) {
      return handleRouteError(error);
    }
  });
}
