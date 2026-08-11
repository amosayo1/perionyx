import { NextResponse } from 'next/server';
import { z } from 'zod';
import type { Prisma } from '@prisma/client';
import { prisma } from '@/server/db/prisma';
import { rbacService, RBACService } from '@/modules/rbac/rbac.service';
import { handleRouteError, parseJsonBody, zodErrorResponse } from '@/server/http/handle-route';
import { withRuntimeContext } from "@/server/http/init-runtime-context";

const createSchema = z.object({ name: z.string().min(1), type: z.string().min(1), config: z.record(z.string(), z.any()).optional(), active: z.boolean().optional() });

export async function GET(request: Request) {
  return withRuntimeContext(request, async (ctx) => {
    try {
      await rbacService.ensurePermission(ctx.tenant.userId, String(ctx.tenant.companyId), 'connectors.manage');
      const { searchParams } = new URL(request.url);
      const take = Math.min(Math.max(Number(searchParams.get("take") ?? 200) || 200, 1), 500);
      const skip = Math.max(Number(searchParams.get("skip") ?? 0) || 0, 0);
      const configs = await prisma.connectorConfig.findMany({ where: { companyId: ctx.tenant.companyId }, take, skip, orderBy: { createdAt: "asc" } });
      return NextResponse.json(configs);
    } catch (err) {
      if (err instanceof z.ZodError) return zodErrorResponse(err);
      return handleRouteError(err);
    }
  });
}

export async function POST(request: Request) {
  return withRuntimeContext(request, async (ctx) => {
    try {
      await rbacService.ensurePermission(ctx.tenant.userId, String(ctx.tenant.companyId), 'connectors.manage');
      const raw = await parseJsonBody<unknown>(request);
      const input = createSchema.parse(raw);
      const cfg = await prisma.connectorConfig.create({ data: { companyId: ctx.tenant.companyId, name: input.name, type: input.type, config: (input.config ?? {}) as Prisma.InputJsonValue, active: input.active ?? true } });
      return NextResponse.json({ success: true, cfg });
    } catch (err) {
      if (err instanceof z.ZodError) return zodErrorResponse(err);
      return handleRouteError(err);
    }
  });
}
