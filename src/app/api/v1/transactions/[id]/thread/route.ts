import { z } from "zod";
import { NextResponse } from "next/server";
import { handleRouteError } from "@/server/http/handle-route";
import { ApprovalThreadService } from "@/modules/approval-thread";
import { rbacService } from "@/modules/rbac/rbac.service";
import { withRuntimeContext } from "@/server/http/init-runtime-context";

const ThreadCommentSchema = z.object({
  text: z.string().min(1, "Comment text is required").max(4096),
});

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  return withRuntimeContext(_request, async (ctx) => {
    try {
      await rbacService.ensurePermission(ctx.tenant.userId, ctx.tenant.companyId, 'treasury.read');
      const { id } = await params;
      const thread = await ApprovalThreadService.getThread(ctx.tenant, id);
      return NextResponse.json({ thread });
    } catch (error) {
      return handleRouteError(error);
    }
  });
}

export async function POST(
  request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  return withRuntimeContext(request, async (ctx) => {
    try {
      const { id } = await params;
      const rawBody = await request.json();
      const parsed = ThreadCommentSchema.safeParse(rawBody);
      if (!parsed.success) {
        return NextResponse.json({ error: { code: "VALIDATION", message: parsed.error.issues[0].message } }, { status: 400 });
      }
      const { text } = parsed.data;
      const comment = await ApprovalThreadService.addComment(ctx.tenant, id, text.trim());
      return NextResponse.json({ comment });
    } catch (error) {
      return handleRouteError(error);
    }
  });
}
