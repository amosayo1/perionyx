import { NextResponse } from "next/server";
import { CFOAdvisorService } from "@/modules/cfo-advisor/cfo-advisor.service";
import { createConversationSchema } from "@/lib/validations/cfo-advisor";
import { handleRouteError, zodErrorResponse, parseJsonBody } from "@/server/http/handle-route";
import { rbacService } from "@/modules/rbac/rbac.service";
import { withRuntimeContext } from "@/server/http/init-runtime-context";

export async function GET(req: Request) {
  return withRuntimeContext(req, async (ctx) => {
    try {
      await rbacService.ensurePermission(ctx.tenant.userId, ctx.tenant.companyId, "cfo_advisor.read");
  
      const conversations = await CFOAdvisorService.getConversations(ctx.tenant, ctx.tenant.userId);
      return NextResponse.json(conversations);
    } catch (err) {
      return handleRouteError(err, req);
    }
  });
}

export async function POST(req: Request) {
  return withRuntimeContext(req, async (ctx) => {
    try {
      await rbacService.ensurePermission(ctx.tenant.userId, ctx.tenant.companyId, "cfo_advisor.manage");
  
      const body = await parseJsonBody<unknown>(req);
      const parsed = createConversationSchema.safeParse(body);
      if (!parsed.success) return zodErrorResponse(parsed.error, req);
  
      const conversation = await CFOAdvisorService.createConversation(ctx.tenant, ctx.tenant.userId, parsed.data.title ?? "New Conversation");
      return NextResponse.json(conversation, { status: 201 });
    } catch (err) {
      return handleRouteError(err, req);
    }
  });
}
