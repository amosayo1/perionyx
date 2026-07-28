import { NextResponse } from "next/server";
import { z } from "zod";
import { handleRouteError, parseJsonBody, zodErrorResponse } from "@/server/http/handle-route";
import { NotFoundError } from "@/lib/errors/app-error";
import { prisma } from "@/server/db/prisma";
import { rbacService } from "@/modules/rbac/rbac.service";
import { withRuntimeContext } from "@/server/http/init-runtime-context";

type RouteContext = { params: Promise<{ accountId: string }> };

const updateTreasuryAccountBodySchema = z.object({
  name: z.string().min(1).max(255).optional(),
  description: z.string().nullable().optional(),
  accountNumber: z.string().nullable().optional(),
  isActive: z.boolean().optional(),
});

export async function GET(_request: Request, context: RouteContext) {
  return withRuntimeContext(_request, async (ctx) => {
    try {
      await rbacService.ensurePermission(ctx.tenant.userId, ctx.tenant.companyId, 'treasury.read');
      const { accountId } = await context.params;
      const account = await prisma.treasuryAccount.findFirst({
        where: { id: accountId, companyId: ctx.tenant.companyId },
        include: { controls: true },
      });
      if (!account) {
        throw new NotFoundError("Treasury account");
      }
      return NextResponse.json(account);
    } catch (error) {
      return handleRouteError(error);
    }
  });
}

export async function PATCH(request: Request, context: RouteContext) {
  return withRuntimeContext(request, async (ctx) => {
    try {
      const { accountId } = await context.params;
      const raw = await parseJsonBody<unknown>(request);
      const body = updateTreasuryAccountBodySchema.parse(raw);
      await prisma.treasuryAccount.updateMany({ where: { id: accountId, companyId: ctx.tenant.companyId }, data: body });
      const updated = await prisma.treasuryAccount.findFirst({
        where: { id: accountId, companyId: ctx.tenant.companyId },
        include: { controls: true },
      });
      if (!updated) {
        throw new NotFoundError("Treasury account");
      }
      return NextResponse.json(updated);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return zodErrorResponse(error);
      }
      return handleRouteError(error);
    }
  });
}

export async function DELETE(_request: Request, context: RouteContext) {
  return withRuntimeContext(_request, async (ctx) => {
    try {
      const { accountId } = await context.params;
      await prisma.treasuryAccount.deleteMany({ where: { id: accountId, companyId: ctx.tenant.companyId } });
      return NextResponse.json({ success: true });
    } catch (error) {
      return handleRouteError(error);
    }
  });
}
