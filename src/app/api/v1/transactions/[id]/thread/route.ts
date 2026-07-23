import { NextResponse } from "next/server";
import { auth } from "@/server/auth/auth";
import { requireTenantContext } from "@/server/context/tenant-context";
import { handleRouteError } from "@/server/http/handle-route";
import { ApprovalThreadService } from "@/modules/approval-thread";
import { rbacService } from "@/modules/rbac/rbac.service";

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const session = await auth();
    const ctx = requireTenantContext(session?.user?.id, session?.user?.activeCompanyId, session?.user?.companyRole);
    await rbacService.ensurePermission(ctx.userId, ctx.companyId, 'treasury.read');
    const { id } = await params;
    const thread = await ApprovalThreadService.getThread(ctx, id);
    return NextResponse.json({ thread });
  } catch (error) {
    return handleRouteError(error);
  }
}

export async function POST(
  request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const session = await auth();
    const ctx = requireTenantContext(session?.user?.id, session?.user?.activeCompanyId, session?.user?.companyRole);
    const { id } = await params;
    const body = await request.json();
    const { text } = body;
    if (!text || typeof text !== "string" || text.trim().length === 0) {
      return NextResponse.json({ error: "Comment text is required" }, { status: 400 });
    }
    const comment = await ApprovalThreadService.addComment(ctx, id, text.trim());
    return NextResponse.json({ comment });
  } catch (error) {
    return handleRouteError(error);
  }
}
