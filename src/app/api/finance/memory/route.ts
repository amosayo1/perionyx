import { NextResponse } from "next/server";
import { auth } from "@/server/auth/auth";
import { requireTenantContext } from "@/server/context/tenant-context";
import { cacheHeaders, handleRouteError } from "@/server/http/handle-route";
import { FinanceCollaborationService } from "@/modules/finance-collaboration";
import { EnterpriseMemory } from "@/modules/finance-collaboration";
import { getMemorySchema, storeMemorySchema } from "@/lib/validations/finance-collaboration";
import { zodErrorResponse, parseJsonBody } from "@/server/http/handle-route";

export async function GET(req: Request) {
  try {
    const session = await auth();
    const ctx = requireTenantContext(session?.user?.id, session?.user?.activeCompanyId, session?.user?.companyRole);

    const { searchParams } = new URL(req.url);
    const params = Object.fromEntries(searchParams.entries());

    const parsed = getMemorySchema.safeParse(params);
    if (!parsed.success) {
      return zodErrorResponse(parsed.error, req);
    }

    const data = await FinanceCollaborationService.getEnterpriseMemory(ctx, parsed.data);
    return NextResponse.json(data, { headers: cacheHeaders(30) });
  } catch (err) {
    return handleRouteError(err, req);
  }
}

export async function POST(req: Request) {
  try {
    const session = await auth();
    const ctx = requireTenantContext(session?.user?.id, session?.user?.activeCompanyId, session?.user?.companyRole);

    const body = await parseJsonBody<unknown>(req);
    const parsed = storeMemorySchema.safeParse(body);
    if (!parsed.success) {
      return zodErrorResponse(parsed.error, req);
    }

    const data = await EnterpriseMemory.storeMemory(ctx, {
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
}
