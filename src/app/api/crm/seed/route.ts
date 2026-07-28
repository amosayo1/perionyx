import { NextResponse } from "next/server";
import { CRMService, seedCrmData } from "@/modules/crm";
import { handleRouteError } from "@/server/http/handle-route";
import { withRuntimeContext } from "@/server/http/init-runtime-context";

export async function POST(req: Request) {
  return withRuntimeContext(req, async (ctx) => {
    try {
  
      const service = new CRMService();
      await seedCrmData(service, ctx.tenant.companyId);
  
      return NextResponse.json({ success: true, message: "CRM data seeded successfully" });
    } catch (err) {
      return handleRouteError(err, req);
    }
  });
}
