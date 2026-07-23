import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/server/auth/auth";
import { requireTenantContext } from "@/server/context/tenant-context";
import { handleRouteError, parseJsonBody, noCacheHeaders } from "@/server/http/handle-route";
import { rbacService } from "@/modules/rbac/rbac.service";
import { IntegrationRegistry, IntegrationAuditService } from "@/modules/integration-platform";
import { prisma } from "@/server/db/prisma";

export async function GET(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const session = await auth();
    const ctx = requireTenantContext(session?.user?.id, session?.user?.activeCompanyId, session?.user?.companyRole);
    await rbacService.ensurePermission(ctx.userId, ctx.companyId, "integration.connector.read");
    const instance = await IntegrationRegistry.getInstance(ctx, id);
    if (!instance) return NextResponse.json({ error: "Instance not found" }, { status: 404 });
    return NextResponse.json({ instance });
  } catch (error) {
    return handleRouteError(error);
  }
}

export async function PUT(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const session = await auth();
    const ctx = requireTenantContext(session?.user?.id, session?.user?.activeCompanyId, session?.user?.companyRole);
    await rbacService.ensurePermission(ctx.userId, ctx.companyId, "integration.connector.write");
    const body = await parseJsonBody<Record<string, unknown>>(request);
    const updateData: Record<string, unknown> = {};
    if (body.name) updateData.name = body.name;
    if (body.config) updateData.config = body.config;
    if (body.status) updateData.status = body.status;
    if (Object.keys(updateData).length > 0) updateData.version = { increment: 1 };
    if (Object.keys(updateData).length === 0) return NextResponse.json({ error: "No fields to update" }, { status: 400 });
    await prisma.integrationInstance.updateMany({ where: { id, companyId: ctx.companyId }, data: updateData });
    await IntegrationAuditService.record(ctx, { instanceId: id, action: "updated", entityType: "integration-instance", entityId: id, changes: updateData });
    const instance = await IntegrationRegistry.getInstance(ctx, id);
    return NextResponse.json({ instance }, { headers: { ...noCacheHeaders() } });
  } catch (error) {
    return handleRouteError(error);
  }
}

export async function DELETE(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const session = await auth();
    const ctx = requireTenantContext(session?.user?.id, session?.user?.activeCompanyId, session?.user?.companyRole);
    await rbacService.ensurePermission(ctx.userId, ctx.companyId, "integration.connector.write");
    await IntegrationRegistry.deleteInstance(ctx, id);
    return new NextResponse(null, { status: 204 });
  } catch (error) {
    return handleRouteError(error);
  }
}
