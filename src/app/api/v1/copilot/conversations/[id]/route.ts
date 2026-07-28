import { NextResponse } from "next/server";
import { handleRouteError } from "@/server/http/handle-route";
import { getConversation, deleteConversation } from "@/modules/copilot/conversation.service";
import { rbacService } from "@/modules/rbac/rbac.service";
import { withRuntimeContext } from "@/server/http/init-runtime-context";

export async function GET(request: Request, { params }: { params: Promise<{ id: string }> }) {
  return withRuntimeContext(request, async (ctx) => {
    try {
      const { id } = await params;
      await rbacService.ensurePermission(ctx.tenant.userId, ctx.tenant.companyId, 'analytics.read');
      const conversation = await getConversation(ctx.tenant, id);
      if (!conversation) {
        return NextResponse.json({ error: { code: "NOT_FOUND", message: "Conversation not found" } }, { status: 404 });
      }
      return NextResponse.json(conversation);
    } catch (error) {
      return handleRouteError(error);
    }
  });
}

export async function DELETE(request: Request, { params }: { params: Promise<{ id: string }> }) {
  return withRuntimeContext(request, async (ctx) => {
    try {
      const { id } = await params;
      const deleted = await deleteConversation(ctx.tenant, id);
      if (!deleted) {
        return NextResponse.json({ error: { code: "NOT_FOUND", message: "Conversation not found" } }, { status: 404 });
      }
      return NextResponse.json({ ok: true });
    } catch (error) {
      return handleRouteError(error);
    }
  });
}
