import { NextRequest, NextResponse } from "next/server";
import { handleRouteError, parseJsonBody, cacheHeaders, noCacheHeaders } from "@/server/http/handle-route";
import { rbacService } from "@/modules/rbac/rbac.service";
import { ValidationEngineService } from "@/modules/integration-platform";
import { withRuntimeContext } from "@/server/http/init-runtime-context";

export async function POST(request: NextRequest) {
  return withRuntimeContext(request, async (ctx) => {
    try {
      await rbacService.ensurePermission(ctx.tenant.userId, ctx.tenant.companyId, "integration.validation");
      const body = await parseJsonBody<{ instanceId?: string; rows: Record<string, unknown>[] }>(request);
      if (!body.rows) return NextResponse.json({ error: "rows are required" }, { status: 400 });
      const issues = await ValidationEngineService.validateImport(ctx.tenant, { instanceId: body.instanceId, rows: body.rows });
      return NextResponse.json({ issues }, { status: 201, headers: { ...noCacheHeaders() } });
    } catch (error) {
      return handleRouteError(error);
    }
  });
}

export async function GET(request: NextRequest) {
  return withRuntimeContext(request, async (ctx) => {
    try {
      await rbacService.ensurePermission(ctx.tenant.userId, ctx.tenant.companyId, "integration.validation");
      const { searchParams } = new URL(request.url);
      const opts = {
        severity: searchParams.get("severity") ?? undefined,
        category: searchParams.get("category") ?? undefined,
        isResolved: searchParams.has("isResolved") ? searchParams.get("isResolved") === "true" : undefined,
        limit: parseInt(searchParams.get("limit") ?? "50"),
        offset: parseInt(searchParams.get("offset") ?? "0"),
      };
      const [result, summary] = await Promise.all([
        ValidationEngineService.listIssues(ctx.tenant, opts),
        ValidationEngineService.getIssueSummary(ctx.tenant),
      ]);
      return NextResponse.json({ ...result, summary }, { headers: { ...cacheHeaders(15) } });
    } catch (error) {
      return handleRouteError(error);
    }
  });
}
