import { NextResponse } from "next/server";
import { auth } from "@/server/auth/auth";
import { requireTenantContext } from "@/server/context/tenant-context";
import { handleRouteError, parseJsonBody } from "@/server/http/handle-route";
import { ConnectorRunService } from "@/modules/connectors";

export async function GET(req: Request) {
  try {
    const session = await auth();
    const ctx = requireTenantContext(session?.user?.id, session?.user?.activeCompanyId, session?.user?.companyRole);

    const { searchParams } = new URL(req.url);
    const runId = searchParams.get("runId") ?? undefined;
    const connectorId = searchParams.get("connectorId") ?? undefined;
    const limit = searchParams.get("limit") ? parseInt(searchParams.get("limit")!) : undefined;

    const events = await ConnectorRunService.listEvents(ctx, { runId, connectorId, limit });
    return NextResponse.json({ items: events });
  } catch (error) {
    return handleRouteError(error);
  }
}

export async function POST(req: Request) {
  try {
    const session = await auth();
    const ctx = requireTenantContext(session?.user?.id, session?.user?.activeCompanyId, session?.user?.companyRole);

    const body = await parseJsonBody<{
      runId: string;
      type: string;
      message: string;
      metadata?: Record<string, unknown>;
    }>(req);

    const event = await ConnectorRunService.addEvent(ctx, body.runId, {
      type: body.type,
      message: body.message,
      metadata: body.metadata,
    });

    return NextResponse.json(event, { status: 201 });
  } catch (error) {
    return handleRouteError(error);
  }
}
