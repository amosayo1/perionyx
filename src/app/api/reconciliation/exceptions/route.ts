import { NextRequest, NextResponse } from "next/server";
import { ExceptionEngine } from "@/modules/reconciliation";
import { cacheHeaders, handleRouteError } from "@/server/http/handle-route";
import { createExceptionSchema, exceptionQuerySchema } from "@/lib/validations/reconciliation";
import { prisma } from "@/server/db/prisma";
import { Prisma } from "@prisma/client";
import { withRuntimeContext } from "@/server/http/init-runtime-context";

export async function GET(request: NextRequest) {
  return withRuntimeContext(request, async (ctx) => {
    try {
      const { searchParams } = new URL(request.url);
  
      const query = exceptionQuerySchema.parse({
        caseId: searchParams.get("caseId") ?? undefined,
        exceptionType: searchParams.get("exceptionType") ?? undefined,
        severity: searchParams.get("severity") ?? undefined,
        status: searchParams.get("status") ?? undefined,
        assignedTo: searchParams.get("assignedTo") ?? undefined,
        search: searchParams.get("search") ?? undefined,
        page: searchParams.get("page") ? Number(searchParams.get("page")) : 1,
        limit: searchParams.get("limit") ? Number(searchParams.get("limit")) : 20,
      });
  
      const page = query.page;
      const limit = query.limit;
      const skip = (page - 1) * limit;
  
      const where: Record<string, unknown> = { companyId: ctx.tenant.companyId };
      if (query.caseId) where.caseId = query.caseId;
      if (query.exceptionType) where.exceptionType = query.exceptionType;
      if (query.severity) where.severity = query.severity;
      if (query.status) where.status = query.status;
      if (query.assignedTo) where.assignedTo = query.assignedTo;
      if (query.search) {
        where.OR = [
          { description: { contains: query.search, mode: "insensitive" } },
          { referenceNumber: { contains: query.search, mode: "insensitive" } },
        ];
      }
  
      const [exceptions, total] = await Promise.all([
        prisma.reconException.findMany({
          where,
          skip,
          take: limit,
          orderBy: { createdAt: "desc" },
        }),
        prisma.reconException.count({ where }),
      ]);
  
      return NextResponse.json({
        exceptions,
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
      });
    } catch (error) {
      return handleRouteError(error);
    }
  });
}

export async function POST(request: NextRequest) {
  return withRuntimeContext(request, async (ctx) => {
    try {
      const body = await request.json();
      const input = createExceptionSchema.parse(body);
  
      const exception = await ExceptionEngine.createException(ctx.tenant, {
        caseId: input.caseId,
        exceptionType: input.exceptionType,
        severity: input.severity,
        sourceSystem: input.sourceSystem,
        referenceNumber: input.referenceNumber,
        description: input.description,
        amount: new Prisma.Decimal(input.amount),
        currency: input.currency,
        expectedAmount: input.expectedAmount ? new Prisma.Decimal(input.expectedAmount) : undefined,
        transactionDate: input.transactionDate ? new Date(input.transactionDate) : undefined,
      });
  
      return NextResponse.json(exception, { status: 201 });
    } catch (error) {
      return handleRouteError(error);
    }
  });
}
