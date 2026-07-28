import { NextRequest, NextResponse } from "next/server";
import { MatchingEngine } from "@/modules/reconciliation";
import { cacheHeaders, handleRouteError } from "@/server/http/handle-route";
import { Prisma } from "@prisma/client";
import { z } from "zod";
import { withRuntimeContext } from "@/server/http/init-runtime-context";

const runMatchingSchema = z.object({
  caseId: z.string().cuid(),
  ruleId: z.string().cuid().optional(),
  executionType: z.enum(["auto", "manual", "batch"]).default("manual"),
  sourceTransactions: z.array(z.object({
    id: z.string(),
    sourceSystem: z.string(),
    transactionDate: z.string().datetime(),
    amount: z.number(),
    currency: z.string().default("USD"),
    reference: z.string().optional(),
    vendorName: z.string().optional(),
    customerName: z.string().optional(),
    description: z.string().optional(),
  })),
  targetTransactions: z.array(z.object({
    id: z.string(),
    sourceSystem: z.string(),
    transactionDate: z.string().datetime(),
    amount: z.number(),
    currency: z.string().default("USD"),
    reference: z.string().optional(),
    vendorName: z.string().optional(),
    customerName: z.string().optional(),
    description: z.string().optional(),
  })),
});

export async function POST(request: NextRequest) {
  return withRuntimeContext(request, async (ctx) => {
    try {
      const body = await request.json();
      const input = runMatchingSchema.parse(body);
  
      const result = await MatchingEngine.runMatching(
        ctx.tenant,
        input.caseId,
        input.ruleId ?? null,
        input.executionType,
        input.sourceTransactions.map((t) => ({
          ...t,
          transactionDate: new Date(t.transactionDate),
          amount: t.amount as unknown as Prisma.Decimal,
        })),
        input.targetTransactions.map((t) => ({
          ...t,
          transactionDate: new Date(t.transactionDate),
          amount: t.amount as unknown as Prisma.Decimal,
        }))
      );
  
      return NextResponse.json(result);
    } catch (error) {
      return handleRouteError(error);
    }
  });
}
