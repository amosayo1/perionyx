import { NextResponse } from "next/server";
import { auth } from "@/server/auth/auth";
import { requireTenantContext } from "@/server/context/tenant-context";
import { CFOAdvisorService } from "@/modules/cfo-advisor/cfo-advisor.service";
import { sendMessageSchema } from "@/lib/validations/cfo-advisor";
import { handleRouteError, zodErrorResponse, parseJsonBody } from "@/server/http/handle-route";
import { rbacService } from "@/modules/rbac/rbac.service";

export async function GET(req: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const session = await auth();
    const ctx = requireTenantContext(session?.user?.id, session?.user?.activeCompanyId, session?.user?.companyRole);
    await rbacService.ensurePermission(ctx.userId, ctx.companyId, "cfo_advisor.read");

    const messages = await CFOAdvisorService.getConversationMessages(ctx, id);
    return NextResponse.json(messages);
  } catch (err) {
    return handleRouteError(err, req);
  }
}

export async function POST(req: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const session = await auth();
    const ctx = requireTenantContext(session?.user?.id, session?.user?.activeCompanyId, session?.user?.companyRole);
    await rbacService.ensurePermission(ctx.userId, ctx.companyId, "cfo_advisor.manage");

    const body = await parseJsonBody<unknown>(req);
    const parsed = sendMessageSchema.safeParse(body);
    if (!parsed.success) return zodErrorResponse(parsed.error, req);

    const messages = await CFOAdvisorService.sendMessage(ctx, id, parsed.data.content);
    return NextResponse.json(messages, { status: 201 });
  } catch (err) {
    return handleRouteError(err, req);
  }
}
