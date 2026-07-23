import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/server/auth/auth";
import { requireTenantContext } from "@/server/context/tenant-context";
import { handleRouteError, parseJsonBody, noCacheHeaders } from "@/server/http/handle-route";
import { rbacService } from "@/modules/rbac/rbac.service";
import { ExcelImportService } from "@/modules/integration-platform";

export async function POST(request: NextRequest) {
  try {
    const session = await auth();
    const ctx = requireTenantContext(session?.user?.id, session?.user?.activeCompanyId, session?.user?.companyRole);
    await rbacService.ensurePermission(ctx.userId, ctx.companyId, "integration.import");
    const body = await parseJsonBody<{ action: "analyze" | "confirm"; rows: Record<string, string>[]; knownMapping?: Record<string, string>; instanceId?: string; templateId?: string }>(request);
    if (body.action === "analyze") {
      const result = await ExcelImportService.analyzeImport(ctx, { rows: body.rows, knownMapping: body.knownMapping });
      return NextResponse.json(result, { headers: { ...noCacheHeaders() } });
    } else if (body.action === "confirm") {
      const mapping = body.knownMapping ?? {};
      const result = await ExcelImportService.confirmImport(ctx, { instanceId: body.instanceId, templateId: body.templateId, mapping, rows: body.rows });
      return NextResponse.json(result, { headers: { ...noCacheHeaders() } });
    }
    return NextResponse.json({ error: "action must be analyze or confirm" }, { status: 400 });
  } catch (error) {
    return handleRouteError(error);
  }
}
