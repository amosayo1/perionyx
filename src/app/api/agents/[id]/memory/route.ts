import { NextResponse } from "next/server";
import { AgentMemory } from "@/modules/agent-framework";
import { rbacService } from "@/modules/rbac/rbac.service";
import { handleRouteError, zodErrorResponse, parseJsonBody, cacheHeaders } from "@/server/http/handle-route";
import { createAgentMemorySchema } from "@/lib/validations/agent-framework";
import { withRuntimeContext } from "@/server/http/init-runtime-context";

export async function GET(
  req: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  return withRuntimeContext(req, async (ctx) => {
    try {
      const { id } = await params;
  
      const url = new URL(req.url);
      const memoryType = url.searchParams.get("memoryType") as
        | "short_term"
        | "long_term"
        | "user_preference"
        | "conversation"
        | "recommendation"
        | null;
      const category = url.searchParams.get("category");
      const text = url.searchParams.get("text");
  
      const memories = await AgentMemory.search(ctx.tenant, id, {
        ...(memoryType ? { memoryType } : {}),
        ...(category ? { category } : {}),
        ...(text ? { text } : {}),
      });
  
      return NextResponse.json({ memories }, { headers: cacheHeaders(15) });
    } catch (err) {
      return handleRouteError(err, req);
    }
  });
}

export async function POST(
  req: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  return withRuntimeContext(req, async (ctx) => {
    try {
      const { id } = await params;
      await rbacService.ensurePermission(ctx.tenant.userId, ctx.tenant.companyId, "agents.manage");
  
      const body = await parseJsonBody<unknown>(req);
      const parsed = createAgentMemorySchema.safeParse(body);
      if (!parsed.success) return zodErrorResponse(parsed.error, req);
  
      const memory = await AgentMemory.store(ctx.tenant, id, parsed.data);
      return NextResponse.json(memory, { status: 201 });
    } catch (err) {
      return handleRouteError(err, req);
    }
  });
}
