import { NextResponse } from "next/server";
import { cacheHeaders, handleRouteError, parseJsonBody } from "@/server/http/handle-route";
import { CloseManagementService } from "@/modules/controller-specialist/close-management";
import { withRuntimeContext } from "@/server/http/init-runtime-context";

export async function GET(req: Request) {
  return withRuntimeContext(req, async (ctx) => {
    try {
  
      const { searchParams } = new URL(req.url);
      const status = searchParams.get("status") as "OPEN" | "IN_PROGRESS" | "REVIEW" | "CLOSED" | "LOCKED" | null;
      const closeType = searchParams.get("closeType") as "monthly" | "quarterly" | "yearly" | null;
      const period = searchParams.get("period");
      const limit = searchParams.get("limit") ? parseInt(searchParams.get("limit")!, 10) : undefined;
      const offset = searchParams.get("offset") ? parseInt(searchParams.get("offset")!, 10) : undefined;
  
      const result = await CloseManagementService.getClosePeriods(ctx.tenant, {
        status: status ?? undefined,
        closeType: closeType ?? undefined,
        period: period ?? undefined,
        limit,
        offset,
      });
  
      return NextResponse.json(result, { headers: cacheHeaders(30) });
    } catch (err) {
      return handleRouteError(err, req);
    }
  });
}

export async function POST(req: Request) {
  return withRuntimeContext(req, async (ctx) => {
    try {
  
      const body = await parseJsonBody<{
        period: string;
        closeType: "monthly" | "quarterly" | "yearly";
        estimatedCompletion?: string;
        tasks?: Array<{
          title: string;
          description?: string;
          category: string;
          priority?: string;
          assignedTo?: string;
          dueDate?: string;
          entityName?: string;
          departmentName?: string;
          dependencyIds?: string[];
        }>;
      }>(req);
  
      const input = {
        ...body,
        estimatedCompletion: body.estimatedCompletion ? new Date(body.estimatedCompletion) : undefined,
        tasks: body.tasks?.map((t) => ({
          ...t,
          category: t.category as import("@/modules/controller-specialist/types").CloseTaskCategory,
          dueDate: t.dueDate ? new Date(t.dueDate) : undefined,
        })),
      };
  
      const period = await CloseManagementService.createClosePeriod(ctx.tenant, input);
      return NextResponse.json(period, { status: 201 });
    } catch (err) {
      return handleRouteError(err, req);
    }
  });
}
