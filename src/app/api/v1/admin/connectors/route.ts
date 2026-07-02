import { NextResponse } from 'next/server';
import { z } from 'zod';
import type { Prisma } from '@prisma/client';
import { auth } from '@/server/auth/auth';
import { requireTenantContext } from '@/server/context/tenant-context';
import { prisma } from '@/server/db/prisma';
import { rbacService, RBACService } from '@/modules/rbac/rbac.service';
import { handleRouteError, parseJsonBody, zodErrorResponse } from '@/server/http/handle-route';

const createSchema = z.object({ name: z.string().min(1), type: z.string().min(1), config: z.record(z.string(), z.any()).optional(), active: z.boolean().optional() });

export async function GET(request: Request) {
  try {
    const session = await auth();
    const ctx = requireTenantContext(session?.user?.id, session?.user?.activeCompanyId, session?.user?.companyRole);
    await rbacService.ensurePermission(session?.user?.id, String(ctx.companyId), 'connectors.manage');
    const configs = await prisma.connectorConfig.findMany({ where: { companyId: ctx.companyId } });
    return NextResponse.json(configs);
  } catch (err) {
    if (err instanceof z.ZodError) return zodErrorResponse(err);
    return handleRouteError(err);
  }
}

export async function POST(request: Request) {
  try {
    const session = await auth();
    const ctx = requireTenantContext(session?.user?.id, session?.user?.activeCompanyId, session?.user?.companyRole);
    await rbacService.ensurePermission(session?.user?.id, String(ctx.companyId), 'connectors.manage');
    const raw = await parseJsonBody<unknown>(request);
    const input = createSchema.parse(raw);
    const cfg = await prisma.connectorConfig.create({ data: { companyId: ctx.companyId, name: input.name, type: input.type, config: (input.config ?? {}) as Prisma.InputJsonValue, active: input.active ?? true } });
    return NextResponse.json({ success: true, cfg });
  } catch (err) {
    if (err instanceof z.ZodError) return zodErrorResponse(err);
    return handleRouteError(err);
  }
}
