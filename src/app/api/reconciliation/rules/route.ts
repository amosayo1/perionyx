import { NextRequest, NextResponse } from "next/server";
import { cacheHeaders, handleRouteError } from "@/server/http/handle-route";
import { requireTenantContext } from "@/server/context/tenant-context";
import { auth } from "@/server/auth/auth";
import { createRuleSchema } from "@/lib/validations/reconciliation";
import { prisma } from "@/server/db/prisma";
import { Prisma } from "@prisma/client";

export async function GET() {
  try {
    const session = await auth();
    const ctx = requireTenantContext(session?.user?.id, session?.user?.activeCompanyId, session?.user?.companyRole);

    const rules = await prisma.matchingRule.findMany({
      where: { companyId: ctx.companyId },
      orderBy: { priority: "desc" },
    });

    return NextResponse.json(rules);
  } catch (error) {
    return handleRouteError(error);
  }
}

export async function POST(request: NextRequest) {
  try {
    const session = await auth();
    const ctx = requireTenantContext(session?.user?.id, session?.user?.activeCompanyId, session?.user?.companyRole);
    const body = await request.json();
    const input = createRuleSchema.parse(body);

    const rule = await prisma.matchingRule.create({
      data: {
        companyId: ctx.companyId,
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
}
