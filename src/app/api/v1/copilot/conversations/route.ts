import { NextResponse } from "next/server";
import { auth } from "@/server/auth/auth";
import { requireTenantContext } from "@/server/context/tenant-context";
import { handleRouteError, parseJsonBody } from "@/server/http/handle-route";
import { listConversations, createConversation } from "@/modules/copilot/conversation.service";
import { rbacService } from "@/modules/rbac/rbac.service";

export async function GET() {
  try {
    const session = await auth();
    const ctx = requireTenantContext(session?.user?.id, session?.user?.activeCompanyId, session?.user?.companyRole);
    await rbacService.ensurePermission(ctx.userId, ctx.companyId, 'analytics.read');
    const conversations = await listConversations(ctx);
    return NextResponse.json({ items: conversations });
  } catch (error) {
    return handleRouteError(error);
  }
}

export async function POST(request: Request) {
  try {
    const session = await auth();
    const ctx = requireTenantContext(session?.user?.id, session?.user?.activeCompanyId, session?.user?.companyRole);
    const body = await parseJsonBody<{ title?: string }>(request);
    const conversation = await createConversation(ctx, body.title);
    return NextResponse.json(conversation, { status: 201 });
  } catch (error) {
    return handleRouteError(error);
  }
}
