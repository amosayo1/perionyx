import { NextRequest, NextResponse } from "next/server";
import { cacheHeaders, handleRouteError } from "@/server/http/handle-route";
import { requireTenantContext } from "@/server/context/tenant-context";
import { auth } from "@/server/auth/auth";
import { updateRuleSchema } from "@/lib/validations/reconciliation";
import { prisma } from "@/server/db/prisma";
import { Prisma } from "@prisma/client";

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await auth();
    const ctx = requireTenantContext(session?.user?.id, session?.user?.activeCompanyId, session?.user?.companyRole);
    const { id } = await params;

    const rule = await prisma.matchingRule.findFirst({
      where: { id, companyId: ctx.companyId },
      include: { versions: { orderBy: { version: "desc" } } },
    });

    if (!rule) {
      return NextResponse.json({ error: "Rule not found" }, { status: 404 });
    }

    return NextResponse.json(rule);
  } catch (error) {
    return handleRouteError(error);
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await auth();
    const ctx = requireTenantContext(session?.user?.id, session?.user?.activeCompanyId, session?.user?.companyRole);
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
        companyId: ctx.companyId,
        ruleId: id,
        version: rule.version,
        matchingCriteria: rule.matchingCriteria as unknown as Prisma.InputJsonValue,
        scoringWeights: rule.scoringWeights as unknown as Prisma.InputJsonValue,
        changeNote: "Rule updated",
        changedBy: ctx.userId,
        isActive: rule.isActive,
      },
    });

    return NextResponse.json(rule);
  } catch (error) {
    return handleRouteError(error);
  }
}
