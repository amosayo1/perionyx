import { NextRequest, NextResponse } from "next/server";
import { cacheHeaders, handleRouteError } from "@/server/http/handle-route";
import { createRuleSchema } from "@/lib/validations/reconciliation";
import { prisma } from "@/server/db/prisma";
import { Prisma } from "@prisma/client";
import { withRuntimeContext } from "@/server/http/init-runtime-context";

export async function GET() {
  return withRuntimeContext(new Headers(), async (ctx) => {
    try {
  
      const rules = await prisma.matchingRule.findMany({
        where: { companyId: ctx.tenant.companyId },
        orderBy: { priority: "desc" },
      });
  
      return NextResponse.json(rules);
    } catch (error) {
      return handleRouteError(error);
    }
  });
}

export async function POST(request: NextRequest) {
  return withRuntimeContext(request, async (ctx) => {
    try {
      const body = await request.json();
      const input = createRuleSchema.parse(body);
  
      const rule = await prisma.matchingRule.create({
        data: {
          companyId: ctx.tenant.companyId,
          name: input.name,
          description: input.description ?? "",
          ruleType: input.ruleType,
          priority: input.priority,
          matchingCriteria: input.matchingCriteria as unknown as Prisma.InputJsonValue,
          scoringWeights: input.scoringWeights as unknown as Prisma.InputJsonValue,
          maxConfidenceThreshold: input.maxConfidenceThreshold,
          autoMatchEnabled: input.autoMatchEnabled,
        },
      });
  
      return NextResponse.json(rule, { status: 201 });
    } catch (error) {
      return handleRouteError(error);
    }
  });
}
