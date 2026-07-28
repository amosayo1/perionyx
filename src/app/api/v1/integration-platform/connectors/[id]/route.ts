import { NextRequest, NextResponse } from "next/server";
import { handleRouteError, parseJsonBody, noCacheHeaders } from "@/server/http/handle-route";
import { rbacService } from "@/modules/rbac/rbac.service";
import { IntegrationRegistry, IntegrationAuditService } from "@/modules/integration-platform";
import { prisma } from "@/server/db/prisma";
import { withRuntimeContext } from "@/server/http/init-runtime-context";

export async function GET(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  return withRuntimeContext(request, async (ctx) => {
    try {
      const { id } = await params;
      await rbacService.ensurePermission(ctx.tenant.userId, ctx.tenant.companyId, "integration.connector.read");
      const instance = await IntegrationRegistry.getInstance(ctx.tenant, id);
      if (!instance) return NextResponse.json({ error: "Instance not found" }, { status: 404 });
      return NextResponse.json({ instance });
    } catch (error) {
      return handleRouteError(error);
    }
  });
}

export async function PUT(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  return withRuntimeContext(request, async (ctx) => {
    try {
      const { id } = await params;
      await rbacService.ensurePermission(ctx.tenant.userId, ctx.tenant.companyId, "integration.connector.write");
      const body = await parseJsonBody<Record<string, unknown>>(request);
      const updateData: Record<string, unknown> = {};
      if (body.name) updateData.name = body.name;
      if (body.config) updateData.config = body.config;
      if (body.status) updateData.status = body.status;
      if (Object.keys(updateData).length > 0) updateData.version = { increment: 1 };
      if (Object.keys(updateData).length === 0) return NextResponse.json({ error: "No fields to update" }, { status: 400 });
      await prisma.integrationInstance.updateMany({ where: { id, companyId: ctx.tenant.companyId }, data: updateData });
      await IntegrationAuditService.record(ctx.tenant, { instanceId: id, action: "updated", entityType: "integration-instance", entityId: id, changes: updateData });
      const instance = await IntegrationRegistry.getInstance(ctx.tenant, id);
      return NextResponse.json({ instance }, { headers: { ...noCacheHeaders() } });
    } catch (error) {
      return handleRouteError(error);
    }
  });
}

export async function DELETE(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  return withRuntimeContext(request, async (ctx) => {
    try {
      const { id } = await params;
      await rbacService.ensurePermission(ctx.tenant.userId, ctx.tenant.companyId, "integration.connector.write");
      await IntegrationRegistry.deleteInstance(ctx.tenant, id);
      return new NextResponse(null, { status: 204 });
    } catch (error) {
      return handleRouteError(error);
    }
  });
}
