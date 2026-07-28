import { NextResponse } from "next/server";
import { CRMService, relationshipIntelligenceService } from "@/modules/crm";
import { handleRouteError } from "@/server/http/handle-route";
import { withRuntimeContext } from "@/server/http/init-runtime-context";

export async function GET(
  req: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  return withRuntimeContext(req, async (ctx) => {
    try {
      const { id } = await params;
  
      const profile = await relationshipIntelligenceService.getContactFullProfile(id, ctx.tenant.companyId);
      return NextResponse.json(profile);
    } catch (err) {
      return handleRouteError(err, req);
    }
  });
}

export async function PUT(
  req: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  return withRuntimeContext(req, async (ctx) => {
    try {
      const { id } = await params;
  
      const body = await req.json();
      const service = new CRMService();
      const updated = await service.updateContact(id, body, ctx.tenant.companyId);
  
      if (!updated) {
        return NextResponse.json({ error: "Contact not found" }, { status: 404 });
      }
  
      return NextResponse.json(updated);
    } catch (err) {
      return handleRouteError(err, req);
    }
  });
}

export async function DELETE(
  req: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  return withRuntimeContext(req, async (ctx) => {
    try {
      const { id } = await params;
  
      const service = new CRMService();
      const updated = await service.updateContact(id, { status: "archived" }, ctx.tenant.companyId);
  
      if (!updated) {
        return NextResponse.json({ error: "Contact not found" }, { status: 404 });
      }
  
      return NextResponse.json({ success: true });
    } catch (err) {
      return handleRouteError(err, req);
    }
  });
}
