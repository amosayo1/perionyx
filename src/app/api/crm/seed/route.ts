import { NextResponse } from "next/server";
import { auth } from "@/server/auth/auth";
import { requireTenantContext } from "@/server/context/tenant-context";
import { CRMService, seedCrmData } from "@/modules/crm";
import { handleRouteError } from "@/server/http/handle-route";

export async function POST(req: Request) {
  try {
    const session = await auth();
    const ctx = requireTenantContext(session?.user?.id, session?.user?.activeCompanyId, session?.user?.companyRole);

    const service = new CRMService();
    await seedCrmData(service, ctx.companyId);

    return NextResponse.json({ success: true, message: "CRM data seeded successfully" });
  } catch (err) {
    return handleRouteError(err, req);
  }
}
