import { NextResponse } from "next/server";
import { cacheHeaders, handleRouteError } from "@/server/http/handle-route";
import { TreasurySpecialistService } from "@/modules/treasury-specialist/treasury-specialist";
import type { TreasuryRiskType, RiskLevel } from "@/modules/treasury-specialist/types";
import { withRuntimeContext } from "@/server/http/init-runtime-context";

export async function GET(req: Request) {
  return withRuntimeContext(req, async (ctx) => {
    try {
  
      const { searchParams } = new URL(req.url);
      const riskType = searchParams.get("riskType") as TreasuryRiskType | null;
      const riskLevel = searchParams.get("riskLevel") as RiskLevel | null;
      const status = searchParams.get("status");
      const includeTrends = searchParams.get("includeTrends") === "true";
      const includeHeatmap = searchParams.get("includeHeatmap") === "true";
  
      const result = await TreasurySpecialistService.getRiskCenter(ctx.tenant);
      return NextResponse.json(result, { headers: cacheHeaders(30) });
    } catch (err) {
      return handleRouteError(err, req);
    }
  });
}
