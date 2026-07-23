import { NextResponse } from "next/server";
import { auth } from "@/server/auth/auth";
import { requireTenantContext } from "@/server/context/tenant-context";
import { cacheHeaders, handleRouteError, parseJsonBody } from "@/server/http/handle-route";
import { StatementReadinessService } from "@/modules/controller-specialist/statement-readiness";
import type { StatementType } from "@/modules/controller-specialist/types";

const VALID_STATEMENT_TYPES: StatementType[] = [
  "balance_sheet",
  "income_statement",
  "cash_flow",
  "trial_balance",
  "general_ledger",
  "aged_receivables",
  "aged_payables",
  "equity_statement",
  "budget_vs_actual",
  "department_reports",
];

export async function GET(
  req: Request,
  { params }: { params: Promise<{ type: string }> },
) {
  try {
    const session = await auth();
    const ctx = requireTenantContext(session?.user?.id, session?.user?.activeCompanyId, session?.user?.companyRole);
    const { type } = await params;

    const { searchParams } = new URL(req.url);
    const period = searchParams.get("period");

    if (!period) {
      return NextResponse.json(
        { error: { code: "VALIDATION", message: "period query parameter is required" } },
        { status: 400 },
      );
    }

    if (!VALID_STATEMENT_TYPES.includes(type as StatementType)) {
      return NextResponse.json(
        { error: { code: "VALIDATION", message: `Invalid statement type: ${type}. Valid types: ${VALID_STATEMENT_TYPES.join(", ")}` } },
        { status: 400 },
      );
    }

    const result = await StatementReadinessService.evaluateReadiness(ctx, period, type as StatementType);
    return NextResponse.json(result, { headers: cacheHeaders(30) });
  } catch (err) {
    return handleRouteError(err, req);
  }
}

export async function PUT(
  req: Request,
  { params }: { params: Promise<{ type: string }> },
) {
  try {
    const session = await auth();
    const ctx = requireTenantContext(session?.user?.id, session?.user?.activeCompanyId, session?.user?.companyRole);
    const { type } = await params;

    const { searchParams } = new URL(req.url);
    const period = searchParams.get("period");

    if (!period) {
      return NextResponse.json(
        { error: { code: "VALIDATION", message: "period query parameter is required" } },
        { status: 400 },
      );
    }

    if (!VALID_STATEMENT_TYPES.includes(type as StatementType)) {
      return NextResponse.json(
        { error: { code: "VALIDATION", message: `Invalid statement type: ${type}` } },
        { status: 400 },
      );
    }

    const body = await parseJsonBody<{
      status?: "NOT_READY" | "PARTIAL" | "READY" | "GENERATED";
      metadata?: Record<string, unknown>;
    }>(req);

    const result = await StatementReadinessService.updateReadiness(ctx, period, type as StatementType, body);
    return NextResponse.json(result);
  } catch (err) {
    return handleRouteError(err, req);
  }
}
