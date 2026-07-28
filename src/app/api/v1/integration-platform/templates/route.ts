import { NextRequest, NextResponse } from "next/server";
import { handleRouteError, parseJsonBody, cacheHeaders, noCacheHeaders } from "@/server/http/handle-route";
import { rbacService } from "@/modules/rbac/rbac.service";
import { CsvMappingService } from "@/modules/integration-platform";
import { withRuntimeContext } from "@/server/http/init-runtime-context";

export async function GET(request: NextRequest) {
  return withRuntimeContext(request, async (ctx) => {
    try {
      await rbacService.ensurePermission(ctx.tenant.userId, ctx.tenant.companyId, "integration.template");
      const { searchParams } = new URL(request.url);
      const sourceType = searchParams.get("sourceType") ?? undefined;
      const templates = await CsvMappingService.listTemplates(ctx.tenant, { sourceType });
      return NextResponse.json({ templates }, { headers: { ...cacheHeaders(30) } });
    } catch (error) {
      return handleRouteError(error);
    }
  });
}

export async function POST(request: NextRequest) {
  return withRuntimeContext(request, async (ctx) => {
    try {
      await rbacService.ensurePermission(ctx.tenant.userId, ctx.tenant.companyId, "integration.template");
      const body = await parseJsonBody<{ name: string; sourceType: string; mapping: any[]; isShared?: boolean }>(request);
      const template = await CsvMappingService.createTemplate(ctx.tenant, body);
      return NextResponse.json({ template }, { status: 201, headers: { ...noCacheHeaders() } });
    } catch (error) {
      return handleRouteError(error);
    }
  });
}

export async function PUT(request: NextRequest) {
  return withRuntimeContext(request, async (ctx) => {
    try {
      await rbacService.ensurePermission(ctx.tenant.userId, ctx.tenant.companyId, "integration.template");
      const { searchParams } = new URL(request.url);
      const id = searchParams.get("id");
      if (!id) return NextResponse.json({ error: "id required" }, { status: 400 });
      const body = await parseJsonBody<Record<string, unknown>>(request);
      const template = await CsvMappingService.updateTemplate(ctx.tenant, id, body);
      return NextResponse.json({ template }, { headers: { ...noCacheHeaders() } });
    } catch (error) {
      return handleRouteError(error);
    }
  });
}

export async function DELETE(request: NextRequest) {
  return withRuntimeContext(request, async (ctx) => {
    try {
      await rbacService.ensurePermission(ctx.tenant.userId, ctx.tenant.companyId, "integration.template");
      const { searchParams } = new URL(request.url);
      const id = searchParams.get("id");
      if (!id) return NextResponse.json({ error: "id required" }, { status: 400 });
      await CsvMappingService.deleteTemplate(ctx.tenant, id);
      return new NextResponse(null, { status: 204 });
    } catch (error) {
      return handleRouteError(error);
    }
  });
}
