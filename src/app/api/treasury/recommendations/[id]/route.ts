import { NextResponse } from "next/server";
import { handleRouteError, parseJsonBody } from "@/server/http/handle-route";
import { TreasurySpecialistService } from "@/modules/treasury-specialist/treasury-specialist";
import type { UpdateRecommendationInput } from "@/modules/treasury-specialist/types";
import { withRuntimeContext } from "@/server/http/init-runtime-context";

export async function GET(
  req: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  return withRuntimeContext(req, async (ctx) => {
    try {
      const { id } = await params;
  
      const result = await TreasurySpecialistService.getRecommendations(ctx.tenant, {});
      const recommendation = result.recommendations.find((r) => r.id === id);
  
      if (!recommendation) {
        return NextResponse.json(
          { error: { code: "NOT_FOUND", message: `Recommendation ${id} not found` } },
          { status: 404 },
        );
      }
  
      return NextResponse.json(recommendation);
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
  
      const body = await parseJsonBody<UpdateRecommendationInput>(req);
  
      const recommendation = await TreasurySpecialistService.updateRecommendation(ctx.tenant, id, body);
      return NextResponse.json(recommendation);
    } catch (err) {
      return handleRouteError(err, req);
    }
  });
}
