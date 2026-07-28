import { NextResponse } from "next/server";
import { cacheHeaders, handleRouteError, zodErrorResponse, parseJsonBody } from "@/server/http/handle-route";
import { findingStatusSchema } from "@/lib/validations/audit-specialist";
import { z } from "zod";
import { withRuntimeContext } from "@/server/http/init-runtime-context";

type RouteParams = { params: Promise<{ id: string }> };

const updateFindingSchema = z.object({
  status: findingStatusSchema.optional(),
  owner: z.string().max(200).optional(),
  recommendation: z.string().max(2000).optional(),
});

export async function GET(req: Request, { params }: RouteParams) {
  return withRuntimeContext(req, async (ctx) => {
    try {
      const { id } = await params;
  
      const data = { id, finding: null };
      return NextResponse.json(data, { headers: cacheHeaders(15) });
    } catch (err) {
      return handleRouteError(err, req);
    }
  });
}

export async function PUT(req: Request, { params }: RouteParams) {
  return withRuntimeContext(req, async (ctx) => {
    try {
      const { id } = await params;
  
      const body = await parseJsonBody<unknown>(req);
      const parsed = updateFindingSchema.safeParse(body);
      if (!parsed.success) {
        return zodErrorResponse(parsed.error, req);
      }
  
      const data = { id, ...parsed.data, updatedAt: new Date().toISOString() };
      return NextResponse.json(data);
    } catch (err) {
      return handleRouteError(err, req);
    }
  });
}
