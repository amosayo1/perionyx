import { NextResponse } from "next/server";
import { auth } from "@/server/auth/auth";
import { requireTenantContext } from "@/server/context/tenant-context";
import { cacheHeaders, handleRouteError } from "@/server/http/handle-route";
import { CaseManagementService } from "@/modules/finance-collaboration";
import { getCaseCommentsSchema, addCommentSchema } from "@/lib/validations/finance-collaboration";
import { zodErrorResponse, parseJsonBody } from "@/server/http/handle-route";

type RouteParams = { params: Promise<{ id: string }> };

export async function GET(req: Request, { params }: RouteParams) {
  try {
    const session = await auth();
    const ctx = requireTenantContext(session?.user?.id, session?.user?.activeCompanyId, session?.user?.companyRole);
    const { id } = await params;

    const { searchParams } = new URL(req.url);
    const query = Object.fromEntries(searchParams.entries());
    const parsed = getCaseCommentsSchema.safeParse({ ...query, caseId: id });
    if (!parsed.success) {
      return zodErrorResponse(parsed.error, req);
    }

    const data = await CaseManagementService.getCaseComments(ctx, parsed.data.caseId);
    return NextResponse.json(data, { headers: cacheHeaders(15) });
  } catch (err) {
    return handleRouteError(err, req);
  }
}

export async function POST(req: Request, { params }: RouteParams) {
  try {
    const session = await auth();
    const ctx = requireTenantContext(session?.user?.id, session?.user?.activeCompanyId, session?.user?.companyRole);
    const { id } = await params;

    const body = await parseJsonBody<Record<string, unknown>>(req);
    const parsed = addCommentSchema.safeParse({ ...body, caseId: id });
    if (!parsed.success) {
      return zodErrorResponse(parsed.error, req);
    }

    const { caseId, content, commentType } = parsed.data;
    const data = await CaseManagementService.addComment(ctx, caseId, {
      authorId: ctx.userId,
      authorName: ctx.userId,
      commentType,
      content,
    });
    return NextResponse.json(data, { status: 201 });
  } catch (err) {
    return handleRouteError(err, req);
  }
}
