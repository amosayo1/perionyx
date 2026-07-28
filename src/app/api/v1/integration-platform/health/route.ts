import { NextResponse } from "next/server";
import { handleRouteError, cacheHeaders } from "@/server/http/handle-route";
import { rbacService } from "@/modules/rbac/rbac.service";
import { prisma } from "@/server/db/prisma";
import { withRuntimeContext } from "@/server/http/init-runtime-context";

export async function GET() {
  return withRuntimeContext(new Headers(), async (ctx) => {
    try {
      await rbacService.ensurePermission(ctx.tenant.userId, ctx.tenant.companyId, "integration.health");
      const instances = await prisma.integrationInstance.findMany({
        where: { companyId: ctx.tenant.companyId, isActive: true },
        include: { connectorDef: true },
      });
      const healthRecords = await prisma.integrationHealth.findMany({
        where: { companyId: ctx.tenant.companyId },
        orderBy: { checkedAt: "desc" },
        take: 100,
      });
      const total = instances.length;
      let healthy = 0, degraded = 0, unhealthy = 0, unknown = 0;
      const byCategory: Record<string, { total: number; healthy: number }> = {};
      for (const inst of instances) {
        const cat = (inst.connectorDef as any)?.category ?? "other";
        if (!byCategory[cat]) byCategory[cat] = { total: 0, healthy: 0 };
        byCategory[cat].total++;
        if (inst.healthStatus === "healthy") { healthy++; byCategory[cat].healthy++; }
        else if (inst.healthStatus === "degraded") degraded++;
        else if (inst.healthStatus === "unhealthy") unhealthy++;
        else unknown++;
      }
      return NextResponse.json({
        health: { total, healthy, degraded, unhealthy, unknown, byCategory },
        records: healthRecords.map(r => ({ id: r.id, instanceId: r.instanceId, status: r.status, responseTimeMs: r.responseTimeMs, error: r.error, diagnostics: r.diagnostics, checkedAt: r.checkedAt.toISOString() })),
      }, { headers: { ...cacheHeaders(30) } });
    } catch (error) {
      return handleRouteError(error);
    }
  });
}
