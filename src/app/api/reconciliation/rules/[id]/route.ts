import { NextRequest, NextResponse } from "next/server";
import { cacheHeaders, handleRouteError } from "@/server/http/handle-route";
import { updateRuleSchema } from "@/lib/validations/reconciliation";
import { prisma } from "@/server/db/prisma";
import { Prisma } from "@prisma/client";
import { withRuntimeContext } from "@/server/http/init-runtime-context";

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  return withRuntimeContext(_request, async (ctx) => {
    try {
      const { id } = await params;
  
      const rule = await prisma.matchingRule.findFirst({
        where: { id, companyId: ctx.tenant.companyId },
        include: { versions: { orderBy: { version: "desc" } } },
      });
  
      if (!rule) {
        return NextResponse.json({ error: "Rule not found" }, { status: 404 });
      }
  
      return NextResponse.json(rule);
    } catch (error) {
      return handleRouteError(error);
    }
  });
}

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  return withRuntimeContext(request, async (ctx) => {
    try {
      const { id } = await params;
      const body = await request.json();
      const input = updateRuleSchema.parse(body);
  
      const rule = await prisma.matchingRule.update({
        where: { id },
        data: {
          ...input,
          matchingCriteria: input.matchingCriteria as unknown as Prisma.InputJsonValue,
          scoringWeights: input.scoringWeights as unknown as Prisma.InputJsonValue,
        },
      });
  
      // Create version record
      await prisma.ruleVersion.create({
        data: {
          companyId: ctx.tenant.companyId,
          ruleId: id,
          version: rule.version,
          matchingCriteria: rule.matchingCriteria as unknown as Prisma.InputJsonValue,
          scoringWeights: rule.scoringWeights as unknown as Prisma.InputJsonValue,
          changeNote: "Rule updated",
          changedBy: ctx.tenant.userId,
          isActive: rule.isActive,
        },
      });
  
      return NextResponse.json(rule);
    } catch (error) {
      return handleRouteError(error);
    }
  });
}
