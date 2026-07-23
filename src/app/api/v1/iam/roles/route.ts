import { NextResponse } from "next/server";
import { auth } from "@/server/auth/auth";
import { requireTenantContext } from "@/server/context/tenant-context";
import { handleRouteError, parseJsonBody, cacheHeaders } from "@/server/http/handle-route";
import { iamAdminService } from "@/server/iam/admin";
import { PermissionRegistry } from "@/server/iam/permissions";
import { EnterpriseRoles } from "@/server/iam/roles";
import { z } from "zod";
import { rbacService } from "@/modules/rbac/rbac.service";

const createRoleSchema = z.object({
  name: z.string().min(1).max(100),
  description: z.string().max(500).optional(),
  permissions: z.array(z.string()).optional(),
});

export async function GET() {
  try {
    const session = await auth();
    const ctx = requireTenantContext(
      session?.user?.id,
      session?.user?.activeCompanyId,
      session?.user?.companyRole,
    );
    await rbacService.ensurePermission(ctx.userId, ctx.companyId, 'admin.roles');

    const roles = await iamAdminService.listRoles(ctx.companyId, { limit: 100 });
    const enterpriseRoles = EnterpriseRoles.getAll();

    return NextResponse.json({
      roles,
      enterpriseRoleDefinitions: enterpriseRoles,
      permissionCategories: PermissionRegistry.getCategories(),
      allPermissions: PermissionRegistry.getAll(),
    }, { headers: cacheHeaders(30) });
  } catch (error) {
    return handleRouteError(error);
  }
}

export async function POST(request: Request) {
  try {
    const session = await auth();
    const ctx = requireTenantContext(
      session?.user?.id,
      session?.user?.activeCompanyId,
      session?.user?.companyRole,
    );

    const body = await parseJsonBody<z.infer<typeof createRoleSchema>>(request);
    const parsed = createRoleSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json(
        { error: { code: "VALIDATION", message: parsed.error.issues.map((i) => i.message).join("; ") } },
        { status: 400 },
      );
    }

    const role = await iamAdminService.createRole(ctx.companyId, parsed.data);
    return NextResponse.json({ role }, { status: 201 });
  } catch (error) {
    return handleRouteError(error);
  }
}
