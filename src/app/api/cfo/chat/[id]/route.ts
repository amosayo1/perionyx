import { NextResponse } from "next/server";
import { CFOAdvisorService } from "@/modules/cfo-advisor/cfo-advisor.service";
import { sendMessageSchema } from "@/lib/validations/cfo-advisor";
import { handleRouteError, zodErrorResponse, parseJsonBody } from "@/server/http/handle-route";
import { rbacService } from "@/modules/rbac/rbac.service";
import { withRuntimeContext } from "@/server/http/init-runtime-context";

export async function GET(req: Request, { params }: { params: Promise<{ id: string }> }) {
  return withRuntimeContext(req, async (ctx) => {
    try {
      const { id } = await params;
      await rbacService.ensurePermission(ctx.tenant.userId, ctx.tenant.companyId, "cfo_advisor.read");
  
      const messages = await CFOAdvisorService.getConversationMessages(ctx.tenant, id);
      return NextResponse.json(messages);
    } catch (err) {
      return handleRouteError(err, req);
    }
  });
}

export async function POST(req: Request, { params }: { params: Promise<{ id: string }> }) {
  return withRuntimeContext(req, async (ctx) => {
    try {
      const { id } = await params;
      await rbacService.ensurePermission(ctx.tenant.userId, ctx.tenant.companyId, "cfo_advisor.manage");
  
      const body = await parseJsonBody<unknown>(req);
      const parsed = sendMessageSchema.safeParse(body);
      if (!parsed.success) return zodErrorResponse(parsed.error, req);
  
      const messages = await CFOAdvisorService.sendMessage(ctx.tenant, id, parsed.data.content);
      return NextResponse.json(messages, { status: 201 });
    } catch (err) {
      return handleRouteError(err, req);
    }
  });
}
