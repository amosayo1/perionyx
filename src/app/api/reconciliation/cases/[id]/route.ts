import { NextRequest, NextResponse } from "next/server";
import { ReconciliationSpecialist } from "@/modules/reconciliation";
import { cacheHeaders, handleRouteError } from "@/server/http/handle-route";
import { withRuntimeContext } from "@/server/http/init-runtime-context";

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  return withRuntimeContext(_request, async (ctx) => {
    try {
      const { id } = await params;
      const caseData = await ReconciliationSpecialist.getCase(ctx.tenant, id);
  
      if (!caseData) {
        return NextResponse.json({ error: "Case not found" }, { status: 404 });
      }
  
      return NextResponse.json(caseData, { headers: cacheHeaders(15) });
    } catch (error) {
      return handleRouteError(error);
    }
  });
}
