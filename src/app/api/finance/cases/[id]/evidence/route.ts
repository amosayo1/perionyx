import { NextResponse } from "next/server";
import { cacheHeaders, handleRouteError } from "@/server/http/handle-route";
import { CaseManagementService } from "@/modules/finance-collaboration";
import { getCaseEvidenceSchema, addEvidenceSchema } from "@/lib/validations/finance-collaboration";
import { zodErrorResponse, parseJsonBody } from "@/server/http/handle-route";
import { withRuntimeContext } from "@/server/http/init-runtime-context";

type RouteParams = { params: Promise<{ id: string }> };

export async function GET(req: Request, { params }: RouteParams) {
  return withRuntimeContext(req, async (ctx) => {
    try {
      const { id } = await params;
  
      const { searchParams } = new URL(req.url);
      const query = Object.fromEntries(searchParams.entries());
      const parsed = getCaseEvidenceSchema.safeParse({ ...query, caseId: id });
      if (!parsed.success) {
        return zodErrorResponse(parsed.error, req);
      }
  
      const data = await CaseManagementService.getCaseEvidence(ctx.tenant, parsed.data.caseId);
      return NextResponse.json(data, { headers: cacheHeaders(15) });
    } catch (err) {
      return handleRouteError(err, req);
    }
  });
}

export async function POST(req: Request, { params }: RouteParams) {
  return withRuntimeContext(req, async (ctx) => {
    try {
      const { id } = await params;
  
      const body = await parseJsonBody<Record<string, unknown>>(req);
      const parsed = addEvidenceSchema.safeParse({ ...body, caseId: id });
      if (!parsed.success) {
        return zodErrorResponse(parsed.error, req);
      }
  
      const { caseId, evidenceType, referenceId, referenceType, title, description, source } = parsed.data;
      const data = await CaseManagementService.addEvidence(ctx.tenant, caseId, {
        title,
        description,
        evidenceType,
        referenceId,
        referenceType,
        source,
        addedBy: ctx.tenant.userId,
      });
      return NextResponse.json(data, { status: 201 });
    } catch (err) {
      return handleRouteError(err, req);
    }
  });
}
