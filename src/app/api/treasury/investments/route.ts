import { NextResponse } from "next/server";
import { cacheHeaders, handleRouteError } from "@/server/http/handle-route";
import { TreasurySpecialistService } from "@/modules/treasury-specialist/treasury-specialist";
import { withRuntimeContext } from "@/server/http/init-runtime-context";

export async function GET(req: Request) {
  return withRuntimeContext(req, async (ctx) => {
    try {
  
      const { searchParams } = new URL(req.url);
      const instrumentType = searchParams.get("instrumentType");
      const liquidityClassification = searchParams.get("liquidityClassification");
      const includeRecommendations = searchParams.get("includeRecommendations") === "true";
  
      const result = await TreasurySpecialistService.getInvestmentPortfolio(ctx.tenant);
      return NextResponse.json(result, { headers: cacheHeaders(30) });
    } catch (err) {
      return handleRouteError(err, req);
    }
  });
}
