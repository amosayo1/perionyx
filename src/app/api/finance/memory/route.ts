import { NextResponse } from "next/server";
import { cacheHeaders, handleRouteError } from "@/server/http/handle-route";
import { FinanceCollaborationService } from "@/modules/finance-collaboration";
import { EnterpriseMemory } from "@/modules/finance-collaboration";
import { getMemorySchema, storeMemorySchema } from "@/lib/validations/finance-collaboration";
import { zodErrorResponse, parseJsonBody } from "@/server/http/handle-route";
import { withRuntimeContext } from "@/server/http/init-runtime-context";

export async function GET(req: Request) {
  return withRuntimeContext(req, async (ctx) => {
    try {
  
      const { searchParams } = new URL(req.url);
      const params = Object.fromEntries(searchParams.entries());
  
      const parsed = getMemorySchema.safeParse(params);
      if (!parsed.success) {
        return zodErrorResponse(parsed.error, req);
      }
  
      const data = await FinanceCollaborationService.getEnterpriseMemory(ctx.tenant, parsed.data);
      return NextResponse.json(data, { headers: cacheHeaders(30) });
    } catch (err) {
      return handleRouteError(err, req);
    }
  });
}

export async function POST(req: Request) {
  return withRuntimeContext(req, async (ctx) => {
    try {
  
      const body = await parseJsonBody<unknown>(req);
      const parsed = storeMemorySchema.safeParse(body);
      if (!parsed.success) {
        return zodErrorResponse(parsed.error, req);
      }
  
      const data = await EnterpriseMemory.storeMemory(ctx.tenant, {
        memoryType: parsed.data.memoryType,
        entityKey: parsed.data.contextKey,
        content: parsed.data.contextValue,
        specialist: parsed.data.sourceSpecialist,
        caseId: parsed.data.relatedEntityId,
        expiresAt: parsed.data.expiresAt ? new Date(parsed.data.expiresAt) : undefined,
      });
      return NextResponse.json(data, { status: 201 });
    } catch (err) {
      return handleRouteError(err, req);
    }
  });
}
