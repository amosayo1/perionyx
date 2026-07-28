import { NextResponse } from "next/server";
import { handleRouteError } from "@/server/http/handle-route";
import {
  getConnectorConfig,
  updateConnectorConfig,
  deleteConnectorConfig,
  initializeConnectorInstance,
} from "@/modules/connector-platform/config";
import { ConnectorLifecycle } from "@/modules/connector-platform/lifecycle";
import { rbacService } from "@/modules/rbac/rbac.service";
import { withRuntimeContext } from "@/server/http/init-runtime-context";

export async function GET(_req: Request, { params }: { params: Promise<{ id: string }> }) {
  return withRuntimeContext(_req, async (ctx) => {
    try {
      const { id } = await params;
      await rbacService.ensurePermission(ctx.tenant.userId, ctx.tenant.companyId, 'connectors.read');
  
      const config = await getConnectorConfig(ctx.tenant, id);
      if (!config) return NextResponse.json({ error: "Connector not found" }, { status: 404 });
  
      return NextResponse.json(config);
    } catch (error) {
      return handleRouteError(error);
    }
  });
}

export async function PATCH(req: Request, { params }: { params: Promise<{ id: string }> }) {
  return withRuntimeContext(req, async (ctx) => {
    try {
      const { id } = await params;
      const body = await req.json();
  
      const config = await updateConnectorConfig(ctx.tenant, id, body);
      if (!config) return NextResponse.json({ error: "Connector not found" }, { status: 404 });
  
      return NextResponse.json(config);
    } catch (error) {
      return handleRouteError(error);
    }
  });
}

export async function DELETE(_req: Request, { params }: { params: Promise<{ id: string }> }) {
  return withRuntimeContext(_req, async (ctx) => {
    try {
      const { id } = await params;
  
      const deleted = await deleteConnectorConfig(ctx.tenant, id);
      if (!deleted) return NextResponse.json({ error: "Connector not found" }, { status: 404 });
  
      return NextResponse.json({ ok: true });
    } catch (error) {
      return handleRouteError(error);
    }
  });
}

export async function POST(req: Request, { params }: { params: Promise<{ id: string }> }) {
  return withRuntimeContext(req, async (ctx) => {
    try {
      const { id } = await params;
      const body = await req.json();
  
      const config = await getConnectorConfig(ctx.tenant, id);
      if (!config) return NextResponse.json({ error: "Connector not found" }, { status: 404 });
  
      switch (body.action) {
        case "initialize": {
          const connector = initializeConnectorInstance(config);
          return NextResponse.json({ ok: true, kind: connector.kind, label: connector.label });
        }
        case "validate": {
          const result = await ConnectorLifecycle.validate(ctx.tenant, id);
          return NextResponse.json(result);
        }
        case "authenticate": {
          const result = await ConnectorLifecycle.authenticate(ctx.tenant, id, body.credentials ?? {});
          return NextResponse.json(result);
        }
        case "connect": {
          const health = await ConnectorLifecycle.connect(ctx.tenant, id);
          return NextResponse.json(health);
        }
        case "disconnect": {
          await ConnectorLifecycle.disconnect(ctx.tenant, id);
          return NextResponse.json({ ok: true });
        }
        default:
          return NextResponse.json({ error: `Unknown action: ${body.action}` }, { status: 400 });
      }
    } catch (error) {
      return handleRouteError(error);
    }
  });
}
