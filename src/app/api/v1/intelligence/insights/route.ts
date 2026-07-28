import { NextResponse } from "next/server";
import { handleRouteError, parseJsonBody, noCacheHeaders } from "@/server/http/handle-route";
import { rbacService } from "@/modules/rbac/rbac.service";
import { prisma } from "@/server/db/prisma";
import { withRuntimeContext } from "@/server/http/init-runtime-context";

export async function GET() {
  return withRuntimeContext(new Headers(), async (ctx) => {
    try {
      await rbacService.ensurePermission(ctx.tenant.userId, ctx.tenant.companyId, "intelligence.read");
  
      const items = await prisma.insightEvent.findMany({
        where: { companyId: ctx.tenant.companyId },
        orderBy: { createdAt: "desc" },
        take: 100,
      });
  
      return NextResponse.json({ items });
    } catch (error) {
      return handleRouteError(error);
    }
  });
}

export async function PUT(request: Request) {
  return withRuntimeContext(request, async (ctx) => {
    try {
      await rbacService.ensurePermission(ctx.tenant.userId, ctx.tenant.companyId, "intelligence.read");
  
      const { id } = await parseJsonBody<{ id: string }>(request);
  
      await prisma.insightEvent.update({
        where: { id, companyId: ctx.tenant.companyId },
        data: { isRead: true },
      });
  
      return NextResponse.json({ success: true }, { headers: { ...noCacheHeaders() } });
    } catch (error) {
      return handleRouteError(error, request);
    }
  });
}
