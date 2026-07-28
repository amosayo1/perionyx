import { NextResponse } from "next/server";
import { cacheHeaders, handleRouteError, zodErrorResponse, parseJsonBody } from "@/server/http/handle-route";
import { getFindingsSchema, createFindingSchema } from "@/lib/validations/audit-specialist";
import { withRuntimeContext } from "@/server/http/init-runtime-context";

export async function GET(req: Request) {
  return withRuntimeContext(req, async (ctx) => {
    try {
  
      const { searchParams } = new URL(req.url);
      const params = Object.fromEntries(searchParams.entries());
  
      const parsed = getFindingsSchema.safeParse(params);
      if (!parsed.success) {
        return zodErrorResponse(parsed.error, req);
      }
  
      const data = { findings: [], filters: parsed.data };
      return NextResponse.json(data, { headers: cacheHeaders(15) });
    } catch (err) {
      return handleRouteError(err, req);
    }
  });
}

export async function POST(req: Request) {
  return withRuntimeContext(req, async (ctx) => {
    try {
  
      const body = await parseJsonBody<unknown>(req);
      const parsed = createFindingSchema.safeParse(body);
      if (!parsed.success) {
        return zodErrorResponse(parsed.error, req);
      }
  
      const data = { id: crypto.randomUUID(), ...parsed.data, companyId: ctx.tenant.companyId, status: "OPEN", createdAt: new Date().toISOString() };
      return NextResponse.json(data, { status: 201 });
    } catch (err) {
      return handleRouteError(err, req);
    }
  });
}
