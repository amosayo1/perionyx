import { NextResponse } from "next/server";
import { auth } from "@/server/auth/auth";
import { requireTenantContext } from "@/server/context/tenant-context";
import { knowledgeGraphService } from "@/modules/crm";
import { handleRouteError, cacheHeaders } from "@/server/http/handle-route";

export async function GET(req: Request) {
  try {
    const session = await auth();
    const ctx = requireTenantContext(session?.user?.id, session?.user?.activeCompanyId, session?.user?.companyRole);

    const url = new URL(req.url);
    const contactId = url.searchParams.get("contactId");

    if (contactId) {
      const links = await knowledgeGraphService.getContactGraph(contactId);
      return NextResponse.json(links, { headers: cacheHeaders(15) });
    }

    const graph = await knowledgeGraphService.getGraphData();
    return NextResponse.json(graph, { headers: cacheHeaders(15) });
  } catch (err) {
    return handleRouteError(err, req);
  }
}

export async function POST(req: Request) {
  try {
    const session = await auth();
    const ctx = requireTenantContext(session?.user?.id, session?.user?.activeCompanyId, session?.user?.companyRole);

    const body = await req.json();

    if (!body.sourceContactId) {
      return NextResponse.json({ error: "sourceContactId is required" }, { status: 400 });
    }

    const link = await knowledgeGraphService.create(body);
    return NextResponse.json(link, { status: 201 });
  } catch (err) {
    return handleRouteError(err, req);
  }
}

export async function DELETE(req: Request) {
  try {
    const session = await auth();
    const ctx = requireTenantContext(session?.user?.id, session?.user?.activeCompanyId, session?.user?.companyRole);

    const url = new URL(req.url);
    const id = url.searchParams.get("id");

    if (!id) {
      return NextResponse.json({ error: "id query parameter is required" }, { status: 400 });
    }

    await knowledgeGraphService.delete(id);
    return NextResponse.json({ success: true });
  } catch (err) {
    return handleRouteError(err, req);
  }
}
