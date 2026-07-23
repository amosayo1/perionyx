import { NextRequest, NextResponse } from "next/server";
import { ReconciliationSpecialist } from "@/modules/reconciliation";
import { cacheHeaders, handleRouteError } from "@/server/http/handle-route";
import { requireTenantContext } from "@/server/context/tenant-context";
import { auth } from "@/server/auth/auth";
import { escalateCaseSchema } from "@/lib/validations/reconciliation";
import { prisma } from "@/server/db/prisma";

export async function GET(request: NextRequest) {
  try {
    const session = await auth();
    const ctx = requireTenantContext(session?.user?.id, session?.user?.activeCompanyId, session?.user?.companyRole);
    const { searchParams } = new URL(request.url);
    const caseId = searchParams.get("caseId");
    const where: Record<string, unknown> = { companyId: ctx.companyId };
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
}

export async function POST(request: NextRequest) {
  try {
    const session = await auth();
    const ctx = requireTenantContext(session?.user?.id, session?.user?.activeCompanyId, session?.user?.companyRole);
    const body = await request.json();
    const input = escalateCaseSchema.parse(body);

    const escalation = await ReconciliationSpecialist.recommendEscalation(
      ctx,
      input.caseId,
      input.reason,
      input.severity
    );

    return NextResponse.json(escalation, { status: 201 });
  } catch (error) {
    return handleRouteError(error);
  }
}
