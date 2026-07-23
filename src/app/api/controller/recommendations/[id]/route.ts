import { NextResponse } from "next/server";
import { auth } from "@/server/auth/auth";
import { requireTenantContext } from "@/server/context/tenant-context";
import { handleRouteError, parseJsonBody } from "@/server/http/handle-route";
import { RecommendationsService } from "@/modules/controller-specialist/recommendations";

export async function PUT(
  req: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const session = await auth();
    const ctx = requireTenantContext(session?.user?.id, session?.user?.activeCompanyId, session?.user?.companyRole);
    const { id } = await params;

    const body = await parseJsonBody<{
      status?: string;
      assignedTo?: string;
      metadata?: Record<string, unknown>;
    }>(req);

    const rec = await RecommendationsService.updateRecommendation(ctx, id, body);
    return NextResponse.json(rec);
  } catch (err) {
    return handleRouteError(err, req);
  }
}
