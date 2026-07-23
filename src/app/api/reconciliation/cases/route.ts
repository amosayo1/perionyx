import { NextRequest, NextResponse } from "next/server";
import { ReconciliationSpecialist } from "@/modules/reconciliation";
import { cacheHeaders, handleRouteError } from "@/server/http/handle-route";
import { requireTenantContext } from "@/server/context/tenant-context";
import { auth } from "@/server/auth/auth";
import { createCaseSchema, caseQuerySchema } from "@/lib/validations/reconciliation";

export async function GET(request: NextRequest) {
  try {
    const session = await auth();
    const ctx = requireTenantContext(session?.user?.id, session?.user?.activeCompanyId, session?.user?.companyRole);
    const { searchParams } = new URL(request.url);

    const query = caseQuerySchema.parse({
      status: searchParams.get("status") ?? undefined,
      reconciliationType: searchParams.get("reconciliationType") ?? undefined,
      period: searchParams.get("period") ?? undefined,
      assignedTo: searchParams.get("assignedTo") ?? undefined,
      search: searchParams.get("search") ?? undefined,
      page: searchParams.get("page") ? Number(searchParams.get("page")) : 1,
      limit: searchParams.get("limit") ? Number(searchParams.get("limit")) : 20,
    });

    const result = await ReconciliationSpecialist.listCases(ctx, query);
    return NextResponse.json(result, { headers: cacheHeaders(15) });
  } catch (error) {
    return handleRouteError(error);
  }
}

export async function POST(request: NextRequest) {
  try {
    const session = await auth();
    const ctx = requireTenantContext(session?.user?.id, session?.user?.activeCompanyId, session?.user?.companyRole);
    const body = await request.json();
    const input = createCaseSchema.parse(body);

    const caseData = await ReconciliationSpecialist.createCase(ctx, {
      title: input.title,
      reconciliationType: input.reconciliationType,
      period: input.period,
      entityName: input.entityName,
      currency: input.currency,
      assignedTo: input.assignedTo,
      dueDate: input.dueDate ? new Date(input.dueDate) : undefined,
    });

    return NextResponse.json(caseData, { status: 201 });
  } catch (error) {
    return handleRouteError(error);
  }
}
