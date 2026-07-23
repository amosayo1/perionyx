import { NextResponse } from "next/server";
import { auth } from "@/server/auth/auth";
import { requireTenantContext } from "@/server/context/tenant-context";
import { cacheHeaders, handleRouteError } from "@/server/http/handle-route";
import { WorkloadManager } from "@/modules/finance-collaboration";
import { getWorkloadsSchema } from "@/lib/validations/finance-collaboration";
import { zodErrorResponse } from "@/server/http/handle-route";

export async function GET(req: Request) {
  try {
    const session = await auth();
    const ctx = requireTenantContext(session?.user?.id, session?.user?.activeCompanyId, session?.user?.companyRole);

    const { searchParams } = new URL(req.url);
    const params = Object.fromEntries(searchParams.entries());

    const parsed = getWorkloadsSchema.safeParse(params);
    if (!parsed.success) {
      return zodErrorResponse(parsed.error, req);
    }

    let data;
    if (parsed.data.specialist) {
      const workload = await WorkloadManager.getWorkloadForSpecialist(ctx, parsed.data.specialist);
      data = { workloads: [workload], total: 1 };
    } else {
      const workloads = await WorkloadManager.getWorkloads(ctx);
      data = { workloads, total: workloads.length };
    }

    return NextResponse.json(data, { headers: cacheHeaders(30) });
  } catch (err) {
    return handleRouteError(err, req);
  }
}
