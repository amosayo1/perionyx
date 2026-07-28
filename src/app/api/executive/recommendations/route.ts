import { NextResponse, type NextRequest } from "next/server";
import { ExecutiveCommandCenter } from "@/modules/executive-command-center";
import { handleRouteError, zodErrorResponse, cacheHeaders } from "@/server/http/handle-route";
import { z } from "zod";
import { withRuntimeContext } from "@/server/http/init-runtime-context";

const actSchema = z.object({
  recommendationId: z.string().min(1),
  action: z.enum(["accept", "reject", "acknowledge"]),
});

export async function GET(req: Request) {
  return withRuntimeContext(req, async (ctx) => {
    try {
  
      const result = await ExecutiveCommandCenter.getExecutiveRecommendations(ctx.tenant);
      return NextResponse.json(result, { headers: cacheHeaders(30) });
    } catch (err) {
      return handleRouteError(err, req);
    }
  });
}

export async function POST(req: NextRequest) {
  return withRuntimeContext(req, async (ctx) => {
    try {
  
      const body = await req.json();
      const parseResult = actSchema.safeParse(body);
      if (!parseResult.success) return zodErrorResponse(parseResult.error, req);
  
      const { recommendationId, action } = parseResult.data;
      const recommendations = await ExecutiveCommandCenter.getExecutiveRecommendations(ctx.tenant);
      const updated = recommendations.map((r) =>
        r.id === recommendationId
          ? { ...r, status: action === "accept" ? "accepted" as const : action === "reject" ? "rejected" as const : "acknowledged" as const }
          : r,
      );
  
      return NextResponse.json({ success: true, recommendations: updated });
    } catch (err) {
      return handleRouteError(err, req);
    }
  });
}
