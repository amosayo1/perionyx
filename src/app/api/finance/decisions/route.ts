import { NextResponse } from "next/server";
import { auth } from "@/server/auth/auth";
import { requireTenantContext } from "@/server/context/tenant-context";
import { cacheHeaders, handleRouteError } from "@/server/http/handle-route";
import { FinanceCollaborationService } from "@/modules/finance-collaboration";
import { getDecisionsSchema, createDecisionSchema } from "@/lib/validations/finance-collaboration";
import { zodErrorResponse, parseJsonBody } from "@/server/http/handle-route";

export async function GET(req: Request) {
  try {
    const session = await auth();
    const ctx = requireTenantContext(session?.user?.id, session?.user?.activeCompanyId, session?.user?.companyRole);

    const { searchParams } = new URL(req.url);
    const params = Object.fromEntries(searchParams.entries());

    const parsed = getDecisionsSchema.safeParse(params);
    if (!parsed.success) {
      return zodErrorResponse(parsed.error, req);
    }

    const data = await FinanceCollaborationService.getDecisionCenter(ctx, parsed.data);
    return NextResponse.json(data, { headers: cacheHeaders(15) });
  } catch (err) {
    return handleRouteError(err, req);
  }
}

export async function POST(req: Request) {
  try {
    const session = await auth();
    const ctx = requireTenantContext(session?.user?.id, session?.user?.activeCompanyId, session?.user?.companyRole);

    const body = await parseJsonBody<unknown>(req);
    const parsed = createDecisionSchema.safeParse(body);
    if (!parsed.success) {
      return zodErrorResponse(parsed.error, req);
    }

    const { DecisionRegistry } = await import("@/modules/finance-collaboration");
    const data = await DecisionRegistry.createDecision(ctx, {
      title: parsed.data.title,
      description: parsed.data.description,
      decisionType: parsed.data.decisionType,
      decidedBy: parsed.data.decidedBy,
      context: {
        decidedByType: parsed.data.decidedByType,
        approvalRequired: parsed.data.approvalRequired,
        alternatives: parsed.data.alternatives,
        businessImpact: parsed.data.businessImpact,
        financialImpact: parsed.data.financialImpact,
        affectedSpecialists: parsed.data.affectedSpecialists,
        caseId: parsed.data.caseId,
      },
    });
    return NextResponse.json(data, { status: 201 });
  } catch (err) {
    return handleRouteError(err, req);
  }
}
