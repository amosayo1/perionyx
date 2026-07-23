import { NextResponse } from "next/server";
import { auth } from "@/server/auth/auth";
import { requireTenantContext } from "@/server/context/tenant-context";
import { ForecastService } from "@/modules/fpa-specialist";
import { handleRouteError, cacheHeaders } from "@/server/http/handle-route";

export async function GET(
  req: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const session = await auth();
    const ctx = requireTenantContext(session?.user?.id, session?.user?.activeCompanyId, session?.user?.companyRole);
    const { id } = await params;

    const [versions, accuracy] = await Promise.all([
      ForecastService.getVersions(ctx, id),
      ForecastService.getForecastAccuracy(ctx, id),
    ]);

    return NextResponse.json({ forecastId: id, versions, accuracy }, { headers: cacheHeaders(30) });
  } catch (err) {
    return handleRouteError(err, req);
  }
}
