import { NextResponse } from "next/server";
import { auth } from "@/server/auth/auth";
import { requireTenantContext } from "@/server/context/tenant-context";
import { ScenarioModelingService } from "@/modules/fpa-specialist";
import { handleRouteError, zodErrorResponse, parseJsonBody, cacheHeaders } from "@/server/http/handle-route";
import { executeScenarioSchema } from "@/lib/validations/fpa-specialist";

export async function GET(
  req: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const session = await auth();
    const ctx = requireTenantContext(session?.user?.id, session?.user?.activeCompanyId, session?.user?.companyRole);
    const { id } = await params;

    const [results, impact] = await Promise.all([
      ScenarioModelingService.getScenarioResults(ctx, id),
      ScenarioModelingService.getScenarioImpact(ctx, id),
    ]);

    return NextResponse.json({ scenarioId: id, results, impact }, { headers: cacheHeaders(30) });
  } catch (err) {
    return handleRouteError(err, req);
  }
}

export async function POST(
  req: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const session = await auth();
    const ctx = requireTenantContext(session?.user?.id, session?.user?.activeCompanyId, session?.user?.companyRole);
    const { id } = await params;

    const body = await parseJsonBody<unknown>(req);
    const parsed = executeScenarioSchema.safeParse(body);
    if (!parsed.success) return zodErrorResponse(parsed.error, req);

    const result = await ScenarioModelingService.executeScenario(ctx, id, parsed.data);
    return NextResponse.json(result, { status: 201 });
  } catch (err) {
    return handleRouteError(err, req);
  }
}
