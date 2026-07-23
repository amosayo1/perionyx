import { NextResponse } from "next/server";
import { auth } from "@/server/auth/auth";
import { requireTenantContext } from "@/server/context/tenant-context";
import { productDiscoveryService } from "@/modules/crm";
import { handleRouteError, cacheHeaders } from "@/server/http/handle-route";

export async function GET(req: Request) {
  try {
    const session = await auth();
    const ctx = requireTenantContext(session?.user?.id, session?.user?.activeCompanyId, session?.user?.companyRole);

    const url = new URL(req.url);
    const contactId = url.searchParams.get("contactId") ?? undefined;
    const discoveryStage = url.searchParams.get("discoveryStage") ?? undefined;

    const sessions = await productDiscoveryService.list({ contactId: contactId || undefined, discoveryStage });
    return NextResponse.json(sessions, { headers: cacheHeaders(15) });
  } catch (err) {
    return handleRouteError(err, req);
  }
}

export async function POST(req: Request) {
  try {
    const session = await auth();
    const ctx = requireTenantContext(session?.user?.id, session?.user?.activeCompanyId, session?.user?.companyRole);

    const body = await req.json();

    if (!body.contactId) {
      return NextResponse.json({ error: "contactId is required" }, { status: 400 });
    }

    const discovery = await productDiscoveryService.create(body);
    return NextResponse.json(discovery, { status: 201 });
  } catch (err) {
    return handleRouteError(err, req);
  }
}

export async function PUT(req: Request) {
  try {
    const session = await auth();
    const ctx = requireTenantContext(session?.user?.id, session?.user?.activeCompanyId, session?.user?.companyRole);

    const body = await req.json();

    if (!body.id) {
      return NextResponse.json({ error: "id is required" }, { status: 400 });
    }

    const { id, ...updates } = body;
    const updated = await productDiscoveryService.update(id, updates);
    return NextResponse.json(updated);
  } catch (err) {
    return handleRouteError(err, req);
  }
}
