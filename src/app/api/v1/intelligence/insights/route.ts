import { NextResponse } from "next/server";
import { auth } from "@/server/auth/auth";
import { requireTenantContext } from "@/server/context/tenant-context";
import { handleRouteError, parseJsonBody, noCacheHeaders } from "@/server/http/handle-route";
import { rbacService } from "@/modules/rbac/rbac.service";
import { prisma } from "@/server/db/prisma";

export async function GET() {
  try {
    const session = await auth();
    const ctx = requireTenantContext(session?.user?.id, session?.user?.activeCompanyId, session?.user?.companyRole);
    await rbacService.ensurePermission(ctx.userId, ctx.companyId, "intelligence.read");

    const items = await prisma.insightEvent.findMany({
      where: { companyId: ctx.companyId },
      orderBy: { createdAt: "desc" },
      take: 100,
    });

    return NextResponse.json({ items });
  } catch (error) {
    return handleRouteError(error);
  }
}

export async function PUT(request: Request) {
  try {
    const session = await auth();
    const ctx = requireTenantContext(session?.user?.id, session?.user?.activeCompanyId, session?.user?.companyRole);
    await rbacService.ensurePermission(ctx.userId, ctx.companyId, "intelligence.read");

    const { id } = await parseJsonBody<{ id: string }>(request);

    await prisma.insightEvent.update({
      where: { id, companyId: ctx.companyId },
      data: { isRead: true },
    });

    return NextResponse.json({ success: true }, { headers: { ...noCacheHeaders() } });
  } catch (error) {
    return handleRouteError(error, request);
  }
}
