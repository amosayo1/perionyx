import { NextRequest, NextResponse } from "next/server";
import { ReconciliationSpecialist } from "@/modules/reconciliation";
import { cacheHeaders, handleRouteError } from "@/server/http/handle-route";
import { escalateCaseSchema } from "@/lib/validations/reconciliation";
import { prisma } from "@/server/db/prisma";
import { withRuntimeContext } from "@/server/http/init-runtime-context";

export async function GET(request: NextRequest) {
  return withRuntimeContext(request, async (ctx) => {
    try {
      const { searchParams } = new URL(request.url);
      const caseId = searchParams.get("caseId");
      const where: Record<string, unknown> = { companyId: ctx.tenant.companyId };
      if (caseId) where.caseId = caseId;
  
      const escalations = await prisma.reconciliationEscalation.findMany({
        where,
        orderBy: { createdAt: "desc" },
        take: 50,
      });
  
      return NextResponse.json(escalations);
    } catch (error) {
      return handleRouteError(error);
    }
  });
}

export async function POST(request: NextRequest) {
  return withRuntimeContext(request, async (ctx) => {
    try {
      const body = await request.json();
      const input = escalateCaseSchema.parse(body);
  
      const escalation = await ReconciliationSpecialist.recommendEscalation(
        ctx.tenant,
        input.caseId,
        input.reason,
        input.severity
      );
  
      return NextResponse.json(escalation, { status: 201 });
    } catch (error) {
      return handleRouteError(error);
    }
  });
}
