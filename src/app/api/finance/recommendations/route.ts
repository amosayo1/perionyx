import { NextResponse } from "next/server";
import { cacheHeaders, handleRouteError } from "@/server/http/handle-route";
import { FinanceCollaborationService } from "@/modules/finance-collaboration";
import { prisma } from "@/server/db/prisma";
import { getRecommendationsSchema, createSharedRecommendationSchema } from "@/lib/validations/finance-collaboration";
import { zodErrorResponse, parseJsonBody } from "@/server/http/handle-route";
import { withRuntimeContext } from "@/server/http/init-runtime-context";

export async function GET(req: Request) {
  return withRuntimeContext(req, async (ctx) => {
    try {
  
      const { searchParams } = new URL(req.url);
      const params = Object.fromEntries(searchParams.entries());
  
      const parsed = getRecommendationsSchema.safeParse(params);
      if (!parsed.success) {
        return zodErrorResponse(parsed.error, req);
      }
  
      const data = await FinanceCollaborationService.getRecommendationCenter(ctx.tenant);
      return NextResponse.json(data, { headers: cacheHeaders(30) });
    } catch (err) {
      return handleRouteError(err, req);
    }
  });
}

export async function POST(req: Request) {
  return withRuntimeContext(req, async (ctx) => {
    try {
  
      const body = await parseJsonBody<unknown>(req);
      const parsed = createSharedRecommendationSchema.safeParse(body);
      if (!parsed.success) {
        return zodErrorResponse(parsed.error, req);
      }
  
      const data = await prisma.sharedRecommendation.create({
        data: {
          companyId: ctx.tenant.companyId,
          title: parsed.data.title,
          description: parsed.data.description,
          category: parsed.data.category,
          status: "proposed",
          riskLevel: parsed.data.riskLevel,
          businessReason: parsed.data.businessReason,
          primarySpecialist: parsed.data.primarySpecialist,
          confidence: parsed.data.confidence,
          contributors: parsed.data.contributors ?? [],
          affectedModules: parsed.data.affectedModules ?? [],
          requiredApprovals: parsed.data.requiredApprovals ?? [],
          caseId: parsed.data.caseId,
        },
      });
  
      return NextResponse.json(data, { status: 201 });
    } catch (err) {
      return handleRouteError(err, req);
    }
  });
}
