import { NextResponse } from 'next/server';
import { Prisma } from '@prisma/client';
import { auth } from '@/server/auth/auth';
import { requireTenantContext } from '@/server/context/tenant-context';
import { ApprovalAuthorityService } from '@/modules/rbac/approval-authority.service';
import { rbacService, RBACService } from '@/modules/rbac/rbac.service';
import { handleRouteError } from '@/server/http/handle-route';

export async function GET(request: Request) {
  try {
    const session = await auth();
    const ctx = requireTenantContext(session?.user?.id, session?.user?.activeCompanyId, session?.user?.companyRole);

    await rbacService.ensurePermission(ctx.userId, ctx.companyId, 'admin.manage_authorities');

    const authorities = await ApprovalAuthorityService.getAuthoritiesForCompany(ctx.companyId);
    return NextResponse.json({ success: true, authorities });
  } catch (err) {
    return handleRouteError(err);
  }
}

export async function POST(request: Request) {
  try {
    const session = await auth();
    const ctx = requireTenantContext(session?.user?.id, session?.user?.activeCompanyId, session?.user?.companyRole);

    await rbacService.ensurePermission(ctx.userId, ctx.companyId, 'admin.manage_authorities');

    const body = await request.json();
    const authority = await ApprovalAuthorityService.assignApproverRole({
      companyId: ctx.companyId,
      roleId: body.roleId,
      name: body.name,
      description: body.description,
      scopeType: body.scopeType || 'GLOBAL',
      scopeId: body.scopeId,
      minAmount: body.minAmount ? new Prisma.Decimal(body.minAmount) : undefined,
      maxAmount: body.maxAmount ? new Prisma.Decimal(body.maxAmount) : undefined,
      requiresDualApproval: body.requiresDualApproval,
      enabled: body.enabled ?? true,
    });

    return NextResponse.json({ success: true, authority });
  } catch (err) {
    return handleRouteError(err);
  }
}

