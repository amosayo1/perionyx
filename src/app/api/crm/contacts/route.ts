import { NextResponse } from "next/server";
import { auth } from "@/server/auth/auth";
import { requireTenantContext } from "@/server/context/tenant-context";
import { CRMService } from "@/modules/crm";
import { handleRouteError, cacheHeaders } from "@/server/http/handle-route";

export async function GET(req: Request) {
  try {
    const session = await auth();
    const ctx = requireTenantContext(session?.user?.id, session?.user?.activeCompanyId, session?.user?.companyRole);

    const url = new URL(req.url);
    const search = url.searchParams.get("search");
    const stage = url.searchParams.get("stage");
    const status = url.searchParams.get("status");
    const priority = url.searchParams.get("priority");
    const region = url.searchParams.get("region");
    const health = url.searchParams.get("health");
    const importance = url.searchParams.get("importance");

    const service = new CRMService();
    let contacts = await service.getAllContacts(ctx.companyId);

    if (status) contacts = contacts.filter((c) => c.status === status);
    if (stage) contacts = contacts.filter((c) => c.relationshipStage === stage);
    if (priority) contacts = contacts.filter((c) => c.priority === priority);
    if (region) contacts = contacts.filter((c) => c.region?.toLowerCase() === region.toLowerCase());
    if (health) contacts = contacts.filter((c) => c.relationshipHealth === health);
    if (importance) contacts = contacts.filter((c) => c.strategicImportance === importance);
    if (search) {
      const q = search.toLowerCase();
      contacts = contacts.filter(
        (c) =>
          c.name.toLowerCase().includes(q) ||
          c.role.toLowerCase().includes(q) ||
          c.company?.toLowerCase().includes(q) ||
          c.tags.some((t) => t.toLowerCase().includes(q)) ||
          c.expertise.some((e) => e.toLowerCase().includes(q)),
      );
    }

    return NextResponse.json(contacts, { headers: cacheHeaders(15) });
  } catch (err) {
    return handleRouteError(err, req);
  }
}

export async function POST(req: Request) {
  try {
    const session = await auth();
    const ctx = requireTenantContext(session?.user?.id, session?.user?.activeCompanyId, session?.user?.companyRole);

    const body = await req.json();
    const service = new CRMService();
    const contact = await service.addContact(body, ctx.companyId);
    return NextResponse.json(contact, { status: 201 });
  } catch (err) {
    return handleRouteError(err, req);
  }
}
