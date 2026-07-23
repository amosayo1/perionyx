import { NextResponse } from "next/server";
import { auth } from "@/server/auth/auth";
import { requireTenantContext } from "@/server/context/tenant-context";
import { listAuditLogsForTenant } from "@/modules/audit";
import { cacheHeaders, handleRouteError } from "@/server/http/handle-route";
import { parseCursorPagination } from "@/server/http/pagination";
import { rbacService } from "@/modules/rbac/rbac.service";

export async function GET(request: Request) {
  try {
    const session = await auth();
    const ctx = requireTenantContext(
      session?.user?.id,
      session?.user?.activeCompanyId,
      session?.user?.companyRole,
    );
    await rbacService.ensurePermission(ctx.userId, ctx.companyId, 'audit.read');
    const { searchParams } = new URL(request.url);
    const { take, cursor } = parseCursorPagination(searchParams);
    const search = searchParams.get("search") ?? undefined;
    const { rows, nextCursor } = await listAuditLogsForTenant(ctx, { take, cursor, search });

    return NextResponse.json({
      items: rows.map((a) => ({
        id: a.id,
        companyId: a.companyId,
        actorUserId: a.actorUserId,
        action: a.action,
        resourceType: a.resourceType,
        resourceId: a.resourceId,
        severity: a.severity,
        metadata: a.metadata,
        requestId: a.requestId,
        payloadHash: a.payloadHash,
        ipAddress: a.ipAddress,
        userAgent: a.userAgent,
        createdAt: a.createdAt.toISOString(),
      })),
      nextCursor,
    }, { headers: { ...cacheHeaders(30) } });
  } catch (error) {
    return handleRouteError(error);
  }
}
