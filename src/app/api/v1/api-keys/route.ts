import { NextResponse } from "next/server";
import { handleRouteError, parseJsonBody } from "@/server/http/handle-route";
import { ApiKeyService } from "@/modules/api-keys";
import { rbacService } from "@/modules/rbac/rbac.service";
import { withRuntimeContext } from "@/server/http/init-runtime-context";

export async function GET() {
  return withRuntimeContext(new Headers(), async (ctx) => {
    try {
      await rbacService.ensurePermission(ctx.tenant.userId, ctx.tenant.companyId, 'admin.api_keys');
      const keys = await ApiKeyService.list(ctx.tenant);
      return NextResponse.json({ items: keys });
    } catch (error) {
      return handleRouteError(error);
    }
  });
}

export async function POST(request: Request) {
  return withRuntimeContext(request, async (ctx) => {
    try {
      const body = await parseJsonBody<{ name: string; scopes?: string[]; expiresAt?: string }>(request);
      const key = await ApiKeyService.create(ctx.tenant, body);
      return NextResponse.json(key, { status: 201 });
    } catch (error) {
      return handleRouteError(error);
    }
  });
}

export async function PATCH(request: Request) {
  return withRuntimeContext(request, async (ctx) => {
    try {
      const body = await parseJsonBody<{ id: string; name?: string; scopes?: string[]; active?: boolean; expiresAt?: string | null }>(request);
      const key = await ApiKeyService.update(ctx.tenant, body.id, body);
      return NextResponse.json(key);
    } catch (error) {
      return handleRouteError(error);
    }
  });
}

export async function DELETE(request: Request) {
  return withRuntimeContext(request, async (ctx) => {
    try {
      const body = await parseJsonBody<{ id: string }>(request);
      const result = await ApiKeyService.delete(ctx.tenant, body.id);
      return NextResponse.json(result);
    } catch (error) {
      return handleRouteError(error);
    }
  });
}
