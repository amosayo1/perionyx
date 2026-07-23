import { NextResponse } from "next/server";
import { auth } from "@/server/auth/auth";
import { requireTenantContext } from "@/server/context/tenant-context";
import { BudgetService } from "@/modules/fpa-specialist";
import { handleRouteError, cacheHeaders } from "@/server/http/handle-route";

export async function GET(
  req: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const session = await auth();
    const ctx = requireTenantContext(session?.user?.id, session?.user?.activeCompanyId, session?.user?.companyRole);
    const { id } = await params;

    const [versions, variance] = await Promise.all([
      BudgetService.getBudgetVersions(ctx, id),
      BudgetService.getBudgetVariance(ctx, id),
    ]);

    return NextResponse.json({ budgetId: id, versions, variance }, { headers: cacheHeaders(30) });
  } catch (err) {
    return handleRouteError(err, req);
  }
}

export async function PUT(
  req: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const session = await auth();
    const ctx = requireTenantContext(session?.user?.id, session?.user?.activeCompanyId, session?.user?.companyRole);
    const { id } = await params;

    const body = await req.json();
    const result = await BudgetService.lockBudget(ctx, id);
    return NextResponse.json(result);
  } catch (err) {
    return handleRouteError(err, req);
  }
}
