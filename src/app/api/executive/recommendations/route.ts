import { NextResponse, type NextRequest } from "next/server";
import { auth } from "@/server/auth/auth";
import { requireTenantContext } from "@/server/context/tenant-context";
import { ExecutiveCommandCenter } from "@/modules/executive-command-center";
import { handleRouteError, zodErrorResponse, cacheHeaders } from "@/server/http/handle-route";
import { z } from "zod";

const actSchema = z.object({
  recommendationId: z.string().min(1),
  action: z.enum(["accept", "reject", "acknowledge"]),
});

export async function GET(req: Request) {
  try {
    const session = await auth();
    const ctx = requireTenantContext(session?.user?.id, session?.user?.activeCompanyId, session?.user?.companyRole);

    const result = await ExecutiveCommandCenter.getExecutiveRecommendations(ctx);
    return NextResponse.json(result, { headers: cacheHeaders(30) });
  } catch (err) {
    return handleRouteError(err, req);
  }
}

export async function POST(req: NextRequest) {
  try {
    const session = await auth();
    const ctx = requireTenantContext(session?.user?.id, session?.user?.activeCompanyId, session?.user?.companyRole);

    const body = await req.json();
    const parseResult = actSchema.safeParse(body);
    if (!parseResult.success) return zodErrorResponse(parseResult.error, req);

    const { recommendationId, action } = parseResult.data;
    const recommendations = await ExecutiveCommandCenter.getExecutiveRecommendations(ctx);
    const updated = recommendations.map((r) =>
      r.id === recommendationId
        ? { ...r, status: action === "accept" ? "accepted" as const : action === "reject" ? "rejected" as const : "acknowledged" as const }
        : r,
    );

    return NextResponse.json({ success: true, recommendations: updated });
  } catch (err) {
    return handleRouteError(err, req);
  }
}
