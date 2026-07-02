import { NextResponse } from "next/server";
import { auth } from "@/server/auth/auth";
import { requireTenantContext } from "@/server/context/tenant-context";
import { handleRouteError } from "@/server/http/handle-route";
import {
  getConnectorConfig,
  updateConnectorConfig,
  deleteConnectorConfig,
  initializeConnectorInstance,
} from "@/modules/connector-platform/config";
import { ConnectorLifecycle } from "@/modules/connector-platform/lifecycle";

export async function GET(_req: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const session = await auth();
    const ctx = requireTenantContext(session?.user?.id, session?.user?.activeCompanyId, session?.user?.companyRole);

    const config = await getConnectorConfig(ctx, id);
    if (!config) return NextResponse.json({ error: "Connector not found" }, { status: 404 });

    return NextResponse.json(config);
  } catch (error) {
    return handleRouteError(error);
  }
}

export async function PATCH(req: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const session = await auth();
    const ctx = requireTenantContext(session?.user?.id, session?.user?.activeCompanyId, session?.user?.companyRole);
    const body = await req.json();

    const config = await updateConnectorConfig(ctx, id, body);
    if (!config) return NextResponse.json({ error: "Connector not found" }, { status: 404 });

    return NextResponse.json(config);
  } catch (error) {
    return handleRouteError(error);
  }
}

export async function DELETE(_req: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const session = await auth();
    const ctx = requireTenantContext(session?.user?.id, session?.user?.activeCompanyId, session?.user?.companyRole);

    const deleted = await deleteConnectorConfig(ctx, id);
    if (!deleted) return NextResponse.json({ error: "Connector not found" }, { status: 404 });

    return NextResponse.json({ ok: true });
  } catch (error) {
    return handleRouteError(error);
  }
}

export async function POST(req: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const session = await auth();
    const ctx = requireTenantContext(session?.user?.id, session?.user?.activeCompanyId, session?.user?.companyRole);
    const body = await req.json();

    const config = await getConnectorConfig(ctx, id);
    if (!config) return NextResponse.json({ error: "Connector not found" }, { status: 404 });

    switch (body.action) {
      case "initialize": {
        const connector = initializeConnectorInstance(config);
        return NextResponse.json({ ok: true, kind: connector.kind, label: connector.label });
      }
      case "validate": {
        const result = await ConnectorLifecycle.validate(ctx, id);
        return NextResponse.json(result);
      }
      case "authenticate": {
        const result = await ConnectorLifecycle.authenticate(ctx, id, body.credentials ?? {});
        return NextResponse.json(result);
      }
      case "connect": {
        const health = await ConnectorLifecycle.connect(ctx, id);
        return NextResponse.json(health);
      }
      case "disconnect": {
        await ConnectorLifecycle.disconnect(ctx, id);
        return NextResponse.json({ ok: true });
      }
      default:
        return NextResponse.json({ error: `Unknown action: ${body.action}` }, { status: 400 });
    }
  } catch (error) {
    return handleRouteError(error);
  }
}
