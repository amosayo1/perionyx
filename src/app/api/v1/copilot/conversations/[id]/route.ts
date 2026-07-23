import { NextResponse } from "next/server";
import { auth } from "@/server/auth/auth";
import { requireTenantContext } from "@/server/context/tenant-context";
import { handleRouteError } from "@/server/http/handle-route";
import { getConversation, deleteConversation } from "@/modules/copilot/conversation.service";
import { rbacService } from "@/modules/rbac/rbac.service";

export async function GET(request: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const session = await auth();
    const ctx = requireTenantContext(session?.user?.id, session?.user?.activeCompanyId, session?.user?.companyRole);
    await rbacService.ensurePermission(ctx.userId, ctx.companyId, 'analytics.read');
    const conversation = await getConversation(ctx, id);
    if (!conversation) {
      return NextResponse.json({ error: { code: "NOT_FOUND", message: "Conversation not found" } }, { status: 404 });
    }
    return NextResponse.json(conversation);
  } catch (error) {
    return handleRouteError(error);
  }
}

export async function DELETE(request: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const session = await auth();
    const ctx = requireTenantContext(session?.user?.id, session?.user?.activeCompanyId, session?.user?.companyRole);
    const deleted = await deleteConversation(ctx, id);
    if (!deleted) {
      return NextResponse.json({ error: { code: "NOT_FOUND", message: "Conversation not found" } }, { status: 404 });
    }
    return NextResponse.json({ ok: true });
  } catch (error) {
    return handleRouteError(error);
  }
}
