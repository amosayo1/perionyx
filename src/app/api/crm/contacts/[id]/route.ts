import { NextResponse } from "next/server";
import { auth } from "@/server/auth/auth";
import { requireTenantContext } from "@/server/context/tenant-context";
import { CRMService, relationshipIntelligenceService } from "@/modules/crm";
import { handleRouteError } from "@/server/http/handle-route";

export async function GET(
  req: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const { id } = await params;
    const session = await auth();
    const ctx = requireTenantContext(session?.user?.id, session?.user?.activeCompanyId, session?.user?.companyRole);

    const profile = await relationshipIntelligenceService.getContactFullProfile(id, ctx.companyId);
    return NextResponse.json(profile);
  } catch (err) {
    return handleRouteError(err, req);
  }
}

export async function PUT(
  req: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const { id } = await params;
    const session = await auth();
    const ctx = requireTenantContext(session?.user?.id, session?.user?.activeCompanyId, session?.user?.companyRole);

    const body = await req.json();
    const service = new CRMService();
    const updated = await service.updateContact(id, body, ctx.companyId);

    if (!updated) {
      return NextResponse.json({ error: "Contact not found" }, { status: 404 });
    }

    return NextResponse.json(updated);
  } catch (err) {
    return handleRouteError(err, req);
  }
}

export async function DELETE(
  req: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const { id } = await params;
    const session = await auth();
    const ctx = requireTenantContext(session?.user?.id, session?.user?.activeCompanyId, session?.user?.companyRole);

    const service = new CRMService();
    const updated = await service.updateContact(id, { status: "archived" }, ctx.companyId);

    if (!updated) {
      return NextResponse.json({ error: "Contact not found" }, { status: 404 });
    }

    return NextResponse.json({ success: true });
  } catch (err) {
    return handleRouteError(err, req);
  }
}
