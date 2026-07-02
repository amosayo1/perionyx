import { NextResponse } from "next/server";
import { auth } from "@/server/auth/auth";
import { requireTenantContext } from "@/server/context/tenant-context";
import { handleRouteError } from "@/server/http/handle-route";
import { ConnectorRunService } from "@/modules/connectors";

type RouteContext = { params: Promise<{ connectorId: string }> };

export async function GET(_request: Request, context: RouteContext) {
  try {
    const session = await auth();
    const ctx = requireTenantContext(session?.user?.id, session?.user?.activeCompanyId, session?.user?.companyRole);
    const { connectorId } = await context.params;
    const result = await ConnectorRunService.getConnector(ctx, connectorId);
    return NextResponse.json(result);
  } catch (error) {
    return handleRouteError(error);
  }
}
