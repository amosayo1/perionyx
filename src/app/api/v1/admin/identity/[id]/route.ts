import { NextResponse } from "next/server";
import { rbacService } from "@/modules/rbac/rbac.service";
import { handleRouteError } from "@/server/http/handle-route";
import {
  getProviderConfig,
  updateProviderStatus,
  deleteProviderConfig,
} from "@/modules/identity/config";
import { withRuntimeContext } from "@/server/http/init-runtime-context";

export async function GET(_req: Request, { params }: { params: Promise<{ id: string }> }) {
  return withRuntimeContext(_req, async (ctx) => {
    try {
      const { id } = await params;
      await rbacService.ensurePermission(ctx.tenant.userId, ctx.tenant.companyId, 'admin.security');
  
      const config = await getProviderConfig(id);
      if (!config) {
        return NextResponse.json({ error: "Provider not found" }, { status: 404 });
      }
      return NextResponse.json(config);
    } catch (error) {
      return handleRouteError(error);
    }
  });
}

export async function PATCH(req: Request, { params }: { params: Promise<{ id: string }> }) {
  return withRuntimeContext(req, async (ctx) => {
    try {
      const { id } = await params;
      await rbacService.ensurePermission(ctx.tenant.userId, ctx.tenant.companyId, 'admin.security');
  
      const body = await req.json();
      if (body.status) {
        await updateProviderStatus(id, body.status);
      }
      return NextResponse.json({ ok: true });
    } catch (error) {
      return handleRouteError(error);
    }
  });
}

export async function DELETE(_req: Request, { params }: { params: Promise<{ id: string }> }) {
  return withRuntimeContext(_req, async (ctx) => {
    try {
      const { id } = await params;
      await rbacService.ensurePermission(ctx.tenant.userId, ctx.tenant.companyId, 'admin.security');
  
      await deleteProviderConfig(id);
      return NextResponse.json({ ok: true });
    } catch (error) {
      return handleRouteError(error);
    }
  });
}
