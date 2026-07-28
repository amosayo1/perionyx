import { NextResponse } from "next/server";
import { cacheHeaders, handleRouteError, parseJsonBody } from "@/server/http/handle-route";
import { RecommendationsService } from "@/modules/controller-specialist/recommendations";
import type { RecommendationCategory, RiskLevel } from "@/modules/controller-specialist/types";
import { withRuntimeContext } from "@/server/http/init-runtime-context";

export async function GET(req: Request) {
  return withRuntimeContext(req, async (ctx) => {
    try {
  
      const { searchParams } = new URL(req.url);
      const category = searchParams.get("category") as RecommendationCategory | null;
      const status = searchParams.get("status");
      const riskLevel = searchParams.get("riskLevel") as RiskLevel | null;
      const limit = searchParams.get("limit") ? parseInt(searchParams.get("limit")!, 10) : undefined;
      const offset = searchParams.get("offset") ? parseInt(searchParams.get("offset")!, 10) : undefined;
  
      const result = await RecommendationsService.getRecommendations(ctx.tenant, {
        category: category ?? undefined,
        status: status ?? undefined,
        riskLevel: riskLevel ?? undefined,
        limit,
        offset,
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
  
      const body = await parseJsonBody<{
        category: RecommendationCategory;
        title: string;
        description: string;
        businessReason: string;
        confidence: number;
        riskLevel: RiskLevel;
        evidence?: string[];
        affectedModules?: string[];
        requiredApprovals?: string[];
      }>(req);
  
      const input = {
        ...body,
        confidence: body.confidence as unknown as import("@prisma/client").Prisma.Decimal,
        evidence: body.evidence ?? [],
        affectedModules: body.affectedModules ?? [],
        requiredApprovals: body.requiredApprovals ?? [],
      };
  
      const rec = await RecommendationsService.createRecommendation(ctx.tenant, input);
      return NextResponse.json(rec, { status: 201 });
    } catch (err) {
      return handleRouteError(err, req);
    }
  });
}
