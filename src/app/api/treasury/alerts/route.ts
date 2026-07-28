import { NextResponse } from "next/server";
import { cacheHeaders, handleRouteError } from "@/server/http/handle-route";
import { prisma } from "@/server/db/prisma";
import type { AlertType, AlertSeverity, AlertStatus } from "@/modules/treasury-specialist/types";
import { withRuntimeContext } from "@/server/http/init-runtime-context";

export async function GET(req: Request) {
  return withRuntimeContext(req, async (ctx) => {
    try {
  
      const { searchParams } = new URL(req.url);
      const alertType = searchParams.get("alertType") as AlertType | null;
      const severity = searchParams.get("severity") as AlertSeverity | null;
      const status = searchParams.get("status") as AlertStatus | null;
  
      const where: Record<string, unknown> = { companyId: ctx.tenant.companyId };
  
      if (alertType) {
        where.alertType = alertType;
      }
  
      if (severity) {
        where.severity = severity;
      }
  
      if (status) {
        where.status = status;
      }
  
      const alerts = await prisma.treasurySpecialistAlert.findMany({
        where: where as never,
        orderBy: [{ severity: "desc" }, { createdAt: "desc" }],
        take: 100,
      });
  
      return NextResponse.json(alerts, { headers: cacheHeaders(30) });
    } catch (err) {
      return handleRouteError(err, req);
    }
  });
}
