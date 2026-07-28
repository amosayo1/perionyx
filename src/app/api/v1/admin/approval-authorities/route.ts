import { z } from 'zod';
import { NextResponse } from 'next/server';
import { Prisma } from '@prisma/client';
import { ApprovalAuthorityService } from '@/modules/rbac/approval-authority.service';
import { rbacService, RBACService } from '@/modules/rbac/rbac.service';
import { handleRouteError } from '@/server/http/handle-route';
import { withRuntimeContext } from "@/server/http/init-runtime-context";

const CreateAuthoritySchema = z.object({
  roleId: z.string().min(1, "roleId is required").max(128),
  name: z.string().min(1, "name is required").max(256),
  description: z.string().max(1024).optional(),
  scopeType: z.enum(["GLOBAL", "WALLET", "TRANSACTION_TYPE"]).optional().default("GLOBAL"),
  scopeId: z.string().max(128).optional(),
  minAmount: z.number().nonnegative().optional(),
  maxAmount: z.number().nonnegative().optional(),
  requiresDualApproval: z.boolean().optional(),
  enabled: z.boolean().optional().default(true),
});

export async function GET(request: Request) {
  return withRuntimeContext(request, async (ctx) => {
    try {
  
      await rbacService.ensurePermission(ctx.tenant.userId, ctx.tenant.companyId, 'admin.manage_authorities');
  
      const authorities = await ApprovalAuthorityService.getAuthoritiesForCompany(ctx.tenant.companyId);
      return NextResponse.json({ success: true, authorities });
    } catch (err) {
      return handleRouteError(err);
    }
  });
}

export async function POST(request: Request) {
  return withRuntimeContext(request, async (ctx) => {
    try {
  
      await rbacService.ensurePermission(ctx.tenant.userId, ctx.tenant.companyId, 'admin.manage_authorities');
  
      const rawBody = await request.json();
      const parsed = CreateAuthoritySchema.safeParse(rawBody);
      if (!parsed.success) {
        return NextResponse.json({ error: { code: "VALIDATION", message: parsed.error.issues[0].message } }, { status: 400 });
      }
      const body = parsed.data;
      const authority = await ApprovalAuthorityService.assignApproverRole({
        companyId: ctx.tenant.companyId,
        roleId: body.roleId,
        name: body.name,
        description: body.description,
        scopeType: body.scopeType,
        scopeId: body.scopeId,
        minAmount: body.minAmount != null ? new Prisma.Decimal(body.minAmount) : undefined,
        maxAmount: body.maxAmount != null ? new Prisma.Decimal(body.maxAmount) : undefined,
        requiresDualApproval: body.requiresDualApproval,
        enabled: body.enabled,
      });
  
      return NextResponse.json({ success: true, authority });
    } catch (err) {
      return handleRouteError(err);
    }
  });
}

