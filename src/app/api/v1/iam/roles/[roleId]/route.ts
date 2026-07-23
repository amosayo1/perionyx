import { NextResponse } from "next/server";
import { auth } from "@/server/auth/auth";
import { requireTenantContext } from "@/server/context/tenant-context";
import { handleRouteError, parseJsonBody } from "@/server/http/handle-route";
import { iamAdminService } from "@/server/iam/admin";
import { z } from "zod";
import { rbacService } from "@/modules/rbac/rbac.service";

const updateRoleSchema = z.object({
  name: z.string().min(1).max(100).optional(),
  description: z.string().max(500).optional(),
});

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ roleId: string }> },
) {
  try {
    const session = await auth();
    const ctx = requireTenantContext(
      session?.user?.id,
      session?.user?.activeCompanyId,
      session?.user?.companyRole,
    );
    await rbacService.ensurePermission(ctx.userId, ctx.companyId, 'admin.roles');

    const { roleId } = await params;
    const role = await iamAdminService.getRole(roleId, ctx.companyId);
    return NextResponse.json({ role });
  } catch (error) {
    return handleRouteError(error);
  }
}

export async function PUT(
  request: Request,
  { params }: { params: Promise<{ roleId: string }> },
) {
  try {
    const session = await auth();
    const ctx = requireTenantContext(
      session?.user?.id,
      session?.user?.activeCompanyId,
      session?.user?.companyRole,
    );

    const { roleId } = await params;
    const body = await parseJsonBody<z.infer<typeof updateRoleSchema>>(request);
    const parsed = updateRoleSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json(
        { error: { code: "VALIDATION", message: parsed.error.issues.map((i) => i.message).join("; ") } },
        { status: 400 },
      );
    }

    const role = await iamAdminService.updateRole(roleId, ctx.companyId, parsed.data);
    return NextResponse.json({ role });
  } catch (error) {
    return handleRouteError(error);
  }
}

export async function DELETE(
  _request: Request,
  { params }: { params: Promise<{ roleId: string }> },
) {
  try {
    const session = await auth();
    const ctx = requireTenantContext(
      session?.user?.id,
      session?.user?.activeCompanyId,
      session?.user?.companyRole,
    );

    const { roleId } = await params;
    await iamAdminService.deleteRole(roleId, ctx.companyId);
    return NextResponse.json({ success: true });
  } catch (error) {
    return handleRouteError(error);
  }
}
