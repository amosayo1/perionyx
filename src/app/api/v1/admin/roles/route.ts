import { NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/server/db/prisma";
import { rbacService, RBACService } from "@/modules/rbac/rbac.service";
import { handleRouteError, parseJsonBody, zodErrorResponse } from "@/server/http/handle-route";
import { withRuntimeContext } from "@/server/http/init-runtime-context";

const createRoleSchema = z.object({
  name: z.string().min(1),
  description: z.string().optional(),
  permissions: z.array(z.string()).optional(),
});

export async function GET(request: Request) {
  return withRuntimeContext(request, async (ctx) => {
    try {
  
      await rbacService.ensurePermission(ctx.tenant.userId, String(ctx.tenant.companyId), "admin.manage_roles");
  
      const roles = await prisma.role.findMany({ where: { companyId: ctx.tenant.companyId }, include: { permissions: { include: { permission: true } } } });
      return NextResponse.json(roles);
    } catch (err) {
      if (err instanceof z.ZodError) return zodErrorResponse(err);
      return handleRouteError(err);
    }
  });
}

export async function POST(request: Request) {
  return withRuntimeContext(request, async (ctx) => {
    try {
  
      await rbacService.ensurePermission(ctx.tenant.userId, String(ctx.tenant.companyId), "admin.manage_roles");
  
      const raw = await parseJsonBody<unknown>(request);
      const input = createRoleSchema.parse(raw);
  
      const role = await rbacService.createRole(String(ctx.tenant.companyId), input.name, input.description);
      if (input.permissions && input.permissions.length) {
        for (const p of input.permissions) {
          await rbacService.addPermissionToRole(role.id, p);
        }
      }
  
      return NextResponse.json({ success: true, role });
    } catch (err) {
      if (err instanceof z.ZodError) return zodErrorResponse(err);
      return handleRouteError(err);
    }
  });
}
