import { NextRequest, NextResponse } from "next/server";
import { ReconciliationSpecialist } from "@/modules/reconciliation";
import { cacheHeaders, handleRouteError } from "@/server/http/handle-route";
import { suggestJournalSchema } from "@/lib/validations/reconciliation";
import { prisma } from "@/server/db/prisma";
import { Prisma } from "@prisma/client";
import { withRuntimeContext } from "@/server/http/init-runtime-context";

export async function GET(request: NextRequest) {
  return withRuntimeContext(request, async (ctx) => {
    try {
      const { searchParams } = new URL(request.url);
      const caseId = searchParams.get("caseId");
  
      const where: Record<string, unknown> = { companyId: ctx.tenant.companyId };
      if (caseId) where.caseId = caseId;
  
      const suggestions = await prisma.matchingSuggestion.findMany({
        where,
        orderBy: { confidence: "desc" },
        take: 50,
      });
  
      return NextResponse.json(suggestions);
    } catch (error) {
      return handleRouteError(error);
    }
  });
}

export async function POST(request: NextRequest) {
  return withRuntimeContext(request, async (ctx) => {
    try {
      const body = await request.json();
      const input = suggestJournalSchema.parse(body);
  
      const draft = await ReconciliationSpecialist.suggestJournal(ctx.tenant, {
        caseId: input.caseId,
        exceptionId: input.exceptionId,
        suggestionType: input.suggestionType,
        entries: input.entries.map((e) => ({
          ...e,
          debit: new Prisma.Decimal(e.debit),
          credit: new Prisma.Decimal(e.credit),
        })),
        explanation: input.explanation,
        businessReason: input.businessReason,
      });
  
      return NextResponse.json(draft, { status: 201 });
    } catch (error) {
      return handleRouteError(error);
    }
  });
}
