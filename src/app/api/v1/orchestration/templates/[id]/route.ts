import { NextRequest, NextResponse } from "next/server";
import { handleRouteError, parseJsonBody } from "@/server/http/handle-route";
import { rbacService } from "@/modules/rbac/rbac.service";
import { TemplateLibrary } from "@/modules/orchestration";
import { withRuntimeContext } from "@/server/http/init-runtime-context";

export async function GET(_request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  return withRuntimeContext(_request, async (ctx) => {
    try {
      const { id } = await params;
      await rbacService.ensurePermission(ctx.tenant.userId, ctx.tenant.companyId, "orchestration.read");
      const item = await TemplateLibrary.get(ctx.tenant, id);
      if (!item) return NextResponse.json({ error: { code: "NOT_FOUND", message: "Template not found" } }, { status: 404 });
      return NextResponse.json(item);
    } catch (error) {
      return handleRouteError(error);
    }
  });
}

export async function POST(_request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  return withRuntimeContext(_request, async (ctx) => {
    try {
      const { id } = await params;
      await rbacService.ensurePermission(ctx.tenant.userId, ctx.tenant.companyId, "orchestration.write");
      const body = await parseJsonBody<{ name: string }>(_request);
      const result = await TemplateLibrary.instantiate(ctx.tenant, id, body.name);
      return NextResponse.json(result, { status: 201 });
    } catch (error) {
      return handleRouteError(error);
    }
  });
}
