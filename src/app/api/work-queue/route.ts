import { NextRequest, NextResponse } from "next/server";
import { withRuntimeContext } from "@/server/http/init-runtime-context";
import { WorkQueueService } from "@/modules/work-queue/work-queue-service";
import { cacheHeaders } from "@/server/http/handle-route";
import type { WorkQueueFilters } from "@/modules/work-queue/types";

export async function GET(req: NextRequest) {
  return withRuntimeContext(req, async (ctx) => {
    const { searchParams } = new URL(req.url);
    const filter: WorkQueueFilters = {
      filter: searchParams.get("filter") ?? undefined,
      search: searchParams.get("search") ?? undefined,
      sort: searchParams.get("sort") ?? undefined,
      dir: (searchParams.get("dir") as "asc" | "desc") ?? undefined,
      page: searchParams.get("page") ? Number(searchParams.get("page")) : undefined,
      pageSize: searchParams.get("pageSize") ? Number(searchParams.get("pageSize")) : undefined,
    };

    const service = new WorkQueueService();
    const result = await service.getWorkQueue(ctx.tenant.companyId, filter);
    return NextResponse.json(result, { headers: cacheHeaders(15) });
  });
}
