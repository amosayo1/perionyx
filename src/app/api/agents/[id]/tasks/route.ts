import { NextResponse } from "next/server";
import { auth } from "@/server/auth/auth";
import { requireTenantContext } from "@/server/context/tenant-context";
import { AgentRuntime } from "@/modules/agent-framework";
import { rbacService } from "@/modules/rbac/rbac.service";
import { handleRouteError, zodErrorResponse, parseJsonBody, cacheHeaders } from "@/server/http/handle-route";
import {
  createAgentTaskSchema,
  agentTaskListQuerySchema,
} from "@/lib/validations/agent-framework";
import { prisma } from "@/server/db/prisma";

export async function GET(
  req: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const { id } = await params;
    const session = await auth();
    const ctx = requireTenantContext(session?.user?.id, session?.user?.activeCompanyId, session?.user?.companyRole);

    const url = new URL(req.url);
    const queryResult = agentTaskListQuerySchema.safeParse(
      Object.fromEntries(url.searchParams),
    );
    if (!queryResult.success) return zodErrorResponse(queryResult.error, req);

    const query = queryResult.data;
    const page = query.page ?? 1;
    const limit = Math.min(query.limit ?? 20, 100);
    const skip = (page - 1) * limit;

    const where = {
      companyId: ctx.companyId,
      agentId: id,
      ...(query.status ? { status: query.status } : {}),
      ...(query.taskType ? { taskType: query.taskType } : {}),
      ...(query.sessionId ? { sessionId: query.sessionId } : {}),
    };

    const [tasks, total] = await Promise.all([
      prisma.agentTask.findMany({
        where,
        orderBy: { createdAt: "desc" },
        skip,
        take: limit,
      }),
      prisma.agentTask.count({ where }),
    ]);

    return NextResponse.json(
      { tasks, total, page, limit },
      { headers: cacheHeaders(15) },
    );
  } catch (err) {
    return handleRouteError(err, req);
  }
}

export async function POST(
  req: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const { id } = await params;
    const session = await auth();
    const ctx = requireTenantContext(session?.user?.id, session?.user?.activeCompanyId, session?.user?.companyRole);
    await rbacService.ensurePermission(ctx.userId, ctx.companyId, "agents.manage");

    const body = await parseJsonBody<unknown>(req);
    const parsed = createAgentTaskSchema.safeParse(body);
    if (!parsed.success) return zodErrorResponse(parsed.error, req);

    const task = await AgentRuntime.createTask(ctx, id, {
      name: parsed.data.name,
      description: parsed.data.description,
      taskType: parsed.data.taskType,
      priority: parsed.data.priority,
      maxRetries: parsed.data.maxRetries,
      config: parsed.data.config as Record<string, unknown> | undefined,
      input: parsed.data.input as Record<string, unknown> | undefined,
    });

    return NextResponse.json(task, { status: 201 });
  } catch (err) {
    return handleRouteError(err, req);
  }
}
