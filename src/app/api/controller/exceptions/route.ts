import { NextResponse } from "next/server";
import { auth } from "@/server/auth/auth";
import { requireTenantContext } from "@/server/context/tenant-context";
import { cacheHeaders, handleRouteError, parseJsonBody } from "@/server/http/handle-route";
import { AccountingHealthService } from "@/modules/controller-specialist/accounting-health";
import type { AccountingExceptionType, RiskLevel } from "@/modules/controller-specialist/types";
import { Prisma } from "@prisma/client";

export async function GET(req: Request) {
  try {
    const session = await auth();
    const ctx = requireTenantContext(session?.user?.id, session?.user?.activeCompanyId, session?.user?.companyRole);

    const { searchParams } = new URL(req.url);
    const exceptionType = searchParams.get("exceptionType") as AccountingExceptionType | null;
    const severity = searchParams.get("severity") as RiskLevel | null;
    const status = searchParams.get("status");
    const limit = searchParams.get("limit") ? parseInt(searchParams.get("limit")!, 10) : undefined;
    const offset = searchParams.get("offset") ? parseInt(searchParams.get("offset")!, 10) : undefined;

    const result = await AccountingHealthService.getAccountingExceptions(ctx, {
      exceptionType: exceptionType ?? undefined,
      severity: severity ?? undefined,
      status: status ?? undefined,
      limit,
      offset,
    });

    return NextResponse.json(result, { headers: cacheHeaders(30) });
  } catch (err) {
    return handleRouteError(err, req);
  }
}

export async function POST(req: Request) {
  try {
    const session = await auth();
    const ctx = requireTenantContext(session?.user?.id, session?.user?.activeCompanyId, session?.user?.companyRole);

    const body = await parseJsonBody<{
      exceptionType: AccountingExceptionType;
      severity?: RiskLevel;
      sourceSystem?: string;
      referenceId?: string;
      referenceType?: string;
      description: string;
      amount?: number;
      currency?: string;
      assignedTo?: string;
      evidence?: string[];
      metadata?: Record<string, unknown>;
    }>(req);

    const input = {
      ...body,
      amount: body.amount !== undefined ? new Prisma.Decimal(body.amount) : undefined,
    };

    const exception = await AccountingHealthService.createAccountingException(ctx, input);
    return NextResponse.json(exception, { status: 201 });
  } catch (err) {
    return handleRouteError(err, req);
  }
}
