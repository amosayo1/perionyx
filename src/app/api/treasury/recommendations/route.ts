import { NextResponse } from "next/server";
import { cacheHeaders, handleRouteError, parseJsonBody } from "@/server/http/handle-route";
import { TreasurySpecialistService } from "@/modules/treasury-specialist/treasury-specialist";
import type {
  RecommendationCategory,
  RecommendationStatus,
  RecommendationPriority,
  RiskLevel,
  CreateRecommendationInput,
} from "@/modules/treasury-specialist/types";
import { withRuntimeContext } from "@/server/http/init-runtime-context";

export async function GET(req: Request) {
  return withRuntimeContext(req, async (ctx) => {
    try {
  
      const { searchParams } = new URL(req.url);
      const category = searchParams.get("category") as RecommendationCategory | null;
      const status = searchParams.get("status") as RecommendationStatus | null;
      const priority = searchParams.get("priority") as RecommendationPriority | null;
      const riskLevel = searchParams.get("riskLevel") as RiskLevel | null;
  
      const result = await TreasurySpecialistService.getRecommendations(ctx.tenant, {
        category: category ?? undefined,
        status: status ?? undefined,
        priority: priority ?? undefined,
        riskLevel: riskLevel ?? undefined,
      });
  
      return NextResponse.json(result, { headers: cacheHeaders(30) });
    } catch (err) {
      return handleRouteError(err, req);
    }
  });
}

export async function POST(req: Request) {
  return withRuntimeContext(req, async (ctx) => {
    try {
  
      const body = await parseJsonBody<CreateRecommendationInput>(req);
  
      const recommendation = await TreasurySpecialistService.createRecommendation(ctx.tenant, body);
      return NextResponse.json(recommendation, { status: 201 });
    } catch (err) {
      return handleRouteError(err, req);
    }
  });
}
