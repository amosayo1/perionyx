import { NextResponse } from "next/server";
import { handleRouteError, parseJsonBody } from "@/server/http/handle-route";
import { listConversations, createConversation } from "@/modules/copilot/conversation.service";
import { rbacService } from "@/modules/rbac/rbac.service";
import { withRuntimeContext } from "@/server/http/init-runtime-context";

export async function GET() {
  return withRuntimeContext(new Headers(), async (ctx) => {
    try {
      await rbacService.ensurePermission(ctx.tenant.userId, ctx.tenant.companyId, 'analytics.read');
      const conversations = await listConversations(ctx.tenant);
      return NextResponse.json({ items: conversations });
    } catch (error) {
      return handleRouteError(error);
    }
  });
}

export async function POST(request: Request) {
  return withRuntimeContext(request, async (ctx) => {
    try {
      const body = await parseJsonBody<{ title?: string }>(request);
      const conversation = await createConversation(ctx.tenant, body.title);
      return NextResponse.json(conversation, { status: 201 });
    } catch (error) {
      return handleRouteError(error);
    }
  });
}
