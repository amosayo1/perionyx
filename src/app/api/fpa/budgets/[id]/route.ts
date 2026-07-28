import { NextResponse } from "next/server";
import { BudgetService } from "@/modules/fpa-specialist";
import { handleRouteError, cacheHeaders } from "@/server/http/handle-route";
import { withRuntimeContext } from "@/server/http/init-runtime-context";

export async function GET(
  req: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  return withRuntimeContext(req, async (ctx) => {
    try {
      const { id } = await params;
  
      const [versions, variance] = await Promise.all([
        BudgetService.getBudgetVersions(ctx.tenant, id),
        BudgetService.getBudgetVariance(ctx.tenant, id),
      ]);
  
      return NextResponse.json({ budgetId: id, versions, variance }, { headers: cacheHeaders(30) });
    } catch (err) {
      return handleRouteError(err, req);
    }
  });
}

export async function PUT(
  req: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  return withRuntimeContext(req, async (ctx) => {
    try {
      const { id } = await params;
  
      const body = await req.json();
      const result = await BudgetService.lockBudget(ctx.tenant, id);
      return NextResponse.json(result);
    } catch (err) {
      return handleRouteError(err, req);
    }
  });
}
