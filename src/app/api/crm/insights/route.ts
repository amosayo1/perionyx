import { NextResponse } from "next/server";
import { auth } from "@/server/auth/auth";
import { requireTenantContext } from "@/server/context/tenant-context";
import { voiceOfCustomerService } from "@/modules/crm";
import { handleRouteError, cacheHeaders } from "@/server/http/handle-route";

export async function GET(req: Request) {
  try {
    const session = await auth();
    const ctx = requireTenantContext(session?.user?.id, session?.user?.activeCompanyId, session?.user?.companyRole);

    const url = new URL(req.url);
    const interviewType = url.searchParams.get("interviewType") ?? undefined;
    const interviewStatus = url.searchParams.get("interviewStatus") ?? undefined;
    const contactId = url.searchParams.get("contactId") ?? undefined;

    const insights = await voiceOfCustomerService.getAllInsights({
      interviewType,
      interviewStatus,
      contactId: contactId || undefined,
    });

    return NextResponse.json(insights, { headers: cacheHeaders(15) });
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

    const insight = await voiceOfCustomerService.createInsight(body);
    return NextResponse.json(insight, { status: 201 });
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
    const insight = await voiceOfCustomerService.updateInsight(id, updates);
    return NextResponse.json(insight);
  } catch (err) {
    return handleRouteError(err, req);
  }
}
