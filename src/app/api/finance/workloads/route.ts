import { NextResponse } from "next/server";
import { cacheHeaders, handleRouteError } from "@/server/http/handle-route";
import { WorkloadManager } from "@/modules/finance-collaboration";
import { getWorkloadsSchema } from "@/lib/validations/finance-collaboration";
import { zodErrorResponse } from "@/server/http/handle-route";
import { withRuntimeContext } from "@/server/http/init-runtime-context";

export async function GET(req: Request) {
  return withRuntimeContext(req, async (ctx) => {
    try {
  
      const { searchParams } = new URL(req.url);
      const params = Object.fromEntries(searchParams.entries());
  
      const parsed = getWorkloadsSchema.safeParse(params);
      if (!parsed.success) {
        return zodErrorResponse(parsed.error, req);
      }
  
      let data;
      if (parsed.data.specialist) {
        const workload = await WorkloadManager.getWorkloadForSpecialist(ctx.tenant, parsed.data.specialist);
        data = { workloads: [workload], total: 1 };
      } else {
        const workloads = await WorkloadManager.getWorkloads(ctx.tenant);
        data = { workloads, total: workloads.length };
      }
  
      return NextResponse.json(data, { headers: cacheHeaders(30) });
    } catch (err) {
      return handleRouteError(err, req);
    }
  });
}
