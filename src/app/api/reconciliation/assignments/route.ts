import { NextRequest, NextResponse } from "next/server";
import { cacheHeaders, handleRouteError } from "@/server/http/handle-route";
import { assignCaseSchema } from "@/lib/validations/reconciliation";
import { prisma } from "@/server/db/prisma";
import { withRuntimeContext } from "@/server/http/init-runtime-context";

export async function GET(request: NextRequest) {
  return withRuntimeContext(request, async (ctx) => {
    try {
      const { searchParams } = new URL(request.url);
      const caseId = searchParams.get("caseId");
  
      const where: Record<string, unknown> = { companyId: ctx.tenant.companyId };
      if (caseId) where.caseId = caseId;
  
      const assignments = await prisma.reconciliationAssignment.findMany({
        where,
        orderBy: { createdAt: "desc" },
        take: 50,
      });
  
      return NextResponse.json(assignments);
    } catch (error) {
      return handleRouteError(error);
    }
  });
}

export async function POST(request: NextRequest) {
  return withRuntimeContext(request, async (ctx) => {
    try {
      const body = await request.json();
      const input = assignCaseSchema.parse(body);
  
      const assignment = await prisma.reconciliationAssignment.create({
        data: {
          companyId: ctx.tenant.companyId,
          caseId: input.caseId,
          assignedTo: input.assignedTo,
          assignedBy: ctx.tenant.userId,
          role: input.role,
          notes: input.notes ?? "",
        },
      });
  
      return NextResponse.json(assignment, { status: 201 });
    } catch (error) {
      return handleRouteError(error);
    }
  });
}
