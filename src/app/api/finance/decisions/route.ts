import { NextResponse } from "next/server";
import { cacheHeaders, handleRouteError } from "@/server/http/handle-route";
import { FinanceCollaborationService } from "@/modules/finance-collaboration";
import { getDecisionsSchema, createDecisionSchema } from "@/lib/validations/finance-collaboration";
import { zodErrorResponse, parseJsonBody } from "@/server/http/handle-route";
import { withRuntimeContext } from "@/server/http/init-runtime-context";

export async function GET(req: Request) {
  return withRuntimeContext(req, async (ctx) => {
    try {
  
      const { searchParams } = new URL(req.url);
      const params = Object.fromEntries(searchParams.entries());
  
      const parsed = getDecisionsSchema.safeParse(params);
      if (!parsed.success) {
        return zodErrorResponse(parsed.error, req);
      }
  
      const data = await FinanceCollaborationService.getDecisionCenter(ctx.tenant, parsed.data);
      return NextResponse.json(data, { headers: cacheHeaders(15) });
    } catch (err) {
      return handleRouteError(err, req);
    }
  });
}

export async function POST(req: Request) {
  return withRuntimeContext(req, async (ctx) => {
    try {
  
      const body = await parseJsonBody<unknown>(req);
      const parsed = createDecisionSchema.safeParse(body);
      if (!parsed.success) {
        return zodErrorResponse(parsed.error, req);
      }
  
      const { DecisionRegistry } = await import("@/modules/finance-collaboration");
      const data = await DecisionRegistry.createDecision(ctx.tenant, {
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
  });
}
